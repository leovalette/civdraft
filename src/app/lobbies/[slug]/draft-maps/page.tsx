"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useLeadersMaps } from "@/app/LeadersMapsProvider";
import { Chat } from "@/components/chat/Chat";
import { DraftActions } from "@/components/DraftActions";
import { LeaderOrMap } from "@/components/Leader";
import { TeamHeaders } from "@/components/TeamHeaders";
import { TeamSelection } from "@/components/TeamSelection";
import { Timer } from "@/components/Timer";
import { getUserId, getUserPseudo } from "@/lib/user";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function DraftMapsPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const router = useRouter();
  const { slug: lobbyId } = use(params);
  const lobby = useQuery(api.lobbies.get, { lobbyId });
  const { maps: allMaps } = useLeadersMaps();
  const banMap = useMutation(api.mapDraft.banMap);
  const chat = useQuery(api.chat.get, { lobbyId });
  const postMessage = useMutation(api.chat.post);
  const selectedMapId = useQuery(api.currentSelection.get, { lobbyId });
  const setSelectedMapId = useMutation(api.currentSelection.set);
  const clearSelectedMapId = useMutation(api.currentSelection.clear);

  const userId = getUserId();
  const pseudo = getUserPseudo();

  const currentTeam = useMemo(() => lobby?.currentTeamTurn ?? 1, [lobby]);

  const [timerTimestamp, setTimerTimestamp] = useState<Date>(() =>
    lobby?.mapBanTimestamp ? new Date(lobby.mapBanTimestamp) : new Date(),
  );

  useEffect(() => {
    if (!lobby) return;
    if (lobby.mapBanTimestamp) {
      setTimerTimestamp(new Date(lobby.mapBanTimestamp));
    }
  }, [lobby?.mapBanTimestamp, lobby]);

  const team1BannedMaps = useMemo(() => {
    if (!lobby || !allMaps) {
      return [];
    }

    return lobby.currentTeamTurn === 1 && selectedMapId
      ? [
          ...lobby.team1.bannedMaps.map((mapId) =>
            allMaps.find((map) => map._id === mapId),
          ),
          allMaps.find((map) => map._id === selectedMapId),
        ].filter((map) => map !== undefined)
      : lobby.team1.bannedMaps
          .map((mapId) => allMaps.find((map) => map._id === mapId))
          .filter((map) => map !== undefined);
  }, [allMaps, lobby, selectedMapId]);

  const team2BannedMaps = useMemo(() => {
    if (!lobby || !allMaps) {
      return [];
    }
    return lobby.currentTeamTurn === 2 && selectedMapId
      ? [
          ...lobby.team2.bannedMaps.map((mapId) =>
            allMaps.find((map) => map._id === mapId),
          ),
          allMaps.find((map) => map._id === selectedMapId),
        ].filter((map) => map !== undefined)
      : lobby.team2.bannedMaps
          .map((mapId) => allMaps.find((map) => map._id === mapId))
          .filter((map) => map !== undefined);
  }, [allMaps, lobby, selectedMapId]);

  const isObserver = useMemo(
    () => lobby?.observers.some((observer) => observer.id === userId) ?? false,
    [lobby, userId],
  );

  const canPlay = useMemo(() => {
    const isPlayerTeam1 =
      lobby?.team1.players.some((player) => player.id === userId) ?? false;
    const isPlayerTeam2 =
      lobby?.team2.players.some((player) => player.id === userId) ?? false;
    return (currentTeam === 1 ? isPlayerTeam1 : isPlayerTeam2) && !isObserver;
  }, [currentTeam, isObserver, lobby, userId]);

  const handleConfirm = async () => {
    if (!selectedMapId) return;

    try {
      await banMap({
        lobbyId,
        mapId: selectedMapId as Id<"maps">,
        teamNumber: currentTeam,
      });
      clearSelectedMapId({ lobbyId });
    } catch (error) {
      console.error("Error banning map:", error);
    }
  };

  const availableMaps = useMemo(() => {
    if (!lobby || !allMaps) {
      return [];
    }
    return lobby.mapIds.length === 0
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
    if (lobby?.status === "LOBBY") {
      router.push(`/lobbies/${lobbyId}`);
    }
    if (lobby?.status === "LEADER_SELECTION") {
      router.push(`/lobbies/${lobbyId}/draft-leaders`);
    }
    if (lobby?.status === "COMPLETED") {
      router.push(`/lobbies/${lobbyId}/completed-draft`);
    }
  }, [lobby, router, lobbyId]);

  const onPostMessage = useCallback(
    (message: string) => postMessage({ message, pseudo, lobbyId }),
    [pseudo, postMessage, lobbyId],
  );

  return (
    <div className="flex  h-screen w-full flex-col items-center justify-center gap-2 p-8 text-text-primary">
      <div className="w-full">
        {lobby && (
          <TeamHeaders
            team1={lobby.team1.name ?? "Team 1"}
            team2={lobby.team2.name ?? "Team 2"}
            currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
            numberOfBansFirstRotation={lobby.mapIds.length + 1}
          />
        )}
      </div>
      <div className="flex h-4/5 w-full justify-between gap-4">
        <div className="flex flex-col gap-6">
          {lobby && (
            <TeamSelection
              leaderOrMaps={
                team1BannedMaps?.map((map) => ({
                  id: map!._id,
                  name: map!.name,
                  imageName: map!.imageName,
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
              <Timer timestamp={timerTimestamp} timerDuration={60} />
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
                  pickBanType: "AVAILABLE",
                }}
                type="map"
                onClick={() => {
                  if (canPlay) {
                    setSelectedMapId({ lobbyId, selectionId: map._id });
                  }
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {lobby && (
            <TeamSelection
              leaderOrMaps={
                team2BannedMaps?.map((map) => ({
                  id: map!._id,
                  name: map!.name,
                  imageName: map!.imageName,
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
          <Chat messages={chat ?? []} postMessage={onPostMessage} />
        </div>
      </div>
      <div className="flex w-full items-center justify-center mt-4">
        {lobby && (
          <DraftActions
            currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
            canPlay={canPlay}
            onPickBan={handleConfirm}
            isObserver={isObserver}
            disabled={!selectedMapId}
          />
        )}
      </div>
    </div>
  );
}
