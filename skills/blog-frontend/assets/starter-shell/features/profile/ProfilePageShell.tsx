import { AppLayout } from "../../components/shell/AppLayout";
import { PageContainer } from "../../components/shell/PageContainer";
import { EmptyState } from "../../components/shell/StateViews";
import { buildDisplayName, shortenAddress } from "../../lib/utils/identity";
import type { AccountView, PostView } from "../../lib/lens/contracts";

const demoProfile: AccountView = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  username: "demo",
  name: "Demo Blogger",
  bio: "A baseline Lens blog profile.",
};

const demoPosts: PostView[] = [
  {
    id: "post-1",
    authorAddress: demoProfile.address,
    title: "Starter shell article",
    content: "This starter shell expects article-based content.",
    tags: ["lens", "blog"],
    createdAt: "2026-04-02T00:00:00.000Z",
  },
];

export function ProfilePageShell({ handle }: { handle: string }) {
  const profile = demoProfile;
  const posts = demoPosts;

  return (
    <AppLayout title={buildDisplayName(profile)}>
      <PageContainer>
        <section className="card profile-header">
          <p className="muted">handle</p>
          <p>@{handle}</p>
          <p className="muted">address</p>
          <p>{shortenAddress(profile.address)}</p>
          {profile.bio ? <p>{profile.bio}</p> : null}
        </section>

        <section className="feed-list">
          {posts.length === 0 ? (
            <EmptyState label="No posts yet." />
          ) : (
            posts.map((post) => (
              <article className="card" key={post.id}>
                <h2>{post.title ?? "Untitled post"}</h2>
                <p>{post.content}</p>
                <p className="muted">{post.createdAt}</p>
              </article>
            ))
          )}
        </section>
      </PageContainer>
    </AppLayout>
  );
}
