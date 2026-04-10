---
name: lens-blog-builder
description: 作为 Lens 博客体系的入口 skill，负责确认会影响实现路径的关键决策，输出结构化需求摘要，并将工作编排给 lens-interaction 与 blog-frontend。
---

# Lens Blog Builder

## Purpose

本 skill 是整个 Lens 博客体系的入口与编排层。

它负责把“我要一个基于 Lens 的个人博客”转成明确的实现路径，而不是直接承担所有底层实现细节。

## Skill Graph

本 skill 与以下子 skill 配合：

1. [../lens-interaction/SKILL.md](../lens-interaction/SKILL.md)
   - 负责 Lens 交互层、运行时配置、认证、account/post 读写与 data contract。
2. [../blog-frontend/SKILL.md](../blog-frontend/SKILL.md)
   - 负责前端宿主层、starter shell、钱包前端接入、页面与 theme。
3. `lens-blog-builder`
   - 负责关键决策确认、需求摘要、实现路径判断、任务拆解与子 skill 调度。

## Builder Responsibilities

本 skill 负责：

1. 确认会影响实现路径的关键决策。
2. 判断当前需求走默认 baseline，还是高自由定制路径。
3. 判断当前工作重点属于 Lens 交互层、前端层，还是两者联动。
4. 形成结构化需求摘要。
5. 给出实施顺序。
6. 把明确任务交给合适的子 skill 推进。

## Execution Boundaries

本 skill 不负责：

1. 重写 `lens-interaction` 的实现细节。
2. 重写 `blog-frontend` 的具体前端规则。
3. 在边界清晰时继续把实现留在 builder 自己手里。
4. 把高自由需求误当成默认 baseline 需求。
5. 重复追问不会改变实现路径的问题。

## Implementation Path Questions

在开始开发之前，需要优先确认以下会影响实现路径的决策，完成下面的需求访谈：

1. Lens 环境
   - 使用 `testnet` 还是 `mainnet`
2. Lens app
   - 是否使用自己的 Lens app
   - 若不使用，默认采用官方 test app 地址
3. 钱包方案
   - 是否接受默认钱包方案 `Privy`
   - 若不接受，指定其他钱包方案
4. 前端路径
   - 是否接受默认 frontend baseline
5. 设计输入
   - 是否有 Figma、参考站点或明确视觉参考
6. 交付范围
   - 这次是只做结构与接线，还是连视觉一起做
   - 落到新项目还是已有项目

若其中某些答案可以低风险补全，应直接补全推进，不必机械追问。

## Decision Rules

1. 用户未明确要求特殊框架时，默认走 `blog-frontend` 官方 baseline。
2. 用户要求其他框架或明显偏离 baseline 时，标记为高自由定制路径。
3. 主要问题集中在 Lens 环境、app、auth、contract、account/post 读写时，优先调用 `lens-interaction`。
4. 主要问题集中在页面、starter shell、theme、钱包前端接入时，优先调用 `blog-frontend`。
5. 若需求同时涉及两层，先确定 Lens 配置与交互前提，再推进前端落地。
6. 若已有 Figma 或明确视觉参考，可将 theme 定制纳入当前范围；否则默认先完成结构与接线。

## Structured Output

本 skill 默认输出以下结构化摘要：

1. `Project Summary`
   - 用户当前要做的 Lens 博客范围
2. `Implementation Path`
   - 默认 baseline 或高自由定制
3. `Key Decisions`
   - Lens 环境
   - Lens app 方案
   - 钱包方案
   - 是否采用默认 frontend baseline
   - 是否有设计稿
   - 新项目还是已有项目
4. `Current Scope`
   - 当前阶段只做什么
5. `Open Risks or Missing Inputs`
   - 尚未确认、但会影响后续推进的内容
6. `Next Skill To Invoke`
   - `lens-interaction` 或 `blog-frontend`
7. `Next Step`
   - 下一步执行动作

如需参考输出形状，请阅读 [references/builder-output-example.md](references/builder-output-example.md)。

## Deliverables

应用本 skill 后，至少应交付：

1. 一份整理后的需求摘要。
2. 对实现路径的明确判断。
3. 对默认 baseline / 高自由定制的判断。
4. 子 skill 调用建议。
5. 当前阶段的实施计划。
6. 下一步执行建议。

## Read The Local References

按当前任务需要读取以下 references：

1. [references/interview-checklist.md](references/interview-checklist.md)
2. [references/pipeline-checkpoints.md](references/pipeline-checkpoints.md)
3. [references/builder-output-example.md](references/builder-output-example.md)
