# Starter Shell

这是 `blog-frontend` 的官方结构层 baseline。

它提供：

1. 基于 Next.js App Router 的最小页面结构。
2. `auth`、`profile`、`post`、`compose` 四个核心 feature。
3. 与 `lens-interaction` 数据契约对接的入口位点。
4. 主题层挂载位点。
5. 前端宿主层环境变量模板。

它不提供：

1. 复杂设计系统。
2. 品牌化视觉实现。
3. Lens SDK 底层逻辑。

## Environment Setup

使用时先复制 `.env.example` 为 `.env.local`，再按项目实际值填写。

当前模板至少预留：

1. `NEXT_PUBLIC_PRIVY_APP_ID`

说明：

1. `NEXT_PUBLIC_PRIVY_APP_ID` 用于接入默认钱包方案 `Privy`。
2. Lens 相关 env 仅在 `lens-interaction` 明确提供约定后再补充，不在这里预设变量名。
