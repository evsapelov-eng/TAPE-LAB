/**
 * Glue between the lossless H2P document and the parameter schema.
 */
import fs from 'node:fs';
import path from 'node:path';
import {
  bufferToText,
  cloneDoc,
  findParam,
  getMetaValue,
  H2PDocument,
  latin1BytesToUtf8,
  paramMap,
  parseH2P,
  serializeH2P,
  setMeta,
  setRawValue,
  textToBuffer,
} from '../h2p/parser.js';
import { formatValue, getParam, packageRoot, parseRaw } from '../schema/schema.js';
import type { Change, ModelContext } from './mapping.js';
import type { PresetSpec } from './spec.js';

export const TEMPLATE_FILE = 'templates/diva-init.h2p';

export function readPresetFile(file: string): { doc: H2PDocument; text: string } {
  const text = bufferToText(fs.readFileSync(file));
  return { doc: parseH2P(text), text };
}

export function loadTemplate(): H2PDocument {
  return readPresetFile(path.join(packageRoot(), TEMPLATE_FILE)).doc;
}

export function isDivaPreset(doc: H2PDocument): boolean {
  const am = findParam(doc, 'HEAD/#AM');
  return am?.value.trim() === 'Diva';
}

export function num(doc: H2PDocument, id: string, fallback = 0): number {
  const l = findParam(doc, id);
  if (!l) return fallback;
  const v = parseRaw(l.value);
  return typeof v === 'number' ? v : fallback;
}

export function str(doc: H2PDocument, id: string): string | undefined {
  return findParam(doc, id)?.value;
}

export function getModels(doc: H2PDocument): ModelContext {
  return {
    osc: num(doc, 'OSC/Model', 1),
    filter: num(doc, 'VCF1/Model', 1),
    hpf: num(doc, 'HPF/Model', 0),
    env1: num(doc, 'ENV1/Model', 1),
    env2: num(doc, 'ENV2/Model', 1),
  };
}

export interface AppliedChange {
  id: string;
  label: string;
  before: string | undefined;
  after: string;
  reason: string;
}

/** Apply changes to a document (in place). Missing parameters are reported, not invented. */
export function applyChanges(doc: H2PDocument, changes: Change[]): { applied: AppliedChange[]; missing: string[] } {
  const applied: AppliedChange[] = [];
  const missing: string[] = [];
  for (const c of changes) {
    const p = getParam(c.id);
    const line = findParam(doc, c.id);
    if (!line) {
      missing.push(c.id);
      continue;
    }
    const raw = formatValue(p, c.value);
    const before = line.value;
    if (before !== raw) {
      setRawValue(doc, c.id, raw);
      applied.push({ id: c.id, label: p?.label ?? c.id, before, after: raw, reason: c.reason });
    }
  }
  return { applied, missing };
}

const META_ORDER = ['Bank', 'Author', 'Description', 'Usage', 'Categories', 'Features', 'Character'];

/** Merge spec meta into the existing meta block (other keys are kept). */
export function applyMeta(doc: H2PDocument, meta: PresetSpec['meta'] | undefined, extra: Record<string, string> = {}): boolean {
  if (!meta && Object.keys(extra).length === 0) return false;
  const current = new Map(doc.meta.map((m) => [m.key, latin1BytesToUtf8(m.value)]));
  const upd: Record<string, string | undefined> = {
    Bank: meta?.bank,
    Author: meta?.author,
    Description: meta?.description,
    Usage: meta?.usage,
    Categories: meta?.categories?.join(', '),
    Features: meta?.features?.join(', '),
    Character: meta?.character?.join(', '),
    ...extra,
  };
  for (const [k, v] of Object.entries(upd)) if (v !== undefined) current.set(k, v);
  const keys = [...META_ORDER.filter((k) => current.has(k)), ...[...current.keys()].filter((k) => !META_ORDER.includes(k))];
  setMeta(
    doc,
    keys.map((k) => ({ key: k, value: current.get(k) ?? '' })),
  );
  return true;
}

export function docToBuffer(doc: H2PDocument): Buffer {
  return textToBuffer(serializeH2P(doc));
}

export { cloneDoc, paramMap, serializeH2P, getMetaValue };
