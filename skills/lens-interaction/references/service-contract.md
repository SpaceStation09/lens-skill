# Service Contract

本文件定义宿主层可依赖的唯一 Lens 交互接口。宿主层不应绕过本接口直接调用 Lens SDK。

## 状态与数据类型

```ts
type AccountState = "disconnected" | "wallet_connected_unauthed" | "authenticated";

type WalletAccountOption = {
  address: string;
  handle?: string;
  displayName?: string;
};

type AuthSession = {
  ownerAddress: string;
  accountAddress: string;
  handle?: string;
};

type ProfileView = {
  address: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
};

type PostView = {
  id: string;
  createdAt: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  authorAddress: string;
  contentUri?: string;
};

type PublishInput = {
  title: string;
  content: string;
  tags?: string[];
};
```

## LensService 接口

```ts
interface LensService {
  resumeSession(): Promise<AuthSession | null>;
  getCurrentSession(): Promise<AuthSession | null>;
  listWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]>;
  loginWithAccount(input: { ownerAddress: string; accountAddress: string }): Promise<AuthSession>;
  logout(): Promise<void>;
  resetAuth(): Promise<void>;

  getProfileByHandle(handle: string): Promise<ProfileView | null>;
  getPostsByHandle(handle: string): Promise<PostView[]>;
  getPostById(postId: string): Promise<PostView | null>;

  publishPost(input: PublishInput): Promise<{ postId: string }>;
}
```

## 接口规则

1. 应用启动时，宿主层应先调用 `resumeSession`
2. `getCurrentSession` 应返回当前内存态或持久化恢复后的会话
3. `logout` 和 `resetAuth` 都必须清除 session，区别是 `logout` 可包含远端退出动作
4. `publishPost` 在未认证时必须抛出 `UNAUTHENTICATED`
5. `getProfileByHandle` / `getPostById` 查无数据返回 `null`，不抛 SDK 原始异常
6. service 对外不暴露 SDK result wrapper、operation 对象或底层类型
7. service 输出必须是稳定 view models，适配 UI 直接消费
8. `resumeSession` 失败时，宿主层状态回退应遵循：
   - 钱包已连接 -> `wallet_connected_unauthed`
   - 钱包未连接 -> `disconnected`

## 实现骨架示例

```ts
export function createLensService(deps: {
  sdk: {
    resumeSession: () => Promise<unknown | null>;
    getCurrentSession: () => Promise<unknown | null>;
    listWalletAccounts: (ownerAddress: string) => Promise<unknown[]>;
    loginWithAccount: (input: { ownerAddress: string; accountAddress: string }) => Promise<unknown>;
    logout: () => Promise<void>;
    getProfileByHandle: (handle: string) => Promise<unknown | null>;
    getPostsByHandle: (handle: string) => Promise<unknown[]>;
    getPostById: (postId: string) => Promise<unknown | null>;
    publishPost: (input: PublishInput) => Promise<unknown>;
    resetAuth: () => Promise<void>;
  };
  mapper: {
    toWalletAccountOptions: (items: unknown[]) => WalletAccountOption[];
    toAuthSession: (item: unknown) => AuthSession;
    toProfileView: (item: unknown) => ProfileView;
    toPostViews: (items: unknown[]) => PostView[];
    toPostView: (item: unknown) => PostView;
    toPublishResult: (item: unknown) => { postId: string };
  };
}): LensService {
  return {
    async resumeSession() {
      const session = await deps.sdk.resumeSession();
      return session ? deps.mapper.toAuthSession(session) : null;
    },
    async getCurrentSession() {
      const session = await deps.sdk.getCurrentSession();
      return session ? deps.mapper.toAuthSession(session) : null;
    },
    async listWalletAccounts(ownerAddress) {
      const items = await deps.sdk.listWalletAccounts(ownerAddress);
      return deps.mapper.toWalletAccountOptions(items);
    },
    async loginWithAccount(input) {
      const session = await deps.sdk.loginWithAccount(input);
      return deps.mapper.toAuthSession(session);
    },
    async logout() {
      await deps.sdk.logout();
    },
    async resetAuth() {
      await deps.sdk.resetAuth();
    },
    async getProfileByHandle(handle) {
      const result = await deps.sdk.getProfileByHandle(handle);
      return result ? deps.mapper.toProfileView(result) : null;
    },
    async getPostsByHandle(handle) {
      const items = await deps.sdk.getPostsByHandle(handle);
      return deps.mapper.toPostViews(items);
    },
    async getPostById(postId) {
      const result = await deps.sdk.getPostById(postId);
      return result ? deps.mapper.toPostView(result) : null;
    },
    async publishPost(input) {
      const result = await deps.sdk.publishPost(input);
      return deps.mapper.toPublishResult(result);
    },
  };
}
```
