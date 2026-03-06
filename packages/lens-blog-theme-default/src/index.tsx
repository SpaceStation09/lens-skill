import "./styles.css";

export const defaultTheme = {
  id: "default",
  label: "Default",
  renderRoute(ctx: any) {
    if (ctx.route.name === "home" && ctx.accountState === "disconnected") {
      return (
        <main className="layout theme-default">
          <section className="panel hero">
            <p className="eyebrow">Lens Blog</p>
            <h1>Connect Wallet To Enter Your Profile Landing</h1>
            <p className="muted">
              Wire your wallet button in host app. This template only handles state and layout.
            </p>
            {ctx.connectWalletNode || null}
          </section>
        </main>
      );
    }

    if (ctx.route.name === "home" && ctx.accountState === "connected_unauthed") {
      return (
        <main className="layout theme-default">
          <section className="panel">
            <h1>Select Account</h1>
            <p className="muted">Wallet: {ctx.shortAddress(ctx.walletAddress)}</p>
            <label>
              Lens Account
              <select value={ctx.selectedAccount} onChange={(e) => ctx.setSelectedAccount(e.target.value)}>
                {ctx.accounts.map((item: any) => (
                  <option key={item.address} value={item.address}>
                    {(item.handle ? `@${item.handle}` : "No handle")} · {ctx.shortAddress(item.address)}
                  </option>
                ))}
              </select>
            </label>
            <div className="actions">
              <button disabled={!ctx.selectedAccount} onClick={ctx.loginSelectedAccount}>
                Login Selected Account
              </button>
              {ctx.connectWalletNode || null}
            </div>
          </section>
          <section className="panel status-panel">
            <pre>{ctx.status}</pre>
          </section>
        </main>
      );
    }

    if (ctx.route.name === "profile") {
      return (
        <main className="layout theme-default">
          <section className="panel profile-header">
            <img className="avatar" src={ctx.profile?.avatarUrl || ctx.identiconDataUri(ctx.profile?.address || "lens")} alt={ctx.profile?.displayName || "avatar"} />
            <div>
              <h1>{ctx.profile?.displayName || `@${ctx.route.handle}`}</h1>
              <p className="muted">@{ctx.profile?.handle || ctx.route.handle}</p>
              <p>{ctx.profile?.bio || "No bio provided."}</p>
              <p className="muted">Address: {ctx.shortAddress(ctx.profile?.address)}</p>
              <p className="muted">
                {typeof ctx.profile?.following === "number" ? `Following ${ctx.profile.following}` : ""}
                {typeof ctx.profile?.following === "number" && typeof ctx.profile?.followers === "number" ? " · " : ""}
                {typeof ctx.profile?.followers === "number" ? `Followers ${ctx.profile.followers}` : ""}
              </p>
            </div>
            <div className="profile-actions">
              <button onClick={() => ctx.navigate("/write")}>Write</button>
              <button className="ghost" onClick={ctx.resetLensAuth}>
                Switch Lens Account
              </button>
              {ctx.connectWalletNode || null}
            </div>
          </section>

          <section className="panel feed-tools">
            <label>
              Search
              <input value={ctx.query} onChange={(e) => ctx.setQuery(e.target.value)} placeholder="Search title/content..." />
            </label>
          </section>

          <section className="feed-grid">
            {ctx.pagePosts.map((post: any) => (
              <article className="panel post-card" key={post.id}>
                <p className="muted">{new Date(post.createdAt).toLocaleString()}</p>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button className="ghost" onClick={() => ctx.navigate(`/p/${encodeURIComponent(post.id)}`)}>
                  Read
                </button>
              </article>
            ))}
          </section>

          <section className="panel pagination-row">
            <button className="ghost" disabled={ctx.currentPage <= 1} onClick={ctx.toPrevPage}>
              Prev
            </button>
            <span>
              Page {ctx.currentPage}/{ctx.pageCount}
            </span>
            <button className="ghost" disabled={ctx.currentPage >= ctx.pageCount} onClick={ctx.toNextPage}>
              Next
            </button>
          </section>
        </main>
      );
    }

    return null;
  },
};
