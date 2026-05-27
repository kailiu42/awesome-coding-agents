import { build } from './catalog.mjs';

const validateOnly = process.argv.includes('--validate');

try {
  const result = await build({ validateOnly });
  const count = Array.isArray(result) ? result.length : Object.values(result).flat().length;
  console.log(`${validateOnly ? 'Validated' : 'Built'} ${count} tools${validateOnly ? '' : ' into dist/index.html'}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
