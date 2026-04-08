import type { ReactNode } from "react";
import "../../skills/blog-frontend/assets/themes/default/styles/globals.css";
import { AppProviders } from "../providers";

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
