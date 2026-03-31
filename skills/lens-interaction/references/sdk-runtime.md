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
    - [Pagination 参考（官方）](#pagination-参考官方)
  - [发布最小流程（概念）](#发布最小流程概念)
  - [发布示例](#发布示例)

## 运行时配置

建议保留最小环境变量集合：

```env
NEXT_PUBLIC_LENS_NETWORK=testnet
NEXT_PUBLIC_LENS_APP_ADDRESS=<your_app_address>
```

说明：

1. 钱包连接相关配置由宿主钱包方案管理（例如使用 Privy 时由宿主层提供 `NEXT_PUBLIC_PRIVY_APP_ID`）
2. `lens-interaction` 不强制绑定具体钱包供应商环境变量
3. 推荐默认钱包入口为 `Privy`，但具体实现组合由宿主项目决定

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

1. 该地址来自 Lens 官方文档中的 test App
2. 仅建议用于本地验证或快速 demo
3. 生产环境应使用你自己的 app address
4. 如果用户没有配置 `NEXT_PUBLIC_LENS_APP_ADDRESS`，可以使用官方 test app 地址，但需要告知用户。

## 配置规则

1. `NEXT_PUBLIC_LENS_NETWORK` 缺失时回退 `testnet`
2. 钱包供应商必需配置由宿主层校验（`lens-interaction` 只消费地址与签名能力）
3. Lens 配置解析应集中在单模块，不应散落多个页面


## SDK 约束

1. 使用同一代际的 `@lens-protocol/client` 与 actions，避免混用
2. `evmAddress`、`uri` 等基础类型优先从 `@lens-protocol/client` 导入
3. 发布流程应遵循 metadata upload -> post 的顺序
4. 避免将 SDK 不稳定返回结构直接暴露到宿主层
5. 钱包到账户发现默认使用 `fetchAccountsAvailable({ managedBy, includeOwned: true })`
6. 若只需“严格钱包 owner 持有账号”，可补充 `fetchAccountsBulk({ ownedBy })` 作为收窄视图
7. 认证会话建议对齐官方 `keep alive + resume session`：浏览器场景可参考 `storage: window.localStorage`

## SDK 初始化示例

```ts
import { PublicClient, testnet, mainnet } from "@lens-protocol/client";
import { StorageClient } from "@lens-chain/storage-client";

export function createLensClients(config: { network: "testnet" | "mainnet" }) {
  const publicClient = PublicClient.create({
    environment: config.network === "mainnet" ? mainnet : testnet,
    storage: window.localStorage,
  });
  const storageClient = StorageClient.create();
  return { publicClient, storageClient };
}
```

说明：

1. 若不注入持久化 storage，SDK 可能只保留内存态，刷新后无法 `resumeSession`
2. 在 Next.js 中应确保上述 `window.localStorage` 仅在客户端可访问时初始化

## 拉取数据示例

```ts
import { fetchPosts, fetchAccountsAvailable, fetchAccountsBulk } from "@lens-protocol/client/actions";
import { evmAddress, PageSize } from "@lens-protocol/client";

export async function listWalletAccounts(publicClient: unknown, ownerAddress: string) {
  const available = await fetchAccountsAvailable(publicClient as never, {
    managedBy: evmAddress(ownerAddress),
    includeOwned: true,
    pageSize: PageSize.FIFTY,
  });

  return available?.value?.items ?? [];
}

// Optional: when product requires only owner-held accounts.
export async function listOwnedWalletAccounts(publicClient: unknown, ownerAddress: string) {
  const ownedBy = await fetchAccountsBulk(publicClient as never, {
    ownedBy: [evmAddress(ownerAddress)],
  });
  return ownedBy?.value ?? [];
}

export async function fetchAuthorPosts(publicClient: unknown, authorAddress: string) {
  const result = await fetchPosts(publicClient as never, {
    filter: { authors: [evmAddress(authorAddress)] },
    pageSize: PageSize.FIFTY,
  });
  return result?.value?.items ?? [];
}
```

### Pagination 参考（官方）

Lens 分页采用 cursor-based 方式，请使用 `PageSize` 枚举，不要传数字或字符串常量。

- [Paginated Results](https://lens.xyz/docs/protocol/best-practices/pagination)

## 发布最小流程（概念）

1. 组装 metadata（title/content/tags）
2. 上传 metadata 获取 `contentUri`
3. 在已认证会话下执行发布
4. 返回宿主层可用的稳定结果（例如 `postId`）

## 发布示例

```ts
import { article } from "@lens-protocol/metadata";
import { post } from "@lens-protocol/client/actions";
import { uri } from "@lens-protocol/client";

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
