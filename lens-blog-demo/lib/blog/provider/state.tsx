"use client";

import * as React from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { createLensService } from "@/lib/blog/services/lens-service";
import {
  AccountState,
  AuthSession,
  CreatedAccount,
  LensService,
  UsernameAvailability,
  WalletAccountOption,
} from "@/lib/blog/types";
import { fallbackAccountState, normalizeHandle, toUiMessage } from "@/lib/blog/provider/actions";

type BlogContextValue = {
  lensService: LensService;
  accountState: AccountState;
  walletAddress?: string;
  session: AuthSession | null;
  activeHandle: string;
  activeAccountAddress?: string;
  accounts: WalletAccountOption[];
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;
  createUsername: string;
  setCreateUsername: (value: string) => void;
  isCheckingUsername: boolean;
  isCreatingAccount: boolean;
  usernameCheckMessage?: string;
  status?: string;
  connectWalletNode?: React.ReactNode;
  refreshWalletAccounts: () => Promise<void>;
  loginLens: (accountAddress: string) => Promise<AuthSession | null>;
  createLensAccount: (username: string) => Promise<CreatedAccount | null>;
  canCreateUsername: (username: string) => Promise<UsernameAvailability | null>;
  resetLensAuth: () => Promise<void>;
};

const BlogContext = React.createContext<BlogContextValue | null>(null);

export function useBlog() {
  const context = React.useContext(BlogContext);
  if (!context) {
    throw new Error("useBlog must be used within BlogProvider");
  }
  return context;
}

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const { address: wagmiAddress, isConnected } = useAccount();
  const walletsRef = React.useRef(wallets);

  React.useEffect(() => {
    walletsRef.current = wallets;
  }, [wallets]);

  const resolveEthereumProvider = React.useCallback(async (ownerAddress: string) => {
    const normalized = (ownerAddress || "").toLowerCase();
    const selected =
      walletsRef.current.find((wallet) => wallet.address?.toLowerCase() === normalized) || walletsRef.current[0];

    if (!selected) return undefined;
    return selected.getEthereumProvider();
  }, []);

  const lensService = React.useMemo(
    () =>
      createLensService({
        resolveEthereumProvider,
      }),
    [resolveEthereumProvider],
  );

  const walletAddress = React.useMemo(() => {
    return (user?.wallet?.address || wagmiAddress || wallets[0]?.address || "").trim() || undefined;
  }, [user?.wallet?.address, wagmiAddress, wallets]);

  const [accountState, setAccountState] = React.useState<AccountState>("disconnected");
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [activeHandle, setActiveHandle] = React.useState("");
  const [activeAccountAddress, setActiveAccountAddress] = React.useState<string>();
  const [accounts, setAccounts] = React.useState<WalletAccountOption[]>([]);
  const [selectedAccount, setSelectedAccount] = React.useState("");
  const [createUsername, setCreateUsername] = React.useState("");
  const [isCheckingUsername, setIsCheckingUsername] = React.useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = React.useState(false);
  const [usernameCheckMessage, setUsernameCheckMessage] = React.useState<string>();
  const [status, setStatus] = React.useState<string>();

  const connectWalletNode = React.useMemo(() => {
    return (
      <>
        {!ready ? (
          <button className="lb-btn" disabled>
            Wallet Loading...
          </button>
        ) : null}

        {ready && !walletAddress ? (
          <button className="lb-btn" onClick={() => login()}>
            Connect Wallet
          </button>
        ) : null}

        {ready && walletAddress ? (
          <button
            className="lb-btn lb-btn-soft"
            onClick={() => {
              if (authenticated) {
                void logout();
              }
            }}
          >
            Disconnect
          </button>
        ) : null}
      </>
    );
  }, [authenticated, login, logout, ready, walletAddress]);

  const refreshWalletAccounts = React.useCallback(async () => {
    if (!walletAddress) {
      setAccounts([]);
      setSelectedAccount("");
      return;
    }

    const list = await lensService.listWalletAccounts(walletAddress);
    setAccounts(list);
    setSelectedAccount((prev) => prev || list[0]?.address || "");
  }, [lensService, walletAddress]);

  const setFromSession = React.useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);

    if (!nextSession) {
      setActiveHandle("");
      setActiveAccountAddress(undefined);
      return;
    }

    setActiveHandle(nextSession.handle || "");
    setActiveAccountAddress(nextSession.accountAddress);
  }, []);

  const loginLens = React.useCallback(
    async (accountAddress: string): Promise<AuthSession | null> => {
      if (!walletAddress) {
        setAccountState("disconnected");
        setStatus("请先连接钱包");
        return null;
      }

      try {
        const next = await lensService.loginWithAccount({ ownerAddress: walletAddress, accountAddress });
        setFromSession(next);
        setAccountState("authenticated");
        setStatus(`Lens 登录成功：@${next.handle || "account"}`);
        return next;
      } catch (error) {
        setAccountState(fallbackAccountState(walletAddress));
        setStatus(toUiMessage(error));
        return null;
      }
    },
    [lensService, setFromSession, walletAddress],
  );

  const canCreateUsername = React.useCallback(
    async (username: string) => {
      setIsCheckingUsername(true);
      setUsernameCheckMessage(undefined);
      try {
        const result = await lensService.canCreateUsername({ username: normalizeHandle(username) });
        setUsernameCheckMessage(result.available ? `用户名可用：@${result.normalizedUsername}` : result.reason || "用户名不可用");
        return result;
      } catch (error) {
        setUsernameCheckMessage(toUiMessage(error));
        return null;
      } finally {
        setIsCheckingUsername(false);
      }
    },
    [lensService],
  );

  const createLensAccount = React.useCallback(
    async (username: string): Promise<CreatedAccount | null> => {
      if (!walletAddress) {
        setStatus("请先连接钱包");
        return null;
      }

      setIsCreatingAccount(true);
      try {
        const next = await lensService.createAccountWithUsername({
          ownerAddress: walletAddress,
          username: normalizeHandle(username),
        });

        setFromSession(null);
        setAccountState("wallet_connected_unauthed");
        await refreshWalletAccounts();
        setSelectedAccount(next.accountAddress);
        setStatus(`账号已创建：@${next.handle || username}。请点击 Continue 完成 Lens 登录`);
        return next;
      } catch (error) {
        setAccountState(fallbackAccountState(walletAddress));
        setStatus(toUiMessage(error));
        return null;
      } finally {
        setIsCreatingAccount(false);
      }
    },
    [lensService, refreshWalletAccounts, setFromSession, walletAddress],
  );

  const resetLensAuth = React.useCallback(async () => {
    await lensService.resetAuth();
    setFromSession(null);
    setAccountState(fallbackAccountState(walletAddress));
    setStatus("已清空 Lens 会话");
  }, [lensService, setFromSession, walletAddress]);

  React.useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function bootstrap() {
      const isWalletConnected = Boolean(walletAddress || isConnected);
      if (!isWalletConnected) {
        try {
          await lensService.resetAuth();
        } catch {
          // Ignore reset failures and still force local fallback state.
        }
        setFromSession(null);
        setAccountState("disconnected");
        setAccounts([]);
        setSelectedAccount("");
        return;
      }

      const resumed = await lensService.resumeSession();
      if (cancelled) return;

      if (resumed) {
        setFromSession(resumed);
        setAccountState("authenticated");
      } else {
        setFromSession(null);
        setAccountState("wallet_connected_unauthed");
      }

      await refreshWalletAccounts();
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [isConnected, lensService, ready, refreshWalletAccounts, setFromSession, walletAddress]);

  const value = React.useMemo<BlogContextValue>(
    () => ({
      lensService,
      accountState,
      walletAddress,
      session,
      activeHandle,
      activeAccountAddress,
      accounts,
      selectedAccount,
      setSelectedAccount,
      createUsername,
      setCreateUsername,
      isCheckingUsername,
      isCreatingAccount,
      usernameCheckMessage,
      status,
      connectWalletNode,
      refreshWalletAccounts,
      loginLens,
      createLensAccount,
      canCreateUsername,
      resetLensAuth,
    }),
    [
      lensService,
      accountState,
      walletAddress,
      session,
      activeHandle,
      activeAccountAddress,
      accounts,
      selectedAccount,
      createUsername,
      isCheckingUsername,
      isCreatingAccount,
      usernameCheckMessage,
      status,
      connectWalletNode,
      refreshWalletAccounts,
      loginLens,
      createLensAccount,
      canCreateUsername,
      resetLensAuth,
    ],
  );

  return <BlogContext.Provider value={value}>{children}</BlogContext.Provider>;
}
