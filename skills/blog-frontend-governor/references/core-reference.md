# Core Reference

本文件描述 `core` 层应如何组织。它不是要求 agent 逐文件复制参考代码，而是要求 agent 实现同等职责边界。

## 目标

`core` 的目标是承载博客前端 runtime，而不是承载协议接入细节。

它应回答：

1. 当前路由是什么
2. 当前账户状态是什么
3. 当前页面需要哪些 view models
4. 当前 theme 可以做哪些动作

## 推荐拆分

推荐把 `core` 拆成以下几部分：

1. `contracts/`
   - `RouteState`
   - `AccountState`
   - `ProfileView`
   - `PostView`
   - `WalletAccountOption`
2. `router/`
   - 路由解析
   - 路由跳转
   - 地址栏同步
3. `runtime/`
   - 账户状态流转
   - profile / post / feed 加载
   - editor 状态
   - publish 触发
   - `ThemeRenderContext` 组装

## BlogFrontendApp 内部结构

`BlogFrontendApp` 可以作为对外唯一入口，但内部不应继续膨胀成单文件总控。

推荐形态：

```tsx
export function BlogFrontendApp(props: BlogFrontendAppProps) {
  const route = useBlogRoute(props.initialRoute);
  const auth = useBlogAuth(props.adapter, props.walletAddress, props.isWalletConnected);
  const data = useBlogData(props.adapter, route, auth);
  const editor = useBlogEditor(props.adapter, auth, data);
  const ctx = buildThemeRenderContext({ route, auth, data, editor, props });

  return props.theme.renderRoute(ctx);
}
```

## 必须保持的边界

1. `core` 不能直接调用 Lens SDK。
2. `core` 不能读取 env。
3. `core` 不能持有 theme 专属样式或布局。
4. `core` 必须通过 adapter 消费数据。
5. `core` 必须是权限判断的权威来源，而不是 theme。

## 可接受的实现自由度

以下部分允许因项目而变化：

1. hooks 是否拆分为多个文件
2. route state 的具体同步方式
3. loading / status 字段的内部命名
4. 搜索与分页的具体数据结构

以下部分不应变化：

1. `BlogFrontendApp` 作为 runtime 入口的角色
2. `ThemeRenderContext` 作为 theme 唯一主要输入
3. owner / viewer / write 权限控制的归属
