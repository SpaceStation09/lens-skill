import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../styles/globals.css";
import { AppProviders } from "@/providers/AppProviders";

export const metadata: Metadata = {
  title: "Lens Blog Demo",
  description: "A baseline personal blog scaffold for Lens.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
