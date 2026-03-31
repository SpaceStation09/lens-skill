# Pipeline Checkpoints

## Stage 1: Host Skeleton

通过条件：

1. `app` 路由壳已建立（`/`, `/:handle`, `/p/:postId`, `/write`）。
2. provider 三态已建立（`disconnected`, `wallet_connected_unauthed`, `authenticated`）。
3. provider 已具备启动恢复入口。

## Stage 2: Lens Interaction

通过条件：

1. `LensService` 契约实现完整。
2. session 管理具备恢复、登出、重置能力。
3. 错误归一化后对上层暴露。
4. 账号映射已验证：`listWalletAccounts` 可稳定拿到 handle（兼容 `username.localName`）。
5. 会话映射已验证：`login/resumeSession` 后 `session.handle` 可用于直接路由到 `/:handle`。

## Stage 3: Integration

通过条件：

1. 页面通过 `LensService` 完成数据读取与写入。
2. owner gate 已生效，`/write` 对非 owner 不可发布。
3. 登录成功、创建成功、恢复成功后可回到目标 `/:handle`。
4. 帖子映射已验证：`/:handle` 与 `/p/:postId` 正文可读取（兼容 `metadata.content`）。
5. Repost 映射已验证：转发内容不会出现“仅有标题/空正文”。

## Stage 4: Delivery Gate

通过条件：

1. 关键路径可运行：连接 -> 登录/创建 -> 浏览 -> 发布。
2. 回退路径可运行：session 失效 -> 状态正确回退。
3. 未出现页面层直调 Lens SDK。

任何阶段未通过，必须先修复再进入下一阶段。
