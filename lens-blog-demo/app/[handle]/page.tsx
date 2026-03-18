import { BlogRouteScreen } from "@/components/blog/blog-route-screen";

export default function ProfilePage({ params }: { params: { handle: string } }) {
  return <BlogRouteScreen route={{ name: "profile", handle: decodeURIComponent(params.handle || "") }} />;
}
