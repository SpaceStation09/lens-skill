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
