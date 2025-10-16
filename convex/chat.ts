import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    const lobby = await ctx.db.get(lobbyId);
    return lobby?.chatMessages ?? [];
  },
});

export const post = mutation({
  args: { lobbyId: v.id("lobbies"), pseudo: v.string(), message: v.string() },
  handler: async (ctx, { lobbyId, message, pseudo }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby) {
      throw new Error("Lobby not found");
    }

    await ctx.db.patch(lobbyId, {
      chatMessages: [
        ...lobby.chatMessages,
        {
          pseudo,
          message,
        },
      ],
    });
  },
});
