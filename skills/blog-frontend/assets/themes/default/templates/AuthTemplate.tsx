import { ThemeFrame } from "./ThemeFrame";

export type AuthAccountOption = {
  address: string;
  label: string;
};

export function AuthTemplate({
  connectedWallet,
  sessionLabel,
  handle,
  selectedAccount,
  availableAccounts,
  accountsLoading,
  creating,
  createFeedback,
  error,
  isAuthenticated,
  onConnect,
  onLogin,
  onCreate,
  onHandleChange,
  onSelectedAccountChange,
  profileHref,
  walletChecking,
  lensHandle,
  lensAccountAddress,
  onLogoutLens,
  onDisconnectWallet,
}: {
  connectedWallet: string | null;
  sessionLabel: string;
  handle: string;
  selectedAccount: string;
  availableAccounts: AuthAccountOption[];
  accountsLoading: boolean;
  creating: boolean;
  createFeedback: string | null;
  error: string | null;
  isAuthenticated: boolean;
  onConnect: () => void;
  onLogin: () => void;
  onCreate: () => void;
  onHandleChange: (value: string) => void;
  onSelectedAccountChange: (value: string) => void;
  profileHref: string;
  walletChecking: boolean;
  lensHandle: string | null;
  lensAccountAddress: string | null;
  onLogoutLens: () => void;
  onDisconnectWallet: () => void;
}) {
  return (
    <ThemeFrame
      mainClassName="monolith-main--centered"
      nav={[
        { label: "Home", href: "/", active: true },
        { label: "Profile", href: profileHref },
      ]}
      accountActions={{
        canShow: isAuthenticated,
        onLogoutLens,
        onDisconnectWallet,
      }}
      connectedWallet={connectedWallet}
      walletChecking={walletChecking}
      lensHandle={lensHandle}
      lensAccountAddress={lensAccountAddress}
    >
      <section className="auth-hero">
        <p className="theme-kicker">Authentication</p>
        <h2>Sign In To Lens Blog</h2>
        <p>Connect wallet, choose an existing Lens account, or create a new one to continue.</p>
        {connectedWallet ? (
          <button type="button" className="solid-button auth-hero__button" disabled>
            Wallet Connected
          </button>
        ) : (
          <button type="button" className="solid-button auth-hero__button" onClick={onConnect}>
            Connect Wallet With Privy
          </button>
        )}
        <small>{sessionLabel}</small>
      </section>

      <section className="persona-grid" aria-label="Persona selection">
        <article className="persona-card">
          <h3>Select Account</h3>
          <p className="persona-card__wallet">
            {connectedWallet ? connectedWallet : "Connect wallet first to load account list."}
          </p>
          <label htmlFor="account">Available accounts</label>
          <select
            id="account"
            value={selectedAccount}
            onChange={(event) => onSelectedAccountChange(event.target.value)}
          >
            <option value="">Create/Login with new handle</option>
            {availableAccounts.map((account) => (
              <option key={account.address} value={account.address}>
                {account.label}
              </option>
            ))}
          </select>
          <button type="button" className="solid-button" onClick={onLogin}>
            Sign In With Selected Account
          </button>
          {accountsLoading ? <p>Loading available Lens accounts...</p> : null}
        </article>

        <article className="persona-card">
          <h3>Create Lens Account</h3>
          <p>Reserve a handle and create a new Lens identity from this wallet.</p>
          <label htmlFor="handle">Handle</label>
          <input
            id="handle"
            value={handle}
            onChange={(event) => onHandleChange(event.target.value)}
            placeholder="demo"
          />
          <button type="button" className="solid-button" disabled={creating || !connectedWallet} onClick={onCreate}>
            {creating ? "Creating..." : "Create Lens account"}
          </button>
          {createFeedback ? <p>{createFeedback}</p> : null}
        </article>

        <article className="persona-card persona-card--ghost">
          {isAuthenticated ? (
            <p>Use sidebar actions to logout Lens or disconnect wallet.</p>
          ) : (
            <p>{error ?? "After login you will be redirected to your profile."}</p>
          )}
        </article>
      </section>
    </ThemeFrame>
  );
}
