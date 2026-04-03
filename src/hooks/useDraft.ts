import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { getUserId, getUserPseudo } from "@/lib/user";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";

type StatusRedirect = {
  /** The lobby status this draft page expects to be in */
  expectedStatus: Doc<"lobbies">["status"];
  /** Map of other statuses → paths to redirect to */
  redirects: Partial<Record<Doc<"lobbies">["status"], string>>;
};

/**
 * Shared hook for draft pages (leaders & maps).
 * Encapsulates lobby/chat/selection subscriptions, server time sync,
 * player role detection, chat posting, and status-based routing.
 */
export function useDraft(
  lobbyId: Id<"lobbies">,
  statusRedirect: StatusRedirect,
) {
  const router = useRouter();

  // Separate queries to minimize re-render cascading
  const lobby = useQuery(api.lobbyData.getLobby, { lobbyId });
  const chat = useQuery(api.lobbyData.getChat, { lobbyId }) ?? [];
  const currentSelectionId = useQuery(api.lobbyData.getCurrentSelection, {
    lobbyId,
  });

  const serverTime = useQuery(api.serverTime.now);
  const postMessage = useMutation(api.chat.post);
  const setSelection = useMutation(api.currentSelection.set);
  const clearSelection = useMutation(api.currentSelection.clear);

  const userId = getUserId();
  const pseudo = getUserPseudo();

  const currentTeam = useMemo(() => lobby?.currentTeamTurn ?? 1, [lobby]);

  const serverTimeOffsetMs = useMemo(
    () => (serverTime != null ? serverTime - Date.now() : 0),
    [serverTime],
  );

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

  const onPostMessage = useCallback(
    (message: string) => postMessage({ message, pseudo, lobbyId }),
    [pseudo, postMessage, lobbyId],
  );

  const onSelect = useCallback(
    (selectionId: string) => setSelection({ lobbyId, selectionId }),
    [lobbyId, setSelection],
  );

  const onClearSelection = useCallback(
    () => clearSelection({ lobbyId }),
    [lobbyId, clearSelection],
  );

  // Redirect to the correct page when lobby status doesn't match expected
  useEffect(() => {
    if (!lobby) return;
    if (lobby.status !== statusRedirect.expectedStatus) {
      const path = statusRedirect.redirects[lobby.status];
      if (path) {
        router.push(path);
      }
    }
  }, [lobby, router, statusRedirect]);

  return {
    lobby,
    chat,
    currentSelectionId,
    serverTimeOffsetMs,
    userId,
    pseudo,
    currentTeam,
    isObserver,
    canPlay,
    onPostMessage,
    onSelect,
    onClearSelection,
    lobbyId,
  };
}
