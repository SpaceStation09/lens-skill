---
name: lens-blog
description: 指导 agent 将 Lens Protocol 的数据流接入博客应用。适用于用户需要 Lens 账号登录、文章发布/拉取、Lens 运行时配置，或为博客前端实现 Lens adapter 的场景。
---

# Lens Blog

本 skill 用于处理 Lens 相关的集成工作。它不定义博客前端 runtime 或 theme 架构；它只定义应用应如何读写 Lens 数据，以及账户 / session 流程应如何运作。

## 适用范围

本 skill 负责：

1. Lens 运行时配置和 SDK 版本约束
2. 钱包到账户的 Lens account 发现与登录
3. 向 Lens 发布文章
4. 从 Lens 拉取 profile 和 posts
5. 定义博客 adapter 在 Lens 一侧应承担的职责

本 skill 不负责：

1. `BlogFrontendApp` 的 runtime 设计
2. `ThemeRenderContext`
3. Theme 开发或页面布局设计
4. Lens 集成点之外的 Next.js 宿主结构

如果任务涉及前端 runtime、路由/视角规则或 theme 边界，也应同时使用 `blog-frontend-governor`。

## 必读内容

开始实现前先阅读：

1. [reference.md](reference.md)，用于查看 Lens SDK 用法和兼容性约束
2. [references/lens-adapter-reference.md](references/lens-adapter-reference.md)，用于查看 Lens adapter 的推荐组织方式

## 核心规则

1. 默认 Lens 网络为 `testnet`。
2. 除非用户明确覆盖，否则默认 `app address` 使用当前网络对应的 Lens global app address。
3. 当前阶段 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 是必填项。
4. Lens SDK 细节必须与 render 层隔离。
5. 前端 runtime 必须通过本地 adapter 模块消费 Lens 数据，不能在 page / theme 组件里直接调用 Lens SDK。

## Runtime Config Contract

实现一个集中配置模块，例如 `src/config/lens.ts`。

它必须定义：

```ts
type LensNetwork = "testnet" | "mainnet";

type LensRuntimeConfig = {
  network: LensNetwork;
  appAddress: `0x${string}`;
  walletConnectProjectId: string;
};
```

它必须提供：

1. `resolveLensNetwork()`
2. `resolveLensAppAddress(network)`
3. `getLensRuntimeConfig()`

规则：

1. 缺失 `NEXT_PUBLIC_LENS_NETWORK` 时必须回退到 `testnet`。
2. 缺失 `NEXT_PUBLIC_LENS_APP_ADDRESS` 时必须回退到网络对应的 Lens global app address。
3. 缺失 `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 时必须视为 setup 阻塞项，不能静默忽略。
4. 不要把 Lens env 解析分散到多个文件里。

## 推荐文件布局

在采用推荐目录结构时，Lens 相关代码应优先落在这些位置：

```txt
src/
  blog/
    config/
      lens.ts
    adapters/
      lens/
        sdk.ts
        mapper.ts
        session.ts
        index.ts
```

规则：

1. `sdk.ts` 直接与 Lens SDK 交互。
2. `mapper.ts` 负责 `Lens -> ViewModel` 的转换和 excerpt / fallback 处理。
3. `session.ts` 负责登录后 session 保存、校验和清理。
4. `index.ts` 负责向 frontend runtime 暴露统一 adapter 接口。
5. 如果仓库已有等价结构，可以复用，但职责必须保持一致。

## Account 与 Session 流程

支持的流程是：

1. 连接钱包
2. 发现该钱包拥有的 Lens accounts
3. 选择一个 account
4. 以该 account owner 身份登录
5. 用已认证的 session 执行发布

规则：

1. 钱包连接和 Lens account 登录是两个独立步骤。
2. 发布前必须先完成 Lens account 选择。
3. Adapter 必须保留足够的 session 状态，以支持登录后发布。
4. 钱包断开或显式登出后，session 状态必须被清理。

## Adapter 职责

本 skill 假设生成后的项目会包含一个本地 Lens adapter 实现。Adapter 不能只是字段映射器。

它必须：

1. 为钱包发现可用 accounts
2. 执行 Lens account 登录
3. 拉取 profile 和 post 数据
4. 发布 posts
5. 将 Lens SDK 响应归一化为前端使用的 view models
6. 屏蔽 SDK 特有的 result wrapper 和不稳定响应结构，不让它们泄漏到 frontend runtime
7. 为可选字段提供兜底行为

它不能：

1. 渲染 UI
2. 在 page / theme 组件里直接读取环境变量
3. 向 frontend runtime 暴露原始 Lens SDK 结果对象
4. 让 theme 代码理解 Lens SDK 类型

## 发布流程

使用如下顺序：

1. 用 `article(...)` 构建文章 metadata
2. 通过 `StorageClient` 上传 metadata
3. 用 `post(sessionClient, { contentUri })` 发布

规则：

1. 发布必须依赖已认证的 Lens session。
2. tags 应通过 metadata 传递，并在可能时保留下来。
3. 发布失败时，adapter 应抛出普通应用层错误，而不是原始 SDK 包装结果。

## 落地顺序

当 agent 用本 skill 真正为项目补齐 Lens 能力时，按这个顺序实现：

1. 先创建 `src/blog/config/lens.ts` 并完成运行时配置解析。
2. 再创建 `src/blog/adapters/lens/sdk.ts`，封装 `PublicClient`、storage client 和核心 actions。
3. 再实现 `mapper.ts`，把 Lens 数据映射成 frontend 可消费的 view models。
4. 再实现 `session.ts`，保证登录后 publish 能工作，并支持 reset / clear。
5. 最后在 `index.ts` 中组装统一 adapter 接口，交给 frontend runtime 使用。

不要先在页面或 theme 中直接写 Lens SDK 调用，再回头补 adapter。

## 拉取流程

需要支持以下 Lens 数据读取：

1. 钱包拥有的 accounts
2. 按 handle 读取 profile
3. 按 address 读取 profile
4. 按作者读取 posts
5. 按 id 读取 post

规则：

1. adapter 输出的 handle 必须去掉 `@` 前缀并归一化。
2. 对可选 avatar / stats 字段要转换成前端可安全消费的形态。
3. post excerpt 应在 adapter 或 mapper 层生成，而不是在 theme 中生成。

## 环境变量

推荐保留的变量：

```env
NEXT_PUBLIC_LENS_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_LENS_APP_ADDRESS=0x...
```

规则：

1. 保持 env 面尽量小。
2. 只通过 `NEXT_PUBLIC_*` 暴露浏览器端确实需要的变量。
3. 没有明确运行时需求时，不要增加额外 Lens env 变量。

## 已知兼容性规则

1. 优先使用与 `PublicClient` 和 `@lens-protocol/client/actions` 兼容的 `@lens-protocol/client` canary 代际。
2. `evmAddress` 和 `uri` 来自 `@lens-protocol/types`。
3. 除非任务明确要求自定义 storage 行为，否则 `StorageClient.create()` 可直接使用默认环境。
4. 不要使用已知在不同版本间容易失效的不稳定导入路径。

## 交付要求

应用本 skill 后，项目里至少应留下：

1. 一个集中式 Lens config 模块
2. 一个本地 Lens 集成模块，或一小组职责清晰的集成模块
3. 一个可被 frontend runtime 消费的 adapter 边界
4. 可在本地验证的 Lens 登录、拉取、发布路径

## 最小验收清单

1. 钱包连接后，应用能发现该钱包下的 Lens accounts。
2. 用户能选择一个 Lens account 完成登录。
3. profile 拉取可用，且 handle / avatar / stats 已归一化。
4. post 列表拉取可用，且 excerpt 不在 theme 中生成。
5. publish 流程可跑通，且未登录时不能发布。
6. 切换账号或钱包断开后，adapter 内 session 会被清理。

## 非目标

1. Theme 创建
2. 视觉重设计
3. 通用 CMS 工作流
4. 多协议博客抽象
