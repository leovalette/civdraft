import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Query to get just the lobby without chat/selection
 * Use this for components that don't need real-time chat/selection updates
 */
export const getLobby = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    return await ctx.db.get(lobbyId);
  },
});

/**
 * Query to get just the chat messages
 * Use this separately to avoid re-rendering when lobby state changes
 */
export const getChat = query({
  args: {
    lobbyId: v.id("lobbies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { lobbyId, limit = 50 }) => {
    const chatMessages = await ctx.db
      .query("chat_messages")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .order("desc")
      .take(limit);

    return chatMessages.reverse().map((msg) => ({
      pseudo: msg.pseudo,
      message: msg.message,
    }));
  },
});

/**
 * Query to get just the current selection
 * Use this separately to avoid re-rendering when lobby/chat changes
 */
export const getCurrentSelection = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    const selection = await ctx.db
      .query("current_selections")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .first();

    return selection?.selectionId;
  },
});

/**
 * Optimized combined query that returns all lobby data in a single request
 * This reduces network round trips and improves performance
 * NOTE: Only use this if you truly need all 3 pieces of data and they change together
 */
export const getLobbyData = query({
  args: {
    lobbyId: v.id("lobbies"),
    chatLimit: v.optional(v.number()),
  },
  handler: async (ctx, { lobbyId, chatLimit = 50 }) => {
    // Single lobby fetch
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      return null;
    }

    // Fetch chat messages
    const chatMessages = await ctx.db
      .query("chat_messages")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .order("desc")
      .take(chatLimit);

    // Fetch current selection
    const selection = await ctx.db
      .query("current_selections")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .first();

    return {
      lobby,
      chat: chatMessages.reverse().map((msg) => ({
        pseudo: msg.pseudo,
        message: msg.message,
      })),
      currentSelection: selection?.selectionId,
    };
  },
});

/**
 * Query to list active lobbies (for lobby browser/admin)
 */
export const listActiveLobbies = query({
  args: {
    includeCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, { includeCompleted = false }) => {
    if (includeCompleted) {
      return await ctx.db
        .query("lobbies")
        .withIndex("by_status_createdAt")
        .order("desc")
        .collect();
    }

    // Only active lobbies
    const lobbies = await ctx.db
      .query("lobbies")
      .withIndex("by_status")
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "LOBBY"),
          q.eq(q.field("status"), "MAP_SELECTION"),
          q.eq(q.field("status"), "LEADER_SELECTION"),
        ),
      )
      .collect();

    return lobbies;
  },
});
