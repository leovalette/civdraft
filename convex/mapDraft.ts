import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const startMapDraft = mutation({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    await ctx.db.patch(lobbyId, {
      status: "MAP_SELECTION",
      currentTeamTurn: 1,
    });
  },
});

export const banMap = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    mapId: v.id("maps"),
    teamNumber: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, { lobbyId, mapId, teamNumber }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    if (!lobby.mapIds.includes(mapId)) {
      throw new Error("Map not in the list of available maps");
    }
    if (lobby.bannedMapIds.includes(mapId)) {
      throw new Error("Map already banned");
    }

    const team1BannedMaps =
      teamNumber === 1
        ? [...lobby.team1.bannedMaps, mapId]
        : lobby.team1.bannedMaps;
    const team2BannedMaps =
      teamNumber === 2
        ? [...lobby.team2.bannedMaps, mapId]
        : lobby.team2.bannedMaps;

    const totalBannedCount = team1BannedMaps.length + team2BannedMaps.length;
    const nextTeam = totalBannedCount % 2 === 0 ? 1 : 2;

    await ctx.db.patch(lobbyId, {
      bannedMapIds: [...lobby.bannedMapIds, mapId],
      team1: {
        ...lobby.team1,
        bannedMaps: team1BannedMaps,
      },
      team2: {
        ...lobby.team2,
        bannedMaps: team2BannedMaps,
      },
      currentTeamTurn: nextTeam,
      draftStatus: {
        type: "MAPBAN",
        index: lobby.draftStatus.index + 1,
      },
    });
  },
});
