"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useIsAdmin } from "@/hooks/useAdmin";

export default function Admin() {
  const router = useRouter();
  const isAdmin = useIsAdmin();

  useEffect(() => {
    // If user is not admin, redirect to home
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  // Show nothing while checking admin status
  if (isAdmin !== true) {
    return null;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
    </div>
  );
}
