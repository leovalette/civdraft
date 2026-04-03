"use client";

import { useMutation } from "convex/react";
import { use, useMemo } from "react";
import { useLeadersMaps } from "@/app/LeadersMapsProvider";
import { Chat } from "@/components/chat/Chat";
import { DraftActions } from "@/components/DraftActions";
import { LeaderOrMap } from "@/components/Leader";
import { TeamHeaders } from "@/components/TeamHeaders";
import { TeamSelection } from "@/components/TeamSelection";
import { Timer } from "@/components/Timer";
import { useDraft } from "@/hooks/useDraft";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function DraftMapsPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const { slug: lobbyId } = use(params);

  const {
    lobby,
    chat,
    currentSelectionId: selectedMapId,
    serverTimeOffsetMs,
    currentTeam,
    isObserver,
    canPlay,
    onPostMessage,
    onSelect,
    onClearSelection,
  } = useDraft(lobbyId, {
    expectedStatus: "MAP_SELECTION",
    redirects: {
      LOBBY: `/lobbies/${lobbyId}`,
      LEADER_SELECTION: `/lobbies/${lobbyId}/draft-leaders`,
      COMPLETED: `/lobbies/${lobbyId}/completed-draft`,
    },
  });

  const { maps: allMaps, mapsById } = useLeadersMaps();
  const banMap = useMutation(api.mapDraft.banMap);

  const team1BannedMaps = useMemo(() => {
    if (!lobby || !mapsById) {
      return [];
    }

    const bannedMaps = lobby.team1.bannedMaps
      .map((mapId) => mapsById.get(mapId))
      .filter((map): map is NonNullable<typeof map> => map !== undefined);

    if (lobby.currentTeamTurn === 1 && selectedMapId) {
      const currentlySelected = mapsById.get(selectedMapId);
      if (currentlySelected) {
        return [...bannedMaps, currentlySelected];
      }
    }
    return bannedMaps;
  }, [mapsById, lobby, selectedMapId]);

  const team2BannedMaps = useMemo(() => {
    if (!lobby || !mapsById) {
      return [];
    }

    const bannedMaps = lobby.team2.bannedMaps
      .map((mapId) => mapsById.get(mapId))
      .filter((map): map is NonNullable<typeof map> => map !== undefined);

    if (lobby.currentTeamTurn === 2 && selectedMapId) {
      const currentlySelected = mapsById.get(selectedMapId);
      if (currentlySelected) {
        return [...bannedMaps, currentlySelected];
      }
    }
    return bannedMaps;
  }, [mapsById, lobby, selectedMapId]);

  const handleConfirm = async () => {
    if (!selectedMapId) return;

    const mapIdToSubmit = selectedMapId;
    onClearSelection();

    try {
      await banMap({
        lobbyId,
        mapId: mapIdToSubmit,
        teamNumber: currentTeam,
      });
    } catch (error) {
      console.error("Error banning map:", error);
      onSelect(mapIdToSubmit);
    }
  };

  const availableMaps = useMemo(() => {
    if (!lobby || !allMaps) {
      return [];
    }
    return lobby.mapIds.length === 0
      ? allMaps
      : allMaps.filter((map) => lobby.mapIds.includes(map.id));
  }, [lobby, allMaps]);

  const filteredMaps = useMemo(() => {
    if (!lobby) {
      return [];
    }
    return (
      availableMaps?.filter((map) => !lobby.bannedMapIds.includes(map.id)) ?? []
    );
  }, [lobby, availableMaps]);

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
                  id: map?.id,
                  name: map?.name,
                  imageName: map?.imageName,
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
              {lobby?.mapBanTimestamp && (
                <Timer
                  timestampMs={lobby.mapBanTimestamp}
                  timerDuration={60}
                  serverTimeOffsetMs={serverTimeOffsetMs}
                />
              )}
            </div>
          </div>
          <div className="flex h-4/5 flex-wrap justify-center gap-4 overflow-y-scroll">
            {filteredMaps.map((map) => (
              <LeaderOrMap
                key={map.id}
                leaderOrMap={{
                  id: map.id,
                  name: map.name,
                  imageName: map.imageName,
                  pickBanType: "AVAILABLE",
                }}
                type="map"
                onClick={() => {
                  if (canPlay) {
                    onSelect(map.id);
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
                  id: map?.id,
                  name: map?.name,
                  imageName: map?.imageName,
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
