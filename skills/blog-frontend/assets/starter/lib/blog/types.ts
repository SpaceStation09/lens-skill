export type AccountState =
  | "disconnected"
  | "wallet_connected_unauthed"
  | "authenticated";

export type AuthSession = {
  ownerAddress: string;
  accountAddress: string;
  handle?: string;
};

export type WalletAccountOption = {
  address: string;
  handle?: string;
  displayName?: string;
};

export type UsernameAvailability = {
  available: boolean;
  normalizedUsername?: string;
  fullUsername?: string;
  reason?: string;
};

export type ProfileView = {
  address: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
};

export type PostView = {
  id: string;
  createdAt: string;
  title: string;
  excerpt: string;
  content: string;
  authorAddress: string;
};

export type PublishInput = {
  title: string;
  content: string;
  tags?: string[];
};

export type CreateAccountInput = {
  ownerAddress: string;
  username: {
    localName: string;
    namespace?: string;
  };
  metadataUri?: string;
};

export type CreateAccountResult = {
  accountAddress: string;
  txHash?: string;
};

export interface LensService {
  resumeSession(): Promise<AuthSession | null>;
  getCurrentSession(): Promise<AuthSession | null>;
  listWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]>;
  canCreateUsername(input: {
    localName: string;
    namespace?: string;
  }): Promise<UsernameAvailability>;
  createAccountWithUsername(input: CreateAccountInput): Promise<CreateAccountResult>;
  loginWithAccount(input: {
    ownerAddress: string;
    accountAddress: string;
  }): Promise<AuthSession>;
  logout(): Promise<void>;
  resetAuth(): Promise<void>;
  getProfileByHandle(handle: string): Promise<ProfileView | null>;
  getPostsByHandle(handle: string): Promise<PostView[]>;
  getPostById(postId: string): Promise<PostView | null>;
  publishPost(input: PublishInput): Promise<{ postId: string }>;
}
