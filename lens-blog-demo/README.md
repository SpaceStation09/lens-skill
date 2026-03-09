# Lens Blog Demo (Next.js)

基于 Next.js App Router + Lens Protocol SDK 的个人博客 demo，覆盖最小主流程：

1. 连接钱包
2. 检查钱包已拥有的 Lens 账户
3. 以 Account Owner 登录
4. 使用 `article()` + Grove Storage 发布文章
5. 按作者地址拉取文章列表

## 快速开始

```bash
cd ./lens-blog-demo
cp .env.example .env.local
npm install
npm run dev
```

打开浏览器访问 `http://localhost:3000`。

## 环境变量

- `NEXT_PUBLIC_LENS_NETWORK` 可选：`testnet` 或 `mainnet`（默认 `testnet`）
- `NEXT_PUBLIC_LENS_APP_ADDRESS` 可选：覆盖当前网络默认的 Lens global app address
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` 当前阶段必填：WalletConnect 连接依赖该值
- `NEXT_PUBLIC_BLOG_THEME` 可选：`default` 或 `neo`（默认 `default`，启动前配置）

示例：

```env
NEXT_PUBLIC_LENS_NETWORK=testnet
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_BLOG_THEME=default
# NEXT_PUBLIC_LENS_APP_ADDRESS=0xYourCustomOrGlobalAppAddress
```

## 架构说明

- `app/`：Next.js App Router 入口与全局 Providers
- `src/lib/lens.ts`：Lens SDK 的调用封装
- `@lens-blog/core`：状态机 + 路由壳层
- `@lens-blog/adapter-lens`：数据适配层
- `@lens-blog/theme-default` / `@lens-blog/theme-neo`：主题层（通过环境变量选择）

## 说明

- 当前通过 `file:` 本地包依赖引入 `@lens-blog/core`、`@lens-blog/adapter-lens`、`@lens-blog/theme-default`，用于未发布 npm 前的本地联调。
- 使用 `app/[[...slug]]/page.tsx` 承载前端壳层，兼容 `/:handle`、`/write`、`/p/:postId` 这类客户端路由。
