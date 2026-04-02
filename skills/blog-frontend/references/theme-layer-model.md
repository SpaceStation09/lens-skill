# Theme Layer Model

## 目标

定义主题层在官方 baseline 中承担什么职责，以及它如何与 starter shell 配合。

## 主题层职责

主题层负责：

1. 视觉风格。
2. 页面渲染模板。
3. 表现型组件皮肤。
4. typography、spacing、color、surface 等视觉令牌。

主题层不负责：

1. 路由。
2. provider。
3. 权限判定。
4. Lens 数据读取与写入。
5. 与 `lens-interaction` 的 contract adapter。

## 与 starter shell 的关系

1. 结构层负责数据与页面状态。
2. 主题层负责渲染这些状态。
3. 定制优先通过替换模板、表现组件和样式完成。
4. 不要在主题层混入协议调用与结构层判断。

## 当前阶段

在没有 Figma 设计稿前：

1. 先保留默认主题的源码落点与接口边界。
2. 不提前做复杂视觉系统设计。
3. 先保证 theme 可以承接 auth、profile、post、compose 四类页面模板。
