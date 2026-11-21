/** Test 4 — Sound architecture: every oscillator x filter model, compatibility rules, determinism. */
import { describe, expect, it } from 'vitest';
import { buildPreset, SpecError } from '../src/engine/operations.js';
import { analyzeDocument } from '../src/engine/analyze.js';
import { paramMap } from '../src/h2p/parser.js';
import { getParam, isActiveFor } from '../src/schema/schema.js';

const OSC: Record<string, object> = {
  triple_vco: { model: 'triple_vco', osc1: { octave: -1, shape: 5 }, osc2: { semitones: 0.07, shape: 5, volume: 70 }, osc3: { semitones: -12, shape: 3, volume: 40 } },
  dual_vco: { model: 'dual_vco', osc1: { saw: true, pulse: false }, osc2: { semitones: 0.05, saw: true }, mix: 45, sync: false },
  dco: { model: 'dco', octave: 0, pulse_shape: 3, saw_shape: 1, sub_shape: 0, sub_volume: 40, pulse_width: 40 },
  dual_vco_eco: { model: 'dual_vco_eco', osc1: { wave_raw: 2, volume: 80 }, osc2: { semitones: 7, wave_raw: 1, volume: 40 } },
  digital: { model: 'digital', osc1: { wave: 'multisaw' }, osc2: { wave: 'sawtooth', semitones: 12 }, mix: 30 },
};
const FILTER: Record<string, object> = {
  ladder: { model: 'ladder', cutoff: 70, resonance: 20, slope: '24db' },
  cascade: { model: 'cascade', cutoff: 80, character: 'clean' },
  multimode: { model: 'multimode', cutoff: 90, mode: 'lp2' },
  bite: { model: 'bite', cutoff: 75, revision: 2 },
  uhbie: { model: 'uhbie', cutoff: 85, uhbie_mix: 30, uhbie_center: 'bandpass' },
};
const OSC_NAMES = ['Triple VCO', 'Dual VCO', 'DCO', 'Dual VCO Eco', 'Digital'];
const FILTER_NAMES = ['Ladder', 'Cascade', 'Multimode', 'Bite', 'Uhbie'];

describe('Test 4 — all oscillator x filter combinations', () => {
  Object.entries(OSC).forEach(([ok, o], oi) => {
    Object.entries(FILTER).forEach(([fk, f], fi) => {
      it(`${ok} + ${fk}`, () => {
        const r = buildPreset({ meta: { name: `${ok} ${fk}` }, oscillator: o, filter: f, env1: { attack: 10 } });
        expect(r.validation.structural_validation.status).toBe('passed');
        const a = analyzeDocument(r.doc);
        expect(a.oscillator.model).toBe(OSC_NAMES[oi]);
        expect(a.filter.model).toBe(FILTER_NAMES[fi]);
        // every parameter written by the mapping is active for the chosen models
        const models = { osc: oi, filter: fi, hpf: 0, env1: 1, env2: 1 };
        for (const c of r.applied) {
          const p = getParam(c.id)!;
          if (!c.id.endsWith('/Model')) expect(isActiveFor(p, models), c.id).toBe(true);
        }
      });
    });
  });
});

describe('Test 4 — compatibility rules (no invented routes or controls)', () => {
  const bad: [string, object, RegExp][] = [
    ['PWM on Triple VCO', { oscillator: { model: 'triple_vco' }, modulation: { pulse_width: { source: 'LFO2', amount: 10 } } }, /PWM slot does not exist/],
    ['HPF with Triple VCO', { oscillator: { model: 'triple_vco' }, hpf: { model: 'pre', frequency: 40 } }, /HPF\/Feedback panel does not exist/],
    ['shape mod on DCO', { oscillator: { model: 'dco' }, modulation: { shape: { source: 'LFO2', amount: 10 } } }, /shape modulation does not exist/],
    ['Uhbie mix mod on Ladder', { filter: { model: 'ladder' }, modulation: { uhbie_mix: { source: 'LFO1', amount: 10 } } }, /only exists for the Uhbie/],
    ['multimode mode on Cascade', { filter: { model: 'cascade', mode: 'hp' } }, /only available for multimode/],
    ['filter FM on Bite', { filter: { model: 'bite', filter_fm: 3 } }, /Bite has no filter FM/],
    ['release on ADS', { env1: { model: 'ads', release: 30 } }, /ADS model has no separate release/],
    ['quantise on Analogue env', { env2: { model: 'analogue', quantise: true } }, /only available for the digital model/],
    ['feedback with HPF Pre', { oscillator: { model: 'dco', feedback: 30 }, hpf: { model: 'pre' } }, /Feedback is only available/],
    ['HPF resonance on Pre', { oscillator: { model: 'dco' }, hpf: { model: 'pre', resonance: 30 } }, /only available for "bite"/],
    ['unknown mod source', { modulation: { cutoff_1: { source: 'Env3', amount: 10 } } }, /Unknown modulation source/],
    ['out of range cutoff', { filter: { model: 'ladder', cutoff: 200 } }, /cutoff/],
    ['invalid voice count', { voice: { voices: 7 } }, /voices must be one of/],
    ['unknown field', { filter: { model: 'ladder', drive: 3 } }, /Unrecognized key|drive/],
  ];
  for (const [label, spec, re] of bad) {
    it(`rejects: ${label}`, () => {
      expect(() => buildPreset(spec)).toThrow(SpecError);
      expect(() => buildPreset(spec)).toThrow(re);
    });
  }

  it('maps fixed modulation slots to the right parameters', () => {
    const r = buildPreset({
      oscillator: { model: 'dual_vco' },
      filter: { model: 'ladder' },
      modulation: { cutoff_1: { source: 'Env2', amount: 40 }, cutoff_2: { source: 'Pressure', amount: 20 }, pulse_width: { source: 'LFO2', amount: 15 }, vibrato: 10 },
      lfo1: { depth_source: 'ModWhl', depth: 0 },
    });
    const m = paramMap(r.doc);
    expect(m.get('VCF1/FMSrc')).toBe('15');
    expect(m.get('VCF1/FMDpt')).toBe('40.00');
    expect(m.get('VCF1/FM2Src')).toBe('7');
    expect(m.get('OSC/PWMSrc')).toBe('17');
    expect(m.get('OSC/VtoD')).toBe('10.00');
    expect(m.get('LFO1/DMS1')).toBe('1');
  });

  it('effects map to the right sections and module strings', () => {
    const r = buildPreset({ fx1: { type: 'delay', left: 3, center: 4, right: 6, wow: 40 }, fx2: { type: 'rotary', mode: 'syncbass', controller: 'pressure' } });
    const m = paramMap(r.doc);
    expect(m.get('FX1/Module')).toBe("'Delay1'");
    expect(m.get('main/#FX1')).toBe('1');
    expect(m.get('Delay1/Wow')).toBe('40.00');
    expect(m.get('FX2/Module')).toBe("'Rotary2'");
    expect(m.get('Rtary2/Mode')).toBe('1');
    expect(m.get('Rtary2/Cont')).toBe('3');
  });

  it('is deterministic: same spec -> identical bytes', () => {
    const spec = { meta: { name: 'Det' }, oscillator: OSC.digital, filter: FILTER.uhbie, fx1: { type: 'chorus' } };
    expect(buildPreset(spec).bytes.equals(buildPreset(JSON.parse(JSON.stringify(spec))).bytes)).toBe(true);
  });

  it('writes metadata (UTF-8) and never alters the #ms list', () => {
    const r = buildPreset({ meta: { name: 'Meta', author: 'Tester', categories: ['Pads:Analogue'], description: "Läuft's" } });
    const text = r.bytes.toString('utf8');
    expect(text).toContain("Categories:\n'Pads:Analogue'");
    expect(text).toContain('Läuft’s');
    expect(r.validation.structural_validation.checks.find((c) => c.name.startsWith('modulation source'))!.status).toBe('passed');
  });
});

describe('Arpeggiator mapping', () => {
  it('maps arp settings to ARP/CLK parameters', () => {
    const r = buildPreset({ arp: { enabled: true, mode: 'up_down_1', progression: 'leap', octaves_raw: 1, swing: 35, clock_multiply: 50, strict_sync: true } });
    const m = paramMap(r.doc);
    expect(m.get('ARP/OnOff')).toBe('1');
    expect(m.get('ARP/Dir')).toBe('3');
    expect(m.get('ARP/Order')).toBe('2');
    expect(m.get('ARP/Oct')).toBe('1');
    expect(m.get('CLK/Swing')).toBe('35.00');
    expect(m.get('CLK/Mult')).toBe('50.00');
    expect(r.warnings).toEqual([]);
    expect(analyzeDocument(r.doc).arpeggiator).toMatchObject({ enabled: true, mode: 'up+dn 1', swing: 35 });
  });
  it('warns on unconfirmed raw arp values and keeps the observed default octave value', () => {
    expect(buildPreset({ arp: { octaves_raw: 3 } }).warnings.join(' ')).toMatch(/octaves_raw/);
    expect(paramMap(buildPreset({}).doc).get('ARP/Oct')).toBe('1');
  });
});
