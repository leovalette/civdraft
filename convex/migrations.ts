import { internalMutation } from "./_generated/server"

/**
 * Migration script to move chat messages from lobbies to chat_messages table
 * Run this once after deploying the new schema
 */
export const migrateChatMessages = internalMutation({
    args: {},
    handler: async (ctx) => {
        const lobbies = await ctx.db.query("lobbies").collect()

        let migratedCount = 0
        let lobbiesProcessed = 0

        for (const lobby of lobbies) {
            if (lobby.chatMessages && Array.isArray(lobby.chatMessages)) {
                for (const msg of lobby.chatMessages) {
                    await ctx.db.insert("chat_messages", {
                        lobbyId: lobby._id,
                        pseudo: msg.pseudo,
                        message: msg.message,
                        createdAt: lobby.createdAt ?? Date.now(), // Use lobby creation time if available
                    })
                    migratedCount++
                }
            }

            // Add createdAt if missing
            if (!lobby.createdAt) {
                await ctx.db.patch(lobby._id, {
                    createdAt: lobby._creationTime ?? Date.now(),
                })
            }

            lobbiesProcessed++
        }

        return {
            lobbiesProcessed,
            messageseMigrated: migratedCount,
        }
    },
})

/**
 * Migration script to move current selections from lobbies to current_selections table
 * Run this once after deploying the new schema
 */
export const migrateCurrentSelections = internalMutation({
    args: {},
    handler: async (ctx) => {
        const lobbies = await ctx.db.query("lobbies").collect()

        let migratedCount = 0

        for (const lobby of lobbies) {
            if (lobby.currentSelectionId) {
                await ctx.db.insert("current_selections", {
                    lobbyId: lobby._id,
                    selectionId: lobby.currentSelectionId,
                    updatedAt: Date.now(),
                })
                migratedCount++
            }
        }

        return {
            selectionsMigrated: migratedCount,
        }
    },
})

/**
 * Cleanup script to remove legacy fields from lobbies
 * Run this AFTER confirming migration was successful
 */
export const cleanupLegacyFields = internalMutation({
    args: {},
    handler: async (ctx) => {
        const lobbies = await ctx.db.query("lobbies").collect()

        for (const lobby of lobbies) {
            if (lobby.chatMessages || lobby.currentSelectionId) {
                await ctx.db.patch(lobby._id, {
                    chatMessages: undefined,
                    currentSelectionId: undefined,
                })
            }
        }

        return {
            lobbiesCleaned: lobbies.length,
        }
    },
})
