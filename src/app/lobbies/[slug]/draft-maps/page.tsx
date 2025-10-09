"use client";

import { useMutation, useQuery } from "convex/react";
import { X } from "lucide-react";
import Image from "next/image";
import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function DraftMapsPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const { slug: lobbyId } = use(params);
  const lobby = useQuery(api.lobbies.get, { lobbyId });
  const allMaps = useQuery(api.maps.getAll);
  const banMap = useMutation(api.mapDraft.banMap);

  const [selectedMapId, setSelectedMapId] = useState<Id<"maps"> | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 60));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!lobby || !allMaps) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const currentTeam = lobby.currentMapBanTeam ?? 1;
  const availableMaps = allMaps.filter((map) => lobby.mapIds.includes(map._id));
  const team1BannedMaps = allMaps.filter((map) =>
    lobby.team1.bannedMaps.includes(map._id),
  );
  const team2BannedMaps = allMaps.filter((map) =>
    lobby.team2.bannedMaps.includes(map._id),
  );

  const handleConfirm = async () => {
    if (!selectedMapId) return;

    try {
      await banMap({
        lobbyId,
        mapId: selectedMapId,
        teamNumber: currentTeam,
      });
      setSelectedMapId(null);
      setTimeLeft(60);

      // Check if only one map left
      const remainingMaps = availableMaps.filter(
        (map) =>
          !lobby.bannedMapIds.includes(map._id) && map._id !== selectedMapId,
      );
      if (remainingMaps.length === 1) {
        console.log("Only one map remaining:", remainingMaps[0].name);
      }
    } catch (error) {
      console.error("Error banning map:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Header with team indicators */}
      <div className="w-full max-w-7xl flex justify-between items-center mb-8">
        <div
          className={`px-6 py-3 rounded-lg text-white font-semibold ${currentTeam === 1 ? "bg-blue-600" : "bg-blue-600/30"}`}
        >
          TEAM 1
        </div>
        <div className="text-white text-center">
          <div className="mb-2 bg-emerald-600 px-6 py-2 rounded-full inline-flex items-center justify-center min-w-[80px]">
            <span className="text-3xl font-bold">{timeLeft}</span>
          </div>
          <div className="text-xl font-bold bg-emerald-600 px-6 py-3 rounded-lg">
            {currentTeam === 1
              ? "TEAM 1 IS BANNING A MAP"
              : "TEAM 2 IS BANNING A MAP"}
          </div>
        </div>
        <div
          className={`px-6 py-3 rounded-lg text-white font-semibold ${currentTeam === 2 ? "bg-amber-600" : "bg-amber-600/30"}`}
        >
          TEAM 2
        </div>
      </div>

      {/* Main content grid */}
      <div className="w-full max-w-7xl grid grid-cols-[250px_1fr_250px] gap-6">
        {/* Team 1 banned maps */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white text-center font-semibold mb-2">
            Waiting for selection
          </h2>
          {team1BannedMaps.map((map) => (
            <div
              key={map._id}
              className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg"
            >
              <div className="relative aspect-video mb-2">
                <Image
                  src={`/maps/${map.imageName}`}
                  alt={map.name}
                  fill
                  className="object-cover rounded"
                />
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <X className="w-16 h-16 text-red-500 stroke-[3]" />
                </div>
              </div>
              <p className="text-white text-sm text-center">{map.name}</p>
            </div>
          ))}
        </div>

        {/* Available maps grid */}
        <div>
          <div className="flex items-center justify-center mb-4">
            <input
              type="text"
              placeholder="Search"
              className="bg-slate-800/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg w-64"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-2">
            {availableMaps.map((map) => {
              const isBanned = lobby.bannedMapIds.includes(map._id);
              const isSelected = selectedMapId === map._id;

              return (
                <button
                  type="button"
                  key={map._id}
                  className={`relative transition-all ${
                    isSelected ? "ring-4 ring-yellow-400 scale-105" : ""
                  } ${isBanned ? "opacity-50" : "hover:scale-105"}`}
                  onClick={() => !isBanned && setSelectedMapId(map._id)}
                  disabled={isBanned}
                >
                  <div className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg">
                    <div className="relative aspect-video mb-2">
                      <Image
                        src={`/maps/${map.imageName}`}
                        alt={map.name}
                        fill
                        className="object-cover rounded"
                      />
                      {isBanned && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <X className="w-16 h-16 text-red-500 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm text-center">{map.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Team 2 banned maps */}
        <div className="flex flex-col gap-3">
          <h2 className="text-white text-center font-semibold mb-2">
            Waiting for selection
          </h2>
          {team2BannedMaps.map((map) => (
            <div
              key={map._id}
              className="bg-slate-800/80 backdrop-blur-sm p-3 rounded-lg"
            >
              <div className="relative aspect-video mb-2">
                <Image
                  src={`/maps/${map.imageName}`}
                  alt={map.name}
                  fill
                  className="object-cover rounded"
                />
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <X className="w-16 h-16 text-red-500 stroke-[3]" />
                </div>
              </div>
              <p className="text-white text-sm text-center">{map.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm button */}
      <div className="mt-8 text-center">
        <div className="text-white mb-4">Waiting for other team</div>
        <Button
          onClick={handleConfirm}
          disabled={!selectedMapId}
          className="bg-slate-800 hover:bg-slate-700 text-white px-12 py-6 text-lg"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
}
