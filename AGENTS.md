# Repository Guidelines

## Project Overview

A personally curated, opinionated list of AI coding agents and developer tools. The repository maintains tool data directly in `README.md` and generates a minimal GitHub Pages static site from those Markdown catalog tables.

## Architecture & Data Flow

`README.md` is the single human-edited catalog source. The Node build pipeline parses README sections that contain the catalog table header, validates fields, fetches GitHub metrics at build time, ranks tools inside each category, and writes `dist/index.html`.

GitHub metrics are deployment-time data only. Never write stars, open issues, or open pull request counts back into Markdown.

## Key Paths

| Path | Purpose |
|---|---|
| `README.md` | Catalog source of truth and human-readable project page |
| `scripts/catalog.mjs` | Parser, validation, GitHub metric fetch, ranking, HTML renderer |
| `scripts/build.mjs` | CLI entry for validation/build |
| `test/catalog.test.mjs` | Focused parser/ranking/render tests |
| `.github/workflows/pages.yml` | Scheduled/push/manual GitHub Pages deployment |
| `.agents/skills/add-tool/SKILL.md` | Source add-tool skill |
| `.claude/skills/add-tool` | Symlink to the add-tool skill |

## Development Commands

```sh
make build
make run
make deploy
```

- `make build` fetches GitHub metrics and writes `dist/index.html`.
- `make run` builds and serves `dist/` locally on port `8080`; override with `make run PORT=3000`.
- `make deploy` runs catalog validation, tests, and build for GitHub Pages artifact creation in CI.
- `npm run validate:catalog` validates README catalog tables, required fields, tags, statuses, and GitHub repo URLs without fetching GitHub metrics.

## Catalog Conventions

- Any `##` README section with the exact table header `Status`, `Tool`, `Repo`, `Tags`, `Description` is a catalog category.
- New categories are allowed by adding another matching table section.
- Markdown catalog tables use exactly five columns: Status, Tool, Repo, Tags, Description.
- Status values in README: 🔥, 🧪, 👀. The generated page renders them with SVG icons from `assets/status-*.svg`.
- Repo must be a GitHub repository URL.
- Tags are comma-separated short lowercase feature labels; use them to emphasize distinguishing traits, not broad taxonomy.
- Description should use GitHub repo About text when available.

## Visual Conventions

The generated HTML uses a Swiss Style / International Klein Blue base theme with status-specific accents:

- background `#fafaf8`;
- text `#0a0a0a`;
- base accent `#002FA7`;
- status accents for icon, title, and metric emphasis;
- sans-serif typography;
- grid alignment, sharp corners, hairline borders;
- no gradients, shadows, rounded cards, or decorative noise.

## Testing & QA

Before yielding changes that affect the catalog, build, rendering, ranking, or workflow, run the focused commands that cover the change. For most implementation work, run:

```sh
make deploy
```
