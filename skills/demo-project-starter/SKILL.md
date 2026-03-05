---
name: demo-project-starter
description: Helps build a runnable demo project quickly with minimal scope and clear acceptance checks. Use when the user asks to create a prototype, POC, or demo app in the current workspace.
---

# Demo Project Starter

Use this skill when the user wants to quickly build a working demo project in the workspace.

## Goal

Deliver a runnable demo with:
- a narrow, testable feature scope
- standard project scripts (`dev`, `build`, `test` when applicable)
- a short runbook and acceptance checklist

## Workflow

1. Clarify the demo target in one sentence.
2. Choose the lightest stack that can satisfy the target.
3. Scaffold only what is necessary for the requested demo.
4. Implement vertical slice first (happy path end-to-end).
5. Run lint/tests/build or the closest local validation available.
6. Report what was created, how to run it, and known limitations.

## Stack Selection Rules

- Prefer existing repo stack and conventions if present.
- If no constraints are given:
  - Web UI demo: `Vite + React + TypeScript`
  - API demo: `Node.js + Fastify + TypeScript`
  - Script/automation demo: `Python 3` with minimal dependencies
- Avoid heavy infra (k8s, microservices, complex CI) unless explicitly requested.

## Implementation Rules

- Keep architecture simple: 1 app, 1 clear entry point, minimal folders.
- Use realistic fake data before adding external integrations.
- Add environment variables only when needed and provide `.env.example`.
- Include only essential dependencies.
- Prefer deterministic local commands and avoid network-coupled steps unless required.

## Required Output Checklist

Before finishing, ensure:
- Project starts locally with one command (or clearly documented two-step command).
- Main user flow is demonstrable.
- README includes:
  - purpose of the demo
  - setup commands
  - run commands
  - test/validation commands
  - known limitations / next steps

## Response Template

When reporting completion, include:

1. What was built (scope).
2. Key files changed.
3. Run and validation commands.
4. Known gaps and fastest next iteration.
