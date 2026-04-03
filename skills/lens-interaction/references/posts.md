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

SDK 版本前提请遵循 [configuration.md](./configuration.md) 中定义的约定。

博客场景建议：

- 对个人博客场景，默认推荐使用 `article` 作为 Post metadata 格式。
- `textOnly` 更适合短帖或状态更新，不作为博客正文的默认格式。
- `image` 等其他格式可用于特定内容类型，但不作为博客文章的主路径。

常见 metadata 写法（TypeScript）：

说明：

- 以下代码仅用于说明 metadata 结构。
- 实际可用字段、辅助方法与包导出请以当前版本类型定义为准。

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

对于博客正文，建议优先围绕下面这组最小 article 字段组织内容：

```ts
type BlogArticleInput = {
  title: string;
  content: string; // markdown
  tags?: string[];
};
```

字段说明：

- `title`：文章标题。
- `content`：文章正文，使用 markdown 表达。
- `tags`：文章标签，用于前端列表与详情页展示。

与前端契约的关系：

- `article` metadata 最终应由 `lens-interaction` 映射为 `data-contract.md` 中的 `PostView`。
- 对博客前端，当前最关键的文章字段是 `title`、`content`、`tags`、`createdAt`。

上传 metadata（TypeScript）：

说明：

- 以下代码仅用于说明上传流程形状，不保证逐字可运行。

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

说明：

- 以下代码仅用于说明 `contentUri -> post()` 的调用路径。
- 实际 `handleOperationWith` 参数要求、`WalletClient` 形状与返回类型请先对照 canary 版本类型定义验证。

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

说明：

- 以下代码仅用于说明单篇查询入口。
- 实际 hook 导出与参数类型请以当前依赖版本为准。

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

说明：

- 以下代码仅用于说明列表查询形状。
- `PageSize`、过滤字段与返回类型请以当前 canary 版本的实际定义为准。

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";

const result = await fetchPosts(client, {
  filter: {
    authors: evmAddress("0x1234..."),
  },
  pageSize: PageSize.Fifty,
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
