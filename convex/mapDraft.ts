import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation } from "./_generated/server";

const MAP_BAN_TIMEOUT_MS = 60 * 1000; // 1 minute
const DEFAULT_AUTO_BAN_MAP_ID = "jn7fecgcrpsn97x05hw81rk8z97sjwtw";

export const startMapDraft = mutation({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    const now = Date.now();
    await ctx.db.patch(lobbyId, {
      status: "MAP_SELECTION",
      currentTeamTurn: 1,
      mapBanTimestamp: now,
    });

    // Schedule a timer check for auto-ban
    await ctx.scheduler.runAfter(
      MAP_BAN_TIMEOUT_MS,
      internal.mapDraft.checkMapBanTimeout,
      {
        lobbyId,
        timestampAtStart: now,
      },
    );
  },
});

export const banMap = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    mapId: v.id("maps"),
    teamNumber: v.union(v.literal(1), v.literal(2)),
  },
  handler: async (ctx, { lobbyId, mapId, teamNumber }) => {
    await performMapBan(ctx, lobbyId, mapId, teamNumber);
  },
});

async function performMapBan(
  ctx: any,
  lobbyId: string,
  mapId: string,
  teamNumber: 1 | 2,
) {
  const lobby = await ctx.db.get(lobbyId);
  if (!lobby) {
    throw new Error("Lobby not found");
  }
  if (lobby.status !== "MAP_SELECTION") {
    return;
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

  const isLastban = totalBannedCount === lobby.mapIds.length - 1;

  const selectedMapId = isLastban
    ? lobby.mapIds.filter(
        (id: string) => !lobby.bannedMapIds.includes(id) && id !== mapId,
      )[0]
    : undefined;

  const now = Date.now();
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
    status: isLastban ? "LEADER_SELECTION" : "MAP_SELECTION",
    draftStatus: isLastban
      ? { type: "BAN", index: 1 }
      : {
          type: "MAPBAN",
          index: lobby.draftStatus.index + 1,
        },
    mapBanTimestamp: now,
    selectedMapId,
  });

  // If not the last ban, schedule the next timeout check
  if (!isLastban) {
    await ctx.scheduler.runAfter(
      MAP_BAN_TIMEOUT_MS,
      internal.mapDraft.checkMapBanTimeout,
      {
        lobbyId,
        timestampAtStart: now,
      },
    );
  }
}

export const checkMapBanTimeout = internalMutation({
  args: {
    lobbyId: v.id("lobbies"),
    timestampAtStart: v.number(),
  },
  handler: async (ctx, { lobbyId, timestampAtStart }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      return; // Lobby was deleted
    }

    // Check if the lobby is still in MAP_SELECTION and the timestamp hasn't changed
    // (meaning no ban was made since this timer was scheduled)
    if (
      lobby.status !== "MAP_SELECTION" ||
      lobby.mapBanTimestamp === undefined ||
      lobby.mapBanTimestamp !== timestampAtStart
    ) {
      return; // A ban was made or status changed, do nothing
    }

    // Auto-ban the default map
    await performMapBan(
      ctx,
      lobbyId,
      DEFAULT_AUTO_BAN_MAP_ID,
      lobby.currentTeamTurn || 1,
    );
  },
});
