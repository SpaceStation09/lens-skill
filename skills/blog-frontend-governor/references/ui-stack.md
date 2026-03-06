# UI Stack Policy

## 默认推荐栈

1. 样式层：Tailwind CSS
2. 组件层：shadcn/ui（Radix primitives）
3. 图标：lucide-react
4. 动效：framer-motion（仅在必要处使用）

选择理由：

1. 组合灵活，适合 blog 内容型页面
2. 主题 token 易管理，便于长期维护
3. 和 React/Vite/Next 生态兼容性好

## 复用优先规则

若项目已存在稳定设计系统（例如已有完整 Antd 或 MUI 体系），优先复用，不强推迁移。

复用条件：

1. 当前系统已覆盖列表、表单、弹层、导航等基础组件
2. 主题机制可用（颜色、字号、间距可统一）
3. 不存在明显性能或维护问题

## 迁移触发条件

满足以下任一条件，可考虑迁移到默认推荐栈：

1. 现有 UI 体系不统一，页面观感割裂
2. 样式覆盖层级复杂，维护成本高
3. 新需求经常需要“绕过组件库”手写样式

## 禁止事项

1. 禁止同一页面混用两套视觉语言冲突的组件体系
2. 禁止在未抽 token 前大量写内联样式
3. 禁止把品牌色和语义色写死在业务组件里

## 组件建议清单

1. `PostCard`
2. `PostMeta`
3. `TagPill`
4. `SearchInput`
5. `Pagination`
6. `TocNav`
7. `ArticleContent`

## 目录结构建议

```txt
src/
  components/blog/
  components/ui/
  pages/
  styles/
  lib/
```
