# SDK And Runtime Constraints

本文件给出 Lens 交互层的运行时约束与依赖建议。

## 运行时配置

建议保留最小环境变量集合：

```env
NEXT_PUBLIC_LENS_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_LENS_APP_ADDRESS=0x...
```

## 官方 test app 地址（用于快速实验）

1. `mainnet`: `0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE`
2. `testnet`: `0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7`

说明：

1. 以上地址来自 Lens 官方文档中的 test App
2. 仅建议用于本地验证或快速 demo
3. 生产环境应使用你自己的 app address

## 配置规则

1. `NEXT_PUBLIC_LENS_NETWORK` 缺失时回退 `testnet`
2. `NEXT_PUBLIC_LENS_APP_ADDRESS` 缺失时回退到网络对应的官方 test app address：
   - `mainnet -> 0x8A5Cc31180c37078e1EbA2A23c861Acf351a97cE`
   - `testnet -> 0xC75A89145d765c396fd75CbD16380Eb184Bd2ca7`
3. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 为必填
4. Lens 配置解析应集中在单模块，不应散落多个页面

## SDK 约束

1. 使用同一代际的 `@lens-protocol/client` 与 actions，避免混用
2. `evmAddress`、`uri` 等基础类型使用官方稳定导出
3. 发布流程应遵循 metadata upload -> post 的顺序
4. 避免将 SDK 不稳定返回结构直接暴露到宿主层

## SDK 初始化示例

```ts
import { PublicClient, testnet, mainnet } from "@lens-protocol/client";
import { StorageClient } from "@lens-chain/storage-client";

export function createLensClients(config: { network: "testnet" | "mainnet" }) {
  const publicClient = PublicClient.create({
    environment: config.network === "mainnet" ? mainnet : testnet,
  });
  const storageClient = StorageClient.create();
  return { publicClient, storageClient };
}
```

## 拉取数据示例

```ts
import { fetchPosts, fetchAccountsBulk } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/types";

export async function listWalletAccounts(publicClient: unknown, ownerAddress: string) {
  const result = await fetchAccountsBulk(publicClient as never, {
    addresses: [evmAddress(ownerAddress)],
  });
  return result?.value?.items ?? [];
}

export async function fetchAuthorPosts(publicClient: unknown, authorAddress: string) {
  const result = await fetchPosts(publicClient as never, {
    filter: { authors: [evmAddress(authorAddress)] },
    pageSize: 20,
  });
  return result?.value?.items ?? [];
}
```

## 发布最小流程（概念）

1. 组装 metadata（title/content/tags）
2. 上传 metadata 获取 `contentUri`
3. 在已认证会话下执行发布
4. 返回宿主层可用的稳定结果（例如 `postId`）

## 发布示例

```ts
import { article } from "@lens-protocol/metadata";
import { post } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/types";

export async function publishPost(sessionClient: unknown, storageClient: unknown, input: {
  title: string;
  content: string;
  tags?: string[];
}) {
  const metadata = article({
    title: input.title,
    content: input.content,
    tags: input.tags ?? [],
  });

  const uploaded = await (storageClient as never).uploadAsJson(metadata);
  const result = await post(sessionClient as never, {
    contentUri: uri(uploaded.uri),
  });

  // 项目中请在这里做 result -> { postId } 的归一化
  return result;
}
```
