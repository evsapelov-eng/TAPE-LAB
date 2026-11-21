/**
 * Lossless reader/writer for u-he `.h2p` preset files (as written by Diva).
 *
 * Design goals (see docs/ARCHITECTURE.md):
 *  - Byte-exact round trip: `serialize(parse(text)) === text` for any input.
 *  - Unknown parameters, ordering, blank lines and the trailing
 *    "ugly compressed binary Data" block are preserved verbatim.
 *  - Edits change only the value part of the affected lines.
 *
 * Files are handled as latin1 strings so that every byte (including the NUL
 * bytes that terminate Diva's binary block) maps 1:1 to a JS char code.
 * Inspired by the parser in Fannon/u-he-preset-randomizer (MIT) but
 * re-implemented to be lossless.
 */

export const BINARY_MARKER = '// Section for ugly compressed binary Data';

export interface MetaEntry {
  key: string;
  /** Raw value without surrounding quotes (latin1-decoded bytes). */
  value: string;
}

export type BodyLine =
  | { kind: 'raw'; text: string }
  | {
      kind: 'param';
      /** Section the line belongs to ('HEAD' before the first `#cm=`). */
      section: string;
      key: string;
      /** Raw textual value exactly as in the file (without CR). */
      value: string;
      /** 0-based occurrence index of this key inside its section. */
      occurrence: number;
      /** True if the line ended with \r (CRLF files). */
      cr: boolean;
    };

export interface H2PDocument {
  /** Everything before the parameter body, normally the `/*@Meta ... *\/` block. */
  pre: string;
  /** Body lines (split on \n). */
  lines: BodyLine[];
  /** Everything from the binary marker to EOF, verbatim ('' if absent). */
  tail: string;
  /** Parsed view of the meta block (read-only; use setMeta to change). */
  meta: MetaEntry[];
  /** True when pre was regenerated and no longer matches the original bytes. */
  metaDirty: boolean;
}

export class H2PParseError extends Error {}

/** Decode a Buffer into the latin1 string representation used internally. */
export function bufferToText(buf: Buffer): string {
  return buf.toString('latin1');
}

export function textToBuffer(text: string): Buffer {
  return Buffer.from(text, 'latin1');
}

/** Convert a normal (unicode) JS string to its UTF-8 byte sequence as latin1 chars. */
export function utf8ToLatin1Bytes(s: string): string {
  return Buffer.from(s, 'utf8').toString('latin1');
}

/** Inverse of utf8ToLatin1Bytes (falls back to latin1 if not valid UTF-8). */
export function latin1BytesToUtf8(s: string): string {
  const buf = Buffer.from(s, 'latin1');
  const decoded = buf.toString('utf8');
  return decoded.includes('�') ? s : decoded;
}

export function parseH2P(text: string): H2PDocument {
  let pre = '';
  let rest = text;
  const metaStart = text.indexOf('/*@Meta') >= 0 ? text.indexOf('/*@Meta') : text.indexOf('/*@meta');
  if (metaStart >= 0) {
    const end = text.indexOf('*/', metaStart);
    if (end < 0) throw new H2PParseError('Unterminated /*@Meta block');
    pre = text.slice(0, end + 2);
    rest = text.slice(end + 2);
  }
  let body = rest;
  let tail = '';
  const markerIdx = rest.indexOf(BINARY_MARKER);
  if (markerIdx >= 0) {
    body = rest.slice(0, markerIdx);
    tail = rest.slice(markerIdx);
  }

  const lines: BodyLine[] = [];
  let section = 'HEAD';
  const counters = new Map<string, number>();
  for (const rawLine of body.split('\n')) {
    const cr = rawLine.endsWith('\r');
    const line = cr ? rawLine.slice(0, -1) : rawLine;
    const eq = line.indexOf('=');
    if (eq <= 0 || /\s/.test(line[0] ?? ' ')) {
      lines.push({ kind: 'raw', text: rawLine });
      continue;
    }
    const key = line.slice(0, eq);
    const value = line.slice(eq + 1);
    if (key === '#cm') section = value;
    const ck = `${section}\u0000${key}`;
    const occurrence = counters.get(ck) ?? 0;
    counters.set(ck, occurrence + 1);
    lines.push({ kind: 'param', section, key, value, occurrence, cr });
  }

  return { pre, lines, tail, meta: parseMetaBlock(pre), metaDirty: false };
}

export function serializeH2P(doc: H2PDocument): string {
  const body = doc.lines
    .map((l) => (l.kind === 'raw' ? l.text : `${l.key}=${l.value}${l.cr ? '\r' : ''}`))
    .join('\n');
  return doc.pre + body + doc.tail;
}

/** Parse "Key:\n'value'\n\n" entries of a meta block. Multi-line values are supported. */
export function parseMetaBlock(pre: string): MetaEntry[] {
  const start = pre.search(/\/\*@[Mm]eta/);
  if (start < 0) return [];
  const inner = pre.slice(start + 7, pre.lastIndexOf('*/') >= 0 ? pre.lastIndexOf('*/') : undefined);
  const rows = inner.replace(/\r/g, '').split('\n');
  const out: MetaEntry[] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i] ?? '';
    const m = /^([^:'\s][^:']*):\s*$/.exec(row);
    if (!m) {
      i++;
      continue;
    }
    const key = m[1]!.trim();
    i++;
    while (i < rows.length && (rows[i] ?? '').trim() === '') i++;
    const first = rows[i] ?? '';
    if (!first.startsWith("'")) {
      out.push({ key, value: first.trim() });
      i++;
      continue;
    }
    // Quoted, possibly multi-line value.
    let value = first.slice(1);
    if (value.endsWith("'") && value.length >= 1) {
      out.push({ key, value: value.slice(0, -1) });
      i++;
      continue;
    }
    i++;
    while (i < rows.length) {
      const r = rows[i] ?? '';
      if (r.endsWith("'")) {
        value += '\n' + r.slice(0, -1);
        i++;
        break;
      }
      value += '\n' + r;
      i++;
    }
    out.push({ key, value });
  }
  return out;
}

export function buildMetaBlock(meta: MetaEntry[]): string {
  let s = '/*@Meta\n\n';
  for (const e of meta) {
    s += `${e.key}:\n'${e.value}'\n\n`;
  }
  return s + '*/';
}

/** Replace the meta block. Values are expected as unicode strings and are written as UTF-8. */
export function setMeta(doc: H2PDocument, entries: { key: string; value: string }[]): void {
  const clean = entries.map((e) => ({
    key: e.key.replace(/[:\n\r']/g, '').trim(),
    value: utf8ToLatin1Bytes(sanitizeMetaValue(e.value)),
  }));
  const leading = doc.pre.slice(0, Math.max(0, doc.pre.search(/\/\*@[Mm]eta/)));
  doc.pre = leading + buildMetaBlock(clean);
  doc.meta = parseMetaBlock(doc.pre);
  doc.metaDirty = true;
}

/** Single quotes terminate values in the meta format; newlines are encoded as Diva does (literal \r\n). */
export function sanitizeMetaValue(v: string): string {
  return v.replace(/'/g, '’').replace(/\r?\n/g, '\\r\\n');
}

export function getMetaValue(doc: H2PDocument, key: string): string | undefined {
  const e = doc.meta.find((m) => m.key.toLowerCase() === key.toLowerCase());
  return e ? latin1BytesToUtf8(e.value) : undefined;
}

/** Stable id of a parameter line: "SECTION/Key" (+ "#n" for repeated keys such as #ms). */
export function paramId(section: string, key: string, occurrence = 0): string {
  return occurrence === 0 ? `${section}/${key}` : `${section}/${key}#${occurrence}`;
}

export type ParamLine = Extract<BodyLine, { kind: 'param' }>;

export function paramLines(doc: H2PDocument): ParamLine[] {
  return doc.lines.filter((l): l is ParamLine => l.kind === 'param');
}

export function findParam(doc: H2PDocument, id: string): ParamLine | undefined {
  const { section, key, occurrence } = splitId(id);
  return paramLines(doc).find((l) => l.section === section && l.key === key && l.occurrence === occurrence);
}

export function splitId(id: string): { section: string; key: string; occurrence: number } {
  const slash = id.indexOf('/');
  if (slash <= 0) throw new Error(`Invalid parameter id "${id}" (expected SECTION/Key)`);
  const section = id.slice(0, slash);
  let key = id.slice(slash + 1);
  let occurrence = 0;
  const hash = key.lastIndexOf('#');
  if (hash > 0 && /^\d+$/.test(key.slice(hash + 1))) {
    occurrence = parseInt(key.slice(hash + 1), 10);
    key = key.slice(0, hash);
  }
  return { section, key, occurrence };
}

/** Map of id -> raw value for every parameter line. */
export function paramMap(doc: H2PDocument): Map<string, string> {
  const m = new Map<string, string>();
  for (const l of paramLines(doc)) m.set(paramId(l.section, l.key, l.occurrence), l.value);
  return m;
}

/** Set a raw value on an existing line. Returns false if the parameter does not exist. */
export function setRawValue(doc: H2PDocument, id: string, raw: string): boolean {
  const line = findParam(doc, id);
  if (!line) return false;
  if (/[\r\n]/.test(raw)) throw new Error(`Value for ${id} must not contain line breaks`);
  line.value = raw;
  return true;
}

/** Deep copy (documents are plain data). */
export function cloneDoc(doc: H2PDocument): H2PDocument {
  return {
    pre: doc.pre,
    tail: doc.tail,
    metaDirty: doc.metaDirty,
    meta: doc.meta.map((m) => ({ ...m })),
    lines: doc.lines.map((l) => ({ ...l })),
  };
}

export function hasBinaryData(doc: H2PDocument): boolean {
  // The marker block followed by real payload (Diva writes "$$$$" chunks).
  return doc.tail.replace(BINARY_MARKER, '').replace("// DON'T TOUCH THIS", '').replace(/[\s\0]/g, '').length > 0;
}

/** Footer written for text-only presets (same layout Diva/u-he tools use, without payload). */
export const TEXT_ONLY_TAIL = `${BINARY_MARKER}\n// DON'T TOUCH THIS\n\n`;
