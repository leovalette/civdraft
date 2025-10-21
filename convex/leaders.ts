import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

const LEADER_BAN_TIMEOUT_MS = 60 * 1000; // 1 minute
const DEFAULT_AUTO_BAN_LEADER_ID_DEV = "jd7envq8gzesxynzex5pjvcx0d7s2x2a";
const DEFAULT_AUTO_BAN_LEADER_ID_PROD = "j57fjx93m411nayke84bp9e4pd7spskp";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leaders").collect();
  },
});

export const pickBanLeader = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    leaderId: v.id("leaders"),
    teamNumber: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, { lobbyId, leaderId, teamNumber }) => {
    await performLeaderPickBan(ctx, lobbyId, leaderId, teamNumber);
  },
});

async function performLeaderPickBan(
  ctx: any,
  lobbyId: string,
  leaderId: string,
  teamNumber: 1 | 2,
) {
  const lobby = await ctx.db.get(lobbyId);
  if (!lobby) {
    throw new Error("Lobby not found");
  }

  if (lobby.status !== "LEADER_SELECTION") {
    return;
  }
  if (
    lobby.team1.bannedLeaders.includes(leaderId) ||
    lobby.team2.bannedLeaders.includes(leaderId) ||
    lobby.team1.selectedLeaders.includes(leaderId) ||
    lobby.team2.selectedLeaders.includes(leaderId)
  ) {
    throw new Error("Leader already banned");
  }

  const team1BannedLeaders =
    lobby.draftStatus.type === "BAN" && teamNumber === 1
      ? [...lobby.team1.bannedLeaders, leaderId]
      : lobby.team1.bannedLeaders;
  const team2BannedLeaders =
    lobby.draftStatus.type === "BAN" && teamNumber === 2
      ? [...lobby.team2.bannedLeaders, leaderId]
      : lobby.team2.bannedLeaders;

  const team1SelectedLeaders =
    lobby.draftStatus.type === "PICK" && teamNumber === 1
      ? [...lobby.team1.selectedLeaders, leaderId]
      : lobby.team1.selectedLeaders;
  const team2SelectedLeaders =
    lobby.draftStatus.type === "PICK" && teamNumber === 2
      ? [...lobby.team2.selectedLeaders, leaderId]
      : lobby.team2.selectedLeaders;

  const isLastPick =
    team1SelectedLeaders.length + team2SelectedLeaders.length ===
    lobby.numberOfPicksFirstRotation + lobby.numberOfPicksSecondRotation;

  const nextDraftStatus = getNextDraftStatus(
    lobby.draftStatus,
    lobby.numberOfBansFirstRotation,
    lobby.numberOfBansSecondRotation,
    lobby.numberOfPicksFirstRotation,
  );

  const now = Date.now();
  await ctx.db.patch(lobbyId, {
    team1: {
      ...lobby.team1,
      bannedLeaders: team1BannedLeaders,
      selectedLeaders: team1SelectedLeaders,
    },
    team2: {
      ...lobby.team2,
      bannedLeaders: team2BannedLeaders,
      selectedLeaders: team2SelectedLeaders,
    },
    draftStatus: nextDraftStatus,
    status: isLastPick ? "COMPLETED" : "LEADER_SELECTION",
    leaderBanTimestamp: now,
    currentSelectionId: undefined,
    currentTeamTurn: getCurrentTeamTurn(
      nextDraftStatus,
      lobby.numberOfBansFirstRotation,
    ),
  });

  // If not the last pick, schedule the next timeout check
  if (!isLastPick) {
    await ctx.scheduler.runAfter(
      LEADER_BAN_TIMEOUT_MS,
      internal.leaders.checkLeaderBanTimeout,
      {
        lobbyId,
        timestampAtStart: now,
      },
    );
  }
}

const getNextDraftStatus = (
  currentStatus: { type: "PICK" | "BAN" | "MAPBAN"; index: number },
  numberOfBansFirstRotation: number,
  numberOfBansSecondRotation: number,
  numberOfPicksFirstRotation: number,
): { type: "PICK" | "BAN" | "MAPBAN"; index: number } => {
  const isLastFirstRotaBan =
    currentStatus.type === "BAN" &&
    currentStatus.index === numberOfBansFirstRotation;
  const isLastSecondRotaBan =
    currentStatus.type === "BAN" &&
    currentStatus.index ===
      numberOfBansSecondRotation + numberOfBansFirstRotation;
  const isLastFirstRotaPick =
    currentStatus.type === "PICK" &&
    currentStatus.index === numberOfPicksFirstRotation;
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

export const checkLeaderBanTimeout = internalMutation({
  args: {
    lobbyId: v.id("lobbies"),
    timestampAtStart: v.number(),
  },
  handler: async (ctx, { lobbyId, timestampAtStart }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      return; // Lobby was deleted
    }

    // Check if the lobby is still in LEADER_SELECTION and the timestamp hasn't changed
    // (meaning no ban was made since this timer was scheduled)
    if (
      lobby.status !== "LEADER_SELECTION" ||
      lobby.leaderBanTimestamp === undefined ||
      lobby.leaderBanTimestamp !== timestampAtStart
    ) {
      return; // A ban was made or status changed, do nothing
    }

    // Auto-ban the default leader
    await performLeaderPickBan(
      ctx,
      lobbyId,
      DEFAULT_AUTO_BAN_LEADER_ID_PROD,
      getCurrentTeamTurn(lobby.draftStatus, lobby.numberOfBansFirstRotation),
    );
  },
});

// Helper function to determine which team's turn it is
const getCurrentTeamTurn = (
  draftStatus: {
    type: "PICK" | "BAN" | "MAPBAN";
    index: number;
  },
  numberOfBansFirstRotation: number,
): 1 | 2 => {
  if (draftStatus.type === "PICK") {
    return [1, 4, 6, 7].includes(draftStatus.index) ? 1 : 2;
  }

  if (draftStatus.type === "BAN") {
    if (draftStatus.index > numberOfBansFirstRotation) {
      return draftStatus.index % 2 === 1 ? 2 : 1;
    }
  }
  return draftStatus.index % 2 === 1 ? 1 : 2;
};
