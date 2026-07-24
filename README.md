# Awesome Coding Agents

> **This is a very opinionated list from my daily usage. I will try to keep 🔥 entries below 10 (or 20, if I can't 😉).**

> See [AGENTS.md](./AGENTS.md) for contribution guidelines when adding entries.

[Visit the web page version here](https://kailiu42.github.io/awesome-coding-agents/). It is generated directly from the catalog tables in this README plus deployment-time GitHub activity metrics.

## Legend

| Icon | Meaning |
|------|---------|
| 🔥 | Long-term daily driver — proven, highly recommended |
| 🧪 | Actively trying out, but not daily used |
| 👀 | Recently discovered, looks promising, not yet tried |

---

## CLI Agents

| Status | Tool | Tags | Description |
|---|---|---|---|
| 🔥 | [oh-my-pi](https://github.com/can1357/oh-my-pi) | hash-edits, lsp, browser, subagents | AI coding agent for the terminal — hash-anchored edits, optimized tool harness, LSP, Python, browser, subagents, and more |
| 🧪 | [Claude Code](https://github.com/anthropics/claude-code) | terminal, codebase, git-workflows | Agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows — all through natural language commands |
| 🧪 | [Codex CLI](https://github.com/openai/codex) | lightweight, terminal, cli | Lightweight coding agent that runs in your terminal |

## CLI Agent Helpers

| Status | Tool | Tags | Description |
|---|---|---|---|
| 🔥 | [sandboxed-agents](https://github.com/kailiu42/sandboxed-agents) | bwrap, sandbox, profiles | Unified bwrap sandbox wrapper for multiple coding agents — oh-my-pi, Claude Code, Codex — with per-agent profiles and layered config |
| 👀 | [codex-profiles](https://github.com/Ducksss/codex-profiles) | codex, profiles, account-switching | Codex CLI/Desktop profile switcher that launches Codex with isolated CODEX_HOME directories for separate auth, config, sessions, plugins, and logs |
| 👀 | [codex-fixes](https://github.com/zhuhaow/codex-fixes) | codex, fixes, issue-registry | Checks your local Codex install for known issues and runs the matching community-maintained fix scripts |
| 👀 | [Ariadne Loop](https://github.com/zhangzeyu99-web/ariadne-loop) | loop-engineering, verification, agent-packets | Local-first CLI and templates for turning rough coding-agent context into verifiable loop specs, agent packets, verifier gates, stop rules, rollback rules, and JSON reports |
| 👀 | [py_ralph_frame](https://github.com/rxdt/py_ralph_frame) | loop-engineering, verification, agent-loops | A lightweight spec-driven loop harness for Claude Code, Codex, and Gemini CLI. Fresh-context runs, specs, commits, and gates to get you and your agents productive immediately. |
| 👀 | [forkd](https://github.com/deeplethe/forkd) | microvm, fan-out, snapshots | MicroVM sandbox runtime for AI agent fan-out — fork 100 microVMs in ~100ms, BRANCH a live VM in ~150ms, KVM-isolated snapshot CoW |
| 👀 | [Agent Teams](https://github.com/777genius/agent-teams-ai) | desktop, orchestration, kanban, review | You're the boss, agents are your team. They handle tasks on their own, message each other, and review each other's work. You just watch the kanban board and give high-level commands. Codex/Claude/OpenCode(200+ models, 75+ LLM providers, free models no auth). Build your AI company with multiple teams. |
| 👀 | [Hephaestus](https://github.com/agentlas-ai/Hephaestus) | agent-os, routing, skills, memory | Open Agent OS for Claude Code, Codex, and Cursor with meta-agent building, A2A Hub routing, local ontology, and governed memory/security gates |
| 👀 | [Tree Ring Memory](https://github.com/TerminallyLazy/Tree-Ring-Memory) | memory, local-first, sqlite, tui | Framework-agnostic, local-first memory lifecycle for AI agents: Rust CLI, SQLite/FTS recall, forgetting, audit, consolidation, DOX/Revolve adapters, and TUI. |
| 👀 | [Oh My Hermes](https://github.com/rlaope/oh-my-hermes) | hermes, skills, workflows | Workflow skill pack for Hermes Agent that adds research, planning, coding handoff, review, QA, documentation, and long-running loop workflows |
| 👀 | [Agent Island](https://github.com/tristan666666/agent-island) | macos, windows, status, local-first | Open-source status companion for Claude Code and Codex with live session state, your-turn alerts, and local monitoring |
| 👀 | [RDLeader](https://github.com/happysnaker/RDLeader) | agent-ops, control-plane, approvals, qa-evidence | Local-first control plane for supervising AI R&D workers — task ownership, runtime dispatch, result collection, approval gates, public-safe demo reset, and QA evidence |
| 👀 | [OpenAgentRelay](https://github.com/ShakespeareLabs/open-agent-relay) | trusted-lan, delegation, json, local-first | Turn any local agent or automation into a team-callable capability. |
| 👀 | [breaking-coding-chaos](https://github.com/bo-cao/breaking-coding-chaos) | control-plane, skills, human-in-the-loop | Human-in-the-loop dual-loop skill suite for coding agents: throughline progress on disk, plan-spar alignment, then minimal clean-cut implement |
| 👀 | [Agent-Ready Repo Auditor](https://github.com/wrightops-ai/agent-ready-repo-auditor) | repository-audit, agent-readiness, github-actions | Free GitHub Action that scores public repositories for Codex, Claude Code, Copilot, and Cursor readiness—without cloning or executing code. |
| 👀 | [Better Agent](https://github.com/ofekron/better-agent) | orchestration, dashboard, approvals, multi-provider | Local web workspace for coding agents — Claude, Codex, Gemini, and more in one inspectable, LAN-ready hub. |
| 👀 | [Claudexor](https://github.com/razzant/claudexor) | control-plane, multi-harness, best-of-n, review | Local-first control plane for AI coding harnesses (Codex, Claude Code, Cursor, OpenCode): best-of-N runs, multi-model review, evidence-driven delivery |
| 👀 | [fractal](https://github.com/plasma-ai/fractal) | orchestration, recursive-delegation, git-worktrees, tui | Hierarchical agent loops with recursive self-organization. |


## Agent Instructions

| Status | Tool | Tags | Description |
|---|---|---|---|
| 🔥 | [coding-agent-instructions](https://github.com/kailiu42/coding-agent-instructions) | instructions, rules, progressive-disclosure | Rules for coding agents. Modular design, progressive disclosure without eating your context window or distract your agents |

## Token Savers

| Status | Tool | Tags | Description |
|---|---|---|---|
| 🧪 | [rtk](https://github.com/rtk-ai/rtk) | token-saving, proxy, rust | CLI proxy that reduces LLM token consumption by 60-90% on common dev commands — single Rust binary, zero dependencies |
| 🧪 | [ponytail](https://github.com/DietrichGebert/ponytail) | token-saving, agent-skills, minimalism | Makes your AI agent think like the laziest senior dev in the room. The best code is the code you never wrote. |

## Subscription Management

| Status | Tool | Tags | Description |
|---|---|---|---|
| 🧪 | [OpenUsage](https://github.com/robinebers/openusage) | subscriptions, usage, dashboard | Track all your AI coding subscriptions in one place |
| 👀 | [ax](https://github.com/Necmttn/ax) | telemetry, dashboard, mcp, usage | Local-first observability and memory layer for AI coding-agent sessions |
| 👀 | [Relay](https://github.com/ImBIOS/relay) | llm-proxy, provider-switch, usage, quota-rotation | Universal AI API proxy — hot-switch between GitHub Copilot, OpenAI, Anthropic, DeepSeek, Groq, Ollama, and 10+ providers from Claude Code, Codex CLI, Aider, or any coding agent without restarting. Auto-rotates accounts when quota exhausted, real-time usage tracking |

---

## Local commands

```sh
make build
make run
make deploy
```

- `make build` writes `dist/index.html`.
- `make run` serves the generated site locally on `127.0.0.1:8080`; override with `make run HOST=0.0.0.0 PORT=3000`.
- `make deploy` validates, tests, and builds the Pages artifact.
- `npm run validate:catalog` validates the README catalog tables.

## Catalog notes

Catalog entries live directly in README tables with four columns: Status, Tool, Tags, Description. Tool names are Markdown links to GitHub repositories, and any `##` section with that exact table header is treated as a category.

GitHub metrics are fetched at build time and are never committed back into README. Tags should highlight distinguishing traits, such as `microvm`, `sandbox`, `token-saving`, `browser`, or `subagents`.

To add or update entries with an agent, use `.agents/skills/add-tool/SKILL.md`; Claude-compatible setups can use `.claude/skills/add-tool`.
