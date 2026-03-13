# Theme Default Integration

本 skill 只提供 `theme-default` 源码资产。

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
