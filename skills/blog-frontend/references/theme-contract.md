# Theme Contract

theme 是可替换壳层，只负责展示和交互触发，不负责权限和协议。

## 输入契约

theme 必须通过 `ctx` 接收以下字段：

1. 路由与状态：`route`, `accountState`, `isAuthenticated`, `isOwnerView`
2. 导航与账号：`navigate`, `activeHandle`, `accounts`, `selectedAccount`
3. 认证动作：`connectWalletNode`, `loginSelectedAccount`, `createLensAccount`
4. 创建流程：`createUsername`, `setCreateUsername`, `canCreateUsername`
5. 数据展示：`profile`, `pagePosts`, `activePost`
6. 发布动作：`publishDraft`

## 禁止事项

1. 不直接调用 `LensService`。
2. 不直接调用 Lens SDK。
3. 不在 theme 内判断 owner 权限来源。

## 可变更范围

1. 布局、样式、动效、文案。
2. 组件拆分方式。
3. 交互细节（前提是不改变 contract 含义）。
