import { v } from "convex/values"
import { query } from "./_generated/server"

/**
 * Query to get just the lobby without chat/selection
 * Use this for components that don't need real-time chat/selection updates
 */
export const getLobby = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    return await ctx.db.get(lobbyId)
  },
})

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
      .take(limit)

    return chatMessages.reverse().map((msg) => ({
      pseudo: msg.pseudo,
      message: msg.message,
    }))
  },
})

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
      .first()

    return selection?.selectionId
  },
})




