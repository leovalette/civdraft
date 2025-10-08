"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const formSchema = z.object({
  team1Name: z.string().optional(),
  team2Name: z.string().optional(),
  pseudo: z.string().optional(),
  mode: z.string().optional(),
  autobanCivs: z.array(z.string()).optional(),
  mapDraft: z.boolean(),
});

export default function Home() {
  const leaders = useQuery(api.leaders.get);
  const modes = useQuery(api.presets.get);
  const createLobby = useMutation(api.lobbies.create);
  const router = useRouter();

  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedCivs, setSelectedCivs] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    // @ts-expect-error - Zod v4 compatibility issue with @hookform/resolvers
    resolver: zodResolver(formSchema),
    defaultValues: {
      team1Name: "",
      team2Name: "",
      pseudo: "",
      mode: "",
      autobanCivs: [],
      mapDraft: false,
    },
  });

  // Watch for mode changes
  const selectedMode = form.watch("mode");

  useEffect(() => {
    if (selectedMode && modes) {
      const preset = modes.find((m) => m._id === selectedMode);
      if (preset) {
        // Update mapDraft checkbox based on mapIds array
        if (preset.mapIds && preset.mapIds.length > 0) {
          form.setValue("mapDraft", true);
        } else {
          form.setValue("mapDraft", false);
        }

        // Update autobanCivs based on autoBannedLeaderIds array
        if (
          preset.autoBannedLeaderIds &&
          preset.autoBannedLeaderIds.length > 0
        ) {
          const leaderIds = preset.autoBannedLeaderIds;
          setSelectedCivs(leaderIds);
          form.setValue("autobanCivs", leaderIds);
        } else {
          setSelectedCivs([]);
          form.setValue("autobanCivs", []);
        }
      }
    }
  }, [selectedMode, modes, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Find the selected preset to get all required data
    const preset = modes?.find((m) => m._id === values.mode);

    try {
      // Create the lobby with all required parameters
      const lobbyId = await createLobby({
        team1Name: values.team1Name || "Team 1",
        team2Name: values.team2Name || "Team 2",
        autoBannedLeaderIds: (values.autobanCivs || []) as Id<"leaders">[],
        numberOfBansFirstRotation: preset?.numberOfBansFirstRotation,
        numberOfBansSecondRotation: preset?.numberOfBansSecondRotation,
        numberOfPicksFirstRotation: preset?.numberOfPicksFirstRotation,
        numberOfPicksSecondRotation: preset?.numberOfPicksSecondRotation,
        mapIds: preset?.mapIds,
        mapDraft: values.mapDraft,
      });

      // Navigate to the lobby page
      router.push(`/lobbies/${lobbyId}`);
    } catch (error) {
      console.error("Failed to create lobby:", error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Civ Draft Setup</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="team1Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team 1 Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team 1 name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="team2Name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team 2 Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team 2 name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pseudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pseudo</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your pseudo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a game mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modes?.map(({ _id: id, label }) => (
                        <SelectItem key={id} value={id}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autobanCivs"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Autoban Civs</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !selectedCivs.length && "text-muted-foreground",
                          )}
                        >
                          {selectedCivs.length > 0
                            ? `${selectedCivs.length} civ${selectedCivs.length > 1 ? "s" : ""} selected`
                            : "Select civs to autoban"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search civs..." />
                        <CommandList>
                          <CommandEmpty>No leader found.</CommandEmpty>
                          <CommandGroup>
                            {leaders?.map(({ _id: id, name }) => (
                              <CommandItem
                                key={id}
                                value={id}
                                onSelect={() => {
                                  const newSelected = selectedCivs.includes(id)
                                    ? selectedCivs.filter((v) => v !== id)
                                    : [...selectedCivs, id];
                                  setSelectedCivs(newSelected);
                                  field.onChange(newSelected);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCivs.includes(id)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Select civilizations to automatically ban from the draft.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mapDraft"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Map Draft</FormLabel>
                    <FormDescription>
                      Enable map drafting for this game.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Start a draft
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
