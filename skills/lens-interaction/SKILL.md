---
name: lens-interaction
description: 指导 agent 在前端项目中实现 Lens 交互层（钱包到账户登录、资料和帖子读取、发帖与会话重置），并向宿主层暴露稳定服务接口。仅定义交互规范与契约，不分发源码。
---

# Lens Interaction

本 skill 用于实现 Lens 数据交互层。它只负责 Lens SDK 相关的读写与认证流程，不负责页面、路由、theme 或宿主 UI 结构。

## 适用场景

当用户需要以下任一能力时使用本 skill：

1. 钱包连接后发现 Lens accounts，并完成 Lens 登录
2. 拉取 profile、post list、post detail
3. 发布 post 到 Lens
4. 为宿主层提供稳定的数据服务接口（而非直接暴露 SDK）
5. 管理认证 session（持久化、恢复、登出、失效重置）

## 非适用场景

以下任务不在本 skill 范围内：

1. Next.js 页面和路由实现
2. owner / viewer 视角 UI 渲染
3. theme 组件开发与样式设计
4. 主题源码资产分发

这些任务应由 `blog-frontend` 处理。

## 本 skill 的产物边界

本 skill 是“规范型 skill”，只提供说明文档，不分发实现源码。

1. 允许：`SKILL.md` + `references/*.md`
2. 不允许：`assets/` 模板代码或可直接复制的 Lens 实现源码
3. 代码分发例外只在 `theme-default` skill 中存在

## 必读 references（按顺序）

1. [references/service-contract.md](references/service-contract.md)
2. [references/auth-flow.md](references/auth-flow.md)
3. [references/session-management.md](references/session-management.md)
4. [references/error-model.md](references/error-model.md)
5. [references/mapping-rules.md](references/mapping-rules.md)
6. [references/sdk-runtime.md](references/sdk-runtime.md)

## 执行顺序

按以下顺序在目标项目中实现：

1. 建立 Lens 运行时配置解析（network、appAddress、walletconnect）
2. 建立 SDK client 初始化层（public client、storage client）
3. 建立 session 管理（持久化、恢复、切号、登出、重置）
4. 按 service contract 实现统一 `LensService`
5. 建立 mapper，将 Lens 响应转换为前端 view models
6. 统一错误模型，不把 SDK 原始错误/结果包装泄漏给宿主层

不要先在页面层直接调用 SDK，再回补交互层。

## 强制规则

1. 默认 Lens network 为 `testnet`，除非用户明确指定覆盖
2. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 缺失应视为阻塞错误
3. 发布能力必须依赖已认证 session
4. 宿主层只依赖 `LensService`，不依赖 SDK 类型与 result wrappers
5. 可选字段兜底必须在 mapper 层完成，不在 UI 层临时拼接
6. 应用启动时应尝试恢复历史 session，并映射到账户状态机
7. 本 skill 不绑定钱包 UI 库；它只依赖上层提供的钱包地址与签名能力

## 最小验收清单

1. 钱包地址可查询对应 Lens accounts
2. 可选择 account 完成 Lens 登录
3. 可按 handle 拉 profile，可按 handle 拉 posts，可按 id 拉单篇 post
4. 已登录可发帖，未登录发帖返回明确的 `UNAUTHENTICATED`
5. 刷新页面后可恢复会话（若 token 有效）
6. 切换账号或登出后，会话可被显式重置
7. 会话过期或恢复失败后，状态按钱包连接态回退：
   - 钱包已连接 -> `wallet_connected_unauthed`
   - 钱包未连接 -> `disconnected`
8. 宿主层拿到的是稳定 contract 数据和归一化错误，而不是 SDK 原始结构

## 交付报告要求（双层）

应用本 skill 后，agent 应输出两层交付信息：

1. 对话内只输出“通用业务报告”（面向非技术用户）
2. 技术附录写入项目文档文件，不在对话中展开细节

### A. 通用业务报告（对话内）

按以下结构汇报：

1. 这次完成了什么（1-2 句话）
2. 用户现在能做什么（3-5 条）
3. 还有什么没完成（明确列项）
4. 问题与影响（谁会受影响、影响什么）
5. 下一步建议（最多 3 条）

### B. 技术附录（写入文档）

默认写入路径：

- `docs/reports/lens-interaction-technical-report.md`

技术附录至少包含：

1. `LensService` 落地清单（已实现 / 未实现）
2. auth 与 session 处理细节（恢复、回退、重置）
3. 数据映射与错误归一化覆盖项
4. 已知限制与技术风险

对话中只需提示“技术附录已写入该路径”，不要展开整段技术细节。
