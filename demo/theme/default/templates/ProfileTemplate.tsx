import type { AccountView, PostView } from "../../../lib/lens/contracts";
import { ThemeFrame } from "./ThemeFrame";

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
  loading,
  error,
  buildPostHref,
  profileHref,
  connectedWallet,
  walletChecking,
  lensHandle,
  lensAccountAddress,
  canShowAccountActions,
  onLogoutLens,
  onDisconnectWallet,
}: {
  profile: AccountView | null;
  posts: PostView[];
  loading?: boolean;
  error?: string | null;
  buildPostHref?: (post: PostView) => string;
  profileHref: string;
  connectedWallet: string | null;
  walletChecking: boolean;
  lensHandle: string | null;
  lensAccountAddress: string | null;
  canShowAccountActions: boolean;
  onLogoutLens: () => void;
  onDisconnectWallet: () => void;
}) {
  return (
    <ThemeFrame
      nav={[
        { label: "Home", href: "/", active: true },
        { label: "Write", href: "/compose" },
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
      {loading ? <p className="state-block">Loading profile...</p> : null}
      {error ? <p className="state-block state-block--error">{error}</p> : null}

      {!loading && !error && profile ? (
        <>
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
            <h2 className="profile-hero__title">{profile.name ?? profile.username ?? profile.address}</h2>
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
            <span>Recent Posts</span>
          </section>

          <div className="essay-list">
            {posts.length === 0 ? <p className="state-block">No posts yet.</p> : null}
            {posts.map((post) => (
              <article key={post.id} className="essay-card">
                <p className="essay-card__meta">{post.createdAt ?? "Date unavailable"}</p>
                <h3>{post.title ?? "Untitled post"}</h3>
                <p className="essay-card__excerpt">{buildExcerpt(post)}</p>
                <a href={buildPostHref ? buildPostHref(post) : "#"} className="essay-card__link">
                  Read article
                </a>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </ThemeFrame>
  );
}
