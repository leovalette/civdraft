import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";

/**
 * Hook to check if current user is an admin
 */
export const useIsAdmin = () => {
  const isAdmin = useQuery(api.admin.isAdmin);
  return isAdmin ?? false;
};

/**
 * Hook to get current user info
 */
export const useCurrentUser = () => {
  return useQuery(api.admin.getCurrentUser);
};

/**
 * Hook to initialize user in database on first sign-in
 */
export const useInitializeUser = () => {
  const { user, isLoaded } = useUser();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

  useEffect(() => {
    if (isLoaded && user?.id && user?.primaryEmailAddress?.emailAddress) {
      createOrUpdateUser({
        clerkId: user.id,
        email: user.primaryEmailAddress.emailAddress,
      }).catch((error) => {
        console.error("Error initializing user:", error);
      });
    }
  }, [
    isLoaded,
    user?.id,
    user?.primaryEmailAddress?.emailAddress,
    createOrUpdateUser,
  ]);
};
