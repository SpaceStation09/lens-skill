import type { LensBlogAdapter, PostView, ProfileView, PublishInput, WalletAccountOption } from "@lens-blog/core";

type WalletClient = unknown;

type LensProfile = {
  address: string;
  handle: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
};

type LensPost = {
  id: string;
  createdAt: string;
  title: string;
  content: string;
  tags?: string[];
  authorAddress?: string;
  author?: string;
  contentUri?: string;
};

export type LensSdkOps = {
  fetchWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]>;
  loginAsAccount(params: {
    walletClient: WalletClient;
    accountAddress: string;
  }): Promise<unknown>;
  fetchProfileByHandle(handle: string): Promise<LensProfile>;
  fetchProfileByAddress(address: string): Promise<LensProfile>;
  fetchPostsByAuthor(authorAddress: string): Promise<LensPost[]>;
  fetchPostById(postId: string): Promise<LensPost | null>;
  publishArticle(params: {
    sessionClient: unknown;
    walletClient: WalletClient;
    title: string;
    content: string;
    tags: string[];
  }): Promise<unknown>;
};

function toProfileView(profile: LensProfile): ProfileView {
  return {
    address: profile.address,
    handle: profile.handle,
    displayName: profile.displayName,
    bio: profile.bio || "",
    avatarUrl: profile.avatarUrl,
    followers: profile.followers,
    following: profile.following,
  };
}

function toExcerpt(content: string): string {
  const normalized = (content || "").replace(/\s+/g, " ").trim();
  return normalized.length > 180 ? `${normalized.slice(0, 180)}...` : normalized;
}

function parseContentTags(content: string): string[] {
  const found: string[] = content.match(/#([a-zA-Z0-9\-_]+)/g) ?? [];
  return [...new Set(found.map((tag) => tag.replace("#", "")))];
}

function toPostView(post: LensPost): PostView {
  const content = String(post.content || "");
  const tags = Array.isArray(post.tags) && post.tags.length ? post.tags : parseContentTags(content);
  return {
    id: String(post.id || ""),
    createdAt: String(post.createdAt || ""),
    title: String(post.title || "(untitled)"),
    excerpt: toExcerpt(content),
    content,
    tags,
    authorAddress: String(post.authorAddress || post.author || ""),
    contentUri: typeof post.contentUri === "string" ? post.contentUri : undefined,
  };
}

export function createLensAdapter(
  getWalletClient: () => WalletClient | undefined,
  ops: LensSdkOps,
): LensBlogAdapter {
  let sessionClient: unknown = null;

  return {
    async getWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]> {
      return await ops.fetchWalletAccounts(ownerAddress);
    },

    async loginWithAccount(accountAddress: string): Promise<{ handle?: string; address: string }> {
      const walletClient = getWalletClient();
      if (!walletClient) {
        throw new Error("Wallet client is not available.");
      }

      sessionClient = await ops.loginAsAccount({ walletClient, accountAddress });

      const profile = await ops.fetchProfileByAddress(accountAddress);
      return {
        address: profile.address,
        handle: profile.handle || undefined,
      };
    },

    async getProfileByHandle(handle: string): Promise<ProfileView> {
      const profile = await ops.fetchProfileByHandle(handle);
      return toProfileView(profile);
    },

    async getProfileByAddress(address: string): Promise<ProfileView> {
      const profile = await ops.fetchProfileByAddress(address);
      return toProfileView(profile);
    },

    async getPostsByAuthor(authorAddress: string): Promise<PostView[]> {
      const posts = await ops.fetchPostsByAuthor(authorAddress);
      return posts.map(toPostView);
    },

    async getPostById(postId: string): Promise<PostView | null> {
      const post = await ops.fetchPostById(postId);
      return post ? toPostView(post) : null;
    },

    async publishPost(input: PublishInput): Promise<void> {
      const walletClient = getWalletClient();
      if (!walletClient) {
        throw new Error("Wallet client is not available.");
      }
      if (!sessionClient) {
        throw new Error("Lens session is not ready. Login first.");
      }

      await ops.publishArticle({
        sessionClient,
        walletClient,
        title: input.title,
        content: input.content,
        tags: input.tags,
      });
    },
  };
}
