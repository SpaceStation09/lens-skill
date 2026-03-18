# Provider State Machine

推荐实现位置：`lib/blog/provider/`，在 `app/providers.tsx` 中挂载。

## 状态定义

```ts
type AccountState =
  | "disconnected"
  | "wallet_connected_unauthed"
  | "authenticated";
```

## 初始化

1. 读取钱包连接状态
2. 调用 `lensService.resumeSession()`
3. 回退规则：
   - 恢复成功 -> `authenticated`
   - 恢复失败且钱包已连接 -> `wallet_connected_unauthed`
   - 恢复失败且钱包未连接 -> `disconnected`

## 必备动作

1. `loginLens(accountAddress)`
2. `createLensAccount(username)`
3. `logoutLens`
4. `resetAuth`

补充：

1. `connectWallet` 由 Privy / wagmi 等钱包库负责，本文件不定义其内部状态规则

## 规则

1. 只有 `resumeSession` 或 `loginLens` 成功可进入 `authenticated`
2. 任何错误都不能把状态提升为 `authenticated`
3. 钱包断开后强制进入 `disconnected`
4. 在 `/`（landing）上，`resumeSession` / `loginLens` / `createLensAccount` 成功后应自动跳转 `/:handle`
5. 跳转 handle 解析优先级建议：
   - `AuthSession.handle`
   - 登录列表里所选账号的 `handle`
   - 创建流程输入并通过校验的 `username`
6. 若无法解析 handle，不应静默停留；应显示可见兜底（错误提示或可恢复操作）并提示用户重试

## Lens 业务动作前置条件表

| 动作                        | `disconnected`                 | `wallet_connected_unauthed`            | `authenticated`                                     |
| --------------------------- | ------------------------------ | -------------------------------------- | --------------------------------------------------- |
| `loginLens(accountAddress)` | 不允许；先连接钱包             | 允许；成功后进入 `authenticated`       | 允许；用于切换 Lens 账号（保持 `authenticated`） |
| `createLensAccount(username)` | 不允许；先连接钱包           | 允许；仅当当前钱包无 Lens 账号时可执行；成功后进入 `authenticated` | 不建议；应提示先退出或切号 |
| `logoutLens()`              | 幂等；保持 `disconnected`      | 幂等；保持 `wallet_connected_unauthed` | 允许；退出后按钱包连接态回退                        |
| `resetAuth()`               | 幂等；保持 `disconnected`      | 幂等；保持 `wallet_connected_unauthed` | 允许；清空会话并按钱包连接态回退                    |
| `publishPost(input)`        | 不允许；返回 `UNAUTHENTICATED` | 不允许；返回 `UNAUTHENTICATED`         | 仅 `isOwnerView=true` 允许；否则 gate               |
