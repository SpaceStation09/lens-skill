export function AuthTemplate() {
  return (
    <section className="monolith-frame">
      <aside className="monolith-sidebar">
        <div className="monolith-brand">
          <h1>The Monolith</h1>
          <p>Purity through Precision</p>
        </div>
        <nav className="monolith-nav" aria-label="Primary">
          <a className="is-active" href="#">
            Home
          </a>
          <a href="#">Archives</a>
          <a href="#">About</a>
        </nav>
        <div className="monolith-sidebar__footer">
          <a href="#">GitHub</a>
        </div>
      </aside>

      <main className="monolith-main monolith-main--centered">
        <section className="auth-hero">
          <p className="theme-kicker">Access Restricted</p>
          <h2>The Digital Curator</h2>
          <p>
            Enter the monolith to access the archives of structural purity and
            digital precision.
          </p>
          <button type="button" className="solid-button auth-hero__button">
            Connect Wallet With Privy
          </button>
          <small>Identity authentication required for transmission access</small>
        </section>

        <section className="persona-grid" aria-label="Persona selection">
          <article className="persona-card">
            <div className="persona-card__avatar" />
            <h3>Elena Rostova</h3>
            <p>Lead architect and editor.</p>
            <button type="button" className="solid-button">
              Select
            </button>
          </article>
          <article className="persona-card">
            <div className="persona-card__avatar" />
            <h3>The Curator</h3>
            <p>Anonymous manager of the monolith.</p>
            <button type="button" className="solid-button">
              Select
            </button>
          </article>
          <article className="persona-card persona-card--ghost">
            <div className="persona-card__plus">+</div>
            <p>Link New Account</p>
          </article>
        </section>
      </main>
    </section>
  );
}
