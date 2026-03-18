# SDK And Runtime Constraints

本文件给出 Lens 交互层的运行时约束与依赖建议。

## 目录

- [SDK And Runtime Constraints](#sdk-and-runtime-constraints)
  - [目录](#目录)
  - [运行时配置](#运行时配置)
  - [版本策略（默认）](#版本策略默认)
  - [官方 test app 地址（用于快速实验）](#官方-test-app-地址用于快速实验)
  - [配置规则](#配置规则)
  - [SDK 约束](#sdk-约束)
  - [SDK 初始化示例](#sdk-初始化示例)
  - [拉取数据示例](#拉取数据示例)
  - [发布最小流程（概念）](#发布最小流程概念)
  - [发布示例](#发布示例)

## 运行时配置

建议保留最小环境变量集合：

```env
NEXT_PUBLIC_LENS_NETWORK=testnet
NEXT_PUBLIC_LENS_APP_ADDRESS=0x...
```

说明：

1. 钱包连接相关配置由宿主钱包方案管理（例如使用 Privy 时由宿主层提供 `NEXT_PUBLIC_PRIVY_APP_ID`）
2. `lens-interaction` 不强制绑定具体钱包供应商环境变量

## 版本策略（默认）

不在 skill 内固化具体版本号；优先使用 Lens 官方文档在当前时间推荐的同代际版本组合。

规则：

1. 先选择同代际组合（`@lens-protocol/client` 与 `@lens-protocol/types` 保持同代际）
2. 安装后立刻验证“登录 / 读取 / 发布 / session 恢复”四条核心链路
3. 验证通过后锁定 lockfile，避免依赖漂移
4. 发生 peer dependency 冲突时，先调整版本组合，再安装
5. 不要直接用忽略冲突参数（如 `--force` / `--legacy-peer-deps`）掩盖版本问题

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
3. 钱包供应商必需配置由宿主层校验（`lens-interaction` 只消费地址与签名能力）
4. Lens 配置解析应集中在单模块，不应散落多个页面

## SDK 约束

1. 使用同一代际的 `@lens-protocol/client` 与 actions，避免混用
2. `evmAddress`、`uri` 等基础类型使用官方稳定导出
3. 发布流程应遵循 metadata upload -> post 的顺序
4. 避免将 SDK 不稳定返回结构直接暴露到宿主层
5. `pageSize` 必须使用 Lens GraphQL 支持的枚举值（如 `TEN`、`FIFTY`），不要传数字（如 `20`、`50`）
6. 钱包到账户发现默认使用 `fetchAccountsBulk({ ownedBy })`；不要只依赖 `fetchAccountsBulk({ addresses })`
7. 仅当产品需求明确需要“managed/delegated 可用账号”时，再补充 `fetchAccountsAvailable(managedBy)` 作为扩展检索

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
import { fetchPosts, fetchAccountsAvailable, fetchAccountsBulk } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/types";

export async function listWalletAccounts(publicClient: unknown, ownerAddress: string) {
  const ownedBy = await fetchAccountsBulk(publicClient as never, {
    ownedBy: [evmAddress(ownerAddress)],
  });

  return ownedBy?.value ?? [];
}

// Optional: extend discovery for managed/delegated accounts when product requires it.
export async function listWalletAccountsExtended(publicClient: unknown, ownerAddress: string) {
  const [ownedBy, available] = await Promise.all([
    fetchAccountsBulk(publicClient as never, {
      ownedBy: [evmAddress(ownerAddress)],
    }),
    fetchAccountsAvailable(publicClient as never, {
      managedBy: evmAddress(ownerAddress),
      includeOwned: true,
      pageSize: "FIFTY",
    }),
  ]);

  return [...(ownedBy?.value ?? []), ...(available?.value?.items ?? [])];
}

export async function fetchAuthorPosts(publicClient: unknown, authorAddress: string) {
  const result = await fetchPosts(publicClient as never, {
    filter: { authors: [evmAddress(authorAddress)] },
    pageSize: "FIFTY",
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
