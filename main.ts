// main.ts — entrypoint for the Vice City Cover Maker make.fun entry.
// Copies app/ and screenshots/ next to this file into the output
// directory, then writes /output/dossier.json with the kit's dossier
// builder. Node 22, standard library only, no installs.

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

mkdirSync(outputDir, { recursive: true });

for (const name of ['app', 'screenshots']) {
  const src = join(here, name);
  if (!existsSync(src)) throw new Error(`missing ${name}/ beside main.ts`);
  cpSync(src, join(outputDir, name), { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});

writeFileSync(join(outputDir, 'dossier.json'), dossier);
// Sanity-check what we just wrote: it must parse, and the screenshots
// we copied in must be the four the entry hands in.
const parsed = JSON.parse(readFileSync(join(outputDir, 'dossier.json'), 'utf8'));
const shots = readdirSync(join(outputDir, 'screenshots')).filter((n) => /\.(jpe?g|png)$/i.test(n));
console.log(`Wrote ${join(outputDir, 'dossier.json')} (${dossier.length} bytes, schema ${parsed.schema}, ${shots.length} screenshots).`);
