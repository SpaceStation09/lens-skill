"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type {
  AccountState,
  AuthSession,
  CreateAccountResult,
  LensService,
  WalletAccountOption,
} from "../types";

type BlogKernelContextValue = {
  accountState: AccountState;
  session: AuthSession | null;
  accounts: WalletAccountOption[];
  bootstrap: (isWalletConnected: boolean) => Promise<void>;
  refreshAccounts: (ownerAddress: string) => Promise<void>;
  loginLens: (input: { ownerAddress: string; accountAddress: string }) => Promise<void>;
  createLensAccount: (input: {
    ownerAddress: string;
    username: { localName: string; namespace?: string };
  }) => Promise<CreateAccountResult>;
  logoutLens: (isWalletConnected: boolean) => Promise<void>;
  resetAuth: (isWalletConnected: boolean) => Promise<void>;
};

const BlogKernelContext = createContext<BlogKernelContextValue | null>(null);

function fallbackState(isWalletConnected: boolean): AccountState {
  return isWalletConnected ? "wallet_connected_unauthed" : "disconnected";
}

export function BlogKernelProvider(props: {
  lensService: LensService;
  children: React.ReactNode;
}) {
  const [accountState, setAccountState] = useState<AccountState>("disconnected");
  const [session, setSession] = useState<AuthSession | null>(null);
  const [accounts, setAccounts] = useState<WalletAccountOption[]>([]);

  async function bootstrap(isWalletConnected: boolean) {
    try {
      const resumed = await props.lensService.resumeSession();
      if (resumed) {
        setSession(resumed);
        setAccountState("authenticated");
        return;
      }
      setSession(null);
      setAccountState(fallbackState(isWalletConnected));
    } catch {
      setSession(null);
      setAccountState(fallbackState(isWalletConnected));
    }
  }

  async function refreshAccounts(ownerAddress: string) {
    const items = await props.lensService.listWalletAccounts(ownerAddress);
    setAccounts(items);
  }

  async function loginLens(input: { ownerAddress: string; accountAddress: string }) {
    const next = await props.lensService.loginWithAccount(input);
    setSession(next);
    setAccountState("authenticated");
  }

  async function createLensAccount(input: {
    ownerAddress: string;
    username: { localName: string; namespace?: string };
  }) {
    const result = await props.lensService.createAccountWithUsername(input);
    setSession(null);
    setAccountState("wallet_connected_unauthed");
    return result;
  }

  async function logoutLens(isWalletConnected: boolean) {
    await props.lensService.logout();
    setSession(null);
    setAccountState(fallbackState(isWalletConnected));
  }

  async function resetAuth(isWalletConnected: boolean) {
    await props.lensService.resetAuth();
    setSession(null);
    setAccountState(fallbackState(isWalletConnected));
  }

  useEffect(() => {
    void bootstrap(false);
    // caller should rerun bootstrap with actual wallet status after wallet client is ready
  }, []);

  const value = useMemo<BlogKernelContextValue>(
    () => ({
      accountState,
      session,
      accounts,
      bootstrap,
      refreshAccounts,
      loginLens,
      createLensAccount,
      logoutLens,
      resetAuth,
    }),
    [accountState, session, accounts]
  );

  return <BlogKernelContext.Provider value={value}>{props.children}</BlogKernelContext.Provider>;
}

export function useBlogKernel() {
  const ctx = useContext(BlogKernelContext);
  if (!ctx) {
    throw new Error("useBlogKernel must be used inside BlogKernelProvider");
  }
  return ctx;
}
