/**
 * Build public/compare-data.json for Compare states & Compare occupations pages.
 * Run before build: node scripts/generate-compare-data.js
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const statesDir = join(root, 'src', 'data', 'states');
const occDir = join(root, 'src', 'data', 'occupations');
const outPath = join(root, 'public', 'compare-data.json');

const stateFiles = readdirSync(statesDir).filter((f) => f.endsWith('.json'));
const occFiles = readdirSync(occDir).filter((f) => f.endsWith('.json'));

const states = {};
for (const f of stateFiles) {
  const path = join(statesDir, f);
  const d = JSON.parse(readFileSync(path, 'utf-8'));
  states[d.stateSlug] = {
    name: d.state,
    abbr: d.stateAbbreviation,
    occupations: (d.occupations || [])
      .map((o) => ({ slug: o.slug, title: o.title, median: o.medianAnnual ?? null }))
      .sort((a, b) => (a.title || '').localeCompare(b.title || '')),
  };
}

const occupations = {};
for (const f of occFiles) {
  const path = join(occDir, f);
  const d = JSON.parse(readFileSync(path, 'utf-8'));
  occupations[d.slug] = {
    title: d.title,
    states: (d.states || [])
      .map((s) => ({ stateSlug: s.stateSlug, stateName: s.state, median: s.medianAnnual ?? null }))
      .sort((a, b) => (a.stateName || '').localeCompare(b.stateName || '')),
  };
}

writeFileSync(outPath, JSON.stringify({ states, occupations }, null, 0), 'utf-8');
console.log('Wrote public/compare-data.json');
