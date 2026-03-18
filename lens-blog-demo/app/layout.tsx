import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lens Blog Demo",
  description: "Personal blog website built on Lens",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body data-lens-theme="default">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
