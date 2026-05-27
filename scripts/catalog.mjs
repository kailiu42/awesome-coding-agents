import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const STATUSES = ['🔥', '🧪', '👀'];
export const CATALOG_SOURCE = 'README.md';

export const SITE_REPO = process.env.UPSTREAM_REPOSITORY || 'kailiu42/awesome-coding-agents';

const STATUS_SCORE = new Map([
  ['🔥', 3],
  ['🧪', 2],
  ['👀', 1],
]);

const HEADER = ['Status', 'Tool', 'Repo', 'Tags', 'Description'];

const STATUS_LABELS = new Map([
  ['🔥', 'Daily driver'],
  ['🧪', 'Experimenting'],
  ['👀', 'Recently discovered'],
]);

const STATUS_SVGS = {
  '🔥': '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M27 58C16 55 10 46 10 35c0-9 4-18 13-27-1 9 2 16 8 21 8-8 11-17 8-27 13 7 21 19 21 33 0 12-7 21-19 23" stroke="var(--status-hot)" stroke-width="4.5"/><path d="M32 58c-7-3-10-8-10-15 0-8 4-14 12-21-1 8 2 12 8 17 4 4 6 8 6 13 0 3-1 5-3 6" stroke="var(--status-warm)" stroke-width="4.5"/></g></svg>',
  '🧪': '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M25 6h22" stroke="var(--ink)" stroke-width="4.5"/><path d="M30 7 14 45c-3 8 2 15 11 15 5 0 10-3 12-8L53 14" stroke="var(--ink)" stroke-width="4.5"/><path d="M25 34c5 4 11 6 18 5" stroke="var(--status-experimenting)" stroke-width="4.5"/><path d="M22 42c4 4 9 5 15 4M20 48c4 3 8 4 13 3" stroke="var(--status-experimenting)" stroke-width="4.5"/><circle cx="20" cy="55" r="2" stroke="var(--status-experimenting)" stroke-width="4"/></g></svg>',
  '👀': '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 32c8-12 17-18 27-18s19 6 27 18c-8 12-17 18-27 18S13 44 5 32Z" stroke="var(--status-discovered)" stroke-width="4.5"/><circle cx="32" cy="32" r="12" stroke="var(--status-discovered)" stroke-width="4.5"/><circle cx="32" cy="32" r="5" stroke="var(--status-discovered)" stroke-width="4.5"/><path d="M25 26c1-3 3-5 6-6" stroke="var(--status-discovered)" stroke-width="4"/></g></svg>',
};

const STATUS_ACCENTS = {
  '🔥': 'var(--status-hot)',
  '🧪': 'var(--status-experimenting)',
  '👀': 'var(--status-discovered)',
};

export function parseCatalog(markdown) {
  const lines = markdown.split(/\r?\n/);
  const tools = [];
  let category = null;
  let inCatalogTable = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      category = heading[1];
      inCatalogTable = false;
      continue;
    }

    if (!line.startsWith('|')) {
      if (line) inCatalogTable = false;
      continue;
    }

    const cells = splitTableRow(line);
    if (cells.every((cell) => /^-+$/.test(cell))) continue;

    if (sameCells(cells, HEADER)) {
      if (!category) {
        throw new Error(`Catalog table before category at line ${index + 1}`);
      }
      inCatalogTable = true;
      continue;
    }

    if (!inCatalogTable) continue;

    if (cells.length !== HEADER.length) {
      throw new Error(`Malformed table row at line ${index + 1}`);
    }

    const [status, tool, repo, tags, description] = cells.map((cell) => cell.trim());
    const record = {
      category,
      status,
      tool,
      repo,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      description,
      ownerRepo: parseGithubRepo(repo),
    };
    validateRecord(record, index + 1);
    tools.push(record);
  }

  if (tools.length === 0) {
    throw new Error('No catalog entries found');
  }

  return tools;
}

function splitTableRow(line) {
  return line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function sameCells(actual, expected) {
  return actual.length === expected.length && actual.every((cell, index) => cell === expected[index]);
}

export function parseGithubRepo(repoUrl) {
  let url;
  try {
    url = new URL(repoUrl);
  } catch {
    throw new Error(`Repo must be a GitHub URL: ${repoUrl}`);
  }

  if (url.hostname !== 'github.com') {
    throw new Error(`Repo must be a GitHub URL: ${repoUrl}`);
  }

  const parts = url.pathname.replace(/^\//, '').replace(/\.git$/, '').split('/').filter(Boolean);
  if (parts.length !== 2) {
    throw new Error(`Repo URL must point to an owner/repo: ${repoUrl}`);
  }
  return `${parts[0]}/${parts[1]}`;
}

function validateRecord(record, line) {
  for (const field of ['status', 'tool', 'repo', 'description']) {
    if (!record[field]) throw new Error(`Missing ${field} at line ${line}`);
  }
  if (!STATUSES.includes(record.status)) throw new Error(`Unknown status '${record.status}' at line ${line}`);
  if (record.tags.length === 0) throw new Error(`Missing tags at line ${line}`);
}

export async function fetchMetrics(ownerRepo, fetchImpl = globalThis.fetch, token = process.env.GITHUB_TOKEN) {
  const result = (await collectMetrics([ownerRepo], { fetchImpl, token })).get(ownerRepo);
  if (result?.metricsAvailable) return result.metrics;
  throw new Error(result?.metricsError ?? `GitHub metrics fetch failed for ${ownerRepo}`);
}

async function collectMetrics(ownerRepos, options = {}) {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const token = options.token ?? process.env.GITHUB_TOKEN;
  const metrics = options.metrics;
  const results = new Map();
  const pending = [];

  for (const ownerRepo of [...new Set(ownerRepos)]) {
    if (metrics?.[ownerRepo]) {
      results.set(ownerRepo, { metrics: metrics[ownerRepo], metricsAvailable: true });
    } else {
      pending.push(ownerRepo);
    }
  }

  if (pending.length === 0) return results;

  if (token) {
    try {
      const graphqlMetrics = await fetchMetricsFromGraphql(pending, fetchImpl, token);
      for (const ownerRepo of pending) {
        const metric = graphqlMetrics.get(ownerRepo);
        if (metric) results.set(ownerRepo, { metrics: metric, metricsAvailable: true });
      }
      return results;
    } catch (error) {
      for (const ownerRepo of pending) {
        results.set(ownerRepo, {
          metrics: { stars: 0, issues: 0, prs: 0 },
          metricsAvailable: false,
          metricsError: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  const headers = createGithubHtmlHeaders();
  await Promise.all(pending.map(async (ownerRepo) => {
    if (results.get(ownerRepo)?.metricsAvailable) return;
    try {
      results.set(ownerRepo, {
        metrics: await fetchMetricsFromHtml(ownerRepo, fetchImpl, headers),
        metricsAvailable: true,
      });
    } catch (error) {
      const prior = results.get(ownerRepo)?.metricsError;
      const message = error instanceof Error ? error.message : String(error);
      results.set(ownerRepo, {
        metrics: { stars: 0, issues: 0, prs: 0 },
        metricsAvailable: false,
        metricsError: prior ? `${prior}; GitHub HTML fallback failed for ${ownerRepo}: ${message}` : `GitHub HTML fallback failed for ${ownerRepo}: ${message}`,
      });
    }
  }));

  return results;
}

function createGithubHtmlHeaders() {
  return {
    Accept: 'text/html,application/xhtml+xml',
    'User-Agent': 'awesome-coding-agents-build',
  };
}

async function fetchMetricsFromGraphql(ownerRepos, fetchImpl, token) {
  const variables = {};
  const fields = ownerRepos.map((ownerRepo, index) => {
    const [owner, name] = ownerRepo.split('/');
    variables[`owner${index}`] = owner;
    variables[`name${index}`] = name;
    return `r${index}: repository(owner: $owner${index}, name: $name${index}) {
      stargazerCount
      issues(states: OPEN) { totalCount }
      pullRequests(states: OPEN) { totalCount }
    }`;
  }).join('\n');

  const query = `query RepoMetrics(${ownerRepos.map((_, index) => `$owner${index}: String!, $name${index}: String!`).join(', ')}) {
    ${fields}
  }`;

  const response = await fetchImpl('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'awesome-coding-agents-build',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL metrics fetch failed: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL metrics fetch failed: ${payload.errors.map((error) => error.message).join('; ')}`);
  }

  const result = new Map();
  ownerRepos.forEach((ownerRepo, index) => {
    const repo = payload.data?.[`r${index}`];
    if (!repo) return;
    result.set(ownerRepo, {
      stars: Number(repo.stargazerCount) || 0,
      issues: Number(repo.issues?.totalCount) || 0,
      prs: Number(repo.pullRequests?.totalCount) || 0,
    });
  });
  return result;
}

async function fetchMetricsFromHtml(ownerRepo, fetchImpl, headers) {
  const response = await fetchImpl(`https://github.com/${ownerRepo}`, { headers });
  if (!response.ok) {
    throw new Error(`repo page ${response.status}`);
  }

  const html = await response.text();
  return {
    stars: readCounter(html, /<span\b(?=[^>]*\bclass="[^"]*\bjs-social-count\b[^"]*")[^>]*>[\s\S]*?<\/span>/),
    issues: readCounter(html, /<span\b(?=[^>]*\bid="issues-repo-tab-count")[^>]*>[\s\S]*?<\/span>/),
    prs: readCounter(html, /<span\b(?=[^>]*\bid="pull-requests-repo-tab-count")[^>]*>[\s\S]*?<\/span>/),
  };
}

function readCounter(html, pattern) {
  const match = pattern.exec(html);
  if (!match) return 0;
  const tag = match[0];
  const title = /\btitle="([^"]*)"/.exec(tag)?.[1] ?? '';
  const text = tag.replace(/<[^>]*>/g, '');
  return parseCounter(title) || parseCounter(text);
}

function parseCounter(value) {
  const normalized = value.trim().replace(/[,+]/g, '').toLowerCase();
  if (!normalized || normalized === 'not available') return 0;
  const compact = /^(\d+(?:\.\d+)?)([km])$/.exec(normalized);
  if (compact) {
    const multiplier = compact[2] === 'm' ? 1_000_000 : 1_000;
    return Math.round(Number(compact[1]) * multiplier);
  }
  const exact = Number(normalized);
  return Number.isFinite(exact) ? exact : 0;
}

export async function enrichTools(tools, options = {}) {
  const collectedMetrics = options.collectedMetrics
    ?? await collectMetrics(tools.map((tool) => tool.ownerRepo), options);

  return tools.map((tool) => {
    const result = collectedMetrics.get(tool.ownerRepo);
    return {
      ...tool,
      metrics: result?.metrics ?? { stars: 0, issues: 0, prs: 0 },
      metricsAvailable: Boolean(result?.metricsAvailable),
      ...(result?.metricsError ? { metricsError: result.metricsError } : {}),
    };
  });
}

export function scoreTools(tools) {
  const maxStars = Math.max(1, ...tools.map((tool) => tool.metrics.stars));
  const maxIssues = Math.max(1, ...tools.map((tool) => tool.metrics.issues));
  const maxPrs = Math.max(1, ...tools.map((tool) => tool.metrics.prs));

  return tools.map((tool) => {
    const statusScore = STATUS_SCORE.get(tool.status) ?? 0;
    const score = statusScore * 1_000_000
      + (tool.metrics.stars / maxStars) * 10_000
      + (tool.metrics.issues / maxIssues) * 100
      + (tool.metrics.prs / maxPrs);
    return { ...tool, score };
  }).sort((a, b) => b.score - a.score || a.tool.localeCompare(b.tool));
}

export function groupAndRank(tools) {
  const grouped = new Map();
  for (const tool of tools) {
    const bucket = grouped.get(tool.category);
    if (bucket) {
      bucket.push(tool);
    } else {
      grouped.set(tool.category, [tool]);
    }
  }

  return Object.fromEntries([...grouped].map(([category, categoryTools]) => [
    category,
    scoreTools(categoryTools),
  ]));
}

export function formatMetricDisplay(value) {
  if (value >= 1000) {
    const compact = Math.round(value / 100) / 10;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }
  return value.toLocaleString();
}

export function renderHtml(groupedTools, generatedAt = new Date(), options = {}) {
  const siteRepo = options.siteRepo ?? SITE_REPO;
  const siteMetrics = options.siteMetrics ?? { stars: 0, issues: 0, prs: 0 };
  const siteStars = options.siteMetricsAvailable === false ? 'N/A' : formatMetricDisplay(siteMetrics.stars);
  const siteRepoUrl = `https://github.com/${siteRepo}`;
  const statusLabels = Object.fromEntries(STATUS_LABELS);
  const categories = Object.keys(groupedTools);
  const payload = JSON.stringify({ categories, tools: groupedTools, statusSvgs: STATUS_SVGS, statusLabels, statusAccents: STATUS_ACCENTS })
    .replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Awesome Coding Agents</title>
  <meta name="description" content="A curated directory of coding agents, harnesses, and helper tools.">
  <style>
    :root {
      --paper: #fafaf8;
      --ink: #0a0a0a;
      --grey-1: #f0f0ee;
      --grey-2: #d4d4d2;
      --grey-3: #737373;
      --accent: #002FA7;
      --accent-on: #ffffff;
      --status-hot: #FF6B35;
      --status-warm: #FFD500;
      --status-experimenting: #0F7A3A;
      --status-discovered: #4B4B4B;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: Inter, Helvetica, Arial, "Noto Sans SC", "Microsoft YaHei UI", sans-serif;
      line-height: 1.45;
    }
    a { color: inherit; }
    .page { max-width: 1180px; margin: 0 auto; padding: 40px 24px 56px; }
    .chrome { display: grid; grid-template-columns: 1fr auto; gap: 24px; border-bottom: 1px solid var(--ink); padding-bottom: 18px; }
    .meta { color: var(--grey-3); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
    .hero { display: grid; grid-template-columns: minmax(0, 1fr) max-content; gap: 28px; align-items: start; margin: 34px 0 18px; }
    .hero h1 { margin: 0; font-size: clamp(48px, 9vw, 120px); line-height: .86; font-weight: 200; letter-spacing: -.07em; max-width: 900px; }
    .repo-callout { display: block; min-width: 12rem; border: 1px solid var(--ink); padding: 14px; text-align: right; text-decoration: none; }
    .repo-callout:hover { background: var(--accent); border-color: var(--accent); color: var(--accent-on); }
    .repo-callout strong { display: block; color: var(--accent); font-size: clamp(28px, 3vw, 42px); line-height: 1; font-weight: 250; font-variant-numeric: tabular-nums; }
    .repo-callout:hover strong { color: var(--accent-on); }
    .repo-callout span { display: block; color: var(--grey-3); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    .repo-callout:hover span { color: var(--accent-on); }
    .lead { max-width: 720px; font-size: clamp(18px, 2.2vw, 26px); font-weight: 300; }
    .controls { display: grid; gap: 20px; margin: 42px 0 32px; }
    .search { width: 100%; border: 1px solid var(--ink); border-radius: 0; background: transparent; color: var(--ink); font: inherit; font-size: 20px; padding: 16px 18px; outline: none; }
    .search:focus { border-color: var(--accent); outline: 2px solid var(--accent); outline-offset: 3px; }
    .tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    button { border: 1px solid var(--ink); border-radius: 0; background: transparent; color: var(--ink); cursor: pointer; font: inherit; padding: 10px 14px; }
    button:hover, button[aria-selected="true"], button.active { background: var(--accent); border-color: var(--accent); color: var(--accent-on); }
    .tools { display: grid; gap: 1px; background: var(--ink); border: 1px solid var(--ink); }
    .tool { display: grid; grid-template-columns: 56px minmax(0, 1fr) max-content; gap: 20px; background: var(--paper); padding: 22px; }
    .status { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; }
    .status svg { width: 34px; height: 34px; display: block; overflow: visible; }
    .tool h2 { margin: 0 0 8px; color: var(--tool-accent, var(--accent)); font-size: clamp(28px, 4vw, 56px); line-height: .92; font-weight: 300; letter-spacing: -.04em; }
    .description { margin: 0; color: var(--grey-3); max-width: 680px; }
    .tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .tag { border: 1px solid var(--grey-2); color: var(--grey-3); padding: 4px 7px; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 12px; text-transform: uppercase; }
    .metrics { display: grid; grid-template-columns: repeat(3, 7.875rem); gap: 10px; align-self: start; justify-content: end; }
    .metric { display: flex; flex-direction: column; align-items: flex-end; border-top: 6px solid var(--tool-accent, var(--accent)); background: var(--grey-1); padding: 12px; min-height: 82px; text-align: right; }
    .metric strong { display: block; width: 100%; font-size: clamp(22px, 2.1vw, 30px); line-height: 1; font-weight: 250; color: var(--tool-accent, var(--accent)); font-variant-numeric: tabular-nums; letter-spacing: -.04em; white-space: nowrap; }
    .metric span { display: block; color: var(--grey-3); font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 11px; letter-spacing: .08em; margin-top: 8px; text-transform: uppercase; }
    .empty { border: 1px solid var(--ink); padding: 34px; color: var(--grey-3); }

    @media (max-width: 760px) {
      .hero, .chrome, .tool { grid-template-columns: 1fr; }
      .hero h1 { font-size: clamp(44px, 17vw, 84px); }
      .metrics { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main class="page">
    <header>
      <div class="chrome">
        <div class="meta">Awesome Coding Agents / Static Directory</div>
        <div class="meta">Built ${escapeHtml(generatedAt.toISOString())}</div>
      </div>
      <div class="hero">
        <h1>Awesome Coding Agents</h1>
        <a class="repo-callout" href="${escapeHtml(siteRepoUrl)}" aria-label="Star and contribute on GitHub">
          <span>GitHub upstream</span>
          <strong>★ ${escapeHtml(siteStars)}</strong>
          <span>Star / contribute</span>
        </a>
      </div>
      <p class="lead">A curated, opinionated directory of coding agents, harnesses, and helper tools. Sorted by personal status and current GitHub activity.</p>
    </header>

    <section class="controls" aria-label="Directory controls">
      <input id="search" class="search" type="search" placeholder="Search name, description, category" autocomplete="off">
      <nav id="tabs" class="tabs" aria-label="Categories"></nav>
    </section>

    <section id="results" class="tools" aria-live="polite"></section>
  </main>

  <script type="application/json" id="catalog-data">${payload}</script>
  <script>
    const catalog = JSON.parse(document.getElementById('catalog-data').textContent);
    let activeCategory = catalog.categories[0];

    const search = document.getElementById('search');
    const tabs = document.getElementById('tabs');

    const results = document.getElementById('results');

    function html(value) {
      return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    }

    function formatMetric(value) {
      if (value >= 1000) {
        const compact = Math.round(value / 100) / 10;
        return (Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)) + 'k';
      }
      return value.toLocaleString();
    }

    function metric(tool, key, label) {
      const value = tool.metricsAvailable ? formatMetric(tool.metrics[key]) : 'N/A';
      return '<div class="metric"><strong>' + html(value) + '</strong><span>' + label + '</span></div>';
    }

    function statusIcon(tool) {
      const label = catalog.statusLabels[tool.status] || 'Status';
      const svg = catalog.statusSvgs[tool.status] || html(tool.status);
      return '<div class="status" role="img" aria-label="' + html(label) + '" title="' + html(label) + '">' + svg + '</div>';
    }

    function statusAccent(tool) {
      return catalog.statusAccents[tool.status] || 'var(--accent)';
    }

    function renderTabs() {
      tabs.innerHTML = catalog.categories.map(category =>
        '<button type="button" aria-selected="' + (category === activeCategory) + '" data-category="' + html(category) + '">' + html(category) + '</button>'
      ).join('');
    }



    function render() {
      const query = search.value.trim().toLowerCase();
      const categoryTools = catalog.tools[activeCategory] || [];
      const filtered = categoryTools.filter(tool => {
        const haystack = [tool.tool, tool.description, tool.category].join(' ').toLowerCase();
        return !query || haystack.includes(query);
      });
      renderTabs();

      results.className = filtered.length ? 'tools' : 'empty';
      results.innerHTML = filtered.length ? filtered.map(tool =>
        '<article class="tool" style="--tool-accent: ' + html(statusAccent(tool)) + '">' +
          statusIcon(tool) +
          '<div>' +
            '<h2><a href="' + html(tool.repo) + '">' + html(tool.tool) + '</a></h2>' +
            '<p class="description">' + html(tool.description) + '</p>' +
            '<div class="tag-row">' + tool.tags.map(tag => '<span class="tag">#' + html(tag) + '</span>').join('') + '</div>' +
          '</div>' +
          '<div class="metrics">' + metric(tool, 'stars', 'Stars') + metric(tool, 'issues', 'Open issues') + metric(tool, 'prs', 'Open PRs') + '</div>' +
        '</article>'
      ).join('') : 'No tools match the current search.';
    }

    tabs.addEventListener('click', event => {
      const button = event.target.closest('button[data-category]');
      if (!button) return;
      activeCategory = button.dataset.category;

      render();
    });
    search.addEventListener('input', render);
    render();
  </script>
</body>
</html>
`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

export async function build({ validateOnly = false, fetchImpl, metrics, now = new Date(), siteRepo = SITE_REPO, token = process.env.GITHUB_TOKEN } = {}) {
  const markdown = await readFile(CATALOG_SOURCE, 'utf8');
  const parsed = parseCatalog(markdown);
  if (validateOnly) return parsed;

  const collectedMetrics = await collectMetrics([
    ...parsed.map((tool) => tool.ownerRepo),
    siteRepo,
  ], { fetchImpl, metrics, token });
  const enriched = await enrichTools(parsed, { collectedMetrics });
  const grouped = groupAndRank(enriched);
  const siteResult = collectedMetrics.get(siteRepo);
  const html = renderHtml(grouped, now, {
    siteRepo,
    siteMetrics: siteResult?.metrics,
    siteMetricsAvailable: Boolean(siteResult?.metricsAvailable),
  });
  await mkdir('dist', { recursive: true });
  await writeFile(path.join('dist', 'index.html'), html);
  return grouped;
}
