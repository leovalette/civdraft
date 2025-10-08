import { query } from "./_generated/server";

export const getLeaderNames = query({
  args: {},
  handler: async (ctx) => {
    const leaders = await ctx.db.query("leaders").collect();
    return leaders.map(({ name }) => name);
  },
});
