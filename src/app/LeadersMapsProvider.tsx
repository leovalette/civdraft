"use client";

import { useQuery } from "convex/react";
import { createContext, type ReactNode, useContext } from "react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";

type LeaderType = Doc<"leaders">;
type MapType = Doc<"maps">;

const LeadersMapsContext = createContext<{
  leaders?: LeaderType[];
  maps?: MapType[];
} | null>(null);

export function LeadersMapsProvider({ children }: { children: ReactNode }) {
  const leaders = useQuery(api.leaders.get);
  const maps = useQuery(api.maps.getAll);

  return (
    <LeadersMapsContext.Provider value={{ leaders, maps }}>
      {children}
    </LeadersMapsContext.Provider>
  );
}

export function useLeadersMaps() {
  const ctx = useContext(LeadersMapsContext);
  if (!ctx) {
    throw new Error("useLeadersMaps must be used within LeadersMapsProvider");
  }
  return ctx;
}

export default LeadersMapsProvider;
