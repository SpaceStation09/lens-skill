# Routes And Guards

## 路由

1. `/` landing
2. `/:handle` profile
3. `/p/:postId` post detail
4. `/write` write

## 状态定义

1. `disconnected`
2. `wallet_connected_unauthed`
3. `authenticated`

## 访问规则

1. `/`、`/:handle`、`/p/:postId` 始终可访问
2. `/write` 可访问，但只有 owner 才能发布

## /write gate

未满足发布条件时显示 gate：

1. 钱包未连接 -> 提示 connect wallet
2. 钱包已连接未登录 Lens 且存在账号 -> 提示选择并登录 Lens 账号
3. 钱包已连接未登录 Lens 且无账号 -> 提示创建 Lens 账号
4. 已登录但非 owner -> 提示切换到 owner 账号

## 状态 × 路由行为矩阵

| 状态 | `/` (landing) | `/:handle` (profile) | `/p/:postId` (post) | `/write` (write) |
| --- | --- | --- | --- | --- |
| `disconnected` | 允许访问；显示 `connect wallet`；可进入登录引导 | 允许访问；显示公开内容（viewer） | 允许访问；显示公开正文 | 允许访问；显示 `connect wallet` gate；禁止 `publish` |
| `wallet_connected_unauthed` | 允许访问；有账号时显示 Lens 账号选择登录；无账号时显示创建入口 | 允许访问；显示公开内容（viewer） | 允许访问；显示公开正文 | 允许访问；显示 Lens 登录 gate；禁止 `publish` |
| `authenticated` + `owner` | 若当前路由为 `/`，应自动跳转到 `/:handle`；非 `/` 可显示已登录入口态 | 允许访问；显示 owner 视角和 owner 动作 | 允许访问；显示公开正文（可带 owner 辅助动作） | 允许访问；可编辑并执行 `publish` |
| `authenticated` + `non-owner` | 若当前路由为 `/`，应自动跳转到 `/:handle`；非 `/` 可显示已登录入口态 | 允许访问；显示 viewer 视角，隐藏 owner 动作 | 允许访问；显示公开正文 | 允许访问；显示 `切换账号` gate；禁止 `publish` |

## 硬规则

1. 只有 `authenticated && isOwnerView` 才允许执行 `publishPost`
2. 路由可访问不等于动作可执行，`/write` 在非 owner 状态必须是 gate 模式
3. `isOwnerView` 的判定来源见 [owner-identity.md](owner-identity.md)
