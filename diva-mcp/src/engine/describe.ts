/**
 * Musically meaningful, parameter-derived description of a preset.
 * Explicitly NOT based on listening: no audio is rendered.
 */
import type { Analysis } from './analyze.js';

const lvl = (v: number, steps: [number, string][]) => steps.find(([t]) => v <= t)?.[1] ?? steps[steps.length - 1]![1];
const timeWord = (v: number) => lvl(v, [[3, 'instant'], [15, 'fast'], [35, 'moderate'], [60, 'slow'], [100, 'very slow']]);

export function describeAnalysis(a: Analysis) {
  const o = a.oscillator as Record<string, any>;
  const f = a.filter as Record<string, any>;
  const e1 = a.envelopes.env1;
  const e2 = a.envelopes.env2;
  const routes = a.modulations.routes;
  const lines: string[] = [];
  const tags = new Set<string>();

  // --- synthesis type / oscillators
  let oscText = '';
  switch (o.model) {
    case 'Triple VCO': {
      const active = ['osc1', 'osc2', 'osc3'].filter((k) => (o[k]?.volume ?? 0) > 5);
      const shapes = active.map((k) => `${k} ${shapeName(o[k].shape)} (${o[k].tune})`);
      oscText = `Triple VCO (Minimoog-style morphing oscillators): ${shapes.join(', ') || 'all oscillators muted'} (waveform names approximate).`;
      if (o.fm > 10) oscText += ` Audible FM 1->2/3 (${o.fm}) adds metallic/clangorous sidebands.`;
      if (o.osc2?.sync || o.osc3?.sync) oscText += ' Hard sync is engaged.';
      if (o.noise?.volume > 10) oscText += ` ${o.noise.color ?? ''} noise at ${o.noise.volume}.`;
      if (o.feedback > 10) oscText += ` Mixer feedback ${o.feedback} thickens the low end${o.feedback > 50 ? ' and can growl' : ''}.`;
      tags.add('analog');
      break;
    }
    case 'Dual VCO':
      oscText = `Dual VCO (Jupiter-style): VCO1 [${o.vco1.waves.join('+') || 'off'}] ${o.vco1.tune}, VCO2 [${o.vco2.waves.join('+') || 'off'}] ${o.vco2.tune}, mix ${o.mix}.`;
      if (o.sync) oscText += ' VCO2 synced to VCO1.';
      if (o.cross_mod > 5) oscText += ` Cross mod ${o.cross_mod}.`;
      tags.add('analog');
      break;
    case 'DCO':
      oscText = `DCO (Juno-style single oscillator): pulse ${o.pulse}, saw ${o.saw}, sub ${o.sub.shape} at ${o.sub.volume}${o.noise > 5 ? `, noise ${o.noise}` : ''}.`;
      tags.add('analog');
      break;
    case 'Dual VCO Eco':
      oscText = `Dual VCO Eco (MS-20-style, CPU-light): VCO1 wave ${o.vco1.wave_raw} lvl ${o.vco1.volume}, VCO2 wave ${o.vco2.wave_raw} lvl ${o.vco2.volume}${o.ring ? ', ring mod' : ''}.`;
      tags.add('analog');
      break;
    case 'Digital':
      oscText = `Digital (JP-8000-style): osc1 ${o.osc1.wave}, osc2 ${o.osc2.wave} (${o.osc2.tune}), mix ${o.mix}.`;
      if (o.osc1.wave === 'Multisaw' || o.osc2.wave === 'Multisaw') oscText += ' Multisaw gives a dense supersaw-type spectrum.';
      tags.add('digital');
      break;
  }
  const detuned = detuneSummary(a);
  if (detuned) oscText += ' ' + detuned;
  if (o.drift > 20) {
    oscText += ` Voice drift ${o.drift} introduces analog pitch instability.`;
    tags.add('unstable');
  }

  // --- spectral brightness
  const cutoff = Number(f.cutoff);
  const env2Amt = routes.filter((r) => r.destination.startsWith('Cutoff') && r.source === 'Env2').reduce((s, r) => s + r.amount, 0);
  const effectiveTop = cutoff + Math.max(0, env2Amt);
  const brightness = lvl(cutoff, [[55, 'dark'], [80, 'warm / muted'], [105, 'balanced'], [130, 'bright'], [150, 'fully open']]);
  tags.add({ dark: 'dark', 'warm / muted': 'warm', balanced: 'balanced', bright: 'bright', 'fully open': 'open' }[brightness] ?? brightness);
  let filterText = `${f.model} filter${f.mode ? ` (${f.mode})` : ''}${f.slope ? `, ${f.slope}` : ''}${f.revision ? `, Rev ${f.revision}` : ''}: cutoff ${cutoff} (${brightness}), resonance ${f.resonance} (${lvl(f.resonance, [[15, 'smooth'], [45, 'classic analog emphasis'], [75, 'pronounced peak'], [100, 'near self-oscillation']])}).`;
  if (env2Amt) filterText += ` Env2 sweeps cutoff by ${env2Amt} (peaks around ${Math.round(effectiveTop)}) with a ${timeWord(e2.attack)} attack and ${timeWord(e2.decay)} decay.`;
  const lfoCut = routes.filter((r) => r.destination.startsWith('Cutoff') && r.source.startsWith('LFO'));
  if (lfoCut.length) filterText += ` ${lfoCut.map((r) => `${r.source} moves cutoff (${r.amount})`).join('; ')}.`;
  if (f.key_follow > 60) filterText += ' Strong key tracking keeps high notes bright.';
  const hpf = a.hpf as Record<string, any>;
  if (hpf.active && hpf.model && hpf.model !== 'No HPF (Feedback)') filterText += ` ${hpf.model} ${hpf.frequency !== undefined ? `at ${hpf.frequency}` : ''} trims the lows.`;

  // --- envelopes / temporal
  const ampAtk = timeWord(e1.attack);
  const sustained = e1.sustain > 40;
  const releaseVal = typeof e1.release === 'number' ? e1.release : e1.decay;
  let envText = `Amp envelope (${e1.model}): ${ampAtk} attack, ${sustained ? `sustains at ${e1.sustain}` : `${timeWord(e1.decay)} decay to ${e1.sustain}`}, ${timeWord(releaseVal)} release.`;
  if (e1.velocity > 30) envText += ` Velocity-sensitive (${e1.velocity}).`;
  let articulation = 'sustained';
  if (e1.attack <= 3 && !sustained && e1.decay < 45) articulation = 'percussive / plucked';
  else if (e1.attack <= 3 && !sustained) articulation = 'struck, decaying (key-like)';
  else if (e1.attack > 35) articulation = 'swelling (pad-like)';
  tags.add(articulation.split(' ')[0]!);

  // --- movement
  const moving = routes.filter((r) => r.source.startsWith('LFO') || r.source === 'Random');
  const movement: string[] = moving.map((r) => `${r.source} -> ${r.destination} (${r.amount})`);
  if (o.vibrato > 0) movement.push(`LFO1 vibrato (${o.vibrato}${a.lfos.lfo1.depth_source !== 'none' ? `, depth via ${a.lfos.lfo1.depth_source}` : ''})`);
  const expressive = routes.filter((r) => ['ModWhl', 'Pressure', 'Velocity', 'CtrlA', 'CtrlB'].includes(r.source)).map((r) => `${r.source} -> ${r.destination} (${r.amount})`);
  if (moving.length || o.vibrato > 0) tags.add('moving');

  // --- effects
  const fx = a.effects.filter((x) => x.enabled).map((x) => `${x.type}${x.type === 'Chorus' ? ` (${x.params['Chorus Type']})` : ''}`);
  if (fx.some((x) => x.startsWith('Plate') || x.startsWith('Delay'))) tags.add('spacious');

  // --- usage guess
  const voice = a.voice;
  const role = guessRole(a, articulation, brightness);

  lines.push(`Synthesis: subtractive, ${o.model} -> ${f.model}.`);
  lines.push(oscText, filterText, envText);
  lines.push(movement.length ? `Movement: ${movement.join('; ')}.` : 'Movement: essentially static (no LFO/random routes).');
  if (expressive.length) lines.push(`Performance control: ${expressive.join('; ')}.`);
  lines.push(fx.length ? `Effects: ${fx.join(' -> ')}.` : 'Effects: none (dry).');
  lines.push(`Voicing: ${voice.mode}, ${voice.voices} voices${voice.glide > 0 ? `, glide ${voice.glide}` : ''}.`);
  lines.push(`Likely use: ${role}.`);

  return {
    summary: `${capitalize(brightness)}, ${articulation} ${o.model} patch through a ${f.model} filter${moving.length ? ' with modulation movement' : ''}${fx.length ? `, ${fx.join(' + ')}` : ''}.`,
    character_tags: [...tags],
    description: lines.join('\n'),
    likely_use: role,
    basis: 'Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed.',
  };
}

function shapeName(s: number): string {
  // Only "8.00 = 25% pulse" is documented; other positions are approximate.
  if (s < 2) return '~ramp';
  if (s < 4) return '~triangle';
  if (s < 6) return '~saw';
  if (s < 7.5) return '~square';
  return '~narrow pulse';
}

function detuneSummary(a: Analysis): string {
  const o = a.oscillator as Record<string, any>;
  const parts: string[] = [];
  const frac = (t: string | undefined) => {
    if (!t) return 0;
    const v = parseFloat(t);
    return Math.abs(v - Math.round(v));
  };
  for (const k of ['osc2', 'osc3', 'vco2']) if (o[k] && frac(o[k].tune) > 0.005 && frac(o[k].tune) < 0.5) parts.push(`${k} detuned by ~${Math.round(frac(o[k].tune) * 100)} cents`);
  if (a.trimmers.detune_amount > 0 && a.trimmers.voice_detune_nonzero.some((x) => x > 0)) parts.push(`per-voice detune (amount ${a.trimmers.detune_amount})`);
  return parts.length ? `Detune: ${parts.join(', ')} -> chorusing/beating.` : '';
}

function guessRole(a: Analysis, articulation: string, brightness: string): string {
  const name = (a.name ?? '').toUpperCase();
  const cat = (a.metadata.Categories ?? '').toLowerCase();
  if (/^BS|bass/.test(name) || cat.includes('bass')) return 'bass line';
  if (/^PD|pad/.test(name) || cat.includes('pad')) return 'pad / harmonic bed';
  if (/^LD|lead/.test(name) || cat.includes('lead')) return 'lead / melody';
  if (/^PL|pluck/.test(name) || cat.includes('pluck')) return 'pluck / arpeggio';
  if (/^KY|key/.test(name) || cat.includes('key')) return 'keys / chords';
  const mono = ['mono', 'legato'].includes(String(a.voice.mode));
  const tr = Number(a.voice.transpose) + parseFloat(String((a.oscillator as any).osc1?.tune ?? (a.oscillator as any).vco1?.tune ?? (a.oscillator as any).tune ?? '0'));
  if (mono && tr < 0) return 'bass line';
  if (mono) return 'lead / melody';
  if (articulation.startsWith('swelling')) return 'pad / harmonic bed';
  if (articulation.startsWith('percussive')) return 'pluck / arpeggio';
  if (articulation.startsWith('struck')) return 'keys / chords';
  return brightness === 'dark' ? 'pad or bass layer' : 'keys, chords or leads';
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
