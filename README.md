# lens-skills

本仓库现在只保留 skills、references 和可直接分发的 theme assets。

## 当前模型

1. `skills/` 负责定义架构、行为 contract、落地步骤和验收要求
2. `skills/blog-frontend-governor/assets/` 负责提供可直接复制进目标项目的 theme 源码
3. 生成出来的 blog 项目应由这些 skills 直接构建，不再依赖仓库内的旧参考实现目录

## Skill 职责

1. `demo-project-starter`
   负责快速起一个最小可运行项目骨架
2. `lens-blog`
   负责 Lens 账号登录、读写流程、运行时配置和 adapter 侧约束
3. `blog-frontend-governor`
   负责 `BlogFrontendApp`、`core` / `adapter` / `theme` 边界、路由/权限 contract 和 theme 接入

## 目标项目推荐结构

生成 Lens blog 项目时，推荐结构如下：

```txt
app/
src/
  blog/
    core/
      contracts/
      router/
      runtime/
    adapters/
      lens/
        sdk.ts
        mapper.ts
        session.ts
        index.ts
    themes/
      default/
      neo/
    config/
  components/
  lib/
```

只要职责边界一致，也允许采用宿主仓库的等价结构。

## Theme Assets

当前可直接分发的源码资产位于：

1. `skills/blog-frontend-governor/assets/theme-default`
2. `skills/blog-frontend-governor/assets/theme-neo`

这些 assets 设计为被复制到目标项目的 `src/blog/themes/` 下，而不是被运行时继续从 skill 目录引用。
