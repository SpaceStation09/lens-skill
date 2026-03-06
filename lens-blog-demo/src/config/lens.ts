export type LensNetwork = "testnet" | "mainnet";

const LENS_GLOBAL_APP_ADDRESS_BY_NETWORK: Record<LensNetwork, `0x${string}`> = {
  // Lens global app address for testnet.
  testnet: "0x0fd5eAC6b01D037DE704C05Cfe8FC59d1d9Be3B2",
  // Lens global app address for mainnet.
  mainnet: "0x00004747f7a56EE7Af7237220c960a7D06232626",
};

export function resolveLensNetwork(input?: string): LensNetwork {
  const value = (input || "").toLowerCase();
  return value === "mainnet" ? "mainnet" : "testnet";
}

export function resolveLensAppAddress(network: LensNetwork, override?: string): `0x${string}` {
  if (override && /^0x[a-fA-F0-9]{40}$/.test(override)) {
    return override as `0x${string}`;
  }
  return LENS_GLOBAL_APP_ADDRESS_BY_NETWORK[network];
}

export function getLensRuntimeConfig() {
  const network = resolveLensNetwork(import.meta.env.VITE_LENS_NETWORK);
  const appAddress = resolveLensAppAddress(network, import.meta.env.VITE_LENS_APP_ADDRESS);
  const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "demo-project-id";

  return {
    network,
    appAddress,
    walletConnectProjectId,
  };
}

