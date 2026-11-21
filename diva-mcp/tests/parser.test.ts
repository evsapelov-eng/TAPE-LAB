/** Test 1 (Read) and Test 2 (Round-trip). */
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bufferToText, getMetaValue, paramMap, parseH2P, serializeH2P, setRawValue, findParam, hasBinaryData } from '../src/h2p/parser.js';
import { analyzePreset } from '../src/engine/operations.js';
import { corpusFiles, fixture, FIXTURE_FILES } from './helpers.js';

const read = (f: string) => bufferToText(fs.readFileSync(f));

describe('Test 1 — Read real Diva presets', () => {
  it('parses metadata, header and known parameters', () => {
    const doc = parseH2P(read(fixture('PD Current Plum Evy.h2p')));
    expect(getMetaValue(doc, 'Bank')).toBe('Diva Generated Vol. 1');
    expect(getMetaValue(doc, 'Categories')).toBe('Pads:Analogue, Keys:Analogue');
    const m = paramMap(doc);
    expect(m.get('HEAD/#AM')).toBe('Diva');
    expect(m.get('OSC/Model')).toBe('1');
    expect(m.get('VCF1/Model')).toBe('3');
    expect(m.get('VCF1/Freq')).toBe('73.00');
    expect(m.get('FX1/Module')).toBe("'Plate1'");
    // repeated keys get occurrence ids
    expect(m.get('HEAD/#ms')).toBe('none');
    expect(m.get('HEAD/#ms#23')).toBe('Multiply');
    expect(hasBinaryData(doc)).toBe(true);
  });

  it('extracts a structured analysis with correct model names', () => {
    const a = analyzePreset(fixture('PD Current Plum Evy.h2p'));
    expect(a.oscillator.model).toBe('Dual VCO');
    expect(a.filter.model).toBe('Bite');
    expect(a.effects[0]!.type).toBe('Plate');
    expect(a.modulations.routes.some((r) => r.destination === 'Cutoff (mod 1)' && r.source === 'Env2' && r.amount === 60)).toBe(true);
    const b = analyzePreset(fixture('BS Leading Peach Glad.h2p'));
    expect(b.oscillator.model).toBe('Triple VCO');
    expect((b.hpf as { active: boolean }).active).toBe(false);
  });

  it('reads the older 402-line layout', () => {
    const doc = parseH2P(read(fixture('PD Bold Indigo Marja.h2p')));
    expect(paramMap(doc).get('OSC/Tune1')).toBe('-24');
    expect(findParam(doc, 'MPE/Status')).toBeUndefined();
  });
});

describe('Test 2 — Round-trip', () => {
  for (const f of [...FIXTURE_FILES, ...corpusFiles()]) {
    it(`byte-identical: ${f.split('/').pop()}`, () => {
      const text = read(f);
      const doc = parseH2P(text);
      const out = serializeH2P(doc);
      expect(out).toBe(text);
      const again = parseH2P(out);
      expect([...paramMap(again)]).toEqual([...paramMap(doc)]);
      expect(again.meta).toEqual(doc.meta);
      expect(again.tail).toBe(doc.tail);
    });
  }

  it('handles CRLF line endings and missing meta/footer losslessly', () => {
    const crlf = read(FIXTURE_FILES[0]!).replace(/\n/g, '\r\n');
    expect(serializeH2P(parseH2P(crlf))).toBe(crlf);
    const bare = '#AM=Diva\n#cm=main\nCcOp=50.00\n';
    const d = parseH2P(bare);
    expect(serializeH2P(d)).toBe(bare);
    expect(paramMap(d).get('main/CcOp')).toBe('50.00');
  });

  it('a single edit changes exactly one line', () => {
    const text = read(fixture('PD Current Plum Evy.h2p'));
    const doc = parseH2P(text);
    setRawValue(doc, 'VCF1/Res', '42.00');
    const out = serializeH2P(doc).split('\n');
    const orig = text.split('\n');
    const diff = orig.map((l, i) => (l !== out[i] ? i : -1)).filter((i) => i >= 0);
    expect(diff.length).toBe(1);
    expect(out[diff[0]!]).toBe('Res=42.00');
  });
});
