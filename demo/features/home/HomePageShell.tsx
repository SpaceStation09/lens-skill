"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ThemeFrame } from "@/components/theme/ThemeFrame";
import { SidebarPanel } from "@/components/theme/SidebarPanel";
import { lensRuntimeConfig } from "@/lib/lens/config";
import { getProfileHref } from "@/lib/utils/profile-path";
import { useLensSession } from "@/providers/LensSessionProvider";

export function HomePageShell() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const wallet = wallets[0] ?? null;
  const [status, setStatus] = useState("Checking session...");
  const { activeProfile, hasActiveSession, status: lensStatus } = useLensSession();

  useEffect(() => {
    if (!ready || lensStatus === "loading") {
      setStatus("Restoring wallet session...");
      return;
    }

    if (hasActiveSession && activeProfile?.username) {
      setStatus("Opening your active Lens profile...");
      router.replace(`/profile/${activeProfile.username}`);
      return;
    }

    if (!lensRuntimeConfig.privyAppId || !authenticated) {
      setStatus("Redirecting to access...");
      router.replace("/auth");
      return;
    }

    setStatus("No active Lens session found. Redirecting to access...");
    router.replace("/auth");
  }, [activeProfile?.username, authenticated, hasActiveSession, lensStatus, ready, router, wallet?.address]);

  return (
      <ThemeFrame
        nav={[
        { label: "Profile", href: getProfileHref(activeProfile?.username) },
        { label: "Write", href: "/compose" },
        { label: "Access", href: "/auth" },
      ]}
      sidebarPanel={
        <SidebarPanel
          label="Landing"
          walletAddress={wallet?.address}
          lensAccount={
            activeProfile
              ? {
                  address: activeProfile.address,
                  username: activeProfile.username,
                }
              : undefined
          }
          note={status}
          status="stub"
        />
      }
    >
      <section className="auth-hero">
        <p className="theme-kicker">Loading</p>
        <h2>Opening Your Lens Blog</h2>
        <p>{status}</p>
      </section>
    </ThemeFrame>
  );
}
