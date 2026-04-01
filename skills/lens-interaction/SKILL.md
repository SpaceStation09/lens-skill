---
name: lens-interaction
description: 指导 agent 在个人blog项目开发中实现 Lens 交互层（authentication、account、post）以及稳定的数据交付契约。用于需要处理 Lens 登录与会话管理、账户创建与资料读写、帖子创建与读取，并向前端输出一致数据结构的场景。
---

# Lens Interaction

本 skill 用于实现 Lens 数据交互层。只负责 Lens SDK 相关的认证、账户、帖子与数据封装，不负责页面、路由、theme 或宿主 UI 结构。

## 执行方式

按用户请求选择对应模块实现，不要求固定顺序：

1. authentication：身份类型、登录、session 管理、log-out、get last logged-in account。
2. account：账户概念映射、create/fetch/update metadata。
3. post：post 概念映射、create/fetch。

涉及需要已登录上下文的能力时，先满足前置条件再执行：

- 已完成有效登录并持有可用 session。
- 当前 account 与请求操作目标一致，或已明确切换到目标 account。
- 写操作（如 create/update）在提交前完成身份与会话有效性校验。

无论实现哪个模块，都在数据出口统一应用 data contract，向前端暴露稳定返回结构。

## 参考资料导航

- Authentication 细节：阅读 [references/authentication.md](./references/authentication.md)
- Account 细节：阅读 [references/accounts.md](./references/accounts.md)
- Post 细节：阅读 [references/posts.md](./references/posts.md)
- 数据交付契约：阅读 [references/data-contract.md](./references/data-contract.md)

仅在需要对应模块时加载相应 references，避免一次性加载全部内容。

## 实施约束

- 优先复用项目现有的 Lens SDK 初始化与调用方式，保持风格一致。
- 优先 fail fast：关键前提不满足时明确报错，不静默降级。
- 对外接口命名与字段保持稳定；若必须变更，先给出迁移说明再改动。
