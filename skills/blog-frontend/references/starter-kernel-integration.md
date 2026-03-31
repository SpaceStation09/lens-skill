# Starter Kernel Integration

本文件定义最小功能内核源码的分发与接入方式。

## 分发范围

- `assets/starter/lib/blog/types.ts`
- `assets/starter/lib/blog/guards/owner.ts`
- `assets/starter/lib/blog/services/lens-service.ts`
- `assets/starter/lib/blog/provider/state.tsx`

## 接入顺序

1. 先复制 starter 文件到目标项目的 `lib/blog/`。
2. 用 `lens-interaction` 实现替换 `createLensServiceStub`。
3. 在宿主层 provider 中注入真实 `LensService`。
4. 保持状态机三态不变，不新增中间态。

## 强规则

1. `lib/blog/services/lens-service.ts` 只暴露稳定 contract。
2. `lib/blog/guards/owner.ts` 以 address 判定 owner，不以 handle 字符串判定。
3. `lib/blog/provider/state.tsx` 负责状态流转，不负责协议调用细节。
4. 真实协议能力全部来自 `lens-interaction`。
