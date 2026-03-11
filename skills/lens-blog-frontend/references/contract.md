# Blog Frontend Contract

用这个文件检查一个 Next.js 应用是否真正成为了预期的 Lens Blog 前端，而不只是若干页面的集合。

## 必须满足的产品行为

1. 公开 profile 路由为 `/:handle`。
2. 文章详情路由为 `/p/:postId`。
3. 写作路由为 `/write`。
4. `/:handle` 和 `/p/:postId` 必须保持公开可读。
5. `/write` 必须要求已认证的 owner view。

## 必须满足的页面能力

1. profile 页面必须展示 avatar、display name、handle、bio 和短地址。
2. 如果有 follower / following 数据则展示；没有则自然隐藏。
3. profile 页面必须在同一产品界面内展示 post feed。
4. 文章卡片必须展示标题、摘要、创建时间，以及可用时的标签。
5. 文章详情页必须能以可读方式展示正文内容。
6. 搜索至少支持按标题或摘要过滤。
7. 较长 feed 必须支持分页或无限滚动。
8. owner view 必须暴露写作入口。
9. viewer view 必须隐藏 owner 专属动作。

## 必须满足的全局入口状态

1. 钱包未连接时，应用必须展示 landing 状态，并提供 connect-wallet 操作。
2. 钱包已连接但尚未完成 Lens account 认证时，应用必须展示 Lens account 选择界面。
3. Lens account 已认证后，应用应进入当前 active profile 流程。

## 必须满足的摆放规则

1. `Connect Wallet`、`Login Lens`、`Switch Lens Account` 等账户操作应放在全局导航中，而不是 profile 卡片内部。
2. theme 专属布局可以变化，但路由和权限行为不能因 theme 不同而变化。

## Avatar 规则

1. 优先使用 Lens 返回的 avatar URL。
2. 若缺失，则使用基于地址生成的 identicon。
3. 不要把静态默认头像作为主要兜底方案。

## 推荐增强项

1. 长文目录
2. 上一篇 / 下一篇导航
3. RSS 或订阅入口
4. 阅读进度提示

## 质量基线

1. 移动端阅读必须可用。
2. 必须存在 empty / loading / error 状态。
3. 正文可读性优先于装饰性 UI。
4. 颜色和间距应尽量 token 化，而不是四处分散硬编码。

## 非目标

1. 完整 CMS 后台
2. 多租户 theme 引擎
3. 重型可视化编辑器
