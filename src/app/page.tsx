"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
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

const modes = [
  { label: "1v1", value: "1v1" },
  { label: "2v2", value: "2v2" },
  { label: "3v3", value: "3v3" },
  { label: "4v4", value: "4v4" },
  { label: "FFA", value: "ffa" },
];

const formSchema = z.object({
  team1Name: z.string().optional(),
  team2Name: z.string().optional(),
  pseudo: z.string().optional(),
  mode: z.string().optional(),
  autobanCivs: z.array(z.string()).optional(),
  mapDraft: z.boolean(),
});

export default function Home() {
  const leaders = useQuery(api.leaders.getLeaderNames);
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle form submission here
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
                      {modes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
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
                            {leaders?.map((leader) => (
                              <CommandItem
                                key={leader}
                                value={leader}
                                onSelect={() => {
                                  const newSelected = selectedCivs.includes(
                                    leader,
                                  )
                                    ? selectedCivs.filter((v) => v !== leader)
                                    : [...selectedCivs, leader];
                                  setSelectedCivs(newSelected);
                                  field.onChange(newSelected);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedCivs.includes(leader)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {leader}
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
