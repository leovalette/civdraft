import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * This function should be called when a new user signs up via Clerk
 * You can set this up as a Clerk webhook or call it from your client
 */
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update email if changed
      if (existingUser.email !== args.email) {
        await ctx.db.patch(existingUser._id, { email: args.email });
      }
      return existingUser;
    }

    // Create new user with "user" role
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      role: "user",
      createdAt: Date.now(),
    });

    return {
      _id: userId,
      clerkId: args.clerkId,
      email: args.email,
      role: "user",
      createdAt: Date.now(),
    };
  },
});
