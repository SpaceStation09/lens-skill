# Pipeline Checkpoints

本文件定义 `lens-blog-builder` 的编排检查点，而不是底层实现门禁。

## Checkpoint 1: Path Confirmed

通过条件：

1. 已确认 Lens 环境。
2. 已确认 Lens app 方案。
3. 已确认钱包方案。
4. 已确认是否接受默认 frontend baseline。
5. 已确认当前工作落在新项目还是已有项目。

## Checkpoint 2: Workstream Selected

通过条件：

1. 已判断当前工作重点更偏 `lens-interaction`、`blog-frontend`，还是两者联动。
2. 若为高自由定制路径，已明确这是偏离官方 baseline 的实现。
3. 若已有 Figma 或明确视觉参考，已决定是否把 theme 定制纳入当前范围。

## Checkpoint 3: Structured Summary Ready

通过条件：

1. 已输出结构化需求摘要。
2. 已明确当前阶段只做什么。
3. 已列出尚未确认、但会影响下一步的风险或缺失输入。
4. 已明确下一步要调用哪个子 skill。

## Checkpoint 4: Handoff Ready

通过条件：

1. 传递给子 skill 的输入已经足够具体。
2. 未把实现细节继续留在 builder 自己手里。
3. 当前阶段的下一步执行动作清晰可执行。
