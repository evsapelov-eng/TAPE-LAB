/** Test 5 — Bank generation, plus output-location rules. */
import fs from 'node:fs';
import path from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import { generateBank, generatePreset, validatePreset } from '../src/engine/operations.js';
import { tmpDir, withEnv } from './helpers.js';
import { OutputLocationError } from '../src/library/paths.js';

const SPECS = [
  { meta: { name: 'PD One', categories: ['Pads:Analogue'] }, oscillator: { model: 'dual_vco' }, filter: { model: 'cascade', cutoff: 80 }, env1: { attack: 50 } },
  { meta: { name: 'BS Two' }, oscillator: { model: 'triple_vco', osc1: { octave: -1 } }, filter: { model: 'ladder', cutoff: 55 }, voice: { mode: 'mono' } },
  { meta: { name: 'KY Three' }, oscillator: { model: 'dco', pulse_shape: 3 }, filter: { model: 'multimode', mode: 'lp4' }, fx1: { type: 'chorus' } },
  { meta: { name: 'PL Four' }, oscillator: { model: 'digital', osc1: { wave: 'triangle' } }, filter: { model: 'uhbie' }, fx1: { type: 'delay', wow: 50 } },
  { meta: { name: 'LD Five' }, oscillator: { model: 'triple_vco' }, filter: { model: 'bite', revision: 2 }, voice: { mode: 'legato', glide: 20 } },
];

describe('Test 5 — Bank generation', () => {
  it('creates five validated presets, README, report and ZIP', () => {
    const out = tmpDir();
    const r = withEnv({ DIVA_MCP_OUTPUT_DIR: out }, () => generateBank(SPECS, 'Test Bank', { bankName: 'Test Bank' }));
    expect(r.created).toBe(5);
    expect(r.failed).toBe(0);
    for (const p of r.presets) {
      expect(fs.existsSync(p.path)).toBe(true);
      expect(validatePreset(p.path).structural_validation.status).toBe('passed');
    }
    const archs = new Set(r.presets.map((p: any) => p.architecture));
    expect(archs.size).toBe(5);
    expect(fs.readFileSync(r.readme, 'utf8')).toContain('Diva load test');
    const zip = unzipSync(new Uint8Array(fs.readFileSync(r.zip!)));
    const names = Object.keys(zip).sort();
    expect(names).toContain('Test Bank/PD One.h2p');
    expect(names).toContain('Test Bank/README.md');
    expect(names.filter((n) => n.endsWith('.h2p')).length).toBe(5);
    expect(strFromU8(zip['Test Bank/PD One.h2p']!)).toBe(fs.readFileSync(path.join(out, 'Test Bank', 'PD One.h2p'), 'utf8'));
  });

  it('continues after a failing spec and makes names unique', () => {
    const out = tmpDir();
    const specs = [SPECS[0], { meta: { name: 'Broken' }, filter: { model: 'ladder', cutoff: 999 } }, SPECS[0]];
    const r = withEnv({ DIVA_MCP_OUTPUT_DIR: out }, () => generateBank(specs, 'B', { zip: false }));
    expect(r.created).toBe(2);
    expect(r.failed).toBe(1);
    expect(r.presets[1].error).toMatch(/cutoff/);
    expect(r.presets.filter((p: any) => p.ok).map((p: any) => p.name)).toEqual(['PD One', 'PD One 2']);
  });

  it('never overwrites an existing preset by default', () => {
    const out = tmpDir();
    withEnv({ DIVA_MCP_OUTPUT_DIR: out }, () => {
      const a = generatePreset(SPECS[0], { subfolder: 'x' });
      const b = generatePreset(SPECS[0], { subfolder: 'x' });
      expect(a.path).not.toBe(b.path);
      expect(fs.readFileSync(a.path!)).toEqual(fs.readFileSync(b.path!));
    });
  });

  it('refuses to guess an output folder when no Diva installation is found', () => {
    const home = tmpDir();
    withEnv({ DIVA_MCP_OUTPUT_DIR: undefined, DIVA_USER_PRESETS_DIR: undefined, HOME: home, USERPROFILE: home }, () => {
      expect(() => generatePreset(SPECS[0])).toThrow(OutputLocationError);
    });
  });

  it('uses <user presets>/diva-mcp when the user preset folder exists', () => {
    const user = tmpDir();
    withEnv({ DIVA_MCP_OUTPUT_DIR: undefined, DIVA_USER_PRESETS_DIR: user }, () => {
      const r = generatePreset(SPECS[2], { subfolder: 'Lab' });
      expect(r.path).toBe(path.join(user, 'diva-mcp', 'Lab', 'KY Three.h2p'));
    });
  });
});
