# Posts

## 范围与目标

本文件定义 Lens Post 相关能力，覆盖：

1. Post 概念
2. Create Post
3. Fetch Posts


## Post 概念

- Lens Post 的内容通过 `metadata` 表达（文本、图片、视频等）。
- 实际发布时提交的是 `contentUri`（metadata 的公开地址）。
- 创建 Post 需要认证为 `Account Owner` 或 `Account Manager`。

## Create Post

最小流程：

1. 构建 Post metadata（常见从 text-only 开始）。
2. 上传 metadata，得到 `contentUri`。
3. 调用 `post(sessionClient, { contentUri })` 创建帖子。
4. 处理链上操作结果并等待可读状态。

常见 metadata 写法（TypeScript）：

```ts
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: `GM! GM!`,
});
```

```ts
import {
  image,
  MediaImageMimeType,
  MetadataLicenseType,
} from "@lens-protocol/metadata";

const metadata = image({
  title: "Touch grass",
  image: {
    item: "https://example.com/image.png",
    type: MediaImageMimeType.PNG,
    altTag: "Me touching grass",
    license: MetadataLicenseType.CCO,
  },
});
```

```ts
import { article } from "@lens-protocol/metadata";

const metadata = article({
  title: "Great Question",
  content: `
   ## Heading
   Lorem ipsum dolor sit amet.
   ## Question
   What is the answer to life, the universe and everything?
   ## Answer
   42
   ![The answer](https://example.com/answer.png)
  `,
  tags: ["question", "42"],
});
```

上传 metadata（TypeScript）：

```ts
import { textOnly } from "@lens-protocol/metadata";
import { storageClient } from "./storage-client";

const metadata = textOnly({
  content: `GM! GM!`,
});

const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);
```

说明：

- `storageClient` 可使用 Grove 等可公开访问的存储。
- 产出的 `metadataUri` 作为 `post(..., { contentUri: uri(metadataUri) })` 的输入。

参考代码（TypeScript）：

```ts
import { uri } from "@lens-protocol/client";
import { post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

const result = await post(sessionClient, {
  contentUri: uri(metadataUri),
}).andThen(handleOperationWith(walletClient));

if (result.isErr()) throw result.error;
```

实现约束：

- 无有效 `SessionClient` 时禁止发帖。
- `contentUri` 不可用时直接失败，不做隐式兜底。

## Fetch Posts

### Query Single Post

用于详情页或发帖后回查：

- 按 `post id` 查询
- 按 `tx hash` 查询（发帖后常用）

React 参考代码：

```ts
import { usePost, postId } from "@lens-protocol/react";

const { data, loading, error } = usePost({
  post: postId("01234..."),
});
```

### Query Post List

用于列表页、作者主页、搜索页：

- 支持按作者、关键词、metadata、feed、apps 等过滤。
- 返回分页结构：`{ items, pageInfo }`。

TypeScript 参考代码：

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";

const result = await fetchPosts(client, {
  filter: {
    authors: evmAddress("0x1234..."),
  },
  pageSize: PageSize.FIFTY,
});

if (result.isErr()) throw result.error;

const { items, pageInfo } = result.value;
```

实现建议：

- 对列表查询统一分页参数与返回结构，供前端稳定消费。
- 发帖成功后的回查优先按 `tx hash`，便于和交易生命周期对齐。

## 前置条件清单（帖子域）

- create post：当前 session 已认证且角色为 `Account Owner` 或 `Account Manager`。
- fetch post(s)：可匿名读取；若依赖登录态字段，需显式声明并做会话校验。
- 写操作前：account 上下文已与目标发帖账号一致。
