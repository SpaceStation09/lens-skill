"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy, useSignMessage, useWallets } from "@privy-io/react-auth";
import { ThemeFrame } from "@/components/theme/ThemeFrame";
import { SidebarPanel } from "@/components/theme/SidebarPanel";
import {
  fetchAvailableLensAccounts,
  fetchLastLoggedInLensAccount,
  loginToLens,
  logoutLensSession,
} from "@/lib/lens/service";
import { lensRuntimeConfig } from "@/lib/lens/config";
import { getProfileHref } from "@/lib/utils/profile-path";
import { useLensSession } from "@/providers/LensSessionProvider";

export function AuthPageShell() {
  if (!lensRuntimeConfig.privyAppId) {
    return (
        <ThemeFrame
          nav={[
          { label: "Profile", href: "/auth" },
          { label: "Write", href: "/compose" },
          { label: "Access", href: "/auth", active: true },
        ]}
        sidebarPanel={<SidebarPanel label="Access Layer" note="Add Privy and Lens app config to enable login." status="stub" />}
      >
        <section className="auth-hero">
          <p className="theme-kicker">Access</p>
          <h2>Configure Privy Before Using Live Auth</h2>
          <p>
            Add `NEXT_PUBLIC_PRIVY_APP_ID` and `NEXT_PUBLIC_LENS_APP_ADDRESS` in `.env.local`, then restart `npm run dev` to
            enable wallet connection and Lens login.
          </p>
        </section>
      </ThemeFrame>
    );
  }

  return <AuthPageShellWithPrivy />;
}

function AuthPageShellWithPrivy() {
  const router = useRouter();
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signMessage } = useSignMessage();
  const wallet = wallets[0] ?? null;
  const { activeProfile, hasActiveSession, activateLensSession, setActiveLensProfile, clearLensSessionState } = useLensSession();
  const [availableAccounts, setAvailableAccounts] = useState<Array<{ address: string; username?: string | null; name?: string | null; label: string }>>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [handle, setHandle] = useState("demo");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionLabel, setSessionLabel] = useState("No active Lens session");
  const [accountsStatus, setAccountsStatus] = useState<string | null>(null);

  useEffect(() => {
    if (hasActiveSession && activeProfile?.username) {
      setSessionLabel(`Lens session ready for @${activeProfile.username}`);
      return;
    }

    if (hasActiveSession && activeProfile?.address) {
      setSessionLabel(`Lens session ready for ${activeProfile.address}`);
      return;
    }

    setSessionLabel("No active Lens session");
  }, [activeProfile?.address, activeProfile?.username, hasActiveSession]);

  useEffect(() => {
    if (authenticated && hasActiveSession && activeProfile?.username) {
      router.replace(`/profile/${activeProfile.username}`);
    }
  }, [activeProfile?.username, authenticated, hasActiveSession, router]);

  useEffect(() => {
    let cancelled = false;

    async function loadAccounts() {
      if (!wallet?.address) {
        setAvailableAccounts([]);
        setSelectedAccount("");
        return;
      }

      setLoading(true);
      const [accounts, lastAccount] = await Promise.all([
        fetchAvailableLensAccounts(wallet.address),
        fetchLastLoggedInLensAccount(wallet.address),
      ]);

      if (cancelled) return;

      const options = (accounts.data ?? []).map((account) => ({
        address: account.address,
        username: account.username,
        name: account.name,
        label: account.name
          ? `@${account.username ?? account.address.slice(0, 8)} (${account.name})`
          : `@${account.username ?? account.address.slice(0, 8)}`,
      }));

      setAvailableAccounts(options);
      setSelectedAccount(lastAccount.data?.address ?? options[0]?.address ?? "");
      setAccountsStatus(
        accounts.success
          ? options.length
            ? `Found ${options.length} Lens profile${options.length > 1 ? "s" : ""}.`
            : "This wallet currently has no available Lens profile."
          : accounts.error?.message ?? "Failed to load Lens profiles.",
      );
      setLoading(false);
    }

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [wallet?.address]);

  async function handleLensLogin() {
    if (!wallet?.address) {
      setMessage("Connect a wallet first.");
      return;
    }

    setLoading(true);
    const result = await loginToLens({
      walletAddress: wallet.address,
      accountAddress: selectedAccount || undefined,
      signMessage: async (value) => {
        const response = await signMessage({ message: value }, { address: wallet.address });
        return response.signature;
      },
    });

    setLoading(false);

    if (!result.success || !result.data) {
      setMessage(result.error?.message ?? "Lens login failed.");
      return;
    }

    const lensSession = result.data;
    const matchedAccount = availableAccounts.find((account) => account.address === (selectedAccount || lensSession.accountAddress));

    if (matchedAccount) {
      const profile = {
        address: matchedAccount.address,
        username: matchedAccount.username ?? null,
        name: matchedAccount.name ?? null,
      };
      activateLensSession(profile);
      setSessionLabel(profile.username ? `Lens session ready for @${profile.username}` : `Lens session ready for ${profile.address}`);

      if (profile.username) {
        router.replace(`/profile/${profile.username}`);
        return;
      }
    }

    activateLensSession(
      lensSession.accountAddress
        ? {
            address: lensSession.accountAddress,
            username: null,
            name: null,
          }
        : null,
    );
    setSessionLabel(`Lens session ready for ${lensSession.accountAddress ?? "onboarding user"}`);
    setMessage(
      lensSession.accountAddress
        ? "Lens 登录已成功，正在使用当前账号会话。"
        : "Lens onboarding session created. Continue to account creation.",
    );
  }

  async function handleLogout() {
    await logout();
    await logoutLensSession();
    clearLensSessionState();
    setSessionLabel("No active Lens session");
    setMessage("Privy and Lens sessions cleared.");
  }

  return (
      <ThemeFrame
      nav={[
        { label: "Profile", href: getProfileHref(activeProfile?.username) },
        { label: "Write", href: "/compose" },
        { label: "Access", href: "/auth", active: true },
      ]}
      sidebarPanel={
        <SidebarPanel
          label="Access Layer"
          walletAddress={wallet?.address}
          lensAccount={
            activeProfile
              ? {
                  address: activeProfile.address,
                  username: activeProfile.username,
                }
              : undefined
          }
          note={sessionLabel}
          status={lensRuntimeConfig.privyAppId ? "ready" : "stub"}
        />
      }
    >
      <section className="auth-hero">
        <p className="theme-kicker">Access</p>
        <h2>Privy Wallet In, Lens Session Out</h2>
        <p>
          This page now uses Privy for wallet access and the Lens client for account discovery and login. To complete the
          full flow, add your Privy app id and Lens app address in `.env.local`.
        </p>
        <button type="button" className="solid-button auth-hero__button" onClick={() => login()} disabled={!ready}>
          {authenticated ? "Privy Session Ready" : "Sign In With Privy"}
        </button>
        <small>{sessionLabel}</small>
        <small>{authenticated ? `Wallet connected: ${wallet?.address ?? "waiting"}` : "Wallet not connected"}</small>
        <small>
          {activeProfile?.username
            ? `Active Lens account: @${activeProfile.username}`
            : activeProfile?.address
              ? `Active Lens account: ${activeProfile.address}`
              : "No active Lens account"}
        </small>
      </section>

      <section className="persona-grid" aria-label="Persona selection">
        <article className="persona-card">
          <h3>Select Existing Profile</h3>
          <p className="persona-card__wallet">{wallet?.address ?? "Authenticate with Privy to load wallet-managed Lens accounts."}</p>
          <label htmlFor="account">Available profile</label>
          <select id="account" value={selectedAccount} onChange={(event) => setSelectedAccount(event.target.value)}>
            <option value="">Continue as onboarding user</option>
            {availableAccounts.map((account) => (
              <option key={account.address} value={account.address}>
                {account.label}
              </option>
            ))}
          </select>
          <small>{accountsStatus ?? "Checking wallet-managed Lens profiles..."}</small>
          <button type="button" className="solid-button" disabled={loading || !wallet?.address} onClick={() => void handleLensLogin()}>
            {loading ? "Working..." : "Log In To Lens"}
          </button>
        </article>

        <article className="persona-card">
          <h3>Create New Profile</h3>
          <p>Onboarding login is live. Account creation still needs metadata upload wiring before it can submit onchain.</p>
          <label htmlFor="handle">Handle</label>
          <input id="handle" value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="writer-name" />
          <button
            type="button"
            className="solid-button"
            disabled={!wallet?.address || !handle.trim()}
            onClick={() => setMessage(`Onboarding is ready for @${handle.trim()}, but account creation metadata upload is not wired yet.`)}
          >
            Prepare Account Creation
          </button>
        </article>

        <article className="persona-card persona-card--ghost">
          <p>{message ?? "Sign in with Privy, choose a Lens account if one exists, then create or resume a Lens session."}</p>
          {authenticated ? (
            <button type="button" className="solid-button" onClick={() => void handleLogout()}>
              Log Out
            </button>
          ) : null}
        </article>
      </section>
    </ThemeFrame>
  );
}
