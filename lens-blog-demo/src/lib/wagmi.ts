import { chains } from "@lens-chain/sdk/viem";
import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";

const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";
const lensNetwork = (import.meta.env.VITE_LENS_NETWORK || "testnet").toLowerCase();
const selectedChain = lensNetwork === "mainnet" ? chains.mainnet : chains.testnet;

export const wagmiConfig = createConfig(
  getDefaultConfig({
    appName: "Lens Blog Demo",
    chains: [selectedChain],
    transports: {
      [selectedChain.id]: http(selectedChain.rpcUrls.default.http[0]),
    },
    walletConnectProjectId,
  })
);
