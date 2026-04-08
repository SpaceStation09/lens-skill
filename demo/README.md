# Lens Blog Demo

基于 `blog-frontend` starter shell 的 Lens 个人博客 demo。

## Quick Start

1. 安装依赖：

   ```bash
   npm install
   ```

2. 复制环境变量模板：

   ```bash
   cp .env.example .env.local
   ```

3. 启动开发环境：

   ```bash
   npm run dev
   ```

## 当前范围

- `/auth`：登录与账号创建流程占位
- `/profile/[handle]`：个人页与 feed 占位
- `/post/[postId]`：文章详情占位
- `/compose`：文章发布表单占位
- `providers/LensAuthProvider`：session 恢复、登录态管理
- `lib/lens/browser-client`：按 `LensResult` 契约返回 demo 读写结果

## Lens 配置

- `NEXT_PUBLIC_LENS_ENVIRONMENT`：`testnet` 或 `mainnet`
- `NEXT_PUBLIC_LENS_APP_ADDRESS`：Lens app 地址

## 钱包配置

- `NEXT_PUBLIC_PRIVY_APP_ID`：启用 Privy 钱包登录。
- 未配置该值时，demo 会退化到本地 mock 钱包模式。

当前 demo 已接入 Lens client 的登录/读取能力，支持在 auth 页创建新 Lens 账号，并在 Privy 模式下优先走真实发布链路（metadata 上传 + post）。若发布前置条件不满足，会回退到本地存储模拟。
