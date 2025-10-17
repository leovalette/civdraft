"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CivPrimaryButton } from "@/components/CivPrimaryButton";
import { Input } from "@/components/home/Input";
import { SelectAutobans } from "@/components/home/SelectAutoBans";
import { SelectMaps } from "@/components/home/SelectMaps";
import { SelectMode } from "@/components/home/SelectMode";
import { useIsAdmin } from "@/hooks/useAdmin";
import { setUserPseudo } from "@/lib/user";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export default function Home() {
  const leaders = useQuery(api.leaders.get);
  const presets = useQuery(api.presets.get);
  const maps = useQuery(api.maps.getAll);
  const createLobby = useMutation(api.lobbies.create);
  const router = useRouter();

  const [pseudo, setPseudo] = useState<string>("Player 1");
  const [team1, setTeam1] = useState<string>("Team 1");
  const [team2, setTeam2] = useState<string>("Team 2");
  const [selectedMaps, setSelectedMaps] = useState<
    { name: string; src: string; _id: string }[]
  >([]);
  const [banCivs, setBanCivs] = useState<
    { name: string; _id: string; src: string }[]
  >([]);
  const [preset, setPreset] = useState<{ id: string; label: string } | null>(
    null,
  );

  const bannableLeaders = useMemo<{ name: string; src: string; _id: string }[]>(
    () =>
      leaders
        ?.filter(({ name }) => name !== "TIMEOUT")
        .map(({ name, imageName, _id }) => ({ name, src: imageName, _id })) ??
      [],
    [leaders],
  );

  const onPresetChange = useCallback(
    (e: { presetId: string; label: string | null } | null) => {
      setPreset(
        e ? { id: e.presetId, label: e.label ?? "Custom preset" } : null,
      );
      const selectedPreset = presets?.find((m) => m._id === e?.presetId);
      if (selectedPreset && maps) {
        const presetMaps = maps
          .filter((map) => selectedPreset.mapIds.includes(map._id))
          .map(({ name, imageName, _id }) => ({ name, src: imageName, _id }));

        setSelectedMaps(presetMaps);
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
        autoBannedLeaderIds: banCivs.map(({ _id }) => _id as Id<"leaders">),
        numberOfBansFirstRotation: selectedPreset?.numberOfBansFirstRotation,
        numberOfBansSecondRotation: selectedPreset?.numberOfBansSecondRotation,
        numberOfPicksFirstRotation: selectedPreset?.numberOfPicksFirstRotation,
        numberOfPicksSecondRotation:
          selectedPreset?.numberOfPicksSecondRotation,
        mapIds: selectedMaps.map(({ _id }) => _id as Id<"maps">),
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
    return (
      selectedMaps.length === 0 ||
      (selectedMaps.length !== 1 && selectedMaps.length % 2 === 1)
    );
  }, [selectedMaps]);

  const isAdmin = useIsAdmin();

  return (
    <div className="flex flex-col h-screen  w-full">
      <div className="flex justify-between items-center p-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 backdrop-blur-sm border-b border-golden-border">
        <h1 className="text-3xl font-bold text-golden-border">CivDraft</h1>
        <div className="flex gap-4 items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="w-96 flex flex-col gap-4 rounded-lg border border-golden-border bg-gradient-to-br from-indigo-200 p-6 text-bg-golden-border">
          {isAdmin && (
            <CivPrimaryButton
              onClick={() => {
                router.push(`/admin`);
              }}
            >
              Create or Edit Preset
            </CivPrimaryButton>
          )}
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
              maps?.map(({ name, imageName, _id }) => ({
                name,
                src: imageName,
                _id,
              })) ?? []
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
              <div className="text-lg font-semibold ">
                Please select 3-5-7 maps
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
