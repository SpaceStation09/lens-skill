import type { ReactNode } from "react";
import { ThemeFrame, type ThemeFooterAction } from "./ThemeFrame";

export type AuthAccountOption = {
  address: string;
  label: string;
};

export function AuthTemplate({
  connectedAccount,
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
  sidebarPanel,
  footerActions,
}: {
  connectedAccount: string | null;
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
  sidebarPanel?: ReactNode;
  footerActions?: ThemeFooterAction[];
}) {
  return (
    <ThemeFrame
      mainClassName="monolith-main--centered"
      nav={[
        { label: "Home", href: "/", active: true },
        { label: "Profile", href: profileHref },
      ]}
      sidebarPanel={sidebarPanel}
      footerActions={isAuthenticated ? footerActions : undefined}
    >
      <section className="auth-hero">
        <p className="theme-kicker">Access</p>
        <h2>Sign In To Your Publishing Space</h2>
        <p>Connect an account, select an available profile, or create a new profile to continue.</p>
        {connectedAccount ? (
          <button type="button" className="solid-button auth-hero__button" disabled>
            Account Connected
          </button>
        ) : (
          <button type="button" className="solid-button auth-hero__button" onClick={onConnect}>
            Connect Account
          </button>
        )}
        <small>{sessionLabel}</small>
      </section>

      <section className="persona-grid" aria-label="Persona selection">
        <article className="persona-card">
          <h3>Select Profile</h3>
          <p className="persona-card__wallet">
            {connectedAccount ? connectedAccount : "Connect an account first to load available profiles."}
          </p>
          <label htmlFor="account">Available profiles</label>
          <select
            id="account"
            value={selectedAccount}
            onChange={(event) => onSelectedAccountChange(event.target.value)}
          >
            <option value="">Continue with a new handle</option>
            {availableAccounts.map((account) => (
              <option key={account.address} value={account.address}>
                {account.label}
              </option>
            ))}
          </select>
          <button type="button" className="solid-button" onClick={onLogin}>
            Continue With Selected Profile
          </button>
          {accountsLoading ? <p>Loading available profiles...</p> : null}
        </article>

        <article className="persona-card">
          <h3>Create Profile</h3>
          <p>Reserve a handle and create a new publishing profile from the connected account.</p>
          <label htmlFor="handle">Handle</label>
          <input
            id="handle"
            value={handle}
            onChange={(event) => onHandleChange(event.target.value)}
            placeholder="demo"
          />
          <button type="button" className="solid-button" disabled={creating || !connectedAccount} onClick={onCreate}>
            {creating ? "Creating..." : "Create Profile"}
          </button>
          {createFeedback ? <p>{createFeedback}</p> : null}
        </article>

        <article className="persona-card persona-card--ghost">
          {isAuthenticated ? (
            <p>Use the sidebar actions to manage the current session.</p>
          ) : (
            <p>{error ?? "After sign in you will be redirected to your profile."}</p>
          )}
        </article>
      </section>
    </ThemeFrame>
  );
}
