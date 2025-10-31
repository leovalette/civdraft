import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    // Verify lobby exists
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Get from separate table
    const selection = await ctx.db
      .query("current_selections")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .first();

    return selection?.selectionId;
  },
});

export const set = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    selectionId: v.string(),
  },
  handler: async (ctx, { lobbyId, selectionId }) => {
    // Verify lobby exists
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Check if selection exists
    const existing = await ctx.db
      .query("current_selections")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        selectionId,
        updatedAt: Date.now(),
      });
    } else {
      // Create new
      await ctx.db.insert("current_selections", {
        lobbyId,
        selectionId,
        updatedAt: Date.now(),
      });
    }
  },
});

export const clear = mutation({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    // Verify lobby exists
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Delete from separate table
    const existing = await ctx.db
      .query("current_selections")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
