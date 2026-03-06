export type AccountState = "disconnected" | "connected_unauthed" | "authenticated";

export type WalletAccountOption = {
  address: string;
  handle?: string;
  displayName?: string;
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

export type ProfileFeedView = {
  profile: ProfileView;
  posts: PostView[];
};
