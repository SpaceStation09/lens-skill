import { PostDetailShell } from "@/features/post/PostDetailShell";

export default async function PostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  return <PostDetailShell postId={postId} />;
}
