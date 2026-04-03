# Authentication

## 范围与目标

本文件定义 Lens 交互层中的认证能力，覆盖：

1. 用户身份类型（核心）
2. 用户登录（核心）
3. Session 管理（核心）
4. Log-out
5. Get Last Logged-In Account

实现时以官方文档为准：  
<https://lens.xyz/docs/protocol/authentication>

## 身份类型

Lens API 使用认证角色区分权限边界：

- `Account Owner`：Lens 账户所有者。
- `Account Manager`：被授权管理某个 Lens 账户的用户。
- `Onboarding User`：尚未拥有 Lens 账户、仅执行引导相关操作的用户。
- `Builder`：开发者角色，用于配置与管理类能力。

实现要求：

- 在服务层显式区分角色，不混用权限上下文。
- 对需要 `Account Owner` / `Account Manager` 的操作做前置校验。

## 登录

目标：基于用户钱包签名完成登录，拿到可执行受保护动作的 `SessionClient`。

实现要点：

1. 明确登录意图（`onboardingUser` / `accountOwner` / `accountManager` / `builder`）。
2. 钱包连接后，优先用 `fetchAccountsAvailable` 发现该钱包可用账户，让用户先选择目标账户。
3. 基于选中的账户构建登录请求并调用 `client.login(...)`。
4. 成功后保存 `SessionClient` 到统一会话容器（内存或持久化存储）。
5. 失败时返回标准化错误，不吞错。

补充：

- 对 end-user 角色，登录时需要 app 地址上下文。
- 若用户未提供 app 地址，可使用官方 test app 地址作为默认值；地址以官方合约清单为准，不在 skill 内硬编码：
  <https://lens.xyz/docs/protocol/resources/contracts#deployed-contracts>
- 登录成功不代表业务可执行，仍需结合当前 account 与操作目标做一致性校验。
- 可用账户发现参考：<https://lens.xyz/docs/protocol/authentication#list-available-accounts>

四种登录意图与上下文要求：

- `onboardingUser`：用于未创建 Lens Account 的用户，需提供 `app` 与当前钱包地址。
- `accountOwner`：用于账户所有者登录，需提供 `app`、目标 account 与所有者钱包上下文。
- `accountManager`：用于受托管理者登录，需提供 `app`、目标 account 与管理者钱包上下文。
- `builder`：用于开发者角色登录，不需要 `app` 地址。

参考代码（TypeScript，结构示意）：

```ts
import { client } from "./client";
import { signMessageWith } from "@lens-protocol/client/viem";

const authenticated = await client.login({
  onboardingUser: {
    app: appAddress,
    wallet: signer.address,
  },
  signMessage: signMessageWith(signer),
});

if (authenticated.isErr()) throw authenticated.error;
const sessionClient = authenticated.value;
```

```ts
const authenticated = await client.login({
  accountOwner: {
    app: appAddress,
    account: accountAddress,
    owner: signer.address,
  },
  signMessage: signMessageWith(signer),
});
```

```ts
const authenticated = await client.login({
  accountManager: {
    app: appAddress,
    account: accountAddress,
    manager: signer.address,
  },
  signMessage: signMessageWith(signer),
});
```

```ts
const authenticated = await client.login({
  builder: {
    wallet: signer.address,
  },
  signMessage: signMessageWith(signer),
});
```

以上四段用于说明参数结构差异。实际字段名与可选项以官方文档各角色对应示例为准：  
<https://lens.xyz/docs/protocol/authentication#log-in-to-lens>

## Session 管理

目标：会话可恢复、可查询、可维护，避免“用户已登录但上下文丢失”。

建议能力：

1. `resumeSession`：应用启动时尝试恢复历史会话。
2. `currentSession`：查询当前会话详情。
3. `fetchAuthenticatedSessions`：列出已认证会话（分页）。
4. 会话存储策略：浏览器场景优先使用 `window.localStorage` 持久化；其他场景按需使用自定义 `IStorageProvider`。

实现约束：

- 浏览器端默认采用 `window.localStorage`，避免刷新页面后会话丢失。
- `resumeSession` 失败时不静默伪造已登录状态。
- 会话失效、过期或角色不匹配时，立即返回可诊断错误并要求重新认证。

参考代码（TypeScript）：

```ts
import { PublicClient, mainnet } from "@lens-protocol/client";

export const client = PublicClient.create({
  environment: mainnet,
  storage: window.localStorage,
});
```

```ts
const resumed = await client.resumeSession();
if (resumed.isErr()) throw resumed.error;
const sessionClient = resumed.value;
```

## Log-out

目标：主动撤销认证会话并清理本地状态。

实现要点：

1. 调用 `client.logout()` 撤销会话。
2. 清理本地缓存的会话、account 上下文、鉴权 token。
3. 返回明确结果给上层，供前端刷新登录态。

参考代码（TypeScript）：

```ts
const result = await client.logout();
if (result.isErr()) throw result.error;
```

## Get Last Logged-In Account

目标：在“未重新登录前”给返回用户提供上次登录账户线索。

实现要点：

1. 调用 `lastLoggedInAccount` 查询最近登录账户。
2. 支持按 app 维度查询与全局查询两种模式。
3. 若无历史记录，返回空值而非报错。

参考代码（TypeScript）：

```ts
import { evmAddress } from "@lens-protocol/client";
import { lastLoggedInAccount } from "@lens-protocol/client/actions";

const result = await lastLoggedInAccount(anyClient, {
  address: evmAddress(walletAddress),
});
if (result.isErr()) throw result.error;
const account = result.value ?? null;
```

## 前置条件清单（认证域）

在执行受保护能力（如 account 写操作、post 创建）前，至少满足：

- 存在有效 `SessionClient`。
- 当前认证角色满足目标操作权限。
- 当前 account 上下文与目标资源一致（或已显式切换）。

不满足任一条件时，直接失败并返回可行动的错误信息。
