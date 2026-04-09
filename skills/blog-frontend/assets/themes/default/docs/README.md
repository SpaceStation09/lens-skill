# Default Theme

这是 `blog-frontend` 的官方默认主题层。

它负责：

1. auth、profile、post、compose 页面模板。
2. 表现型组件与页面 chrome。
3. 样式 tokens 与默认视觉语言。
4. 基于官方 baseline 提供一套可直接参考的 editorial minimal 主题实现。

它不负责：

1. provider。
2. 路由。
3. 数据获取。
4. 权限判定。
5. 钱包、Lens session、账号管理等产品流程文案与业务区块定义。

## Boundary Notes

默认主题仍然承接页面模板，但会把容易变化的产品层内容通过 props 或 slots 注入，例如：

1. sidebar 状态面板。
2. footer 操作按钮。
3. compose 页右侧辅助信息。

这样 theme 保留布局和视觉控制权，但不内建官方产品流程。

## Visual Direction

默认主题遵循以下设计语言：

1. monochrome editorial
2. fixed sidebar + centered content canvas
3. large typographic hierarchy
4. restrained metadata rows
5. wide whitespace and low-noise surfaces

## Theme Authoring

如果 agent 需要开发新的 theme，请阅读：

1. [../../../references/theme-development-guide.md](../../../references/theme-development-guide.md)
