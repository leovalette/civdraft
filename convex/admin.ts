import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    return await ctx.db.query("presets").collect();
  },
});

/**
 * Check if the current user is an admin
 */
export const isAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user?.role === "admin";
  },
});

/**
 * Get current user info
 */
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    return user;
  },
});

/**
 * Promote a user to admin (only callable by admins)
 */
export const promoteToAdmin = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can promote users");
    }

    // Find the user to promote
    const userToPromote = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!userToPromote) {
      throw new Error("User not found");
    }

    // Update user role to admin
    await ctx.db.patch(userToPromote._id, { role: "admin" });

    return { success: true, userId: userToPromote._id };
  },
});

/**
 * Demote an admin to user (only callable by admins)
 */
export const demoteToUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can demote users");
    }

    // Find the user to demote
    const userToDemote = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!userToDemote) {
      throw new Error("User not found");
    }

    // Update user role to user
    await ctx.db.patch(userToDemote._id, { role: "user" });

    return { success: true, userId: userToDemote._id };
  },
});

/**
 * List all users (only callable by admins)
 */
export const listAllUsers = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can list users");
    }

    return await ctx.db.query("users").collect();
  },
});
