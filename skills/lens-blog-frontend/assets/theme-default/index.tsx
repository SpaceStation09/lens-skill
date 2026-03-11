import type { BlogTheme, ThemeRenderContext } from "../../core/contracts/theme";

function renderTopBar(ctx: ThemeRenderContext) {
  return (
    <header className="lb-shell lb-topbar">
      <div className="lb-brand-block">
        <p className="lb-kicker">Lens Blog</p>
        <h2 className="lb-brand-title">Creator Console</h2>
        {ctx.route.name === "profile" || ctx.route.name === "post" ? (
          <p className="lb-muted">{ctx.isOwnerView ? "Owner View" : "Visitor View"}</p>
        ) : null}
      </div>

      <div className="lb-topbar-actions">
        {ctx.accountState === "connected_unauthed" ? (
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
  );
}

function renderStatusPanel(ctx: ThemeRenderContext) {
  return (
    <section className="lb-shell lb-status-panel">
      <p className="lb-kicker">Runtime Status</p>
      <pre>{ctx.status}</pre>
    </section>
  );
}

function renderEmptyFeed() {
  return (
    <article className="lb-shell lb-empty-card">
      <h3>No posts yet</h3>
      <p className="lb-muted">Publish your first article to start building your on-chain archive.</p>
    </article>
  );
}

export const defaultTheme: BlogTheme = {
  id: "default",
  label: "Default",
  renderRoute(ctx) {
    if (ctx.route.name === "home" && ctx.accountState === "disconnected") {
      return (
        <main className="lb-layout lb-theme-default">
          {renderTopBar(ctx)}

          <section className="lb-shell lb-hero">
            <p className="lb-kicker">Lens Blog</p>
            <h1>Build Your Profile-Centric Publishing Hub</h1>
            <p className="lb-muted">
              Connect wallet first, then pick a Lens account and enter your profile dashboard.
            </p>
            <div className="lb-actions">{ctx.connectWalletNode || null}</div>
          </section>
        </main>
      );
    }

    if (ctx.route.name === "home" && ctx.accountState === "connected_unauthed") {
      return (
        <main className="lb-layout lb-theme-default">
          {renderTopBar(ctx)}

          <section className="lb-shell lb-auth-panel">
            <div className="lb-auth-header">
              <p className="lb-kicker">Account Access</p>
              <h1>Select Lens Account</h1>
              <p className="lb-muted">Wallet: {ctx.shortAddress(ctx.walletAddress)}</p>
            </div>

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
                Continue With Selected Account
              </button>
            </div>
          </section>

          {renderStatusPanel(ctx)}
        </main>
      );
    }

    if (ctx.route.name === "profile") {
      return (
        <main className="lb-layout lb-theme-default">
          {renderTopBar(ctx)}

          <section className="lb-shell lb-profile-card">
            <img
              className="lb-avatar"
              src={ctx.profile?.avatarUrl || ctx.identiconDataUri(ctx.profile?.address || "lens")}
              alt={ctx.profile?.displayName || "avatar"}
            />

            <div className="lb-profile-meta">
              <h1>{ctx.profile?.displayName || `@${ctx.route.handle}`}</h1>
              <p className="lb-muted">@{ctx.profile?.handle || ctx.route.handle}</p>
              <p>{ctx.profile?.bio || "No bio provided yet."}</p>
              <p className="lb-muted">Address: {ctx.shortAddress(ctx.profile?.address)}</p>
            </div>

            <div className="lb-profile-side">
              <div className="lb-stat-grid">
                <div className="lb-stat-item">
                  <span>Following</span>
                  <strong>
                    {typeof ctx.profile?.following === "number" ? ctx.profile.following.toLocaleString() : "-"}
                  </strong>
                </div>
                <div className="lb-stat-item">
                  <span>Followers</span>
                  <strong>
                    {typeof ctx.profile?.followers === "number" ? ctx.profile.followers.toLocaleString() : "-"}
                  </strong>
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
              <input
                value={ctx.query}
                onChange={(e) => ctx.setQuery(e.target.value)}
                placeholder="Search title, summary or content"
              />
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
                      Read Article
                    </button>
                  </div>
                </article>
              ))
            ) : (
              renderEmptyFeed()
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
        </main>
      );
    }

    if (ctx.route.name === "write") {
      return (
        <main className="lb-layout lb-theme-default">
          {renderTopBar(ctx)}

          <section className="lb-shell lb-write-card">
            <p className="lb-kicker">Editor</p>
            <h1>Write Post</h1>
            <p className="lb-muted">Publish article metadata to Lens using your authenticated account.</p>

            <label className="lb-field">
              <span>Title</span>
              <input value={ctx.draftTitle} onChange={(e) => ctx.setDraftTitle(e.target.value)} placeholder="Post title" />
            </label>

            <label className="lb-field">
              <span>Tags</span>
              <input value={ctx.draftTags} onChange={(e) => ctx.setDraftTags(e.target.value)} placeholder="lens, web3, creator" />
            </label>

            <label className="lb-field">
              <span>Content (Markdown)</span>
              <textarea
                value={ctx.draftContent}
                onChange={(e) => ctx.setDraftContent(e.target.value)}
                placeholder="Write your content here..."
              />
            </label>

            <div className="lb-actions">
              <button className="lb-btn" disabled={ctx.isPublishing} onClick={ctx.publishDraft}>
                {ctx.isPublishing ? "Publishing..." : "Publish"}
              </button>
              <button
                className="lb-btn lb-btn-soft"
                onClick={() => ctx.navigate(`/${encodeURIComponent(ctx.activeHandle || ctx.profile?.handle || "")}`)}
              >
                Back To Profile
              </button>
            </div>
          </section>

          {renderStatusPanel(ctx)}
        </main>
      );
    }

    if (ctx.route.name === "post") {
      return (
        <main className="lb-layout lb-theme-default">
          {renderTopBar(ctx)}

          <section className="lb-shell lb-article-card">
            {!ctx.activePost ? (
              <>
                <h1>Post Not Found</h1>
                <p className="lb-muted">Unable to load this post from Lens.</p>
              </>
            ) : (
              <>
                <p className="lb-kicker">Article</p>
                <h1>{ctx.activePost.title}</h1>
                <p className="lb-muted">{new Date(ctx.activePost.createdAt).toLocaleString()}</p>
                <p className="lb-muted">Author: {ctx.shortAddress(ctx.activePost.authorAddress)}</p>

                {ctx.activePost.tags.length ? (
                  <div className="lb-tag-row">
                    {ctx.activePost.tags.map((tag) => (
                      <span key={tag} className="lb-tag-pill">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <article className="lb-article-content">
                  {ctx.activePost.content.split("\n").map((line, index) => (
                    <p key={`${index}-${line}`}>{line || " "}</p>
                  ))}
                </article>
              </>
            )}

            <div className="lb-actions">
              <button
                className="lb-btn lb-btn-soft"
                onClick={() => ctx.navigate(`/${encodeURIComponent(ctx.profile?.handle || ctx.activeHandle || "")}`)}
              >
                Back To Profile
              </button>
            </div>
          </section>

          {renderStatusPanel(ctx)}
        </main>
      );
    }

    return null;
  },
};
