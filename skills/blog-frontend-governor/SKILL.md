---
name: blog-frontend-governor
description: Governs blog frontend architecture, feature contract, and UI SDK selection. Use when the user wants to improve blog UI quality, define required frontend features, choose component/design stack, or apply a reusable frontend template for agents.
---

# Blog Frontend Governor

这个 skill 用于约束 blog 前端改造，避免“每次都从零生成导致风格漂移”。

## 适用场景

当用户提到以下意图时使用本 skill：

1. 觉得前端不好看，需要统一改造
2. 想定义 blog 前端必须具备的功能
3. 想选定 UI SDK / 组件体系并长期复用
4. 想给 agent 一个前端 template，减少重复生成

## 核心原则

1. 采用混合方案：`规范层（skill） + 实现层（template）`
2. 优先复用现有项目技术栈，不引入冲突的第二套基础设施
3. 先稳定信息架构和可用性，再做视觉增强
4. 每次改造都要对照验收清单，而不是只看“好不好看”
5. Blog 产品默认从用户主页出发：`/:handle` 是主 landing 入口

## 工作流（必须按顺序）

### A. 从 0 搭建时的技能编排（必须）

当用户目标是“从 0 搭建 Lens Blog（支持主题）”时，agent 必须按以下顺序组织执行：

1. `demo-project-starter`：创建可运行项目骨架
2. `lens-blog`：接入 Lens 业务能力（连接钱包、登录、发布、拉取）
3. `blog-frontend-governor`：实现前端 contract、状态机和“已有主题”接入层

### B. 主题接入策略（必须）

在前端实现阶段，agent 必须按“配置驱动”处理主题：

1. 若用户指定主题：使用用户指定主题
2. 若用户未指定主题：使用默认主题
3. 主题在启动前通过配置确定（例如 `NEXT_PUBLIC_BLOG_THEME`），不做运行时主题切换 UI
4. 本 skill 只接入已有主题包，不开发新主题（新主题开发由独立 `theme-develop` skill 负责）

### C. 前端实现流程（必须按顺序）

1. 读取 [references/contract.md](references/contract.md) 确认功能 contract
2. 读取 [references/data-contract.md](references/data-contract.md) 确认状态机和数据模型
3. 读取 [references/ui-stack.md](references/ui-stack.md) 选择 UI SDK 策略
4. 检查项目当前栈并决定：
   - 复用当前设计系统
   - 或迁移到默认推荐栈
5. 通过 package 落地（`@lens-blog/core` + `@lens-blog/adapter-lens` + `@lens-blog/theme-*`）
6. 按 contract 做自测，输出“已满足/未满足项”

## 输出要求

每次应用本 skill 时，agent 最终输出必须包含：

1. 本次采用的 UI 栈与原因
2. 已实现功能对应 contract 条目
3. 未实现条目与阻塞原因
4. 下一步最小改动建议（不超过 3 条）

## 约束

1. 不允许同时引入多个重型 UI 体系（例如同时大规模混用 Antd + MUI + shadcn）
2. 不允许跳过移动端可读性检查
3. 不允许为了视觉效果破坏正文信息密度与可读性
4. 不允许因为主题接入需求修改 `core/adapter` 业务契约
