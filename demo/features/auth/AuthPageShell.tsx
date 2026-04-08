"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthTemplate } from "../../../skills/blog-frontend/assets/themes/default/templates/AuthTemplate";
import { createLensAccount, getAccountsAvailable } from "../../lib/lens/browser-client";
import type { AccountView } from "../../lib/lens/contracts";
import { useLensAuth } from "../../providers/lens-auth-context";

export function AuthPageShell() {
  const router = useRouter();
  const {
    session,
    connectedWallet,
    walletChecking,
    loading,
    error,
    connect,
    login,
    logoutLens,
    disconnectWallet,
  } = useLensAuth();
  const [handle, setHandle] = useState("demo");
  const [availableAccounts, setAvailableAccounts] = useState<AccountView[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  useEffect(() => {
    let active = true;
    async function loadAccounts() {
      if (!connectedWallet) {
        setAvailableAccounts([]);
        setSelectedAccount("");
        return;
      }
      setAccountsLoading(true);
      const result = await getAccountsAvailable(connectedWallet);
      if (!active) return;
      const items = result.success && result.data ? result.data : [];
      setAvailableAccounts(items);
      if (items[0]) {
        setSelectedAccount(items[0].address);
        if (items[0].username) setHandle(items[0].username);
      }
      setAccountsLoading(false);
    }
    void loadAccounts();
    return () => {
      active = false;
    };
  }, [connectedWallet]);

  useEffect(() => {
    if (loading || !session) return;
    router.replace(`/profile/${session.handle ?? handle}`);
  }, [loading, session, handle, router]);

  const sessionLabel = useMemo(() => {
    if (loading) return "Restoring session...";
    if (!session) return "No active session.";
    return `Logged in: ${session.accountAddress ?? "unknown account"}`;
  }, [loading, session]);

  return (
    <AuthTemplate
      connectedWallet={connectedWallet}
      sessionLabel={sessionLabel}
      handle={handle}
      selectedAccount={selectedAccount}
      availableAccounts={availableAccounts.map((account) => ({
        address: account.address,
        label: account.username ? `@${account.username}` : account.address,
      }))}
      accountsLoading={accountsLoading}
      creating={creating}
      createFeedback={createFeedback}
      error={error}
      isAuthenticated={Boolean(session)}
      profileHref={session?.handle ? `/profile/${session.handle}` : "/auth"}
      walletChecking={walletChecking}
      lensHandle={session?.handle ?? null}
      lensAccountAddress={session?.accountAddress ?? null}
      onConnect={() => void connect()}
      onLogin={() => void login(handle, selectedAccount || undefined)}
      onCreate={() => {
        void (async () => {
          setCreating(true);
          setCreateFeedback(null);
          await login(handle);
          const created = await createLensAccount(handle);
          if (!created.success || !created.data) {
            setCreateFeedback(created.error?.message ?? "Create account failed.");
            setCreating(false);
            return;
          }
          setSelectedAccount(created.data.address);
          if (created.data.username) setHandle(created.data.username);
          await login(created.data.username ?? handle, created.data.address);
          if (connectedWallet) {
            const refreshed = await getAccountsAvailable(connectedWallet);
            if (refreshed.success && refreshed.data) setAvailableAccounts(refreshed.data);
          }
          setCreateFeedback("Lens account created successfully.");
          setCreating(false);
        })();
      }}
      onLogoutLens={() => void logoutLens()}
      onDisconnectWallet={() => void disconnectWallet()}
      onHandleChange={setHandle}
      onSelectedAccountChange={(value) => {
        setSelectedAccount(value);
        const picked = availableAccounts.find((item) => item.address === value);
        if (picked?.username) setHandle(picked.username);
      }}
    />
  );
}
