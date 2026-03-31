---
name: blog-frontend
description: 指导 agent 以最小骨架源码 + 可替换 theme 的方式搭建基于 Next.js 的 Lens 博客前端。默认先复制稳定功能内核（provider/guards/service contract），再在 theme 层完成 UI 美化。
---

# Blog Frontend

本 skill 定义一套最小可落地的博客前端实现方式。目标是工程可用与行为一致，不追求复杂抽象。

## 范围

本 skill 负责：

1. Next.js 宿主层路由
2. 全局账户状态机 provider（实现在 `lib`，由 `app` 引入）
3. landing / profile / post detail / write 四类页面行为（含无账号创建流程）
4. 与 `lens-interaction` 的服务接线
5. 分发最小功能骨架源码（starter kernel）
6. `theme-default` 源码资产接入

本 skill 不负责：

1. Lens SDK 实现细节
2. Lens session 底层存储与认证实现
3. 自定义多主题系统

## 架构（从你的方案直接落地）

1. 宿主层（Next.js）
   - 管路由
   - 管账户状态机
   - 决定页面权限和可操作性
2. View 层（theme）
   - 提供可复用 UI 组件与渲染
   - 不做协议调用和权限判定
3. 数据层（Lens）
   - 通过 `lens-interaction` 暴露的 `LensService` 完成读写

## 账户状态机

固定三态：

1. `disconnected`
2. `wallet_connected_unauthed`
3. `authenticated`

页面展示和动作可用性必须由这三态统一驱动。

## 最小目录（Next.js 优先）

```txt
app/
  providers.tsx
  page.tsx
  [handle]/page.tsx
  p/[postId]/page.tsx
  write/page.tsx
lib/
  blog/
    provider/
      state.ts
      actions.ts
    services/
      lens-service.ts
    guards/
      owner.ts
components/
  blog/
    theme-default/
      index.tsx
      styles.css
assets/
  starter/
    lib/blog/
      provider/state.tsx
      services/lens-service.ts
      guards/owner.ts
      types.ts
```

规则：

1. 除非用户明确要求，不额外引入 `src/` 平行目录
2. `app/` 只放路由入口和页面壳，保持干净
3. provider 状态机与 service 逻辑放在 `lib/blog/`
4. theme-default 放在 `components/blog/theme-default/`

## 代码分发策略（最小混用）

1. 分发一套稳定功能内核：`assets/starter/lib/blog/*`
2. 分发一套可替换主题示例：`assets/theme-default/*`
3. 默认不分发多套功能模板，不分发多主题资产
4. 默认先复制 starter 内核，再接 `LensService` 真实现，最后调整 theme 视觉

## 默认改动边界

1. 默认只允许改 `components/blog/theme-*` 和样式文件
2. 修改 `lib/blog/provider`、`lib/blog/services`、`lib/blog/guards` 前，需先说明原因
3. 不允许在 theme 中增加协议调用与权限判定

## 默认钱包方案

默认使用 `Privy` 作为钱包连接与认证入口。

规则：

1. 宿主层只消费“是否已连接 + 当前钱包地址 + 签名能力”
2. 钱包连接体验（钱包列表、登录方式、连接弹窗）由 `Privy` 负责
3. `wagmi` / `viem` 可按项目实现需要引入，不作为强制前置

## 按阶段读取 references

### Phase A：复制功能内核前

触发条件：开始搭建宿主层骨架或准备复制 starter 内核。

1. [references/host-architecture.md](references/host-architecture.md)
2. [references/starter-kernel-integration.md](references/starter-kernel-integration.md)

### Phase B：状态机与路由落地

触发条件：开始实现 provider、路由守卫和页面行为。

1. [references/provider-state-machine.md](references/provider-state-machine.md)
2. [references/routes-and-guards.md](references/routes-and-guards.md)
3. [references/page-specs.md](references/page-specs.md)
4. [references/owner-identity.md](references/owner-identity.md)

### Phase C：接入服务层

触发条件：页面要接真实数据与写入动作时。

1. [references/lens-service-integration.md](references/lens-service-integration.md)

### Phase D：主题接入与美化

触发条件：功能路径跑通后，开始接入或改造 theme。

1. [references/theme-contract.md](references/theme-contract.md)
2. [references/theme-default-integration.md](references/theme-default-integration.md)

不要在项目开始时一次性加载全部 references。

## 落地顺序

1. 先复制 starter 内核到目标项目
2. 再实现或接入 `LensService` 真正交互层
3. 再实现四条路由页面并完成接线
4. 最后接入 `theme-default`，只在 theme 层做 UI 美化

不要先做抽象 runtime，再反推页面。

## 最小验收

1. landing 提供 connect wallet、Lens 登录与无账号创建入口
2. `/:handle` 公开可读，并区分 owner / non-owner
3. `/p/:postId` 公开可读
4. `/write` 非 owner 不可发布，owner 可发布
5. owner 判定以 address 为权威，不依赖 handle 文本完全匹配
6. 会话恢复失败后状态回退与 `lens-interaction` 一致
7. 钱包已连接但无 Lens 账号时，可在前端完成 username 校验与创建
8. 在 `/` 上登录成功、创建成功或恢复成功后，自动跳转到当前 Lens 账号的 `/:handle`
9. theme 不直接调用 Lens SDK
10. 未明确说明时，功能层文件不做结构性改造

## 交付说明

应用本 skill 后，agent 应按当前会话要求汇报结果；若用户未指定格式，优先简洁说明“已完成项、未完成项、风险与下一步”。
