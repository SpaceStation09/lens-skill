"use client";

import type { ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { LensAuthProvider } from "./LensAuthProvider";
import { LensAuthPrivyProvider } from "./LensAuthPrivyProvider";

const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

export function AppProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  if (!PRIVY_APP_ID) {
    return <LensAuthProvider>{children}</LensAuthProvider>;
  }

  return (
    <PrivyProvider appId={PRIVY_APP_ID}>
      <LensAuthPrivyProvider>{children}</LensAuthPrivyProvider>
    </PrivyProvider>
  );
}
