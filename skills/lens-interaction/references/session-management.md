# Session Management

Lens 交互层必须管理认证 session，以保证“刷新后尽量免重登”的体验。

本文件基于 Lens 官方认证文档中的 `Manage Sessions` 能力整理（见：https://lens.xyz/docs/protocol/authentication#manage-sessions）。
其中 `Keep Alive + Resume Session` 路径见：
https://lens.xyz/docs/protocol/authentication#manage-sessions-keep-alive-resume-session

## 设计目标

1. 应用启动时自动尝试恢复 session
2. 发布等写操作只在有效 session 下执行
3. 提供明确的登出与会话重置路径
4. 宿主层只消费稳定的 `AuthSession`，不消费 SDK 内部结构

## Client 配置建议

按官方文档的 keep-alive 写法，在创建 `PublicClient` 时传 `storage`。
浏览器场景通常使用 `window.localStorage`：

```ts
import { PublicClient, testnet } from "@lens-protocol/client";

const client = PublicClient.create({
  environment: testnet,
  storage: window.localStorage,
});
```

参考含义：若未使用长期 storage，刷新页面后通常无法 `resumeSession()`。

## 推荐 API（封装后暴露给宿主层）

```ts
type SessionManager = {
  resumeSession: () => Promise<AuthSession | null>;
  getCurrentSession: () => Promise<AuthSession | null>; // 从本地内存态读取已归一化会话
  logout: () => Promise<void>;
  resetAuth: () => Promise<void>;
};
```

## 启动恢复示例

```ts
export async function resumeSession(client: unknown): Promise<AuthSession | null> {
  const resumed = await (client as never).resumeSession?.();
  if (resumed?.isErr?.()) return null;
  const sessionClient = resumed?.value;
  if (!sessionClient) return null;

  const { currentSession } = await import("@lens-protocol/client/actions");
  const current = await currentSession(sessionClient);
  if (current?.isErr?.() || !current?.value) return null;
  const session = current.value as any;

  return {
    ownerAddress: String(session.authentication?.wallet ?? ""),
    accountAddress: String(session.authentication?.authenticatedAs ?? ""),
    handle: session.account?.username?.localName as string | undefined,
  };
}
```

## 失效与登出策略

1. token 过期、恢复失败或签名无效时，按统一优先级回退：
   - 钱包已连接：`wallet_connected_unauthed`
   - 钱包未连接：`disconnected`
2. 用户主动登出时，调用 SDK logout（若可用）并清理本地 session
3. `resetAuth` 必须是幂等操作，可多次调用

## 错误码与状态回退矩阵

| 场景           | 错误码                                | 钱包已连接时回退                    | 钱包未连接时回退 |
| -------------- | ------------------------------------- | ----------------------------------- | ---------------- |
| 启动恢复失败   | `SESSION_EXPIRED` / `UNAUTHENTICATED` | `wallet_connected_unauthed`         | `disconnected`   |
| 登录签名被拒绝 | `USER_REJECTED_SIGNATURE`             | `wallet_connected_unauthed`（保持） | `disconnected`   |
| 发布时会话失效 | `SESSION_EXPIRED`                     | `wallet_connected_unauthed`         | `disconnected`   |
| 主动登出       | 无或 `UNAUTHENTICATED`                | `wallet_connected_unauthed`         | `disconnected`   |
| 钱包断开       | 无                                    | `-`                                 | `disconnected`   |

规则：

1. 任何错误都不能将状态提升为 `authenticated`
2. 只有 `resumeSession` 成功或 `loginWithAccount` 成功，才能进入 `authenticated`
3. 对齐官方 keep-alive 流程：建议对“不可恢复 session”提供明确可见错误，便于定位
