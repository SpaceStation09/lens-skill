export function ComposeTemplate() {
  return (
    <section className="monolith-frame">
      <aside className="monolith-sidebar">
        <div className="monolith-brand">
          <h1>The Monolith</h1>
          <p>Purity through Precision</p>
        </div>
        <nav className="monolith-nav" aria-label="Primary">
          <a href="#">Home</a>
          <a className="is-active" href="#">
            Archives
          </a>
          <a href="#">Tags</a>
          <a href="#">About</a>
        </nav>
        <div className="monolith-sidebar__footer">
          <a href="#">GitHub</a>
          <a href="#">RSS</a>
        </div>
      </aside>

      <main className="monolith-main monolith-main--compose">
        <header className="compose-topbar">
          <p className="theme-kicker">Draft / New Entry</p>
          <div className="compose-topbar__actions">
            <button type="button" className="ghost-button">
              Save Draft
            </button>
            <button type="button" className="solid-button">
              Publish
            </button>
          </div>
        </header>

        <section className="compose-layout">
          <div className="compose-editor">
            <input
              aria-label="Entry title"
              className="compose-title-input"
              defaultValue="Title of the Monolith Entry"
            />

            <div className="compose-meta-grid">
              <label>
                <span>Category</span>
                <input defaultValue="Design Philosophy" />
              </label>
              <label>
                <span>Tags</span>
                <input defaultValue="minimalism, editorial, precision" />
              </label>
            </div>

            <div className="editor-surface">
              <div className="editor-toolbar" aria-hidden="true">
                <span>B</span>
                <span>I</span>
                <span>“”</span>
                <span>Link</span>
                <span>List</span>
              </div>
              <textarea
                defaultValue="Start documenting with precision..."
                rows={16}
              />
              <div className="editor-stats">
                <span>Words: 0</span>
                <span>Chars: 0</span>
                <span>Reading: 0m</span>
              </div>
            </div>

            <div className="hero-upload-surface" aria-hidden="true">
              <span>Add hero landscape</span>
            </div>
          </div>

          <aside className="compose-settings">
            <h2>Post Settings</h2>
            <div className="settings-field">
              <span>Publish date</span>
              <p>August 24, 2024</p>
            </div>
            <div className="settings-field">
              <span>Visibility</span>
              <p>Public</p>
            </div>
            <div className="settings-field">
              <span>Excerpt</span>
              <p>Summary for home page...</p>
            </div>
          </aside>
        </section>
      </main>
    </section>
  );
}
