# Default Theme

这是 `blog-frontend` 的官方默认主题层。

它负责：

1. auth、profile、post、compose 页面模板。
2. 表现型组件。
3. 样式 tokens 与默认视觉语言。
4. 基于官方 baseline 提供一套可直接参考的 editorial minimal 主题实现。

它不负责：

1. provider。
2. 路由。
3. 数据获取。
4. 权限判定。

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
