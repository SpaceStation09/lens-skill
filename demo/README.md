# Lens Blog Demo

`demo/` 是一个基于本仓库 baseline 资产搭出来的 Next.js 个人博客示例。

当前范围：

1. `auth` 页面：已接 `Privy` 登录和 `Lens` account discovery / session login。
2. `profile/[handle]`：优先读取真实 Lens account 与 post feed，失败时回退 demo 数据。
3. `post/[postId]`：优先读取真实 Lens post，失败时回退 demo 数据。
4. `compose`：已通过 Grove `uploadAsJson` + Lens `post()` 打通 article 发布链路。

## 默认决策

1. Lens 环境：`testnet`
2. 钱包方案：`Privy`
3. 前端路径：Next.js + 默认 editorial theme
4. 交付形态：认证、读取、article 发布都优先接真实能力

## 运行

1. 复制 `.env.example` 为 `.env.local`
2. 填写 `NEXT_PUBLIC_PRIVY_APP_ID`
3. 填写 `NEXT_PUBLIC_LENS_APP_ADDRESS`
4. 安装依赖：`npm install`
5. 启动开发环境：`npm run dev`

## 下一步接线

1. 为 account create / metadata update 接上同一套 Grove uploader。
2. 发布成功后跳转到真实 post detail 页，而不是只显示 tx/hash 回执。
3. 根据你的实际账号数据补充更细的错误映射与 loading UX。
4. 如需图片/封面文章，可把 `compose` 从 `uploadAsJson` 扩展为 `uploadFolder`。
