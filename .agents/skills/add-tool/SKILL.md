---
name: add-tool
description: Add or update a tool entry in this repository's list.md catalog.
---

# Add Tool

Use this skill when the user asks to add a new coding-agent tool to this repository.

## Contract

- `list.md` is the only human-edited catalog source.
- Never write stars, open issues, or open pull request counts into Markdown.
- Only these categories are valid:
  - `Agent TUI`
  - `Agent Harness`
  - `Agent Tool`
- Only these status values are valid:
  - `🔥` long-term daily driver
  - `🧭` actively using
  - `👀` recently discovered
- `Repo` must be a GitHub repository URL.
- Tool name must be the official name.
- Description must come from GitHub repository About when available. If not available, use the official website HTML description meta header.

## Workflow

1. Get the GitHub repository URL from the user. If the user did not provide one, ask for it.
2. Read the repository page/API to determine:
   - official repository/tool name;
   - GitHub About description;
   - repository URL in canonical `https://github.com/owner/repo` form.
3. Choose a category:
   - `Agent TUI` for terminal or text UI coding agents;
   - `Agent Harness` for sandbox, orchestration, isolation, fan-out, or execution harnesses;
   - `Agent Tool` for usage tracking, token saving, dashboards, subscription helpers, and other supporting tools.
4. Choose short lowercase tags such as `tui`, `cli`, `gui`, `web`, `usage`, `sandbox`, `harness`, `token`, `proxy`, `dashboard`.
5. If category, status, or tags are ambiguous, ask one concise question before editing.
6. Insert or update the row in the correct category table in `list.md`.
7. Preserve the exact table columns:

   ```md
   | Status | Tool | Repo | Tags | Description |
   |---|---|---|---|---|
   ```

8. Run `npm run validate` after editing.

## Row Format

```md
| 👀 | Tool Name | https://github.com/owner/repo | cli, tui | GitHub About description |
```

Do not add generated GitHub metrics to the row.
