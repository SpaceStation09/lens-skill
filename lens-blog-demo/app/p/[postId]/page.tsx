import { BlogRouteScreen } from "@/components/blog/blog-route-screen";

export default function PostPage({ params }: { params: { postId: string } }) {
  return <BlogRouteScreen route={{ name: "post", postId: decodeURIComponent(params.postId || "") }} />;
}
