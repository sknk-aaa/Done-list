// Applies saved color values to the app's token file (light palette).
// Called automatically by server.mjs after each Save. App-specific: adjust
// TOKENS_PATH if your tokens live elsewhere. Patches only the lightColors block;
// to tune dark, edit while the app is in dark mode and transfer to darkColors.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.resolve(dir, '../../src/theme/tokens.ts');
const BLOCK_MARKER = 'export const lightColors'; // patch this object only

export default function apply(values) {
  if (!values || !fs.existsSync(TOKENS_PATH)) return 0;
  let src = fs.readFileSync(TOKENS_PATH, 'utf8');
  const start = src.indexOf(BLOCK_MARKER);
  if (start < 0) return 0;
  const open = src.indexOf('{', start);
  const close = src.indexOf('};', open);
  let block = src.slice(open, close);
  let n = 0;
  for (const [k, v] of Object.entries(values)) {
    const re = new RegExp(`(\\b${k}:\\s*)'[^']*'`);
    if (re.test(block)) { block = block.replace(re, `$1'${v}'`); n++; }
  }
  fs.writeFileSync(TOKENS_PATH, src.slice(0, open) + block + src.slice(close));
  return n;
}
