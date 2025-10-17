import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Check if the current user is an admin
 */
export const isAdmin = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()

        if (!identity) {
            return false
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first()

        return user?.role === "admin"
    },
})

/**
 * Get current user info
 */
export const getCurrentUser = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            return null
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .first()

        return user
    },
})


