/** Test 3 — Parameter editing, plus safety guarantees. */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { bufferToText, paramMap, parseH2P } from '../src/h2p/parser.js';
import { editPreset, SpecError } from '../src/engine/operations.js';
import { UnsafeWriteError } from '../src/library/safety.js';
import { fixture, sha, tmpDir, withEnv } from './helpers.js';

function copyFixture(name: string): string {
  const dir = tmpDir();
  const p = path.join(dir, name);
  fs.copyFileSync(fixture(name), p);
  return p;
}

describe('Test 3 — Parameter editing', () => {
  it('changes one confirmed parameter and preserves everything else', () => {
    const src = copyFixture('PD Current Plum Evy.h2p');
    const before = sha(src);
    const r = editPreset(src, { params: { 'VCF1/Res': 30 } });
    expect(sha(src)).toBe(before); // original untouched
    expect(r.path).toBe(path.join(path.dirname(src), 'PD Current Plum Evy v2.h2p'));
    expect(r.changes).toEqual([expect.objectContaining({ id: 'VCF1/Res', before: '17.50', after: '30.00' })]);
    expect(r.unchanged_parameters_preserved).toBe(true);
    expect(r.binary_block_preserved).toBe(true);
    expect(r.validation.structural_validation.status).toBe('passed');

    const a = paramMap(parseH2P(bufferToText(fs.readFileSync(src))));
    const b = paramMap(parseH2P(bufferToText(fs.readFileSync(r.path!))));
    for (const [k, v] of a) if (k !== 'VCF1/Res') expect(b.get(k), k).toBe(v);
    expect(b.get('VCF1/Res')).toBe('30.00');
    // byte-level: only one line differs
    const la = fs.readFileSync(src, 'latin1').split('\n');
    const lb = fs.readFileSync(r.path!, 'latin1').split('\n');
    expect(la.filter((l, i) => l !== lb[i]).length).toBe(1);
  });

  it('supports relative edits with clamping and versioned names', () => {
    const src = copyFixture('PD Current Plum Evy.h2p');
    const r1 = editPreset(src, { params: { 'ENV1/Atk': { add: 20 }, 'VCF1/Res': { scale: 0.5 } } });
    expect(r1.changes.find((c) => c.id === 'ENV1/Atk')!.after).toBe('27.00');
    expect(r1.changes.find((c) => c.id === 'VCF1/Res')!.after).toBe('8.75');
    const r2 = editPreset(r1.path!, { params: { 'VCF1/Res': { add: 500 } } });
    expect(r2.path!.endsWith('PD Current Plum Evy v3.h2p')).toBe(true);
    expect(r2.changes[0]!.after).toBe('100.00');
    expect(r2.warnings.some((w) => w.includes('clamped'))).toBe(true);
  });

  it('applies partial specs (musical edits) through the mapping layer', () => {
    const src = copyFixture('PD Current Plum Evy.h2p');
    // "make the attack slower, reduce resonance, add slight pitch instability"
    const r = editPreset(src, { spec: { env1: { attack: 45 }, filter: { model: 'bite', resonance: 8 }, trimmers: { drift: 60 } } });
    const ids = r.changes.map((c) => c.id).sort();
    expect(ids).toEqual(['ENV1/Atk', 'OSC/Drift', 'VCF1/Res']);
  });

  it('rejects invalid values, unknown ids, global params and incompatible controls', () => {
    const src = copyFixture('PD Current Plum Evy.h2p');
    expect(() => editPreset(src, { params: { 'VCF1/Res': 150 } })).toThrow(SpecError);
    expect(() => editPreset(src, { params: { 'VCF1/Bogus': 1 } })).toThrow(/Unknown Diva parameter/);
    expect(() => editPreset(src, { params: { 'PCore/Rev': 1 } })).toThrow(/global/);
    expect(() => editPreset(src, { params: { 'OSC/Model': 9 } })).toThrow(/not a known option|outside range/);
    // Bite filter has no "mode"
    expect(() => editPreset(src, { spec: { filter: { model: 'bite', mode: 'hp' } } })).toThrow(/only available for multimode/);
    // parameter missing in an older layout is not invented
    const old = copyFixture('PD Bold Indigo Marja.h2p');
    expect(() => editPreset(old, { params: { 'VCC/MuCore': 1 } })).toThrow();
  });

  it('warns when editing a parameter of an inactive module', () => {
    const src = copyFixture('PD Current Plum Evy.h2p'); // Dual VCO
    const r = editPreset(src, { params: { 'OSC/Shape1': 3 } });
    expect(r.warnings.some((w) => w.includes('inactive'))).toBe(true);
  });

  it('overwrite makes a backup; never writes into a protected (factory) folder', () => {
    const src = copyFixture('PD Current Plum Evy.h2p');
    const before = fs.readFileSync(src);
    const r = editPreset(src, { params: { 'VCF1/Res': 31 } }, { overwrite: true });
    expect(r.overwritten).toBe(true);
    expect(fs.readFileSync(r.backup!)).toEqual(before);

    const factory = path.dirname(copyFixture('PD Current Plum Evy.h2p'));
    const out = tmpDir();
    withEnv({ DIVA_PROTECTED_DIRS: factory, DIVA_MCP_OUTPUT_DIR: out }, () => {
      const f = path.join(factory, 'PD Current Plum Evy.h2p');
      const h = sha(f);
      const res = editPreset(f, { params: { 'VCF1/Res': 5 } });
      expect(res.path!.startsWith(path.join(out, 'edits'))).toBe(true);
      expect(sha(f)).toBe(h);
      expect(() => editPreset(f, { params: { 'VCF1/Res': 6 } }, { overwrite: true })).toThrow(UnsafeWriteError);
    });
  });
});
