"use client";

import * as React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { BlogProvider } from "@/lib/blog/provider/state";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const privyAppId = (process.env.NEXT_PUBLIC_PRIVY_APP_ID || "").trim();

  return (
    <PrivyProvider
      appId={privyAppId}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#1447e6",
        },
        defaultChain: sepolia,
        supportedChains: [mainnet, sepolia],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <BlogProvider>{children}</BlogProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
}
