export type AccountState = "disconnected" | "wallet_connected_unauthed" | "authenticated";

export type BlogRoute =
  | { name: "home" }
  | { name: "profile"; handle: string }
  | { name: "post"; postId: string }
  | { name: "write" };

export type WalletAccountOption = {
  address: string;
  handle?: string;
  displayName?: string;
};

export type UsernameAvailability = {
  available: boolean;
  normalizedUsername?: string;
  reason?: string;
};

export type CreatedAccount = {
  accountAddress: string;
  handle?: string;
};

export type AuthSession = {
  ownerAddress: string;
  accountAddress: string;
  handle?: string;
};

export type ProfileView = {
  address: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
};

export type PostView = {
  id: string;
  createdAt: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  authorAddress: string;
  contentUri?: string;
};

export type PublishInput = {
  title: string;
  content: string;
  tags?: string[];
};

export type LensInteractionErrorCode =
  | "UNAUTHENTICATED"
  | "USER_REJECTED_SIGNATURE"
  | "SESSION_EXPIRED"
  | "USERNAME_TAKEN"
  | "NAMESPACE_UNSUPPORTED_FLOW"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "CONFIG_ERROR"
  | "UNKNOWN";

export class LensInteractionError extends Error {
  readonly code: LensInteractionErrorCode;
  readonly retryable?: boolean;

  constructor(code: LensInteractionErrorCode, message: string, retryable?: boolean) {
    super(message);
    this.code = code;
    this.retryable = retryable;
  }
}

export interface LensService {
  resumeSession(): Promise<AuthSession | null>;
  getCurrentSession(): Promise<AuthSession | null>;
  listWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]>;
  canCreateUsername(input: { username: string }): Promise<UsernameAvailability>;
  createAccountWithUsername(input: { ownerAddress: string; username: string }): Promise<CreatedAccount>;
  loginWithAccount(input: { ownerAddress: string; accountAddress: string }): Promise<AuthSession>;
  logout(): Promise<void>;
  resetAuth(): Promise<void>;
  getProfileByHandle(handle: string): Promise<ProfileView | null>;
  getPostsByHandle(handle: string): Promise<PostView[]>;
  getPostById(postId: string): Promise<PostView | null>;
  publishPost(input: PublishInput): Promise<{ postId: string }>;
}
