import type { AccountView, PostView } from "../../../starter-shell/lib/lens/contracts";

function buildHeroLabel(profile: AccountView) {
  if (profile.username) return `@${profile.username}`;
  return profile.address;
}

function buildStatValue(posts: PostView[]) {
  return String(posts.length).padStart(2, "0");
}

function buildExcerpt(post: PostView) {
  const content = post.content?.trim();
  if (!content) return "No summary available.";
  return content.length > 160 ? `${content.slice(0, 157)}...` : content;
}

export function ProfileTemplate({
  profile,
  posts,
}: {
  profile: AccountView;
  posts: PostView[];
}) {
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
          <a href="#">Tags</a>
          <a href="#">About</a>
        </nav>
        <div className="monolith-sidebar__footer">
          <a href="#">GitHub</a>
          <a href="#">RSS</a>
        </div>
      </aside>

      <main className="monolith-main">
        <section className="profile-hero">
          <div className="profile-hero__media">
            {profile.picture || profile.coverPicture ? (
              <img
                alt={profile.name ?? profile.username ?? "Profile image"}
                src={profile.picture ?? profile.coverPicture ?? ""}
              />
            ) : (
              <div className="profile-hero__fallback">
                {profile.name?.slice(0, 1) ?? profile.username?.slice(0, 1) ?? "M"}
              </div>
            )}
          </div>
          <p className="theme-kicker">{buildHeroLabel(profile)}</p>
          <h2 className="profile-hero__title">
            {profile.name ?? profile.username ?? profile.address}
          </h2>
          {profile.bio ? <p className="profile-hero__bio">{profile.bio}</p> : null}
          <div className="profile-hero__stats" aria-label="Profile stats">
            <div>
              <strong>{buildStatValue(posts)}</strong>
              <span>Posts</span>
            </div>
            <div>
              <strong>{profile.attributes?.length ?? 0}</strong>
              <span>Fields</span>
            </div>
            <div>
              <strong>{profile.coverPicture || profile.picture ? "01" : "00"}</strong>
              <span>Media</span>
            </div>
          </div>
        </section>

        <section className="section-heading">
          <span>Recent Writings</span>
        </section>

        <div className="essay-list">
          {posts.map((post) => (
            <article key={post.id} className="essay-card">
              <p className="essay-card__meta">{post.createdAt ?? "Date unavailable"}</p>
              <h3>{post.title ?? "Untitled post"}</h3>
              <p className="essay-card__excerpt">{buildExcerpt(post)}</p>
              <a href="#" className="essay-card__link">
                Read post
              </a>
            </article>
          ))}
        </div>

        <nav className="pagination-row" aria-label="Pagination">
          <a href="#">Previous</a>
          <a className="is-active" href="#">
            1
          </a>
          <a href="#">2</a>
          <a href="#">3</a>
          <a href="#">Next</a>
        </nav>
      </main>
    </section>
  );
}
