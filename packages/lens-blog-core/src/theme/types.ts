import type { AccountState, PostView, ProfileView, WalletAccountOption } from "../types/contracts";

export type RouteState =
  | { name: "home" }
  | { name: "profile"; handle: string }
  | { name: "write" }
  | { name: "post"; postId: string };

export type ThemeRenderContext = {
  route: RouteState;
  accountState: AccountState;
  connectWalletNode?: JSX.Element;
  walletAddress?: string;
  status: string;
  accounts: WalletAccountOption[];
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;
  loginSelectedAccount: () => void;
  resetLensAuth: () => void;
  profile: ProfileView | null;
  query: string;
  setQuery: (value: string) => void;
  pagePosts: PostView[];
  currentPage: number;
  pageCount: number;
  toPrevPage: () => void;
  toNextPage: () => void;
  navigate: (path: string) => void;
  shortAddress: (address?: string) => string;
  identiconDataUri: (address: string) => string;
};

export type BlogTheme = {
  id: string;
  label: string;
  renderRoute: (ctx: ThemeRenderContext) => JSX.Element | null;
};
