#!/usr/bin/env node
/**
 * diva-mcp command line.
 *   diva-mcp serve                         start the MCP server on stdio
 *   diva-mcp analyze|describe|validate <file.h2p>
 *   diva-mcp generate <spec.json> [--subfolder X] [--dry-run]
 *   diva-mcp edit <file.h2p> <changes.json> [--out path] [--overwrite] [--dry-run]
 *   diva-mcp bank <specs.json> <output_folder> [--name "Bank Name"] [--no-zip]
 *   diva-mcp find <query> [--dir path]...
 *   diva-mcp info
 */
import fs from 'node:fs';
import { analyzePreset, describePreset, editPreset, generateBank, generatePreset, validatePreset } from './engine/operations.js';
import { findReferencePresets } from './library/search.js';
import { detectDivaLocations, outputRoot } from './library/paths.js';

const argv = process.argv.slice(2);
const cmd = argv.shift();
const flags = new Map<string, string[]>();
const pos: string[] = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]!;
  if (a.startsWith('--')) {
    const k = a.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--') && !['dry-run', 'overwrite', 'no-zip'].includes(k)) {
      flags.set(k, [...(flags.get(k) ?? []), next]);
      i++;
    } else flags.set(k, ['true']);
  } else pos.push(a);
}
const flag = (k: string) => flags.get(k)?.[0];
const json = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const print = (x: unknown) => console.log(JSON.stringify(x, null, 2));

async function main() {
  switch (cmd) {
    case 'serve':
      await import('./mcp/server.js');
      return;
    case 'analyze':
      return print(analyzePreset(pos[0]!));
    case 'describe':
      return print(describePreset(pos[0]!));
    case 'validate': {
      const r = validatePreset(pos[0]!);
      print(r);
      process.exitCode = r.structural_validation.status === 'passed' ? 0 : 1;
      return;
    }
    case 'generate':
      return print(generatePreset(json(pos[0]!), { subfolder: flag('subfolder'), dryRun: flag('dry-run') === 'true' }));
    case 'edit':
      return print(editPreset(pos[0]!, json(pos[1]!), { outputPath: flag('out'), overwrite: flag('overwrite') === 'true', dryRun: flag('dry-run') === 'true' }));
    case 'bank': {
      const specs = json(pos[0]!);
      const r = generateBank(Array.isArray(specs) ? specs : specs.presets, pos[1]!, { bankName: flag('name') ?? (Array.isArray(specs) ? undefined : specs.bank_name), zip: flag('no-zip') !== 'true' });
      print({ ...r, presets: r.presets.map((p: any) => ({ name: p.name, ok: p.ok, path: p.path, architecture: p.architecture, error: p.error, warnings: p.warnings })) });
      process.exitCode = r.failed ? 1 : 0;
      return;
    }
    case 'find':
      return print(findReferencePresets(pos.join(' '), { dirs: flags.get('dir') }));
    case 'info': {
      let out: string | null = null;
      try {
        out = outputRoot();
      } catch (e) {
        out = `unavailable: ${(e as Error).message}`;
      }
      return print({ ...detectDivaLocations(), output_root: out });
    }
    default:
      console.error('usage: diva-mcp <serve|analyze|describe|validate|generate|edit|bank|find|info> ...');
      process.exitCode = 2;
  }
}
main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});
