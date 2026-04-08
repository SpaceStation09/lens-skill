"use client";

import { createContext, useContext } from "react";
import type { AuthSessionView } from "../lib/lens/contracts";

export type AuthContextValue = {
  session: AuthSessionView | null;
  connectedWallet: string | null;
  walletChecking: boolean;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  login: (handle?: string, accountAddress?: string) => Promise<void>;
  logoutLens: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useLensAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useLensAuth must be used inside Lens auth provider.");
  }
  return context;
}
