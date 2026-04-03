# Builder Output Example

下面给出两个典型的编排输出示例，用来说明 `lens-blog-builder` 的结构化摘要应该长什么样。

## Example 1: 默认 baseline 路径

### Project Summary

用户要搭建一个基于 Lens 的个人博客，当前优先完成可运行 MVP。

### Implementation Path

默认 baseline

### Key Decisions

- Lens 环境：`testnet`
- Lens app：不使用自有 app，默认采用官方 test app 地址
- 钱包方案：接受默认 `Privy`
- Frontend：接受默认 baseline
- 设计输入：暂无
- 项目载体：新项目

### Current Scope

本轮优先完成结构层、钱包接入前端、Lens 配置前提与最小页面路径，不处理高自由视觉定制。

### Open Risks or Missing Inputs

- 尚无明确视觉参考
- 若后续切换到 `mainnet`，需要重新确认 app 与运行配置

### Next Skill To Invoke

`lens-interaction`

### Next Step

先确认 `lens-interaction` 的环境配置、认证与 contract 路径，再进入 `blog-frontend` 的 starter shell 落地。

## Example 2: 带设计稿的前端定制路径

### Project Summary

用户要搭建一个基于 Lens 的个人博客，并已提供 Figma，希望在默认 baseline 上完成主题定制。

### Implementation Path

默认 baseline + theme 定制

### Key Decisions

- Lens 环境：`testnet`
- Lens app：使用自有 Lens app
- 钱包方案：接受默认 `Privy`
- Frontend：接受默认 baseline
- 设计输入：已有 Figma
- 项目载体：已有 Next.js 项目

### Current Scope

本轮在确认 Lens 配置前提后，直接进入 `blog-frontend` 的 starter shell 迁移与 theme 定制。

### Open Risks or Missing Inputs

- 需要确认现有项目是否允许按官方 baseline 的结构参考迁移
- 若 Figma 包含超出 MVP 的功能，需先收敛实现范围

### Next Skill To Invoke

`blog-frontend`

### Next Step

基于官方 `starter-shell` 规划迁移方案，并根据 Figma 开始定制 `default theme` 或开发新的 theme。
