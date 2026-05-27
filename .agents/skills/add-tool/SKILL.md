---
name: add-tool
description: Add or update a tool entry in this repository's README catalog.
---

# Add Tool

Use this skill when the user asks to add a new coding-agent tool to this repository.

## Contract

- `README.md` is the only human-edited catalog source.
- Never write stars, open issues, or open pull request counts into Markdown.
- Any README `##` section with the exact catalog table header is a valid category.
- If the user specifies a category, use that category exactly.
- If the specified category does not exist, create a new README `##` section for it with the standard catalog table.
- If the user does not specify a category, prefer existing categories when they fit; add a new category only when it makes the README clearer.
- Only these status values are valid:
  - `🔥` long-term daily driver
  - `🧪` experimenting / actively trying, not yet daily used
  - `👀` recently discovered
- `Repo` must be a GitHub repository URL.
- Tool name must be the official name.
- Description must come from GitHub repository About when available. If not available, use the official website HTML description meta header.
- Tags are short lowercase feature labels that emphasize distinguishing traits, not broad category names.

## Workflow

1. Get the GitHub repository URL from the user. If the user did not provide one, ask for it.
2. Read the repository page/API to determine:
   - official repository/tool name;
   - GitHub About description;
   - repository URL in canonical `https://github.com/owner/repo` form.
3. Choose the README category:
   - If the user specified a category, use it exactly.
   - If that category does not exist yet, add a new `## Category Name` section with the standard catalog table.
   - If the user did not specify a category, choose the best existing category. Current categories include:
     - `CLI Agents` for terminal or text UI coding agents;
     - `CLI Agent Helpers` for sandbox, orchestration, isolation, fan-out, or execution harnesses;
     - `Token Savers` for token-saving proxies or reducers;
     - `Subscription Management` for usage tracking, dashboards, or subscription helpers.
   - Add a new category when no existing category describes the tool clearly.
4. Choose short lowercase feature tags such as `microvm`, `sandbox`, `token-saving`, `browser`, `subagents`, `proxy`, `dashboard`, or `git-workflows`.
5. If status or tags are ambiguous, ask one concise question before editing. Do not ask about category when the user already specified one.
6. Insert or update the row in the correct README category table.
7. Preserve the exact table columns:

   ```md
   | Status | Tool | Repo | Tags | Description |
   |---|---|---|---|---|
   ```

8. Run `npm run validate:catalog` after editing.

## Row Format

```md
| 👀 | Tool Name | https://github.com/owner/repo | microvm, sandbox | GitHub About description |
```

Do not add generated GitHub metrics to the row.
