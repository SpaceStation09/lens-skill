# lens-skills (WIP)

本仓库用于维护和实验 Codex Skills，并附带一个可运行的 Lens 博客 demo 项目。现阶段仍处于测试阶段，谨慎使用。

## 目录结构

```txt
lens-skills/
├── AGENTS.md
├── packages/
│   ├── lens-blog-core/
│   ├── lens-blog-adapter-lens/
│   └── lens-blog-theme-default/
├── skills/
│   ├── lens-blog/
│   │   ├── SKILL.md
│   │   └── reference.md
│   └── demo-project-starter/
│       └── SKILL.md
└── lens-blog-demo/
    ├── src/
    ├── package.json
    └── .env.example
```

## 包含内容

- `skills/lens-blog`: 使用 Lens Protocol 构建个人博客的技能说明（含 API 参考与兼容性注意事项）
- `skills/demo-project-starter`: 快速生成 demo 项目的通用技能模板
- `packages/lens-blog-core`: 前端壳层和类型契约（本地包）
- `packages/lens-blog-adapter-lens`: Lens 数据适配器（本地包）
- `packages/lens-blog-theme-default`: 默认主题实现（本地包）
- `lens-blog-demo`: React + TypeScript + Lens SDK 的最小可运行示例

## 快速开始（运行 demo）

```bash
cd ./lens-blog-demo
cp .env.example .env
npm install
npm run dev
```

## 环境变量（`lens-blog-demo/.env`）

```env
VITE_LENS_NETWORK=testnet
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
# VITE_LENS_APP_ADDRESS=0xYourCustomOrGlobalAppAddress
```

- 运行 demo 时，`VITE_WALLETCONNECT_PROJECT_ID` 当前阶段建议视为必填
- `VITE_LENS_NETWORK`: 可选，`testnet` 或 `mainnet`
- `VITE_WALLETCONNECT_PROJECT_ID`: WalletConnect Cloud 项目 ID（当前阶段必填）
- `VITE_LENS_APP_ADDRESS`: 可选，覆盖默认 App 地址

## 技能使用方式

在对话中显式点名技能即可触发，例如：

- `请用 $lens-blog 帮我搭一个 Lens 个人博客`
- `请用 $demo-project-starter 起一个新的 demo 项目`

## 发布到 GitHub 前建议

1. 确认 `.env` 不会提交（已在 `.gitignore` 中忽略）
2. 本地构建检查：
   - `cd lens-blog-demo && npm run build`
3. 提交前检查变更：
   - `git status`
