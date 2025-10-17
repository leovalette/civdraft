"use client";

import { useInitializeUser } from "@/hooks/useAdmin";

/**
 * UserInitializer Component
 *
 * This component initializes the user in the database on first sign-in.
 * It must be placed inside ClerkProvider and ConvexClientProvider.
 *
 * It runs the useInitializeUser hook which:
 * 1. Gets the current user from Clerk
 * 2. Checks if they exist in the Convex database
 * 3. Creates a new user record if they don't exist
 * 4. Updates their email if it changed
 */
export function UserInitializer() {
  useInitializeUser();
  return null; // This component doesn't render anything
}
