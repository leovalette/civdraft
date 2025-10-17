"use client";

import { useMutation, useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { SelectAutobans } from "@/components/home/SelectAutoBans";
import { SelectMaps } from "@/components/home/SelectMaps";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

interface PresetFormData {
  name: string;
  selectedMaps: { name: string; src: string; _id: string }[];
  selectedBans: { name: string; _id: string; src: string }[];
  numberOfBansFirstRotation: number;
  numberOfBansSecondRotation: number;
}

export function PresetManager() {
  const presets = useQuery(api.presets.get);
  const leaders = useQuery(api.leaders.get);
  const maps = useQuery(api.maps.getAll);
  const createPreset = useMutation(api.presets.create);
  const updatePreset = useMutation(api.presets.update);
  const deletePresetMutation = useMutation(api.presets.deletePreset);

  const [editingPresetId, setEditingPresetId] = useState<Id<"presets"> | null>(
    null,
  );
  const [formData, setFormData] = useState<PresetFormData>({
    name: "",
    selectedMaps: [],
    selectedBans: [],
    numberOfBansFirstRotation: 10,
    numberOfBansSecondRotation: 2,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get bannable leaders (exclude TIMEOUT)
  const bannableLeaders = useMemo<{ name: string; src: string; _id: string }[]>(
    () =>
      leaders
        ?.filter(({ name }) => name !== "TIMEOUT")
        .map(({ name, imageName, _id }) => ({
          name,
          src: imageName,
          _id,
        })) ?? [],
    [leaders],
  );

  // Convert maps to format needed by SelectMaps
  const mapsForSelect = useMemo<{ name: string; src: string; _id: string }[]>(
    () =>
      maps
        ?.filter(({ name }) => name !== "TIMEOUT")
        ?.map(({ name, imageName, _id }) => ({
          name,
          src: imageName,
          _id,
        })) ?? [],
    [maps],
  );

  const handleEditClick = (presetId: Id<"presets">) => {
    const preset = presets?.find((p) => p._id === presetId);
    if (!preset) {
      return;
    }

    const selectedMaps =
      maps
        ?.filter((m) => preset.mapIds.includes(m._id))
        .map(({ name, imageName, _id }) => ({
          name,
          src: imageName,
          _id,
        })) ?? [];

    const selectedBans =
      leaders
        ?.filter((l) => preset.autoBannedLeaderIds.includes(l._id))
        .map(({ name, imageName, _id }) => ({
          name,
          _id,
          src: imageName,
        })) ?? [];

    setEditingPresetId(presetId);
    setFormData({
      name: preset.name,
      selectedMaps,
      selectedBans,
      numberOfBansFirstRotation: preset.numberOfBansFirstRotation,
      numberOfBansSecondRotation: preset.numberOfBansSecondRotation,
    });
    setError(null);
  };

  const handleReset = () => {
    setEditingPresetId(null);
    setFormData({
      name: "",
      selectedMaps: [],
      selectedBans: [],
      numberOfBansFirstRotation: 10,
      numberOfBansSecondRotation: 2,
    });
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.name.trim()) {
      setError("Preset name is required");
      return;
    }

    if (formData.selectedMaps.length === 0) {
      setError("At least one map must be selected");
      return;
    }

    setIsLoading(true);

    try {
      if (editingPresetId) {
        // Update existing preset
        await updatePreset({
          presetId: editingPresetId,
          name: formData.name,
          mapIds: formData.selectedMaps.map((m) => m._id as Id<"maps">),
          autoBannedLeaderIds: formData.selectedBans.map(
            (b) => b._id as Id<"leaders">,
          ),
          numberOfBansFirstRotation: formData.numberOfBansFirstRotation,
          numberOfBansSecondRotation: formData.numberOfBansSecondRotation,
        });
      } else {
        // Create new preset
        await createPreset({
          name: formData.name,
          mapIds: formData.selectedMaps.map((m) => m._id as Id<"maps">),
          autoBannedLeaderIds: formData.selectedBans.map(
            (b) => b._id as Id<"leaders">,
          ),
          numberOfBansFirstRotation: formData.numberOfBansFirstRotation,
          numberOfBansSecondRotation: formData.numberOfBansSecondRotation,
        });
      }

      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (presetId: Id<"presets">) => {
    if (!confirm("Are you sure you want to delete this preset?")) {
      return;
    }

    setIsLoading(true);

    try {
      await deletePresetMutation({ presetId });
      if (editingPresetId === presetId) {
        handleReset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete preset");
    } finally {
      setIsLoading(false);
    }
  };

  const isNumberOfMapsValid = useMemo(() => {
    return (
      formData.selectedMaps.length === 0 ||
      (formData.selectedMaps.length !== 1 &&
        formData.selectedMaps.length % 2 === 1)
    );
  }, [formData.selectedMaps]);

  return (
    <div className="space-y-6 text-bg-golden-border">
      {/* Presets List */}
      <div className="border border-[#c6a873] rounded-lg p-6 bg-gradient-to-br from-indigo-200">
        <h2 className="text-2xl font-semibold mb-4">Existing Presets</h2>

        {!presets ? (
          <p className="text-gray-400">Loading presets...</p>
        ) : presets.length === 0 ? (
          <p className="text-gray-400">No presets created yet</p>
        ) : (
          <div className="space-y-3">
            {presets.map((preset) => (
              <div
                key={preset._id}
                className="flex justify-between items-center p-4 bg-slate-700 rounded border border-slate-600"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{preset.name}</h3>
                  <p className="text-sm text-gray-400">
                    Maps: {preset.mapIds.length} | Autobans:{" "}
                    {preset.autoBannedLeaderIds.length}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditClick(preset._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-semibold transition text-white"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(preset._id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition text-white"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form */}
      <div className="border border-[#c6a873] rounded-lg p-6 bg-gradient-to-br from-indigo-200">
        <h2 className="text-2xl font-semibold mb-4">
          {editingPresetId ? "Edit Preset" : "Create New Preset"}
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="preset-name"
              className="block text-sm font-semibold mb-2"
            >
              Preset Name
            </label>
            <input
              id="preset-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Standard Mode"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-emerald-500 "
              disabled={isLoading}
            />
          </div>

          {/* Maps Selection */}
          {mapsForSelect.length > 0 && (
            <SelectMaps
              selectedMaps={formData.selectedMaps}
              setSelectedMaps={(maps) =>
                setFormData({ ...formData, selectedMaps: maps })
              }
              maps={mapsForSelect}
            />
          )}

          {/* Autobans Selection */}
          {bannableLeaders.length > 0 && (
            <SelectAutobans
              bannableLeaders={bannableLeaders}
              bansCiv={formData.selectedBans}
              setBansCiv={(bans) =>
                setFormData({ ...formData, selectedBans: bans })
              }
            />
          )}

          {/* Number Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="bans-first"
                className="block text-sm font-semibold mb-2"
              >
                Bans First Rotation
              </label>
              <input
                id="bans-first"
                type="number"
                min="0"
                value={formData.numberOfBansFirstRotation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfBansFirstRotation:
                      parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-emerald-500 "
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="bans-second"
                className="block text-sm font-semibold mb-2"
              >
                Bans Second Rotation
              </label>
              <input
                id="bans-second"
                type="number"
                min="0"
                value={formData.numberOfBansSecondRotation}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    numberOfBansSecondRotation:
                      parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded focus:outline-none focus:border-emerald-500 "
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-600 rounded  text-sm">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            {editingPresetId && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition text-white"
                disabled={isLoading}
              >
                Cancel
              </button>
            )}
            <div>
              {!isNumberOfMapsValid && (
                <div className="text-lg font-semibold text-red-700 mt-2">
                  Please select 3-5-7 maps
                </div>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 rounded font-semibold transition disabled:bg-[#35312b] text-white"
                disabled={isLoading || !isNumberOfMapsValid}
              >
                {isLoading
                  ? "Saving..."
                  : editingPresetId
                    ? "Update Preset"
                    : "Create Preset"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
