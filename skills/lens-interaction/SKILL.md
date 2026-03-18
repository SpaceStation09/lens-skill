---
name: lens-interaction
description: 指导 agent 在前端项目中实现 Lens 交互层（钱包到账户登录、首次创建 Lens 账号、资料和帖子读取、发帖与会话重置），并向宿主层暴露稳定服务接口。仅定义交互规范与契约，不分发源码。
---

# Lens Interaction

本 skill 用于实现 Lens 数据交互层。它只负责 Lens SDK 相关的读写与认证流程，不负责页面、路由、theme 或宿主 UI 结构。

## 适用场景

当用户需要以下任一能力时使用本 skill：

1. 钱包连接后发现 Lens 账号，并完成 Lens 登录
2. 钱包首次使用时，校验 username 可用性并创建 Lens 账号
3. 拉取 profile、post list、post detail
4. 发布 post 到 Lens
5. 为宿主层提供稳定的数据服务接口（而非直接暴露 SDK）
6. 管理认证 session（持久化、恢复、登出、失效重置）

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

1. 建立 Lens 运行时配置解析（network、appAddress）
2. 建立 SDK client 初始化层（public client、storage client）
3. 建立 session 管理（持久化、恢复、切号、登出、重置）
4. 按 service contract 实现统一 `LensService`
5. 实现 Lens 账号创建能力（仅 `canCreateUsername` 与 `createAccountWithUsername`）
6. 建立 mapper，将 Lens 响应转换为前端 view models
7. 统一错误模型，不把 SDK 原始错误/结果包装泄漏给宿主层

不要先在页面层直接调用 SDK，再回补交互层。

## 强制规则

1. 默认 Lens network 为 `testnet`，除非用户明确指定覆盖
2. 上层若无法提供钱包地址与签名能力，应视为阻塞错误
3. 发布能力必须依赖已认证 session
4. 宿主层只依赖 `LensService`，不依赖 SDK 类型与 result wrappers
5. 可选字段兜底必须在 mapper 层完成，不在 UI 层临时拼接
6. 应用启动时应尝试恢复历史 session，并映射到账户状态机
7. 本 skill 不绑定钱包 UI 库；它只依赖上层提供的钱包地址与签名能力
8. 依赖版本优先遵循 `references/sdk-runtime.md` 中的“版本策略”
9. 安装依赖出现冲突时，优先修正版本组合，不要直接用忽略冲突参数掩盖问题
10. Lens 账号创建能力仅暴露 `canCreateUsername` 与 `createAccountWithUsername` 两个方法

## 最小验收清单

1. 钱包地址可查询对应 Lens 账号
2. 可选择 Lens 账号完成登录
3. 当钱包下无 Lens 账号时，可通过 username 校验 + 创建完成首个 Lens 账号
4. 可按 handle 拉 profile，可按 handle 拉 posts，可按 id 拉单篇 post
5. 已登录可发帖，未登录发帖返回明确的 `UNAUTHENTICATED`
6. 刷新页面后可恢复会话（若 token 有效）
7. 切换账号或登出后，会话可被显式重置
8. 会话过期或恢复失败后，状态按钱包连接态回退：
   - 钱包已连接 -> `wallet_connected_unauthed`
   - 钱包未连接 -> `disconnected`
9. 宿主层拿到的是稳定 contract 数据和归一化错误，而不是 SDK 原始结构

## 交付说明

应用本 skill 后，agent 应按当前会话要求汇报结果；若用户未指定格式，优先简洁说明“已完成项、未完成项、风险与下一步”。
