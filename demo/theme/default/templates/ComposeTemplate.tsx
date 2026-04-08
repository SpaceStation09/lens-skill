import { ThemeFrame } from "./ThemeFrame";

export function ComposeTemplate({
  title,
  content,
  tags,
  feedback,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onSubmit,
  publishDate,
  profileHref,
  connectedWallet,
  walletChecking,
  lensHandle,
  lensAccountAddress,
  canShowAccountActions,
  onLogoutLens,
  onDisconnectWallet,
}: {
  title: string;
  content: string;
  tags: string;
  feedback: string | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSubmit: (event: any) => void;
  publishDate: string;
  profileHref: string;
  connectedWallet: string | null;
  walletChecking: boolean;
  lensHandle: string | null;
  lensAccountAddress: string | null;
  canShowAccountActions: boolean;
  onLogoutLens: () => void;
  onDisconnectWallet: () => void;
}) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;

  return (
    <ThemeFrame
      mainClassName="monolith-main--compose"
      nav={[
        { label: "Home", href: "/" },
        { label: "Write", href: "/compose", active: true },
        { label: "Profile", href: profileHref },
      ]}
      accountActions={{
        canShow: canShowAccountActions,
        onLogoutLens,
        onDisconnectWallet,
      }}
      connectedWallet={connectedWallet}
      walletChecking={walletChecking}
      lensHandle={lensHandle}
      lensAccountAddress={lensAccountAddress}
    >
      <form onSubmit={onSubmit}>
        <header className="compose-topbar">
          <p className="theme-kicker">Write Article</p>
          <div className="compose-topbar__actions">
            <button type="submit" className="solid-button">
              Publish
            </button>
          </div>
        </header>

        <section className="compose-layout">
          <div className="compose-editor">
            <input
              aria-label="Entry title"
              className="compose-title-input"
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Enter your article title"
            />

            <div className="compose-meta-grid">
              <label>
                <span>Category</span>
                <input defaultValue="Article" />
              </label>
              <label>
                <span>Tags</span>
                <input
                  value={tags}
                  onChange={(event) => onTagsChange(event.target.value)}
                  placeholder="lens, web3, product"
                />
              </label>
            </div>

            <div className="editor-surface">
              <div className="editor-toolbar" aria-hidden="true">
                <span>B</span>
                <span>I</span>
                <span>""</span>
                <span>Link</span>
                <span>List</span>
              </div>
              <textarea
                value={content}
                onChange={(event) => onContentChange(event.target.value)}
                rows={16}
                placeholder="Start documenting with precision..."
              />
              <div className="editor-stats">
                <span>Words: {words}</span>
                <span>Chars: {content.length}</span>
                <span>Reading: {Math.max(1, Math.ceil(words / 200))}m</span>
              </div>
            </div>

            {feedback ? <p className="state-block state-block--error">{feedback}</p> : null}
          </div>

          <aside className="compose-settings">
            <h2>Post Settings</h2>
            <div className="settings-field">
              <span>Publish date</span>
              <p>{publishDate}</p>
            </div>
            <div className="settings-field">
              <span>Visibility</span>
              <p>Public</p>
            </div>
            <div className="settings-field">
              <span>Excerpt</span>
              <p>{content.slice(0, 60) || "A short summary will appear here."}</p>
            </div>
          </aside>
        </section>
      </form>
    </ThemeFrame>
  );
}
