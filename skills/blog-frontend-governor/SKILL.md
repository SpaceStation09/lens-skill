---
name: blog-frontend-governor
description: 规定一个 Next.js 项目如何演化为基于 Lens 的博客前端。适用于用户需要 BlogFrontendApp、core/adapter/theme 边界、路由与权限 contract、theme 接入方式，或推荐目录结构的场景。
---

# Blog Frontend Governor

使用本 skill 将一个 Next.js 应用收敛到预期的 Lens Blog 前端架构。

本 skill 定义：

1. `BlogFrontendApp` 是什么
2. `core`、`adapter`、`theme` 各自包含什么
3. 哪些路由、状态和权限行为是强制的
4. theme 应如何接入
5. 生成项目或改造项目时推荐使用的目录结构

本 skill 不定义 Lens SDK 细节。涉及 Lens 协议集成时，也应同时使用 `lens-blog`。

## 默认宿主假设

除非用户明确要求，否则默认假设：

1. `Next.js App Router`
2. `React`
3. `TypeScript`

不要默认把本 skill 泛化成任意前端宿主。先为稳定的 Next.js 路径优化。

## 必读内容

按顺序阅读以下 references：

1. [references/contract.md](references/contract.md)
2. [references/data-contract.md](references/data-contract.md)
3. [references/blog-frontend-app.md](references/blog-frontend-app.md)
4. [references/core-reference.md](references/core-reference.md)
5. [references/theme-render-context.md](references/theme-render-context.md)
6. [references/adapter-contract.md](references/adapter-contract.md)
7. [references/ui-stack.md](references/ui-stack.md)，仅在需要选择 UI 栈时阅读

## 推荐目录结构

除非仓库里已经有明显更合适的等价结构，否则优先使用：

```txt
src/
  blog/
    core/
      contracts/
      router/
      runtime/
    adapters/
      lens/
    themes/
      default/
      neo/
    config/
  components/
  lib/
app/
```

规则：

1. `src/blog/core/` 存放 frontend runtime 概念，不能放 Lens SDK 代码。
2. `src/blog/adapters/lens/` 存放面向 Lens 的实现，不能放 theme 代码。
3. `src/blog/themes/` 存放纯渲染实现。
4. `app/` 仍然是宿主应用入口和路由层。
5. 可以使用仓库原生的等价目录，但边界必须同样清晰。

## 从零落地顺序

当 agent 使用本 skill 从零实现一个博客前端时，按这个顺序落地：

1. 先确认宿主是 `Next.js App Router + React + TypeScript`。
2. 创建 `src/blog/core/`、`src/blog/adapters/`、`src/blog/themes/`、`src/blog/config/` 基础目录。
3. 先实现 `RouteState`、`AccountState`、`ThemeRenderContext` 等核心 contracts。
4. 再实现 `BlogFrontendApp` 和 `core/runtime`。
5. 再把 adapter 接到 runtime 上，而不是反过来让页面直接碰数据层。
6. 最后复制并接入一个 theme asset。

不要先写页面，再事后拼 `BlogFrontendApp`。`BlogFrontendApp` 必须从一开始就是 runtime 入口。

## Theme 源码分发规则

`default` 和 `neo` 是本 skill 提供的源码资产，放在 `assets/` 下。

规则：

1. theme 以源码资产形式分发，而不是以 package 形式分发。
2. 用户指定 theme 时，只分发被指定的 theme。
3. 用户未指定 theme 时，默认分发 `default`。
4. 只有用户明确要求保留多个主题参考时，才同时分发 `default` 和 `neo`。
5. 分发后的 theme 代码允许在用户项目中直接修改。
6. theme 资产必须只依赖稳定的 `ThemeRenderContext` contract，不能反向依赖 Lens SDK 细节。

## Theme Asset 落地规则

默认将 theme asset 复制到用户项目内，而不是继续引用 skill 目录中的源码。

推荐落点：

```txt
src/
  blog/
    themes/
      default/
        index.tsx
        styles.css
      neo/
        index.tsx
        styles.css
```

规则：

1. 被复制后的 theme 文件必须成为目标项目本地源码。
2. theme 不应继续 import skill 目录中的文件。
3. `styles.css` 必须一并复制，而不是只复制 `index.tsx`。
4. 若用户只选一个 theme，只复制该 theme 对应目录。

## BlogFrontendApp 定义

`BlogFrontendApp` 是博客产品壳的 frontend runtime 入口。

它负责：

1. 路由编排
2. 暴露给前端的账户状态流转
3. 通过 adapter 触发数据加载和刷新
4. 草稿 / 编辑器工作流
5. owner / viewer 等权限判定
6. 组装 `ThemeRenderContext`

它不负责：

1. 直接调用 Lens SDK
2. Provider 初始化
3. 环境变量解析
4. theme 专属视觉设计

应把 `BlogFrontendApp` 视为一种带 reference pattern 的架构 contract，而不是一个必须安装导入的 package。

## Core / Adapter / Theme 边界

### Core

`core` 是 frontend runtime 层。

它应包含：

1. 路由状态定义
2. 账户状态定义
3. view model contract
4. runtime 编排
5. 面向 theme 的 context 组装

它不能包含：

1. Lens SDK 导入
2. theme 专属样式
3. 框架 provider 初始化

### Adapter

`adapter` 是 frontend runtime 唯一的数据入口。

它应包含：

1. runtime 所需的拉取和发布方法
2. Lens 数据到 view model 的映射
3. 错误归一化
4. 发布 / 登录流程所需的 session 处理

它不能包含：

1. theme 代码
2. 页面布局代码
3. 宿主路由代码

### Theme

`theme` 是消费 `ThemeRenderContext` 的纯渲染层。

它可以：

1. 渲染 route 对应的 UI
2. 触发 context 中暴露出的 runtime actions
3. 决定视觉语言、间距和排版

它不能：

1. 直接调用 Lens SDK
2. 重新实现账户或权限逻辑
3. 自己持有数据拉取副作用

## 构建工作流

从零搭建 Lens blog frontend 时，按以下顺序使用 skills：

1. `demo-project-starter`
2. `lens-blog`
3. `blog-frontend-governor`

改造已有项目时：

1. 先检查当前宿主栈和路由结构
2. 把现有逻辑映射到要求的 contracts 上
3. 在不过度重写的前提下，引入 `BlogFrontendApp`、adapter 边界和 theme 边界

## 生成项目时的最小执行步骤

如果目标是“真正起一个博客项目”，agent 至少应完成：

1. 在宿主层建立 `app/` 入口和 providers。
2. 在 `src/blog/core/` 中实现 contracts、router、runtime。
3. 在 `src/blog/adapters/lens/` 中实现 Lens adapter。
4. 把 `assets/` 中选定的 theme 复制进 `src/blog/themes/`。
5. 在宿主入口中按配置选择 theme，并把它传给 `BlogFrontendApp`。
6. 接好 `/:handle`、`/p/:postId`、`/write` 这三个关键入口。

## Theme 接入规则

1. Theme 选择应在应用启动前由配置驱动完成。
2. 除非用户明确要求，否则不要实现运行时 theme 切换 UI。
3. 如果现有设计系统足够一致则优先复用，否则选定一套栈并保持一致。
4. theme 工作不能反向逼迫 `core` 或 adapter contract 改动。
5. 默认优先复用 `assets/theme-default` 与 `assets/theme-neo`，不要再把 theme 设计成独立可安装 package。

## 输出要求

应用本 skill 时，agent 最终应报告：

1. `BlogFrontendApp` 是如何实现或重构的
2. 项目里 `core`、adapter 和 theme 边界落在了哪里
3. 哪些 contract 条目已满足
4. 剩余缺口或刻意偏离项

## 最小验收清单

1. `/:handle` 可公开访问并展示 profile + post feed。
2. `/p/:postId` 可公开访问并展示正文。
3. `/write` 仅 owner view 可进入，其他情况会被拦回可读页面。
4. 未连接钱包、已连接未登录、已登录三种入口状态都正确。
5. theme 来自项目本地源码，而不是继续依赖 skill 目录或 theme package。
6. 页面组件和 theme 组件都不直接调用 Lens SDK。

## 非目标

1. 默认创建新主题
2. 多前端框架抽象
3. 绕过 `BlogFrontendApp` 的 runtime 架构
