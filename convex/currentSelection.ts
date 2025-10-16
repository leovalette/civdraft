import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    return lobby.currentSelectionId;
  },
});

export const set = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    selectionId: v.union(v.id("maps"), v.id("leaders")),
  },
  handler: async (ctx, { lobbyId, selectionId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    await ctx.db.patch(lobbyId, { currentSelectionId: selectionId });
  },
});

export const clear = mutation({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }
    await ctx.db.patch(lobbyId, { currentSelectionId: undefined });
  },
});
