"use client";

import { useMemo } from "react";
import { useModal } from "connectkit";
import { useAccount, useWalletClient } from "wagmi";
import { createLensAdapter } from "@lens-blog/adapter-lens";
import { BlogFrontendApp } from "@lens-blog/core";
import { defaultTheme } from "@lens-blog/theme-default";
import {
  fetchAuthorPosts,
  fetchProfileByAddress,
  fetchProfileByHandle,
  fetchWalletAccounts,
  loginAsAccountOwner,
  publishArticle,
} from "../lib/lens";

function WalletActionButton() {
  const { setOpen } = useModal();
  const { address, status } = useAccount();

  let label = "Connect Wallet";
  if (status === "connecting" || status === "reconnecting") {
    label = "Connecting...";
  } else if (status === "connected" && address) {
    label = `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  return (
    <button className="ghost" onClick={() => setOpen(true)}>
      {label}
    </button>
  );
}

export function BlogClientApp() {
  const { address, isConnected, status } = useAccount();
  const { data: walletClient } = useWalletClient();

  const adapter = useMemo(
    () =>
      createLensAdapter(() => walletClient, {
        fetchWalletAccounts,
        loginAsAccount: async ({ walletClient: wc, accountAddress }) => {
          return await loginAsAccountOwner({ walletClient: wc as any, accountAddress });
        },
        fetchProfileByHandle,
        fetchProfileByAddress,
        fetchPostsByAuthor: fetchAuthorPosts,
        publishArticle,
      }),
    [walletClient]
  );

  return (
    <BlogFrontendApp
      adapter={adapter}
      theme={defaultTheme}
      walletAddress={address}
      isWalletConnected={isConnected}
      walletConnectionStatus={status}
      connectWalletNode={<WalletActionButton />}
    />
  );
}
