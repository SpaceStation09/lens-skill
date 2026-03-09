import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "@lens-blog/theme-default/styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lens Blog Demo",
  description: "Lens blog frontend demo powered by Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
