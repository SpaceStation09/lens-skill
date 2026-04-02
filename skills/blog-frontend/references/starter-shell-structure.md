# Starter Shell Structure

## 目标

`starter-shell` 是官方结构层载体。

它应保持轻量，但必须是一个可运行的最小宿主层，而不是抽象说明文档。

## 推荐目录

```txt
assets/starter-shell/
  app/
  components/
    shell/
  features/
    auth/
    profile/
    post/
    compose/
  lib/
    lens/
    utils/
  providers/
  styles/
  docs/
```

## 各目录职责

### `app/`

放 Next.js 路由、layout、页面入口、`loading` / `error` / `not-found` 等路由级文件。

### `components/shell/`

只放通用结构组件，例如：

1. `AppLayout`
2. `PageContainer`
3. `LoadingState`
4. `EmptyState`
5. `ErrorState`

### `features/`

按业务域拆分：

1. `auth/`
2. `profile/`
3. `post/`
4. `compose/`

每个 feature 负责自己的 page shell、局部组件与页面状态组织。

### `lib/lens/`

只放与 `lens-interaction` 对接相关的轻量工具，例如：

1. contract 类型引用
2. 读写 wrapper
3. 简单 view model mapper

### `lib/utils/`

放与业务无关的工具，例如：

1. 时间格式化
2. 地址缩写
3. identity fallback
4. markdown 辅助

### `providers/`

建议至少包括：

1. `AppProvider`
2. `WalletProvider`
3. `LensAuthProvider`
4. `ThemeProvider`

## 默认页面

至少包括：

1. `/`
2. `/auth`
3. `/profile/[handle]`
4. `/post/[postId]`
5. `/compose`

## 环境变量

`starter-shell` 应附带环境变量模板，例如 `.env.example`。

至少应包括：

1. `NEXT_PUBLIC_PRIVY_APP_ID`

原则：

1. 钱包接入相关 env 在 `starter-shell` 中定义模板。
2. Lens 运行时配置语义以 `lens-interaction/references/configuration.md` 为准。
3. 在 `lens-interaction` 形成明确 env 命名之前，不在本 skill 中提前发明变量名。
