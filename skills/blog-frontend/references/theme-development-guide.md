# Theme Development Guide

本文件定义新的 theme 如何与 `starter-shell` 配合。

## Theme Responsibility

theme 负责：

1. 页面布局表现。
2. 视觉风格与排版系统。
3. 表现型组件与模板。
4. 空值的视觉 fallback。

theme 不负责：

1. provider。
2. 路由。
3. 数据获取。
4. Lens SDK 或 `lens-interaction` 调用。
5. 权限判定。

## Integration Rules

1. 保持与 `starter-shell` 解耦。
2. 通过模板与表现组件消费结构层传入的数据，而不是自己发起请求。
3. 可以决定空值如何显示，但不能改变结构层的业务规则。
4. 若某些设计稿包含当前 MVP 没有的功能，只吸收视觉语言，不要反向扩大产品范围。

## Using The Default Theme

当 agent 直接使用 `assets/themes/default/` 时，默认按以下方式集成：

1. 复用 `templates/` 下的页面模板作为默认页面表现层，而不是在 shell 中重新复制一份页面布局。
2. 复用 `styles/tokens.css` 与 `styles/globals.css` 作为默认视觉基线。
3. 将 shell 已经掌握的业务状态先整理成 theme 可消费的数据或节点，再传给模板。

推荐的接入方式：

1. `ThemeFrame`
   - 负责品牌区、导航、footer、主内容区和整体 page chrome。
   - `sidebarPanel` 用于注入 session 状态、作者卡片、环境提示等易变业务区块。
   - `footerActions` 用于注入 logout、disconnect、open settings 等动作。
2. `AuthTemplate`
   - 负责 auth 页的默认布局与表现。
   - `connectedAccount` 只表达“是否已有连接身份”，不要把具体钱包方案名写死进 theme。
   - `sidebarPanel`、`footerActions` 继续由 shell 注入。
3. `ComposeTemplate`
   - 负责编辑页的默认布局与视觉。
   - `sidePanel` 用于注入发布提示、摘要预览、校验说明等辅助区块。
   - 不要把 `visibility`、`publishDate`、协议特定发布策略等字段写死进 theme。
4. `ProfileTemplate` / `PostTemplate`
   - 优先消费 theme 自己的 view model 或最小 props shape。
   - 不要直接把 `starter-shell` 或 `lens-interaction` 的 contract 类型绑进 theme 源码。

## Default Theme Rules

使用默认主题时，agent 应遵守：

1. 可以替换模板、样式和表现组件，但不要把 provider、router、SDK 调用放进 `assets/themes/default/`。
2. 可以通过 props 或 slots 注入产品区块，但不要把官方 baseline 的产品流程文案重新固化进 theme。
3. 若需要展示 wallet、Lens session、账号管理、发布策略等信息，应由 shell 生成这些区块，再交给 theme 渲染。
4. 若需要主题定制，优先改 `tokens.css`、`globals.css` 和模板结构；只有结构层真的不够时再改 shell。

## Data Expectations

新的 theme 至少应能消费：

1. profile：`name`、`username`、`bio`、`picture`、`coverPicture`、`address`、`attributes`
2. post list item：`title`、`content`、`tags`、`createdAt`
3. post detail：`title`、`content`、`tags`、`createdAt`
4. compose：`title`、`content`、`tags`

## Fallback Rules

1. `picture` 或 `coverPicture` 缺失时，theme 负责给出视觉 fallback，但不要伪造数据。
2. `bio` 缺失时可以隐藏该区块，不强制显示占位文案。
3. `tags` 为空时可以隐藏标签区。
4. `title` 缺失时可以显示视觉占位标题，但不要修改结构层数据。

## Styling Guidance

1. 优先定义 CSS variables，再组织页面样式。
2. 保持 typography 层级清晰。
3. 少用装饰色，优先依靠 spacing、weight、tracking 与对比建立气质。
4. 如果 theme 引入 persistent sidebar、footer 或 page chrome，应保证 auth、profile、post、compose 页面之间的视觉连续性。
