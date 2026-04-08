import { PostDetailShell } from "../../../features/post/PostDetailShell";

export default function PostPage({
  params,
}: {
  params: { postId: string };
}) {
  return <PostDetailShell postId={params.postId} />;
}
