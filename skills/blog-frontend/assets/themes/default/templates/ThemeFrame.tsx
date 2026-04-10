import type { ReactNode } from "react";

export type ThemeNavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export type ThemeFooterItem = {
  label: string;
  href: string;
};

export type ThemeFooterAction = {
  label: string;
  onClick: () => void;
  variant?: "ghost" | "solid";
};

export function ThemeFrame({
  brandTitle = "Lens Blog",
  brandTagline = "Personal Publishing on Lens",
  nav,
  footer,
  sidebarPanel,
  footerActions,
  mainClassName,
  children,
}: {
  brandTitle?: string;
  brandTagline?: string;
  nav: ThemeNavItem[];
  footer?: ThemeFooterItem[];
  sidebarPanel?: ReactNode;
  footerActions?: ThemeFooterAction[];
  mainClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className="monolith-frame">
      <aside className="monolith-sidebar">
        <div className="monolith-brand">
          <h1>{brandTitle}</h1>
          <p>{brandTagline}</p>
        </div>

        {sidebarPanel ? <div className="monolith-sidebar__panel">{sidebarPanel}</div> : null}

        <nav className="monolith-nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={`${item.href}-${item.label}`} className={item.active ? "is-active" : undefined} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="monolith-sidebar__footer">
          {(footer ?? []).map((item) => (
            <a key={`${item.href}-${item.label}`} href={item.href}>
              {item.label}
            </a>
          ))}
          {footerActions?.length ? (
            <div className="monolith-sidebar__actions">
              {footerActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className={action.variant === "solid" ? "solid-button" : "ghost-button"}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </aside>

      <main className={mainClassName ? `monolith-main ${mainClassName}` : "monolith-main"}>
        {children}
      </main>
    </section>
  );
}
