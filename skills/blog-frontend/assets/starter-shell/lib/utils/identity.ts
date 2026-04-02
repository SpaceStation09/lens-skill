import type { AccountView } from "../lens/contracts";

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function buildDisplayName(account: AccountView) {
  if (account.name) return account.name;
  if (account.username) return `@${account.username}`;
  return shortenAddress(account.address);
}
