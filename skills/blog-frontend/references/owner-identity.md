# Owner Identity

owner 判定必须稳定、可复用、可测试。

## 权威字段

1. 权威字段是 address，不是 handle
2. 使用 `activeAccountAddress` 对比当前 profile `address`

## 判定公式

```ts
isOwnerView =
  accountState === "authenticated" &&
  normalizeAddress(activeAccountAddress) === normalizeAddress(profile.address)
```

## 为什么不用 handle 作为权威

1. handle 可能发生变更
2. handle 存在展示形态差异（是否带 `@`、大小写、归一化策略）
3. address 对身份判定更稳定

## 回退规则

1. profile 未加载完成：`isOwnerView = false`
2. `activeAccountAddress` 缺失：`isOwnerView = false`
3. 任何异常：`isOwnerView = false`

## 使用建议

1. 在 `lib/blog/guards/owner.ts` 实现单一函数
2. 页面和 theme 只消费 `isOwnerView` 结果，不重复计算
