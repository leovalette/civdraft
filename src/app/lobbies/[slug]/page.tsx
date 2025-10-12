"use client"

import { useMutation, useQuery } from "convex/react"
import Image from "next/image"
import { use, useCallback, useEffect, useMemo, useState } from "react"
import { EditText, type onSaveProps } from "react-edit-text"
import { Tooltip } from "react-tooltip"
import { CivPrimaryButton } from "@/components/CivPrimaryButton"
import { Button } from "@/components/ui/button"
import { getUserId, getUserPseudo } from "@/lib/user"
import { api } from "../../../../convex/_generated/api"
import type { Id } from "../../../../convex/_generated/dataModel"

export default function LobbyPage({
  params,
}: {
  params: Promise<{ slug: Id<"lobbies"> }>
}) {
  const { slug: lobbyId } = use(params)
  const lobby = useQuery(api.lobbies.get, { lobbyId })
  const leaders = useQuery(api.leaders.get)
  const maps = useQuery(api.maps.getAll)

  const joinObservers = useMutation(api.lobbies.joinObservers)
  const joinTeam1 = useMutation(api.lobbies.joinTeam1)
  const joinTeam2 = useMutation(api.lobbies.joinTeam2)
  const toggleTeamReady = useMutation(api.lobbies.toggleTeamReady)
  const renamePlayer = useMutation(api.lobbies.renamePlayer)

  const autobans = useMemo(
    () =>
      leaders
        ?.filter((leader) => lobby?.autoBannedLeaderIds.includes(leader._id))
        .map((leader) => ({
          name: leader.name,
          src: `/leaders/${leader.imageName}`,
        })) ?? [],
    [leaders, lobby],
  )

  const mapsToDraft = useMemo(
    () =>
      maps?.map((map) => ({
        name: map.name,
        src: `/maps/${map.imageName}`,
      })) ?? [],
    [maps],
  )

  const [userPseudo, setUserPseudo] = useState("")
  const [userId, setUserId] = useState("")

  const handleJoinTeam1 = useCallback(() => {
    if (userId && userPseudo) {
      joinTeam1({
        lobbyId,
        playerPseudo: userPseudo,
        playerId: userId,
      })
    }
  }, [userId, userPseudo, lobbyId, joinTeam1])

  const handleJoinTeam2 = useCallback(() => {
    if (userId && userPseudo) {
      joinTeam2({
        lobbyId,
        playerPseudo: userPseudo,
        playerId: userId,
      })
    }
  }, [userId, userPseudo, lobbyId, joinTeam2])

  const handleJoinObservers = useCallback(() => {
    if (userId && userPseudo) {
      joinObservers({
        lobbyId,
        playerPseudo: userPseudo,
        playerId: userId,
      })
    }
  }, [userId, userPseudo, lobbyId, joinObservers])

  const handleToggleReady = useCallback(() => {
    if (userId) {
      toggleTeamReady({
        lobbyId,
        playerId: userId,
      })
    }
  }, [userId, lobbyId, toggleTeamReady])

  useEffect(() => {
    // Get or generate user identification on mount
    const pseudo = getUserPseudo()
    const id = getUserId()
    setUserPseudo(pseudo)
    setUserId(id)
    joinObservers({
      lobbyId,
      playerPseudo: pseudo,
      playerId: id,
    })
  }, [joinObservers, lobbyId])

  const getUrl = async () => {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
  }

  const onRenamePlayer = useCallback(
    ({ value }: onSaveProps) => {
      if (!lobby) {
        return
      }
      setUserPseudo(value)
      renamePlayer({ lobbyId: lobby._id, playerId: userId, newPseudo: value })
    },
    [lobby, renamePlayer, userId],
  )

  const showPlayerPseudo = (player: { id: string; pseudo: string }) => {
    if (player.id === userId) {
      return (
        <div
          key={player.id}
          className={`border-b border-border p-4 font-extrabold text-text-validation underline`}
        >
          <EditText
            className={`inline-block`}
            showEditButton
            name="editMyPseudo"
            editButtonProps={{ style: { marginLeft: "4px", width: 16 } }}
            defaultValue={player.pseudo}
            onSave={onRenamePlayer}
          />
        </div>
      )
    } else {
      return (
        <div key={player.id} className="border-b border-border p-4">
          {player.pseudo}
        </div>
      )
    }
  }

  return (
    <div className="flex h-screen w-10/12 flex-col text-white">
      <div className="mt-9 flex w-full justify-center p-4">
        <CivPrimaryButton onClick={getUrl}>Get draft url</CivPrimaryButton>
      </div>
      <div className="grid w-full grid-cols-3 gap-4">
        <div className="mb-2 flex h-5 justify-center text-xl font-extrabold uppercase text-ready">
          {lobby?.team1.isReady ? (
            <span className="relative inline-block">
              <span className="bg-green-400 absolute inline-flex h-3 w-3 animate-ping rounded-full opacity-75"></span>
              <span className="relative">
                {`${lobby?.team1.name}`} is ready!
              </span>
            </span>
          ) : (
            ""
          )}
        </div>
        <div></div>
        <div className="flex h-5 justify-center text-xl font-extrabold uppercase text-ready">
          {lobby?.team2.isReady ? (
            <span className="relative inline-block">
              <span className="bg-green-400 absolute inline-flex h-3 w-3 animate-ping rounded-full opacity-75"></span>
              <span className="relative">
                {`${lobby?.team2.name}`} is ready!
              </span>
            </span>
          ) : (
            ""
          )}
        </div>
        <div className="w-full rounded-md border-2 border-border bg-team1">
          {lobby?.team1.players.map((player) => showPlayerPseudo(player))}
        </div>
        <div className="w-full rounded-md border-2 border-background-dark bg-selection">
          {lobby?.observers.map((player) => showPlayerPseudo(player))}
        </div>
        <div className="w-full rounded-md border-2 border-border bg-team2">
          {lobby?.team2.players.map((player) => showPlayerPseudo(player))}
        </div>
        <div className="mt-2 flex justify-center">
          <div className="border-2 border-golden-border bg-bg-golden-border">
            <button
              type="button"
              className="h-8 rounded-2xl border-2 border-golden-border bg-team1 px-8 font-extrabold text-text-validation hover:bg-hover-team1"
              onClick={handleJoinTeam1}
            >
              {`Join ${lobby?.team1.name}`}
            </button>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <div className="border-2 border-golden-border bg-bg-golden-border">
            <button
              type="button"
              className="h-8 rounded-2xl border-2 border-golden-border bg-selection px-8 font-extrabold text-text-validation hover:bg-hover-selection"
              onClick={handleJoinObservers}
            >
              Join Obs
            </button>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <div className="border-2 border-golden-border bg-bg-golden-border">
            <button
              type="button"
              className="h-8 rounded-2xl border-2 border-golden-border bg-team2 px-8 font-extrabold text-text-validation hover:bg-hover-team2"
              onClick={handleJoinTeam2}
            >
              {`Join ${lobby?.team2.name}`}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center p-4">
        <Button onClick={handleToggleReady}>Ready</Button>
      </div>
      <div className="mt-6 flex justify-center">
        {lobby?.autoBannedLeaderIds && (
          <div className="custom-bg">
            <div className="flex justify-center rounded-t-lg text-lg font-semibold">
              Autoban civ
            </div>
            <div className="flex justify-center gap-4">
              {autobans.map((leader) => (
                <Image
                  key={leader.name}
                  src={leader.src}
                  className="h-12 w-12"
                  alt="leader-image"
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-center">
        {lobby?.withMapDraft && (
          <div className="custom-bg">
            <div className="flex justify-center rounded-t-lg text-lg font-semibold">
              Draft map
            </div>
            <div className="flex justify-center gap-4">
              {mapsToDraft.map((map) => (
                <Image
                  key={map.name}
                  src={map.src}
                  className="h-12 w-12"
                  alt="map-image"
                  data-tooltip-id={map.name}
                  data-tooltip-content={map.name}
                />
              ))}
              {mapsToDraft.map((map) => (
                <Tooltip key={map.name} id={map.name} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
