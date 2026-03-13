---
name: blog-frontend
description: 指导 agent 从零搭建基于 Next.js 的博客前端宿主层：保持 app 路由层简洁，将状态机与服务逻辑放入 lib，并使用 components 下的 theme-default 源码完成页面渲染。
---

# Blog Frontend

本 skill 定义一套最小可落地的博客前端实现方式。目标是工程可用与行为一致，不追求复杂抽象。

## 范围

本 skill 负责：

1. Next.js 宿主层路由
2. 全局账户状态机 provider（实现在 `lib`，由 `app` 引入）
3. landing / profile / post detail / write 四类页面行为
4. 与 `lens-interaction` 的服务接线
5. `theme-default` 源码资产接入

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
```

规则：

1. 除非用户明确要求，不额外引入 `src/` 平行目录
2. `app/` 只放路由入口和页面壳，保持干净
3. provider 状态机与 service 逻辑放在 `lib/blog/`
4. theme-default 放在 `components/blog/theme-default/`

## 代码分发策略

1. 仅分发 `assets/theme-default/*`
2. provider/page/service 实现只给规范，不提供模板源码
3. 不分发其他 theme 资产

## 默认钱包栈

默认钱包方案固定为：

1. `ConnectKit`（钱包连接 UI）
2. `wagmi`（钱包与连接器状态）
3. `viem`（链与签名底层能力）

规则：

1. 无明确要求时，不替换为其他钱包 UI 库
2. 钱包连接体验（钱包列表、推荐顺序、连接弹窗）由 `ConnectKit` 负责
3. 宿主层只消费“是否已连接 + 当前钱包地址 + 签名能力”

## 必读 references（顺序）

1. [references/host-architecture.md](references/host-architecture.md)
2. [references/provider-state-machine.md](references/provider-state-machine.md)
3. [references/routes-and-guards.md](references/routes-and-guards.md)
4. [references/page-specs.md](references/page-specs.md)
5. [references/owner-identity.md](references/owner-identity.md)
6. [references/lens-service-integration.md](references/lens-service-integration.md)
7. [references/theme-default-integration.md](references/theme-default-integration.md)

## 落地顺序

1. 先实现 provider（状态机 + 启动恢复）
2. 再实现四条路由页面
3. 再把页面接到 `LensService`
4. 最后接入 `theme-default` 渲染

不要先做抽象 runtime，再反推页面。

## 最小验收

1. landing 提供 connect wallet 与 Lens 登录入口
2. `/:handle` 公开可读，并区分 owner / non-owner
3. `/p/:postId` 公开可读
4. `/write` 非 owner 不可发布，owner 可发布
5. owner 判定以 address 为权威，不依赖 handle 文本完全匹配
6. 会话恢复失败后状态回退与 `lens-interaction` 一致
7. theme 不直接调用 Lens SDK

## 交付报告要求（双层）

应用本 skill 后，agent 应输出两层交付信息：

1. 对话内只输出“通用业务报告”（面向非技术用户）
2. 技术附录写入项目文档文件，不在对话中展开细节

### A. 通用业务报告（对话内）

按以下结构汇报：

1. 这次完成了什么（1-2 句话）
2. 现在可以怎么用（3-5 条）
3. 哪些场景已经覆盖（owner / non-owner、登录态、可读可写）
4. 还没完成什么（明确列项）
5. 下一步建议（最多 3 条）

### B. 技术附录（写入文档）

默认写入路径：

- `docs/reports/blog-frontend-technical-report.md`

技术附录至少包含：

1. 路由与页面落地清单（`/`、`/:handle`、`/p/:postId`、`/write`）
2. provider 状态机与 guard 行为摘要
3. 与 `lens-interaction` 的接线情况
4. 已知限制与技术风险

对话中只需提示“技术附录已写入该路径”，不要展开整段技术细节。
