import { AppLayout } from "../../components/shell/AppLayout";
import { ErrorState } from "../../components/shell/StateViews";
import { PageContainer } from "../../components/shell/PageContainer";
import type { PostView } from "../../lib/lens/contracts";

const demoPost: PostView = {
  id: "post-1",
  authorAddress: "0x1234567890abcdef1234567890abcdef12345678",
  title: "Starter shell article",
  content: "Article content should render here.",
  tags: ["lens", "blog"],
  createdAt: "2026-04-02T00:00:00.000Z",
};

export function PostDetailShell({ postId }: { postId: string }) {
  const post = demoPost;

  if (!post.content) {
    return (
      <AppLayout title="Post unavailable">
        <PageContainer>
          <ErrorState message="Post content is missing and cannot be rendered." />
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={post.title ?? "Untitled post"}>
      <PageContainer>
        <article className="card">
          <p className="muted">post id: {postId}</p>
          {post.tags?.length ? (
            <ul className="tag-list">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          <p>{post.content}</p>
          {post.createdAt ? <p className="muted">{post.createdAt}</p> : null}
        </article>
      </PageContainer>
    </AppLayout>
  );
}
