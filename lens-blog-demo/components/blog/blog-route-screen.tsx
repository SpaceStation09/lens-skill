"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isOwnerView } from "@/lib/blog/guards/owner";
import { useBlog } from "@/lib/blog/provider/state";
import { BlogRoute, PostView, ProfileView } from "@/lib/blog/types";
import { DefaultTheme } from "@/components/blog/theme-default";
import "@/components/blog/theme-default/styles.css";

type Props = {
  route: BlogRoute;
};

function shortAddress(input?: string): string {
  if (!input) return "-";
  return `${input.slice(0, 6)}...${input.slice(-4)}`;
}

function identiconDataUri(address: string): string {
  const source = (address || "lens").toLowerCase();
  const hue = source.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
  const bg = `hsl(${hue} 78% 89%)`;
  const fg = `hsl(${(hue + 210) % 360} 65% 33%)`;
  const text = (source.replace(/[^a-z0-9]/g, "") || "lens").slice(0, 2).toUpperCase();

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='100%' height='100%' rx='18' fill='${bg}'/><text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle' font-size='34' font-family='sans-serif' fill='${fg}'>${text}</text></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function BlogRouteScreen({ route }: Props) {
  const router = useRouter();
  const {
    lensService,
    accountState,
    walletAddress,
    session,
    activeHandle,
    activeAccountAddress,
    accounts,
    selectedAccount,
    setSelectedAccount,
    createUsername,
    setCreateUsername,
    isCheckingUsername,
    isCreatingAccount,
    usernameCheckMessage,
    status,
    connectWalletNode,
    loginLens,
    createLensAccount,
    canCreateUsername,
    resetLensAuth,
  } = useBlog();

  const [profile, setProfile] = React.useState<ProfileView | null>(null);
  const [posts, setPosts] = React.useState<PostView[]>([]);
  const [activePost, setActivePost] = React.useState<PostView | null>(null);

  const [query, setQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 6;

  const [draftTitle, setDraftTitle] = React.useState("");
  const [draftContent, setDraftContent] = React.useState("");
  const [draftTags, setDraftTags] = React.useState("");
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [localStatus, setLocalStatus] = React.useState<string>();

  React.useEffect(() => {
    setLocalStatus(undefined);
  }, [route.name]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadRouteData() {
      if (route.name === "profile") {
        const [nextProfile, nextPosts] = await Promise.all([
          lensService.getProfileByHandle(route.handle),
          lensService.getPostsByHandle(route.handle),
        ]);

        if (cancelled) return;
        setProfile(nextProfile);
        setPosts(nextPosts);
        setActivePost(null);
        return;
      }

      if (route.name === "post") {
        const nextPost = await lensService.getPostById(route.postId);
        if (cancelled) return;
        setActivePost(nextPost);

        if (nextPost && activeHandle) {
          const ownerProfile = await lensService.getProfileByHandle(activeHandle);
          if (!cancelled) setProfile(ownerProfile);
        }
        return;
      }

      if (route.name === "write") {
        if (activeHandle) {
          const ownerProfile = await lensService.getProfileByHandle(activeHandle);
          if (!cancelled) setProfile(ownerProfile);
        }
        setActivePost(null);
        return;
      }

      setProfile(null);
      setPosts([]);
      setActivePost(null);
    }

    void loadRouteData();
    return () => {
      cancelled = true;
    };
  }, [activeHandle, lensService, route]);

  const filteredPosts = React.useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return posts;

    return posts.filter((item) => {
      const source = [item.title, item.excerpt, item.content, item.tags.join(" ")].join(" ").toLowerCase();
      return source.includes(keyword);
    });
  }, [posts, query]);

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const pagePosts = React.useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, safePage]);

  React.useEffect(() => {
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const viewerIsOwner = React.useMemo(() => {
    if (route.name === "write") {
      // /write is scoped to current authenticated account; avoid gate flicker while profile is loading.
      return accountState === "authenticated" && Boolean(activeAccountAddress);
    }

    return isOwnerView({
      accountState,
      activeAccountAddress,
      profileAddress: profile?.address,
    });
  }, [accountState, activeAccountAddress, profile?.address, route.name]);

  const stateStatus = localStatus || status;

  const handlePublish = React.useCallback(async () => {
    if (!(accountState === "authenticated" && viewerIsOwner)) {
      setLocalStatus("当前账号没有发布权限，请切换 owner 账号");
      return;
    }

    setIsPublishing(true);
    try {
      const postId = await lensService.publishPost({
        title: draftTitle,
        content: draftContent,
        tags: draftTags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      setLocalStatus("发布成功，正在跳转...");
      router.push(`/p/${encodeURIComponent(postId.postId)}`);
    } catch (error) {
      setLocalStatus(error instanceof Error ? error.message : "发布失败");
    } finally {
      setIsPublishing(false);
    }
  }, [accountState, draftContent, draftTags, draftTitle, lensService, router, viewerIsOwner]);

  const targetHandle = React.useMemo(() => {
    if (route.name === "profile") return route.handle;
    if (activeHandle) return activeHandle;
    if (profile?.handle) return profile.handle;
    if (session?.handle) return session.handle;
    return "";
  }, [activeHandle, profile?.handle, route, session?.handle]);

  const ctx = React.useMemo(
    () => ({
      route,
      accountState,
      isAuthenticated: accountState === "authenticated",
      isOwnerView: viewerIsOwner,
      activeHandle: targetHandle,
      walletAddress,

      connectWalletNode,

      accounts,
      selectedAccount,
      setSelectedAccount,
      loginSelectedAccount: () => void loginLens(selectedAccount),
      createUsername,
      setCreateUsername,
      canCreateUsername: () => void canCreateUsername(createUsername),
      createLensAccount: () => void createLensAccount(createUsername),
      isCheckingUsername,
      isCreatingAccount,
      usernameCheckMessage,
      resetLensAuth,

      profile,
      pagePosts,
      activePost,

      query,
      setQuery,
      currentPage: safePage,
      pageCount,
      toPrevPage: () => setCurrentPage((prev) => Math.max(1, prev - 1)),
      toNextPage: () => setCurrentPage((prev) => Math.min(pageCount, prev + 1)),

      draftTitle,
      setDraftTitle,
      draftContent,
      setDraftContent,
      draftTags,
      setDraftTags,
      isPublishing,
      publishDraft: handlePublish,

      navigate: (path: string) => router.push(path),
      shortAddress,
      identiconDataUri,
      status: stateStatus,
    }),
    [
      route,
      accountState,
      viewerIsOwner,
      targetHandle,
      walletAddress,
      connectWalletNode,
      accounts,
      selectedAccount,
      setSelectedAccount,
      loginLens,
      createUsername,
      setCreateUsername,
      canCreateUsername,
      createLensAccount,
      isCheckingUsername,
      isCreatingAccount,
      usernameCheckMessage,
      resetLensAuth,
      profile,
      pagePosts,
      activePost,
      query,
      safePage,
      pageCount,
      draftTitle,
      draftContent,
      draftTags,
      isPublishing,
      handlePublish,
      router,
      stateStatus,
    ],
  );

  return <DefaultTheme ctx={ctx} />;
}
