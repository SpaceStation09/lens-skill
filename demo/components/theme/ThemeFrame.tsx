import type { ReactNode } from "react";
import Link from "next/link";
import { SidebarActions } from "@/components/theme/SidebarActions";

export type ThemeNavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export function ThemeFrame({
  brandTitle = "Monolith / Lens",
  brandTagline = "Editorial baseline for a Lens-native personal blog",
  nav,
  sidebarPanel,
  children,
}: {
  brandTitle?: string;
  brandTagline?: string;
  nav: ThemeNavItem[];
  sidebarPanel?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="monolith-frame">
      <aside className="monolith-sidebar">
        <div>
          <div className="monolith-brand">
            <h1>{brandTitle}</h1>
            <p>{brandTagline}</p>
          </div>

          {sidebarPanel ? <div className="monolith-sidebar__panel">{sidebarPanel}</div> : null}

          <nav className="monolith-nav" aria-label="Primary">
            {nav.map((item) => (
              <Link key={`${item.href}-${item.label}`} className={item.active ? "is-active" : undefined} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="monolith-sidebar__footer">
          <SidebarActions />
          <a href="https://lens.xyz/docs" target="_blank" rel="noreferrer">
            Lens Docs
          </a>
          <Link href="/auth">Auth Flow</Link>
        </div>
      </aside>

      <main className="monolith-main">{children}</main>
    </section>
  );
}
