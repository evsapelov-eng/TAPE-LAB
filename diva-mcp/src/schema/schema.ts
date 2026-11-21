import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ParamSchema {
  id: string;
  section: string;
  key: string;
  label: string;
  module: string;
  vst_name: string | null;
  vst_index: number | null;
  type: 'int' | 'float' | 'string';
  format: 'float2' | 'int' | 'string';
  min: number | null;
  max: number | null;
  range_source: string;
  enum: Record<string, string> | null;
  enum_confidence: string | null;
  default: number | string | null;
  compatibility: {
    oscillator_models: number[] | null;
    filter_models: number[] | null;
    hpf_models: number[] | null;
    envelope_models: number[] | null;
  };
  global: boolean;
  unit: string | null;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  sources: string[];
  notes: string | null;
  observed: { count: number; min: number | null; max: number | null; distinct: number; most_common: string } | null;
  in_template: boolean;
  warnings: string[];
}

export interface DivaSchema {
  schema_version: number;
  reference: Record<string, unknown>;
  confidence_levels: Record<string, string>;
  mod_sources: { index: number; name: string }[];
  models: Record<string, { index: number; name?: string; voices?: number }[]>;
  modulation_slots: { destination: string; source: string; amount: string; note?: string }[];
  parameters: ParamSchema[];
}

/** Package root (works from src/ via tsx and from dist/src/ after build). */
export function packageRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'schemas'))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error('diva-mcp package root not found');
}

let cached: DivaSchema | undefined;
let byId: Map<string, ParamSchema> | undefined;

export function loadSchema(): DivaSchema {
  if (!cached) {
    cached = JSON.parse(fs.readFileSync(path.join(packageRoot(), 'schemas', 'diva_parameters.json'), 'utf8')) as DivaSchema;
    byId = new Map(cached.parameters.map((p) => [p.id, p]));
  }
  return cached;
}

export function getParam(id: string): ParamSchema | undefined {
  loadSchema();
  return byId!.get(id);
}

export function requireParam(id: string): ParamSchema {
  const p = getParam(id);
  if (!p) throw new Error(`Unknown Diva parameter "${id}". Use list_parameters() to see valid ids.`);
  return p;
}

/** Format a value the way Diva writes it. */
export function formatValue(p: ParamSchema | undefined, value: number | string): string {
  if (typeof value === 'string') {
    if (p?.type === 'string' && !value.startsWith("'")) return `'${value.replace(/'/g, '')}'`;
    return value;
  }
  if (!Number.isFinite(value)) throw new Error(`Non-finite value for ${p?.id ?? 'parameter'}`);
  if (!p || p.format === 'float2') {
    const r = Math.round(value * 100) / 100;
    return (r === 0 ? 0 : r).toFixed(2);
  }
  return String(Math.round(value));
}

export function parseRaw(raw: string): number | string {
  const t = raw.trim();
  if (t !== '' && /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(t)) return Number(t);
  return t;
}

export interface ValueIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

/** Check a value against the schema. Returns issues (empty = ok). */
export function checkValue(p: ParamSchema, value: number | string): ValueIssue[] {
  const out: ValueIssue[] = [];
  if (p.type === 'string') {
    if (typeof value !== 'string') out.push({ id: p.id, severity: 'error', message: `expected a string value` });
    else if (p.enum && !(value in p.enum)) out.push({ id: p.id, severity: 'error', message: `value ${value} not in ${Object.keys(p.enum).join(', ')}` });
    return out;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    out.push({ id: p.id, severity: 'error', message: `expected a number, got "${value}"` });
    return out;
  }
  if (p.min !== null && p.max !== null && (value < p.min - 1e-9 || value > p.max + 1e-9)) {
    out.push({ id: p.id, severity: 'error', message: `value ${value} outside range ${p.min}..${p.max} (${p.range_source})` });
  }
  if (p.type === 'int' && Math.abs(value - Math.round(value)) > 1e-6) {
    out.push({ id: p.id, severity: p.enum ? 'error' : 'warning', message: `value ${value} should be an integer` });
  }
  if (p.enum && !(String(Math.round(value)) in p.enum)) {
    out.push({ id: p.id, severity: 'error', message: `value ${value} is not a known option (${Object.entries(p.enum).map(([k, v]) => `${k}=${v}`).join(', ')})` });
  }
  return out;
}

export function enumLabel(id: string, value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const p = getParam(id);
  if (!p?.enum) return undefined;
  return p.enum[String(typeof value === 'number' ? Math.round(value) : value)];
}

export function modSourceName(index: number | string | undefined): string {
  const s = loadSchema().mod_sources.find((m) => m.index === Number(index));
  return s ? s.name : `unknown(${index})`;
}

export function modSourceIndex(name: string): number {
  const n = name.trim().toLowerCase();
  const aliases: Record<string, string> = {
    modwheel: 'ModWhl', mod_wheel: 'ModWhl', mw: 'ModWhl', pitchbend: 'PitchW', pitch_wheel: 'PitchW',
    aftertouch: 'Pressure', at: 'Pressure', pressure: 'Pressure', velocity: 'Velocity', vel: 'Velocity',
    keytrack: 'KeyFollow', keyfollow: 'KeyFollow', key: 'KeyFollow', env1: 'Env1', env2: 'Env2',
    lfo1: 'LFO1', lfo2: 'LFO2', random: 'Random', stack: 'StackVoice', stackindex: 'StackVoice',
    voicemap: 'VoiceMap', quantize: 'Quant', quantise: 'Quant', add: 'Adder', adder: 'Adder', multiply: 'Multiply',
  };
  const target = aliases[n] ?? name;
  const s = loadSchema().mod_sources.find((m) => m.name.toLowerCase() === target.toLowerCase());
  if (!s) throw new Error(`Unknown modulation source "${name}". Valid: ${loadSchema().mod_sources.map((m) => m.name).join(', ')}`);
  return s.index;
}

/** Is a parameter active for the given module models? undefined model => assume active. */
export function isActiveFor(p: ParamSchema, models: { osc?: number; filter?: number; hpf?: number; env1?: number; env2?: number }): boolean {
  const c = p.compatibility;
  if (c.oscillator_models && models.osc !== undefined && !c.oscillator_models.includes(models.osc)) return false;
  if (c.filter_models && models.filter !== undefined && !c.filter_models.includes(models.filter)) return false;
  if (c.hpf_models && models.hpf !== undefined && !c.hpf_models.includes(models.hpf)) return false;
  if (c.envelope_models) {
    const env = p.section === 'ENV1' ? models.env1 : p.section === 'ENV2' ? models.env2 : undefined;
    if (env !== undefined && !c.envelope_models.includes(env)) return false;
  }
  // HPF panel does not exist when OSC = Triple VCO.
  if (p.section === 'HPF' && models.osc === 0) return false;
  return true;
}
