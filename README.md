# lens-skills

用于维护 Lens blog 相关的 Codex skills，包括：

1. Lens 交互层规范
2. 博客前端 baseline
3. 顶层建站编排入口

## Current Skills

1. `skills/lens-interaction`
   - 定义 Lens 交互层规范
   - 覆盖运行时配置、认证、account/post 读写与 data contract
2. `skills/blog-frontend`
   - 定义 Lens 博客前端 baseline
   - 覆盖 `starter-shell`、`default theme`、钱包前端接入与主题开发规则
3. `skills/lens-blog-builder`
   - 作为入口 skill
   - 负责实现路径判断、结构化需求摘要与子 skill 编排

## Current Structure

当前体系按三层拆分：

1. `lens-blog-builder`
   - 入口与编排层
2. `lens-interaction`
   - Lens 交互层
3. `blog-frontend`
   - 前端宿主层与主题层

## Design Principles

1. `lens-interaction` 只负责 Lens 交互、配置与稳定数据契约。
2. `blog-frontend` 只负责前端宿主层、starter shell、theme 与钱包前端接入。
3. `lens-blog-builder` 只负责确认关键决策、判断实现路径和调度子 skill。
4. 默认优先走官方 baseline，而不是每次从零设计整套系统。
5. theme 可以定制，但必须与 `starter-shell` 保持解耦。

## Blog Frontend Assets

`skills/blog-frontend` 当前分发两套官方资产：

1. `skills/blog-frontend/assets/starter-shell/`
   - 官方结构层 baseline
   - 基于 Next.js App Router
2. `skills/blog-frontend/assets/themes/default/`
   - 官方默认主题层
   - 当前设计语言是 editorial minimal / monochrome monolith

## References

关键参考文档主要位于各 skill 的 `references/` 下：

1. `skills/lens-interaction/references/`
   - `configuration.md`
   - `authentication.md`
   - `accounts.md`
   - `posts.md`
   - `data-contract.md`
2. `skills/blog-frontend/references/`
   - `baseline-architecture.md`
   - `starter-shell-structure.md`
   - `page-information-model.md`
   - `privy-integration.md`
   - `theme-layer-model.md`
   - `theme-development-guide.md`
3. `skills/lens-blog-builder/references/`
   - `interview-checklist.md`
   - `pipeline-checkpoints.md`
   - `builder-output-example.md`

## Notes

1. Lens SDK 示例当前默认基于 `@lens-protocol/client@canary`，以 `skills/lens-interaction/references/configuration.md` 为准。
2. 默认钱包方案是 `Privy`，前端最小接线说明见 `skills/blog-frontend/references/privy-integration.md`。
3. 若后续继续扩展真实实现或更多主题，优先沿现有三层结构演进，而不是在 README 中重新定义规则。
