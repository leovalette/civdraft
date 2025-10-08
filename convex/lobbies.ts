import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";

export const create = mutation({
  args: {
    team1Name: v.string(),
    team2Name: v.string(),
    autoBannedLeaderIds: v.array(v.id("leaders")),
    numberOfBansFirstRotation: v.optional(v.number()),
    numberOfBansSecondRotation: v.optional(v.number()),
    numberOfPicksFirstRotation: v.optional(v.number()),
    numberOfPicksSecondRotation: v.optional(v.number()),
    mapIds: v.optional(v.array(v.id("maps"))),
    mapDraft: v.boolean(),
  },
  handler: async (
    ctx,
    {
      team1Name,
      team2Name,
      autoBannedLeaderIds,
      numberOfBansFirstRotation,
      numberOfBansSecondRotation,
      numberOfPicksFirstRotation,
      numberOfPicksSecondRotation,
      mapIds,
    },
  ) => {
    const finalMapIds: Id<"maps">[] =
      mapIds ??
      (await ctx.db
        .query("maps")
        .collect()
        .then((maps) => maps.map((m) => m._id)));
    return await ctx.db.insert("lobbies", {
      status: "LOBBY",
      team1: {
        name: team1Name,
        selectedLeaders: [],
        bannedLeaders: [],
        players: [],
      },
      team2: {
        name: team2Name,
        selectedLeaders: [],
        bannedLeaders: [],
        players: [],
      },
      observers: [],
      autoBannedLeaderIds,
      numberOfBansFirstRotation: numberOfBansFirstRotation ?? 10,
      numberOfBansSecondRotation: numberOfBansSecondRotation ?? 4,
      numberOfPicksFirstRotation: numberOfPicksFirstRotation ?? 4,
      numberOfPicksSecondRotation: numberOfPicksSecondRotation ?? 4,
      mapIds: finalMapIds,
    });
  },
});
