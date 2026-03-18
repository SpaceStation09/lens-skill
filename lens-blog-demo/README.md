# lens-blog-demo

基于 Next.js + Lens 交互规范的个人博客 demo，包含：

- `/` 登录与无账号创建流程
- `/:handle` 公开个人页与帖子列表
- `/p/:postId` 公开文章详情
- `/write` owner gate + 发布
- 三态账户状态机：`disconnected` / `wallet_connected_unauthed` / `authenticated`

## 快速开始

```bash
cd lens-blog-demo
cp .env.example .env.local
npm install
npm run dev
```

当前已接入真实 Lens SDK（登录、账号发现、username 校验/创建、profile/posts 读取、发帖）。
钱包连接使用 Privy；请先在 `.env.local` 中配置可用的 `NEXT_PUBLIC_PRIVY_APP_ID` 再运行。

## 环境变量

- `NEXT_PUBLIC_PRIVY_APP_ID`: Privy App ID
- `NEXT_PUBLIC_LENS_NETWORK`: `testnet`（默认）或 `mainnet`
- `NEXT_PUBLIC_LENS_APP_ADDRESS`: Lens app address（默认回退官方 test app）
