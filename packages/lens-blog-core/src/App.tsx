import { useEffect, useMemo, useState } from "react";
import type { LensBlogAdapter } from "./lib/adapter";
import type { AccountState, PostView, ProfileView, WalletAccountOption } from "./types/contracts";
import type { BlogTheme, RouteState, ThemeRenderContext } from "./theme/types";

type Props = {
  adapter: LensBlogAdapter;
  theme: BlogTheme;
  walletAddress?: string;
  isWalletConnected: boolean;
  walletConnectionStatus?: "connected" | "connecting" | "reconnecting" | "disconnected";
  connectWalletNode?: JSX.Element;
};

const PAGE_SIZE = 6;

function getCurrentPathname(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname;
}

function parseRoute(pathname: string): RouteState {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/") return { name: "home" };
  if (clean === "/write") return { name: "write" };
  if (clean.startsWith("/p/")) return { name: "post", postId: decodeURIComponent(clean.slice(3)) };
  return { name: "profile", handle: decodeURIComponent(clean.slice(1)) };
}

function shortAddress(address?: string): string {
  if (!address) return "";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function normalizeHandle(input?: string): string {
  return String(input || "").trim().replace(/^@/, "").toLowerCase();
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function identiconDataUri(address: string): string {
  const size = 60;
  const cell = size / 5;
  const seed = hashString(address.toLowerCase() || "lens");
  const hue = seed % 360;
  let rects = "";

  for (let y = 0; y < 5; y += 1) {
    for (let x = 0; x < 3; x += 1) {
      if (((seed >> (x + y * 3)) & 1) === 0) continue;
      rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="hsl(${hue},68%,42%)"/>`;
      if (x !== 2) {
        rects += `<rect x="${(4 - x) * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="hsl(${hue},68%,42%)"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="#f3f4f6" rx="12"/>${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function BlogFrontendApp({
  adapter,
  theme,
  walletAddress,
  isWalletConnected,
  walletConnectionStatus,
  connectWalletNode,
}: Props) {
  const [route, setRoute] = useState<RouteState>(() => parseRoute(getCurrentPathname()));
  const [accountState, setAccountState] = useState<AccountState>("disconnected");
  const [accounts, setAccounts] = useState<WalletAccountOption[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [activeHandle, setActiveHandle] = useState("");
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [posts, setPosts] = useState<PostView[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftTags, setDraftTags] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState("Ready");

  const walletConnected = isWalletConnected;

  function navigate(path: string) {
    if (typeof window === "undefined") return;
    if (window.location.pathname === path) return;
    window.history.pushState({}, "", path);
    setRoute(parseRoute(path));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onPopState = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!walletConnected) {
      setActiveHandle("");
      setAccountState("disconnected");
      return;
    }
    if (activeHandle) {
      setAccountState("authenticated");
      return;
    }
    setAccountState("connected_unauthed");
  }, [activeHandle, walletConnected]);

  useEffect(() => {
    if (walletConnected) return;
    // Keep profile and post pages publicly readable without wallet connection.
    if (route.name === "home" || route.name === "profile" || route.name === "post") return;
    navigate("/");
  }, [route.name, walletConnected]);

  useEffect(() => {
    if (route.name !== "write") return;
    if (accountState === "authenticated") return;
    setStatus("Write access requires Lens account login.");
    if (profile?.handle) {
      navigate(`/${encodeURIComponent(profile.handle)}`);
      return;
    }
    navigate("/");
  }, [accountState, profile, route.name]);

  useEffect(() => {
    if (route.name !== "home") return;
    if (!walletConnected || !walletAddress || accountState !== "connected_unauthed") return;

    (async () => {
      setStatus("Loading wallet accounts...");
      const walletAccounts = await adapter.getWalletAccounts(walletAddress);
      setAccounts(walletAccounts);
      if (walletAccounts[0]?.address) setSelectedAccount(walletAccounts[0].address);
      setStatus(walletAccounts.length ? `Found ${walletAccounts.length} account(s).` : "No account found.");
    })().catch((error) => setStatus(`Load wallet accounts failed: ${String(error)}`));
  }, [accountState, adapter, route.name, walletAddress, walletConnected]);

  useEffect(() => {
    if (route.name !== "profile") return;

    (async () => {
      setStatus(`Loading @${route.handle} ...`);
      const p = await adapter.getProfileByHandle(route.handle);
      const feed = await adapter.getPostsByAuthor(p.address);
      setProfile(p);
      setPosts(feed);
      setStatus(`Loaded ${feed.length} posts.`);
    })().catch((error) => setStatus(`Load profile/feed failed: ${String(error)}`));
  }, [adapter, route]);

  useEffect(() => {
    if (route.name !== "post") return;

    (async () => {
      const existing = posts.find((item) => item.id === route.postId);
      if (existing) {
        if (!profile && existing.authorAddress) {
          const postAuthor = await adapter.getProfileByAddress(existing.authorAddress);
          setProfile(postAuthor);
        }
        setStatus("Post loaded.");
        return;
      }

      setStatus("Loading post...");
      const loaded = await adapter.getPostById(route.postId);
      if (!loaded) {
        setStatus("Post not found.");
        return;
      }

      upsertPost(loaded);
      if (!profile && loaded.authorAddress) {
        const postAuthor = await adapter.getProfileByAddress(loaded.authorAddress);
        setProfile(postAuthor);
      }
      setStatus("Post loaded.");
    })().catch((error) => setStatus(`Load post failed: ${String(error)}`));
  }, [adapter, posts, profile, route]);

  async function loginSelectedAccount() {
    if (!selectedAccount) return;
    const result = await adapter.loginWithAccount(selectedAccount);
    if (!result.handle) {
      setStatus("This account has no handle.");
      return;
    }
    setActiveHandle(result.handle);
    navigate(`/${encodeURIComponent(result.handle)}`);
  }

  function resetLensAuth() {
    setActiveHandle("");
    setStatus("Lens session cleared. Please select an account again.");
    navigate("/");
  }

  function upsertPost(next: PostView) {
    setPosts((prev) => {
      const index = prev.findIndex((item) => item.id === next.id);
      if (index === -1) return [next, ...prev];
      const copied = [...prev];
      copied[index] = next;
      return copied;
    });
  }

  async function publishDraft() {
    if (accountState !== "authenticated") {
      setStatus("Publish requires Lens account login.");
      return;
    }

    const title = draftTitle.trim();
    const content = draftContent.trim();
    const tags = draftTags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!title || !content) {
      setStatus("Title and content are required.");
      return;
    }

    setIsPublishing(true);
    try {
      setStatus("Publishing post...");
      await adapter.publishPost({ title, content, tags });
      setDraftTitle("");
      setDraftContent("");
      setDraftTags("");

      if (profile?.address) {
        const feed = await adapter.getPostsByAuthor(profile.address);
        setPosts(feed);
      }

      setStatus("Post published.");
      if (activeHandle) navigate(`/${encodeURIComponent(activeHandle)}`);
    } catch (error) {
      setStatus(`Publish failed: ${String(error)}`);
    } finally {
      setIsPublishing(false);
    }
  }

  const filtered = useMemo(() => {
    const key = query.trim().toLowerCase();
    return posts.filter((p) => !key || `${p.title} ${p.excerpt} ${p.content}`.toLowerCase().includes(key));
  }, [posts, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagePosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activePost = route.name === "post" ? posts.find((item) => item.id === route.postId) || null : null;
  const isAuthenticated = accountState === "authenticated";
  const isOwnerView =
    isAuthenticated &&
    !!activeHandle &&
    !!profile?.handle &&
    normalizeHandle(activeHandle) === normalizeHandle(profile.handle);

  const ctx: ThemeRenderContext = {
    route,
    accountState,
    isAuthenticated,
    isOwnerView,
    activeHandle,
    connectWalletNode,
    walletAddress,
    status: walletConnectionStatus && walletConnectionStatus !== "connected" ? `${status} (${walletConnectionStatus})` : status,
    accounts,
    selectedAccount,
    setSelectedAccount,
    loginSelectedAccount: () => void loginSelectedAccount(),
    resetLensAuth,
    profile,
    query,
    setQuery: (value) => {
      setQuery(value);
      setPage(1);
    },
    pagePosts,
    activePost,
    currentPage,
    pageCount,
    toPrevPage: () => setPage((v) => Math.max(1, v - 1)),
    toNextPage: () => setPage((v) => Math.min(pageCount, v + 1)),
    draftTitle,
    setDraftTitle,
    draftContent,
    setDraftContent,
    draftTags,
    setDraftTags,
    isPublishing,
    publishDraft: () => void publishDraft(),
    navigate,
    shortAddress,
    identiconDataUri,
  };

  const themed = theme.renderRoute(ctx);
  if (themed) return themed;

  return (
    <main className="layout">
      <section className="panel">
        <p>
          Theme <strong>{theme.id}</strong> does not render this route yet: {route.name}
        </p>
      </section>
      <section className="panel status-panel">
        <pre>{status}</pre>
      </section>
    </main>
  );
}
