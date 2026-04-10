import type { AccountView, PostView } from "@/lib/lens/contracts";

export const demoAccount: AccountView = {
  address: "0x1234567890abcdef1234567890abcdef12345678",
  username: "demo",
  name: "Demo Blogger",
  bio: "An editorial-first Lens blog shell for profile, post detail, auth, and compose.",
  attributes: [
    { key: "focus", type: "string", value: "writing" },
    { key: "network", type: "string", value: "lens" },
  ],
};

export const demoPosts: PostView[] = [
  {
    id: "signal-and-surface",
    authorAddress: demoAccount.address,
    title: "Signal, Surface, and Personal Publishing",
    content:
      "A Lens-native blog should feel authored, not assembled. This demo uses a restrained editorial shell so the account, the article, and the publishing intent stay legible.\n\nThe next step is to replace demo data with Lens account and post reads that conform to the shared result contract.",
    tags: ["lens", "design", "editorial"],
    createdAt: "2026-04-09",
  },
  {
    id: "wiring-the-stack",
    authorAddress: demoAccount.address,
    title: "Wiring the Stack Without Losing the Theme",
    content:
      "Keep structure and theme separate. The app shell should own routes, providers, and data boundaries. The theme should own typography, spacing, and composition.\n\nThat split keeps it easy to swap demo clients for real Lens SDK calls later.",
    tags: ["architecture", "nextjs"],
    createdAt: "2026-04-06",
  },
];

export function getProfileByHandle(handle: string): AccountView {
  return {
    ...demoAccount,
    username: handle,
  };
}

export function getPostsByHandle(_handle: string): PostView[] {
  return demoPosts;
}

export function getPostById(postId: string): PostView {
  return demoPosts.find((post) => post.id === postId) ?? demoPosts[0];
}
