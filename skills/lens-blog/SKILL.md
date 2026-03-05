---
name: lens-blog
description: Guides agents to build a personal blog system using Lens Protocol SDK. Use when the user wants to create a Lens-based blog, publish articles on Lens, fetch blog posts from Lens feeds, or integrate Lens Protocol for decentralized blogging.
---

# 使用 Lens SDK 搭建个人博客系统

本 skill 指导 agent 使用 Lens Protocol 构建个人博客，覆盖最小可用主流程：连接钱包、登录、发布文章、按作者查询文章。

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

## 快速流程

1. 初始化只读客户端 `PublicClient.create({ environment: testnet/mainnet })`。
2. 连接钱包并用 `client.login(...)` 获得 `SessionClient`。
3. 用 `article()` 生成 metadata，`storageClient.uploadAsJson()` 得到 `lens://...`。
4. 调用 `post(sessionClient, { contentUri: uri(...) })` 发布。
5. 调用 `fetchPosts(publicClient, { filter: { authors: [...] } })` 拉取文章。

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
const authenticated = await client.login({
  accountOwner: {
    app: evmAddress("<your-app-address>"),
    owner: evmAddress("<wallet-address>"),
    account: evmAddress("<lens-account-address>"),
  },
  signMessage: signMessageWith(walletClient),
});
```

### 分支 2：无账户（Onboarding User -> 创建账户）

- 先 `client.login({ onboardingUser: { app, wallet }, signMessage })`
- 再 `createAccountWithUsername(...)`
- 交易后 `fetchAccount(...)` + `sessionClient.switchAccount(...)`

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
