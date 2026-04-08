"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ComposeTemplate } from "../../../skills/blog-frontend/assets/themes/default/templates/ComposeTemplate";
import { publishArticle } from "../../lib/lens/browser-client";
import { useLensAuth } from "../../providers/lens-auth-context";

export function ComposePageShell() {
  const { session, connectedWallet, walletChecking, logoutLens, disconnectWallet } = useLensAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [publishDate, setPublishDate] = useState("--");

  useEffect(() => {
    setPublishDate(new Date().toLocaleDateString());
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    const result = await publishArticle({
      title,
      content,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });

    if (!result.success || !result.data) {
      setFeedback(result.error?.message ?? "Failed to publish article.");
      return;
    }

    router.push(`/post/${result.data.id}`);
  }

  return (
    <ComposeTemplate
      title={title}
      content={content}
      tags={tags}
      feedback={feedback}
      publishDate={publishDate}
      onTitleChange={setTitle}
      onContentChange={setContent}
      onTagsChange={setTags}
      onSubmit={onSubmit}
      profileHref={session?.handle ? `/profile/${session.handle}` : "/auth"}
      connectedWallet={connectedWallet}
      walletChecking={walletChecking}
      lensHandle={session?.handle ?? null}
      lensAccountAddress={session?.accountAddress ?? null}
      canShowAccountActions={Boolean(session)}
      onLogoutLens={() => void logoutLens()}
      onDisconnectWallet={() => void disconnectWallet()}
    />
  );
}
