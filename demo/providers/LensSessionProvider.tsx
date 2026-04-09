"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { AccountView } from "@/lib/lens/contracts";
import { requireActiveLensProfile, resumeLensSession } from "@/lib/lens/service";

type LensSessionContextValue = {
  activeProfile: AccountView | null;
  hasActiveSession: boolean;
  status: "loading" | "ready";
  refreshLensSession: () => Promise<void>;
  activateLensSession: (profile: AccountView | null) => void;
  setActiveLensProfile: (profile: AccountView | null) => void;
  clearLensSessionState: () => void;
};

const LensSessionContext = createContext<LensSessionContextValue | null>(null);

const emptyValue: LensSessionContextValue = {
  activeProfile: null,
  hasActiveSession: false,
  status: "ready",
  refreshLensSession: async () => {},
  activateLensSession: () => {},
  setActiveLensProfile: () => {},
  clearLensSessionState: () => {},
};

export function LensSessionFallbackProvider({ children }: Readonly<{ children: ReactNode }>) {
  return <LensSessionContext.Provider value={emptyValue}>{children}</LensSessionContext.Provider>;
}

export function LensSessionProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { ready } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0] ?? null;
  const [activeProfile, setActiveProfile] = useState<AccountView | null>(null);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  const setActiveLensProfile = (profile: AccountView | null) => {
    setActiveProfile(profile);
  };

  const activateLensSession = (profile: AccountView | null) => {
    setActiveProfile(profile);
    setHasActiveSession(true);
    setStatus("ready");
  };

  const refreshLensSession = async () => {
    if (!ready) {
      setStatus("loading");
      return;
    }

    setStatus("loading");
    const resumed = await resumeLensSession();
    if (resumed.success && resumed.data?.accountAddress) {
      const profile = await requireActiveLensProfile();
      setActiveLensProfile(profile.success && profile.data ? profile.data : null);
      setHasActiveSession(true);
      setStatus("ready");
      return;
    }

    setActiveLensProfile(null);
    setHasActiveSession(false);
    setStatus("ready");
  };

  useEffect(() => {
    void refreshLensSession();
  }, [ready, wallet?.address]);

  const value = useMemo<LensSessionContextValue>(
    () => ({
      activeProfile,
      hasActiveSession,
      status,
      refreshLensSession,
      activateLensSession,
      setActiveLensProfile,
      clearLensSessionState: () => {
        setActiveLensProfile(null);
        setHasActiveSession(false);
        setStatus("ready");
      },
    }),
    [activeProfile, hasActiveSession, status],
  );

  return <LensSessionContext.Provider value={value}>{children}</LensSessionContext.Provider>;
}

export function useLensSession() {
  const context = useContext(LensSessionContext);
  if (!context) {
    throw new Error("useLensSession must be used within LensSessionProvider");
  }

  return context;
}
