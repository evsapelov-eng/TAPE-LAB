import { findParam, H2PDocument, hasBinaryData, paramId, paramLines, parseH2P, serializeH2P, BINARY_MARKER } from '../h2p/parser.js';
import { checkValue, getParam, isActiveFor, loadSchema, parseRaw } from '../schema/schema.js';
import { FX_MODULES, FX_SECTION_PREFIX, MOD_SOURCES } from '../schema/curation.js';
import { getModels } from './preset.js';

export type CheckStatus = 'passed' | 'failed' | 'warning' | 'skipped';

export interface ValidationReport {
  structural_validation: { status: 'passed' | 'failed'; checks: { name: string; status: CheckStatus; detail: string }[] };
  diva_load_test: { status: 'not_run'; reason: string };
  audio_verification: { status: 'not_run'; reason: string };
  errors: string[];
  warnings: string[];
  info: string[];
  unknown_parameters: string[];
  binary_block: { present: boolean; preserved: boolean | null };
  summary: string;
}

const REQUIRED_SECTIONS = ['main', 'VCC', 'ENV1', 'ENV2', 'LFO1', 'LFO2', 'MOD', 'OSC', 'HPF', 'VCF1', 'VCA1', 'FX1', 'FX2'];

export const DIVA_LOAD_NOT_RUN =
  'No automated way to load a preset into the real Diva plugin is available in this environment. Load the file in Diva (preset browser) to confirm compatibility.';
export const AUDIO_NOT_RUN = 'No audio was rendered or analysed. Descriptions are inferred from parameter values only.';

export function validateDocument(doc: H2PDocument, opts: { originalText?: string; text?: string } = {}): ValidationReport {
  const checks: ValidationReport['structural_validation']['checks'] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];
  const check = (name: string, ok: boolean, detail: string, warnOnly = false) => {
    checks.push({ name, status: ok ? 'passed' : warnOnly ? 'warning' : 'failed', detail });
    if (!ok) (warnOnly ? warnings : errors).push(`${name}: ${detail}`);
  };

  // 1. header
  const am = findParam(doc, 'HEAD/#AM')?.value;
  check('header #AM=Diva', am === 'Diva', am === undefined ? 'missing #AM line' : `#AM=${am}`);
  const ms = paramLines(doc).filter((l) => l.section === 'HEAD' && l.key === '#ms').map((l) => l.value);
  const msOk = ms.length === MOD_SOURCES.length && ms.every((v, i) => v === MOD_SOURCES[i]);
  check('modulation source list (#ms)', msOk, msOk ? '24 sources in expected order' : `found ${ms.length} sources: ${ms.join(',')}`);

  // 2. meta
  check('meta block', doc.pre === '' || doc.meta.length > 0, doc.pre === '' ? 'no meta block (allowed)' : `${doc.meta.length} entries`, true);

  // 3. sections
  const sections = new Set(paramLines(doc).filter((l) => l.key === '#cm').map((l) => l.value));
  const missing = REQUIRED_SECTIONS.filter((s) => !sections.has(s));
  check('required sections', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : `${sections.size} sections`);

  // 4. values
  const unknown: string[] = [];
  let checked = 0;
  const seen = new Map<string, number>();
  for (const l of paramLines(doc)) {
    if (l.key === '#cm' || l.key === '#ms' || l.key === '#mv') continue;
    const id = paramId(l.section, l.key);
    seen.set(id, (seen.get(id) ?? 0) + 1);
    const p = getParam(id);
    if (!p) {
      unknown.push(id);
      continue;
    }
    if (p.global || p.confidence === 'unknown') continue;
    const v = parseRaw(l.value);
    checked++;
    for (const issue of checkValue(p, v)) {
      (issue.severity === 'error' ? errors : issue.severity === 'warning' ? warnings : info).push(`${id}: ${issue.message}`);
    }
  }
  const rangeErrors = errors.filter((e) => /outside range|not a known option|expected a/.test(e));
  checks.push({ name: 'parameter values (type / range / enum)', status: rangeErrors.length ? 'failed' : 'passed', detail: `${checked} schema parameters checked, ${rangeErrors.length} invalid` });
  const dups = [...seen.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  check('no duplicated parameter keys', dups.length === 0, dups.length ? dups.join(', ') : 'ok', true);
  if (unknown.length) info.push(`${unknown.length} parameter(s) not in schema (preserved verbatim): ${unknown.slice(0, 20).join(', ')}${unknown.length > 20 ? ' ...' : ''}`);

  // 5. effects
  for (const n of [1, 2]) {
    const mod = findParam(doc, `FX${n}/Module`)?.value;
    const name = mod?.replace(/'/g, '').replace(/\d$/, '');
    const ok = !!name && (FX_MODULES as readonly string[]).includes(name) && mod === `'${name}${n}'`;
    check(`FX${n} module`, ok, mod === undefined ? 'missing' : `${mod}`);
    if (ok) {
      const sec = `${FX_SECTION_PREFIX[name as (typeof FX_MODULES)[number]]}${n}`;
      check(`FX${n} parameter section`, sections.has(sec), sections.has(sec) ? sec : `section ${sec} missing`);
    }
  }

  // 6. model compatibility
  const models = getModels(doc);
  const modelOk = [models.osc >= 0 && models.osc <= 4, models.filter >= 0 && models.filter <= 4, models.hpf >= 0 && models.hpf <= 3, models.env1 >= 0 && models.env1 <= 2, models.env2 >= 0 && models.env2 <= 2].every(Boolean);
  check('module models valid', modelOk, `OSC=${models.osc} VCF=${models.filter} HPF=${models.hpf} ENV1=${models.env1} ENV2=${models.env2}`);
  if (models.osc === 0 && models.hpf !== 0) info.push('HPF model is stored but inactive: Triple VCO replaces the HPF panel with its mixer.');
  const fback = Number(findParam(doc, 'VCF1/Fback')?.value ?? 0);
  if (fback > 0 && models.osc !== 0 && models.hpf !== 0) info.push('VCF1/Fback > 0 but inactive (needs Triple VCO or HPF = Feedback).');
  const inactive: string[] = [];
  for (const l of paramLines(doc)) {
    const p = getParam(paramId(l.section, l.key));
    if (!p || p.global || p.id.endsWith('/Model')) continue;
    if (!isActiveFor(p, models) && p.default !== null && String(parseRaw(l.value)) !== String(p.default)) inactive.push(p.id);
  }
  if (inactive.length) info.push(`${inactive.length} non-default parameter(s) belong to inactive modules (kept, no effect): ${inactive.slice(0, 12).join(', ')}${inactive.length > 12 ? ' ...' : ''}`);

  // 7. re-read
  const text = opts.text ?? serializeH2P(doc);
  const reparsed = parseH2P(text);
  const same = serializeH2P(reparsed) === text;
  const a = paramLines(doc).map((l) => `${l.section}/${l.key}=${l.value}`).join('\n');
  const b = paramLines(reparsed).map((l) => `${l.section}/${l.key}=${l.value}`).join('\n');
  check('re-read (parse -> serialize -> parse)', same && a === b, same && a === b ? 'identical' : 'serialization not stable');

  // 8. binary block
  const present = hasBinaryData(doc);
  let preserved: boolean | null = null;
  if (opts.originalText !== undefined) {
    const orig = parseH2P(opts.originalText);
    preserved = orig.tail === doc.tail;
    check('unknown/binary block preserved', preserved, preserved ? (present ? 'binary block byte-identical to original' : 'no binary block in original') : 'binary block differs from original');
  }
  check('footer marker', doc.tail.startsWith(BINARY_MARKER) || doc.tail === '', doc.tail === '' ? 'no footer (allowed)' : 'present', true);
  if (present) info.push('File contains Diva\'s compressed binary block; it is kept verbatim. Its content cannot be parsed or validated.');

  const status = checks.some((c) => c.status === 'failed') ? 'failed' : 'passed';
  return {
    structural_validation: { status, checks },
    diva_load_test: { status: 'not_run', reason: DIVA_LOAD_NOT_RUN },
    audio_verification: { status: 'not_run', reason: AUDIO_NOT_RUN },
    errors,
    warnings,
    info,
    unknown_parameters: unknown,
    binary_block: { present, preserved },
    summary: `Structural validation ${status === 'passed' ? 'passed' : 'FAILED'}. Diva load test: not run. Audio verification: not run.`,
  };
}

export function schemaParameterCount(): number {
  return loadSchema().parameters.length;
}
