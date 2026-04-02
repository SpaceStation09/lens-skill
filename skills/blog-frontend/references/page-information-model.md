# Page Information Model

## `/`

默认作为轻入口页：

1. 未登录时，引导进入 `/auth`。
2. 已登录且能解析当前 profile 时，跳转到 `/profile/[handle]`。

## `/auth`

最小信息面：

1. 当前钱包连接状态。
2. 当前连接的钱包地址。
3. 当前 Lens session 状态。
4. 是否已有可用 Lens account。
5. 连接钱包、创建账号、登录账号动作。
6. loading / success / error 反馈。

## `/profile/[handle]`

默认形态是“个人主页 + post feed”。

展示信息：

1. `coverPicture`
2. `picture`
3. `name`
4. `username`
5. `bio`
6. `address`
7. `attributes` 中可识别的资料项
8. 当前账号的 post feed

feed 中每条 post 默认展示：

1. `title`
2. `content` 摘要
3. `tags`
4. `createdAt`

空值规则：

1. `coverPicture` 缺失时保留 header 区域，由主题层决定 fallback 视觉。
2. `picture` 缺失时保留头像槽位，由主题层决定 fallback 表现。
3. `name` 缺失时回退到 `username`；若仍缺失，再回退到简化地址。
4. `bio` 缺失时隐藏 bio 区块。
5. `attributes` 缺失时隐藏扩展资料区块。
6. `post feed` 为空时显示 empty state。

## `/post/[postId]`

最小信息面：

1. `title`
2. `content`
3. `tags`
4. `createdAt`
5. 返回 profile 的上下文入口

空值规则：

1. `title` 缺失时不伪造标题，具体 fallback 由主题层决定。
2. `content` 缺失视为异常，不按正常详情页渲染。
3. `tags` 为空时隐藏标签区。
4. `createdAt` 缺失时隐藏时间信息。

## `/compose`

默认仅支持 `article` 发帖路径。

最小信息面：

1. 当前登录的 Lens 账号标识。
2. `title` 输入。
3. `content` 输入。
4. `tags` 输入。
5. 预览区占位。
6. 发布按钮。
7. 发布状态反馈。
