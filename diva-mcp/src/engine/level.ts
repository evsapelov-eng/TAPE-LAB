/**
 * Heuristic output-level check (gain staging).
 *
 * No audio is rendered, so this does NOT measure loudness. It flags parameter
 * combinations that typically make a Diva patch hot, relative to the levels
 * used in real presets (main/CcOp median 92, VCA1/Vol median 42 in the
 * reference corpus). diva-mcp's level standard: Output 80, VCA 42.
 */
import type { H2PDocument } from '../h2p/parser.js';
import { getModels, num, str } from './preset.js';

export const LEVEL_STANDARD = {
  output: 80,
  vca: 42,
  reference: 'Real Diva presets (55 files): main/CcOp median 92, VCA1/Vol median 42. diva-mcp targets Output 80 / VCA 42 for headroom.',
};

export interface LevelCheck {
  risk: 'low' | 'medium' | 'high';
  score: number;
  output: number;
  vca: number;
  factors: string[];
  suggestion: string | null;
  basis: string;
}

export function levelCheck(doc: H2PDocument): LevelCheck {
  const m = getModels(doc);
  const output = num(doc, 'main/CcOp', 100);
  const vca = num(doc, 'VCA1/Vol', 50);
  const factors: string[] = [];
  let score = 0;
  const add = (pts: number, why: string) => {
    score += pts;
    factors.push(why);
  };
  if (output > 100) add(2, `Output ${output} > 100`);
  else if (output > 90) add(1, `Output ${output} above the reference median (92)`);
  if (vca > 55) add(2, `VCA ${vca} > 55 (amplifier overdrive region)`);
  else if (vca > 46) add(1, `VCA ${vca} above the reference median (42)`);
  if (m.osc === 0) {
    const sum = num(doc, 'OSC/Vol1') + num(doc, 'OSC/Vol2') + num(doc, 'OSC/Vol3') + num(doc, 'OSC/Noise');
    if (sum > 250) add(2, `Triple VCO mixer sum ${sum} (very hot filter input)`);
    else if (sum > 190) add(1, `Triple VCO mixer sum ${sum}`);
  }
  const fb = num(doc, 'VCF1/Fback');
  if ((m.osc === 0 || m.hpf === 0) && fb > 30) add(1, `Feedback ${fb}`);
  const res = num(doc, 'VCF1/Res');
  if (res > 70) add(m.filter === 3 ? 2 : 1, `Resonance ${res}${m.filter === 3 ? ' on Bite (level dependent)' : ''}`);
  if (num(doc, 'VCC/Voicing', 1) > 1) add(1, 'Voice stacking');
  for (const n of [1, 2]) {
    if (num(doc, `main/#FX${n}`) !== 1) continue;
    const mod = str(doc, `FX${n}/Module`) ?? '';
    if (mod.includes('Plate') && num(doc, `Plate${n}/Wet`) > 40 && num(doc, `Plate${n}/Dry`) >= 90) add(1, `Plate FX${n} wet ${num(doc, `Plate${n}/Wet`)} on top of full dry`);
    if (mod.includes('Delay') && num(doc, `Delay${n}/FeedB`) > 60) add(1, `Delay FX${n} feedback ${num(doc, `Delay${n}/FeedB`)}`);
    if (mod.includes('Rotary') && num(doc, `Rtary${n}/Drive`) > 40) add(1, `Rotary drive ${num(doc, `Rtary${n}/Drive`)}`);
  }
  const risk = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
  let suggestion: string | null = null;
  if (risk !== 'low') {
    const target = Math.max(50, Math.round(LEVEL_STANDARD.output - (score - 1) * 5));
    suggestion = `Consider Output ~${Math.min(target, output)} and VCA <= ${LEVEL_STANDARD.vca}.`;
  }
  return { risk, score, output, vca, factors, suggestion, basis: 'Heuristic from parameter values only; loudness was not measured.' };
}
