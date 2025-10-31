import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    lobbyId: v.id("lobbies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { lobbyId, limit = 50 }) => {
    // Verify lobby exists
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      return [];
    }

    // Fetch messages from separate table with pagination
    const messages = await ctx.db
      .query("chat_messages")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .order("desc")
      .take(limit);

    // Return in chronological order (oldest first)
    return messages.reverse().map(msg => ({
      pseudo: msg.pseudo,
      message: msg.message,
    }));
  },
});

export const post = mutation({
  args: { lobbyId: v.id("lobbies"), pseudo: v.string(), message: v.string() },
  handler: async (ctx, { lobbyId, message, pseudo }) => {
    // Verify lobby exists
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    // Insert into separate chat_messages table
    await ctx.db.insert("chat_messages", {
      lobbyId,
      pseudo,
      message,
      createdAt: Date.now(),
    });
  },
});
