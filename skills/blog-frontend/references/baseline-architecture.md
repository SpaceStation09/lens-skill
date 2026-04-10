# Baseline Architecture

## 目标

定义 `blog-frontend` 的官方 baseline，避免 agent 每次从零设计前端系统。

## 官方 baseline

官方 baseline 由两部分组成：

1. `assets/starter-shell/`
2. `assets/themes/default/`

它们共同组成 Lens 原生个人博客 web app 的默认起点。

## 技术栈

默认技术栈：

1. `Next.js`
2. `React`
3. `Privy`
4. `lens-interaction` 数据契约接线

## 核心原则

1. 默认从官方 baseline 起步。
2. 结构层与主题层解耦。
3. 结构层先稳定，主题层后定制。
4. 与 Lens 的数据交互只通过 `lens-interaction` 对接。
5. 博客写作默认围绕 `article` 工作流。
6. 默认钱包接入路径围绕 `Privy` 构建，并优先提供邮箱登录体验。

## 适用场景

适用于：

1. Lens 原生个人博客。
2. 以单个博主为中心的 profile + post feed + post detail + compose 站点。

不适用于：

1. 多框架官方输出。
2. 复杂社交网络前端。
3. 在本 skill 中重新封装 Lens SDK。
