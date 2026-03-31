# lens-skills

用于维护 Lens blog 相关的 Codex skills（文档规范 + 必要源码资产）。

## 当前 skills

1. `skills/blog-frontend`
   定义 Next.js 博客前端宿主层规范（路由、状态机、页面行为、theme 接入）。
2. `skills/lens-interaction`
   定义 Lens 交互层规范（登录、读取、发布、session、错误与映射）。
3. `skills/lens-blog-builder`
   顶层建站编排 skill（先做需求访谈，再按阶段调度 `blog-frontend` 与 `lens-interaction`，完成联调后交付）。

## 设计原则

1. `blog-frontend` 与 `lens-interaction` 职责分离，避免耦合。
2. 只有 `theme-default` 允许以源码资产分发。
3. 其他能力以 `SKILL.md + references/*.md` 提供规范，不分发业务实现代码。
4. 默认采用“一个稳定功能内核 + 一个可替换主题皮肤”的最小混用策略。

## 目标项目最小结构（推荐）

```txt
app/
  providers.tsx
  page.tsx
  [handle]/page.tsx
  p/[postId]/page.tsx
  write/page.tsx
lib/
  blog/
    provider/
    services/
    guards/
components/
  blog/
    theme-default/
```

## Theme 资产

当前仅分发：

1. `skills/blog-frontend/assets/theme-default/index.tsx`
2. `skills/blog-frontend/assets/theme-default/styles.css`

## Starter 内核资产

当前分发：

1. `skills/blog-frontend/assets/starter/lib/blog/types.ts`
2. `skills/blog-frontend/assets/starter/lib/blog/guards/owner.ts`
3. `skills/blog-frontend/assets/starter/lib/blog/services/lens-service.ts`
4. `skills/blog-frontend/assets/starter/lib/blog/provider/state.tsx`
