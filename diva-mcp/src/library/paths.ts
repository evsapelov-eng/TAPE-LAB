/**
 * Locating the Diva preset library.
 *
 * Default locations are taken from the Diva User Guide v1.4.8 ("Install /
 * uninstall"): Windows and macOS. Linux locations are NOT documented in the
 * manual and are marked unverified.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export interface Location {
  kind: 'user' | 'local';
  path: string;
  exists: boolean;
  source: 'manual' | 'unverified' | 'env';
}

function candidates(): Location[] {
  const home = os.homedir();
  const out: Omit<Location, 'exists'>[] = [];
  if (process.env.DIVA_USER_PRESETS_DIR) out.push({ kind: 'user', path: process.env.DIVA_USER_PRESETS_DIR, source: 'env' });
  if (process.env.DIVA_FACTORY_PRESETS_DIR) out.push({ kind: 'local', path: process.env.DIVA_FACTORY_PRESETS_DIR, source: 'env' });
  if (process.platform === 'darwin') {
    out.push({ kind: 'user', path: path.join(home, 'Library/Audio/Presets/u-he/Diva'), source: 'manual' });
    out.push({ kind: 'local', path: '/Library/Audio/Presets/u-he/Diva', source: 'manual' });
  } else if (process.platform === 'win32') {
    out.push({ kind: 'user', path: path.join(home, 'Documents/u-he/Diva.data/UserPresets/Diva'), source: 'manual' });
    out.push({ kind: 'local', path: path.join(home, 'Documents/u-he/Diva.data/Presets/Diva'), source: 'manual' });
    for (const base of ['C:/Program Files/Common Files/VST3', 'C:/Program Files/VSTPlugins', 'C:/Program Files/Common Files/CLAP/u-he', 'C:/VstPlugins/u-he']) {
      out.push({ kind: 'user', path: path.join(base, 'Diva.data/UserPresets/Diva'), source: 'unverified' });
      out.push({ kind: 'local', path: path.join(base, 'Diva.data/Presets/Diva'), source: 'unverified' });
    }
  } else {
    for (const base of [path.join(home, '.u-he/Diva'), path.join(home, '.u-he/Diva.data')]) {
      out.push({ kind: 'user', path: path.join(base, 'UserPresets/Diva'), source: 'unverified' });
      out.push({ kind: 'local', path: path.join(base, 'Presets/Diva'), source: 'unverified' });
    }
    // WSL: Windows user folders.
    if (fs.existsSync('/mnt/c/Users')) {
      for (const u of safeReaddir('/mnt/c/Users')) {
        const base = path.join('/mnt/c/Users', u, 'Documents/u-he/Diva.data');
        out.push({ kind: 'user', path: path.join(base, 'UserPresets/Diva'), source: 'manual' });
        out.push({ kind: 'local', path: path.join(base, 'Presets/Diva'), source: 'manual' });
      }
    }
  }
  return out.map((c) => ({ ...c, exists: isDir(c.path) }));
}

function safeReaddir(p: string): string[] {
  try {
    return fs.readdirSync(p);
  } catch {
    return [];
  }
}

export function isDir(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

export function detectDivaLocations() {
  const all = candidates();
  return {
    platform: process.platform,
    user_presets: all.find((c) => c.kind === 'user' && c.exists) ?? null,
    factory_presets: all.filter((c) => c.kind === 'local' && c.exists),
    candidates_checked: all,
  };
}

export class OutputLocationError extends Error {}

/**
 * Root folder for everything diva-mcp writes. Determined from the real
 * installation (<user presets>/diva-mcp) unless DIVA_MCP_OUTPUT_DIR is set.
 */
export function outputRoot(): string {
  if (process.env.DIVA_MCP_OUTPUT_DIR) return path.resolve(process.env.DIVA_MCP_OUTPUT_DIR);
  const det = detectDivaLocations();
  if (!det.user_presets) {
    throw new OutputLocationError(
      'No Diva user preset folder was found on this machine. Checked: ' +
        det.candidates_checked.filter((c) => c.kind === 'user').map((c) => c.path).join('; ') +
        '. Install Diva, or set DIVA_USER_PRESETS_DIR (your Diva user preset folder) or DIVA_MCP_OUTPUT_DIR explicitly.',
    );
  }
  return path.join(det.user_presets.path, 'diva-mcp');
}

/** Folders diva-mcp must never write into (factory/local library). */
export function protectedRoots(): string[] {
  const det = detectDivaLocations();
  const roots = det.candidates_checked.filter((c) => c.kind === 'local').map((c) => c.path);
  if (process.env.DIVA_PROTECTED_DIRS) roots.push(...process.env.DIVA_PROTECTED_DIRS.split(path.delimiter).filter(Boolean));
  return roots.map((r) => path.resolve(r));
}

/** Directories scanned by find_reference_presets by default. */
export function referenceDirs(extra: string[] = []): string[] {
  const det = detectDivaLocations();
  const dirs = [...extra];
  if (det.user_presets) dirs.push(det.user_presets.path);
  dirs.push(...det.factory_presets.map((f) => f.path));
  if (process.env.DIVA_REFERENCE_DIRS) dirs.push(...process.env.DIVA_REFERENCE_DIRS.split(path.delimiter).filter(Boolean));
  return [...new Set(dirs.map((d) => path.resolve(d)))].filter(isDir);
}
