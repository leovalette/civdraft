"use client";

import { useMutation, useQuery } from "convex/react";
import { use } from "react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function DraftMapsPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const { slug: lobbyId } = use(params);
  const lobby = useQuery(api.lobbies.get, { lobbyId });
  const banMap = useMutation(api.mapDraft.banMap);

  return (
    <div>
      <h1>Draft Maps</h1>
    </div>
  );
}
