import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CATALOG_SOURCE,
  enrichTools,
  fetchMetrics,
  formatMetricDisplay,
  groupAndRank,
  parseCatalog,
  renderHtml,
  SITE_REPO,
} from '../scripts/catalog.mjs';

const validReadme = `# List

## Legend

| Icon | Meaning |
|---|---|
| 🔥 | Daily driver |

## CLI Agents

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 🔥 | Alpha | https://github.com/example/alpha | hash-edits, lsp | Alpha desc |
| 🧪 | Beta | https://github.com/example/beta | terminal | Beta desc |

## CLI Agent Helpers

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 👀 | Harness | https://github.com/example/harness | microvm | Harness desc |

## Experimental Category

| Status | Tool | Repo | Tags | Description |
|---|---|---|---|---|
| 🧪 | Tool | https://github.com/example/tool | token-saving | Tool desc |
`;

test('parses README catalog tables and ignores non-catalog tables', () => {
  const tools = parseCatalog(validReadme);
  assert.equal(CATALOG_SOURCE, 'README.md');
  assert.equal(tools.length, 4);
  assert.deepEqual([...new Set(tools.map((tool) => tool.category))], ['CLI Agents', 'CLI Agent Helpers', 'Experimental Category']);
  assert.deepEqual(tools[0].tags, ['hash-edits', 'lsp']);
  assert.equal(tools[0].ownerRepo, 'example/alpha');
});

test('allows new README catalog categories', () => {
  const tools = parseCatalog(validReadme.replace('## Experimental Category', '## Browser Agents'));
  assert.ok(tools.some((tool) => tool.category === 'Browser Agents'));
});

test('rejects unknown statuses', () => {
  assert.throws(() => parseCatalog(validReadme.replace('🔥 | Alpha', '⭐ | Alpha')), /Unknown status/);
});

test('rejects non-GitHub repo URLs', () => {
  assert.throws(() => parseCatalog(validReadme.replace('https://github.com/example/alpha', 'https://example.com/alpha')), /GitHub URL/);
});

test('metric fetch failure renders N/A but keeps the tool', async () => {
  const tools = parseCatalog(validReadme);
  const enriched = await enrichTools(tools, {
    token: '',
    fetchImpl: async () => ({ ok: false, status: 503, text: async () => '' }),
  });
  assert.equal(enriched[0].metricsAvailable, false);
  const html = renderHtml(groupAndRank(enriched), new Date('2026-05-26T00:00:00Z'));
  assert.match(html, /N\/A/);
  assert.match(html, /Alpha/);
});

test('fetches metrics from GitHub HTML without using API quota', async () => {
  const urls = [];
  const repoHtml = `
    <span title="1,234" class="Counter js-social-count">1.2k</span>
    <span id="issues-repo-tab-count" title="5,000+" class="Counter">5k+</span>
    <span id="pull-requests-repo-tab-count" title="3" class="Counter">3</span>
  `;

  const metrics = await fetchMetrics('example/alpha', async (url) => {
    urls.push(url);
    return { ok: true, text: async () => repoHtml };
  }, '');

  assert.equal(metrics.stars, 1234);
  assert.equal(metrics.issues, 5000);
  assert.equal(metrics.prs, 3);
  assert.deepEqual(urls, ['https://github.com/example/alpha']);
});

test('uses one GitHub GraphQL request when a token is available', async () => {
  const urls = [];
  const metrics = await fetchMetrics('example/alpha', async (url, options) => {
    urls.push(url);
    assert.match(options.body, /stargazerCount/);
    assert.match(options.body, /pullRequests\(states: OPEN\)/);
    return {
      ok: true,
      json: async () => ({
        data: {
          r0: {
            stargazerCount: 42,
            issues: { totalCount: 7 },
            pullRequests: { totalCount: 3 },
          },
        },
      }),
    };
  }, 'token');

  assert.equal(metrics.stars, 42);
  assert.equal(metrics.issues, 7);
  assert.equal(metrics.prs, 3);
  assert.deepEqual(urls, ['https://api.github.com/graphql']);
});

test('ranking precedence is status, stars, issues, then pull requests', () => {
  const base = [
    {
      category: 'CLI Agents', status: '🔥', tool: 'StatusWins', repo: 'https://github.com/e/status', ownerRepo: 'e/status', tags: ['x'], description: 'x', metricsAvailable: true, metrics: { stars: 0, issues: 0, prs: 0 },
    },
    {
      category: 'CLI Agents', status: '🧪', tool: 'HugeStars', repo: 'https://github.com/e/stars', ownerRepo: 'e/stars', tags: ['x'], description: 'x', metricsAvailable: true, metrics: { stars: 1_000_000, issues: 1_000_000, prs: 1_000_000 },
    },
    {
      category: 'CLI Agents', status: '👀', tool: 'LowStatus', repo: 'https://github.com/e/low', ownerRepo: 'e/low', tags: ['x'], description: 'x', metricsAvailable: true, metrics: { stars: 1_000_000, issues: 1_000_000, prs: 1_000_000 },
    },
  ];
  const ranked = groupAndRank(base)['CLI Agents'];
  assert.equal(ranked[0].tool, 'StatusWins');

  const metricOnly = [
    { ...base[0], status: '🧪', tool: 'Stars', metrics: { stars: 10, issues: 0, prs: 0 } },
    { ...base[0], status: '🧪', tool: 'Issues', metrics: { stars: 0, issues: 10_000, prs: 0 } },
    { ...base[0], status: '🧪', tool: 'PRs', metrics: { stars: 0, issues: 0, prs: 10_000 } },
  ];
  assert.deepEqual(groupAndRank(metricOnly)['CLI Agents'].map((tool) => tool.tool), ['Stars', 'Issues', 'PRs']);
});

test('formats metrics above 1000 with k suffix', () => {
  assert.equal(formatMetricDisplay(999), '999');
  assert.equal(formatMetricDisplay(1000), '1k');
  assert.equal(formatMetricDisplay(1234), '1.2k');
  assert.equal(formatMetricDisplay(126676), '126.7k');
  assert.equal(formatMetricDisplay(999900), '999.9k');
});

test('generated HTML defaults to the upstream repository callout', () => {
  const html = renderHtml({ 'CLI Agents': [], 'CLI Agent Helpers': [], 'Token Savers': [] }, new Date('2026-05-26T00:00:00Z'));
  assert.equal(SITE_REPO, 'kailiu42/awesome-coding-agents');
  assert.match(html, /https:\/\/github.com\/kailiu42\/awesome-coding-agents/);
});

test('generated HTML contains controls, metrics, and IKB theme constraints', () => {
  const tools = parseCatalog(validReadme).map((tool) => ({
    ...tool,
    metricsAvailable: true,
    metrics: { stars: 1234, issues: 999, prs: 1000 },
  }));
  const html = renderHtml(groupAndRank(tools), new Date('2026-05-26T00:00:00Z'), {
    siteRepo: 'example/site',
    siteMetrics: { stars: 999900, issues: 0, prs: 0 },
    siteMetricsAvailable: true,
  });
  assert.match(html, /id="search"/);
  assert.match(html, /id="tabs"/);
  assert.doesNotMatch(html, /id="tags"/);
  assert.doesNotMatch(html, /data-tag/);
  assert.doesNotMatch(html, /Search name, description, category, tags/);
  assert.match(html, /Open issues/);
  assert.match(html, /Open PRs/);
  assert.match(html, /formatMetric/);
  assert.match(html, /statusSvgs/);
  assert.match(html, /--status-hot: #FF6B35/);
  assert.match(html, /--status-warm: #FFD500/);
  assert.match(html, /var\(--status-hot\)/);
  assert.match(html, /--status-experimenting: #0F7A3A/);
  assert.match(html, /--status-discovered: #4B4B4B/);
  assert.match(html, /var\(--status-experimenting\)/);
  assert.match(html, /var\(--status-discovered\)/);
  assert.match(html, /statusAccents/);
  assert.match(html, /--tool-accent: /);
  assert.match(html, /border-top: 6px solid var\(--tool-accent, var\(--accent\)\)/);
  assert.match(html, /color: var\(--tool-accent, var\(--accent\)\)/);
  assert.match(html, /\.tool h2 \{[^}]*color: var\(--tool-accent, var\(--accent\)\)/);
  assert.match(html, /statusIcon/);
  assert.match(html, /role="img"/);
  assert.match(html, /Experimenting/);
  assert.match(html, /https:\/\/github.com\/example\/site/);
  assert.match(html, /GitHub upstream/);
  assert.match(html, /Star \/ contribute/);
  assert.match(html, /★ 999.9k/);
  assert.match(html, /grid-template-columns: repeat\(3, 7\.875rem\)/);
  assert.match(html, /align-items: flex-end/);
  assert.match(html, /text-align: right/);
  assert.match(html, /font-variant-numeric: tabular-nums/);
  assert.match(html, /white-space: nowrap/);
  assert.match(html, /clamp\(22px, 2\.1vw, 30px\)/);
  assert.match(html, /#002FA7/);
  assert.match(html, /border-radius: 0/);
  assert.doesNotMatch(html, /linear-gradient/);
  assert.doesNotMatch(html, /box-shadow:.*0\s+\d/);
});
