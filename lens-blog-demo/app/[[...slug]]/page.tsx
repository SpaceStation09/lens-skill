import { BlogClientApp } from "../../src/components/BlogClientApp";
import type { RouteState } from "@lens-blog/core";

function toInitialRoute(slug?: string[]): RouteState {
  if (!slug || slug.length === 0) return { name: "home" };
  if (slug.length === 1 && slug[0] === "write") return { name: "write" };
  if (slug[0] === "p" && slug[1]) {
    return { name: "post", postId: decodeURIComponent(slug.slice(1).join("/")) };
  }
  return { name: "profile", handle: decodeURIComponent(slug.join("/")) };
}

export default function CatchAllPage({ params }: { params: { slug?: string[] } }) {
  const initialRoute = toInitialRoute(params.slug);
  return <BlogClientApp initialRoute={initialRoute} />;
}
