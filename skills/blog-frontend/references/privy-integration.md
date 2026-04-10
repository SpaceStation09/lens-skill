# Privy Integration

本文件说明默认钱包方案 `Privy` 如何与 `lens-interaction` 的 Lens 登录路径对接。

## Purpose

默认 baseline 采用 `Privy`，目标是优先提供邮箱登录驱动的钱包接入体验。

## Important Note

以下代码仅用于说明接线形状，不保证逐字可运行。

落地前请先确认：

1. 当前项目使用的 `@privy-io/react-auth` 版本。
2. 当前项目使用的 `@lens-protocol/client@canary` 版本。
3. `useWallets()`、`usePrivy()`、`useSignMessage()` 等 hook 的实际返回类型。

## Baseline Wiring

推荐把 `Privy` 接线放在 `WalletProvider` 或 `LensAuthProvider` 的边界层，而不是放进 theme。

最小职责：

1. 连接钱包。
2. 暴露当前钱包地址。
3. 通过签名 hook 提供 Lens 登录所需的签名能力。

## Example Shape

```ts
import { useMemo } from "react";
import { usePrivy, useSignMessage, useWallets } from "@privy-io/react-auth";

export function usePrivyWalletBridge() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const { signMessageAsync } = useSignMessage();

  const activeWallet = wallets[0] ?? null;

  return useMemo(
    () => ({
      ready,
      authenticated,
      address: activeWallet?.address ?? null,
      connectWallet: login,
      logout,
      signMessage: async (message: string) => {
        return signMessageAsync({ message });
      },
    }),
    [activeWallet, authenticated, login, logout, ready, signMessageAsync],
  );
}
```

## Lens Login Hand-off

`lens-interaction` 侧需要的通常不是 `Privy` 对象本身，而是：

1. 当前钱包地址
2. 可执行的签名函数
3. 明确的 Lens 环境与 app 配置

交接形状示意：

```ts
const walletBridge = usePrivyWalletBridge();

await loginToLens({
  environment,
  appAddress,
  walletAddress: walletBridge.address,
  signMessage: walletBridge.signMessage,
});
```

## Rules

1. 不要假设 `ConnectedWallet` 对象本身直接提供可用的签名方法。
2. 默认通过 `useSignMessage()` 这类 hook 提供签名能力。
3. 不要把 `Privy` 接线写进 theme。
4. `blog-frontend` 只负责前端钱包接入与交接，Lens 登录的具体参数语义仍以 `lens-interaction` 为准。
