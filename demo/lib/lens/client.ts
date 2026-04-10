"use client";

import type { IStorageProvider } from "@lens-protocol/client";
import { PublicClient, mainnet, testnet } from "@lens-protocol/client";
import { lensRuntimeConfig } from "@/lib/lens/config";

let publicClient: PublicClient | null = null;

function createBrowserStorage(): IStorageProvider {
  return {
    getItem(key) {
      return window.localStorage.getItem(key);
    },
    setItem(key, value) {
      window.localStorage.setItem(key, value);
    },
    removeItem(key) {
      window.localStorage.removeItem(key);
    },
  };
}

export function getLensPublicClient() {
  if (publicClient) {
    return publicClient;
  }

  publicClient = PublicClient.create({
    environment: lensRuntimeConfig.environment === "mainnet" ? mainnet : testnet,
    storage: createBrowserStorage(),
  });

  return publicClient;
}
