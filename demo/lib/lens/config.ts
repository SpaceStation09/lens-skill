const environment = process.env.NEXT_PUBLIC_LENS_ENVIRONMENT ?? "testnet";

if (environment !== "testnet" && environment !== "mainnet") {
  throw new Error(`Unsupported Lens environment: ${environment}`);
}

export const lensRuntimeConfig = {
  environment,
  appAddress: process.env.NEXT_PUBLIC_LENS_APP_ADDRESS ?? "",
  privyAppId: process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "",
  storage: "window.localStorage",
} as const;
