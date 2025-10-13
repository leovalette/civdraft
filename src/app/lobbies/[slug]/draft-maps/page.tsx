"use client";

import { useMutation, useQuery } from "convex/react";
import router from "next/router";
import { use, useEffect, useMemo, useState } from "react";
import { DraftActions } from "@/components/DraftActions";
import { LeaderOrMap } from "@/components/Leader";
import { TeamHeaders } from "@/components/TeamHeaders";
import { TeamSelection } from "@/components/TeamSelection";
import { getUserId } from "@/lib/user";
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
  const userId = getUserId();

  const [selectedMapId, setSelectedMapId] = useState<Id<"maps"> | null>(null);

  const currentTeam = useMemo(() => lobby?.currentTeamTurn ?? 1, [lobby]);

  const team1BannedMaps = useMemo(
    () => allMaps?.filter((map) => lobby?.team1.bannedMaps.includes(map._id)),
    [allMaps, lobby],
  );

  const team2BannedMaps = useMemo(
    () => allMaps?.filter((map) => lobby?.team2.bannedMaps.includes(map._id)),
    [allMaps, lobby],
  );

  const isObserver = useMemo(
    () => lobby?.observers.some((observer) => observer.id === userId) ?? false,
    [lobby],
  );

  const canPlay = useMemo(() => {
    const isPlayerTeam1 =
      lobby?.team1.players.some((player) => player.id === userId) ?? false;
    const isPlayerTeam2 =
      lobby?.team2.players.some((player) => player.id === userId) ?? false;
    return (currentTeam === 1 ? isPlayerTeam1 : isPlayerTeam2) && !isObserver;
  }, [currentTeam, isObserver]);

  const handleConfirm = async () => {
    if (!selectedMapId) return;

    try {
      await banMap({
        lobbyId,
        mapId: selectedMapId,
        teamNumber: currentTeam,
      });
      setSelectedMapId(null);
    } catch (error) {
      console.error("Error banning map:", error);
    }
  };

  const availableMaps = useMemo(() => {
    if (!lobby || !allMaps) {
      return [];
    }
    return lobby.bannedMapIds.length === 0
      ? allMaps
      : allMaps.filter((map) => lobby.mapIds.includes(map._id));
  }, [lobby, allMaps]);

  const filteredMaps = useMemo(() => {
    if (!lobby) {
      return [];
    }
    return (
      availableMaps?.filter((map) => !lobby.bannedMapIds.includes(map._id)) ??
      []
    );
  }, [lobby, availableMaps]);

  useEffect(() => {
    if (!lobby?.withMapDraft || filteredMaps.length <= 1) {
      // Navigate to the lobby page
      router.push(`/lobbies/${lobbyId}/draft-leaders`);
    }
  }, [filteredMaps]);

  return (
    <div className="flex  h-screen w-full flex-col items-center justify-center gap-2 px-8 text-text-primary">
      <div className="w-full">
        {lobby && (
          <TeamHeaders
            team1={lobby.team1.name ?? "Team 1"}
            team2={lobby.team2.name ?? "Team 2"}
            currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
          />
        )}
      </div>
      <div className="flex h-4/5 w-full justify-between gap-4">
        <div className="flex flex-col gap-6">
          {lobby && (
            <TeamSelection
              leaderOrMaps={
                team1BannedMaps?.map((map) => ({
                  id: map._id,
                  name: map.name,
                  imageName: map.imageName,
                  type: "map",
                })) ?? []
              }
              numberOfPicks={availableMaps.length / 2}
              currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
              statuses={[
                "MAPBAN1",
                "MAPBAN3",
                "MAPBAN5",
                "MAPBAN7",
                "MAPBAN9",
                "MAPBAN11",
              ]}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <div className="flex justify-between gap-6 sm:scale-75 md:scale-75 lg:scale-75">
              {/* TODO <Timer timestamp={timestamp} timerDuration={60} /> */}
            </div>
          </div>
          <div className="flex h-4/5 flex-wrap justify-center gap-4 overflow-y-scroll">
            {filteredMaps.map((map) => (
              <LeaderOrMap
                key={map._id}
                leaderOrMap={{
                  id: map._id,
                  name: map.name,
                  imageName: map.imageName,
                  pickBanType: undefined, // TODO
                }}
                type="map"
                onClick={() => setSelectedMapId(map._id)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {lobby && (
            <TeamSelection
              leaderOrMaps={
                team2BannedMaps?.map((map) => ({
                  id: map._id,
                  name: map.name,
                  imageName: map.imageName,
                  type: "map",
                })) ?? []
              }
              numberOfPicks={availableMaps.length / 2}
              currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
              statuses={[
                "MAPBAN2",
                "MAPBAN4",
                "MAPBAN6",
                "MAPBAN8",
                "MAPBAN10",
                "MAPBAN12",
              ]}
            />
          )}
          {/* <Chat
            chatMessages={draftInfo?.chatMessages ?? []}
            players={draftInfo?.players ?? []}
            draftId={draftId}
            idPlayer={idPlayer}
          /> */}
        </div>
      </div>
      <div className="flex w-full items-center justify-between mt-4">
        {lobby && (
          <DraftActions
            currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
            canPlay={canPlay}
            onPickBan={handleConfirm}
            isObserver={isObserver}
          />
        )}
      </div>
    </div>
  );
}
