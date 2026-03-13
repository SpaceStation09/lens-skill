# Mapping Rules

本文件定义 Lens 响应到前端视图模型的映射规则。

## Profile 映射

1. `handle` 输出应去掉 `@` 前缀并归一化
2. `displayName` 缺失时回退到 `handle` 或短地址
3. `bio` 缺失时使用空字符串
4. `avatarUrl` 缺失时返回 `undefined`（由宿主层决定 identicon 展示）
5. `followers` / `following` 缺失时返回 `undefined`

## Post 映射

1. `title` 缺失时给出可读默认值（如 `Untitled`）
2. `excerpt` 必须在交互层生成，不在 theme 临时计算
3. `tags` 缺失时回退为空数组
4. `content` 缺失时回退为空字符串
5. `createdAt` 统一为可序列化字符串

## 输入归一化

1. handle 输入前先去掉 `@`
2. address 统一大小写策略（建议 checksum 或 lowercased 一致策略）
3. 空白 title/content 在 `publishPost` 前先校验并返回 `INVALID_INPUT`
