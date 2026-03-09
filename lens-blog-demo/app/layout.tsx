import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "@lens-blog/theme-default/styles.css";
import "@lens-blog/theme-neo/styles.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lens Blog Demo",
  description: "Lens blog frontend demo powered by Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const configuredTheme = process.env.NEXT_PUBLIC_BLOG_THEME === "neo" ? "neo" : "default";

  return (
    <html lang="zh-CN">
      <body data-lens-theme={configuredTheme}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
