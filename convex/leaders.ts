import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leaders").collect();
  },
});

export const banLeader = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    leaderId: v.id("leaders"),
    teamNumber: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, { lobbyId, leaderId, teamNumber }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    const team1BannedLeaders =
      teamNumber === 1
        ? [...lobby.team1.bannedLeaders, leaderId]
        : lobby.team1.bannedLeaders;
    const team2BannedLeaders =
      teamNumber === 2
        ? [...lobby.team2.bannedLeaders, leaderId]
        : lobby.team2.bannedLeaders;

    const isLastPick =
      lobby.team1.selectedLeaders.length +
        lobby.team2.selectedLeaders.length ===
      lobby.numberOfPicksFirstRotation + lobby.numberOfPicksSecondRotation;

    await ctx.db.patch(lobbyId, {
      team1: {
        ...lobby.team1,
        bannedLeaders: team1BannedLeaders,
      },
      team2: {
        ...lobby.team2,
        bannedLeaders: team2BannedLeaders,
      },
      draftStatus: getNextDraftStatus(
        lobby.draftStatus,
        lobby.numberOfBansFirstRotation,
        lobby.numberOfBansSecondRotation,
        lobby.numberOfPicksFirstRotation,
      ),
      status: isLastPick ? "COMPLETED" : "LEADER_SELECTION",
    });
  },
});

const getNextDraftStatus = (
  currentStatus: { type: "PICK" | "BAN" | "MAPBAN"; index: number },
  numberOfBansFirstRotation: number,
  numberOfBansSecondRotation: number,
  numberOfPicksFirstRotation: number,
): { type: "PICK" | "BAN" | "MAPBAN"; index: number } => {
  const isLastFirstRotaBan =
    currentStatus.type === "BAN" &&
    currentStatus.index + 1 === numberOfBansFirstRotation;
  const isLastSecondRotaBan =
    currentStatus.type === "BAN" &&
    currentStatus.index + 1 ===
      numberOfBansSecondRotation + numberOfBansFirstRotation;
  const isLastFirstRotaPick =
    currentStatus.type === "PICK" &&
    currentStatus.index + 1 === numberOfPicksFirstRotation;
  if (isLastFirstRotaBan) {
    return { type: "PICK", index: 1 };
  }
  if (isLastSecondRotaBan) {
    return { type: "PICK", index: numberOfPicksFirstRotation + 1 };
  }
  if (isLastFirstRotaPick) {
    return { type: "BAN", index: numberOfBansFirstRotation + 1 };
  }
  return { type: currentStatus.type, index: currentStatus.index + 1 };
};
