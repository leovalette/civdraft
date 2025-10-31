"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import { type Leader, leaders } from "@/lib/data/leaders";
import { type Map as GameMap, maps } from "@/lib/data/maps";

const LeadersMapsContext = createContext<{
  leaders: Leader[];
  maps: GameMap[];
  leadersById: Map<string, Leader>;
  mapsById: Map<string, GameMap>;
} | null>(null);

export function LeadersMapsProvider({ children }: { children: ReactNode }) {
  // Create efficient lookup maps for O(1) access instead of O(n) .find()
  const leadersById = useMemo(() => {
    const map = new Map<string, Leader>();
    leaders.forEach(leader => {
      map.set(leader.id, leader);
    });
    return map;
  }, []);

  const mapsById = useMemo(() => {
    const map = new Map<string, GameMap>();
    maps.forEach(gameMap => {
      map.set(gameMap.id, gameMap);
    });
    return map;
  }, []);

  return (
    <LeadersMapsContext.Provider value={{ leaders, maps, leadersById, mapsById }}>
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
