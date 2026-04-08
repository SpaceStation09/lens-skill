import type { PostView } from "../../../starter-shell/lib/lens/contracts";
import { ThemeFrame } from "./ThemeFrame";

function estimateWordCount(content?: string | null) {
  if (!content) return 0;
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function PostTemplate({
  post,
  loading,
  error,
  profileHref,
  connectedWallet,
  walletChecking,
  lensHandle,
  lensAccountAddress,
  canShowAccountActions,
  onLogoutLens,
  onDisconnectWallet,
  contentNode,
}: {
  post: PostView | null;
  loading?: boolean;
  error?: string | null;
  profileHref: string;
  connectedWallet: string | null;
  walletChecking: boolean;
  lensHandle: string | null;
  lensAccountAddress: string | null;
  canShowAccountActions: boolean;
  onLogoutLens: () => void;
  onDisconnectWallet: () => void;
  contentNode?: any;
}) {
  const wordCount = estimateWordCount(post?.content);

  return (
    <ThemeFrame
      mainClassName="monolith-main--article"
      nav={[
        { label: "Home", href: "/" },
        { label: "Write", href: "/compose" },
        { label: "Profile", href: profileHref, active: true },
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
      {loading ? <p className="state-block">Loading post...</p> : null}
      {error ? <p className="state-block state-block--error">{error}</p> : null}
      {!loading && !error && post ? (
        <article className="article-template">
          {post.tags?.[0] ? <p className="theme-chip">{post.tags[0]}</p> : null}
          <h1 className="article-template__title">{post.title ?? "Untitled article"}</h1>
          <div className="article-template__meta">
            {post.createdAt ? <span>{post.createdAt}</span> : null}
            <span>{wordCount} words</span>
          </div>

          <div className="article-template__hero" aria-hidden="true" />

          <div className="article-template__body">
            {contentNode ?? <p>{post.content}</p>}
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
      ) : null}
    </ThemeFrame>
  );
}
