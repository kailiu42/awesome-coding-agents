import { readFile } from 'node:fs/promises';

import { CATALOG_SOURCE, parseCatalog } from './catalog.mjs';

try {
  const markdown = await readFile(CATALOG_SOURCE, 'utf8');
  const tools = parseCatalog(markdown);
  const counts = new Map();

  for (const tool of tools) {
    counts.set(tool.category, (counts.get(tool.category) ?? 0) + 1);
  }

  console.log(`Validated ${CATALOG_SOURCE}: ${tools.length} tools across ${counts.size} categories.`);
  for (const [category, count] of counts) {
    console.log(`- ${category}: ${count} tools`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
