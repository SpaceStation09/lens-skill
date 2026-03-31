import type {
  AuthSession,
  CreateAccountInput,
  CreateAccountResult,
  LensService,
  PostView,
  ProfileView,
  PublishInput,
  UsernameAvailability,
  WalletAccountOption,
} from "../types";

type StubState = {
  session: AuthSession | null;
};

function unauthenticatedError() {
  const error = new Error("UNAUTHENTICATED");
  error.name = "UNAUTHENTICATED";
  return error;
}

// Replace this stub with the real implementation from `lens-interaction`.
// NOTE: This stub only keeps session in memory.
// The real Lens implementation must align with official keep-alive docs and
// configure `PublicClient.create({ storage: window.localStorage })` in browser runtimes.
export function createLensServiceStub(): LensService {
  const state: StubState = {
    session: null,
  };

  return {
    async resumeSession() {
      return state.session;
    },
    async getCurrentSession() {
      return state.session;
    },
    async listWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]> {
      return [
        {
          address: ownerAddress,
          handle: "demo",
          displayName: "Demo Account",
        },
      ];
    },
    async canCreateUsername(input: {
      localName: string;
      namespace?: string;
    }): Promise<UsernameAvailability> {
      const normalized = input.localName.trim().toLowerCase();
      if (!normalized) {
        return {
          available: false,
          reason: "INVALID_USERNAME",
        };
      }
      return {
        available: true,
        normalizedUsername: normalized,
        fullUsername: `${normalized}@${input.namespace || "lens"}`,
      };
    },
    async createAccountWithUsername(input: CreateAccountInput): Promise<CreateAccountResult> {
      const normalized = input.username.localName.trim().toLowerCase();
      if (!normalized) {
        throw new Error("INVALID_INPUT");
      }
      return {
        accountAddress: input.ownerAddress,
        txHash: "0xstub-create-account",
      };
    },
    async loginWithAccount(input: { ownerAddress: string; accountAddress: string }) {
      state.session = {
        ownerAddress: input.ownerAddress,
        accountAddress: input.accountAddress,
        handle: "demo",
      };
      return state.session;
    },
    async logout() {
      state.session = null;
    },
    async resetAuth() {
      state.session = null;
    },
    async getProfileByHandle(handle: string): Promise<ProfileView | null> {
      return {
        address: "0x0000000000000000000000000000000000000000",
        handle,
        displayName: handle,
        bio: "Starter profile",
      };
    },
    async getPostsByHandle(handle: string): Promise<PostView[]> {
      return [
        {
          id: "starter-post",
          createdAt: new Date().toISOString(),
          title: "Starter Post",
          excerpt: "Replace with real Lens data.",
          content: `This is a starter post for @${handle}.`,
          authorAddress: "0x0000000000000000000000000000000000000000",
        },
      ];
    },
    async getPostById(postId: string): Promise<PostView | null> {
      return {
        id: postId,
        createdAt: new Date().toISOString(),
        title: "Starter Detail",
        excerpt: "Starter excerpt",
        content: "Replace with real Lens data.",
        authorAddress: "0x0000000000000000000000000000000000000000",
      };
    },
    async publishPost(_input: PublishInput): Promise<{ postId: string }> {
      if (!state.session) {
        throw unauthenticatedError();
      }
      return { postId: "starter-publish-id" };
    },
  };
}
