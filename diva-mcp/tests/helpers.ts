import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

export const FIXTURES = path.resolve(__dirname, 'fixtures');
export const fixture = (name: string) => path.join(FIXTURES, name);
export const FIXTURE_FILES = fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.h2p')).map(fixture);

export function tmpDir(prefix = 'diva-mcp-test-'): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

export function sha(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** Run fn with env vars temporarily set. */
export function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const old: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    old[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(old)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

/** Optional external corpus (e.g. your own Diva library) for round-trip tests. */
export function corpusFiles(): string[] {
  const dir = process.env.DIVA_TEST_PRESETS_DIR;
  if (!dir) return [];
  const out: string[] = [];
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.toLowerCase().endsWith('.h2p')) out.push(p);
    }
  };
  for (const d of dir.split(path.delimiter)) if (d) walk(d);
  return out;
}
