# Auth Flow

本文件定义钱包到 Lens 登录的最小流程。

## 目录

1. [三段式流程](#三段式流程)
2. [新钱包首次创建流程（无 Lens 账号时）](#新钱包首次创建流程无-lens-账号时)
3. [启动恢复流程](#启动恢复流程)
4. [统一回退优先级（必须遵守）](#统一回退优先级必须遵守)
5. [登录示例](#登录示例)
6. [状态机映射](#状态机映射)
7. [关键规则](#关键规则)
8. [失败处理](#失败处理)
9. [resetAuth 示例](#resetauth-示例)
10. [启动时恢复示例](#启动时恢复示例)

## 三段式流程

1. 钱包连接（宿主层）
2. 发现该钱包可用 Lens 账号（`listWalletAccounts`）
3. 选择 Lens 账号并登录（`loginWithAccount`）

## 新钱包首次创建流程（无 Lens 账号时）

当 `listWalletAccounts` 返回空数组时，进入首次创建分支：

1. 用户输入候选 username
2. 调用 `canCreateUsername` 做可用性校验
3. 可用时调用 `createAccountWithUsername` 创建账号
4. 创建成功后返回 `AuthSession`，进入 `authenticated`

## 启动恢复流程

1. 应用启动先执行 `resumeSession`
2. 若恢复成功，直接进入 `authenticated`
3. 若恢复失败但钱包已连接，进入 `wallet_connected_unauthed`
4. 若钱包未连接，保持 `disconnected`

## 统一回退优先级（必须遵守）

当 `resumeSession` 失败或返回空时，状态回退必须按以下优先级：

1. 钱包当前仍连接：`wallet_connected_unauthed`
2. 钱包当前未连接：`disconnected`

不要在恢复失败时继续保留 `authenticated`，也不要进入未定义中间态。

## 登录示例

```ts
import { evmAddress } from "@lens-protocol/types";
import { signMessageWith } from "@lens-protocol/client/viem";

export async function loginWithAccount(client: unknown, walletClient: unknown, input: {
  ownerAddress: string;
  accountAddress: string;
  appAddress: string;
}) {
  const result = await (client as never).login({
    accountOwner: {
      app: evmAddress(input.appAddress),
      owner: evmAddress(input.ownerAddress),
      account: evmAddress(input.accountAddress),
    },
    signMessage: signMessageWith(walletClient as never),
  });

  // 项目中应在这里把 SDK 返回归一化为 AuthSession
  return result;
}
```

## 状态机映射

1. 钱包未连接：`disconnected`
2. 钱包已连接但未完成 Lens 登录：`wallet_connected_unauthed`
3. Lens 登录成功：`authenticated`

## 关键规则

1. 钱包连接与 Lens 登录是两个独立步骤
2. 登录成功后必须写入可重置的会话状态（owner + active account）
3. 切号可通过重新 `loginWithAccount` 完成
4. 主动登出、钱包断开、签名失效后，应调用 `resetAuth`
5. 宿主层 provider 初始化时应优先尝试会话恢复，而不是强制用户每次重登

## 失败处理

1. 无可用 Lens 账号：返回空列表，不应导致崩溃
2. username 不可用：抛出 `USERNAME_TAKEN`（或等价错误码）
3. 当前环境不支持 username 直建：抛出 `NAMESPACE_UNSUPPORTED_FLOW`
4. 签名拒绝：抛出 `USER_REJECTED_SIGNATURE`
5. 会话失效：后续写操作应返回 `SESSION_EXPIRED` 或 `UNAUTHENTICATED`

## resetAuth 示例

```ts
type AuthStore = {
  ownerAddress?: string;
  accountAddress?: string;
  handle?: string;
};

export function resetAuth(store: AuthStore) {
  store.ownerAddress = undefined;
  store.accountAddress = undefined;
  store.handle = undefined;
}
```

## 启动时恢复示例

```ts
export async function bootstrapAuth(service: {
  resumeSession: () => Promise<AuthStore | null>;
}, isWalletConnected: boolean) {
  const session = await service.resumeSession();
  if (!session) {
    return {
      accountState: isWalletConnected
        ? ("wallet_connected_unauthed" as const)
        : ("disconnected" as const),
    };
  }
  return {
    accountState: "authenticated" as const,
    ownerAddress: session.ownerAddress,
    accountAddress: session.accountAddress,
    handle: session.handle,
  };
}
```
