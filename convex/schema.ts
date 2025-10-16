import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  leaders: defineTable({
    name: v.string(),
    civilization: v.string(),
    filters: v.array(v.string()),
    imageName: v.string(),
  }),
  maps: defineTable({
    name: v.string(),
    imageName: v.string(),
  }),
  presets: defineTable({
    name: v.string(),
    label: v.string(),
    mapIds: v.array(v.id("maps")),
    autoBannedLeaderIds: v.array(v.id("leaders")),
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
      selectedLeaders: v.array(v.id("leaders")),
      bannedLeaders: v.array(v.id("leaders")),
      bannedMaps: v.array(v.id("maps")),
      players: v.array(v.object({ id: v.string(), pseudo: v.string() })),
      isReady: v.boolean(),
    }),
    team2: v.object({
      name: v.string(),
      selectedLeaders: v.array(v.id("leaders")),
      bannedLeaders: v.array(v.id("leaders")),
      bannedMaps: v.array(v.id("maps")),
      players: v.array(v.object({ id: v.string(), pseudo: v.string() })),
      isReady: v.boolean(),
    }),
    observers: v.array(v.object({ id: v.string(), pseudo: v.string() })),
    autoBannedLeaderIds: v.array(v.id("leaders")),
    numberOfBansFirstRotation: v.number(),
    numberOfBansSecondRotation: v.number(),
    numberOfPicksFirstRotation: v.number(),
    numberOfPicksSecondRotation: v.number(),
    withMapDraft: v.boolean(),
    mapIds: v.array(v.id("maps")),
    bannedMapIds: v.array(v.id("maps")),
    selectedMapId: v.optional(v.id("maps")),
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
  }),
})
