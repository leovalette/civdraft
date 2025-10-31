import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),
  presets: defineTable({
    name: v.string(),
    mapIds: v.array(v.string()),
    autoBannedLeaderIds: v.array(v.string()),
    numberOfBansFirstRotation: v.number(),
    numberOfBansSecondRotation: v.number(),
    numberOfPicksFirstRotation: v.number(),
    numberOfPicksSecondRotation: v.number(),
  }),
  lobbies: defineTable({
    status: v.union(
      v.literal("LOBBY"),
      v.literal("MAP_SELECTION"),
      v.literal("LEADER_SELECTION"),
      v.literal("COMPLETED"),
    ),
    team1: v.object({
      name: v.string(),
      selectedLeaders: v.array(v.string()),
      bannedLeaders: v.array(v.string()),
      bannedMaps: v.array(v.string()),
      players: v.array(v.object({ id: v.string(), pseudo: v.string() })),
      isReady: v.boolean(),
    }),
    team2: v.object({
      name: v.string(),
      selectedLeaders: v.array(v.string()),
      bannedLeaders: v.array(v.string()),
      bannedMaps: v.array(v.string()),
      players: v.array(v.object({ id: v.string(), pseudo: v.string() })),
      isReady: v.boolean(),
    }),
    observers: v.array(v.object({ id: v.string(), pseudo: v.string() })),
    autoBannedLeaderIds: v.array(v.string()),
    numberOfBansFirstRotation: v.number(),
    numberOfBansSecondRotation: v.number(),
    numberOfPicksFirstRotation: v.number(),
    numberOfPicksSecondRotation: v.number(),
    withMapDraft: v.boolean(),
    mapIds: v.array(v.string()),
    bannedMapIds: v.array(v.string()),
    selectedMapId: v.optional(v.string()),
    currentTeamTurn: v.optional(v.union(v.literal(1), v.literal(2))),
    draftStatus: v.object({
      type: v.union(v.literal("PICK"), v.literal("BAN"), v.literal("MAPBAN")),
      index: v.number(),
    }),
    chatMessages: v.array(
      v.object({ pseudo: v.string(), message: v.string() }),
    ),
    mapBanTimestamp: v.optional(v.number()),
    leaderBanTimestamp: v.optional(v.number()),
    currentSelectionId: v.optional(v.string()),
  }),
});
