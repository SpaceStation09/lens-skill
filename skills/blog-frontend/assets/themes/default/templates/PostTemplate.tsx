import type { PostView } from "../../../starter-shell/lib/lens/contracts";

export function PostTemplate({ post }: { post: PostView }) {
  return (
    <article className="theme-card">
      <h2>{post.title ?? "Untitled post"}</h2>
      <p>{post.content}</p>
      {post.tags?.length ? <p>{post.tags.join(", ")}</p> : null}
    </article>
  );
}
