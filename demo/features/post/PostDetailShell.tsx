"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PostTemplate } from "../../../skills/blog-frontend/assets/themes/default/templates/PostTemplate";
import type { PostView } from "../../lib/lens/contracts";
import { getPostById } from "../../lib/lens/browser-client";
import { useLensAuth } from "../../providers/lens-auth-context";

export function PostDetailShell({ postId }: { postId: string }) {
  const { session, connectedWallet, walletChecking, logoutLens, disconnectWallet } = useLensAuth();
  const [post, setPost] = useState<PostView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      const result = await getPostById(postId);
      if (!active) return;
      if (!result.success || !result.data) {
        setError(result.error?.message ?? "Post is unavailable.");
        setLoading(false);
        return;
      }
      setPost(result.data);
      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [postId]);

  return (
    <PostTemplate
      post={post}
      loading={loading}
      error={error}
      profileHref={session?.handle ? `/profile/${session.handle}` : "/auth"}
      connectedWallet={connectedWallet}
      walletChecking={walletChecking}
      lensHandle={session?.handle ?? null}
      lensAccountAddress={session?.accountAddress ?? null}
      canShowAccountActions={Boolean(session)}
      onLogoutLens={() => void logoutLens()}
      onDisconnectWallet={() => void disconnectWallet()}
      contentNode={<ReactMarkdown remarkPlugins={[remarkGfm]}>{post?.content ?? ""}</ReactMarkdown>}
    />
  );
}
