/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as chat from "../chat.js";
import type * as currentSelection from "../currentSelection.js";
import type * as leaders from "../leaders.js";
import type * as lobbies from "../lobbies.js";
import type * as mapDraft from "../mapDraft.js";
import type * as maps from "../maps.js";
import type * as presets from "../presets.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  chat: typeof chat;
  currentSelection: typeof currentSelection;
  leaders: typeof leaders;
  lobbies: typeof lobbies;
  mapDraft: typeof mapDraft;
  maps: typeof maps;
  presets: typeof presets;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
