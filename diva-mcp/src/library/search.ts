/**
 * Read-only search over existing Diva presets.
 */
import fs from 'node:fs';
import path from 'node:path';
import { bufferToText, getMetaValue, parseH2P } from '../h2p/parser.js';
import { ENV_MODELS, FILTER_MODELS, OSC_MODELS, VOICE_MODES } from '../schema/curation.js';
import { getModels, num } from '../engine/preset.js';
import { referenceDirs } from './paths.js';

export interface ReferenceHit {
  name: string;
  path: string;
  score: number;
  matched: string[];
  categories: string;
  character: string;
  features: string;
  author: string;
  bank: string;
  description: string;
  architecture: { oscillator: string; filter: string; voice_mode: string; amp_attack: number; env1: string; cutoff: number };
}

const MAX_FILES = 20000;

function walk(dir: string, out: string[], depth = 0) {
  if (out.length >= MAX_FILES || depth > 8) return;
  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, depth + 1);
    else if (e.name.toLowerCase().endsWith('.h2p')) out.push(p);
    if (out.length >= MAX_FILES) return;
  }
}

export function findReferencePresets(query: string, opts: { dirs?: string[]; limit?: number } = {}) {
  const dirs = referenceDirs(opts.dirs ?? []);
  const files: string[] = [];
  for (const d of dirs) walk(d, files);
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9äöüß+-]+/i)
    .filter((t) => t.length > 1);
  const hits: ReferenceHit[] = [];
  let unreadable = 0;
  for (const f of files) {
    let doc;
    try {
      doc = parseH2P(bufferToText(fs.readFileSync(f)));
    } catch {
      unreadable++;
      continue;
    }
    const meta = (k: string) => getMetaValue(doc, k) ?? '';
    const models = getModels(doc);
    const arch = {
      oscillator: OSC_MODELS[models.osc] ?? '?',
      filter: FILTER_MODELS[models.filter] ?? '?',
      voice_mode: VOICE_MODES[num(doc, 'VCC/Mode')] ?? '?',
      amp_attack: num(doc, 'ENV1/Atk'),
      env1: ENV_MODELS[models.env1] ?? '?',
      cutoff: num(doc, 'VCF1/Freq'),
    };
    const name = path.basename(f, path.extname(f));
    const fields: [string, string, number][] = [
      ['name', name, 3],
      ['category', meta('Categories'), 3],
      ['character', meta('Character'), 2],
      ['features', meta('Features'), 2],
      ['architecture', `${arch.oscillator} ${arch.filter} ${arch.voice_mode} ${arch.amp_attack > 35 ? 'slow-attack swell' : arch.amp_attack <= 3 ? 'fast-attack' : ''} ${arch.cutoff < 70 ? 'dark' : arch.cutoff > 110 ? 'bright' : ''}`, 2],
      ['description', `${meta('Description')} ${meta('Usage')}`, 1],
      ['bank/author', `${meta('Bank')} ${meta('Author')} ${path.basename(path.dirname(f))}`, 1],
    ];
    let score = 0;
    const matched: string[] = [];
    for (const t of tokens) {
      for (const [label, text, w] of fields) {
        if (text.toLowerCase().includes(t)) {
          score += w;
          matched.push(`${t}@${label}`);
        }
      }
    }
    if (tokens.length === 0 || score > 0) {
      hits.push({ name, path: f, score, matched, categories: meta('Categories'), character: meta('Character'), features: meta('Features'), author: meta('Author'), bank: meta('Bank'), description: meta('Description').slice(0, 200), architecture: arch });
    }
  }
  hits.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return {
    query,
    searched_dirs: dirs,
    files_scanned: files.length,
    unreadable,
    results: hits.slice(0, opts.limit ?? 20),
    note: dirs.length === 0 ? 'No Diva preset folders found. Pass dirs or set DIVA_REFERENCE_DIRS.' : 'Read-only search; no file was modified.',
  };
}
