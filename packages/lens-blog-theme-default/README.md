# @lens-blog/theme-default

`@lens-blog/theme-default` 是 Lens Blog 的默认主题实现。

当前阶段为本地包（`private: true`），用于未发布 npm 前的本地联调。

## 提供能力

1. Landing 页（未连接 / 已连接未登录）
2. `/:handle` Profile + Feed 视图
3. 基础分页与搜索 UI
4. 钱包按钮插槽与 Lens 账号切换入口
5. 主题样式（`src/styles.css`）

## 导出

- `defaultTheme`

`defaultTheme` 符合 `@lens-blog/core` 的 `BlogTheme` 接口。

## 最小用法

```tsx
import { BlogFrontendApp } from "@lens-blog/core";
import { defaultTheme } from "@lens-blog/theme-default";

<BlogFrontendApp adapter={adapter} theme={defaultTheme} ... />
```

## 扩展主题建议

如果要新增主题，建议创建独立包：

- `@lens-blog/theme-minimal`
- `@lens-blog/theme-magazine`

并继续实现同样的 `BlogTheme` 接口，这样无需修改 `core` 和 `adapter`。

## 依赖

- `react >= 18`

## 本地测试（未发布 npm）

建议在宿主项目配置 alias：

```txt
@lens-blog/theme-default -> ../packages/lens-blog-theme-default/src/index.tsx
```
