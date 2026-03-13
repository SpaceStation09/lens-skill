# Page Specs

## Landing

1. 展示 connect wallet
2. 钱包已连接时展示 Lens 登录入口

## Profile (`/:handle`)

1. 展示 profile 基础信息和 post 列表
2. owner 视角显示写作入口
3. non-owner 视角隐藏 owner 动作

## Owner 判定

owner 判定统一以 [owner-identity.md](owner-identity.md) 为准，本文件不重复定义公式。

## Post Detail (`/p/:postId`)

1. 拉取并展示单篇 post
2. 不存在时展示 not found

## Write (`/write`)

1. owner 可编辑并提交 `publishPost`
2. non-owner 仅展示 gate，不执行 publish
