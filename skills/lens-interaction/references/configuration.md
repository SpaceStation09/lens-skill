# Configuration

## Purpose

本文件定义 `lens-interaction` 的运行时配置前提。

目标：

1. 让实现者明确 Lens 交互层依赖哪些配置。
2. 让上游前端知道哪些配置语义已经被定义。
3. 避免各个 skill 各自发明一套 Lens 配置名词。

## Required Runtime Configuration

当前至少明确以下配置语义：

1. `environment`
   - 取值为 `mainnet` 或 `testnet`
   - 用于决定 Lens client 连接到哪个环境
2. `appAddress`
   - end-user 登录路径所需的 Lens app 地址上下文
3. `storage`
   - session 的存储策略
   - 浏览器前端默认使用 `window.localStorage`

## Configuration Rules

1. `environment` 必须显式确定，不依赖隐式推断。
2. end-user 登录路径需要 `appAddress`。
3. 若用户未提供 `appAddress`，可采用官方 test app 地址作为默认值，但来源必须以官方文档为准，不在 skill 内硬编码。
4. 浏览器场景默认采用可恢复 session 的存储策略。
5. 关键配置缺失时应 fail fast，而不是静默降级。

## Exposure Boundary

1. `environment` 可作为公开运行时配置暴露给前端。
2. `appAddress` 对浏览器前端来说通常也是可公开的运行时配置。
3. 若未来出现私密凭据，不应通过前端公开配置直接透出。
4. 上游前端应只消费本文件已明确的 Lens 配置语义。

## Frontend Integration Note

1. `blog-frontend` 不应自行定义 Lens 配置语义。
2. 若前端需要环境变量模板，应以本文件定义的配置项为依据。
3. 在 `lens-interaction` 尚未明确 env 命名之前，上游前端可以记录“需要这些运行时配置”，但不要先发明变量名。
