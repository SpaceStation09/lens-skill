# @lens-blog/core

`@lens-blog/core` 提供 Lens Blog 前端的运行时壳层和类型契约。

当前阶段为本地包（`private: true`），用于未发布 npm 前的本地联调。

## 提供能力

1. 三态状态机：`disconnected` / `connected_unauthed` / `authenticated`
2. 路由壳层：`/`、`/:handle`、`/write`、`/p/:postId`
3. 主题渲染上下文与主题接口
4. Adapter 契约（与具体数据源解耦）

## 导出

- `BlogFrontendApp`
- 类型：`LensBlogAdapter`, `PublishInput`
- 类型：`AccountState`, `WalletAccountOption`, `ProfileView`, `PostView`, `ProfileFeedView`
- 类型：`BlogTheme`, `RouteState`, `ThemeRenderContext`

## 最小用法

```tsx
import { BlogFrontendApp } from "@lens-blog/core";
import { createLensAdapter } from "@lens-blog/adapter-lens";
import { defaultTheme } from "@lens-blog/theme-default";

<BlogFrontendApp
  adapter={adapter}
  theme={defaultTheme}
  walletAddress={address}
  isWalletConnected={isConnected}
  walletConnectionStatus={status}
  connectWalletNode={<WalletButton />}
/>
```

## 依赖

- `react >= 18`

## 本地测试（未发布 npm）

建议在宿主项目配置 alias：

```txt
@lens-blog/core -> ../packages/lens-blog-core/src/index.ts
```
