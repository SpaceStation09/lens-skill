import type { PostView, ProfileView, WalletAccountOption } from "../types/contracts";

export type PublishInput = {
  title: string;
  content: string;
  tags: string[];
};

export interface LensBlogAdapter {
  getWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]>;
  loginWithAccount(accountAddress: string): Promise<{ handle?: string; address: string }>;
  getProfileByHandle(handle: string): Promise<ProfileView>;
  getProfileByAddress(address: string): Promise<ProfileView>;
  getPostsByAuthor(authorAddress: string): Promise<PostView[]>;
  publishPost(input: PublishInput): Promise<void>;
}
