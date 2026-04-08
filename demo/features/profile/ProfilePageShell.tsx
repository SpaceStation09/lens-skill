"use client";

import { useEffect, useState } from "react";
import { ProfileTemplate } from "../../theme/default/templates/ProfileTemplate";
import type { AccountView, LensPage, PostView } from "../../lib/lens/contracts";
import { getPostsByHandle, getProfileByHandle } from "../../lib/lens/browser-client";
import { useLensAuth } from "../../providers/lens-auth-context";

export function ProfilePageShell({ handle }: { handle: string }) {
  const { session, connectedWallet, walletChecking, logoutLens, disconnectWallet } = useLensAuth();
  const [profile, setProfile] = useState<AccountView | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);

      const profileResult = await getProfileByHandle(handle);
      if (!active) return;
      if (!profileResult.success || !profileResult.data) {
        setError(profileResult.error?.message ?? "Failed to load profile.");
        setLoading(false);
        return;
      }

      setProfile(profileResult.data);

      const postsResult = await getPostsByHandle(handle);
      if (!active) return;
      if (!postsResult.success || !postsResult.data) {
        setPosts([]);
      } else {
        setPosts((postsResult.data as LensPage<PostView>).items);
      }

      setLoading(false);
    }
    void load();
    return () => {
      active = false;
    };
  }, [handle]);

  return (
    <ProfileTemplate
      profile={profile}
      posts={posts}
      loading={loading}
      error={error}
      buildPostHref={(post) => `/post/${post.id}`}
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
