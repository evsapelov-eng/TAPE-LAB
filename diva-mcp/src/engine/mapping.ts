/**
 * Parameter Mapping layer: PresetSpec -> concrete Diva parameter changes.
 *
 * Only fields present in the spec produce changes. Model compatibility and the
 * availability of fixed modulation slots are enforced here: requesting a
 * control that does not exist for the selected model is an ERROR, never a
 * silent no-op.
 */
import type { PresetSpec, EffectSpec } from './spec.js';
import {
  DIGITAL_WAVES,
  ENV_MODELS,
  FILTER_MODELS,
  FX_MODULES,
  FX_SECTION_PREFIX,
  HPF_MODELS,
  LFO_RESTART,
  LFO_WAVES,
  OSC_MODELS,
  VOICE_COUNTS,
  VOICE_MODES,
} from '../schema/curation.js';
import { getParam, modSourceIndex, checkValue, isActiveFor } from '../schema/schema.js';

export interface Change {
  id: string;
  value: number | string;
  reason: string;
}

export interface ModelContext {
  osc: number;
  filter: number;
  hpf: number;
  env1: number;
  env2: number;
}

export interface MappingResult {
  changes: Change[];
  errors: string[];
  warnings: string[];
  models: ModelContext;
}

const OSC_KEYS = ['triple_vco', 'dual_vco', 'dco', 'dual_vco_eco', 'digital'] as const;
const FILTER_KEYS = ['ladder', 'cascade', 'multimode', 'bite', 'uhbie'] as const;
const HPF_KEYS = ['feedback', 'post', 'pre', 'bite'] as const;
const ENV_KEYS = ['ads', 'analogue', 'digital'] as const;
const LFO_WAVE_KEYS = ['sine', 'triangle', 'saw_up', 'saw_down', 'square_hi_lo', 'square_lo_hi', 'random_hold', 'random_glide'] as const;
const DIGITAL_KEYS = ['multisaw', 'triwrap', 'noise', 'feedback', 'pulse', 'sawtooth', 'triangle'] as const;

export function mapSpec(spec: PresetSpec, base: ModelContext): MappingResult {
  const changes = new Map<string, Change>();
  const errors: string[] = [];
  const warnings: string[] = [];
  const models: ModelContext = { ...base };

  const set = (id: string, value: number | string | boolean | undefined, reason: string) => {
    if (value === undefined) return;
    const v = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    const p = getParam(id);
    if (!p) {
      errors.push(`internal: unknown parameter ${id}`);
      return;
    }
    for (const issue of checkValue(p, v)) (issue.severity === 'error' ? errors : warnings).push(`${id}: ${issue.message}`);
    changes.set(id, { id, value: v, reason });
  };
  const src = (name: string, where: string): number | undefined => {
    try {
      return modSourceIndex(name);
    } catch (e) {
      errors.push(`${where}: ${(e as Error).message}`);
      return undefined;
    }
  };
  const need = (cond: boolean, msg: string) => {
    if (!cond) errors.push(msg);
    return cond;
  };

  // ------------------------------------------------------------ models first
  if (spec.oscillator) models.osc = OSC_KEYS.indexOf(spec.oscillator.model);
  if (spec.filter) models.filter = FILTER_KEYS.indexOf(spec.filter.model);
  if (spec.hpf) models.hpf = HPF_KEYS.indexOf(spec.hpf.model);
  if (spec.env1?.model) models.env1 = ENV_KEYS.indexOf(spec.env1.model);
  if (spec.env2?.model) models.env2 = ENV_KEYS.indexOf(spec.env2.model);
  const oscName = OSC_MODELS[models.osc];
  const filterName = FILTER_MODELS[models.filter];

  // ------------------------------------------------------------ meta handled by generator
  // ------------------------------------------------------------ oscillator
  const o = spec.oscillator;
  if (o) {
    set('OSC/Model', models.osc, `oscillator model ${oscName}`);
    switch (o.model) {
      case 'triple_vco': {
        set('OSC/Tune1', o.osc1?.octave !== undefined ? o.osc1.octave * 12 : undefined, 'osc1 octave');
        set('OSC/Shape1', o.osc1?.shape, 'osc1 waveform');
        set('OSC/Vol1', o.osc1?.volume, 'osc1 level');
        set('OSC/Tune2', o.osc2?.semitones, 'osc2 tune');
        set('OSC/Shape2', o.osc2?.shape, 'osc2 waveform');
        set('OSC/Vol2', o.osc2?.volume, 'osc2 level');
        set('OSC/Sync2', o.osc2?.sync, 'osc2 sync');
        set('OSC/Tune3', o.osc3?.semitones, 'osc3 tune');
        set('OSC/Shape3', o.osc3?.shape, 'osc3 waveform');
        set('OSC/Vol3', o.osc3?.volume, 'osc3 level');
        set('OSC/Sync3', o.osc3?.sync, 'osc3 sync');
        set('OSC/FM', o.fm, 'FM 1->2/3');
        set('OSC/Noise', o.noise?.volume, 'noise level');
        set('OSC/NoiseC', o.noise?.color === undefined ? undefined : o.noise.color === 'white' ? 1 : 0, 'noise colour');
        set('VCF1/Fback', o.feedback, 'mixer feedback');
        if (o.tune_mod_targets) for (const i of [1, 2, 3] as const) set(`OSC/TM${i}On`, o.tune_mod_targets.includes(i), `tune mod -> osc${i}`);
        if (o.shape_mod_targets) for (const i of [1, 2, 3] as const) set(`OSC/SM${i}On`, o.shape_mod_targets.includes(i), `shape mod -> osc${i}`);
        break;
      }
      case 'dual_vco': {
        set('OSC/Tune1', o.osc1?.octave !== undefined ? o.osc1.octave * 12 : undefined, 'VCO1 octave');
        set('OSC/Tri1', o.osc1?.triangle, 'VCO1 triangle');
        set('OSC/Saw1', o.osc1?.saw, 'VCO1 saw');
        set('OSC/PWM1', o.osc1?.pulse, 'VCO1 pulse');
        set('OSC/Noise1', o.osc1?.noise, 'VCO1 noise');
        set('OSC/Tune2', o.osc2?.semitones, 'VCO2 tune');
        set('OSC/Sin2', o.osc2?.sine, 'VCO2 sine');
        set('OSC/Tri2', o.osc2?.triangle, 'VCO2 triangle');
        set('OSC/Saw2', o.osc2?.saw, 'VCO2 saw');
        set('OSC/PW2', o.osc2?.pulse, 'VCO2 pulse');
        set('OSC/PW', o.pulse_width, 'pulse width');
        set('OSC/PWM2', o.pwm_switch, 'PWM switch');
        set('OSC/Sync2', o.sync, 'VCO2 sync');
        set('OSC/FM', o.cross_mod, 'cross mod');
        set('OSC/OscMix', o.mix, 'VCO mix');
        set('OSC/triSp', o.shape_model === undefined ? undefined : ['ideal', 'analog1', 'analog2'].indexOf(o.shape_model), 'Dual VCO shape revision');
        set('OSC/TMmode', o.tune_mod_target === undefined ? undefined : ['1', 'both', '2', 'split'].indexOf(o.tune_mod_target), 'tune mod target');
        if (o.feedback !== undefined) set('VCF1/Fback', o.feedback, 'feedback');
        const anyWave = [o.osc1?.triangle, o.osc1?.saw, o.osc1?.pulse, o.osc1?.noise].some((x) => x !== undefined);
        if (anyWave && ![o.osc1?.triangle, o.osc1?.saw, o.osc1?.pulse, o.osc1?.noise].some(Boolean)) warnings.push('Dual VCO: all VCO1 waveforms switched off — VCO1 will be silent');
        break;
      }
      case 'dco': {
        set('OSC/Tune1', o.octave !== undefined ? o.octave * 12 : undefined, 'DCO octave');
        set('OSC/PWShp', o.pulse_shape, 'DCO pulse selector');
        set('OSC/SawShp', o.saw_shape, 'DCO saw selector');
        set('OSC/SubShp', o.sub_shape, 'DCO sub selector');
        set('OSC/Vol3', o.sub_volume, 'DCO sub level');
        set('OSC/Noise', o.noise_volume, 'DCO noise level');
        set('OSC/PW', o.pulse_width, 'DCO pulse width');
        if (o.feedback !== undefined) set('VCF1/Fback', o.feedback, 'feedback');
        if (o.pulse_shape === 0 && o.saw_shape === 0 && (o.sub_volume ?? 1) === 0 && !o.noise_volume) warnings.push('DCO: pulse and saw off and no sub/noise — silent');
        break;
      }
      case 'dual_vco_eco': {
        warnings.push('Dual VCO Eco waveform selectors are mapped as raw positions (names unconfirmed) — verify in Diva.');
        set('OSC/Tune1', o.osc1?.octave !== undefined ? o.osc1.octave * 12 : undefined, 'Eco VCO1 octave');
        set('OSC/Wave1', o.osc1?.wave_raw, 'Eco VCO1 wave');
        set('OSC/Vol1', o.osc1?.volume, 'Eco VCO1 level');
        set('OSC/Tune2', o.osc2?.semitones, 'Eco VCO2 tune');
        set('OSC/Wave2', o.osc2?.wave_raw, 'Eco VCO2 wave');
        set('OSC/Vol2', o.osc2?.volume, 'Eco VCO2 level');
        set('OSC/RMPwm', o.ring, 'ring mod');
        if (o.feedback !== undefined) set('VCF1/Fback', o.feedback, 'feedback');
        break;
      }
      case 'digital': {
        set('OSC/Tune1', o.osc1?.octave !== undefined ? o.osc1.octave * 12 : undefined, 'osc1 octave');
        set('OSC/DgtlTp1', o.osc1?.wave === undefined ? undefined : DIGITAL_KEYS.indexOf(o.osc1.wave), `osc1 wave (${o.osc1?.wave})`);
        set('OSC/Tune2', o.osc2?.semitones, 'osc2 tune');
        set('OSC/DgtlTp2', o.osc2?.wave === undefined ? undefined : DIGITAL_KEYS.indexOf(o.osc2.wave), `osc2 wave (${o.osc2?.wave})`);
        set('OSC/DgtlSp2', o.shape2, 'digital shape 2');
        set('OSC/DgtlSp3', o.shape3, 'digital shape 3');
        set('OSC/DgtlSp4', o.shape4, 'digital shape 4');
        set('OSC/PW', o.pulse_width, 'pulse width');
        set('OSC/FM', o.cross, 'cross mod');
        set('OSC/Sync2', o.sync, 'sync');
        set('OSC/OscMix', o.mix, 'osc mix');
        set('OSC/DNoAlia', o.high_quality, 'high quality');
        if (o.feedback !== undefined) set('VCF1/Fback', o.feedback, 'feedback');
        if (o.shape2 !== undefined || o.shape3 !== undefined || o.shape4 !== undefined) warnings.push('Digital shape knobs are raw and their per-waveform meaning is undocumented — verify in Diva.');
        break;
      }
    }
  }

  // feedback availability (Triple VCO mixer or HPF = feedback)
  if (changes.has('VCF1/Fback') && models.osc !== 0 && models.hpf !== 0) {
    errors.push(`Feedback is only available with Triple VCO or hpf.model = "feedback" (current HPF: ${HPF_MODELS[models.hpf]})`);
  }

  // ------------------------------------------------------------ HPF
  const h = spec.hpf;
  if (h) {
    if (need(models.osc !== 0, 'hpf: the HPF/Feedback panel does not exist with Triple VCO (it has a mixer with feedback instead); remove "hpf" or choose another oscillator model')) {
      set('HPF/Model', models.hpf, `HPF model ${HPF_MODELS[models.hpf]}`);
      if (h.frequency !== undefined && need(['pre', 'bite'].includes(h.model), 'hpf.frequency is only available for "pre" and "bite"')) set('HPF/Freq', h.frequency, 'HPF frequency');
      if (h.resonance !== undefined && need(h.model === 'bite', 'hpf.resonance is only available for "bite"')) set('HPF/Res', h.resonance, 'HPF peak');
      if (h.revision !== undefined && need(h.model === 'bite', 'hpf.revision is only available for "bite"')) set('HPF/Rev', h.revision, 'HPF Bite revision');
      if (h.post_freq_raw !== undefined && need(h.model === 'post', 'hpf.post_freq_raw is only available for "post"')) set('HPF/PFreq', h.post_freq_raw, 'post HPF switch');
    }
  }

  // ------------------------------------------------------------ filter
  const f = spec.filter;
  if (f) {
    set('VCF1/Model', models.filter, `filter model ${filterName}`);
    set('VCF1/Freq', f.cutoff, 'cutoff');
    set('VCF1/Res', f.resonance, 'resonance');
    set('VCF1/KeyScl', f.key_follow, 'key follow');
    if (f.filter_fm !== undefined && need(f.model !== 'bite', 'filter.filter_fm: Bite has no filter FM control')) set('VCF1/FFM', f.filter_fm, 'filter FM');
    if (f.slope !== undefined && need(['ladder', 'cascade'].includes(f.model), 'filter.slope is only available for ladder / cascade')) set('VCF1/LMode', f.slope === '12db' ? 1 : 0, 'pole mode');
    if (f.character !== undefined && need(f.model === 'cascade', 'filter.character is only available for cascade')) set('VCF1/LColor', f.character === 'clean' ? 1 : 0, 'rough/clean');
    if (f.mode !== undefined && need(f.model === 'multimode', 'filter.mode is only available for multimode')) set('VCF1/SvfMode', ['lp4', 'lp2', 'hp', 'bp'].indexOf(f.mode), 'multimode type');
    if (f.revision !== undefined && need(f.model === 'bite', 'filter.revision is only available for bite')) set('VCF1/SkRev', f.revision, 'Bite revision');
    if (f.uhbie_mix !== undefined && need(f.model === 'uhbie', 'filter.uhbie_mix is only available for uhbie')) set('VCF1/ShpMix', f.uhbie_mix, 'Uhbie mix');
    if (f.uhbie_center !== undefined && need(f.model === 'uhbie', 'filter.uhbie_center is only available for uhbie')) set('VCF1/BpUbie', f.uhbie_center === 'bandpass' ? 1 : 0, 'Uhbie BR/BP');
  }

  // ------------------------------------------------------------ envelopes
  for (const n of [1, 2] as const) {
    const e = spec[`env${n}`];
    if (!e) continue;
    const S = `ENV${n}`;
    const model = n === 1 ? models.env1 : models.env2;
    set(`${S}/Model`, e.model === undefined ? undefined : model, `envelope ${n} model ${ENV_MODELS[model]}`);
    set(`${S}/Atk`, e.attack, `env${n} attack`);
    set(`${S}/Dec`, e.decay, `env${n} decay`);
    set(`${S}/Sus`, e.sustain, `env${n} sustain`);
    if (e.release !== undefined && need(model !== 0, `env${n}.release: the ADS model has no separate release (use decay + release_on)`)) set(`${S}/Rel`, e.release, `env${n} release`);
    set(`${S}/Vel`, e.velocity, `env${n} velocity`);
    set(`${S}/KeyFlw`, e.key_follow, `env${n} key follow`);
    if (e.release_on !== undefined && need(model === 0, `env${n}.release_on is only available for the ADS model`)) set(`${S}/RelOn`, e.release_on, `env${n} release on`);
    if (e.quantise !== undefined && need(model === 2, `env${n}.quantise is only available for the digital model`)) set(`${S}/Quant`, e.quantise, `env${n} Q`);
    if (e.curve !== undefined && need(model === 2, `env${n}.curve is only available for the digital model`)) set(`${S}/Crve`, e.curve, `env${n} C`);
  }

  // ------------------------------------------------------------ LFOs
  for (const n of [1, 2] as const) {
    const l = spec[`lfo${n}`];
    if (!l) continue;
    const S = `LFO${n}`;
    set(`${S}/Wave`, l.waveform === undefined ? undefined : LFO_WAVE_KEYS.indexOf(l.waveform), `lfo${n} waveform ${l.waveform ? LFO_WAVES[LFO_WAVE_KEYS.indexOf(l.waveform)] : ''}`);
    set(`${S}/Trig`, l.restart === undefined ? undefined : LFO_RESTART.indexOf(l.restart), `lfo${n} restart`);
    set(`${S}/Sync`, l.sync_raw, `lfo${n} sync (raw)`);
    set(`${S}/Rate`, l.rate, `lfo${n} rate`);
    set(`${S}/Phse`, l.phase, `lfo${n} phase`);
    set(`${S}/Dly`, l.delay, `lfo${n} delay`);
    set(`${S}/Polar`, l.polarity === undefined ? undefined : l.polarity === 'unipolar' ? 1 : 0, `lfo${n} polarity`);
    set(`${S}/DMD1`, l.depth, `lfo${n} depth`);
    if (l.depth_source !== undefined) set(`${S}/DMS1`, src(l.depth_source, `lfo${n}.depth_source`), `lfo${n} depth mod source`);
    if (l.rate_mod) {
      set(`${S}/FMS1`, src(l.rate_mod.source, `lfo${n}.rate_mod`), `lfo${n} rate mod source`);
      set(`${S}/FMD1`, l.rate_mod.amount, `lfo${n} rate mod amount`);
    }
    if (l.sync_raw !== undefined && l.sync_raw >= 0) warnings.push(`lfo${n}.sync_raw=${l.sync_raw} is tempo-synced; the exact note division of each raw value is unconfirmed`);
  }

  // ------------------------------------------------------------ modulation slots
  const m = spec.modulation;
  if (m) {
    const slot = (name: keyof NonNullable<PresetSpec['modulation']>, srcId: string, amtId: string, available: boolean, why: string) => {
      const r = m[name] as { source: string; amount: number } | undefined;
      if (!r) return;
      if (!need(available, `modulation.${name}: ${why}`)) return;
      set(srcId, src(r.source, `modulation.${name}`), `${name} source`);
      set(amtId, r.amount, `${name} amount`);
    };
    slot('cutoff_1', 'VCF1/FMSrc', 'VCF1/FMDpt', true, '');
    slot('cutoff_2', 'VCF1/FM2Src', 'VCF1/FM2Dpt', true, '');
    slot('resonance', 'VCF1/ResSrc', 'VCF1/ResDpt', true, '');
    slot('filter_fm', 'VCF1/FfmSrc', 'VCF1/FfmDpt', models.filter !== 3, 'Bite has no filter FM');
    slot('feedback', 'VCF1/FbSrc', 'VCF1/FbDpt', models.osc === 0 || models.hpf === 0, 'feedback modulation needs Triple VCO or hpf.model = "feedback"');
    slot('uhbie_mix', 'VCF1/SMSrc', 'VCF1/SMDpt', models.filter === 4, 'only exists for the Uhbie filter');
    slot('hpf_cutoff', 'HPF/FMSrc', 'HPF/FMDpt', models.osc !== 0 && models.hpf === 3, 'only exists for HPF Bite (and not with Triple VCO)');
    slot('pitch_1', 'OSC/TM1Src', 'OSC/TM1Dpt', true, '');
    slot('pitch_2', 'OSC/TM2Src', 'OSC/TM2Dpt', models.osc !== 0, 'Triple VCO has a single tune-mod slot (use pitch_1 + tune_mod_targets)');
    slot('pulse_width', 'OSC/PWMSrc', 'OSC/PWMDpt', [1, 2, 4].includes(models.osc), `PWM slot does not exist for ${oscName} (Triple VCO: use modulation.shape on a pulse-ish waveform)`);
    slot('shape', 'OSC/Sh1Src', 'OSC/Sh1Dpt', [0, 4].includes(models.osc), `shape modulation does not exist for ${oscName}`);
    slot('fm_depth', 'OSC/FmSrc', 'OSC/FmDpt', [0, 1, 4].includes(models.osc), `${oscName} has no FM / cross mod`);
    slot('noise_mix', 'OSC/NoisSrc', 'OSC/NoisDpt', true, '');
    slot('vca', 'VCA1/ModSrc', 'VCA1/ModDpt', true, '');
    slot('pan', 'VCA1/PanSrc', 'VCA1/PanDpt', true, '');
    set('OSC/VtoD', m.vibrato, 'vibrato (LFO1 -> pitch)');
    if (m.pitch_1 && models.osc === 0 && !spec.oscillator?.model) warnings.push('pitch_1 with Triple VCO only affects oscillators whose TM*On switch is on');
    if (m.pitch_1 && models.osc === 0 && spec.oscillator?.model === 'triple_vco' && !spec.oscillator.tune_mod_targets) warnings.push('Triple VCO: pitch_1 set but oscillator.tune_mod_targets not given — switches keep their base values');
    if (m.shape && models.osc === 0 && spec.oscillator?.model === 'triple_vco' && !spec.oscillator.shape_mod_targets) warnings.push('Triple VCO: modulation.shape set but oscillator.shape_mod_targets not given');
  }

  // ------------------------------------------------------------ processors
  const pr = spec.processors;
  if (pr) {
    if (pr.rectify !== undefined) set('MOD/RSrc', src(pr.rectify, 'processors.rectify'), 'rectify input');
    if (pr.invert !== undefined) set('MOD/ISrc', src(pr.invert, 'processors.invert'), 'invert input');
    if (pr.quantise) {
      set('MOD/QSrc', src(pr.quantise.source, 'processors.quantise'), 'quantise input');
      set('MOD/Quant', pr.quantise.steps, 'quantise steps');
    }
    if (pr.lag) {
      set('MOD/LSrc', src(pr.lag.source, 'processors.lag'), 'lag input');
      set('MOD/Slew', pr.lag.rate, 'lag rate');
    }
    if (pr.add) {
      set('MOD/A1Src', src(pr.add[0], 'processors.add'), 'add input 1');
      set('MOD/A2Src', src(pr.add[1], 'processors.add'), 'add input 2');
    }
    if (pr.multiply) {
      set('MOD/M1Src', src(pr.multiply[0], 'processors.multiply'), 'multiply input 1');
      set('MOD/M2Src', src(pr.multiply[1], 'processors.multiply'), 'multiply input 2');
    }
  }

  // ------------------------------------------------------------ voice
  const v = spec.voice;
  if (v) {
    set('VCC/Mode', v.mode === undefined ? undefined : VOICE_MODES.indexOf(v.mode), `voice mode ${v.mode ?? ''}`);
    set('VCC/Voices', v.voices === undefined ? undefined : (VOICE_COUNTS as readonly number[]).indexOf(v.voices), `${v.voices ?? ''} voices`);
    if (v.stack_raw !== undefined) {
      warnings.push('voice.stack_raw: the mapping of raw Voice Stack values to stack counts is unconfirmed');
      set('VCC/Voicing', v.stack_raw, 'voice stack (raw)');
    }
    set('VCC/Prior', v.note_priority === undefined ? undefined : ['last', 'lowest', 'highest'].indexOf(v.note_priority), 'note priority');
    set('VCC/Porta', v.glide, 'glide');
    set('VCC/Porta2', v.glide2, 'glide2');
    set('VCC/PortaM', v.glide_mode === undefined ? undefined : v.glide_mode === 'rate' ? 1 : 0, 'glide mode');
    set('VCC/PRange', v.glide_range, 'glide range');
    set('VCC/Trsp', v.transpose, 'transpose');
    set('VCC/FTun', v.fine_tune_cents, 'fine tune');
    const pb = (st: number | undefined, where: string) => {
      if (st === undefined) return undefined;
      if (st <= 24) return st;
      if (st === 36) return 25;
      if (st === 48) return 26;
      errors.push(`${where}: pitch bend range must be 0..24, 36 or 48 semitones`);
      return undefined;
    };
    set('VCC/PB', pb(v.pitchbend_up, 'voice.pitchbend_up'), 'pitch bend up');
    set('VCC/PBD', pb(v.pitchbend_down, 'voice.pitchbend_down'), 'pitch bend down');
  }

  // ------------------------------------------------------------ trimmers
  const t = spec.trimmers;
  if (t) {
    set('OSC/Drift', t.drift, 'voice drift');
    set('OPT/TSlop', t.detune_amount, 'detune amount');
    set('OPT/CSlop', t.cutoff_variance, 'cutoff variance');
    set('OPT/GSlop', t.glide_variance, 'glide variance');
    set('OPT/PSlop', t.pw_variance, 'pulse width variance');
    set('OPT/ESlop', t.envelope_variance, 'envelope variance');
    if (t.voice_detune) {
      for (const [row, arr] of Object.entries(t.voice_detune)) {
        const r = Number(row.replace('osc', ''));
        arr?.forEach((val, i) => set(`OPT/V${i + 1}T${r}`, val, `voice ${i + 1} detune osc${r}`));
      }
    }
    t.voice_map?.forEach((val, i) => set(`OPT/V${i + 1}Mod`, val, `voice map ${i + 1}`));
  }

  // ------------------------------------------------------------ amp
  const a = spec.amp;
  if (a) {
    set('VCA1/Vol', a.volume, 'VCA volume');
    set('VCA1/Pan', a.pan, 'pan');
    set('VCA1/VCA', a.vca === undefined ? undefined : a.vca === 'env1' ? 1 : 0, 'VCA source');
    set('main/CcOp', a.output, 'main output');
  }

  // ------------------------------------------------------------ effects
  for (const slotNo of [1, 2] as const) {
    const fx = spec[`fx${slotNo}`];
    if (!fx) continue;
    if (fx.type === 'off') {
      set(`main/#FX${slotNo}`, 0, `FX${slotNo} off`);
      continue;
    }
    mapEffect(fx, slotNo, set);
  }

  // ------------------------------------------------------------ final compatibility sweep
  for (const c of changes.values()) {
    const p = getParam(c.id);
    if (p && !isActiveFor(p, models) && !p.id.endsWith('/Model')) {
      errors.push(`${c.id} (${p.label}) is not active for ${OSC_MODELS[models.osc]} / ${FILTER_MODELS[models.filter]} / ${HPF_MODELS[models.hpf]}`);
    }
  }

  return { changes: [...changes.values()], errors, warnings, models };
}

function mapEffect(fx: EffectSpec, n: 1 | 2, set: (id: string, v: number | string | boolean | undefined, r: string) => void) {
  const name = (fx.type[0]!.toUpperCase() + fx.type.slice(1)) as (typeof FX_MODULES)[number];
  const S = `${FX_SECTION_PREFIX[name]}${n}`;
  set(`FX${n}/Module`, `'${name}${n}'`, `FX${n} = ${name}`);
  set(`main/#FX${n}`, fx.enabled === false ? 0 : 1, `FX${n} ${fx.enabled === false ? 'off' : 'on'}`);
  switch (fx.type) {
    case 'chorus':
      set(`${S}/Type`, fx.variant === undefined ? undefined : ['classic', 'dramatic', 'ensemble'].indexOf(fx.variant), 'chorus type');
      set(`${S}/Rate`, fx.rate, 'chorus rate');
      set(`${S}/Depth`, fx.depth, 'chorus depth');
      set(`${S}/Wet`, fx.wet, 'chorus wet');
      break;
    case 'phaser':
      set(`${S}/Type`, fx.variant === undefined ? undefined : fx.variant === 'flanged' ? 1 : 0, 'phaser type');
      set(`${S}/Rate`, fx.rate, 'phaser rate');
      set(`${S}/FB`, fx.feedback, 'phaser feedback');
      set(`${S}/Stereo`, fx.stereo, 'phaser stereo');
      set(`${S}/Sync`, fx.sync, 'phaser sync');
      set(`${S}/Phase`, fx.phase, 'phaser phase');
      set(`${S}/Wet`, fx.wet, 'phaser wet');
      set(`${S}/Depth`, fx.depth, 'phaser depth');
      set(`${S}/Center`, fx.center, 'phaser center');
      break;
    case 'plate':
      set(`${S}/Pre`, fx.predelay, 'plate predelay');
      set(`${S}/Diff`, fx.diffusion, 'plate diffusion');
      set(`${S}/Damp`, fx.damp, 'plate damp');
      set(`${S}/Decay`, fx.decay, 'plate decay');
      set(`${S}/Size`, fx.size, 'plate size');
      set(`${S}/Dry`, fx.dry, 'plate dry');
      set(`${S}/Wet`, fx.wet, 'plate wet');
      break;
    case 'delay':
      set(`${S}/LDel`, fx.left, 'delay left');
      set(`${S}/CDel`, fx.center, 'delay center');
      set(`${S}/RDel`, fx.right, 'delay right');
      set(`${S}/SVol`, fx.side_vol, 'delay side vol');
      set(`${S}/CVol`, fx.center_vol, 'delay center vol');
      set(`${S}/FeedB`, fx.feedback, 'delay feedback');
      set(`${S}/HP`, fx.hp, 'delay HP');
      set(`${S}/LP`, fx.lp, 'delay LP');
      set(`${S}/Dry`, fx.dry, 'delay dry');
      set(`${S}/Wow`, fx.wow, 'delay wow');
      break;
    case 'rotary':
      set(`${S}/Mode`, fx.mode === undefined ? undefined : ['normal', 'syncbass', 'nobass'].indexOf(fx.mode), 'rotary mode');
      set(`${S}/Mix`, fx.mix, 'rotary mix');
      set(`${S}/Bal`, fx.balance, 'rotary balance');
      set(`${S}/Drive`, fx.drive, 'rotary drive');
      set(`${S}/Stereo`, fx.stereo, 'rotary stereo');
      set(`${S}/Out`, fx.out, 'rotary out');
      set(`${S}/Slow`, fx.slow, 'rotary slow');
      set(`${S}/Fast`, fx.fast, 'rotary fast');
      set(`${S}/RTime`, fx.rise_time, 'rotary rise time');
      set(`${S}/Cont`, fx.controller === undefined ? undefined : ['modwheel', 'ctrla', 'ctrlb', 'pressure'].indexOf(fx.controller), 'rotary controller');
      break;
  }
}

export { OSC_KEYS, FILTER_KEYS, HPF_KEYS, ENV_KEYS };
