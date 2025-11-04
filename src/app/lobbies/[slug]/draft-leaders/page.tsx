"use client";

import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useLeadersMaps } from "@/app/LeadersMapsProvider";
import { Bans } from "@/components/bans/Bans";
import { Chat } from "@/components/chat/Chat";
import { DraftActions } from "@/components/DraftActions";
import { LeaderOrMap } from "@/components/Leader";
import { Search } from "@/components/Search";
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

  // Use separate queries to minimize re-renders
  // Lobby state changes won't re-render chat, and vice versa
  const lobby = useQuery(api.lobbyData.getLobby, { lobbyId });
  const chat = useQuery(api.lobbyData.getChat, { lobbyId }) ?? [];
  const selectedLeaderId = useQuery(api.lobbyData.getCurrentSelection, {
    lobbyId,
  });

  const { leaders, leadersById, mapsById } = useLeadersMaps();
  const pickBanLeader = useMutation(api.leaders.pickBanLeader);
  const postMessage = useMutation(api.chat.post);
  const setSelectedLeaderId = useMutation(api.currentSelection.set);
  const clearSelectedLeaderId = useMutation(api.currentSelection.clear);

  const userId = getUserId();
  const pseudo = getUserPseudo();

  const [search, setSearch] = useState<string>("");

  const [timerTimestamp, setTimerTimestamp] = useState<Date>(() =>
    lobby?.leaderBanTimestamp ? new Date(lobby.leaderBanTimestamp) : new Date(),
  );

  useEffect(() => {
    if (!lobby) return;
    if (lobby.leaderBanTimestamp) {
      setTimerTimestamp(new Date(lobby.leaderBanTimestamp));
    }
  }, [lobby?.leaderBanTimestamp, lobby]);

  const team1SelectedLeaders = useMemo(() => {
    if (!lobby || !leadersById) {
      return [];
    }
    const selectedLeaders = lobby.team1.selectedLeaders
      .map((leaderId) => leadersById.get(leaderId))
      .filter(
        (leader): leader is NonNullable<typeof leader> => leader !== undefined,
      );

    if (
      lobby.currentTeamTurn === 1 &&
      lobby.draftStatus.type === "PICK" &&
      selectedLeaderId
    ) {
      const currentlySelected = leadersById.get(selectedLeaderId);
      if (currentlySelected) {
        return [...selectedLeaders, currentlySelected];
      }
    }
    return selectedLeaders;
  }, [leadersById, lobby, selectedLeaderId]);

  const team2SelectedLeaders = useMemo(() => {
    if (!lobby || !leadersById) {
      return [];
    }
    const selectedLeaders = lobby.team2.selectedLeaders
      .map((leaderId) => leadersById.get(leaderId))
      .filter(
        (leader): leader is NonNullable<typeof leader> => leader !== undefined,
      );

    if (
      lobby.currentTeamTurn === 2 &&
      lobby.draftStatus.type === "PICK" &&
      selectedLeaderId
    ) {
      const currentlySelected = leadersById.get(selectedLeaderId);
      if (currentlySelected) {
        return [...selectedLeaders, currentlySelected];
      }
    }
    return selectedLeaders;
  }, [leadersById, lobby, selectedLeaderId]);

  const team1BannedLeaders = useMemo(() => {
    if (!lobby || !leadersById) {
      return [];
    }
    const bannedLeaders = lobby.team1.bannedLeaders
      .map((leaderId) => leadersById.get(leaderId))
      .filter(
        (leader): leader is NonNullable<typeof leader> => leader !== undefined,
      );

    if (
      lobby.currentTeamTurn === 1 &&
      lobby.draftStatus.type === "BAN" &&
      selectedLeaderId
    ) {
      const currentlySelected = leadersById.get(selectedLeaderId);
      if (currentlySelected) {
        return [...bannedLeaders, currentlySelected];
      }
    }
    return bannedLeaders;
  }, [leadersById, lobby, selectedLeaderId]);

  const team2BannedLeaders = useMemo(() => {
    if (!lobby || !leadersById) {
      return [];
    }
    const bannedLeaders = lobby.team2.bannedLeaders
      .map((leaderId) => leadersById.get(leaderId))
      .filter(
        (leader): leader is NonNullable<typeof leader> => leader !== undefined,
      );

    if (
      lobby.currentTeamTurn === 2 &&
      lobby.draftStatus.type === "BAN" &&
      selectedLeaderId
    ) {
      const currentlySelected = leadersById.get(selectedLeaderId);
      if (currentlySelected) {
        return [...bannedLeaders, currentlySelected];
      }
    }
    return bannedLeaders;
  }, [leadersById, lobby, selectedLeaderId]);

  const numberOfPicks = useMemo(() => {
    if (!lobby) {
      return 0;
    }
    return lobby.numberOfPicksFirstRotation + lobby.numberOfPicksSecondRotation;
  }, [lobby]);

  const currentTeam = useMemo(() => lobby?.currentTeamTurn ?? 1, [lobby]);

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

  const filteredLeaders = useMemo(
    () =>
      leaders
        ?.filter(
          (leader) =>
            leader.filters.some((filter) =>
              filter.toLowerCase().trim().includes(search.toLowerCase().trim()),
            ) && leader.name !== "TIMEOUT",
        )
        .sort((a, b) => a.name.localeCompare(b.name)) ?? [],
    [leaders, search],
  );

  const selectedMap = useMemo(() => {
    if (!lobby?.selectedMapId) return undefined;
    return mapsById.get(lobby.selectedMapId);
  }, [mapsById, lobby]);

  const handleConfirm = async () => {
    if (!selectedLeaderId) return;

    const leaderIdToSubmit = selectedLeaderId;

    // Clear selection for ALL users immediately (optimistic)
    clearSelectedLeaderId({ lobbyId });

    try {
      await pickBanLeader({
        lobbyId,
        leaderId: leaderIdToSubmit,
        teamNumber: currentTeam,
      });
    } catch (error) {
      console.error("Error banning leader:", error);
      // On error, restore the selection for everyone
      setSelectedLeaderId({ lobbyId, selectionId: leaderIdToSubmit });
    }
  };

  useEffect(() => {
    if (lobby?.status === "LOBBY") {
      router.push(`/lobbies/${lobbyId}`);
    }
    if (lobby?.status === "MAP_SELECTION") {
      router.push(`/lobbies/${lobbyId}/draft-maps`);
    }
    if (lobby?.status === "COMPLETED") {
      router.push(`/lobbies/${lobbyId}/completed-draft`);
    }
  }, [lobby, lobbyId, router]);

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
            numberOfBansFirstRotation={lobby.numberOfBansFirstRotation}
          />
        )}
      </div>
      <div className="flex h-4/5 w-full justify-between gap-4">
        <div className="flex flex-col gap-6">
          {lobby && (
            <>
              <TeamSelection
                leaderOrMaps={
                  team1SelectedLeaders.map((leader) => ({
                    id: leader!.id,
                    name: leader!.name,
                    imageName: leader!.imageName,
                    type: "leader",
                  })) ?? []
                }
                numberOfPicks={numberOfPicks / 2}
                currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
                statuses={["PICK1", "PICK4", "PICK6", "PICK7"]}
              />
              {selectedMap && (
                <Image
                  className="flex h-28 w-28 items-center justify-center rounded-xl text-center sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
                  src={`/maps/${selectedMap.imageName}`}
                  alt={selectedMap.name}
                  width={112}
                  height={112}
                />
              )}
            </>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <div className="w-96">
              <Search value={search} setValue={setSearch} />
            </div>
            <div className="flex justify-between gap-6 sm:scale-75 md:scale-75 lg:scale-75">
              <Timer timestamp={timerTimestamp} timerDuration={60} />
            </div>
          </div>
          <div className="flex h-4/5 flex-wrap justify-center gap-4 overflow-y-scroll">
            {filteredLeaders.map((leader) => (
              <LeaderOrMap
                key={leader.id}
                leaderOrMap={{
                  id: leader.id,
                  name: leader.name,
                  imageName: leader.imageName,
                  pickBanType: lobby?.team1.bannedLeaders.includes(leader.id)
                    ? "BANT1"
                    : lobby?.team2.bannedLeaders.includes(leader.id)
                      ? "BANT2"
                      : lobby?.team1.selectedLeaders.includes(leader.id)
                        ? "PICKT1"
                        : lobby?.team2.selectedLeaders.includes(leader.id)
                          ? "PICKT2"
                          : lobby?.autoBannedLeaderIds.includes(leader.id)
                            ? "AUTOBAN"
                            : "AVAILABLE",
                }}
                type="leader"
                onClick={() => {
                  if (canPlay) {
                    setSelectedLeaderId({ lobbyId, selectionId: leader.id });
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
                team2SelectedLeaders.map((leader) => ({
                  id: leader!.id,
                  name: leader!.name,
                  imageName: leader!.imageName,
                  type: "leader",
                })) ?? []
              }
              numberOfPicks={numberOfPicks / 2}
              currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
              statuses={["PICK2", "PICK3", "PICK5", "PICK8"]}
            />
          )}
          <Chat messages={chat ?? []} postMessage={onPostMessage} />
        </div>
      </div>
      <div className="flex w-full items-center justify-between">
        {lobby && (
          <>
            <div>
              <Bans
                numberOfBans={lobby.numberOfBansFirstRotation / 2}
                bans={team1BannedLeaders.map((ban) => ({
                  name: ban!.name,
                  src: ban!.imageName,
                }))}
                draftStatus={lobby.draftStatus}
              />
              <Bans
                numberOfBans={lobby.numberOfBansSecondRotation / 2}
                bans={team1BannedLeaders.map((ban) => ({
                  name: ban!.name,
                  src: ban!.imageName,
                }))}
                draftStatus={lobby.draftStatus}
                offset={lobby.numberOfBansFirstRotation / 2}
                isOdd
              />
            </div>
            <DraftActions
              currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
              canPlay={canPlay}
              onPickBan={handleConfirm}
              isObserver={isObserver}
              disabled={!selectedLeaderId}
            />
            <div>
              <Bans
                numberOfBans={lobby.numberOfBansFirstRotation / 2}
                bans={team2BannedLeaders.map((ban) => ({
                  name: ban!.name,
                  src: ban!.imageName,
                }))}
                isTeam2
                isOdd
                draftStatus={lobby.draftStatus}
              />
              <Bans
                numberOfBans={lobby.numberOfBansSecondRotation / 2}
                bans={team2BannedLeaders.map((ban) => ({
                  name: ban!.name,
                  src: ban!.imageName,
                }))}
                isTeam2
                draftStatus={lobby.draftStatus}
                offset={lobby.numberOfBansFirstRotation / 2}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
