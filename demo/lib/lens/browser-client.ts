"use client";

import {
  PublicClient,
  evmAddress,
  mainnet,
  txHash,
  testnet,
  uri,
  type SessionClient,
} from "@lens-protocol/client";
import {
  canCreateUsername,
  createAccountWithUsername as lensCreateAccountWithUsername,
  fetchAccount,
  fetchAccountsAvailable,
  fetchPost,
  fetchPosts,
  post,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { chains as lensChains } from "@lens-chain/sdk/viem";
import { immutable, StorageClient } from "@lens-chain/storage-client";
import { account, article } from "@lens-protocol/metadata";
import { custom, createWalletClient } from "viem";
import type {
  AccountView,
  AuthSessionView,
  LensPage,
  LensResult,
  PostView,
} from "./contracts";

const SESSION_KEY = "lens.demo.session";
const WALLETS_KEY = "lens.demo.wallets";
const POSTS_KEY = "lens.demo.posts";
const CONNECTED_WALLET_KEY = "lens.demo.connectedWallet";

const LENS_ENV = process.env.NEXT_PUBLIC_LENS_ENVIRONMENT ?? "testnet";
const LENS_APP_ADDRESS = process.env.NEXT_PUBLIC_LENS_APP_ADDRESS ?? "";
const DEFAULT_APP = LENS_APP_ADDRESS || "test-app";

type StoredSession = AuthSessionView;

type WalletBridge = {
  walletAddress: string;
  signMessage: (message: string) => Promise<string>;
  getEthereumProvider?: () => Promise<any>;
};

let activeSessionClient: SessionClient | null = null;
let activeWalletBridge: WalletBridge | null = null;

function nowIso() {
  return new Date().toISOString();
}

function success<T>(data: T, meta?: Partial<LensResult<T>["meta"]>): LensResult<T> {
  return {
    success: true,
    data,
    error: null,
    meta: {
      source: "lens",
      timestamp: nowIso(),
      ...meta,
    },
  };
}

function failure<T>(code: string, message: string, retryable = false): LensResult<T> {
  return {
    success: false,
    data: null,
    error: {
      code,
      message,
      retryable,
    },
    meta: {
      source: "lens",
      timestamp: nowIso(),
    },
  };
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createAddress() {
  const seed = Math.random().toString(16).slice(2).padEnd(40, "0").slice(0, 40);
  return `0x${seed}`;
}

function getWalletMap() {
  return readJson<Record<string, AccountView & { handle: string }>>(WALLETS_KEY, {});
}

function getPostMap() {
  return readJson<Record<string, PostView[]>>(POSTS_KEY, {});
}

function getLensPublicClient() {
  return PublicClient.create({
    environment: LENS_ENV === "mainnet" ? mainnet : testnet,
    storage: window.localStorage,
  });
}

function readResult<T>(result: { isErr(): boolean; value: T; error: unknown }) {
  if (result.isErr()) {
    return { ok: false as const, error: result.error };
  }
  return { ok: true as const, value: result.value };
}

function mapAccount(raw: any): AccountView {
  const metadata = raw?.metadata ?? {};
  const username = raw?.username?.localName ?? raw?.username?.value ?? null;
  return {
    address: raw?.address ?? "",
    username,
    name: metadata?.name ?? null,
    bio: metadata?.bio ?? null,
    picture: metadata?.picture ?? null,
    coverPicture: metadata?.coverPicture ?? null,
  };
}

function mapPost(raw: any): PostView {
  const metadata = raw?.metadata ?? {};
  return {
    id: raw?.id ?? raw?.slug ?? `post_${Date.now()}`,
    slug: raw?.slug ?? null,
    authorAddress: raw?.author?.address ?? "",
    title: metadata?.title ?? null,
    content: metadata?.content ?? raw?.content ?? null,
    tags: Array.isArray(metadata?.tags) ? metadata.tags : [],
    createdAt: raw?.timestamp ?? raw?.createdAt ?? null,
  };
}

async function loginToLens(bridge: WalletBridge, accountAddress?: string) {
  if (!LENS_APP_ADDRESS) {
    return { ok: false as const, error: "Missing NEXT_PUBLIC_LENS_APP_ADDRESS." };
  }

  const client = getLensPublicClient();
  const loginResult = await client.login(
    accountAddress
      ? {
          accountOwner: {
            account: evmAddress(accountAddress),
            owner: evmAddress(bridge.walletAddress),
            app: evmAddress(LENS_APP_ADDRESS),
          },
          signMessage: bridge.signMessage,
        }
      : {
          onboardingUser: {
            wallet: evmAddress(bridge.walletAddress),
            app: evmAddress(LENS_APP_ADDRESS),
          },
          signMessage: bridge.signMessage,
        },
  );

  const resolved = readResult<SessionClient>(loginResult as any);
  if (!resolved.ok) {
    return {
      ok: false as const,
      error: "Lens login failed. Confirm wallet is connected and app address is valid.",
    };
  }
  activeSessionClient = resolved.value;
  return { ok: true as const, sessionClient: resolved.value };
}

async function ensureSessionClient() {
  if (activeSessionClient) {
    return { ok: true as const, sessionClient: activeSessionClient };
  }

  const client = getLensPublicClient();
  const resumed = await client.resumeSession();
  const resolved = readResult<SessionClient>(resumed as any);
  if (!resolved.ok) {
    return { ok: false as const, error: "Lens session expired. Please log in again." };
  }

  activeSessionClient = resolved.value;
  return { ok: true as const, sessionClient: resolved.value };
}

function persistSession(session: StoredSession) {
  writeJson(SESSION_KEY, session);
}

export async function connectWallet() {
  const address = createAddress();
  window.localStorage.setItem(CONNECTED_WALLET_KEY, address);
  return success({ address });
}

export async function loginOrCreate(
  handleInput?: string,
  bridge?: WalletBridge,
  accountAddress?: string,
) {
  const wallet = bridge?.walletAddress ?? window.localStorage.getItem(CONNECTED_WALLET_KEY);
  if (!wallet) {
    return failure<AuthSessionView>(
      "LENS_UNAUTHENTICATED",
      "Connect wallet before login.",
    );
  }

  const handle = (handleInput ?? `writer-${wallet.slice(2, 8)}`).trim().toLowerCase();
  if (!handle) {
    return failure<AuthSessionView>("LENS_VALIDATION_ERROR", "Handle is required.");
  }

  if (bridge) {
    activeWalletBridge = bridge;
    const lensLogin = await loginToLens(bridge, accountAddress);
    if (!lensLogin.ok) {
      return failure<AuthSessionView>("LENS_UNAUTHENTICATED", lensLogin.error);
    }
  }

  const wallets = getWalletMap();
  if (!wallets[wallet]) {
    wallets[wallet] = {
      address: wallet,
      username: handle,
      name: `Lens Writer ${wallet.slice(-4)}`,
      bio: "Lens blog demo account",
      handle,
    };
    writeJson(WALLETS_KEY, wallets);
  }

  const session: StoredSession = {
    authenticationId: `auth_${Date.now()}`,
    accountAddress: accountAddress ?? wallet,
    app: DEFAULT_APP,
    handle,
  };
  persistSession(session);
  return success<AuthSessionView>(session);
}

export async function getAccountsAvailable(walletAddress: string) {
  try {
    const client = getLensPublicClient();
    const result = await fetchAccountsAvailable(client, {
      managedBy: evmAddress(walletAddress),
      includeOwned: true,
    } as any);
    const resolved = readResult<any>(result as any);
    if (resolved.ok) {
      const items = (resolved.value?.items ?? []).map((item: any) =>
        mapAccount(item.account ?? item),
      );
      return success<AccountView[]>(items);
    }
  } catch {
  }

  const wallets = getWalletMap();
  const fallback = Object.values(wallets).filter((item) => item.address === walletAddress);
  return success<AccountView[]>(fallback);
}

export async function createLensAccount(handleInput: string) {
  const handle = handleInput.trim().toLowerCase();
  if (!handle) {
    return failure<AccountView>("LENS_VALIDATION_ERROR", "Handle is required.");
  }

  const bridge = activeWalletBridge;
  if (!bridge?.getEthereumProvider) {
    return failure<AccountView>(
      "LENS_UNAUTHENTICATED",
      "Connect and login wallet before creating account.",
    );
  }

  const ensured = await ensureSessionClient();
  if (!ensured.ok) {
    return failure<AccountView>("LENS_UNAUTHENTICATED", ensured.error);
  }

  const sessionClient = ensured.sessionClient;
  const chain = LENS_ENV === "mainnet" ? lensChains.mainnet : lensChains.testnet;

  try {
    const usernameCheck = await canCreateUsername(sessionClient, {
      localName: handle,
    } as any);
    const check = readResult<any>(usernameCheck as any);
    if (!check.ok) {
      return failure<AccountView>("LENS_INTERNAL_ERROR", "Could not validate username.", true);
    }

    const typename = check.value?.__typename;
    if (typename && typename !== "NamespaceOperationValidationPassed") {
      return failure<AccountView>(
        "LENS_VALIDATION_ERROR",
        check.value?.reason ?? "Username is not available.",
      );
    }

    const metadata = account({
      name: `@${handle}`,
      bio: "Created from Lens blog demo",
    });
    const storageClient = StorageClient.create();
    const uploaded = await storageClient.uploadAsJson(metadata, {
      acl: immutable(chain.id),
    });

    const provider = await bridge.getEthereumProvider();
    const walletClient = createWalletClient({
      account: bridge.walletAddress as `0x${string}`,
      chain,
      transport: custom(provider),
    });

    const op = await lensCreateAccountWithUsername(sessionClient, {
      username: { localName: handle },
      metadataUri: uri(uploaded.uri),
      owner: evmAddress(bridge.walletAddress),
      enableSignless: true,
    } as any)
      .andThen(handleOperationWith(walletClient as any))
      .andThen(sessionClient.waitForTransaction);

    const opResult = readResult<any>(op as any);
    if (!opResult.ok) {
      return failure<AccountView>(
        "LENS_INTERNAL_ERROR",
        "Account creation transaction failed.",
        true,
      );
    }

    const accounts = await getAccountsAvailable(bridge.walletAddress);
    if (!accounts.success || !accounts.data || accounts.data.length === 0) {
      return failure<AccountView>(
        "LENS_INTERNAL_ERROR",
        "Account created but could not be fetched yet. Retry in a moment.",
        true,
      );
    }

    const created =
      accounts.data.find((item) => item.username?.toLowerCase() === handle) ?? accounts.data[0];

    const switched = await sessionClient.switchAccount({
      account: evmAddress(created.address),
    });
    const switchResult = readResult<SessionClient>(switched as any);
    if (switchResult.ok) {
      activeSessionClient = switchResult.value;
    }

    persistSession({
      authenticationId: `auth_${Date.now()}`,
      accountAddress: created.address,
      app: DEFAULT_APP,
      handle: created.username ?? handle,
    });

    return success<AccountView>(created);
  } catch {
    return failure<AccountView>(
      "LENS_INTERNAL_ERROR",
      "Failed to create Lens account.",
      true,
    );
  }
}

export async function currentSession() {
  const session = readJson<StoredSession | null>(SESSION_KEY, null);
  if (!session) {
    return failure<AuthSessionView>("LENS_UNAUTHENTICATED", "No active session.");
  }
  return success<AuthSessionView>(session);
}

export async function logout() {
  window.localStorage.removeItem(SESSION_KEY);
  activeSessionClient = null;
  activeWalletBridge = null;
  return success({ ok: true });
}

export async function disconnectWalletSession() {
  window.localStorage.removeItem(CONNECTED_WALLET_KEY);
  await logout();
  return success({ ok: true });
}

export async function getProfileByHandle(handle: string) {
  try {
    const client = getLensPublicClient();
    const result = await fetchAccount(client, {
      username: { localName: handle.toLowerCase() },
    } as any);
    const resolved = readResult<any>(result as any);
    if (resolved.ok && resolved.value) {
      return success<AccountView>(mapAccount(resolved.value));
    }
  } catch {
  }

  const wallets = getWalletMap();
  const profile = Object.values(wallets).find((item) => item.handle === handle.toLowerCase());
  if (!profile) {
    return failure<AccountView>("LENS_NOT_FOUND", `Profile @${handle} not found.`);
  }
  return success<AccountView>(profile);
}

export async function getPostsByHandle(handle: string) {
  const profileResult = await getProfileByHandle(handle);
  if (!profileResult.success || !profileResult.data) {
    return failure<LensPage<PostView>>("LENS_NOT_FOUND", `No posts for @${handle}.`);
  }

  try {
    const client = getLensPublicClient();
    const result = await fetchPosts(client, {
      filter: {
        authors: [evmAddress(profileResult.data.address)],
      },
    } as any);
    const resolved = readResult<any>(result as any);
    if (resolved.ok && resolved.value) {
      const items = (resolved.value.items ?? []).map(mapPost);
      const nextCursor = resolved.value.pageInfo?.next ?? null;
      return success<LensPage<PostView>>(
        {
          items,
          pageInfo: {
            prev: resolved.value.pageInfo?.prev ?? null,
            next: nextCursor,
          },
        },
        {
          cursor: null,
          nextCursor,
          hasMore: nextCursor !== null,
        },
      );
    }
  } catch {
  }

  const posts = getPostMap()[profileResult.data.address] ?? [];
  return success<LensPage<PostView>>(
    {
      items: [...posts].sort((a, b) =>
        a.createdAt && b.createdAt ? b.createdAt.localeCompare(a.createdAt) : 0,
      ),
      pageInfo: {
        prev: null,
        next: null,
      },
    },
    {
      cursor: null,
      nextCursor: null,
      hasMore: false,
    },
  );
}

export async function getPostById(postId: string) {
  try {
    const client = getLensPublicClient();
    const result = await fetchPost(client, {
      post: postId,
    } as any);
    const resolved = readResult<any>(result as any);
    if (resolved.ok && resolved.value) {
      return success<PostView>(mapPost(resolved.value));
    }
  } catch {
  }

  const postsByAuthor = Object.values(getPostMap());
  const post = postsByAuthor.flat().find((item) => item.id === postId);
  if (!post) {
    return failure<PostView>("LENS_NOT_FOUND", `Post ${postId} not found.`);
  }
  return success<PostView>(post);
}

export async function publishArticle(input: {
  title: string;
  content: string;
  tags?: string[];
}) {
  const session = readJson<StoredSession | null>(SESSION_KEY, null);
  if (!session?.accountAddress) {
    return failure<PostView>("LENS_UNAUTHENTICATED", "Authentication required.");
  }

  if (!input.title.trim() || !input.content.trim()) {
    return failure<PostView>(
      "LENS_VALIDATION_ERROR",
      "Title and content are required.",
    );
  }

  if (activeWalletBridge?.getEthereumProvider && LENS_APP_ADDRESS) {
    try {
      const ensured = await ensureSessionClient();
      if (!ensured.ok) {
        return failure<PostView>("LENS_UNAUTHENTICATED", ensured.error);
      }

      const provider = await activeWalletBridge.getEthereumProvider();
      const chain = LENS_ENV === "mainnet" ? lensChains.mainnet : lensChains.testnet;
      const walletClient = createWalletClient({
        account: activeWalletBridge.walletAddress as `0x${string}`,
        chain,
        transport: custom(provider),
      });

      const metadata = article({
        title: input.title.trim(),
        content: input.content.trim(),
        tags: input.tags ?? [],
      });

      const storageClient = StorageClient.create();
      const uploaded = await storageClient.uploadAsJson(metadata, {
        acl: immutable(chain.id),
      });

      const operationResult = await post(ensured.sessionClient, {
        contentUri: uri(uploaded.uri),
      } as any)
        .andThen(handleOperationWith(walletClient as any))
        .andThen(ensured.sessionClient.waitForTransaction);

      const operation = readResult<any>(operationResult as any);
      if (!operation.ok) {
        return failure<PostView>(
          "LENS_INTERNAL_ERROR",
          "Lens publish failed. Try again shortly.",
          true,
        );
      }

      const created = await fetchPost(getLensPublicClient(), {
        txHash: txHash(operation.value),
      } as any);
      const fetched = readResult<any>(created as any);
      if (fetched.ok && fetched.value) {
        return success<PostView>(mapPost(fetched.value));
      }
    } catch {
      return failure<PostView>(
        "LENS_INTERNAL_ERROR",
        "Lens publish failed. Check wallet network and permissions.",
        true,
      );
    }
  }

  const fallbackPost: PostView = {
    id: `post_${Date.now()}`,
    authorAddress: session.accountAddress,
    title: input.title.trim(),
    content: input.content.trim(),
    tags: input.tags ?? [],
    createdAt: nowIso(),
  };

  const posts = getPostMap();
  const current = posts[session.accountAddress] ?? [];
  posts[session.accountAddress] = [fallbackPost, ...current];
  writeJson(POSTS_KEY, posts);

  return success<PostView>(fallbackPost);
}

export async function getLastLoggedInAccount() {
  const session = readJson<StoredSession | null>(SESSION_KEY, null);
  if (!session?.accountAddress) {
    return success<AccountView | null>(null);
  }

  try {
    const client = getLensPublicClient();
    const result = await fetchAccount(client, {
      address: evmAddress(session.accountAddress),
    } as any);
    const resolved = readResult<any>(result as any);
    if (resolved.ok && resolved.value) {
      return success<AccountView | null>(mapAccount(resolved.value));
    }
  } catch {
  }

  const wallets = getWalletMap();
  return success<AccountView | null>(wallets[session.accountAddress] ?? null);
}
