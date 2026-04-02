import type { AccountView, PostView } from "../../../starter-shell/lib/lens/contracts";

export function ProfileTemplate({
  profile,
  posts,
}: {
  profile: AccountView;
  posts: PostView[];
}) {
  return (
    <section className="theme-profile">
      <header>
        <h2>{profile.name ?? profile.username ?? profile.address}</h2>
        {profile.bio ? <p>{profile.bio}</p> : null}
      </header>
      <div className="theme-feed">
        {posts.map((post) => (
          <article key={post.id} className="theme-card">
            <h3>{post.title ?? "Untitled post"}</h3>
            <p>{post.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
