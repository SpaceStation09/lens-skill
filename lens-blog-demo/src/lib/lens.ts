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

const lensNetwork = (import.meta.env.VITE_LENS_NETWORK || "testnet").toLowerCase();
const lensEnvironment = lensNetwork === "mainnet" ? mainnet : testnet;
const selectedNetwork = lensNetwork === "mainnet" ? "mainnet" : "testnet";
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
  appAddress: string;
  accountAddress: string;
}) {
  const { walletClient, appAddress, accountAddress } = params;
  const ownerAddress = walletClient.account?.address;
  if (!ownerAddress) {
    throw new Error("Wallet client has no account address.");
  }

  const authenticated = await (publicClient as any).login({
    accountOwner: {
      app: evmAddress(appAddress),
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
  appAddress: string;
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
      app: evmAddress(appAddress),
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
    contentUri: item.contentUri,
    author: item.author?.address,
  }));
}
