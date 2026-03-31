# Theme Default Integration

本 skill 只提供 `theme-default` 源码资产。
在默认模式下，theme 仅负责 UI；功能层来自 starter 内核。

## 资产来源

- `assets/theme-default/index.tsx`
- `assets/theme-default/styles.css`

## 落地位置

- `components/blog/theme-default/index.tsx`
- `components/blog/theme-default/styles.css`

## 规则

1. theme 只消费宿主层传入数据和动作
2. theme 不直接调用 `LensService` 或 Lens SDK
3. theme 可以改视觉，不改变权限判定来源
4. theme contract 以 `references/theme-contract.md` 为准

## 最小接入步骤

1. 复制以下文件到目标项目：
   - `skills/blog-frontend/assets/theme-default/index.tsx`
   - `skills/blog-frontend/assets/theme-default/styles.css`
2. 落地到目标路径：
   - `components/blog/theme-default/index.tsx`
   - `components/blog/theme-default/styles.css`
3. 在宿主页面或壳组件中引入样式：`import \"./styles.css\"`
4. 通过 `<DefaultTheme ctx={ctx} />` 渲染主题

## 最小渲染示例

```tsx
import { DefaultTheme } from "@/components/blog/theme-default";
import "@/components/blog/theme-default/styles.css";

export function BlogScreen(props: { ctx: any }) {
  return <DefaultTheme ctx={props.ctx} />;
}
```

## `ctx` 最小必填字段

至少保证以下字段可用：

1. `route`
2. `accountState`
3. `isAuthenticated`
4. `isOwnerView`
5. `navigate`
6. `activeHandle`
7. `connectWalletNode`
8. `accounts`
9. `selectedAccount`
10. `loginSelectedAccount`
11. `createUsername`
12. `setCreateUsername`
13. `canCreateUsername`
14. `createLensAccount`
15. `isCheckingUsername`
16. `isCreatingAccount`
17. `usernameCheckMessage`
18. `profile`
19. `pagePosts`
20. `activePost`
21. `publishDraft`
