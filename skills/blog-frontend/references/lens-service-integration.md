# Lens Service Integration

宿主层只依赖 `lens-interaction` 的 `LensService`。

推荐实现位置：`lib/blog/services/lens-service.ts`。

钱包层约束：

1. 默认钱包方案使用 `Privy` 作为连接入口与签名能力来源
2. `LensService` 不负责钱包 UI，仅消费钱包地址与签名能力
3. `wagmi` / `viem` 是否引入由项目实现决定，不作为强制要求

## 需接入的方法

1. `resumeSession`
2. `getCurrentSession`
3. `listWalletAccounts`
4. `canCreateUsername`
5. `createAccountWithUsername`
6. `loginWithAccount`
7. `logout` / `resetAuth`
8. `getProfileByHandle`
9. `getPostsByHandle`
10. `getPostById`
11. `publishPost`

## 错误处理

1. 上层按统一错误码处理 UI
2. 不依赖 SDK 原始错误结构
3. `USER_REJECTED_SIGNATURE` 由上层决定提示文案
4. 创建账号场景至少处理：`USERNAME_TAKEN`、`NAMESPACE_UNSUPPORTED_FLOW`
5. 登录/创建成功后跳转 `/:handle` 时，应优先使用 `AuthSession.handle`，避免额外查询与路由漂移
6. `createAccountWithUsername` 应返回创建结果（如 `accountAddress` / `txHash`），不要默认“创建即 authenticated”

## 会话恢复对齐

1. 前端体验目标：用户刷新或短期回访时，不应频繁被要求重新登录/签名
2. `lens-interaction` 层应提供官方 `Manage Sessions -> Keep Alive -> Resume Session` 的参考实现
3. 若刷新后 `resumeSession` 经常丢失，应优先检查 session 持久化配置，再处理 UI 展示
