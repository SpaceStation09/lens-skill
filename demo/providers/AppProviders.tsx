"use client";

import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { lensRuntimeConfig } from "@/lib/lens/config";
import { LensSessionFallbackProvider, LensSessionProvider } from "@/providers/LensSessionProvider";

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  if (!lensRuntimeConfig.privyAppId) {
    return <LensSessionFallbackProvider>{children}</LensSessionFallbackProvider>;
  }

  return (
    <PrivyProvider appId={lensRuntimeConfig.privyAppId}>
      <LensSessionProvider>{children}</LensSessionProvider>
    </PrivyProvider>
  );
}
