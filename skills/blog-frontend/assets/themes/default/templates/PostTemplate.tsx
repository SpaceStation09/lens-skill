import type { PostView } from "../../../starter-shell/lib/lens/contracts";

function estimateWordCount(content?: string | null) {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function PostTemplate({ post }: { post: PostView }) {
  const wordCount = estimateWordCount(post.content);

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

      <main className="monolith-main monolith-main--article">
        <article className="article-template">
          {post.tags?.[0] ? <p className="theme-chip">{post.tags[0]}</p> : null}
          <h1 className="article-template__title">
            {post.title ?? "Untitled post"}
          </h1>
          <div className="article-template__meta">
            {post.createdAt ? <span>{post.createdAt}</span> : null}
            <span>{wordCount} words</span>
          </div>

          <div className="article-template__hero" aria-hidden="true" />

          <div className="article-template__body">
            {post.content?.split("\n\n").filter(Boolean).map((paragraph, index) => (
              <p key={`${post.id}-${index}`}>{paragraph}</p>
            ))}
          </div>

          {post.tags?.length ? (
            <footer className="article-template__tags">
              <span>Tags:</span>
              <ul>
                {post.tags.map((tag) => (
                  <li key={tag}>#{tag}</li>
                ))}
              </ul>
            </footer>
          ) : null}
        </article>
      </main>
    </section>
  );
}
