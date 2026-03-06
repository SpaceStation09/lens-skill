# Lens Blog Demo

基于 Lens Protocol SDK 的个人博客 demo，覆盖最小主流程：

1. 连接钱包
2. 检查钱包已拥有的 Lens 账户
3. 以 Account Owner 登录
4. 使用 `article()` + Grove Storage 发布文章
5. 按作者地址拉取文章列表

## 快速开始

```bash
cd ./lens-blog-demo
cp .env.example .env
npm install
npm run dev
```

说明：当前通过本地 alias 引入包源码（`@lens-blog/core`、`@lens-blog/adapter-lens`、`@lens-blog/theme-default`），用于未发布 npm 前的本地测试。

打开浏览器访问输出的本地地址（通常是 `http://localhost:5173`）。

## 环境变量

- `VITE_LENS_NETWORK` 可选：`testnet` 或 `mainnet`（默认 `testnet`）
- `VITE_LENS_APP_ADDRESS` 可选：覆盖当前网络默认的 Lens global app address
- `VITE_WALLETCONNECT_PROJECT_ID` 当前阶段必填：WalletConnect 类钱包连接依赖该值

示例：

```env
VITE_LENS_NETWORK=testnet
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
# VITE_LENS_APP_ADDRESS=0xYourCustomOrGlobalAppAddress
```

## 验收清单

- 页面可打开且可连接钱包
- 可查询当前钱包是否有 Lens 账户
- 填入 `Account 地址` 后可尝试登录（`App 地址` 默认自动注入）
- 可提交标题/Markdown 内容并触发发布流程
- 可按作者地址拉取并展示文章

## 已知限制

- 当前实现已支持 Onboarding User 创建账户流程，但依赖钱包签名和链上交易确认。
- SDK 版本升级可能导致 API 变动；若安装后有类型错误，请按控制台提示微调 import 或参数。
- 未接入后端持久层，数据读取依赖 Lens 网络本身。
