# Lens 博客系统 API 参考（Canary 代际）

## 1) 版本矩阵（推荐）

```txt
@lens-protocol/client: 0.0.0-canary-20250820102520
@lens-protocol/metadata: ^2.1.0
@lens-chain/storage-client: ^1.0.6
@lens-chain/sdk: ^1.0.3
```

## 2) Client 初始化

```ts
import { PublicClient, testnet, mainnet } from "@lens-protocol/client";

export const publicClient = PublicClient.create({
  environment: testnet, // 或 mainnet
});
```

## 3) 常用 import 路径

```ts
import { PublicClient, testnet } from "@lens-protocol/client";
import { post, fetchPosts, fetchAccountsBulk, createAccountWithUsername } from "@lens-protocol/client/actions";
import { handleOperationWith, signMessageWith } from "@lens-protocol/client/viem";
import { evmAddress, uri, postId } from "@lens-protocol/types";
import { StorageClient } from "@lens-chain/storage-client";
import { article, account } from "@lens-protocol/metadata";
```

## 4) Metadata Builders

### article()

```ts
article({
  title: "标题",
  content: "Markdown 内容",
  tags: ["lens", "blog"],
  locale: "zh-CN",
});
```

### account()

```ts
account({
  name: "作者名",
  bio: "简介",
});
```

## 5) 核心 Actions

| Action | 用途 | 需要 Session |
|---|---|---|
| `post(client, { contentUri, feed?, commentOn? })` | 发帖/评论/引用 | 是 |
| `fetchPosts(client, { filter, cursor, pageSize })` | 获取帖子列表 | 否 |
| `fetchAccountsBulk(client, { addresses })` | 批量查询账户 | 否 |
| `fetchAccount(client, { address/username/txHash })` | 查询单个账户 | 否 |
| `createAccountWithUsername(client, { username, metadataUri })` | 创建账户+用户名 | 是（Onboarding） |
| `sessionClient.switchAccount({ account })` | 切换当前账户 | 是 |
| `editPost(client, { post, contentUri })` | 编辑帖子 | 是 |
| `deletePost(client, { post })` | 删除帖子 | 是 |

## 6) 登录模型

### Onboarding User

```ts
client.login({
  onboardingUser: {
    app: evmAddress("<app-address>"),
    wallet: evmAddress("<wallet-address>"),
  },
  signMessage: signMessageWith(walletClient),
});
```

### Account Owner

```ts
client.login({
  accountOwner: {
    app: evmAddress("<app-address>"),
    owner: evmAddress("<wallet-address>"),
    account: evmAddress("<lens-account-address>"),
  },
  signMessage: signMessageWith(walletClient),
});
```

## 7) 发布文章（最小示例）

```ts
const storageClient = StorageClient.create();

const metadata = article({
  title: "我的第一篇博客",
  content: "正文",
  tags: ["lens", "blog"],
});

const uploaded = await storageClient.uploadAsJson(metadata);

const result = await post(sessionClient, {
  contentUri: uri(uploaded.uri),
}).andThen(handleOperationWith(walletClient));
```

## 8) 查询作者文章

```ts
const result = await fetchPosts(publicClient, {
  filter: { authors: [evmAddress("0x作者地址")] },
  pageSize: 20,
});
```

分页：

```ts
const { items, pageInfo } = result.value;
const next = await fetchPosts(publicClient, {
  filter: { authors: [evmAddress("0x作者地址")] },
  cursor: pageInfo.next,
  pageSize: 20,
});
```

## 9) 检查钱包账户

```ts
const result = await fetchAccountsBulk(publicClient, {
  addresses: [evmAddress("0x钱包地址")],
});
```

## 10) Wagmi 配置（Next.js）

```ts
import { chains } from "@lens-chain/sdk/viem";
import { createConfig, http } from "wagmi";
import { getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    appName: "Lens Blog Demo",
    chains: [chains.mainnet, chains.testnet],
    transports: {
      [chains.mainnet.id]: http(chains.mainnet.rpcUrls.default.http[0]),
      [chains.testnet.id]: http(chains.testnet.rpcUrls.default.http[0]),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  })
);
```

## 11) 兼容性注意事项

1. `@lens-protocol/client@2.x` 与本文 API 结构不同，不要混用。
2. `evmAddress`、`uri` 在 `@lens-protocol/types`。
3. 避免 `connectkit/build/index.css` 深路径导入。
4. 若打包报 `valtio/vanilla` 缺失，安装 `valtio`。
5. Node 建议 `20/22`。
