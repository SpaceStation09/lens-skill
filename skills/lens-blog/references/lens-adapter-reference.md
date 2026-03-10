# Lens Adapter Reference

本文件描述 Lens adapter 的推荐组织方式。它是 reference pattern，不是要求 agent 原样复制文件。

## 目标

Lens adapter 的目标不是单纯做字段映射，而是把 Lens SDK 的不稳定性挡在 `core` 外面。

它应负责：

1. 账户发现
2. Lens account 登录
3. profile / post / feed 获取
4. 发布文章
5. 数据归一化
6. 错误归一化
7. session 感知

## 推荐拆分

推荐在项目中按以下方式组织：

```txt
src/blog/adapters/lens/
  sdk.ts
  mapper.ts
  session.ts
  index.ts
```

说明：

1. `sdk.ts`
   - 直接和 Lens SDK 交互
   - 持有 `PublicClient`、storage client、action 调用
2. `mapper.ts`
   - `LensProfile -> ProfileView`
   - `LensPost -> PostView`
   - excerpt 生成
   - 可选字段兜底
3. `session.ts`
   - 登录后 session 保存
   - publish 前校验
   - logout / wallet 丢失后的清理
4. `index.ts`
   - 向 `core` 暴露统一 adapter 接口

## 最小接口形态

```ts
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

## 必须保持的边界

1. theme 和 page 组件不能直接 import Lens SDK。
2. `core` 不应见到原始 Lens SDK result wrappers。
3. adapter 必须在内部处理可选字段和错误信息的归一化。
4. 发布逻辑必须校验 session 是否可用。
5. adapter 不应负责页面导航、视觉状态或 theme 逻辑。
6. adapter 必须暴露显式 session 清理能力，供切换账号或钱包断开时调用。

## 可接受的实现自由度

以下部分允许项目自行决定：

1. `sdk.ts` 是否拆成多个文件
2. session 是否用闭包、class 或 module state 维护
3. mapper 是否单独抽函数或内联到 adapter 内部

以下部分不应变化：

1. adapter 是 `core` 唯一数据入口
2. adapter 隔离 Lens SDK 细节
3. adapter 输出前端 view model，而不是 SDK 原始对象
