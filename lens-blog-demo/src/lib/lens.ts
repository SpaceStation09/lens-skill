import { StorageClient } from "@lens-chain/storage-client";
import { PublicClient, mainnet, testnet } from "@lens-protocol/client";
import {
  createAccountWithUsername,
  fetchAccount,
  fetchAccountsBulk,
  fetchPosts,
  post,
} from "@lens-protocol/client/actions";
import { handleOperationWith, signMessageWith } from "@lens-protocol/client/viem";
import { account, article } from "@lens-protocol/metadata";
import { PageSize } from "@lens-protocol/graphql";
import { evmAddress, uri } from "@lens-protocol/types";
import type { WalletClient } from "viem";
import { getLensRuntimeConfig } from "../config/lens";

const runtime = getLensRuntimeConfig();
const lensEnvironment = runtime.network === "mainnet" ? mainnet : testnet;
const selectedNetwork = runtime.network;
const alternateNetwork = selectedNetwork === "mainnet" ? "testnet" : "mainnet";

const publicClient = PublicClient.create({ environment: lensEnvironment });
const alternatePublicClient = PublicClient.create({
  environment: alternateNetwork === "mainnet" ? mainnet : testnet,
});
const storageClient = StorageClient.create();

type ResultLike<T> =
  | { isErr: () => boolean; error: unknown; value: T }
  | { isErr: () => boolean; error: unknown };

function unwrap<T>(result: ResultLike<T>, fallback: string): T {
  if (result.isErr()) {
    throw new Error(String((result as any).error ?? fallback));
  }
  return (result as any).value as T;
}

export async function loginAsAccountOwner(params: {
  walletClient: WalletClient;
  appAddress?: string;
  accountAddress: string;
}) {
  const { walletClient, appAddress, accountAddress } = params;
  const ownerAddress = walletClient.account?.address;
  if (!ownerAddress) {
    throw new Error("Wallet client has no account address.");
  }

  const authenticated = await (publicClient as any).login({
    accountOwner: {
      app: evmAddress(appAddress || runtime.appAddress),
      owner: evmAddress(ownerAddress),
      account: evmAddress(accountAddress),
    },
    signMessage: signMessageWith(walletClient),
  });

  return unwrap(authenticated as any, "Lens login failed");
}

async function fetchOwnedAccountsBy(client: any, walletAddress: string) {
  const result = await fetchAccountsBulk(client, {
    ownedBy: [evmAddress(walletAddress)],
  });
  return unwrap(result as any, "Fetch owned accounts failed") as any[];
}

export async function checkOwnedAccounts(walletAddress: string) {
  const accounts = await fetchOwnedAccountsBy(publicClient as any, walletAddress);
  const alternateAccounts = await fetchOwnedAccountsBy(
    alternatePublicClient as any,
    walletAddress
  );

  return {
    accounts,
    selectedNetwork,
    selectedCount: accounts.length,
    alternateNetwork,
    alternateCount: alternateAccounts.length,
  };
}

export async function publishArticle(params: {
  sessionClient: any;
  walletClient: WalletClient;
  title: string;
  content: string;
  tags: string[];
}) {
  const { sessionClient, walletClient, title, content, tags } = params;

  const metadata = article({
    title,
    content,
    tags,
    locale: "zh-CN",
  });

  const uploaded = await storageClient.uploadAsJson(metadata);

  const result = await post(sessionClient, {
    contentUri: uri(uploaded.uri),
  }).andThen(handleOperationWith(walletClient));

  return unwrap(result as any, "Publish post failed");
}

export async function createLensAccount(params: {
  walletClient: WalletClient;
  appAddress?: string;
  username: string;
  displayName?: string;
  bio?: string;
}) {
  const { walletClient, appAddress, username, displayName, bio } = params;
  const ownerAddress = walletClient.account?.address;
  if (!ownerAddress) {
    throw new Error("Wallet client has no account address.");
  }

  const authenticated = await (publicClient as any).login({
    onboardingUser: {
      app: evmAddress(appAddress || runtime.appAddress),
      wallet: evmAddress(ownerAddress),
    },
    signMessage: signMessageWith(walletClient),
  });
  const sessionClient: any = unwrap(authenticated as any, "Onboarding login failed");

  const metadata = account({
    name: displayName || username,
    bio: bio || "",
  });
  const uploaded = await storageClient.uploadAsJson(metadata);

  const createResult = await createAccountWithUsername(sessionClient as any, {
    username: { localName: username },
    metadataUri: uri(uploaded.uri),
  }).andThen(handleOperationWith(walletClient));

  const txHash = unwrap(createResult as any, "Create account failed");

  let accountAddress = "";
  if (typeof sessionClient.waitForTransaction === "function") {
    const waited = await sessionClient.waitForTransaction(txHash);
    const indexedTxHash = unwrap(waited as any, "Wait transaction failed");

    const fetched = await fetchAccount(publicClient as any, { txHash: indexedTxHash });
    const createdAccount: any = unwrap(fetched as any, "Fetch created account failed");
    accountAddress = createdAccount?.address || "";

    if (accountAddress && typeof sessionClient.switchAccount === "function") {
      await sessionClient.switchAccount({ account: accountAddress });
    }
  }

  return {
    txHash,
    accountAddress,
    sessionClient,
  };
}

export async function fetchAuthorPosts(authorAddress: string) {
  const result = await fetchPosts(publicClient as any, {
    filter: { authors: [evmAddress(authorAddress)] },
    pageSize: PageSize.Fifty,
  });

  const data: any = unwrap(result as any, "Fetch posts failed");

  return (data.items ?? []).map((item: any) => ({
    id: item.id,
    createdAt: item.createdAt,
    title: item.metadata?.title || "(untitled)",
    content: item.metadata?.content || "",
    tags: Array.isArray(item.metadata?.tags)
      ? item.metadata.tags.filter((tag: unknown) => typeof tag === "string")
      : [],
    contentUri: item.contentUri,
    authorAddress: item.author?.address,
    author: item.author?.address,
  }));
}

export type LensProfile = {
  address: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
};

export type WalletLensAccount = {
  address: string;
  handle?: string;
  displayName?: string;
};

function pickAvatarUrl(picture: any): string | undefined {
  if (!picture) return undefined;
  if (typeof picture === "string") return picture;
  if (typeof picture?.uri === "string") return picture.uri;
  if (typeof picture?.optimized?.uri === "string") return picture.optimized.uri;
  if (typeof picture?.raw?.uri === "string") return picture.raw.uri;
  return undefined;
}

export async function fetchProfileByHandle(handle: string): Promise<LensProfile> {
  const normalized = handle.trim().replace(/^@/, "");
  if (!normalized) {
    throw new Error("Handle is required.");
  }

  const result = await fetchAccount(publicClient as any, {
    username: { localName: normalized },
  } as any);
  const accountData: any = unwrap(result as any, "Fetch account failed");

  const address = String(accountData?.address || "");
  if (!address) {
    throw new Error("Account address is missing from Lens response.");
  }

  const metadata = accountData?.metadata || {};
  const stats = accountData?.stats || {};

  return {
    address,
    handle: normalized,
    displayName: String(metadata?.name || normalized),
    bio: String(metadata?.bio || ""),
    avatarUrl: pickAvatarUrl(metadata?.picture),
    followers:
      typeof stats?.followers === "number"
        ? stats.followers
        : typeof stats?.followersCount === "number"
          ? stats.followersCount
          : undefined,
    following:
      typeof stats?.following === "number"
        ? stats.following
        : typeof stats?.followingCount === "number"
          ? stats.followingCount
          : undefined,
  };
}

function normalizeHandle(accountData: any): string | undefined {
  const candidates = [
    accountData?.username?.localName,
    accountData?.username?.value,
    accountData?.handle?.localName,
    accountData?.handle,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim().replace(/^@/, "");
    }
  }
  return undefined;
}

function toLensProfile(accountData: any): LensProfile {
  const address = String(accountData?.address || "");
  const metadata = accountData?.metadata || {};
  const stats = accountData?.stats || {};
  const handle = normalizeHandle(accountData) || "";
  const displayName = String(metadata?.name || handle || shortAddressForLabel(address));

  return {
    address,
    handle,
    displayName,
    bio: String(metadata?.bio || ""),
    avatarUrl: pickAvatarUrl(metadata?.picture),
    followers:
      typeof stats?.followers === "number"
        ? stats.followers
        : typeof stats?.followersCount === "number"
          ? stats.followersCount
          : undefined,
    following:
      typeof stats?.following === "number"
        ? stats.following
        : typeof stats?.followingCount === "number"
          ? stats.followingCount
          : undefined,
  };
}

function shortAddressForLabel(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function fetchProfileByAddress(address: string): Promise<LensProfile> {
  const result = await fetchAccount(publicClient as any, { address: evmAddress(address) } as any);
  const accountData: any = unwrap(result as any, "Fetch account failed");
  const profile = toLensProfile(accountData);
  if (!profile.address) {
    throw new Error("Account address is missing from Lens response.");
  }
  return profile;
}

export async function fetchWalletAccounts(walletAddress: string): Promise<WalletLensAccount[]> {
  const accounts = await fetchOwnedAccountsBy(publicClient as any, walletAddress);
  return (accounts || []).map((item: any) => {
    const profile = toLensProfile(item);
    return {
      address: profile.address,
      handle: profile.handle || undefined,
      displayName: profile.displayName || undefined,
    };
  });
}
