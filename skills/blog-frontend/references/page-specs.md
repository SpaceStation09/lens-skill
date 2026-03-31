# Page Specs

## Landing

1. 展示 connect wallet
2. 钱包已连接时展示 Lens 登录入口
3. 当钱包下无 Lens 账号时，展示 username 校验与创建入口
4. 在 `/` 上登录成功或会话恢复成功后，自动跳转到当前 Lens 账号的 profile 页（`/:handle`）
5. 创建成功后应刷新账号列表并引导用户选择新账号登录；不要默认“创建即 authenticated”
6. 若当前已登录但无法解析 `handle`，不得静默停留在“跳转中”；应展示可见兜底（提示 + 重试/切号入口）

## Profile (`/:handle`)

1. 展示 profile 基础信息和 post 列表
2. owner 视角显示写作入口
3. non-owner 视角隐藏 owner 动作

## Owner 判定

owner 判定统一以 [owner-identity.md](owner-identity.md) 为准，本文件不重复定义公式。

## Post Detail (`/p/:postId`)

1. 拉取并展示单篇 post
2. 不存在时展示 not found

## Write (`/write`)

1. owner 可编辑并提交 `publishPost`
2. non-owner 仅展示 gate，不执行 publish
