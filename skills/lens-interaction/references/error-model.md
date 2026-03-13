# Error Model

本文件定义 Lens 交互层对宿主层暴露的错误语义。

## 统一错误类型

```ts
type LensInteractionErrorCode =
  | "UNAUTHENTICATED"
  | "USER_REJECTED_SIGNATURE"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "INVALID_INPUT"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "CONFIG_ERROR"
  | "UNKNOWN";

type LensInteractionError = {
  code: LensInteractionErrorCode;
  message: string;
  retryable?: boolean;
};
```

## 使用规则

1. 对宿主层抛出上述统一错误，不透传 SDK 原始异常对象
2. 缺少关键 env（如 walletconnect project id）时抛 `CONFIG_ERROR`
3. 查询缺失资源时：
   - 若接口约定返回 `null`，不抛错
   - 其余场景可抛 `NOT_FOUND`
4. 网络抖动、RPC 失败归类为 `NETWORK_ERROR`
5. 无法归类时使用 `UNKNOWN`

## 诊断建议

1. 记录原始错误到内部日志（可选）
2. 对外 message 保持可读，不包含协议内部噪音字段
3. 保持 code 稳定，避免上层出现大量分支漂移
