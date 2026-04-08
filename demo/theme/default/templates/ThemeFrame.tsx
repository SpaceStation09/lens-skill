export type ThemeNavItem = {
  label: string;
  href: string;
  active?: boolean;
};

export type ThemeFooterItem = {
  label: string;
  href: string;
};

export type ThemeAccountActions = {
  canShow: boolean;
  onLogoutLens: () => void;
  onDisconnectWallet: () => void;
};

export function ThemeFrame({
  brandTitle = "Lens Blog",
  brandTagline = "Personal Publishing on Lens",
  nav,
  footer,
  accountActions,
  connectedWallet,
  walletChecking,
  lensHandle,
  lensAccountAddress,
  mainClassName,
  children,
}: {
  brandTitle?: string;
  brandTagline?: string;
  nav: ThemeNavItem[];
  footer?: ThemeFooterItem[];
  accountActions?: ThemeAccountActions;
  connectedWallet?: string | null;
  walletChecking?: boolean;
  lensHandle?: string | null;
  lensAccountAddress?: string | null;
  mainClassName?: string;
  children: any;
}) {
  function formatAddress(value?: string | null) {
    if (!value) return null;
    if (value.length <= 14) return value;
    return `${value.slice(0, 6)}...${value.slice(-4)}`;
  }

  const walletShort = formatAddress(connectedWallet);
  const accountShort = formatAddress(lensAccountAddress);

  return (
    <section className="monolith-frame">
      <aside className="monolith-sidebar">
        <div className="monolith-brand">
          <h1>{brandTitle}</h1>
          <p>{brandTagline}</p>
        </div>

        <section className="monolith-session" aria-label="Lens session status">
          <p className="monolith-session__kicker">Current Session</p>
          <p className="monolith-session__title">{lensHandle ? `@${lensHandle}` : "Guest"}</p>

          <div className="monolith-session__row">
            <span>Wallet</span>
            <strong className={walletChecking ? "is-off" : connectedWallet ? "is-ok" : "is-off"}>
              {walletChecking ? "Checking wallet..." : connectedWallet ? "Connected" : "Disconnected"}
            </strong>
          </div>
          {connectedWallet && !walletChecking ? (
            <p className="monolith-session__value" title={connectedWallet}>
              {walletShort}
            </p>
          ) : null}

          <div className="monolith-session__row">
            <span>Lens</span>
            <strong className={lensHandle ? "is-ok" : "is-off"}>
              {lensHandle ? "Logged in" : "Not logged in"}
            </strong>
          </div>
          {lensAccountAddress ? (
            <p className="monolith-session__value" title={lensAccountAddress}>
              {accountShort}
            </p>
          ) : null}
        </section>

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
          {accountActions?.canShow ? (
            <div className="sidebar-account-actions">
              <button type="button" className="ghost-button" onClick={accountActions.onLogoutLens}>
                Logout Lens
              </button>
              <button type="button" className="ghost-button" onClick={accountActions.onDisconnectWallet}>
                Disconnect Wallet
              </button>
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
