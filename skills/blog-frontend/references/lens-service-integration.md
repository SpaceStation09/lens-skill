# Lens Service Integration

宿主层只依赖 `lens-interaction` 的 `LensService`。

推荐实现位置：`lib/blog/services/lens-service.ts`。

钱包层约束：

1. 默认钱包方案使用 `ConnectKit + wagmi + viem`
2. `LensService` 不负责钱包 UI，仅消费钱包地址与签名能力

## 需接入的方法

1. `resumeSession`
2. `getCurrentSession`
3. `listWalletAccounts`
4. `loginWithAccount`
5. `logout` / `resetAuth`
6. `getProfileByHandle`
7. `getPostsByHandle`
8. `getPostById`
9. `publishPost`

## 错误处理

1. 上层按统一错误码处理 UI
2. 不依赖 SDK 原始错误结构
3. `USER_REJECTED_SIGNATURE` 由上层决定提示文案
