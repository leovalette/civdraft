import { query } from "./_generated/server";

/**
 * Returns the current server time in milliseconds (epoch).
 * Used by the client Timer component to compute the offset between
 * client and server clocks, ensuring the countdown is accurate
 * regardless of the user's local clock settings.
 */
export const now = query({
  args: {},
  handler: async () => {
    return Date.now();
  },
});
