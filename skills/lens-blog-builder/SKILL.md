---
name: lens-blog-builder
description: 以项目结果为目标，指导 agent 从 0 到 1 搭建基于 Lens 的个人博客。先做需求访谈，再按严格流水线编排 blog-frontend 与 lens-interaction，完成联调后交付。
---

# Lens Blog Builder

本 skill 是顶层编排层。它不替代 `blog-frontend` 或 `lens-interaction`，而是负责把两者按阶段组织成可交付的建站流程。

## 适用场景

当用户要“从零搭 Lens 个人博客”或要“完整落地 Lens blog 项目”时使用本 skill。

## 非适用场景

1. 用户只改某一个页面样式
2. 用户只修复 Lens 登录或 session 问题
3. 用户只调整主题组件而不涉及完整建站

以上场景优先使用对应子 skill。

## 产物边界

1. 顶层编排与阶段门禁
2. 需求访谈问题集
3. 项目级实施与联调收敛

本 skill 不提供可直接复制的完整业务源码模板。

## 必须调度的子 skill

1. `blog-frontend`：负责 Next.js 宿主层、路由、provider、theme 接入
2. `lens-interaction`：负责 Lens SDK 交互层、认证、session、service contract

## 必读 references（按阶段加载）

1. 访谈阶段：`references/interview-checklist.md`
2. 实施阶段：`references/pipeline-checkpoints.md`

不要在开始时一次性加载全部 references。

## 子 skill 调度时机（按阶段）

### Phase 0：需求访谈

触发条件：用户提出从 0 到 1 建站目标，但约束尚未确认。

规则：

1. 此阶段不调度实现型子 skill。
2. 只收集约束并输出“本次实现约束摘要”。

### Phase 1：宿主层骨架

触发条件：约束摘要已确认，开始进入代码实施。

规则：

1. 调度 `blog-frontend`，优先复制 starter 内核并落路由壳。
2. 只读取 `blog-frontend` 中与骨架阶段相关的 references。

### Phase 2：Lens 交互层

触发条件：宿主层骨架已建立，开始接真实数据与认证流程。

规则：

1. 调度 `lens-interaction`，实现 runtime、session、`LensService`、mapper 与错误模型。
2. 不在本阶段做 theme 美化。

### Phase 3：联调与主题

触发条件：`LensService` contract 闭环后，开始走完整用户路径。

规则：

1. 继续使用 `blog-frontend` 完成页面接线。
2. 仅在此阶段进入 theme 改造与 UI 美化。
3. 默认不改功能层结构，除非用户明确要求。

## 执行流程（Inversion + Pipeline）

### Phase 0: 需求访谈（必须先完成）

1. 读取 `references/interview-checklist.md`
2. 逐项确认关键约束
3. 生成“本次实现约束摘要”并等待用户确认

硬门禁：未完成约束确认，不进入 Phase 1。

### Phase 1: 项目骨架与宿主层

1. 调度 `blog-frontend`
2. 先复制 `blog-frontend` 的 starter 功能内核（`assets/starter/lib/blog/*`）
3. 再落 provider 与路由壳，保持 `app` 简洁、状态机与服务逻辑放 `lib`

硬门禁：路由和账户状态机未落地，不进入 Phase 2。

### Phase 2: Lens 交互层

1. 调度 `lens-interaction`
2. 建立 runtime、session、LensService、mapper、错误模型
3. 只向宿主层暴露稳定 contract

硬门禁：`LensService` contract 未闭环，不进入 Phase 3。

### Phase 3: 页面接线与主题接入

1. 将页面接到 `LensService`
2. 接入 `theme-default` 资产渲染
3. 默认只在 theme 层做 UI 美化，功能层不做结构性改造
4. 完成登录、创建、读取、发布的主路径联调

硬门禁：核心用户路径未跑通，不进入交付。

## 强制规则

1. 优先复用子 skill 既有规范，不重复定义冲突规则
2. 不允许页面层直接调用 Lens SDK
3. 不允许跳过阶段门禁
4. 用户未明确要求时，保持最小可交付范围
5. 汇报必须包含：已完成项、未完成项、风险、下一步
6. 默认采用“一个稳定内核 + 一个可替换皮肤”，不分发多套功能模板

## 最小验收目标

1. 用户可连接钱包并完成 Lens 登录
2. 无 Lens 账号用户可在前端完成 username 校验与创建
3. `/:handle` 与 `/p/:postId` 可公开读取
4. `/write` 仅 owner 可发布
5. 刷新后 session 可恢复，失败时按规则回退
6. theme 不调用 Lens SDK，宿主层仅依赖 `LensService`
