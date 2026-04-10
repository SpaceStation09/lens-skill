"use client";

import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { SidebarPanel } from "@/components/theme/SidebarPanel";
import { ThemeFrame } from "@/components/theme/ThemeFrame";
import type { AccountView, PostView } from "@/lib/lens/contracts";
import { fetchPostsByHandle, fetchProfileByHandle } from "@/lib/lens/service";
import { createAbstract } from "@/lib/utils/content";
import { useLensSession } from "@/providers/LensSessionProvider";

export function ProfilePageShell({ handle }: { handle: string }) {
  const { wallets } = useWallets();
  const wallet = wallets[0] ?? null;
  const { activeProfile } = useLensSession();
  const [profile, setProfile] = useState<AccountView | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setStatus("loading");
      const [profileResult, postsResult] = await Promise.all([fetchProfileByHandle(handle), fetchPostsByHandle(handle)]);

      if (cancelled) return;

      if (profileResult.success && profileResult.data) {
        setProfile(profileResult.data);
      }

      if (postsResult.success && postsResult.data) {
        setPosts(postsResult.data.items);
      }

      setStatus("ready");
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [handle]);

  return (
    <ThemeFrame
      nav={[
        { label: "Profile", href: `/profile/${handle}`, active: true },
        { label: "Write", href: "/compose" },
        { label: "Access", href: "/auth" },
      ]}
      sidebarPanel={
        <SidebarPanel
          label="Profile Feed"
          walletAddress={wallet?.address}
          lensAccount={
            activeProfile
              ? {
                  address: activeProfile.address,
                  username: activeProfile.username,
                }
              : undefined
          }
          note={status === "loading" ? "Loading profile..." : undefined}
          status={status === "ready" ? "ready" : "stub"}
        />
      }
    >
      <section className="profile-hero">
        <div className="profile-hero__media">
          <div className="profile-hero__fallback">{status === "loading" ? "..." : profile?.name?.slice(0, 1) ?? "L"}</div>
        </div>
        <p className="theme-kicker">{status === "loading" ? "Loading profile" : `@${profile?.username}`}</p>
        <h2 className="profile-hero__title">{status === "loading" ? "Opening profile..." : profile?.name}</h2>
        <p className="profile-hero__bio">
          {status === "loading" ? "Resolving the active Lens account and fetching its posts." : profile?.bio}
        </p>
        <div className="profile-hero__stats" aria-label="Profile stats">
          <div>
            <strong>{String(posts.length).padStart(2, "0")}</strong>
            <span>Posts</span>
          </div>
          <div>
            <strong>{String(profile?.attributes?.length ?? 0).padStart(2, "0")}</strong>
            <span>Fields</span>
          </div>
          <div>
            <strong>{status === "ready" ? "01" : "00"}</strong>
            <span>Source</span>
          </div>
        </div>
      </section>

      <section className="section-heading">
        <span>{status === "loading" ? "Loading Posts" : "Recent Posts"}</span>
      </section>

      <div className="essay-list">
        {posts.map((post) => (
          <article key={post.id} className="essay-card">
            <p className="essay-card__meta">{post.createdAt}</p>
            <h3>{post.title}</h3>
            <p className="essay-card__excerpt">{createAbstract(post.content ?? "")}</p>
            <Link href={`/post/${post.id}`} className="essay-card__link">
              Read article
            </Link>
          </article>
        ))}
      </div>
    </ThemeFrame>
  );
}
