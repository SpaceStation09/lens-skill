## Skills
本仓库用于维护 skills。可用 skills 如下：

- skill-creator: 创建或更新 skill 的指南。 (file: $CODEX_HOME/skills/.system/skill-creator/SKILL.md)
- skill-installer: 安装 Codex skills 的指南。 (file: $CODEX_HOME/skills/.system/skill-installer/SKILL.md)
- blog-frontend: 搭建基于 Next.js 的博客前端宿主层（最小 starter 内核 + 可替换 theme）。 (file: ./skills/blog-frontend/SKILL.md)
- lens-interaction: 实现 Lens 交互层（登录、读取、发布、session）。 (file: ./skills/lens-interaction/SKILL.md)
- lens-blog-builder: 从 0 到 1 编排 Lens 个人博客建设流程（访谈 + 流水线 + 联调交付）。 (file: ./skills/lens-blog-builder/SKILL.md)

## 触发规则（极简）
- 若用户明确点名某个 skill，或任务与某个 skill 描述明显匹配，则本轮必须使用该 skill。
- 若同时匹配多个 skill，使用能覆盖需求的最小集合。
- 若 skill 缺失或路径不可读，简要说明并采用可行替代方案继续执行。
