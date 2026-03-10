import type { BlogTheme, ThemeRenderContext } from "../../core/contracts/theme";

function topbar(ctx: ThemeRenderContext) {
  return (
    <header className="neo-shell neo-topbar">
      <div>
        <p className="neo-kicker">Lens Blog</p>
        <h2>Neo Editorial</h2>
      </div>
      <div className="neo-actions">
        {ctx.accountState === "connected_unauthed" ? (
          <button className="neo-btn neo-btn-ghost" onClick={() => ctx.navigate("/")}>
            Login Lens
          </button>
        ) : null}
        {ctx.isAuthenticated ? (
          <button className="neo-btn neo-btn-ghost" onClick={ctx.resetLensAuth}>
            Switch Account
          </button>
        ) : null}
        {ctx.connectWalletNode || null}
      </div>
    </header>
  );
}

function statusBlock(ctx: ThemeRenderContext) {
  return (
    <section className="neo-shell neo-status">
      <p className="neo-kicker">Status</p>
      <pre>{ctx.status}</pre>
    </section>
  );
}

export const neoTheme: BlogTheme = {
  id: "neo",
  label: "Neo",
  renderRoute(ctx) {
    if (ctx.route.name === "home" && ctx.accountState === "disconnected") {
      return (
        <main className="neo-layout">
          {topbar(ctx)}
          <section className="neo-shell neo-hero">
            <p className="neo-kicker">Entry</p>
            <h1>Connect Wallet To Enter</h1>
            <p>Use your wallet to unlock Lens account selection and start publishing.</p>
            <div className="neo-actions">{ctx.connectWalletNode || null}</div>
          </section>
        </main>
      );
    }

    if (ctx.route.name === "home" && ctx.accountState === "connected_unauthed") {
      return (
        <main className="neo-layout">
          {topbar(ctx)}
          <section className="neo-shell neo-card">
            <p className="neo-kicker">Account</p>
            <h1>Choose Lens Account</h1>
            <p className="neo-muted">Wallet: {ctx.shortAddress(ctx.walletAddress)}</p>
            <label className="neo-field">
              <span>Lens Account</span>
              <select value={ctx.selectedAccount} onChange={(e) => ctx.setSelectedAccount(e.target.value)}>
                {ctx.accounts.map((item) => (
                  <option key={item.address} value={item.address}>
                    {(item.handle ? `@${item.handle}` : "No handle") + " · " + ctx.shortAddress(item.address)}
                  </option>
                ))}
              </select>
            </label>
            <div className="neo-actions">
              <button className="neo-btn" disabled={!ctx.selectedAccount} onClick={ctx.loginSelectedAccount}>
                Continue
              </button>
            </div>
          </section>
          {statusBlock(ctx)}
        </main>
      );
    }

    if (ctx.route.name === "profile") {
      return (
        <main className="neo-layout">
          {topbar(ctx)}
          <section className="neo-shell neo-profile">
            <img
              className="neo-avatar"
              src={ctx.profile?.avatarUrl || ctx.identiconDataUri(ctx.profile?.address || "lens")}
              alt={ctx.profile?.displayName || "avatar"}
            />
            <div className="neo-meta">
              <p className="neo-kicker">Profile</p>
              <h1>{ctx.profile?.displayName || `@${ctx.route.handle}`}</h1>
              <p className="neo-muted">@{ctx.profile?.handle || ctx.route.handle}</p>
              <p>{ctx.profile?.bio || "No bio provided yet."}</p>
              <p className="neo-muted">Address: {ctx.shortAddress(ctx.profile?.address)}</p>
            </div>
            <div className="neo-actions neo-actions-col">
              {ctx.isOwnerView ? (
                <button className="neo-btn" onClick={() => ctx.navigate("/write")}>
                  New Article
                </button>
              ) : null}
              <div className="neo-stats">
                <span>Following {typeof ctx.profile?.following === "number" ? ctx.profile.following : "-"}</span>
                <span>Followers {typeof ctx.profile?.followers === "number" ? ctx.profile.followers : "-"}</span>
              </div>
            </div>
          </section>

          <section className="neo-shell neo-card">
            <label className="neo-field">
              <span>Search</span>
              <input value={ctx.query} onChange={(e) => ctx.setQuery(e.target.value)} placeholder="Search title/content" />
            </label>
          </section>

          <section className="neo-grid">
            {ctx.pagePosts.length ? (
              ctx.pagePosts.map((post) => (
                <article className="neo-shell neo-post" key={post.id}>
                  <p className="neo-muted">{new Date(post.createdAt).toLocaleString()}</p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  {post.tags.length ? (
                    <div className="neo-tags">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span className="neo-tag" key={tag}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="neo-actions">
                    <button className="neo-btn neo-btn-ghost" onClick={() => ctx.navigate(`/p/${encodeURIComponent(post.id)}`)}>
                      Read
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <article className="neo-shell neo-card">
                <h3>No posts yet</h3>
                <p className="neo-muted">Create the first article from Write page.</p>
              </article>
            )}
          </section>

          <section className="neo-shell neo-pagination">
            <button className="neo-btn neo-btn-ghost" disabled={ctx.currentPage <= 1} onClick={ctx.toPrevPage}>
              Prev
            </button>
            <span>
              Page {ctx.currentPage}/{ctx.pageCount}
            </span>
            <button className="neo-btn neo-btn-ghost" disabled={ctx.currentPage >= ctx.pageCount} onClick={ctx.toNextPage}>
              Next
            </button>
          </section>
        </main>
      );
    }

    if (ctx.route.name === "write") {
      return (
        <main className="neo-layout">
          {topbar(ctx)}
          <section className="neo-shell neo-card">
            <p className="neo-kicker">Write</p>
            <h1>Compose Article</h1>
            <label className="neo-field">
              <span>Title</span>
              <input value={ctx.draftTitle} onChange={(e) => ctx.setDraftTitle(e.target.value)} placeholder="Post title" />
            </label>
            <label className="neo-field">
              <span>Tags</span>
              <input value={ctx.draftTags} onChange={(e) => ctx.setDraftTags(e.target.value)} placeholder="lens,web3" />
            </label>
            <label className="neo-field">
              <span>Content</span>
              <textarea
                value={ctx.draftContent}
                onChange={(e) => ctx.setDraftContent(e.target.value)}
                placeholder="Write your content..."
              />
            </label>
            <div className="neo-actions">
              <button className="neo-btn" disabled={ctx.isPublishing} onClick={ctx.publishDraft}>
                {ctx.isPublishing ? "Publishing..." : "Publish"}
              </button>
              <button
                className="neo-btn neo-btn-ghost"
                onClick={() => ctx.navigate(`/${encodeURIComponent(ctx.activeHandle || ctx.profile?.handle || "")}`)}
              >
                Back To Profile
              </button>
            </div>
          </section>
          {statusBlock(ctx)}
        </main>
      );
    }

    if (ctx.route.name === "post") {
      return (
        <main className="neo-layout">
          {topbar(ctx)}
          <section className="neo-shell neo-card">
            {!ctx.activePost ? (
              <>
                <h1>Post Not Found</h1>
                <p className="neo-muted">Unable to load this post from Lens.</p>
              </>
            ) : (
              <>
                <p className="neo-kicker">Article</p>
                <h1>{ctx.activePost.title}</h1>
                <p className="neo-muted">{new Date(ctx.activePost.createdAt).toLocaleString()}</p>
                <p className="neo-muted">Author: {ctx.shortAddress(ctx.activePost.authorAddress)}</p>
                {ctx.activePost.tags.length ? (
                  <div className="neo-tags">
                    {ctx.activePost.tags.map((tag) => (
                      <span className="neo-tag" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <article className="neo-article">
                  {ctx.activePost.content.split("\n").map((line, index) => (
                    <p key={`${index}-${line}`}>{line || " "}</p>
                  ))}
                </article>
              </>
            )}

            <div className="neo-actions">
              <button
                className="neo-btn neo-btn-ghost"
                onClick={() => ctx.navigate(`/${encodeURIComponent(ctx.profile?.handle || ctx.activeHandle || "")}`)}
              >
                Back To Profile
              </button>
            </div>
          </section>
          {statusBlock(ctx)}
        </main>
      );
    }

    return null;
  },
};
