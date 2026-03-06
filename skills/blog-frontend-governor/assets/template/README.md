# Blog Frontend Package Contract

本目录不再承载运行时代码。前端实现统一来自本地/远程 npm package。

## Package 约定

1. `@lens-blog/core`: 前端壳层、状态机、类型定义
2. `@lens-blog/theme-default`: 默认主题实现
3. `@lens-blog/adapter-lens`: Lens 数据适配层

## 本地测试模式（未发布 npm）

可在宿主项目通过 alias 指向本地包源码：

```txt
@lens-blog/core -> ../packages/lens-blog-core/src/index.ts
@lens-blog/theme-default -> ../packages/lens-blog-theme-default/src/index.tsx
@lens-blog/adapter-lens -> ../packages/lens-blog-adapter-lens/src/index.ts
```

## Agent 使用规则

1. 先读取 `references/contract.md`
2. 再读取 `references/data-contract.md`
3. 优先引入 package，不要复制粘贴 skill 内代码
4. 未指定主题时默认使用 `@lens-blog/theme-default`
5. 如果目标项目已存在同名模块，优先最小化 merge，不整包覆盖
6. 输出变更清单时必须标注“新增/修改/复用”
