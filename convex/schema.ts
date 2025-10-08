import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    }),
    team2: v.object({
      name: v.string(),
      selectedLeaders: v.array(v.id("leaders")),
      bannedLeaders: v.array(v.id("leaders")),
    }),
    autoBannedLeaderIds: v.array(v.id("leaders")),
    numberOfBansFirstRotation: v.number(),
    numberOfBansSecondRotation: v.number(),
    numberOfPicksFirstRotation: v.number(),
    numberOfPicksSecondRotation: v.number(),
    selectedMapId: v.optional(v.id("maps")),
  }),
});
