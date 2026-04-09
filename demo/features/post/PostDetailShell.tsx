"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SidebarPanel } from "@/components/theme/SidebarPanel";
import { ThemeFrame } from "@/components/theme/ThemeFrame";
import type { PostView } from "@/lib/lens/contracts";
import { demoPosts } from "@/lib/lens/demo-data";
import { fetchLensPost } from "@/lib/lens/service";
import { getProfileHref } from "@/lib/utils/profile-path";
import { useLensSession } from "@/providers/LensSessionProvider";

export function PostDetailShell({ postId }: { postId: string }) {
  const { wallets } = useWallets();
  const wallet = wallets[0] ?? null;
  const { activeProfile } = useLensSession();
  const [post, setPost] = useState<PostView>(demoPosts.find((item) => item.id === postId) ?? demoPosts[0]);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      const result = await fetchLensPost(postId);
      if (cancelled) return;

      if (result.success && result.data) {
        setPost(result.data);
      }

      setStatus("ready");
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const content = post.content ?? "";
  const wordCount = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);

  return (
    <ThemeFrame
      nav={[
        { label: "Profile", href: getProfileHref(activeProfile?.username) },
        { label: "Write", href: "/compose" },
        { label: "Article", href: `/post/${postId}`, active: true },
      ]}
      sidebarPanel={
        <SidebarPanel
          label="Article View"
          walletAddress={wallet?.address}
          lensAccount={{
            address: post.authorAddress,
          }}
          note={status === "loading" ? "Loading article..." : post.id}
          status={status === "ready" ? "ready" : "stub"}
        />
      }
    >
      <article className="article-template">
        {post.tags?.[0] ? <p className="theme-chip">{post.tags[0]}</p> : null}
        <h1 className="article-template__title">{post.title}</h1>
        <div className="article-template__meta">
          <span>{post.createdAt}</span>
          <span>{wordCount} words</span>
        </div>
        <div className="article-template__body markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
        <footer className="article-template__tags">
          <span>{status === "loading" ? "Loading" : "Tags:"}</span>
          <ul>
            {post.tags?.map((tag) => (
              <li key={tag}>#{tag}</li>
            ))}
          </ul>
        </footer>
      </article>
    </ThemeFrame>
  );
}
