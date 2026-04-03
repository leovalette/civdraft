import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes - require authentication
  if (isAdminRoute(req)) {
    const { userId } = await auth();

    // If not authenticated, redirect to sign-in
    if (!userId) {
      const { redirectToSignIn } = await auth();
      return redirectToSignIn();
    }

    // Note: Role check will happen on the client side in the AdminPanel component
    // This ensures the token is available for the Convex query
  }
});

export const config = {
  matcher: [
    // Only run middleware on admin routes — the only routes that need server-side auth.
    // All other routes use client-side Clerk auth via ClerkProvider.
    // This dramatically reduces Vercel Fluid Compute usage on the Hobby plan.
    "/admin(.*)",
  ],
};
