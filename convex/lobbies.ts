import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"

export const create = mutation({
  args: {
    team1Name: v.string(),
    team2Name: v.string(),
    autoBannedLeaderIds: v.array(v.id("leaders")),
    numberOfBansFirstRotation: v.optional(v.number()),
    numberOfBansSecondRotation: v.optional(v.number()),
    numberOfPicksFirstRotation: v.optional(v.number()),
    numberOfPicksSecondRotation: v.optional(v.number()),
    mapIds: v.optional(v.array(v.id("maps"))),
    mapDraft: v.boolean(),
  },
  handler: async (
    ctx,
    {
      team1Name,
      team2Name,
      autoBannedLeaderIds,
      numberOfBansFirstRotation,
      numberOfBansSecondRotation,
      numberOfPicksFirstRotation,
      numberOfPicksSecondRotation,
      mapIds,
      mapDraft
    },
  ) => {
    const finalMapIds: Id<"maps">[] =
      mapIds ??
      (await ctx.db
        .query("maps")
        .collect()
        .then((maps) => maps.map((m) => m._id)))
    return await ctx.db.insert("lobbies", {
      status: "LOBBY",
      team1: {
        name: team1Name,
        selectedLeaders: [],
        bannedLeaders: [],
        bannedMaps: [],
        players: [],
        isReady: false,
      },
      team2: {
        name: team2Name,
        selectedLeaders: [],
        bannedLeaders: [],
        bannedMaps: [],
        players: [],
        isReady: false,
      },
      observers: [],
      autoBannedLeaderIds,
      numberOfBansFirstRotation: numberOfBansFirstRotation ?? 10,
      numberOfBansSecondRotation: numberOfBansSecondRotation ?? 4,
      numberOfPicksFirstRotation: numberOfPicksFirstRotation ?? 4,
      numberOfPicksSecondRotation: numberOfPicksSecondRotation ?? 4,
      mapIds: finalMapIds,
      bannedMapIds: [],
      draftStatus: mapDraft ? {
        type: "MAPBAN",
        index: 1,
      } : {
        type: "BAN",
        index: 1
      },
    })
  },
})

export const joinObservers = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    playerPseudo: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, { lobbyId, playerPseudo, playerId }) => {
    const lobby = await ctx.db.get(lobbyId)
    if (!lobby) {
      throw new Error("Lobby not found")
    }

    if (lobby.observers.find(({ id }) => id === playerId)) {
      return
    }

    await ctx.db.patch(lobbyId, {
      team1: {
        ...lobby.team1,
        players: lobby.team1.players.filter(({ id }) => id !== playerId),
      },
      team2: {
        ...lobby.team2,
        players: lobby.team2.players.filter(({ id }) => id !== playerId),
      },
      observers: [...lobby.observers, { id: playerId, pseudo: playerPseudo }],
    })
  },
})

export const joinTeam1 = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    playerPseudo: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, { lobbyId, playerPseudo, playerId }) => {
    const lobby = await ctx.db.get(lobbyId)
    if (!lobby) {
      throw new Error("Lobby not found")
    }
    if (lobby.team1.players.find(({ id }) => id === playerId)) {
      return
    }
    await ctx.db.patch(lobbyId, {
      team1: {
        ...lobby.team1,
        players: [
          ...lobby.team1.players,
          { id: playerId, pseudo: playerPseudo },
        ],
      },
      team2: {
        ...lobby.team2,
        players: lobby.team2.players.filter(({ id }) => id !== playerId),
      },
      observers: lobby.observers.filter(({ id }) => id !== playerId),
    })
  },
})

export const joinTeam2 = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    playerPseudo: v.string(),
    playerId: v.string(),
  },
  handler: async (ctx, { lobbyId, playerPseudo, playerId }) => {
    const lobby = await ctx.db.get(lobbyId)
    if (!lobby) {
      throw new Error("Lobby not found")
    }
    if (lobby.team2.players.find(({ id }) => id === playerId)) {
      return
    }
    await ctx.db.patch(lobbyId, {
      team2: {
        ...lobby.team2,
        players: [
          ...lobby.team2.players,
          { id: playerId, pseudo: playerPseudo },
        ],
      },
      team1: {
        ...lobby.team1,
        players: lobby.team1.players.filter(({ id }) => id !== playerId),
      },
      observers: lobby.observers.filter(({ id }) => id !== playerId),
    })
  },
})

export const renamePlayer = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    playerId: v.string(),
    newPseudo: v.string(),
  },
  handler: async (ctx, { lobbyId, playerId, newPseudo }) => {
    const lobby = await ctx.db.get(lobbyId)
    if (!lobby) {
      throw new Error("Lobby not found")
    }

    await ctx.db.patch(lobbyId, {
      team1: {
        ...lobby.team1,
        players: lobby.team1.players.map((p) =>
          p.id === playerId ? { ...p, pseudo: newPseudo } : p,
        ),
      },
      team2: {
        ...lobby.team2,
        players: lobby.team2.players.map((p) =>
          p.id === playerId ? { ...p, pseudo: newPseudo } : p,
        ),
      },
      observers: lobby.observers.map((p) =>
        p.id === playerId ? { ...p, pseudo: newPseudo } : p,
      ),
    })
  },
})

export const toggleTeamReady = mutation({
  args: {
    lobbyId: v.id("lobbies"),
    playerId: v.string(),
  },
  handler: async (ctx, { lobbyId, playerId }) => {
    const lobby = await ctx.db.get(lobbyId)
    if (!lobby) {
      throw new Error("Lobby not found")
    }

    const isPlayerInTeam1 = lobby.team1.players.find(
      ({ id }) => id === playerId,
    )
    const isPlayerInTeam2 = lobby.team2.players.find(
      ({ id }) => id === playerId,
    )
    if (!isPlayerInTeam1 && !isPlayerInTeam2) {
      throw new Error("Player not in any team")
    }

    await ctx.db.patch(lobbyId, {
      team1: isPlayerInTeam1
        ? { ...lobby.team1, isReady: !lobby.team1.isReady }
        : { ...lobby.team1 },
      team2: isPlayerInTeam2
        ? { ...lobby.team2, isReady: !lobby.team2.isReady }
        : { ...lobby.team2 },
    })
  },
})

export const get = query({
  args: {
    lobbyId: v.id("lobbies"),
  },
  handler: async (ctx, { lobbyId }) => {
    return await ctx.db.get(lobbyId)
  },
})
