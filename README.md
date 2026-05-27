# Awesome Coding Agents

> **This is a very opinionated list from my daily usage. I will try to keep 🔥 entries below 10 (or 20, if I can't 😉).**

> See [AGENTS.md](./AGENTS.md) for contribution guidelines when adding entries.

GitHub Pages is generated directly from the catalog tables in this README plus deployment-time GitHub activity metrics.

## Legend

| Icon | Meaning |
|------|---------|
| 🔥 | Long-term daily driver — proven, highly recommended |
| 🧪 | Actively trying out, but not daily used |
| 👀 | Recently discovered, looks promising, not yet tried |

---

## CLI Agents

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 🔥 | oh-my-pi | https://github.com/can1357/oh-my-pi | hash-edits, lsp, browser, subagents | AI coding agent for the terminal — hash-anchored edits, optimized tool harness, LSP, Python, browser, subagents, and more |
| 🧪 | Claude Code | https://github.com/anthropics/claude-code | terminal, codebase, git-workflows | Agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows — all through natural language commands |
| 🧪 | Codex CLI | https://github.com/openai/codex | lightweight, terminal, cli | Lightweight coding agent that runs in your terminal |

## CLI Agent Helpers

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 🔥 | sandboxed-agents | https://github.com/kailiu42/sandboxed-agents | bwrap, sandbox, profiles | Unified bwrap sandbox wrapper for multiple coding agents — oh-my-pi, Claude Code, Codex — with per-agent profiles and layered config |
| 👀 | forkd | https://github.com/deeplethe/forkd | microvm, fan-out, snapshots | MicroVM sandbox runtime for AI agent fan-out — fork 100 microVMs in ~100ms, BRANCH a live VM in ~150ms, KVM-isolated snapshot CoW |

## Token Savers

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 🧪 | rtk | https://github.com/rtk-ai/rtk | token-saving, proxy, rust | CLI proxy that reduces LLM token consumption by 60-90% on common dev commands — single Rust binary, zero dependencies |

## Subscription Management

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 🧪 | OpenUsage | https://github.com/robinebers/openusage | subscriptions, usage, dashboard | Track all your AI coding subscriptions in one place |

---

## Local commands

```sh
make build
make run
make deploy
```

- `make build` writes `dist/index.html`.
- `make run` serves the generated site locally on port `8080`.
- `make deploy` validates, tests, and builds the Pages artifact.
- `npm run validate:catalog` validates the README catalog tables.

## Catalog notes

Catalog entries live directly in README tables with five columns: Status, Tool, Repo, Tags, Description. Any `##` section with that exact table header is treated as a category.

GitHub metrics are fetched at build time and are never committed back into README. Tags should highlight distinguishing traits, such as `microvm`, `sandbox`, `token-saving`, `browser`, or `subagents`.

To add or update entries with an agent, use `.agents/skills/add-tool/SKILL.md`; Claude-compatible setups can use `.claude/skills/add-tool`.
