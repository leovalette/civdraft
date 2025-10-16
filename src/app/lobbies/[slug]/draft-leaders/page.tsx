"use client";

import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { Bans } from "@/components/bans/Bans";
import { DraftActions } from "@/components/DraftActions";
import { LeaderOrMap } from "@/components/Leader";
import { Search } from "@/components/Search";
import { TeamHeaders } from "@/components/TeamHeaders";
import { TeamSelection } from "@/components/TeamSelection";
import { getUserId, getUserPseudo } from "@/lib/user";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Chat } from "@/components/chat/Chat";

export default function DraftMapsPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const router = useRouter();
  const { slug: lobbyId } = use(params);
  const lobby = useQuery(api.lobbies.get, { lobbyId });
  const leaders = useQuery(api.leaders.get);
  const banLeader = useMutation(api.leaders.banLeader);
  const maps = useQuery(api.maps.getAll);
  const chat = useQuery(api.chat.get, { lobbyId });
  const postMessage = useMutation(api.chat.post);

  const userId = getUserId();
  const pseudo = getUserPseudo();

  const [selectedLeaderId, setSelectedLeaderId] =
    useState<Id<"leaders"> | null>(null);
  const [search, setSearch] = useState<string>("");

  const team1SelectedLeaders = useMemo(
    () =>
      leaders?.filter((leader) =>
        lobby?.team1.selectedLeaders.includes(leader._id),
      ) ?? [],
    [leaders, lobby],
  );

  const team2SelectedLeaders = useMemo(
    () =>
      leaders?.filter((leader) =>
        lobby?.team2.selectedLeaders.includes(leader._id),
      ) ?? [],
    [leaders, lobby],
  );

  const team1BannedLeaders = useMemo(
    () =>
      leaders?.filter((leader) =>
        lobby?.team1.bannedLeaders.includes(leader._id),
      ) ?? [],
    [leaders, lobby],
  );

  const team2BannedLeaders = useMemo(
    () =>
      leaders?.filter((leader) =>
        lobby?.team2.bannedLeaders.includes(leader._id),
      ) ?? [],
    [leaders, lobby],
  );

  const numberOfPicks = useMemo(() => {
    if (!lobby) {
      return 0;
    }
    return lobby.numberOfPicksFirstRotation + lobby.numberOfPicksSecondRotation;
  }, [lobby]);

  const currentTeam = useMemo(() => lobby?.currentTeamTurn ?? 1, [lobby]);

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

  const filteredLeaders = useMemo(
    () =>
      leaders?.filter(
        (leader) =>
          !lobby?.team1.selectedLeaders.includes(leader._id) &&
          !lobby?.team2.selectedLeaders.includes(leader._id) &&
          leader.name
            .toLowerCase()
            .trim()
            .includes(search.toLowerCase().trim()) &&
          leader.name !== "TIMEOUT",
      ) ?? [],
    [leaders, lobby, search],
  );

  const selectedMap = useMemo(
    () => maps?.find((map) => map._id === lobby?.selectedMapId),
    [maps, lobby],
  );

  const handleConfirm = async () => {
    if (!selectedLeaderId) return;

    try {
      await banLeader({
        lobbyId,
        leaderId: selectedLeaderId,
        teamNumber: currentTeam,
      });
      setSelectedLeaderId(null);
    } catch (error) {
      console.error("Error banning leader:", error);
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
  }, [lobby]);

  const onPostMessage = useCallback(
    (message: string) => postMessage({ message, pseudo, lobbyId }),
    [pseudo, postMessage, lobbyId],
  );

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
            <>
              <TeamSelection
                leaderOrMaps={
                  team1SelectedLeaders.map((leader) => ({
                    id: leader._id,
                    name: leader.name,
                    imageName: leader.imageName,
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
                  width={48}
                  height={48}
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
              {/* TODO <Timer timestamp={timestamp} timerDuration={60} /> */}
            </div>
          </div>
          <div className="flex h-4/5 flex-wrap justify-center gap-4 overflow-y-scroll">
            {filteredLeaders.map((leader) => (
              <LeaderOrMap
                key={leader._id}
                leaderOrMap={{
                  id: leader._id,
                  name: leader.name,
                  imageName: leader.imageName,
                  pickBanType: lobby?.team1.bannedLeaders.includes(leader._id)
                    ? "BANT1"
                    : lobby?.team2.bannedLeaders.includes(leader._id)
                      ? "BANT2"
                      : lobby?.autoBannedLeaderIds.includes(leader._id)
                        ? "AUTOBAN"
                        : "AVAILABLE",
                }}
                type="leader"
                onClick={() => setSelectedLeaderId(leader._id)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {lobby && (
            <TeamSelection
              leaderOrMaps={
                team2SelectedLeaders.map((leader) => ({
                  id: leader._id,
                  name: leader.name,
                  imageName: leader.imageName,
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
      <div className="flex w-full items-center justify-between mt-4">
        {lobby && (
          <>
            <Bans
              numberOfBans={
                (lobby.numberOfBansFirstRotation +
                  lobby.numberOfBansSecondRotation) /
                2
              }
              bans={team1BannedLeaders.map(({ name, imageName }) => ({
                name,
                src: imageName,
              }))}
            />
            <DraftActions
              currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
              canPlay={canPlay}
              onPickBan={handleConfirm}
              isObserver={isObserver}
            />
            <Bans
              numberOfBans={
                (lobby.numberOfBansFirstRotation +
                  lobby.numberOfBansSecondRotation) /
                2
              }
              bans={team2BannedLeaders.map(({ name, imageName }) => ({
                name,
                src: imageName,
              }))}
            />
          </>
        )}
      </div>
    </div>
  );
}
