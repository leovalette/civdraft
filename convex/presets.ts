import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("presets").collect()
  },
})

/**
 * Get a single preset by ID
 */
export const getById = query({
  args: {
    presetId: v.id("presets"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.presetId)
  },
})

/**
 * Create a new preset (admin only)
 */
export const create = mutation({
  args: {
    name: v.string(),
    mapIds: v.array(v.id("maps")),
    autoBannedLeaderIds: v.array(v.id("leaders")),
    numberOfBansFirstRotation: v.number(),
    numberOfBansSecondRotation: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can create presets")
    }

    // Check if preset name already exists
    const existingPreset = await ctx.db
      .query("presets")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first()

    if (existingPreset) {
      throw new Error(`Preset with name "${args.name}" already exists`)
    }

    const presetId = await ctx.db.insert("presets", {
      name: args.name,
      mapIds: args.mapIds,
      autoBannedLeaderIds: args.autoBannedLeaderIds,
      numberOfBansFirstRotation: args.numberOfBansFirstRotation,
      numberOfBansSecondRotation: args.numberOfBansSecondRotation,
      numberOfPicksFirstRotation: 4,
      numberOfPicksSecondRotation: 4,
    })

    return presetId
  },
})

/**
 * Update an existing preset (admin only)
 */
export const update = mutation({
  args: {
    presetId: v.id("presets"),
    name: v.string(),
    mapIds: v.array(v.id("maps")),
    autoBannedLeaderIds: v.array(v.id("leaders")),
    numberOfBansFirstRotation: v.number(),
    numberOfBansSecondRotation: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can update presets")
    }

    const existingPreset = await ctx.db.get(args.presetId)
    if (!existingPreset) {
      throw new Error("Preset not found")
    }

    // Check if new name conflicts with another preset (but not itself)
    if (args.name !== existingPreset.name) {
      const conflictingPreset = await ctx.db
        .query("presets")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first()

      if (conflictingPreset) {
        throw new Error(`Preset with name "${args.name}" already exists`)
      }
    }

    await ctx.db.patch(args.presetId, {
      name: args.name,
      mapIds: args.mapIds,
      autoBannedLeaderIds: args.autoBannedLeaderIds,
      numberOfBansFirstRotation: args.numberOfBansFirstRotation,
      numberOfBansSecondRotation: args.numberOfBansSecondRotation,
      numberOfPicksFirstRotation: 4,
      numberOfPicksSecondRotation: 4,
    })

    return args.presetId
  },
})

/**
 * Delete a preset (admin only)
 */
export const deletePreset = mutation({
  args: {
    presetId: v.id("presets"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Not authenticated")
    }

    // Check if current user is admin
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first()

    if (currentUser?.role !== "admin") {
      throw new Error("Only admins can delete presets")
    }

    const preset = await ctx.db.get(args.presetId)
    if (!preset) {
      throw new Error("Preset not found")
    }

    await ctx.db.delete(args.presetId)
    return args.presetId
  },
})
