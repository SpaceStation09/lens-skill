# Host Architecture

前端必须以 Next.js 宿主层为中心。

## 分层职责

1. 宿主层（app）
   - 路由
   - 页面入口与页面壳
2. theme-default
   - UI 组件与视觉表达
3. LensService（来自 lens-interaction）
   - 数据读取与写入
4. 业务逻辑层（lib/blog）
   - provider 状态机
   - service 调用
   - guard 权限判定

## 强约束

1. 页面不得直接调用 SDK
2. theme 不得实现账户状态机
3. 权限判定逻辑放在 `lib/blog/guards`，由宿主层调用
4. `app/` 保持简洁，不堆叠业务状态与服务实现
