import * as React from "react";

export type BlogAccountState = "disconnected" | "wallet_connected_unauthed" | "authenticated";

export type BlogRoute =
  | { name: "home" }
  | { name: "profile"; handle: string }
  | { name: "post"; postId: string }
  | { name: "write" };

export type WalletAccountOption = {
  address: string;
  handle?: string;
  displayName?: string;
};

export type ProfileView = {
  address: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
};

export type PostView = {
  id: string;
  createdAt: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  authorAddress: string;
};

export type DefaultThemeContext = {
  route: BlogRoute;
  accountState: BlogAccountState;
  isAuthenticated: boolean;
  isOwnerView: boolean;
  activeHandle: string;
  walletAddress?: string;

  connectWalletNode?: React.ReactNode;

  accounts: WalletAccountOption[];
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;
  loginSelectedAccount: () => void;
  createUsername: string;
  setCreateUsername: (value: string) => void;
  canCreateUsername: () => void;
  createLensAccount: () => void;
  isCheckingUsername: boolean;
  isCreatingAccount: boolean;
  usernameCheckMessage?: string;
  resetLensAuth: () => void;

  profile: ProfileView | null;
  pagePosts: PostView[];
  activePost: PostView | null;

  query: string;
  setQuery: (value: string) => void;
  currentPage: number;
  pageCount: number;
  toPrevPage: () => void;
  toNextPage: () => void;

  draftTitle: string;
  setDraftTitle: (value: string) => void;
  draftContent: string;
  setDraftContent: (value: string) => void;
  draftTags: string;
  setDraftTags: (value: string) => void;
  isPublishing: boolean;
  publishDraft: () => void;

  navigate: (path: string) => void;
  shortAddress: (address?: string) => string;
  identiconDataUri: (address: string) => string;
  status?: string;
};

export type DefaultThemeProps = {
  ctx: DefaultThemeContext;
};

function TopBar({ ctx }: DefaultThemeProps) {
  return (
    <>
      <header className="lb-shell lb-topbar">
        <div className="lb-brand-block">
          <p className="lb-kicker">Lens Blog</p>
          <h2 className="lb-brand-title">Default Theme</h2>
        </div>

        <div className="lb-topbar-actions">
          {ctx.accountState === "wallet_connected_unauthed" ? (
            <button className="lb-btn lb-btn-soft" onClick={() => ctx.navigate("/")}>
              Login Lens
            </button>
          ) : null}

          {ctx.isAuthenticated ? (
            <button className="lb-btn lb-btn-soft" onClick={ctx.resetLensAuth}>
              Switch Account
            </button>
          ) : null}

          {ctx.connectWalletNode || null}
        </div>
      </header>

      {ctx.status ? (
        <section className="lb-shell lb-status-panel">
          <p>{ctx.status}</p>
        </section>
      ) : null}
    </>
  );
}

function GateCard(props: { title: string; desc: string; action?: React.ReactNode }) {
  return (
    <section className="lb-shell lb-auth-panel">
      <p className="lb-kicker">Access</p>
      <h1>{props.title}</h1>
      <p className="lb-muted">{props.desc}</p>
      {props.action ? <div className="lb-actions">{props.action}</div> : null}
    </section>
  );
}

function ProfileViewSection({ ctx }: DefaultThemeProps) {
  const profile = ctx.profile;

  return (
    <>
      <section className="lb-shell lb-profile-card">
        <img
          className="lb-avatar"
          src={profile?.avatarUrl || ctx.identiconDataUri(profile?.address || "lens")}
          alt={profile?.displayName || "avatar"}
        />

        <div className="lb-profile-meta">
          <h1>{profile?.displayName || `@${ctx.route.name === "profile" ? ctx.route.handle : "profile"}`}</h1>
          <p className="lb-muted">@{profile?.handle || (ctx.route.name === "profile" ? ctx.route.handle : "unknown")}</p>
          <p>{profile?.bio || "No bio yet."}</p>
          <p className="lb-muted">Address: {ctx.shortAddress(profile?.address)}</p>
        </div>

        <div className="lb-profile-side">
          <div className="lb-stat-grid">
            <div className="lb-stat-item">
              <span>Following</span>
              <strong>{typeof profile?.following === "number" ? profile.following.toLocaleString() : "-"}</strong>
            </div>
            <div className="lb-stat-item">
              <span>Followers</span>
              <strong>{typeof profile?.followers === "number" ? profile.followers.toLocaleString() : "-"}</strong>
            </div>
          </div>

          {ctx.isOwnerView ? (
            <button className="lb-btn" onClick={() => ctx.navigate("/write")}>
              New Post
            </button>
          ) : null}
        </div>
      </section>

      <section className="lb-shell lb-feed-toolbar">
        <label className="lb-field">
          <span>Search Posts</span>
          <input value={ctx.query} onChange={(e) => ctx.setQuery(e.target.value)} placeholder="Search posts" />
        </label>
      </section>

      <section className="lb-feed-grid">
        {ctx.pagePosts.length ? (
          ctx.pagePosts.map((post) => (
            <article className="lb-shell lb-post-card" key={post.id}>
              <p className="lb-muted lb-time">{new Date(post.createdAt).toLocaleString()}</p>
              <h3>{post.title}</h3>
              <p className="lb-muted">{post.excerpt}</p>

              {post.tags.length ? (
                <div className="lb-tag-row">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="lb-tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="lb-actions">
                <button className="lb-btn lb-btn-soft" onClick={() => ctx.navigate(`/p/${encodeURIComponent(post.id)}`)}>
                  Read
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="lb-shell lb-empty-card">
            <h3>No posts yet</h3>
            <p className="lb-muted">Start publishing to build your archive.</p>
          </article>
        )}
      </section>

      <section className="lb-shell lb-pagination-row">
        <button className="lb-btn lb-btn-soft" disabled={ctx.currentPage <= 1} onClick={ctx.toPrevPage}>
          Prev
        </button>
        <span>
          Page {ctx.currentPage}/{ctx.pageCount}
        </span>
        <button className="lb-btn lb-btn-soft" disabled={ctx.currentPage >= ctx.pageCount} onClick={ctx.toNextPage}>
          Next
        </button>
      </section>
    </>
  );
}

export function DefaultTheme({ ctx }: DefaultThemeProps) {
  React.useEffect(() => {
    if (ctx.route.name !== "home" || !ctx.isAuthenticated) return;
    if (!ctx.activeHandle) return;
    ctx.navigate(`/${encodeURIComponent(ctx.activeHandle)}`);
  }, [ctx.route.name, ctx.isAuthenticated, ctx.activeHandle, ctx.navigate]);

  if (ctx.route.name === "home" && ctx.accountState === "disconnected") {
    return (
      <main className="lb-layout lb-theme-default">
        <TopBar ctx={ctx} />
        <GateCard
          title="Connect Wallet"
          desc="Connect your wallet first, then continue to Lens login."
          action={ctx.connectWalletNode || null}
        />
      </main>
    );
  }

  if (ctx.route.name === "home" && ctx.accountState === "wallet_connected_unauthed") {
    return (
      <main className="lb-layout lb-theme-default">
        <TopBar ctx={ctx} />
        <section className="lb-shell lb-auth-panel">
          <p className="lb-kicker">Lens Login</p>
          <h1>{ctx.accounts.length ? "Select Or Create Lens Account" : "Create Lens Account"}</h1>
          <p className="lb-muted">Wallet: {ctx.shortAddress(ctx.walletAddress)}</p>

          {ctx.accounts.length ? (
            <>
              <label className="lb-field">
                <span>Lens Account</span>
                <select value={ctx.selectedAccount} onChange={(e) => ctx.setSelectedAccount(e.target.value)}>
                  {ctx.accounts.map((item) => (
                    <option key={item.address} value={item.address}>
                      {(item.handle ? `@${item.handle}` : "No handle") + " · " + ctx.shortAddress(item.address)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="lb-actions">
                <button className="lb-btn" disabled={!ctx.selectedAccount} onClick={ctx.loginSelectedAccount}>
                  Continue
                </button>
              </div>

              <p className="lb-muted">Or create a new Lens account with a username below.</p>

              <label className="lb-field">
                <span>New Username</span>
                <input
                  value={ctx.createUsername}
                  onChange={(e) => ctx.setCreateUsername(e.target.value)}
                  placeholder="yourname"
                />
              </label>

              {ctx.usernameCheckMessage ? <p className="lb-muted">{ctx.usernameCheckMessage}</p> : null}

              <div className="lb-actions">
                <button className="lb-btn lb-btn-soft" disabled={!ctx.createUsername || ctx.isCheckingUsername} onClick={ctx.canCreateUsername}>
                  {ctx.isCheckingUsername ? "Checking..." : "Check Username"}
                </button>
                <button className="lb-btn" disabled={!ctx.createUsername || ctx.isCreatingAccount} onClick={ctx.createLensAccount}>
                  {ctx.isCreatingAccount ? "Creating..." : "Create Lens Account"}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="lb-muted">No Lens account found for this wallet. Create one to continue.</p>

              <label className="lb-field">
                <span>Username</span>
                <input
                  value={ctx.createUsername}
                  onChange={(e) => ctx.setCreateUsername(e.target.value)}
                  placeholder="yourname"
                />
              </label>

              {ctx.usernameCheckMessage ? <p className="lb-muted">{ctx.usernameCheckMessage}</p> : null}

              <div className="lb-actions">
                <button className="lb-btn lb-btn-soft" disabled={!ctx.createUsername || ctx.isCheckingUsername} onClick={ctx.canCreateUsername}>
                  {ctx.isCheckingUsername ? "Checking..." : "Check Username"}
                </button>
                <button className="lb-btn" disabled={!ctx.createUsername || ctx.isCreatingAccount} onClick={ctx.createLensAccount}>
                  {ctx.isCreatingAccount ? "Creating..." : "Create Lens Account"}
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    );
  }

  if (ctx.route.name === "home" && ctx.isAuthenticated) {
    if (!ctx.activeHandle) {
      return (
        <main className="lb-layout lb-theme-default">
          <TopBar ctx={ctx} />
          <section className="lb-shell lb-auth-panel">
            <p className="lb-kicker">Lens Login</p>
            <h1>Lens account unavailable</h1>
            <p className="lb-muted">We could not resolve your current handle. Please switch account and try again.</p>
            <div className="lb-actions">
              <button className="lb-btn" onClick={ctx.resetLensAuth}>
                Switch Account
              </button>
            </div>
          </section>
        </main>
      );
    }

    return (
      <main className="lb-layout lb-theme-default">
        <TopBar ctx={ctx} />
        <section className="lb-shell">
          <p className="lb-muted">Redirecting to your profile...</p>
        </section>
      </main>
    );
  }

  if (ctx.route.name === "profile") {
    return (
      <main className="lb-layout lb-theme-default">
        <TopBar ctx={ctx} />
        <ProfileViewSection ctx={ctx} />
      </main>
    );
  }

  if (ctx.route.name === "post") {
    return (
      <main className="lb-layout lb-theme-default">
        <TopBar ctx={ctx} />
        <section className="lb-shell lb-article-card">
          {!ctx.activePost ? (
            <>
              <h1>Post not found</h1>
              <p className="lb-muted">The post may be unavailable or removed.</p>
            </>
          ) : (
            <>
              <p className="lb-muted lb-time">{new Date(ctx.activePost.createdAt).toLocaleString()}</p>
              <h1>{ctx.activePost.title}</h1>
              <article>{ctx.activePost.content}</article>
            </>
          )}

          <div className="lb-actions">
            <button
              className="lb-btn lb-btn-soft"
              onClick={() => ctx.navigate(`/${encodeURIComponent(ctx.activeHandle || ctx.profile?.handle || "")}`)}
            >
              Back
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (ctx.route.name === "write") {
    if (!ctx.isOwnerView) {
      return (
        <main className="lb-layout lb-theme-default">
          <TopBar ctx={ctx} />
          <GateCard title="Write Access Required" desc="Only owner can publish. Please switch to the owner Lens account." />
        </main>
      );
    }

    return (
      <main className="lb-layout lb-theme-default">
        <TopBar ctx={ctx} />
        <section className="lb-shell lb-write-card">
          <p className="lb-kicker">Editor</p>
          <h1>Write Post</h1>

          <label className="lb-field">
            <span>Title</span>
            <input value={ctx.draftTitle} onChange={(e) => ctx.setDraftTitle(e.target.value)} placeholder="Post title" />
          </label>

          <label className="lb-field">
            <span>Tags</span>
            <input value={ctx.draftTags} onChange={(e) => ctx.setDraftTags(e.target.value)} placeholder="lens, blog" />
          </label>

          <label className="lb-field">
            <span>Content</span>
            <textarea value={ctx.draftContent} onChange={(e) => ctx.setDraftContent(e.target.value)} placeholder="Write here" />
          </label>

          <div className="lb-actions">
            <button className="lb-btn" disabled={ctx.isPublishing} onClick={ctx.publishDraft}>
              {ctx.isPublishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="lb-layout lb-theme-default">
      <TopBar ctx={ctx} />
      <section className="lb-shell">
        <p className="lb-muted">Unknown route.</p>
      </section>
    </main>
  );
}

export default DefaultTheme;
