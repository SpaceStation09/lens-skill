import { account as accountMetadata, article as articleMetadata } from "@lens-protocol/metadata";
import {
  AuthenticationError,
  PublicClient,
  SigningError,
  UnauthenticatedError,
  UnexpectedError,
  ValidationError,
  evmAddress,
  mainnet as lensMainnet,
  postId as lensPostId,
  testnet as lensTestnet,
  txHash as lensTxHash,
  uri,
} from "@lens-protocol/client";
import { InMemoryStorageProvider } from "@lens-protocol/storage";
import {
  createAccountWithUsername as createAccountWithUsernameAction,
  fetchAccount,
  fetchAccountsBulk,
  fetchPost,
  fetchPosts,
  fetchUsername,
  post,
} from "@lens-protocol/client/actions";
import { handleOperationWith, signMessageWith } from "@lens-protocol/client/viem";
import { StorageClient, immutable } from "@lens-chain/storage-client";
import { chains as lensChains } from "@lens-chain/sdk/viem";
import { createWalletClient, custom } from "viem";
import {
  AuthSession,
  CreatedAccount,
  LensInteractionError,
  LensService,
  PostView,
  ProfileView,
  PublishInput,
  UsernameAvailability,
  WalletAccountOption,
} from "@/lib/blog/types";

type LensRuntimeConfig = {
  network: "mainnet" | "testnet";
  appAddress: string;
  chainId: number;
};

type LensServiceDeps = {
  resolveEthereumProvider: (ownerAddress: string) => Promise<unknown | undefined>;
};

const TEST_APP_ADDRESS = {
  mainnet: "0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE",
  testnet: "0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7",
} as const;

function resolveRuntime(): LensRuntimeConfig {
  const network = process.env.NEXT_PUBLIC_LENS_NETWORK === "mainnet" ? "mainnet" : "testnet";
  const appAddress = process.env.NEXT_PUBLIC_LENS_APP_ADDRESS || TEST_APP_ADDRESS[network];

  return {
    network,
    appAddress,
    chainId: network === "mainnet" ? lensChains.mainnet.id : lensChains.testnet.id,
  };
}

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

function normalizeAddress(input: string): string {
  return input.trim().toLowerCase();
}

function normalizeHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}

function snippet(input: string, max = 120): string {
  const clean = input.trim().replace(/\s+/g, " ");
  return clean.length <= max ? clean : `${clean.slice(0, max - 3)}...`;
}

function isTxHash(input: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(input.trim());
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

function isNamespaceUnsupportedMessage(message: string): boolean {
  const lowered = (message || "").toLowerCase();
  return (
    (lowered.includes("namespace") && lowered.includes("unsupported")) ||
    lowered.includes("namespace unsupported") ||
    lowered.includes("unsupported flow") ||
    lowered.includes("not supported in this namespace")
  );
}

function mapLensError(error: unknown): LensInteractionError {
  if (error instanceof LensInteractionError) {
    return error;
  }

  if (error instanceof UnauthenticatedError) {
    return new LensInteractionError("UNAUTHENTICATED", "Lens session is missing or expired", true);
  }

  if (error instanceof AuthenticationError) {
    return new LensInteractionError("FORBIDDEN", error.message || "Lens authentication failed");
  }

  if (error instanceof SigningError) {
    const lowered = (error.message || "").toLowerCase();
    if (lowered.includes("reject") || lowered.includes("denied") || lowered.includes("cancel")) {
      return new LensInteractionError("USER_REJECTED_SIGNATURE", "Signature was rejected by user");
    }
    return new LensInteractionError("UNKNOWN", error.message || "Failed to sign request");
  }

  if (error instanceof ValidationError) {
    const lowered = (error.message || "").toLowerCase();
    if (isNamespaceUnsupportedMessage(lowered)) {
      return new LensInteractionError("NAMESPACE_UNSUPPORTED_FLOW", error.message || "Current namespace does not support this flow");
    }
    if (lowered.includes("username") && lowered.includes("taken")) {
      return new LensInteractionError("USERNAME_TAKEN", "Username is already taken");
    }
    if (lowered.includes("input") || lowered.includes("invalid")) {
      return new LensInteractionError("INVALID_INPUT", error.message || "Invalid input");
    }
    return new LensInteractionError("FORBIDDEN", error.message || "Validation failed");
  }

  if (error instanceof UnexpectedError) {
    return new LensInteractionError("NETWORK_ERROR", error.message || "Lens network request failed", true);
  }

  if (error instanceof Error) {
    const lowered = error.message.toLowerCase();
    if (lowered.includes("reject") || lowered.includes("denied") || lowered.includes("cancel")) {
      return new LensInteractionError("USER_REJECTED_SIGNATURE", error.message);
    }
    if (lowered.includes("network") || lowered.includes("fetch") || lowered.includes("rpc")) {
      return new LensInteractionError("NETWORK_ERROR", error.message, true);
    }
    return new LensInteractionError("UNKNOWN", error.message);
  }

  return new LensInteractionError("UNKNOWN", "Unknown Lens error");
}

async function unwrapResult<T>(resultAsync: any): Promise<T> {
  const result = await resultAsync;
  if (result.isErr()) {
    throw mapLensError(result.error);
  }
  return result.value;
}

function createStorageProvider() {
  if (!canUseStorage()) {
    return new InMemoryStorageProvider();
  }

  return {
    getItem(key: string) {
      return window.localStorage.getItem(key);
    },
    setItem(key: string, value: string) {
      window.localStorage.setItem(key, value);
    },
    removeItem(key: string) {
      window.localStorage.removeItem(key);
    },
  };
}

function mapAccountToProfile(account: any): ProfileView | null {
  if (!account) return null;

  const address = asString(account.address);
  const handle = asString(account?.username?.localName || account?.username?.value?.split("/")?.[1]);
  if (!address || !handle) return null;

  const displayName = asString(account?.metadata?.name) || handle;
  const bio = asString(account?.metadata?.bio) || "";
  const avatarUrl = asString(account?.metadata?.picture);
  const followers = typeof account?.stats?.graphStats?.followers === "number" ? account.stats.graphStats.followers : undefined;
  const following = typeof account?.stats?.graphStats?.following === "number" ? account.stats.graphStats.following : undefined;

  return {
    address,
    handle,
    displayName,
    bio,
    avatarUrl,
    followers,
    following,
  };
}

function mapPostToView(item: any): PostView | null {
  if (!item || !item.id) return null;

  const authorAddress = asString(item?.author?.address) || "";
  const createdAt = asString(item?.timestamp) || new Date().toISOString();
  const title = asString(item?.metadata?.title) || "Untitled";
  const content =
    asString(item?.metadata?.content) ||
    asString(item?.metadata?.description) ||
    asString(item?.metadata?.markdown) ||
    "";
  const tags = Array.isArray(item?.metadata?.tags)
    ? item.metadata.tags.filter((tag: unknown) => typeof tag === "string")
    : [];

  return {
    id: String(item.id),
    createdAt,
    title,
    excerpt: snippet(content || title),
    content,
    tags,
    authorAddress,
    contentUri: asString(item?.contentUri),
  };
}

function mapAccountToOption(item: any): WalletAccountOption | null {
  const address = asString(item?.address);
  if (!address) return null;

  const handle = asString(item?.username?.localName || item?.username?.value?.split("/")?.[1]);
  const displayName = asString(item?.metadata?.name) || handle || `${address.slice(0, 6)}...${address.slice(-4)}`;

  return {
    address,
    handle,
    displayName,
  };
}

export function createLensService(deps: LensServiceDeps): LensService {
  const runtime = resolveRuntime();
  const publicClient = PublicClient.create({
    environment: runtime.network === "mainnet" ? lensMainnet : lensTestnet,
    storage: createStorageProvider(),
  });
  const storageClient = StorageClient.create();

  let sessionClient: Awaited<ReturnType<PublicClient["resumeSession"]>> extends { value: infer V } ? V : any;
  let currentSession: AuthSession | null = null;

  async function getWalletClient(ownerAddress: string) {
    const provider = await deps.resolveEthereumProvider(ownerAddress);
    if (!provider) {
      throw new LensInteractionError("CONFIG_ERROR", "Wallet provider is unavailable. Please reconnect wallet.");
    }

    return createWalletClient({
      account: ownerAddress as `0x${string}`,
      chain: runtime.network === "mainnet" ? lensChains.mainnet : lensChains.testnet,
      transport: custom(provider as any),
    });
  }

  async function resolveSessionFromClient(client: any): Promise<AuthSession> {
    const user = client.getAuthenticatedUser();
    if (user.isErr()) {
      throw mapLensError(user.error);
    }

    const accountAddress = String(user.value.address);
    const account = await unwrapResult<any>(fetchAccount(client, { address: evmAddress(accountAddress) }));
    const mapped = mapAccountToProfile(account);

    return {
      ownerAddress: mapped?.address ? String((account as any)?.owner || mapped.address) : String((account as any)?.owner || accountAddress),
      accountAddress,
      handle: mapped?.handle,
    };
  }

  async function loginAsAccount(input: { ownerAddress: string; accountAddress: string }): Promise<AuthSession> {
    const ownerAddress = normalizeAddress(input.ownerAddress);
    const accountAddress = normalizeAddress(input.accountAddress);
    const walletClient = await getWalletClient(ownerAddress);

    const nextSessionClient = await unwrapResult<any>(
      publicClient.login({
        accountOwner: {
          app: evmAddress(runtime.appAddress),
          owner: evmAddress(ownerAddress),
          account: evmAddress(accountAddress),
        },
        signMessage: signMessageWith(walletClient),
      }),
    );

    const nextSession = await resolveSessionFromClient(nextSessionClient);
    sessionClient = nextSessionClient;
    currentSession = nextSession;
    return nextSession;
  }

  async function ensureOnboardingSession(ownerAddress: string): Promise<any> {
    const normalizedOwner = normalizeAddress(ownerAddress);
    const walletClient = await getWalletClient(normalizedOwner);

    return unwrapResult(
      publicClient.login({
        onboardingUser: {
          wallet: evmAddress(normalizedOwner),
          app: evmAddress(runtime.appAddress),
        },
        signMessage: signMessageWith(walletClient),
      }),
    );
  }

  async function resolveTxHashFromOperation(input: {
    operationResult: any;
    ownerAddress: string;
  }): Promise<string> {
    const result = input.operationResult;

    if (result && typeof result === "object" && typeof result.hash === "string") {
      return result.hash;
    }

    const walletClient = await getWalletClient(input.ownerAddress);
    const handled = await handleOperationWith(walletClient)(result);
    if (handled.isErr()) {
      throw mapLensError(handled.error);
    }

    return String(handled.value);
  }

  return {
    async resumeSession() {
      try {
        const resumed = await publicClient.resumeSession();
        if (resumed.isErr()) {
          currentSession = null;
          sessionClient = undefined;
          return null;
        }

        sessionClient = resumed.value;
        currentSession = await resolveSessionFromClient(resumed.value);
        return currentSession;
      } catch {
        currentSession = null;
        sessionClient = undefined;
        return null;
      }
    },

    async getCurrentSession() {
      if (currentSession) return currentSession;
      return this.resumeSession();
    },

    async listWalletAccounts(ownerAddress: string) {
      if (!ownerAddress) {
        throw new LensInteractionError("CONFIG_ERROR", "wallet owner address is required");
      }

      const normalizedOwner = normalizeAddress(ownerAddress);

      const fromOwnedBy = await unwrapResult<any>(
        fetchAccountsBulk(publicClient, {
          ownedBy: [evmAddress(normalizedOwner)],
        }),
      );

      const merged = [...fromOwnedBy]
        .map((item: any) => mapAccountToOption(item))
        .filter((item: WalletAccountOption | null): item is WalletAccountOption => Boolean(item));

      const dedup = new Map<string, WalletAccountOption>();
      for (const item of merged) {
        dedup.set(normalizeAddress(item.address), item);
      }

      return Array.from(dedup.values());
    },

    async canCreateUsername(input: { username: string }) {
      const normalized = normalizeHandle(input.username);
      if (!normalized) {
        return { available: false, reason: "用户名不能为空" };
      }

      const existing = await unwrapResult<any>(
        fetchUsername(publicClient, {
          username: {
            localName: normalized,
          },
        }),
      );

      if (existing) {
        return {
          available: false,
          normalizedUsername: normalized,
          reason: "用户名已被占用",
        };
      }

      return {
        available: true,
        normalizedUsername: normalized,
      };
    },

    async createAccountWithUsername(input: { ownerAddress: string; username: string }): Promise<CreatedAccount> {
      if (!input.ownerAddress) {
        throw new LensInteractionError("CONFIG_ERROR", "wallet owner address is required");
      }

      const ownerAddress = normalizeAddress(input.ownerAddress);
      const username = normalizeHandle(input.username);

      const availability = await this.canCreateUsername({ username });
      if (!availability.available || !availability.normalizedUsername) {
        if (isNamespaceUnsupportedMessage(availability.reason || "")) {
          throw new LensInteractionError(
            "NAMESPACE_UNSUPPORTED_FLOW",
            availability.reason || "Current namespace does not support direct username creation",
          );
        }
        throw new LensInteractionError("USERNAME_TAKEN", availability.reason || "username is unavailable");
      }

      const onboardingSession = await ensureOnboardingSession(ownerAddress);

      const metadata = accountMetadata({
        name: availability.normalizedUsername,
        bio: `Lens account created from lens-blog-demo`,
      });

      const uploaded = await storageClient.uploadAsJson(metadata, {
        acl: immutable(runtime.chainId),
      });

      const operation = await unwrapResult<any>(
        createAccountWithUsernameAction(onboardingSession, {
          username: {
            localName: availability.normalizedUsername,
          },
          owner: evmAddress(ownerAddress),
          metadataUri: uri(uploaded.uri),
        }),
      );

      const tx = await resolveTxHashFromOperation({
        operationResult: operation,
        ownerAddress,
      });

      const indexed = await onboardingSession.waitForTransaction(lensTxHash(tx));
      if (indexed.isErr()) {
        throw mapLensError(indexed.error);
      }

      const accounts = await this.listWalletAccounts(ownerAddress);
      const matched =
        accounts.find((item) => normalizeHandle(item.handle || "") === availability.normalizedUsername) || accounts[0];

      if (!matched) {
        throw new LensInteractionError("UNKNOWN", "Account created but could not be resolved from wallet");
      }

      return {
        accountAddress: matched.address,
        handle: matched.handle,
      };
    },

    async loginWithAccount(input: { ownerAddress: string; accountAddress: string }) {
      if (!input.ownerAddress || !input.accountAddress) {
        throw new LensInteractionError("INVALID_INPUT", "ownerAddress and accountAddress are required");
      }

      return loginAsAccount(input);
    },

    async logout() {
      if (sessionClient) {
        const result = await sessionClient.logout();
        if (result.isErr()) {
          throw mapLensError(result.error);
        }
      }
      sessionClient = undefined;
      currentSession = null;
    },

    async resetAuth() {
      try {
        await this.logout();
      } catch {
        sessionClient = undefined;
        currentSession = null;
      }
    },

    async getProfileByHandle(handle: string) {
      const normalized = normalizeHandle(handle);
      if (!normalized) return null;

      const account = await unwrapResult<any>(
        fetchAccount(publicClient, {
          username: {
            localName: normalized,
          },
        }),
      );

      if (!account) return null;
      return mapAccountToProfile(account);
    },

    async getPostsByHandle(handle: string) {
      const profile = await this.getProfileByHandle(handle);
      if (!profile) return [];

      const posts = await unwrapResult<any>(
        fetchPosts(publicClient, {
          pageSize: "FIFTY",
          filter: {
            authors: [evmAddress(profile.address)],
          },
        }),
      );

      return (posts.items || [])
        .map((item: any) => mapPostToView(item))
        .filter((item: PostView | null): item is PostView => Boolean(item));
    },

    async getPostById(postId: string) {
      if (!postId) return null;

      const request = isTxHash(postId)
        ? { txHash: lensTxHash(postId) }
        : { post: lensPostId(postId) };

      const item = await unwrapResult<any>(fetchPost(publicClient, request));
      if (!item) return null;

      return mapPostToView(item);
    },

    async publishPost(input: PublishInput) {
      if (!sessionClient || !currentSession) {
        throw new LensInteractionError("UNAUTHENTICATED", "please login Lens account first");
      }

      const title = input.title.trim();
      const content = input.content.trim();
      if (!title || !content) {
        throw new LensInteractionError("INVALID_INPUT", "title and content are required");
      }

      const metadata = articleMetadata({
        title,
        content,
        tags: (input.tags || []).map((tag) => tag.trim()).filter(Boolean),
      });

      const uploaded = await storageClient.uploadAsJson(metadata, {
        acl: immutable(runtime.chainId),
      });

      const operation = await unwrapResult<any>(
        post(sessionClient, {
          contentUri: uri(uploaded.uri),
        }),
      );

      const tx = await resolveTxHashFromOperation({
        operationResult: operation,
        ownerAddress: currentSession.ownerAddress,
      });

      const indexed = await sessionClient.waitForTransaction(lensTxHash(tx));
      if (indexed.isErr()) {
        throw mapLensError(indexed.error);
      }

      return { postId: tx };
    },
  };
}
