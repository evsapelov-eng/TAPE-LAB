/**
 * High-level operations shared by the MCP server and the CLI.
 */
import fs from 'node:fs';
import path from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import { cloneDoc, findParam, hasBinaryData, H2PDocument, serializeH2P } from '../h2p/parser.js';
import { checkValue, getParam, isActiveFor, parseRaw, requireParam } from '../schema/schema.js';
import { FILTER_MODELS, OSC_MODELS } from '../schema/curation.js';
import { protectedRoots } from '../library/paths.js';
import { assertWritable, resolveOutputDir, safeFileName, safeWrite, uniquePath, UnsafeWriteError } from '../library/safety.js';
import { analyzeDocument } from './analyze.js';
import { describeAnalysis } from './describe.js';
import { mapSpec, type Change } from './mapping.js';
import { AppliedChange, applyChanges, applyMeta, docToBuffer, getModels, loadTemplate, readPresetFile } from './preset.js';
import { PresetSpecZ, type PresetSpec } from './spec.js';
import { validateDocument, type ValidationReport } from './validate.js';

export class SpecError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid preset spec:\n- ${problems.join('\n- ')}`);
  }
}

export function parseSpec(input: unknown): PresetSpec {
  const r = PresetSpecZ.safeParse(input);
  if (!r.success) throw new SpecError(r.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`));
  return r.data;
}

export interface BuildResult {
  doc: H2PDocument;
  bytes: Buffer;
  applied: AppliedChange[];
  warnings: string[];
  validation: ValidationReport;
  name: string;
}

/** Pure build step (no I/O besides reading the template): deterministic for a given spec. */
export function buildPreset(specInput: unknown): BuildResult {
  const spec = parseSpec(specInput);
  const doc = loadTemplate();
  const mapped = mapSpec(spec, getModels(doc));
  if (mapped.errors.length) throw new SpecError(mapped.errors);
  const { applied, missing } = applyChanges(doc, mapped.changes);
  if (missing.length) throw new SpecError(missing.map((m) => `template has no parameter ${m}`));
  const name = safeFileName(spec.meta?.name ?? 'diva-mcp preset');
  applyMeta(doc, { author: 'diva-mcp', bank: 'diva-mcp', ...spec.meta });
  const bytes = docToBuffer(doc);
  const validation = validateDocument(doc);
  if (validation.structural_validation.status !== 'passed') throw new SpecError(['generated preset failed structural validation', ...validation.errors]);
  return { doc, bytes, applied, warnings: mapped.warnings, validation, name };
}

function summarizeApplied(applied: AppliedChange[]) {
  const by: Record<string, string[]> = {};
  for (const a of applied) {
    const mod = getParam(a.id)?.module ?? 'other';
    (by[mod] ??= []).push(`${a.label} [${a.id}] = ${a.after}`);
  }
  return by;
}

export function generatePreset(specInput: unknown, opts: { subfolder?: string; overwrite?: boolean; dryRun?: boolean } = {}) {
  const built = buildPreset(specInput);
  const spec = parseSpec(specInput);
  let file: string | undefined;
  let write;
  if (!opts.dryRun) {
    const dir = resolveOutputDir(opts.subfolder);
    file = opts.overwrite ? path.join(dir, `${built.name}.h2p`) : uniquePath(dir, built.name);
    write = safeWrite(file, built.bytes, { overwrite: opts.overwrite });
    // Re-read from disk: confirms the written file parses and validates.
    const reread = readPresetFile(write.path);
    const v = validateDocument(reread.doc, { text: reread.text });
    built.validation = v;
  }
  return {
    path: write?.path ?? null,
    written: !opts.dryRun,
    name: built.name,
    architecture: `${OSC_MODELS[getModels(built.doc).osc]} -> ${FILTER_MODELS[getModels(built.doc).filter]}`,
    concept: spec.concept ?? null,
    parameters_set: summarizeApplied(built.applied),
    changed_from_init_template: built.applied.length,
    warnings: built.warnings,
    validation: built.validation,
    format_note:
      'Text-only .h2p written from the diva-mcp init template (parameter layout of Diva build 16519) with no compressed binary block — the same text-only form produced by u-he-preset-randomizer (default mode) and deepdiva. Load in Diva to confirm.',
  };
}

// ------------------------------------------------------------------ edit

export type ParamEdit = number | string | { add: number } | { scale: number } | { set: number | string };

export interface EditChanges {
  params?: Record<string, ParamEdit>;
  spec?: unknown;
}

function versionedPath(dir: string, base: string): string {
  const m = /^(.*?)(?: v(\d+))?$/.exec(base)!;
  const stem = m[1]!.trim();
  let n = m[2] ? parseInt(m[2], 10) + 1 : 2;
  let p = path.join(dir, `${stem} v${n}.h2p`);
  while (fs.existsSync(p)) p = path.join(dir, `${stem} v${++n}.h2p`);
  return p;
}

function isProtected(p: string): boolean {
  const abs = path.resolve(p);
  return protectedRoots().some((r) => {
    const rel = path.relative(r, abs);
    return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
  });
}

export function editPreset(file: string, changes: EditChanges, opts: { outputPath?: string; overwrite?: boolean; dryRun?: boolean } = {}) {
  const { doc: original, text: originalText } = readPresetFile(file);
  const doc = cloneDoc(original);
  const warnings: string[] = [];
  const errors: string[] = [];
  const allChanges: Change[] = [];
  let models = getModels(doc);

  // 1. spec-level (partial) changes
  if (changes.spec !== undefined) {
    const spec = parseSpec(changes.spec);
    const mapped = mapSpec(spec, models);
    errors.push(...mapped.errors);
    warnings.push(...mapped.warnings);
    allChanges.push(...mapped.changes);
    models = mapped.models;
    if (spec.meta) applyMeta(doc, spec.meta);
  }
  // 2. raw parameter edits
  for (const [id, edit] of Object.entries(changes.params ?? {})) {
    let p;
    try {
      p = requireParam(id);
    } catch (e) {
      errors.push((e as Error).message);
      continue;
    }
    if (p.global) {
      errors.push(`${id} is a global/host setting and is never modified by diva-mcp`);
      continue;
    }
    const line = findParam(doc, id);
    if (!line) {
      errors.push(`${id} does not exist in this file (it will not be invented)`);
      continue;
    }
    const cur = parseRaw(line.value);
    let value: number | string;
    if (typeof edit === 'object' && edit !== null) {
      if ('set' in edit) value = edit.set;
      else if (typeof cur !== 'number') {
        errors.push(`${id}: relative edit on non-numeric value`);
        continue;
      } else if ('add' in edit) value = cur + edit.add;
      else value = cur * edit.scale;
      if (typeof value === 'number' && p.min !== null && p.max !== null && ('add' in edit || 'scale' in edit)) {
        const clamped = Math.min(p.max, Math.max(p.min, value));
        if (clamped !== value) warnings.push(`${id}: ${value} clamped to ${clamped}`);
        value = clamped;
      }
    } else value = edit;
    for (const issue of checkValue(p, value)) (issue.severity === 'error' ? errors : warnings).push(`${id}: ${issue.message}`);
    if (!isActiveFor(p, models)) warnings.push(`${id} (${p.label}) is inactive for the current ${OSC_MODELS[models.osc]} / ${FILTER_MODELS[models.filter]} configuration — the change will have no audible effect`);
    allChanges.push({ id, value, reason: 'explicit parameter edit' });
  }
  if (errors.length) throw new SpecError(errors);

  const { applied, missing } = applyChanges(doc, allChanges);
  if (missing.length) throw new SpecError(missing.map((m) => `${m} does not exist in this file (older Diva layout?) — not invented`));
  if (hasBinaryData(doc)) {
    warnings.push(
      'This preset contains Diva\'s compressed binary block. It was preserved byte-for-byte. Text parameter changes are expected to take effect (u-he-preset-randomizer\'s binary mode relies on this), but that is not verified here — confirm by loading the result in Diva.',
    );
  }
  const bytes = docToBuffer(doc);
  const validation = validateDocument(doc, { originalText });
  let write;
  let target: string | undefined;
  if (!opts.dryRun && applied.length > 0) {
    if (opts.outputPath) target = path.resolve(opts.outputPath);
    else if (opts.overwrite) target = path.resolve(file);
    else {
      const srcDir = path.dirname(path.resolve(file));
      const dir = isProtected(srcDir) ? resolveOutputDir('edits') : srcDir;
      target = versionedPath(dir, path.basename(file, path.extname(file)));
    }
    if (target === path.resolve(file) && !opts.overwrite) throw new UnsafeWriteError('output_path equals the source file; pass overwrite=true to replace it (a backup is made)');
    assertWritable(target);
    write = safeWrite(target, bytes, { overwrite: opts.overwrite || (opts.outputPath ? false : false) });
  }
  // Unchanged-parameter check: everything not in `applied` must be byte-identical.
  const changedIds = new Set(applied.map((a) => a.id));
  const orig = original.lines;
  let preserved = orig.length === doc.lines.length;
  if (preserved) {
    for (let i = 0; i < orig.length; i++) {
      const a = orig[i]!;
      const b = doc.lines[i]!;
      if (a.kind !== b.kind) preserved = false;
      else if (a.kind === 'param' && b.kind === 'param' && a.value !== b.value && !changedIds.has(`${a.section}/${a.key}`)) preserved = false;
      else if (a.kind === 'raw' && b.kind === 'raw' && a.text !== b.text) preserved = false;
    }
  }
  return {
    source: path.resolve(file),
    path: write?.path ?? null,
    written: !!write,
    overwritten: write?.overwritten ?? false,
    backup: write?.backup ?? null,
    changes: applied,
    unchanged_parameters_preserved: preserved,
    binary_block_preserved: original.tail === doc.tail,
    warnings,
    validation,
    note: applied.length === 0 ? 'No parameter value changed; nothing written.' : undefined,
  };
}

// ------------------------------------------------------------------ read-only

export function analyzePreset(file: string) {
  const { doc } = readPresetFile(file);
  return analyzeDocument(doc, file);
}

export function describePreset(file: string) {
  const a = analyzePreset(file);
  return { name: a.name, ...describeAnalysis(a) };
}

export function validatePreset(file: string) {
  const { doc, text } = readPresetFile(file);
  return { path: path.resolve(file), ...validateDocument(doc, { text, originalText: text }) };
}

// ------------------------------------------------------------------ bank

export interface BankOptions {
  bankName?: string;
  zip?: boolean;
  overwrite?: boolean;
}

export function generateBank(specs: unknown[], outputFolder: string, opts: BankOptions = {}) {
  const dir = resolveOutputDir(outputFolder);
  const bankName = opts.bankName ?? path.basename(dir);
  fs.mkdirSync(dir, { recursive: true });
  const taken = new Set<string>();
  const results: any[] = [];
  for (let i = 0; i < specs.length; i++) {
    const raw = specs[i] as any;
    try {
      const withBank = { ...raw, meta: { bank: bankName, ...(raw?.meta ?? {}) } };
      const built = buildPreset(withBank);
      const target = opts.overwrite ? path.join(dir, `${built.name}.h2p`) : uniquePath(dir, built.name, '.h2p', taken);
      if (taken.has(target.toLowerCase())) throw new Error(`duplicate name ${built.name}`);
      taken.add(target.toLowerCase());
      const w = safeWrite(target, built.bytes, { overwrite: opts.overwrite });
      const reread = readPresetFile(w.path);
      const validation = validateDocument(reread.doc, { text: reread.text });
      const analysis = analyzeDocument(reread.doc, w.path);
      const spec = parseSpec(withBank);
      results.push({
        index: i,
        ok: validation.structural_validation.status === 'passed',
        name: path.basename(w.path, '.h2p'),
        path: w.path,
        architecture: `${analysis.oscillator.model} -> ${analysis.filter.model}`,
        concept: spec.concept ?? null,
        meta: spec.meta ?? null,
        parameters_set: summarizeApplied(built.applied),
        warnings: built.warnings,
        validation: { structural: validation.structural_validation.status, diva_load_test: 'not_run', audio_verification: 'not_run', errors: validation.errors },
        description: describeAnalysis(analysis),
      });
    } catch (e) {
      results.push({ index: i, ok: false, name: raw?.meta?.name ?? `#${i + 1}`, error: (e as Error).message });
    }
  }
  const okCount = results.filter((r) => r.ok).length;
  const readme = bankReadme(bankName, results);
  const readmePath = safeWrite(path.join(dir, 'README.md'), readme, { overwrite: true }).path;
  const report = { bank: bankName, folder: dir, created: okCount, failed: results.length - okCount, presets: results };
  // The file inside the bank uses paths relative to the bank folder (portable).
  const fileReport = { ...report, folder: '.', presets: results.map((r) => (r.path ? { ...r, path: path.relative(dir, r.path) } : r)) };
  const reportJson = JSON.stringify(fileReport, null, 2);
  const reportPath = safeWrite(path.join(dir, 'bank_report.json'), reportJson, { overwrite: true }).path;
  let zipPath: string | null = null;
  if (opts.zip !== false) {
    const files: Record<string, Uint8Array> = {};
    const folder = safeFileName(bankName);
    for (const r of results.filter((x) => x.ok)) files[`${folder}/${path.basename(r.path)}`] = new Uint8Array(fs.readFileSync(r.path));
    files[`${folder}/README.md`] = strToU8(readme);
    files[`${folder}/bank_report.json`] = strToU8(reportJson);
    // Fixed mtime keeps the archive deterministic.
    const zipped = zipSync(files, { level: 9, mtime: new Date('2026-01-01T00:00:00Z') });
    zipPath = safeWrite(path.join(path.dirname(dir), `${folder}.zip`), Buffer.from(zipped), { overwrite: true }).path;
  }
  return { ...report, readme: readmePath, report: reportPath, zip: zipPath };
}

function bankReadme(bankName: string, results: any[]): string {
  const ok = results.filter((r) => r.ok);
  let md = `# ${bankName}\n\n${ok.length} preset(s) for u-he Diva generated with diva-mcp.\n\n`;
  md += `## Installation\n\nCopy the \`.h2p\` files into a folder inside your Diva **user** preset folder, e.g.\n\n- macOS: \`~/Library/Audio/Presets/u-he/Diva/${bankName}/\`\n- Windows: \`Documents\\u-he\\Diva.data\\UserPresets\\Diva\\${bankName}\\\`\n\nThen use *Refresh* in Diva's preset browser.\n\n`;
  md += `## Verification status\n\n| Preset | Architecture | Structural validation | Diva load test | Audio verification |\n|---|---|---|---|---|\n`;
  for (const r of results) md += `| ${r.name} | ${r.architecture ?? '-'} | ${r.ok ? 'passed' : `FAILED: ${r.error ?? r.validation?.errors?.join('; ')}`} | not run | not run |\n`;
  md += `\n> These presets passed diva-mcp's structural validation. They have **not** been loaded into Diva or listened to by the tool. Please load each preset in Diva to confirm.\n> Files are text-only .h2p (no compressed binary block), built from diva-mcp's own init template.\n\n`;
  for (const r of ok) {
    md += `## ${r.name}\n\n`;
    if (r.meta?.categories) md += `**Category:** ${r.meta.categories.join(', ')}  \n`;
    md += `**Architecture:** ${r.architecture}  \n`;
    if (r.meta?.description) md += `**Description:** ${r.meta.description}  \n`;
    if (r.meta?.usage) md += `**Usage:** ${r.meta.usage}  \n`;
    md += '\n';
    if (r.concept) {
      md += `### Sound concept\n\n`;
      for (const [k, v] of Object.entries(r.concept)) md += `- **${k}:** ${Array.isArray(v) ? v.join(', ') : v}\n`;
      md += '\n';
    }
    md += `### Parameter-derived description\n\n${r.description.description.split('\n').map((l: string) => `- ${l}`).join('\n')}\n\n_${r.description.basis}_\n\n`;
    md += `### Parameters set (relative to the init template)\n\n`;
    for (const [mod, list] of Object.entries(r.parameters_set as Record<string, string[]>)) md += `- **${mod}:** ${list.join('; ')}\n`;
    if (r.warnings?.length) md += `\n**Warnings:** ${r.warnings.join(' / ')}\n`;
    md += '\n';
  }
  return md;
}

export { serializeH2P };
