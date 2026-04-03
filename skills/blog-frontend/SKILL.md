---
name: blog-frontend
description: 为 Lens 原生个人博客提供官方前端 baseline。默认基于 Next.js starter shell 与解耦的 default theme 落地博客宿主层、钱包接入、profile/post/compose 页面，并通过 lens-interaction 的 data contract 接线。
---

# Blog Frontend

## Purpose

本 skill 是 `lens-blog-builder` 体系下的前端实现子 skill。

它负责构建 Lens 原生个人博客 web app 的前端宿主层，并默认从官方 baseline 起步，而不是每次从零设计整套前端系统。

## Dependencies

使用本 skill 前，默认接受以下分层：

1. 产品访谈、需求编排、是否偏离官方 baseline 的判断，由 `lens-blog-builder` 负责。
2. Lens 账户、认证、内容读写、session 与 data contract，由 `lens-interaction` 负责。
3. 本 skill 只消费 `lens-interaction` 暴露的稳定能力，不重写底层 Lens 交互。

按当前任务需要读取以下 `lens-interaction` references：

1. [../lens-interaction/references/data-contract.md](../lens-interaction/references/data-contract.md)：实现页面数据接线时优先阅读。
2. [../lens-interaction/references/posts.md](../lens-interaction/references/posts.md)：实现 post detail、compose、publish 时阅读。
3. [../lens-interaction/references/configuration.md](../lens-interaction/references/configuration.md)：处理 Lens 运行配置时阅读。

## Core Responsibilities

本 skill 负责：

1. 基于官方前端栈搭建 Lens 博客前端。
2. 组织页面结构、路由、layout、providers 与 feature 边界。
3. 承接钱包连接，以及 Lens 账号创建与登录流程。
4. 落地 profile、post detail、compose/publish 等核心页面。
5. 复用官方 starter shell 与 default theme 资产完成交付。
6. 在遵循 `data-contract.md` 的前提下完成页面数据接线。

## Execution Boundaries

执行时遵守以下边界：

1. 不重新做 `lens-blog-builder` 的需求访谈与产品编排。
2. 不重写 `lens-interaction` 的 Lens 交互逻辑。
3. 默认不从零设计整套前端系统，优先从官方 baseline 起步。
4. 若需求明显突破 baseline 边界，先说明代价与影响，再决定是否扩展。
5. 结构层与主题层不要混写。

## Minimum Feature Set

以下能力是 Lens 博客前端的基础交付要求，不作为可选项处理：

1. Lens 账号创建与登录。
2. Profile 展示：展示目标 Lens 账号的基础信息与 post feed。
3. Post 详情展示：展示单篇 post 的完整内容与基础元信息。
4. 写作与发布：允许用户以 `article` 形式编辑并发送自己的 post。

## Baseline Architecture

本 skill 只维护一套官方前端技术栈和一套官方 baseline。

默认规则：

1. 官方技术栈默认是 `Next.js`。
2. 官方 baseline 由结构层 starter shell 与主题层 default theme 组成。
3. 结构层负责路由、layout、providers、状态承接、数据接入位点与页面骨架。
4. 主题层负责视觉风格、渲染布局、组件皮肤、排版与页面表现。
5. 定制优先通过主题层的组合、替换和覆写完成。
6. 若用户明确要求其他框架，应将官方 baseline 视为参考实现；这类偏离由 `lens-blog-builder` 识别并编排。

默认钱包策略：

1. 官方 baseline 默认采用 `Privy` 作为钱包接入方案。
2. 默认优先提供邮箱登录驱动的钱包接入体验，以降低普通用户理解钱包概念的门槛。
3. 若项目要求其他钱包方案，视为偏离官方 baseline 的定制项。

## Asset Model

官方资产分为两部分：

1. `assets/starter-shell/`
   - 官方结构层载体。
   - 提供可运行的最小博客宿主层。
   - 包含页面路由、feature 边界、providers、与 `lens-interaction` 对接的入口位点。
2. `assets/themes/default/`
   - 官方默认主题层载体。
   - 提供默认页面模板、表现组件与样式 tokens。
   - 不承担应用级基础设施职责。
   - 若需要自行开发或替换 theme，请参考 [references/theme-development-guide.md](references/theme-development-guide.md)。

## Starter Shell Usage

使用 `starter-shell` 时遵守以下规则：

1. 默认从 `assets/starter-shell/` 起步，而不是从空项目重新设计结构层。
2. 优先复用它的页面结构、feature 边界、providers 与 `lens-interaction` 接线入口。
3. 若需求主要是视觉定制，优先替换或开发 theme，而不是先改写 shell。
4. 若目标是已有前端项目，可将 `starter-shell` 作为结构参考迁移，而不是要求逐文件照搬。
5. 只有当需求明显突破官方 baseline 时，才扩大对 shell 的改动范围。

## Inputs

本 skill 接收的输入应聚焦前端落地本身：

1. 来自 `lens-blog-builder` 的前端需求摘要。
2. 视觉风格偏好与页面气质。
3. 信息架构偏好。
4. 对官方 baseline 的偏离要求。
5. 对 default theme 的定制要求。
6. 对页面模块、写作体验与展示重点的额外要求。

不要在这里重新做需求访谈。

## Execution Flow

推荐执行顺序：

1. 先按当前任务需要读取 `lens-interaction` 的 `data-contract.md`、`posts.md`、`configuration.md`。
2. 从 `assets/starter-shell/` 起步搭建结构层。
3. 保持结构层稳定，再装配或改造 `assets/themes/default/`。
4. 按 `data-contract.md` 对接 profile、post、compose 的数据面。
5. 默认将博客发帖路径收敛到 `article`。
6. 先完成最小功能清单，再处理额外风格化与模块扩展。

## Deliverables

应用本 skill 后，至少应交付：

1. 一个可运行的 Lens 博客前端。
2. 清晰的页面与路由结构。
3. 钱包接入与 Lens 账号创建/登录路径。
4. profile、post detail、compose/publish 核心界面。
5. 与 `lens-interaction` 契约对齐的数据接入位点。
6. 最小必要说明文档。
7. 对应前端宿主层的环境变量模板。

## Read The Local References

按需读取以下参考，而不是一次性全部加载：

1. [references/baseline-architecture.md](references/baseline-architecture.md)
2. [references/page-information-model.md](references/page-information-model.md)
3. [references/starter-shell-structure.md](references/starter-shell-structure.md)
4. [references/privy-integration.md](references/privy-integration.md)
5. [references/theme-layer-model.md](references/theme-layer-model.md)
6. [references/theme-development-guide.md](references/theme-development-guide.md)
