"use client";

import { StorageClient, immutable } from "@lens-chain/storage-client";
import { chains } from "@lens-chain/sdk/viem";
import { article } from "@lens-protocol/metadata";
import { evmAddress, postId, uri } from "@lens-protocol/client";
import { fetchAccount, fetchAccountsAvailable, fetchPost, fetchPosts, lastLoggedInAccount, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { createWalletClient, custom } from "viem";
import type { ConnectedWallet } from "@privy-io/react-auth";
import type { AuthSessionView, LensPage, LensResult, PostView, AccountView } from "@/lib/lens/contracts";
import { lensRuntimeConfig } from "@/lib/lens/config";
import { getLensPublicClient } from "@/lib/lens/client";
import { demoAccount, demoPosts } from "@/lib/lens/demo-data";
import { mapAccount, mapPost } from "@/lib/lens/mappers";
import { emptyPage, errResult, okResult } from "@/lib/lens/result";

type SignMessageFn = (message: string) => Promise<string>;

let storageClient: StorageClient | null = null;

function getStorageClient() {
  if (storageClient) {
    return storageClient;
  }

  storageClient = StorageClient.create();
  return storageClient;
}

function getLensChainId() {
  return lensRuntimeConfig.environment === "mainnet" ? chains.mainnet.id : chains.testnet.id;
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      code: "LENS_INTERNAL_ERROR",
      message: error.message,
      details: error,
    };
  }

  return {
    code: "LENS_INTERNAL_ERROR",
    message: "Unexpected Lens error",
    details: error,
  };
}

function unwrapResult(result: { isErr(): boolean }): any {
  if (result.isErr()) {
    throw (result as unknown as { error: unknown }).error;
  }

  return (result as unknown as { value: unknown }).value;
}

function appAddressOrError() {
  if (!lensRuntimeConfig.appAddress) {
    throw new Error("Missing NEXT_PUBLIC_LENS_APP_ADDRESS");
  }

  return evmAddress(lensRuntimeConfig.appAddress);
}

function mapSession(sessionClient: { getAuthenticatedUser(): { isErr(): boolean; error: unknown; value: { authenticationId: string; authenticatedAs?: { __typename?: string; address?: string } } } }): AuthSessionView {
  const auth = sessionClient.getAuthenticatedUser();
  if (auth.isErr()) {
    throw auth.error;
  }

  return {
    authenticationId: auth.value.authenticationId,
    accountAddress: auth.value.authenticatedAs?.address ?? null,
    app: lensRuntimeConfig.appAddress || null,
  };
}

export async function resumeLensSession(): Promise<LensResult<AuthSessionView>> {
  try {
    const client = getLensPublicClient();
    const session = unwrapResult(await client.resumeSession());
    return okResult(mapSession(session));
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function logoutLensSession(): Promise<LensResult<null>> {
  try {
    const client = getLensPublicClient();
    const session = unwrapResult(await client.resumeSession());
    unwrapResult(await session.logout());
    return okResult(null);
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function fetchAvailableLensAccounts(walletAddress: string): Promise<LensResult<AccountView[]>> {
  try {
    const client = getLensPublicClient();
    const page = unwrapResult(await
      fetchAccountsAvailable(client, {
        managedBy: evmAddress(walletAddress),
        includeOwned: true,
      } as never),
    );

    const accounts = (page.items as unknown[]).map(mapAccount).filter((item: AccountView | null): item is AccountView => item !== null);
    return okResult(accounts, null, page.pageInfo.next ?? null);
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function fetchLastLoggedInLensAccount(walletAddress: string): Promise<LensResult<AccountView>> {
  try {
    const client = getLensPublicClient();
    const account = unwrapResult(await
      lastLoggedInAccount(client, {
        address: evmAddress(walletAddress),
      } as never),
    );

    const mapped = mapAccount(account);
    if (!mapped) {
      return errResult("LENS_NOT_FOUND", "No last logged-in account found.");
    }

    return okResult(mapped);
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function loginToLens(params: {
  walletAddress: string;
  signMessage: SignMessageFn;
  accountAddress?: string;
}): Promise<LensResult<AuthSessionView>> {
  try {
    const client = getLensPublicClient();
    const app = appAddressOrError();
    const loginRequest = (
      params.accountAddress
        ? {
            accountOwner: {
              app,
              account: evmAddress(params.accountAddress),
              owner: evmAddress(params.walletAddress),
            },
            signMessage: params.signMessage,
          }
        : {
            onboardingUser: {
              app,
              wallet: evmAddress(params.walletAddress),
            },
            signMessage: params.signMessage,
          }
    ) as never;

    const session = unwrapResult(await client.login(loginRequest));

    return okResult(mapSession(session));
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function fetchProfileByHandle(handle: string): Promise<LensResult<AccountView>> {
  if (/^0x[a-fA-F0-9]{40}$/.test(handle)) {
    return fetchProfileByAddress(handle);
  }

  try {
    const client = getLensPublicClient();
    const account = unwrapResult(await
      fetchAccount(client, {
        username: { localName: handle },
      } as never),
    );

    const mapped = mapAccount(account);
    if (!mapped) {
      return okResult({ ...demoAccount, username: handle });
    }

    return okResult(mapped);
  } catch (error) {
    return okResult({ ...demoAccount, username: handle });
  }
}

export async function fetchProfileByAddress(address: string): Promise<LensResult<AccountView>> {
  try {
    const client = getLensPublicClient();
    const account = unwrapResult(await
      fetchAccount(client, {
        address: evmAddress(address),
      } as never),
    );

    const mapped = mapAccount(account);
    if (!mapped) {
      return errResult("LENS_NOT_FOUND", "No Lens account found for this address.");
    }

    return okResult(mapped);
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function resolveActiveLensProfile(walletAddress?: string | null): Promise<LensResult<AccountView>> {
  const session = await resumeLensSession();
  if (session.success && session.data?.accountAddress) {
    const profile = await fetchProfileByAddress(session.data.accountAddress);
    if (profile.success && profile.data) {
      return profile;
    }
  }

  if (walletAddress) {
    const lastAccount = await fetchLastLoggedInLensAccount(walletAddress);
    if (lastAccount.success && lastAccount.data) {
      return lastAccount;
    }
  }

  return errResult("LENS_NOT_FOUND", "No active Lens profile found.");
}

export async function requireActiveLensProfile(): Promise<LensResult<AccountView>> {
  const session = await resumeLensSession();
  if (!session.success || !session.data?.accountAddress) {
    return errResult("LENS_UNAUTHENTICATED", "No active Lens session found.");
  }

  return fetchProfileByAddress(session.data.accountAddress);
}

export async function fetchPostsByHandle(handle: string): Promise<LensResult<LensPage<PostView>>> {
  const profile = await fetchProfileByHandle(handle);
  if (!profile.success || !profile.data) {
    return okResult({ items: demoPosts, pageInfo: emptyPage<PostView>().pageInfo });
  }

  try {
    const client = getLensPublicClient();
    const page = unwrapResult(await
      fetchPosts(client, {
        filter: {
          authors: [evmAddress(profile.data.address)],
        },
      } as never),
    );

    const items = (page.items as unknown[]).map(mapPost).filter((item: PostView | null): item is PostView => item !== null);

    if (!items.length) {
      return okResult({ items: demoPosts, pageInfo: emptyPage<PostView>().pageInfo }, null, page.pageInfo.next ?? null);
    }

    return okResult(
      {
        items,
        pageInfo: {
          prev: page.pageInfo.prev ?? null,
          next: page.pageInfo.next ?? null,
        },
      },
      null,
      page.pageInfo.next ?? null,
    );
  } catch (error) {
    return okResult({ items: demoPosts, pageInfo: emptyPage<PostView>().pageInfo });
  }
}

export async function fetchLensPost(postIdentifier: string): Promise<LensResult<PostView>> {
  try {
    const client = getLensPublicClient();
    const found = unwrapResult(await
      fetchPost(client, {
        post: postId(postIdentifier),
      } as never),
    );

    const mapped = mapPost(found);
    if (!mapped) {
      return okResult(demoPosts.find((item: PostView) => item.id === postIdentifier) ?? demoPosts[0]);
    }

    return okResult(mapped);
  } catch (error) {
    return okResult(demoPosts.find((item: PostView) => item.id === postIdentifier) ?? demoPosts[0]);
  }
}

export async function publishLensArticle(params: {
  title: string;
  content: string;
  tags: string[];
  wallet: ConnectedWallet | null;
}): Promise<LensResult<{ status: string; txHash: string; contentUri: string }>> {
  if (!params.wallet) {
    return errResult("LENS_UNAUTHENTICATED", "Connect a wallet before publishing.");
  }

  if (params.wallet.type !== "ethereum") {
    return errResult("LENS_VALIDATION_ERROR", "The current wallet is not an Ethereum wallet.");
  }

  try {
    const resumed = await resumeLensSession();
    if (!resumed.success) {
      return errResult(
        "LENS_UNAUTHENTICATED",
        "当前没有可用的 Lens 登录会话。请先到 Access 页面完成 Lens 登录，再回来发布文章。",
        false,
        resumed.error,
      );
    }

    const session = unwrapResult(await getLensPublicClient().resumeSession());
    const walletClient = await createWalletClientForLens(params.wallet);

    if (!walletClient) {
      return errResult("LENS_UNAUTHENTICATED", "Unable to create a wallet client for publishing.");
    }

    const metadata = await buildPublishPreview({
      title: params.title,
      content: params.content,
      tags: params.tags,
    });

    const upload = await getStorageClient().uploadAsJson(metadata, {
      acl: immutable(getLensChainId()),
      name: "article.json",
    });

    const operationResult = await post(session, {
      contentUri: uri(upload.uri),
    } as never)
      .andThen(handleOperationWith(walletClient))
      .andThen(session.waitForTransaction);

    const txHash = unwrapResult(operationResult);

    return okResult({
      status: "published",
      txHash,
      contentUri: upload.uri,
    });
  } catch (error) {
    const normalized = normalizeError(error);
    return errResult(normalized.code, normalized.message, false, normalized.details);
  }
}

export async function buildPublishPreview(params: { title: string; content: string; tags: string[] }) {
  return article({
    title: params.title,
    content: params.content,
    tags: params.tags,
  });
}

export async function createWalletClientForLens(wallet: ConnectedWallet | null) {
  if (!wallet || wallet.type !== "ethereum") {
    return null;
  }

  const provider = await wallet.getEthereumProvider();
  return createWalletClient({
    account: wallet.address as `0x${string}`,
    chain: lensRuntimeConfig.environment === "mainnet" ? chains.mainnet : chains.testnet,
    transport: custom(provider),
  });
}
