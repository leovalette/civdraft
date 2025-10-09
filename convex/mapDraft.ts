import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const banMap = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    mapId: v.id("maps"),
  },
  handler: async (ctx, { lobbyId, mapId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    if (!lobby.mapIds.includes(mapId)) {
      throw new Error("Map not in the list of available maps");
    }
    await ctx.db.patch(lobbyId, {
      bannedMapIds: [...lobby.bannedMapIds, mapId],
    });
  },
});
