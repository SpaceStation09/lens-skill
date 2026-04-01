# Data Contract

## 目标

为前端提供稳定的数据接入点，屏蔽 Lens SDK 响应差异。  
无论是 authentication、accounts、posts，统一返回同一种外层结构。

## 统一返回结构

```ts
type LensResult<T> = {
  success: boolean;
  data: T | null;
  error: LensError | null;
  meta: LensMeta;
};
```

```ts
type LensMeta = {
  cursor?: string | null;
  nextCursor?: string | null;
  hasMore?: boolean;
  source: "lens";
  timestamp: string; // ISO string
};
```

```ts
type LensError = {
  code: string;
  message: string;
  retryable: boolean;
  details?: unknown;
};
```

约束：

- 成功时：`success = true`，`error = null`。
- 失败时：`success = false`，`data = null`。
- 不返回“半成功”状态，避免前端分支复杂化。

## 分页契约

Lens 使用游标分页（cursor-based pagination）。分页响应建议保持官方形态：
<https://lens.xyz/docs/protocol/best-practices/pagination#paginated-results>

```ts
type LensPage<T> = {
  items: T[];
  pageInfo: {
    prev: string | null;
    next: string | null;
  };
};
```

分页请求参数建议统一为：

```ts
type LensPageRequest = {
  cursor?: string | null;
  pageSize?: number | null;
};
```

实现约束（对齐官方 best practices）：

- `cursor` 使用上一页返回的 `pageInfo.next` 或 `pageInfo.prev`。
- `cursor` 是 opaque 值，不做业务解析。
- 翻页时保持和首页一致的 `filter` 与 `pageSize`。
- `hasMore` 可作为派生字段：`hasMore = pageInfo.next !== null`。

## 模块数据映射

最小稳定字段建议如下。

### Authentication

```ts
type AuthSessionView = {
  authenticationId: string;
  accountAddress?: string | null;
  app?: string | null;
};
```

### Account

```ts
type AccountView = {
  address: string;
  username?: string | null;
  name?: string | null;
  bio?: string | null;
  picture?: string | null;
};
```

### Post

```ts
type PostView = {
  id: string;
  slug?: string | null;
  authorAddress: string;
  content?: string | null;
  createdAt?: string | null;
};
```

## 错误映射建议

将 Lens 原始错误归一化为业务可消费错误码，例如：

- `LENS_UNAUTHENTICATED`
- `LENS_FORBIDDEN`
- `LENS_VALIDATION_ERROR`
- `LENS_NOT_FOUND`
- `LENS_RATE_LIMITED`
- `LENS_INTERNAL_ERROR`

实现约束：

- 保留 `details` 用于排查，但不把原始错误直接透传到 UI。
- 对可重试错误设置 `retryable = true`，供前端做重试策略。

## 示例

### 成功示例（posts list）

类型：`LensResult<LensPage<PostView>>`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "01",
        "authorAddress": "0xabc",
        "content": "GM"
      }
    ],
    "pageInfo": {
      "next": "cursor_2",
      "prev": null
    }
  },
  "error": null,
  "meta": {
    "cursor": null,
    "nextCursor": "cursor_2",
    "hasMore": true,
    "source": "lens",
    "timestamp": "2026-04-01T08:00:00.000Z"
  }
}
```

### 失败示例（authentication required）

类型：`LensResult<null>`（适用于需要鉴权但前置条件不满足的场景）

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "LENS_UNAUTHENTICATED",
    "message": "Authentication required",
    "retryable": false
  },
  "meta": {
    "source": "lens",
    "timestamp": "2026-04-01T08:00:00.000Z"
  }
}
```
