"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { logoutLensSession } from "@/lib/lens/service";
import { lensRuntimeConfig } from "@/lib/lens/config";
import { useLensSession } from "@/providers/LensSessionProvider";

export function SidebarActions() {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated, logout } = usePrivy();
  const { clearLensSessionState } = useLensSession();
  const [busy, setBusy] = useState<null | "lens" | "wallet">(null);

  async function handleLogoutLens() {
    setBusy("lens");
    await logoutLensSession();
    clearLensSessionState();
    if (pathname !== "/auth") {
      router.push("/auth");
    }
    router.refresh();
    setBusy(null);
  }

  async function handleDisconnectWallet() {
    setBusy("wallet");
    await logoutLensSession();
    clearLensSessionState();
    await logout();
    if (pathname !== "/auth") {
      router.push("/auth");
    }
    router.refresh();
    setBusy(null);
  }

  if (!lensRuntimeConfig.privyAppId) {
    return null;
  }

  return (
    <div className="monolith-sidebar__actions">
      <button type="button" className="sidebar-action-button" onClick={() => void handleLogoutLens()} disabled={busy !== null}>
        {busy === "lens" ? "Logging Out..." : "Log Out Lens"}
      </button>
      <button
        type="button"
        className="sidebar-action-button sidebar-action-button--danger"
        onClick={() => void handleDisconnectWallet()}
        disabled={busy !== null || !authenticated}
      >
        {busy === "wallet" ? "Disconnecting..." : "Disconnect Wallet"}
      </button>
    </div>
  );
}
