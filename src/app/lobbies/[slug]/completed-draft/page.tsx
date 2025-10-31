"use client";

import { useQuery } from "convex/react";
import Image from "next/image";
import router from "next/router";
import { use, useCallback, useEffect, useMemo } from "react";
import { useLeadersMaps } from "@/app/LeadersMapsProvider";
import { Bans } from "@/components/bans/Bans";
import { CivPrimaryButton } from "@/components/CivPrimaryButton";
import { TeamHeaders } from "@/components/TeamHeaders";
import { TeamSelection } from "@/components/TeamSelection";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function CompletedMapsPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const { slug: lobbyId } = use(params);
  const lobby = useQuery(api.lobbies.get, { lobbyId });
  const { leaders, maps } = useLeadersMaps();

  const team1SelectedLeaders = useMemo(
    () =>
      lobby?.team1.selectedLeaders
        .map((leaderId) => leaders?.find((leader) => leader._id === leaderId))
        .filter((leader) => leader !== undefined) ?? [],
    [leaders, lobby],
  );

  const team2SelectedLeaders = useMemo(
    () =>
      lobby?.team2.selectedLeaders
        .map((leaderId) => leaders?.find((leader) => leader._id === leaderId))
        .filter((leader) => leader !== undefined) ?? [],
    [leaders, lobby],
  );

  const team1BannedLeaders = useMemo(
    () =>
      lobby?.team1.bannedLeaders
        .map((leaderId) => leaders?.find((leader) => leader._id === leaderId))
        .filter((leader) => leader !== undefined) ?? [],
    [leaders, lobby],
  );

  const team2BannedLeaders = useMemo(
    () =>
      lobby?.team2.bannedLeaders
        .map((leaderId) => leaders?.find((leader) => leader._id === leaderId))
        .filter((leader) => leader !== undefined) ?? [],
    [leaders, lobby],
  );

  const bannedMaps = useMemo(
    () =>
      lobby?.bannedMapIds
        .map((mapId) => maps?.find((map) => map._id === mapId))
        .filter((map) => map !== undefined)
        .map((m) => m!.name) ?? [],
    [lobby, maps],
  );

  const selectedMap = useMemo(
    () => maps?.find((map) => map._id === lobby?.selectedMapId),
    [maps, lobby],
  );

  const numberOfPicks = useMemo(() => {
    if (!lobby) {
      return 0;
    }
    return lobby.numberOfPicksFirstRotation + lobby.numberOfPicksSecondRotation;
  }, [lobby]);

  const onCopy = useCallback(() => {
    if (lobby) {
      const draftExported = exportDraft({
        picksTeam1: team1SelectedLeaders.map((leader) => leader!.name),
        picksTeam2: team2SelectedLeaders.map((leader) => leader!.name),
        bansTeam1: team1BannedLeaders.map((leader) => leader!.name),
        bansTeam2: team2BannedLeaders.map((leader) => leader!.name),
        mapBans: bannedMaps,
        teamName1: lobby.team1.name,
        teamName2: lobby.team2.name,
        selectedMap: selectedMap ? selectedMap.name : "",
        numberOfBansFirstRotation: lobby.numberOfBansFirstRotation,
        numberOfBansSecondRotation: lobby.numberOfBansSecondRotation,
      });
      navigator.clipboard.writeText(draftExported);
    }
  }, [
    lobby,
    bannedMaps,
    selectedMap,
    team1BannedLeaders,
    team1SelectedLeaders,
    team2BannedLeaders,
    team2SelectedLeaders,
  ]);

  useEffect(() => {
    if (lobby?.status === "LOBBY") {
      router.push(`/lobbies/${lobbyId}`);
    }
    if (lobby?.status === "MAP_SELECTION") {
      router.push(`/lobbies/${lobbyId}/draft-maps`);
    }
    if (lobby?.status === "LEADER_SELECTION") {
      router.push(`/lobbies/${lobbyId}/draft-leaders`);
    }
  }, [lobby, lobbyId]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-2 p-8 text-text-primary">
      <div className=" w-full">
        {lobby && (
          <TeamHeaders
            team1={lobby.team1.name ?? "Team 1"}
            team2={lobby.team2.name ?? "Team 2"}
            currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
            numberOfBansFirstRotation={lobby.numberOfBansFirstRotation}
          />
        )}
      </div>
      <div className="flex w-full flex-grow items-center">
        {lobby && (
          <TeamSelection
            leaderOrMaps={
              team1SelectedLeaders.map((leader) => ({
                id: leader!._id,
                name: leader!.name,
                imageName: leader!.imageName,
                type: "leader",
              })) ?? []
            }
            numberOfPicks={numberOfPicks / 2}
            currentStatus={`${lobby.draftStatus.type}${lobby.draftStatus.index}`}
            statuses={["PICK1", "PICK4", "PICK6", "PICK7"]}
          />
        )}
        <div className="flex flex-grow flex-col items-center justify-center gap-2">
          {selectedMap && (
            <Image
              className="flex h-28 w-28 items-center justify-center rounded-xl text-center sm:h-12 sm:w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 xl:h-28 xl:w-28"
              src={`/maps/${selectedMap.imageName}`}
              alt={selectedMap.name}
              width={112}
              height={112}
              quality={100}
            />
          )}
          <div className="w-45 flex-grow flex-col items-center">
            <CivPrimaryButton onClick={onCopy}>Copy draft</CivPrimaryButton>
          </div>
        </div>
        {lobby && (
          <TeamSelection
            leaderOrMaps={
              team2SelectedLeaders.map((leader) => ({
                id: leader!._id,
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
                bans={[...team1BannedLeaders].reverse().map((ban) => ({
                  name: ban!.name,
                  src: ban!.imageName,
                }))}
                draftStatus={lobby.draftStatus}
                isOdd
              />
            </div>
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
                bans={[...team2BannedLeaders].reverse().map((ban) => ({
                  name: ban!.name,
                  src: ban!.imageName,
                }))}
                isTeam2
                draftStatus={lobby.draftStatus}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const exportDraft = ({
  picksTeam1,
  picksTeam2,
  bansTeam1,
  bansTeam2,
  mapBans,
  teamName1,
  teamName2,
  selectedMap,
  numberOfBansFirstRotation,
  numberOfBansSecondRotation,
}: {
  picksTeam1: string[];
  picksTeam2: string[];
  bansTeam1: string[];
  bansTeam2: string[];
  teamName1: string;
  teamName2: string;
  mapBans: string[];
  selectedMap: string;
  numberOfBansFirstRotation: number;
  numberOfBansSecondRotation: number;
}): string => {
  const mapBansText =
    mapBans.length > 0 ? `Map bans : ${mapBans.join(" / ")}` : "";

  const civBansFirstRotation = Array.from({
    length: numberOfBansFirstRotation / 2,
  }).flatMap((_, i) =>
    [bansTeam1[i], bansTeam2[i]].filter((x) => x !== undefined),
  );

  const civBansSecondRotation = Array.from({
    length: numberOfBansSecondRotation / 2,
  }).flatMap((_, i) =>
    [
      bansTeam2[i + numberOfBansFirstRotation / 2],
      bansTeam1[i + numberOfBansFirstRotation / 2],
    ].filter((x) => x !== undefined),
  );

  const bansText = `Leader bans : ${[...civBansFirstRotation, ...civBansSecondRotation].join(" / ")}`;

  const picksTeam1Text = `${teamName1}\n${picksTeam1
    .map((pick, index) => `Player${index + 1} ${pick}`)
    .join("\n")}`;
  const picksTeam2Text = `${teamName2}\n${picksTeam2
    .map((pick, index) => `Player${index + 1} ${pick}`)
    .join("\n")}`;

  let fullText = `${teamName1} VS ${teamName2}\n`;
  fullText += `Victory ${teamName1}/${teamName2} by CC TXX\n`;
  fullText += `${selectedMap} \n\n`;

  if (mapBans.length > 0) fullText += `${mapBansText}\n`;

  fullText += `${bansText}\n`;
  fullText += `\n`;
  fullText += `${picksTeam1Text}\n\n`;
  fullText += `${picksTeam2Text}\n`;

  return fullText;
};
