"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import { SidebarPanel } from "@/components/theme/SidebarPanel";
import { ThemeFrame } from "@/components/theme/ThemeFrame";
import { lensRuntimeConfig } from "@/lib/lens/config";
import { buildPublishPreview, publishLensArticle } from "@/lib/lens/service";
import { getProfileHref } from "@/lib/utils/profile-path";
import { useLensSession } from "@/providers/LensSessionProvider";

export function ComposePageShell() {
  if (!lensRuntimeConfig.privyAppId) {
    return (
        <ThemeFrame
          nav={[
          { label: "Profile", href: "/auth" },
          { label: "Write", href: "/compose", active: true },
          { label: "Access", href: "/auth" },
        ]}
        sidebarPanel={<SidebarPanel label="Compose Flow" note="Add Privy config to enable publishing." status="stub" />}
      >
        <section className="auth-hero">
          <p className="theme-kicker">Editor</p>
          <h2>Configure Privy To Use Auth-Aware Publishing</h2>
          <p>
            The editor UI is ready, but the live write flow depends on a wallet session from Privy and a public metadata uploader.
          </p>
        </section>
      </ThemeFrame>
    );
  }

  return <ComposePageShellWithPrivy />;
}

function ComposePageShellWithPrivy() {
  const { wallets } = useWallets();
  const wallet = wallets[0] ?? null;
  const { activeProfile, hasActiveSession, refreshLensSession } = useLensSession();
  const [title, setTitle] = useState("A quiet publishing stack for Lens");
  const [content, setContent] = useState(
    "This demo now reads live Lens data when available and can establish a Lens session from Privy.\n\nThe remaining write-path gap is metadata upload, which must produce a public content URI before the post mutation can execute.",
  );
  const [tags, setTags] = useState("lens, blog, article");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sidebarNote, setSidebarNote] = useState("Ready to publish.");

  const words = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("Publishing...");
    setSidebarNote("Publishing article...");
    const parsedTags = tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    await buildPublishPreview({
      title,
      content,
      tags: parsedTags,
    });

    const result = await publishLensArticle({
      title,
      content,
      tags: parsedTags,
      wallet,
    });

    await refreshLensSession();

    if (result.success && result.data) {
      setFeedback(`Published. tx: ${result.data.txHash} contentUri: ${result.data.contentUri}`);
      setSidebarNote("Publish succeeded.");
      return;
    }

    setFeedback(result.error?.message ?? "Publish failed.");
    setSidebarNote("Publish failed.");
  }

  return (
    <ThemeFrame
      nav={[
        { label: "Profile", href: getProfileHref(activeProfile?.username) },
        { label: "Write", href: "/compose", active: true },
        { label: "Access", href: "/auth" },
      ]}
      sidebarPanel={
        <SidebarPanel
          label="Compose Flow"
          walletAddress={wallet?.address}
          lensAccount={
            activeProfile
              ? {
                  address: activeProfile.address,
                  username: activeProfile.username,
                }
              : undefined
          }
          note={sidebarNote}
          status={wallet ? "ready" : "stub"}
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <header className="compose-topbar">
          <p className="theme-kicker">Editor</p>
          <div className="compose-topbar__actions">
            <button type="submit" className="solid-button">
              Publish
            </button>
          </div>
        </header>

        <section className="compose-layout compose-layout--with-sidebar">
          <div className="compose-editor">
            <input
              aria-label="Entry title"
              className="compose-title-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter your article title"
            />

            <div className="compose-meta-grid">
              <label>
                <span>Tags</span>
                <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="design, writing, notes" />
              </label>
            </div>

            <div className="editor-surface">
              <div className="editor-toolbar" aria-hidden="true">
                <span>B</span>
                <span>I</span>
                <span>“”</span>
                <span>Link</span>
                <span>List</span>
              </div>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={16} />
              <div className="editor-stats">
                <span>Words: {words}</span>
                <span>Chars: {content.length}</span>
                <span>Reading: {Math.max(1, Math.ceil(words / 200))}m</span>
              </div>
            </div>

            {feedback ? <p className="state-block">{feedback}</p> : null}
          </div>

          <aside className="compose-sidebar">
            <h2>Publish Notes</h2>
            <section className="compose-sidebar__section">
              <span className="compose-sidebar__label">Current state</span>
              <div className="compose-sidebar__value">{hasActiveSession ? "lens session ready" : "lens login required"}</div>
            </section>
            <section className="compose-sidebar__section">
              <span className="compose-sidebar__label">Storage</span>
              <div className="compose-sidebar__value">grove uploadAsJson</div>
            </section>
          </aside>
        </section>
      </form>
    </ThemeFrame>
  );
}
