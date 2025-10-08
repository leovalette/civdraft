"use client";

import { useMutation, useQuery } from "convex/react";
import { Check, Copy } from "lucide-react";
import { use, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getUserId, getUserPseudo } from "@/lib/user";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function LobbyPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>;
}) {
  const { slug: lobbyId } = use(params);
  const lobby = useQuery(api.lobbies.get, { lobbyId });

  const joinObservers = useMutation(api.lobbies.joinObservers);
  const joinTeam1 = useMutation(api.lobbies.joinTeam1);
  const joinTeam2 = useMutation(api.lobbies.joinTeam2);
  const toggleTeamReady = useMutation(api.lobbies.toggleTeamReady);

  const [copied, setCopied] = useState(false);
  const [userPseudo, setUserPseudo] = useState("");
  const [userId, setUserId] = useState("");

  const handleJoinTeam1 = useCallback(() => {
    if (userId && userPseudo) {
      joinTeam1({
        lobbyId,
        playerPseudo: userPseudo,
        playerId: userId,
      });
    }
  }, [userId, userPseudo, lobbyId, joinTeam1]);

  const handleJoinTeam2 = useCallback(() => {
    if (userId && userPseudo) {
      joinTeam2({
        lobbyId,
        playerPseudo: userPseudo,
        playerId: userId,
      });
    }
  }, [userId, userPseudo, lobbyId, joinTeam2]);

  const handleJoinObservers = useCallback(() => {
    if (userId && userPseudo) {
      joinObservers({
        lobbyId,
        playerPseudo: userPseudo,
        playerId: userId,
      });
    }
  }, [userId, userPseudo, lobbyId, joinObservers]);

  const handleToggleReady = useCallback(() => {
    if (userId) {
      toggleTeamReady({
        lobbyId,
        playerId: userId,
      });
    }
  }, [userId, lobbyId, toggleTeamReady]);

  useEffect(() => {
    // Get or generate user identification on mount
    const pseudo = getUserPseudo();
    const id = getUserId();
    setUserPseudo(pseudo);
    setUserId(id);
    joinObservers({
      lobbyId,
      playerPseudo: pseudo,
      playerId: id,
    });
  }, [joinObservers, lobbyId]);

  const copyToClipboard = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {/* Get Draft URL Button */}
      <div className="mb-8">
        <Button
          onClick={copyToClipboard}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Get draft url
            </>
          )}
        </Button>
      </div>

      {/* Three Columns */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-6xl mb-8">
        {/* Team 1 Column */}
        <div className="flex flex-col">
          <div className="bg-blue-600/80 backdrop-blur-sm text-white p-6 rounded-lg min-h-[120px] flex items-center justify-center mb-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Team 1</h2>
              <ul>
                {lobby?.team1.players.map((player) => (
                  <li key={player.id}>{player.pseudo}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Observers Column */}
        <div className="flex flex-col">
          <div className="bg-slate-800/80 backdrop-blur-sm text-white p-6 rounded-lg min-h-[120px] flex items-center justify-center mb-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Observers</h2>
              <ul>
                {lobby?.observers.map((player) => (
                  <li key={player.id}>{player.pseudo}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Team 2 Column */}
        <div className="flex flex-col">
          <div className="bg-amber-600/80 backdrop-blur-sm text-white p-6 rounded-lg min-h-[120px] flex items-center justify-center mb-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Team 2</h2>
              <ul>
                {lobby?.team2.players.map((player) => (
                  <li key={player.id}>{player.pseudo}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Join Buttons Row */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-6xl mb-6">
        <div className="flex justify-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-full"
            onClick={handleJoinTeam1}
          >
            Join Team 1
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-2 rounded-full"
            onClick={handleJoinObservers}
          >
            Join Obs
          </Button>
        </div>
        <div className="flex justify-center">
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2 rounded-full"
            onClick={handleJoinTeam2}
          >
            Join Team 2
          </Button>
        </div>
      </div>

      {/* Ready Button */}
      <div className="flex justify-center w-full max-w-6xl">
        <Button
          className="bg-slate-800 hover:bg-slate-700 text-white px-12 py-3 rounded-full text-lg"
          onClick={handleToggleReady}
        >
          Ready
        </Button>
      </div>
    </main>
  );
}
