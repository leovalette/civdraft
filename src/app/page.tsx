"use client";

import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CivPrimaryButton } from "@/components/CivPrimaryButton";
import { Input } from "@/components/home/Input";
import { SelectAutobans } from "@/components/home/SelectAutoBans";
import { SelectMaps } from "@/components/home/SelectMaps";
import { SelectMode } from "@/components/home/SelectMode";
import { setUserPseudo } from "@/lib/user";
import { api } from "../../convex/_generated/api";

export default function Home() {
  const leaders = useQuery(api.leaders.get);
  const presets = useQuery(api.presets.get);
  const maps = useQuery(api.maps.getAll);
  const createLobby = useMutation(api.lobbies.create);
  const router = useRouter();

  const [pseudo, setPseudo] = useState<string>("Player 1");
  const [team1, setTeam1] = useState<string>("Team 1");
  const [team2, setTeam2] = useState<string>("Team 2");
  const [selectedMaps, setSelectedMaps] = useState<any[]>([]);
  const [banCivs, setBanCivs] = useState<any[]>([]);
  const [preset, setPreset] = useState<{ id: string; label: string } | null>(
    null,
  );

  const bannableLeaders = useMemo<{ name: string; src: string }[]>(
    () =>
      leaders
        ?.filter(({ name }) => name !== "TIMEOUT")
        .map(({ name, imageName }) => ({ name, src: imageName })) ?? [],
    [leaders],
  );

  const onPresetChange = useCallback(
    (e: { presetId: string; label: string | null } | null) => {
      setPreset(
        e ? { id: e.presetId, label: e.label ?? "Custom preset" } : null,
      );
      const selectedPreset = presets?.find((m) => m._id === e?.presetId);
      if (selectedPreset) {
        const presetMaps = maps
          ?.filter((map) => selectedPreset.mapIds.includes(map._id))
          .map(({ name, imageName }) => ({ name, src: imageName }));

        setSelectedMaps(presetMaps || []);
      } else {
        setSelectedMaps([]);
      }
    },
    [maps, presets],
  );

  const onPseudoChange = useCallback((newPseudo: string) => {
    setUserPseudo(newPseudo);
    setPseudo(newPseudo);
  }, []);

  const onSubmit = useCallback(async () => {
    // Find the selected preset to get all required data
    const selectedPreset = presets?.find((m) => m._id === preset?.id);

    try {
      // Create the lobby with all required parameters
      const lobbyId = await createLobby({
        team1Name: team1 || "Team 1",
        team2Name: team2 || "Team 2",
        autoBannedLeaderIds: banCivs.map(({ _id }) => _id),
        numberOfBansFirstRotation: selectedPreset?.numberOfBansFirstRotation,
        numberOfBansSecondRotation: selectedPreset?.numberOfBansSecondRotation,
        numberOfPicksFirstRotation: selectedPreset?.numberOfPicksFirstRotation,
        numberOfPicksSecondRotation:
          selectedPreset?.numberOfPicksSecondRotation,
        mapIds: selectedMaps.map(({ _id }) => _id),
        mapDraft: selectedMaps.length > 0,
      });

      // Navigate to the lobby page
      router.push(`/lobbies/${lobbyId}`);
    } catch (error) {
      console.error("Failed to create lobby:", error);
    }
  }, [
    banCivs,
    createLobby,
    preset,
    presets,
    router,
    selectedMaps,
    team1,
    team2,
  ]);

  const isNumberOfMapsValid = useMemo(() => {
    return selectedMaps.length % 2 === 1;
  }, [preset, presets, selectedMaps]);

  return (
    <div className="w-96 flex flex-col gap-4 rounded-lg border border-golden-border bg-gradient-to-br from-indigo-200 p-6 text-bg-golden-border">
      <Input value={team1} setValue={setTeam1} label="Team 1 name" />
      <Input value={team2} setValue={setTeam2} label="Team 2 name" />
      <Input value={pseudo} setValue={onPseudoChange} label="Pseudo" />
      <SelectMode
        preset={preset}
        presets={presets?.map((m) => ({ id: m._id, label: m.name })) ?? []}
        onChangePreset={onPresetChange}
      />
      <SelectAutobans
        bansCiv={banCivs}
        setBansCiv={setBanCivs}
        bannableLeaders={bannableLeaders}
      />
      <SelectMaps
        selectedMaps={selectedMaps}
        setSelectedMaps={setSelectedMaps}
        maps={
          maps?.map(({ name, imageName }) => ({ name, src: imageName })) ?? []
        }
      />
      <div className="pt-6">
        <CivPrimaryButton
          disabled={!isNumberOfMapsValid}
          onClick={() => void onSubmit()}
        >
          Create Lobby
        </CivPrimaryButton>
        {!isNumberOfMapsValid && (
          <div className="text-lg font-semibold ">Please select 3-5-7 maps</div>
        )}
      </div>
    </div>
  );
}
