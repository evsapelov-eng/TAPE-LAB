/**
 * Collects per-parameter statistics from a set of reference Diva presets.
 *
 *   npx tsx scripts/collect-observations.ts <dir-or-file> [...more]
 *
 * Writes schemas/sources/observed_stats.json. Only aggregate statistics and the
 * parameter *layout* (key order) are stored; no preset is copied.
 */
import fs from 'node:fs';
import path from 'node:path';
import { bufferToText, paramLines, parseH2P, getMetaValue } from '../src/h2p/parser.js';

interface Stat {
  id: string;
  count: number;
  numeric: number;
  min?: number;
  max?: number;
  format: 'int' | 'float' | 'string' | 'mixed';
  values: Record<string, number>;
}

function walk(p: string, out: string[]) {
  const st = fs.statSync(p);
  if (st.isDirectory()) for (const f of fs.readdirSync(p)) walk(path.join(p, f), out);
  else if (p.toLowerCase().endsWith('.h2p')) out.push(p);
}

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('usage: collect-observations <dir-or-file> [...]');
  process.exit(1);
}
const files: string[] = [];
for (const i of inputs) walk(i, files);
files.sort();

const stats = new Map<string, Stat>();
const layouts = new Map<string, { count: number; lines: [string, string, string][]; revs: Set<string>; vers: Set<string> }>();
let withBinary = 0;
for (const f of files) {
  const doc = parseH2P(bufferToText(fs.readFileSync(f)));
  if (getMetaValue(doc, 'Bank') === undefined && paramLines(doc).length === 0) continue;
  if (/\$\$\$\$/.test(doc.tail)) withBinary++;
  const lines = paramLines(doc);
  const keys = lines.map((l) => `${l.section}/${l.key}`).join('|');
  const lk = `${lines.length}:${hash(keys)}`;
  let lay = layouts.get(lk);
  if (!lay) {
    lay = { count: 0, lines: lines.map((l) => [l.section, l.key, l.key.startsWith('#') ? l.value : '']), revs: new Set(), vers: new Set() };
    layouts.set(lk, lay);
  }
  lay.count++;
  for (const l of lines) {
    if (l.section === 'PCore' && l.key === 'Rev') lay.revs.add(l.value);
    if (l.key === '#Vers') lay.vers.add(l.value);
    if (l.key === '#ms' || l.key === '#mv' || l.key === '#cm') continue;
    const id = `${l.section}/${l.key}`;
    let s = stats.get(id);
    if (!s) {
      s = { id, count: 0, numeric: 0, format: 'int', values: {} };
      stats.set(id, s);
    }
    s.count++;
    s.values[l.value] = (s.values[l.value] ?? 0) + 1;
    const n = Number(l.value);
    if (l.value.trim() !== '' && Number.isFinite(n)) {
      s.numeric++;
      s.min = s.min === undefined ? n : Math.min(s.min, n);
      s.max = s.max === undefined ? n : Math.max(s.max, n);
      if (l.value.includes('.') && s.format === 'int') s.format = 'float';
    } else {
      s.format = s.numeric > 0 ? 'mixed' : 'string';
    }
  }
}

function hash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h.toString(16);
}

const out = {
  _provenance: {
    generated_by: 'scripts/collect-observations.ts',
    file_count: files.length,
    files_with_binary_block: withBinary,
    sources: inputs.map((i) => path.basename(path.resolve(i))),
    note: 'Aggregate statistics only. "values" lists at most 40 most frequent raw values.',
  },
  layouts: [...layouts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .map(([k, v]) => ({ key: k, files: v.count, param_lines: v.lines.length, pcore_rev: [...v.revs], vers: [...v.vers], lines: v.lines })),
  parameters: [...stats.values()].map((s) => {
    const entries = Object.entries(s.values).sort((a, b) => b[1] - a[1]);
    return {
      id: s.id,
      count: s.count,
      format: s.format,
      min: s.min,
      max: s.max,
      distinct: entries.length,
      mode: entries[0]?.[0],
      values: Object.fromEntries(entries.slice(0, 40)),
    };
  }),
};
const target = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../schemas/sources/observed_stats.json');
fs.writeFileSync(target, JSON.stringify(out, null, 1));
console.log(`${files.length} files, ${stats.size} parameters, ${layouts.size} layouts -> ${target}`);
