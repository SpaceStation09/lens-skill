import type { ReactNode } from "react";

export function AppLayout({
  title,
  children,
}: Readonly<{
  title: string;
  children: ReactNode;
}>) {
  return (
    <main className="app-shell">
      <header className="app-shell__header">
        <div>
          <p className="eyebrow">Lens Blog</p>
          <h1>{title}</h1>
        </div>
      </header>
      <section className="app-shell__body">{children}</section>
    </main>
  );
}
