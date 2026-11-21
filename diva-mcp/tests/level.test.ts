/** Output level standard and heuristic level check. */
import { describe, expect, it } from 'vitest';
import { buildPreset } from '../src/engine/operations.js';
import { paramMap } from '../src/h2p/parser.js';
import { LEVEL_STANDARD } from '../src/engine/level.js';

describe('Output level standard', () => {
  it('new presets default to Output 80 / VCA 42', () => {
    const r = buildPreset({ meta: { name: 'Lvl' } });
    const m = paramMap(r.doc);
    expect(m.get('main/CcOp')).toBe('80.00');
    expect(m.get('VCA1/Vol')).toBe('42.00');
    expect(LEVEL_STANDARD).toMatchObject({ output: 80, vca: 42 });
    expect(r.validation.level_check.risk).toBe('low');
  });

  it('flags hot gain staging (the levels of the first VOL. 01 release)', () => {
    const r = buildPreset({ amp: { output: 100, volume: 55 }, oscillator: { model: 'triple_vco', osc1: { volume: 100 }, osc2: { volume: 100 }, osc3: { volume: 80 } } });
    expect(r.validation.level_check.risk).toBe('high');
    expect(r.validation.level_check.suggestion).toMatch(/Output/);
    expect(r.validation.warnings.some((w) => w.includes('Output level risk high'))).toBe(true);
  });

  it('counts resonance on Bite and long delay feedback as risk factors', () => {
    const r = buildPreset({ filter: { model: 'bite', resonance: 85 }, fx1: { type: 'delay', feedback: 75 } });
    expect(r.validation.level_check.factors.join(' ')).toMatch(/Resonance 85 on Bite/);
    expect(r.validation.level_check.factors.join(' ')).toMatch(/Delay FX1 feedback 75/);
  });
});
