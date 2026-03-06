# @lens-blog/adapter-lens

`@lens-blog/adapter-lens` 把 Lens SDK 调用适配为 `@lens-blog/core` 所需的 `LensBlogAdapter` 接口。

当前阶段为本地包（`private: true`），用于未发布 npm 前的本地联调。

## 设计目标

1. 让 UI 层不直接依赖 Lens SDK
2. 把 Profile/Post 数据统一映射为 `core` 的 ViewModel
3. 支持替换数据源时不改页面逻辑

## 导出

- `createLensAdapter(getWalletClient, ops)`
- 类型：`LensSdkOps`

## LensSdkOps 说明

需要宿主应用传入这些实现：

1. `fetchWalletAccounts`
2. `loginAsAccount`
3. `fetchProfileByHandle`
4. `fetchProfileByAddress`
5. `fetchPostsByAuthor`
6. `publishArticle`

## 最小用法

```ts
import { createLensAdapter } from "@lens-blog/adapter-lens";

const adapter = createLensAdapter(() => walletClient, {
  fetchWalletAccounts,
  loginAsAccount,
  fetchProfileByHandle,
  fetchProfileByAddress,
  fetchPostsByAuthor,
  publishArticle,
});
```

## 依赖

- `@lens-blog/core`

## 本地测试（未发布 npm）

建议在宿主项目配置 alias：

```txt
@lens-blog/adapter-lens -> ../packages/lens-blog-adapter-lens/src/index.ts
```
