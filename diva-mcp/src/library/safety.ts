/**
 * Write guards. diva-mcp never deletes files, never writes into the factory
 * library, and backs up any file it is explicitly asked to overwrite.
 */
import fs from 'node:fs';
import path from 'node:path';
import { outputRoot, protectedRoots } from './paths.js';

export class UnsafeWriteError extends Error {}

const within = (child: string, parent: string) => {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};

export function assertWritable(target: string): void {
  const abs = path.resolve(target);
  for (const root of protectedRoots()) {
    if (within(abs, root)) throw new UnsafeWriteError(`Refusing to write into the factory/local Diva library (${root}). Write to your user folder instead.`);
  }
  if (!abs.toLowerCase().endsWith('.h2p') && !/\.(md|json|zip)$/i.test(abs)) throw new UnsafeWriteError(`Refusing to write unexpected file type: ${abs}`);
}

/** File-name safe version of a preset name (keeps spaces, strips path chars). */
export function safeFileName(name: string): string {
  const cleaned = name
    .replace(/[–—]/g, '-')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\.+/, '');
  return cleaned.slice(0, 80) || 'Untitled';
}

/** Resolve a folder relative to the output root (absolute paths are accepted but still guarded). */
export function resolveOutputDir(subfolder?: string): string {
  if (subfolder && path.isAbsolute(subfolder)) return path.resolve(subfolder);
  const root = outputRoot();
  const dir = path.resolve(root, subfolder ?? '');
  if (!within(dir, root)) throw new UnsafeWriteError(`Subfolder "${subfolder}" escapes the output root ${root}`);
  return dir;
}

/** First non-existing path: "Name.h2p", "Name 2.h2p", ... */
export function uniquePath(dir: string, base: string, ext = '.h2p', taken: Set<string> = new Set()): string {
  let candidate = path.join(dir, `${base}${ext}`);
  for (let i = 2; fs.existsSync(candidate) || taken.has(candidate.toLowerCase()); i++) candidate = path.join(dir, `${base} ${i}${ext}`);
  return candidate;
}

export interface WriteResult {
  path: string;
  overwritten: boolean;
  backup?: string;
}

export function safeWrite(target: string, data: Buffer | string, opts: { overwrite?: boolean } = {}): WriteResult {
  const abs = path.resolve(target);
  assertWritable(abs);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  let backup: string | undefined;
  const exists = fs.existsSync(abs);
  if (exists && !opts.overwrite) throw new UnsafeWriteError(`File exists: ${abs} (pass overwrite=true to replace it; a backup will be made)`);
  if (exists) {
    const bdir = path.join(path.dirname(abs), '.diva-mcp-backups');
    fs.mkdirSync(bdir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    backup = path.join(bdir, `${path.basename(abs, path.extname(abs))}.${stamp}${path.extname(abs)}`);
    fs.copyFileSync(abs, backup);
  }
  const tmp = `${abs}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, abs);
  return { path: abs, overwritten: exists, backup };
}
