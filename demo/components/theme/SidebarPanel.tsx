export function SidebarPanel({
  label,
  walletAddress,
  lensAccount,
  note,
  status,
}: {
  label: string;
  walletAddress?: string | null;
  lensAccount?: {
    address?: string | null;
    username?: string | null;
  } | null;
  note?: string;
  status: "ready" | "stub";
}) {
  const hasLensAccount = Boolean(lensAccount?.address || lensAccount?.username);

  return (
    <>
      <p className="sidebar-panel__eyebrow">Identity</p>
      <h2 className="sidebar-panel__title">{label}</h2>
      <div className="sidebar-panel__row sidebar-panel__row--stacked">
        <span>Wallet</span>
        <strong className={walletAddress ? "sidebar-panel__mono is-ok" : "is-off"}>{walletAddress ?? "Not connected"}</strong>
      </div>
      <div className="sidebar-panel__row sidebar-panel__row--stacked">
        <span>Lens account</span>
        <strong className={hasLensAccount ? "sidebar-panel__account is-ok" : "is-off"}>
          {lensAccount?.username ? <span>@{lensAccount.username}</span> : <span>Not logged in</span>}
          {lensAccount?.address ? <span className="sidebar-panel__mono">{lensAccount.address}</span> : null}
        </strong>
      </div>
      {note ? <p className={status === "ready" ? "sidebar-panel__note" : "sidebar-panel__note is-off"}>{note}</p> : null}
    </>
  );
}
