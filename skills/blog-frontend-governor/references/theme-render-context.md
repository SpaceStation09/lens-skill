# ThemeRenderContext

theme 应消费单一的 runtime-facing context，不应从头重建业务逻辑。

## 最小形态

```ts
type ThemeRenderContext = {
  route: RouteState;
  accountState: AccountState;
  isAuthenticated: boolean;
  isOwnerView: boolean;
  activeHandle: string;
  walletAddress?: string;
  connectWalletNode?: JSX.Element;
  status: string;
  accounts: WalletAccountOption[];
  selectedAccount: string;
  setSelectedAccount: (value: string) => void;
  loginSelectedAccount: () => void;
  resetLensAuth: () => void;
  profile: ProfileView | null;
  pagePosts: PostView[];
  activePost: PostView | null;
  query: string;
  setQuery: (value: string) => void;
  currentPage: number;
  pageCount: number;
  toPrevPage: () => void;
  toNextPage: () => void;
  draftTitle: string;
  setDraftTitle: (value: string) => void;
  draftContent: string;
  setDraftContent: (value: string) => void;
  draftTags: string;
  setDraftTags: (value: string) => void;
  isPublishing: boolean;
  publishDraft: () => void;
  navigate: (path: string) => void;
  shortAddress: (address?: string) => string;
  identiconDataUri: (address: string) => string;
};
```

## 规则

1. theme 可以调用 context 暴露出的 actions。
2. theme 可以基于 route 或 permission state 做分支渲染。
3. theme 不能自己发起数据拉取。
4. theme 不能自行计算 ownership 规则。
5. runtime 可以扩展这个结构，但没有明确迁移理由时，不应移除稳定核心字段。
