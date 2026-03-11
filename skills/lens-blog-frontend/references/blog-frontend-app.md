# BlogFrontendApp

`BlogFrontendApp` 是博客产品壳的 runtime 入口。

## 目的

它负责连接：

1. 宿主应用输入，例如钱包连接状态和初始路由
2. 本地 blog adapter
3. 当前选中的 theme

## 必须承担的职责

`BlogFrontendApp` 必须：

1. 解析或接收 route state
2. 维护账户状态流转
3. 通过 adapter 触发 profile / post / feed 加载
4. 持有 draft editor 状态
5. 执行写作路由权限控制
6. 组装唯一的 `ThemeRenderContext`

## 禁止承担的职责

`BlogFrontendApp` 不能：

1. 直接调用 Lens SDK API
2. 解析环境变量
3. 初始化钱包 providers
4. 内含 theme 专属视觉假设

## 参考实现模式

优先采用以下模式：

```tsx
type BlogFrontendAppProps = {
  adapter: BlogAdapter;
  theme: BlogTheme;
  initialRoute?: RouteState;
  walletAddress?: string;
  isWalletConnected: boolean;
  connectWalletNode?: JSX.Element;
};

export function BlogFrontendApp(props: BlogFrontendAppProps) {
  const route = useBlogRoute(props.initialRoute);
  const auth = useBlogAuth(props.adapter, props.walletAddress, props.isWalletConnected);
  const data = useBlogData(props.adapter, route, auth);
  const editor = useBlogEditor(props.adapter, auth, data);
  const ctx = buildThemeRenderContext({ route, auth, data, editor, props });

  return props.theme.renderRoute(ctx);
}
```

具体文件拆分可以变化，但 runtime 应保留这个结构：

1. Router 关注点和数据获取关注点分离
2. Auth 关注点和 theme 渲染分离
3. 最终只向 theme 层交付一个组装好的 context
