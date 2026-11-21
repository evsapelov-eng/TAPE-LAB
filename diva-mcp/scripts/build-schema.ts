/**
 * Builds schemas/diva_parameters.json, docs/PARAMETER_SCHEMA.md and
 * templates/diva-init.h2p from:
 *   schemas/sources/vst_parameters.json   (VST names, indices, ranges)
 *   schemas/sources/observed_stats.json   (statistics from reference presets)
 *   src/schema/curation.ts                (labels, enums, compatibility, confidence)
 *
 *   npx tsx scripts/build-schema.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  CURATION,
  DIGITAL_WAVES,
  ENV_MODELS,
  FILTER_MODELS,
  FX_MODULES,
  HPF_MODELS,
  LFO_RESTART,
  LFO_WAVES,
  MOD_SOURCES,
  MODULATION_SLOTS,
  OSC_MODELS,
  VOICE_COUNTS,
  VOICE_MODES,
} from '../src/schema/curation.js';
import { buildMetaBlock, TEXT_ONLY_TAIL } from '../src/h2p/parser.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const vst = read('schemas/sources/vst_parameters.json');
const obs = read('schemas/sources/observed_stats.json');

/** Layout written by real Diva build 16519 (401 parameter lines). */
const TEMPLATE_LAYOUT_LINES = 401;
const layout = obs.layouts.find((l: any) => l.param_lines === TEMPLATE_LAYOUT_LINES);
if (!layout) throw new Error('reference layout not found in observed_stats.json');

/** Ranges where observations prove the third-party range wrong. */
const RANGE_OVERRIDES: Record<string, { min: number; max: number; type: 'int' | 'float'; reason: string }> = {
  'OSC/Noise': { min: 0, max: 100, type: 'float', reason: 'deepdiva lists int 0..4 but observed values reach 93.00' },
  'VCF1/Model': { min: 0, max: 4, type: 'int', reason: 'enumeration (5 filter models)' },
  'FX1/Module': { min: 0, max: 0, type: 'int', reason: 'stored as string' },
  'FX2/Module': { min: 0, max: 0, type: 'int', reason: 'stored as string' },
};

const obsById = new Map<string, any>(obs.parameters.map((p: any) => [p.id, p]));
const ids: string[] = [];
const seen = new Set<string>();
const push = (id: string) => {
  if (!seen.has(id)) {
    seen.add(id);
    ids.push(id);
  }
};
for (const [s, k] of layout.lines as [string, string, string][]) if (!['#ms', '#mv', '#cm'].includes(k)) push(`${s}/${k}`);
for (const p of obs.parameters) push(p.id);
for (const id of Object.keys(vst.parameters)) push(id);

const params = ids.map((id) => {
  const [section, key] = [id.slice(0, id.indexOf('/')), id.slice(id.indexOf('/') + 1)];
  const c = CURATION[id];
  const v = vst.parameters[id];
  const o = obsById.get(id);
  const warnings: string[] = [];
  let type: 'int' | 'float' | 'string' = 'float';
  let min: number | null = null;
  let max: number | null = null;
  let rangeSource = 'unknown';
  if (o?.format === 'string' || id.endsWith('/Module')) type = 'string';
  const ov = RANGE_OVERRIDES[id];
  if (type !== 'string') {
    if (ov) {
      min = ov.min; max = ov.max; type = ov.type; rangeSource = `override: ${ov.reason}`;
    } else if (v?.range) {
      min = v.range.min; max = v.range.max; type = v.range.type; rangeSource = 'deepdiva VST mapping';
    } else if (o && o.min !== undefined) {
      min = o.min; max = o.max; type = o.format === 'float' ? 'float' : 'int'; rangeSource = 'observed only (true bounds unknown)';
    }
    if (o && min !== null && max !== null && o.min !== undefined && (o.min < min || o.max > max)) {
      warnings.push(`observed values ${o.min}..${o.max} exceed documented range ${min}..${max}; range widened`);
      min = Math.min(min, o.min); max = Math.max(max, o.max);
    }
  }
  // Serialization format follows what Diva itself writes (observed), e.g. "12.00" even for integer-valued tune.
  let format: 'float2' | 'int' | 'string' = type === 'string' ? 'string' : o?.format === 'float' ? 'float2' : o ? 'int' : type === 'float' ? 'float2' : 'int';
  if (type === 'float' && format === 'int') format = 'float2';
  const enumMap = c?.enum ?? null;
  return {
    id,
    section,
    key,
    label: c?.label ?? 'unknown',
    module: c?.module ?? (section.match(/^(Chrs|Phase|Plate|Delay|Rtary)\d$/) ? 'Effects' : 'unknown'),
    vst_name: v?.vst_name ?? null,
    vst_index: v?.vst_index ?? null,
    type,
    format,
    min,
    max,
    range_source: rangeSource,
    enum: enumMap,
    enum_confidence: enumMap ? c?.enumConfidence ?? 'unknown' : null,
    default: c?.init ?? null,
    default_note: c?.init !== undefined ? 'diva-mcp init template value (not a confirmed factory default)' : null,
    compatibility: {
      oscillator_models: c?.oscModels ?? null,
      filter_models: c?.filterModels ?? null,
      hpf_models: c?.hpfModels ?? null,
      envelope_models: c?.envModels ?? null,
    },
    global: c?.global ?? false,
    unit: c?.unit ?? null,
    confidence: c?.confidence ?? 'unknown',
    sources: c?.sources ?? (o ? ['observed'] : []),
    notes: c?.notes ?? null,
    observed: o
      ? { count: o.count, min: o.min ?? null, max: o.max ?? null, distinct: o.distinct, most_common: o.mode }
      : null,
    in_template: (layout.lines as [string, string][]).some(([s, k]) => s === section && k === key),
    warnings,
  };
});

const schema = {
  schema_version: 1,
  synth: 'u-he Diva',
  reference: {
    manual: 'Diva User Guide v1.4.8 (7 August 2025)',
    template_layout: `parameter layout written by Diva build ${layout.pcore_rev.join(',')} (${TEMPLATE_LAYOUT_LINES} lines)`,
    observed_presets: obs._provenance.file_count,
  },
  confidence_levels: {
    high: 'Name from the official VST parameter list AND behaviour/range consistent with the manual and observed presets.',
    medium: 'Two independent sources agree, or one authoritative source plus consistent observations.',
    low: 'Single source or our own inference; use with care and verify in Diva.',
    unknown: 'Meaning not established. Value is preserved but never set by diva-mcp.',
  },
  mod_sources: MOD_SOURCES.map((name, index) => ({ index, name })),
  models: {
    oscillator: OSC_MODELS.map((name, index) => ({ index, name })),
    filter: FILTER_MODELS.map((name, index) => ({ index, name })),
    hpf: HPF_MODELS.map((name, index) => ({ index, name })),
    envelope: ENV_MODELS.map((name, index) => ({ index, name })),
    lfo_waveforms: LFO_WAVES.map((name, index) => ({ index, name })),
    lfo_restart: LFO_RESTART.map((name, index) => ({ index, name })),
    voice_modes: VOICE_MODES.map((name, index) => ({ index, name })),
    voice_counts: VOICE_COUNTS.map((voices, index) => ({ index, voices })),
    digital_waveforms: DIGITAL_WAVES.map((name, index) => ({ index, name })),
    effects: FX_MODULES.map((name, index) => ({ index, name })),
  },
  modulation_slots: MODULATION_SLOTS,
  parameters: params,
};

fs.writeFileSync(path.join(root, 'schemas/diva_parameters.json'), JSON.stringify(schema, null, 1));

// ------------------------------------------------------------------ template
function fmt(p: (typeof params)[number] | undefined, v: number | string): string {
  if (typeof v === 'string') return v;
  if (!p || p.format === 'float2') return (Object.is(Math.round(v * 100) / 100, -0) ? 0 : v).toFixed(2);
  return String(Math.round(v));
}
const pById = new Map(params.map((p) => [p.id, p]));
const bodyLines: string[] = [];
for (const [s, k, layoutValue] of layout.lines as [string, string, string][]) {
  if (k === '#cm' || k === '#ms' || k === '#mv') {
    bodyLines.push(`${k}=${layoutValue}`);
    continue;
  }
  const id = `${s}/${k}`;
  const p = pById.get(id);
  let value: number | string;
  if (id === 'PCore/Rev') value = layout.pcore_rev[0];
  else if (k.startsWith('#') && !['#FX1', '#FX2'].includes(k)) value = layoutValue;
  else if (p?.default !== null && p?.default !== undefined) value = p.default as number | string;
  else value = obsById.get(id)?.mode ?? '0';
  if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value) && p && p.format !== 'string') value = Number(value);
  bodyLines.push(`${k}=${fmt(p, value)}`);
}
const template =
  buildMetaBlock([
    { key: 'Bank', value: 'diva-mcp' },
    { key: 'Author', value: 'diva-mcp' },
    { key: 'Description', value: 'diva-mcp init template' },
    { key: 'Categories', value: '' },
  ]) +
  '\n\n' +
  bodyLines.join('\n') +
  '\n\n\n\n\n' +
  TEXT_ONLY_TAIL;
fs.writeFileSync(path.join(root, 'templates/diva-init.h2p'), template, 'latin1');

// ------------------------------------------------------------------ markdown
const esc = (s: unknown) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const rng = (p: (typeof params)[number]) => (p.type === 'string' ? 'string' : p.min === null ? 'unknown' : `${p.min} .. ${p.max}`);
const enumTxt = (p: (typeof params)[number]) =>
  p.enum ? Object.entries(p.enum).length > 10 ? `mod source index (0..${Object.keys(p.enum).length - 1})` : Object.entries(p.enum).map(([k, v]) => `${k}=${v}`).join(', ') + ` _(${p.enum_confidence})_` : '';
const compat = (p: (typeof params)[number]) => {
  const c = p.compatibility;
  const parts: string[] = [];
  if (c.oscillator_models) parts.push('OSC: ' + c.oscillator_models.map((i) => OSC_MODELS[i]).join('/'));
  if (c.filter_models) parts.push('VCF: ' + c.filter_models.map((i) => FILTER_MODELS[i]).join('/'));
  if (c.hpf_models) parts.push('HPF: ' + c.hpf_models.map((i) => HPF_MODELS[i]).join('/'));
  if (c.envelope_models) parts.push('ENV: ' + c.envelope_models.map((i) => ENV_MODELS[i]).join('/'));
  return parts.join('; ') || 'all';
};
const counts = params.reduce<Record<string, number>>((a, p) => ((a[p.confidence] = (a[p.confidence] ?? 0) + 1), a), {});
let md = `# Diva Parameter Schema

> Generated by \`npm run build:schema\` from \`schemas/sources/*\` and \`src/schema/curation.ts\`.
> Machine-readable version: [\`schemas/diva_parameters.json\`](../schemas/diva_parameters.json).
> Do not edit by hand.

## Sources

| Key | Source |
|---|---|
| manual | u-he *Diva User Guide* v1.4.8 (7 Aug 2025) |
| vst | Official VST automation names of Diva's 281 parameters (list published in acids-ircam/flow_synthesizer \`diva_params.txt\`, cross-checked with a Reason Remote Info dump and pcmbs/synth-proxy) |
| observed | ${obs._provenance.file_count} real \`.h2p\` files: 50 MIT-licensed presets from Fannon/u-he-preset-randomizer, 4 hand-made patches saved by Diva build 16519 (instatetragrammaton/Patches, read for analysis only), the factory patch MS-REV1 as shipped in maudgrol/deepdiva (MIT). Only statistics are stored. |
| synthproxy | pcmbs/synth-proxy notes on which model uses which parameter (built on the real plugin via DawDreamer) |
| factory | Cross-check against factory patch MS-REV1 (MS-20 emulation: OSC=3 Eco, HPF=3 Bite, VCF1=3 Bite Rev1) |
| inference | Our own reasoning — always marked low confidence |

Ranges come from maudgrol/deepdiva's VST mapping unless noted, and are widened (with a warning) when real presets exceed them.

**Confidence:** ${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')} (total ${params.length} parameters).

${Object.entries(schema.confidence_levels).map(([k, v]) => `- **${k}** — ${v}`).join('\n')}

## Key facts verified

- Model selectors are **0-based**: \`OSC/Model\` 0=Triple VCO, 1=Dual VCO, 2=DCO, 3=Dual VCO Eco, 4=Digital; \`VCF1/Model\` 0=Ladder … 4=Uhbie; \`HPF/Model\` 0=No HPF (Feedback), 1=Post, 2=Pre, 3=Bite. (Some third-party docs claim 1-based numbering; real presets and the factory MS-REV1 patch show 0-based.)
- \`*Src\` parameters index the \`#ms\` list at the top of every preset (0=none … 23=Multiply).
- \`FX1/Module\` and \`FX2/Module\` hold strings such as \`'Chorus1'\`, \`'Delay2'\`; the parameters live in sections \`Chrs\`, \`Phase\`, \`Plate\`, \`Delay\`, \`Rtary\` + slot number.
- Diva has **no free modulation matrix** — see the fixed slots below.
- \`OSC/Shape1..3\` (1..9) are the Triple VCO morphing waveforms (8.00 = 25 % pulse per manual). \`OSC/VtoD\` is *Vibrato*, not an octave switch.

## Fixed modulation slots

| Destination | Source selector | Amount | Note |
|---|---|---|---|
${MODULATION_SLOTS.map((m) => `| ${esc(m.destination)} | \`${esc(m.source)}\` | \`${esc(m.amount)}\` | ${esc(m.note)} |`).join('\n')}

## Modulation sources (\`#ms\` list)

${MOD_SOURCES.map((s, i) => `\`${i}\`=${s}`).join(', ')}

## Parameters
`;
const modules = [...new Set(params.map((p) => p.module))];
for (const m of modules) {
  md += `\n### ${m}\n\n| ID | Label | VST name | Type | Range | Enum | Default (init) | Active for | Confidence | Notes |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const p of params.filter((x) => x.module === m)) {
    const notes = [p.notes, p.unit, ...p.warnings, p.observed ? `observed ${p.observed.min ?? ''}..${p.observed.max ?? ''} (n=${p.observed.count})` : 'not observed', p.global ? 'GLOBAL — preserved, never written' : null].filter(Boolean).join('; ');
    md += `| \`${p.id}\` | ${esc(p.label)} | ${esc(p.vst_name ?? 'unknown')} | ${p.type} | ${rng(p)} | ${esc(enumTxt(p))} | ${esc(p.default ?? 'unknown')} | ${esc(compat(p))} | ${p.confidence} | ${esc(notes)} |\n`;
  }
}
fs.writeFileSync(path.join(root, 'docs/PARAMETER_SCHEMA.md'), md);
console.log(`schema: ${params.length} parameters (${JSON.stringify(counts)}); template: ${bodyLines.length} lines`);
