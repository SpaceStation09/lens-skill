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
3. 拉取 profile / post list / post detail，并发布 post
4. 为宿主层提供稳定 `LensService` 契约与会话管理能力


## 本 skill 的产物边界

本 skill 是“规范型 skill”，只提供说明文档，不分发实现源码。

1. 允许：`SKILL.md` + `references/*.md`
2. 不允许：`assets/` 模板代码或可直接复制的 Lens 实现源码

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
3. 建立 session 管理（持久化、恢复、登出、重置）
4. 按 service contract 实现统一 `LensService`（含账号创建、读取、发布能力）
5. 建立 mapper 与错误模型，确保对外返回归一化结构

不要先在页面层直接调用 SDK，再回补交互层。

## 强制规则（仅边界与契约）

1. 本 skill 只定义 Lens 交互层契约，不绑定具体钱包 UI 库、页面框架或主题实现。
2. 上层若无法提供钱包地址与签名能力，应视为阻塞错误。
3. 发布能力必须依赖已认证 session；未认证时返回明确的 `UNAUTHENTICATED`。
4. 宿主层只依赖 `LensService` 契约，不依赖 SDK 类型与 result wrappers。
5. 对外返回的数据与错误必须归一化，不直接泄漏 SDK 原始结构。
6. 会话能力必须覆盖：持久化、恢复、登出、失效重置，并可映射到账户状态机。
7. 账号创建能力至少包含 `canCreateUsername` 与 `createAccountWithUsername`。

## 最小验收清单

1. 钱包地址可查询对应 Lens 账号，并可选择账号完成登录
2. 钱包下无 Lens 账号时，可通过 username 校验 + 创建完成首个 Lens 账号
3. 可按 handle 拉 profile / posts，可按 id 拉 post detail
4. 已登录可发帖，未登录发帖返回明确的 `UNAUTHENTICATED`
5. 刷新后可恢复会话；切换账号或登出后会话可显式重置
6. 会话过期或恢复失败后，状态按钱包连接态回退：
   - 钱包已连接 -> `wallet_connected_unauthed`
   - 钱包未连接 -> `disconnected`
7. 宿主层拿到的是稳定 contract 数据和归一化错误，而不是 SDK 原始结构

## 交付说明

应用本 skill 后，agent 应按当前会话要求汇报结果；若用户未指定格式，优先简洁说明“已完成项、未完成项、风险与下一步”。
