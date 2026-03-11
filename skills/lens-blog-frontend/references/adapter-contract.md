# Adapter Contract

frontend runtime 依赖一个本地 adapter 边界。theme 和 page 组件都不应绕过它。

## 最小接口

```ts
type PublishInput = {
  title: string;
  content: string;
  tags: string[];
};

interface BlogAdapter {
  getWalletAccounts(ownerAddress: string): Promise<WalletAccountOption[]>;
  loginWithAccount(accountAddress: string): Promise<{ handle?: string; address: string }>;
  getProfileByHandle(handle: string): Promise<ProfileView>;
  getProfileByAddress(address: string): Promise<ProfileView>;
  getPostsByAuthor(authorAddress: string): Promise<PostView[]>;
  getPostById(postId: string): Promise<PostView | null>;
  publishPost(input: PublishInput): Promise<void>;
  resetAuth(): void;
}
```

## 规则

1. `BlogFrontendApp` 依赖这个接口，而不是直接依赖 Lens SDK 调用。
2. adapter 今天可以由 Lens 驱动，但 runtime 只能看到面向前端的 contracts。
3. adapter 负责响应归一化、兜底形态处理，以及带 session 感知的发布行为。
4. adapter 失败应表现为普通应用层错误，而不是原始 SDK 结果包装对象。
5. 当前端执行退出或切换账号时，adapter 必须提供显式 session 清理能力。
