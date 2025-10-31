"use client";

import { createContext, type ReactNode, useContext } from "react";
import { type Leader, leaders } from "@/lib/data/leaders";
import { type Map as GameMap, maps } from "@/lib/data/maps";

const LeadersMapsContext = createContext<{
  leaders: Leader[];
  maps: GameMap[];
} | null>(null);

export function LeadersMapsProvider({ children }: { children: ReactNode }) {
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
