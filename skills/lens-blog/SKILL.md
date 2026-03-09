---
name: lens-blog
description: Guides agents to build a personal blog system using Lens Protocol SDK. Use when the user wants to create a Lens-based blog, publish articles on Lens, fetch blog posts from Lens feeds, or integrate Lens Protocol for decentralized blogging.
---

# 使用 Lens SDK 搭建个人博客系统

本 skill 指导 agent 使用 Lens Protocol 构建个人博客，覆盖最小可用主流程：连接钱包、登录、发布文章、按作者查询文章。

## 默认策略（必须遵守）

1. 默认网络固定为 `testnet`。
2. 默认 `app address` 使用对应网络的 **Lens global app address**（不是用户手填）。
3. 当前阶段 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 视为必填（WalletConnect 类钱包连接依赖该值）。
4. 其余 Lens 环境变量可选覆盖，不应成为运行前置条件。
5. 本 skill 不负责 theme 设计与开发；仅允许接入“已存在的 theme 包”。

## 版本要求（高优先级）

必须优先使用 `@lens-protocol/client` canary 代际（支持 `PublicClient`、`@lens-protocol/client/actions`）。

推荐依赖（已验证可安装）：

```bash
npm install @lens-protocol/client@0.0.0-canary-20250820102520
npm install @lens-protocol/metadata@^2.1.0 @lens-chain/storage-client@^1.0.6 @lens-chain/sdk@^1.0.3
npm install wagmi viem connectkit @tanstack/react-query zod
```

说明：
- `evmAddress`、`uri` 来自 `@lens-protocol/types`，不是 `@lens-protocol/client`。
- `StorageClient.create()` 可直接使用默认环境。

## Lens 概念封装（必须统一）

在生成项目时，必须先封装一个集中配置层（例如 `src/config/lens.ts`），不要把 Lens 专有概念散落在页面组件里。

建议封装如下：

```ts
type LensNetwork = "testnet" | "mainnet";

type LensRuntimeConfig = {
  network: LensNetwork; // default: testnet
  appAddress: `0x${string}`; // default: Lens global app address by network
  walletConnectProjectId: string; // required in current stage
};
```

并在同一文件中提供：

1. `resolveLensNetwork()`：默认返回 `testnet`，允许 `NEXT_PUBLIC_LENS_NETWORK` 覆盖。
2. `resolveLensAppAddress(network)`：按网络返回 Lens global app address，允许 `NEXT_PUBLIC_LENS_APP_ADDRESS` 覆盖。
3. `getLensRuntimeConfig()`：统一输出运行时配置，业务代码只依赖这个入口。

约束：

1. `App Address`：Lens 应用身份（用于 `onboardingUser.app` / `accountOwner.app`）。
2. `Owner Address`：当前签名钱包地址。
3. `Account Address`：Lens 账户地址（可由 `fetchAccountsBulk` 自动发现）。
4. 不允许在多个页面或 hooks 中重复实现上述映射逻辑。

## 快速流程

1. 初始化只读客户端 `PublicClient.create({ environment: testnet/mainnet })`。
2. 连接钱包并用 `client.login(...)` 获得 `SessionClient`。
3. 用 `article()` 生成 metadata，`storageClient.uploadAsJson()` 得到 `lens://...`。
4. 调用 `post(sessionClient, { contentUri: uri(...) })` 发布。
5. 调用 `fetchPosts(publicClient, { filter: { authors: [...] } })` 拉取文章。

## 页面权限与视角（必须）

1. `/:handle`、`/p/:postId` 必须允许未登录用户访问（公开可读）。
2. `/write` 必须要求 Lens account 已登录，且当前登录账号是该 profile owner。
3. UI 必须区分 `Owner View` 和 `Viewer View`：
   - `Owner View`：显示写作能力（如 `Write`、发布等）。
   - `Viewer View`：隐藏写作入口，不允许进入写作流程。
4. 账户相关按钮（Connect Wallet / Login Lens / Switch Lens Account）应放在全局导航区域，不应放在 profile 信息卡内部。

## 创建博文流程

### Step 1: 创建 Article Metadata

```ts
import { article } from "@lens-protocol/metadata";

const metadata = article({
  title: "我的第一篇博客",
  content: "## 引言\n这是正文内容\n\n## 结论\n感谢阅读",
  tags: ["web3", "lens", "blog"],
  locale: "zh-CN",
});
```

### Step 2: 上传 metadata 获取 content URI

```ts
import { StorageClient } from "@lens-chain/storage-client";

const storageClient = StorageClient.create();
const uploaded = await storageClient.uploadAsJson(metadata);
// uploaded.uri -> lens://...
```

### Step 3: 发布 Post

```ts
import { post } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/types";

const result = await post(sessionClient, {
  contentUri: uri(uploaded.uri),
}).andThen(handleOperationWith(walletClient));
```

## 账户登录与分支

### 分支 1：已有账户（Account Owner）

```ts
const appAddress = resolveLensAppAddress(network); // 默认 Lens global app address，可选 env 覆盖

const authenticated = await client.login({
  accountOwner: {
    app: evmAddress(appAddress),
    owner: evmAddress("<wallet-address>"),
    account: evmAddress("<lens-account-address>"),
  },
  signMessage: signMessageWith(walletClient),
});
```

### 分支 2：无账户（Onboarding User -> 创建账户）

- 先 `client.login({ onboardingUser: { app: resolveLensAppAddress(network), wallet }, signMessage })`
- 再 `createAccountWithUsername(...)`
- 交易后 `fetchAccount(...)` + `sessionClient.switchAccount(...)`

## 环境变量策略（低优先）

推荐保留以下变量：

```env
NEXT_PUBLIC_LENS_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BLOG_THEME=default
NEXT_PUBLIC_LENS_APP_ADDRESS=0x...
```

规则：

1. 缺失 `NEXT_PUBLIC_LENS_NETWORK` 时必须默认 `testnet`。
2. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 当前阶段必须提供（否则 WalletConnect 连接不稳定或失败）。
3. 缺失 `NEXT_PUBLIC_LENS_APP_ADDRESS` 时必须回退到网络对应的 Lens global app address。
4. `NEXT_PUBLIC_BLOG_THEME` 仅用于启动前主题选择；本 skill 不实现运行时主题切换 UI。

## Theme 边界（必须）

1. 用户可指定已有主题包（例如 `@lens-blog/theme-default`、`@lens-blog/theme-neo`）。
2. agent 只做主题接入（依赖、导入、配置），不在本 skill 内开发新主题。
3. 若用户要求“做一个新主题”，应转交独立 theme 开发 skill（例如后续的 `theme-develop`）。

## 查询文章

```ts
import { fetchPosts } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/types";

const posts = await fetchPosts(publicClient, {
  filter: { authors: [evmAddress("0x...")] },
  pageSize: 20,
});
```

## 检查钱包已有账户

```ts
import { fetchAccountsBulk } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/types";

const result = await fetchAccountsBulk(publicClient, {
  addresses: [evmAddress("0x...")],
});
```

## 已知兼容性坑

1. `@lens-protocol/client` 稳定版 `2.x` API 与本 skill 示例不兼容，优先 canary。
2. Node 建议使用 `20` 或 `22`；更高版本可能出现 engine warning。
3. 不要使用 `import "connectkit/build/index.css"`（该路径在部分版本未导出）。
4. 若构建报 `valtio/vanilla` 缺失，可安装 `valtio`。

## 最小验收清单

1. `npm install` 成功。
2. `npm run build` 成功。
3. 页面可连接钱包。
4. 可完成一次登录并提交发布请求。
5. 可按作者地址拉取文章列表。

## 参考资源

- 完整 API 与类型说明：[reference.md](reference.md)
- 官方文档：https://docs.lens.xyz
- Metadata 参考：https://lens-protocol.github.io/metadata/
