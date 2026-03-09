"use client";

import { useMemo } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useWalletClient } from "wagmi";
import { createLensAdapter } from "@lens-blog/adapter-lens";
import { BlogFrontendApp } from "@lens-blog/core";
import { defaultTheme } from "@lens-blog/theme-default";
import {
  fetchAuthorPosts,
  fetchPostById,
  fetchProfileByAddress,
  fetchProfileByHandle,
  fetchWalletAccounts,
  loginAsAccountOwner,
  publishArticle,
} from "../lib/lens";

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
        fetchPostById,
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
      connectWalletNode={<ConnectKitButton />}
    />
  );
}
