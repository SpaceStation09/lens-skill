# Data Contract

本文件定义 `BlogFrontendApp` 和 theme 层依赖的最小前端 contract。

## 账户状态机

`AccountState` 只能有三个值：

1. `disconnected`
2. `connected_unauthed`
3. `authenticated`

必须支持以下流转：

1. 当钱包连接可用时，`disconnected -> connected_unauthed`
2. Lens account 登录成功后，`connected_unauthed -> authenticated`
3. 当钱包 / session 丢失或显式重置时，`authenticated -> disconnected`

## 路由状态

runtime 应建模这些路由：

```ts
type RouteState =
  | { name: "home" }
  | { name: "profile"; handle: string }
  | { name: "write" }
  | { name: "post"; postId: string };
```

规则：

1. handle 应归一化，并去掉 `@`。
2. `postId` 应保留来源标识符的原始形态。
3. 路由解析属于 `core`，不属于 theme 代码。

## Core View Models

### `WalletAccountOption`

```ts
type WalletAccountOption = {
  address: string;
  handle?: string;
  displayName?: string;
};
```

### `ProfileView`

```ts
type ProfileView = {
  address: string;
  handle: string;
  displayName: string;
  bio: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
};
```

### `PostView`

```ts
type PostView = {
  id: string;
  createdAt: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  authorAddress: string;
  contentUri?: string;
};
```

规则：

1. `excerpt` 必须在 render 前生成，不能在 theme 内动态计算。
2. `tags` 应在 metadata 可用时从 metadata 获取。
3. 可选字段缺失时，UI 必须平滑降级。

## 权限 Contract

```ts
type ViewPermission = {
  isAuthenticated: boolean;
  activeHandle: string;
  isOwnerView: boolean;
};
```

规则：

1. 只有当 `accountState === "authenticated"` 时，`isAuthenticated` 才为 true。
2. 只有在已认证且 `activeHandle` 与当前 profile handle 归一化后一致时，`isOwnerView` 才为 true。
3. `/write` 访问控制必须由 runtime 执行；theme 可以决定动作是否展示，但不能成为权限判断的权威来源。

## Theme Selection Contract

theme 选择应由配置驱动，并在 runtime render 前决定：

```ts
type ThemeConfig = {
  themeId?: "default" | "neo";
};
```

规则：

1. theme id 缺失或非法时，回退到 `default`。
2. 默认不要求提供运行时 theme 切换 UI。
3. theme 选择不能改变路由、权限或 adapter 行为。
