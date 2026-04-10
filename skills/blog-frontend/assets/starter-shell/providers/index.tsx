import type { ReactNode } from "react";

export function AppProviders({
  children,
}: Readonly<{ children: ReactNode }>) {
  // Replace with WalletProvider, LensAuthProvider, and ThemeProvider wiring.
  return <>{children}</>;
}
