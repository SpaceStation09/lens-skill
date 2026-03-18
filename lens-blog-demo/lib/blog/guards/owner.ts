import { AccountState } from "@/lib/blog/types";

export function normalizeAddress(input?: string): string {
  return (input || "").trim().toLowerCase();
}

export function isOwnerView(input: {
  accountState: AccountState;
  activeAccountAddress?: string;
  profileAddress?: string;
}): boolean {
  if (input.accountState !== "authenticated") return false;
  if (!input.activeAccountAddress || !input.profileAddress) return false;

  return normalizeAddress(input.activeAccountAddress) === normalizeAddress(input.profileAddress);
}
