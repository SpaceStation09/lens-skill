export type PublishArticleInput = {
  title: string;
  content: string;
  tags?: string[];
};

// This module is intentionally thin. Wire concrete calls through lens-interaction.
export const lensClientContract = {
  auth: {
    connectWallet: "Connect wallet and expose current address.",
    loginOrCreate: "Create or login Lens account for the connected wallet.",
  },
  profile: {
    getByHandle: "Fetch AccountView for a profile handle.",
    getPostsByHandle: "Fetch LensPage<PostView> for the profile feed.",
  },
  post: {
    getById: "Fetch PostView for the post detail route.",
    publishArticle: "Publish article metadata through lens-interaction.",
  },
} as const;
