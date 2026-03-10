# UI Stack Policy

只有在任务涉及 UI 栈选择或视觉重构时才阅读本文件。

## 默认推荐

对于新的 Next.js Lens blog frontend，优先考虑：

1. 使用 Tailwind CSS 做样式层
2. 使用 shadcn/ui + Radix primitives 作为可复用 UI 组件基础
3. 使用 `lucide-react` 作为图标库
4. 仅在能改善导航或阅读流时使用轻量动效

## 优先复用规则

如果项目已经有一套一致的设计系统，应优先复用，而不是再引入另一套重型 UI 栈。

满足以下条件时可直接复用：

1. 表单、导航、卡片、按钮等核心组件已经存在
2. tokens 或 theme variables 已经可管理
3. 当前系统没有形成明显维护拖累

## 迁移触发条件

只有在以下一项或多项成立时，才考虑迁移到默认推荐栈：

1. 当前 UI 体系严重碎片化
2. 样式覆盖成本持续偏高
3. 新博客功能经常绕过现有组件体系单独实现

## 禁止项

1. 不要在同一界面混用多套相互冲突的视觉系统。
2. 不要在业务组件里到处硬编码品牌色。
3. 不要让 UI 栈选择反向改变 `BlogFrontendApp` contract。

## 常见 UI 组件

1. `PostCard`
2. `PostMeta`
3. `TagPill`
4. `SearchInput`
5. `Pagination`
6. `ArticleContent`
