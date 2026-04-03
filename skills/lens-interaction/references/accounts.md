# Accounts

## 范围与目标

本文件定义 Lens 账户体系相关能力，覆盖：

1. 账户概念与角色边界
2. Create Account
3. Fetch Account
4. Update Account Metadata

## 账户概念

- Lens `Account` 是用户在 Lens 协议中的核心身份载体（链上账户实体）。
- 一个 Account 可拥有多个 username（跨不同 namespace），同一 namespace 下通常只对应一个 username。
- 账户读能力可匿名调用；账户写能力要求认证角色满足权限边界。

实现要求：

- 在交互层显式区分 `Account`（身份实体）与 `metadata`（可更新资料）。
- 任何写操作都基于当前 `SessionClient` 的角色校验（Owner/Manager）。

## Create Account

创建账户的最小流程：

1. 以 `Onboarding User` 登录。
2. 校验 username 可用性（`canCreateUsername`）。
3. 准备并上传 account metadata（得到 `metadataUri`）。
4. 调用 `createAccountWithUsername`。
5. 交易确认后 `fetchAccount`，并切换到新建账户的 `Account Owner` 上下文。

参考代码（TypeScript）：

```ts
import { uri } from "@lens-protocol/client";
import {
  canCreateUsername,
  createAccountWithUsername,
  fetchAccount,
} from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

const canUse = await canCreateUsername(sessionClient, {
  localName: desiredLocalName,
});
if (canUse.isErr()) throw canUse.error;

const created = await createAccountWithUsername(sessionClient, {
  username: { localName: desiredLocalName },
  metadataUri: uri(metadataUri),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
if (created.isErr()) throw created.error;

const accountResult = await fetchAccount(sessionClient, { txHash: created.value });
if (accountResult.isErr() || !accountResult.value) throw accountResult.error;

const switched = await sessionClient.switchAccount({
  account: accountResult.value.address,
});
if (switched.isErr()) throw switched.error;
```

实现约束：

- `canCreateUsername` 返回非可用结果时直接失败，不尝试“先创建再看链上报错”。

## Fetch Account

### Discover Available Account

适用于「用户 connect wallet 后，先发现可用 Lens 账户，再选择登录账户」的场景。  
这里优先使用官方推荐的 `fetchAccountsAvailable`：

```ts
import { evmAddress, PageSize } from "@lens-protocol/client";
import { fetchAccountsAvailable } from "@lens-protocol/client/actions";

const result = await fetchAccountsAvailable(client, {
  managedBy: evmAddress(walletAddress),
  includeOwned: true,
  pageSize: PageSize.FIFTY,
});
if (result.isErr()) throw result.error;

const { items, pageInfo } = result.value; // Array<AccountManaged | AccountOwned>
```

执行约束：

- `managedBy` 必须传当前已连接钱包地址。
- 结果为空时返回空列表，不报错。
- 用户选中目标账户后，再进入 `accountOwner` / `accountManager` 登录流程。

### Query Account

读取账户时，lens支持以下查询入口：

- 按 `address` 查询
- 按 `username` 查询
- 按 `txHash` 查询（常用于创建后回查）
- 按 legacy id 查询（迁移场景）

参考代码（TypeScript）：

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";

const result = await fetchAccount(client, {
  address: evmAddress(accountAddress),
});
if (result.isErr()) throw result.error;

const account = result.value; // Account | null
```

以上代码是查根据account address进行查询的参考，对于其他查询方式，写法如下：
- 按 `username` 查询：`{username: {localName: "<your-username>"}}`, 如果是特殊的namespace则为：`{username: {localName: "<your-username>"， namespace: evmAddress("<namespace-address>")}}`
- 按 `txHash` 查询（常用于创建后回查）: `{txHash: txHash("0x1234…")}`
- 按 legacy id 查询（迁移场景）:`{legacyProfileId: "0x05" as LegacyProfileId}`


建议在交付层做一次统一映射，仅向上层暴露稳定字段（如 `address`、`username`、`metadata.name`、`metadata.picture`）。

## Update Account Metadata

更新账户资料的最小流程：

1. 构建新的 metadata 对象。
2. 上传 metadata 到可公开访问 URI（如 Grove）。
3. 调用 `setAccountMetadata` 更新 `metadataUri`。
4. 处理交易结果并等待索引可见。

前置权限：

- 必须以 `Account Owner` 或 `Account Manager` 身份认证。

参考代码（TypeScript）：

```ts
import { uri } from "@lens-protocol/client";
import { setAccountMetadata } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

const result = await setAccountMetadata(sessionClient, {
  metadataUri: uri(nextMetadataUri),
}).andThen(handleOperationWith(walletClient));

if (result.isErr()) throw result.error;
```

实现约束：

- metadata 更新采用全量对象语义：需要保留的旧字段应在新 metadata 中显式复制。
- 不静默合并旧 metadata；调用方必须明确传入最终目标 metadata。
- 更新完成后建议回查一次 `fetchAccount`，确认索引结果与预期一致。

## 前置条件清单（账户域）

执行账户相关能力前，至少满足：

- create：已通过 `Onboarding User` 登录，并可完成签名。
- update metadata：当前 session 为 `Account Owner` 或 `Account Manager`。
- write 操作前：account 上下文（即，已经登陆的account）已对齐目标账户地址。

任一条件不满足时，直接返回可诊断错误，不做隐式降级。
