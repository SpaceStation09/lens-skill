"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import type { AuthSessionView } from "../lib/lens/contracts";
import { currentSession, loginOrCreate, logout } from "../lib/lens/browser-client";
import { AuthContext } from "./lens-auth-context";

export function LensAuthPrivyProvider({ children }: { children: ReactNode }) {
  const { ready, login: openLogin, logout: privyLogout } = usePrivy();
  const { wallets } = useWallets();

  const [session, setSession] = useState<AuthSessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const connectedWallet = wallets[0]?.address ?? null;

  useEffect(() => {
    let active = true;
    async function hydrate() {
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
    if (!ready) {
      setError("Privy is not ready yet.");
      return;
    }
    openLogin();
  }, [ready, openLogin]);

  const login = useCallback(
    async (handle?: string, accountAddress?: string) => {
      setError(null);
      const wallet = wallets[0];
      if (!wallet) {
        setError("Connect wallet first.");
        return;
      }

      const result = await loginOrCreate(handle, {
        walletAddress: wallet.address,
        signMessage: wallet.sign,
        getEthereumProvider: wallet.getEthereumProvider,
      }, accountAddress);

      if (!result.success || !result.data) {
        setError(result.error?.message ?? "Failed to login.");
        return;
      }

      setSession(result.data);
    },
    [wallets],
  );

  const logoutLens = useCallback(async () => {
    await logout();
    setSession(null);
  }, []);

  const disconnectWallet = useCallback(async () => {
    await logout();
    await privyLogout();
    setSession(null);
  }, [privyLogout]);

  const signOut = useCallback(async () => {
    await disconnectWallet();
  }, [disconnectWallet]);

  const value = useMemo(
    () => ({
      session,
      connectedWallet,
      walletChecking: !ready,
      loading,
      error,
      connect,
      login,
      logoutLens,
      disconnectWallet,
      signOut,
    }),
    [session, connectedWallet, ready, loading, error, connect, login, logoutLens, disconnectWallet, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
