"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthSessionView } from "../lib/lens/contracts";
import {
  connectWallet,
  currentSession,
  disconnectWalletSession,
  loginOrCreate,
  logout,
} from "../lib/lens/browser-client";
import { AuthContext } from "./lens-auth-context";

export function LensAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionView | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const storedWallet = window.localStorage.getItem("lens.demo.connectedWallet");
      if (active) setConnectedWallet(storedWallet);

      const result = await currentSession();
      if (!active) return;

      if (result.success && result.data) {
        setSession(result.data);
      }
      setLoading(false);
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const result = await connectWallet();
    if (!result.success || !result.data) {
      setError(result.error?.message ?? "Failed to connect wallet.");
      return;
    }
    setConnectedWallet(result.data.address);
  }, []);

  const login = useCallback(async (handle?: string, accountAddress?: string) => {
    setError(null);
    const result = await loginOrCreate(handle, undefined, accountAddress);
    if (!result.success || !result.data) {
      setError(result.error?.message ?? "Failed to login.");
      return;
    }
    setSession(result.data);
  }, []);

  const logoutLens = useCallback(async () => {
    await logout();
    setSession(null);
  }, []);

  const disconnectWallet = useCallback(async () => {
    await disconnectWalletSession();
    setSession(null);
    setConnectedWallet(null);
  }, []);

  const signOut = useCallback(async () => {
    await disconnectWallet();
  }, [disconnectWallet]);

  const value = useMemo(
    () => ({
      session,
      connectedWallet,
      walletChecking: false,
      loading,
      error,
      connect,
      login,
      logoutLens,
      disconnectWallet,
      signOut,
    }),
    [session, connectedWallet, loading, error, connect, login, logoutLens, disconnectWallet, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
