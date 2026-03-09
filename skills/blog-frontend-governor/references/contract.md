# Blog Frontend Contract v1

## 1. 必选功能（MUST）

1. Landing 页面必须是个人 Profile 页，主路由为 `/:handle`
2. Profile 区必须显示：
   - 头像
   - bio
   - 钱包短地址（如 `0x12ab...89ef`）
   - 关注/粉丝（有数据就显示，无数据则隐藏该字段）
3. Blog 流必须与 Profile 同页展示，默认按发布时间倒序
4. 文章卡片至少包含：标题、摘要、发布时间、标签
5. 文章详情页：正文排版、代码块样式、标题层级清晰
6. 搜索：至少支持标题和摘要关键字过滤
7. 标签浏览：可从列表页进入过滤视图
8. 分页或无限滚动：列表内容超过一屏后可继续浏览
9. 发布入口：本人访问自己的 `/:handle` 时可见，非本人隐藏
10. SEO 基础：`title`、`description`、Open Graph 基础信息
11. 响应式：移动端（<=768px）正文可读、导航可用
12. 状态处理：加载态、空态、错误态
13. 视角规则：必须区分 `Owner View` 与 `Viewer View`
14. 权限规则：`/:handle` 与 `/p/:postId` 可游客访问；`/write` 必须已登录 Lens account 且为 owner
15. 账户操作入口（连接钱包 / Login Lens / Switch Lens Account）必须放在全局顶部导航，不放在 profile 信息卡内

## 1.1 头像策略（MUST）

1. 优先使用 Lens 返回头像 URL
2. 若无头像，使用钱包地址生成 identicon
3. 不使用静态默认头像作为主兜底

## 1.2 入口状态机（MUST）

1. 未连接钱包：显示品牌 landing，并提供 Connect Wallet 主按钮
2. 已连接未登录：展示该钱包下可用 Lens account 列表，用户选择后登录
3. 已登录：自动进入已登录 handle 的 `/:handle` Profile Landing

## 1.3 视角判定（MUST）

1. `Owner View` 判定：`accountState === authenticated` 且 `activeHandle == currentProfile.handle`
2. 其他全部视为 `Viewer View`（包括未登录、已连接未登录、已登录但访问他人 profile）
3. `Write` 入口仅 `Owner View` 显示
4. 直接访问 `/write` 时若不满足 owner 条件，必须重定向回可读页面并给出状态提示

## 2. 推荐功能（SHOULD）

1. 目录（TOC）与阅读进度提示
2. 上一篇/下一篇导航
3. 深色模式（若项目已有主题机制则复用）
4. RSS 或订阅入口

## 3. 视觉与交互基线

1. 排版优先级：正文可读性 > 卡片装饰 > 动效
2. 统一间距体系：建议 4/8 像素倍数
3. 色彩 token 化：避免散落的硬编码颜色
4. 动效节制：列表和页面切换可有轻量过渡，禁止大面积炫技动画

## 4. 验收清单（DoD）

1. 任意页面首屏在 3 秒内可交互（本地开发环境）
2. Lighthouse 可访问性 >= 90（开发态近似值即可）
3. 功能 MUST 条目全部可操作演示
4. 无明显布局错位（桌面端 + 移动端）
5. 关键路径无控制台报错（列表、详情、搜索）

## 5. 非目标（当前阶段不做）

1. 复杂 CMS 后台
2. 多租户主题引擎
3. 重型可视化编辑器
