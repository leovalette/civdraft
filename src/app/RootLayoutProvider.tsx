"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ComponentType, ReactNode } from "react";
import { UserInitializer } from "@/components/UserInitializer";
import ConvexClientProvider from "./ConvexClientProvider";
import LeadersMapsProvider from "./LeadersMapsProvider";

const ClerkProviderComponent = ClerkProvider as unknown as ComponentType<{
  children: ReactNode;
}>;

export function RootLayoutProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProviderComponent>
      <ConvexClientProvider>
        <LeadersMapsProvider>
          <UserInitializer />
          {children}
        </LeadersMapsProvider>
      </ConvexClientProvider>
    </ClerkProviderComponent>
  );
}
