/**
 * Hand-curated knowledge about Diva parameters.
 *
 * Every entry records WHERE the claim comes from. Source keys:
 *   manual      u-he Diva User Guide v1.4.8 (7 Aug 2025)
 *   vst         official VST automation name of the parameter (see schemas/sources/vst_parameters.json)
 *   observed    values seen in reference presets (schemas/sources/observed_stats.json)
 *   synthproxy  pcmbs/synth-proxy notes on which oscillator/filter model uses a parameter
 *   factory     cross-check against the factory preset "MS-REV1" (MS-20 style patch)
 *   inference   our own reasoning; always paired with confidence <= "low"
 *
 * Numeric ranges are NOT defined here; they come from vst_parameters.json and
 * are reconciled with observations in scripts/build-schema.ts.
 */

export type Confidence = 'high' | 'medium' | 'low' | 'unknown';

export interface Curated {
  label: string;
  module: string;
  description?: string;
  /** Raw value -> meaning. Keys are the literal numbers/strings written in the file. */
  enum?: Record<string, string>;
  enumConfidence?: Confidence;
  /** OSC model indices (0..4) for which the parameter is active; omitted = all. */
  oscModels?: number[];
  /** VCF1 model indices (0..4) for which the parameter is active. */
  filterModels?: number[];
  /** HPF model indices (0..3). */
  hpfModels?: number[];
  /** Envelope model indices (0..2). */
  envModels?: number[];
  /** Units / scale notes. */
  unit?: string;
  /** Value used by the diva-mcp init template (our own choice unless noted). */
  init?: number | string;
  confidence: Confidence;
  sources: string[];
  notes?: string;
  /** True for global/UI/host settings that sound design must not touch. */
  global?: boolean;
}

export const MOD_SOURCES = [
  'none', 'ModWhl', 'PitchW', 'CtrlA', 'CtrlB', 'Gate', 'Velocity', 'Pressure', 'KeyFollow', 'KeyFollow2',
  'Alternate', 'Random', 'StackVoice', 'VoiceMap', 'Env1', 'Env2', 'LFO1', 'LFO2', 'Rectify', 'Invert',
  'Quant', 'Lag', 'Adder', 'Multiply',
] as const;
export type ModSourceName = (typeof MOD_SOURCES)[number];

export const MOD_SOURCE_ENUM: Record<string, string> = Object.fromEntries(MOD_SOURCES.map((s, i) => [String(i), s]));

export const OSC_MODELS = ['Triple VCO', 'Dual VCO', 'DCO', 'Dual VCO Eco', 'Digital'] as const;
export const FILTER_MODELS = ['Ladder', 'Cascade', 'Multimode', 'Bite', 'Uhbie'] as const;
export const HPF_MODELS = ['No HPF (Feedback)', 'HPF Post', 'HPF Pre', 'HPF Bite'] as const;
export const ENV_MODELS = ['ADS', 'Analogue', 'Digital'] as const;
export const LFO_WAVES = ['sine', 'triangle', 'saw up', 'saw down', 'sqr hi-lo', 'sqr lo-hi', 'rand hold', 'rand glide'] as const;
export const LFO_RESTART = ['sync', 'gate', 'single', 'random'] as const;
export const VOICE_MODES = ['poly', 'mono', 'legato', 'duo', 'poly2'] as const;
export const VOICE_COUNTS = [2, 3, 4, 5, 6, 8, 12, 16] as const;
export const DIGITAL_WAVES = ['Multisaw', 'TriWrap', 'Noise', 'Feedback', 'Pulse', 'Sawtooth', 'Triangle'] as const;
export const FX_MODULES = ['Chorus', 'Phaser', 'Plate', 'Delay', 'Rotary'] as const;
/** FXn/Module string value -> parameter section prefix. */
export const FX_SECTION_PREFIX: Record<(typeof FX_MODULES)[number], string> = {
  Chorus: 'Chrs',
  Phaser: 'Phase',
  Plate: 'Plate',
  Delay: 'Delay',
  Rotary: 'Rtary',
};

const enumOf = (arr: readonly (string | number)[], offset = 0): Record<string, string> =>
  Object.fromEntries(arr.map((v, i) => [String(i + offset), String(v)]));

const ALL_OSC = [0, 1, 2, 3, 4];
const C: Record<string, Curated> = {};

function add(id: string, c: Curated) {
  C[id] = c;
}
function src(id: string, module: string, label: string, extra: Partial<Curated> = {}) {
  add(id, {
    label,
    module,
    enum: MOD_SOURCE_ENUM,
    enumConfidence: 'high',
    confidence: 'high',
    sources: ['vst', 'observed', 'manual'],
    notes: 'Index into the #ms modulation source list written at the top of every preset.',
    ...extra,
  });
}

// ---------------------------------------------------------------- HEAD / main
add('main/CcOp', { label: 'Output (main volume)', module: 'Main', init: 100, confidence: 'high', sources: ['vst', 'observed'], unit: '0..200 (100 = nominal; observed factory-like values 16..180)' });
add('main/#FX1', { label: 'FX1 active', module: 'Effects', enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('main/#FX2', { label: 'FX2 active', module: 'Effects', enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, confidence: 'high', sources: ['vst', 'manual'] });

// ---------------------------------------------------------------- PCore (global / UI)
for (const k of ['SBase', 'Swing', 'STrig', 'PFold', 'PFile', 'Rev', 'MidiA', 'MidiP', 'PProj', 'GFile', 'GScale', 'ChLay', 'SurrO', 'PAGE', 'PagesOn', 'CoreN', 'Slice', 'UI_op', 'DFold', 'CtrlA', 'CtrlB', 'GScSet', 'PSong']) {
  add(`PCore/${k}`, { label: `PCore ${k}`, module: 'Global', confidence: 'unknown', sources: ['observed'], global: true, notes: 'Host/UI/global state. Preserved verbatim, never modified by diva-mcp.' });
}
add('PCore/Rev', { label: 'Saving build revision', module: 'Global', confidence: 'medium', sources: ['observed', 'inference'], global: true, notes: 'Build number of the Diva version that saved the file (e.g. 16519). Preserved.' });
add('PCore/LED', { label: 'LED Colour', module: 'Global', init: 0, confidence: 'high', sources: ['vst', 'manual'], unit: '0..1', notes: 'Cosmetic; the manual notes it is automatable.' });
add('MPE/Status', { label: 'MPE status', module: 'Global', confidence: 'unknown', sources: ['observed'], global: true });

// ---------------------------------------------------------------- CLK / ARP
add('CLK/Mult', { label: 'Clock Multiply', module: 'Arpeggiator', init: 100, unit: '50..200 (%; manual: 0.50..2.00)', confidence: 'high', sources: ['vst', 'manual'] });
add('CLK/Base', { label: 'Clock TimeBase', module: 'Arpeggiator', init: 2, confidence: 'medium', sources: ['vst', 'observed'], notes: '4 positions; mapping to note values unconfirmed.' });
add('CLK/Swing', { label: 'Clock Swing', module: 'Arpeggiator', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('CLK/Strict', { label: 'Arp Sync (strict host sync)', module: 'Arpeggiator', enum: { '0': 'off', '1': 'on' }, enumConfidence: 'medium', init: 1, confidence: 'medium', sources: ['manual', 'observed'] });
add('ARP/Dir', { label: 'Arp Mode / Direction', module: 'Arpeggiator', enum: enumOf(['played', 'up', 'down', 'up+dn 1', 'up+dn 2', 'random']), enumConfidence: 'medium', init: 1, confidence: 'high', sources: ['vst', 'manual'] });
add('ARP/Oct', { label: 'Arp Octaves', module: 'Arpeggiator', enum: enumOf([1, 2, 3, 4]), enumConfidence: 'medium', init: 0, confidence: 'medium', sources: ['vst', 'manual'], notes: 'Raw 0..3 = 1..4 octaves (manual: 1 to 4). Observed raw values 1..3.' });
add('ARP/CDiv', { label: 'Arp Multiply', module: 'Arpeggiator', init: 0, confidence: 'low', sources: ['vst'] });
add('ARP/Rstrt', { label: 'Arp Restart', module: 'Arpeggiator', init: 0, confidence: 'medium', sources: ['vst', 'manual'], notes: '13 positions: none, 4-10, 12, 14, 16, 24, 32 (manual); raw 0 = none presumed.' });
add('ARP/OnOff', { label: 'Arp On/Off', module: 'Arpeggiator', enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('ARP/Order', { label: 'Arp Progression', module: 'Arpeggiator', enum: enumOf(['serial', 'round', 'leap', 'repeat']), enumConfidence: 'medium', init: 0, confidence: 'medium', sources: ['vst', 'manual'] });

// ---------------------------------------------------------------- VCC (voice)
add('VCC/Voices', { label: 'Voices (polyphony)', module: 'Voice', enum: enumOf(VOICE_COUNTS), enumConfidence: 'medium', init: 7, confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: '8 positions (synth-proxy cardinality 8); manual: 2-16 voices.' });
add('VCC/Voicing', { label: 'Voice Stack (unison)', module: 'Voice', init: 1, confidence: 'low', sources: ['vst', 'observed', 'factory'], notes: 'Raw value; 1 = no stacking (factory MS-REV1 and most presets). Mapping of other values to stack counts is unconfirmed.' });
add('VCC/Mode', { label: 'Voice Mode', module: 'Voice', enum: enumOf(VOICE_MODES), enumConfidence: 'medium', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/PortaM', { label: 'Glide Mode', module: 'Voice', enum: { '0': 'time', '1': 'rate' }, enumConfidence: 'medium', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/Porta', { label: 'Glide', module: 'Voice', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/Porta2', { label: 'Glide2 (VCO2/3 offset)', module: 'Voice', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/PRange', { label: 'Glide Range', module: 'Voice', init: 100, confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/PB', { label: 'Pitch Bend Up', module: 'Voice', init: 2, unit: 'semitones 0..24; raw 25 = 36, 26 = 48 (27 positions)', confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
add('VCC/PBD', { label: 'Pitch Bend Down', module: 'Voice', init: 2, unit: 'semitones 0..24; raw 25 = 36, 26 = 48', confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
add('VCC/MTunS', { label: 'Microtuning on', module: 'Voice', enum: { '0': 'off', '1': 'on' }, enumConfidence: 'medium', init: 0, confidence: 'medium', sources: ['vst', 'manual'] });
add('VCC/Trsp', { label: 'Transpose', module: 'Voice', init: 0, unit: 'semitones', confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/FTun', { label: 'Fine Tune', module: 'Voice', init: 0, unit: 'cents (+/-100)', confidence: 'high', sources: ['vst', 'manual'] });
add('VCC/Prior', { label: 'Note Priority', module: 'Voice', enum: enumOf(['last', 'lowest', 'highest']), enumConfidence: 'medium', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
for (let i = 1; i <= 8; i++) {
  add(`VCC/Vc${i}`, { label: `Stack Tune ${i}`, module: 'Trimmers', init: 0, unit: 'semitones (+/-24 per manual "+/- 2 octaves")', confidence: 'low', sources: ['manual', 'observed', 'inference'], notes: 'Believed to be the STACK TUNE knobs; only relevant when Voice Stack > 1.' });
}
for (const k of ['Drft', 'MTunN', 'MTunT', 'ContEn', 'MuCore', 'rMW', 'rPW']) {
  add(`VCC/${k}`, { label: `VCC ${k}`, module: 'Voice', confidence: 'unknown', sources: ['observed'], global: true, notes: 'Not mapped to a documented control; preserved verbatim.' });
}
add('VCC/MuCore', { label: 'MultiCore', module: 'Global', confidence: 'medium', sources: ['vst'], global: true });

// ---------------------------------------------------------------- OPT (trimmers)
for (let osc = 1; osc <= 3; osc++) for (let v = 1; v <= 8; v++) {
  add(`OPT/V${v}T${osc}`, { label: `Voice ${v} detune, osc ${osc}`, module: 'Trimmers', init: 0, confidence: 'medium', sources: ['manual', 'observed', 'inference'], notes: 'OSCILLATOR VOICE DETUNE grid (3 rows x 8 knobs). Scaled by Detune Amt (OPT/TSlop). Range not documented; observed -100..100.' });
}
add('OPT/TSlop', { label: 'Detune Amt (voice detune scaling)', module: 'Trimmers', init: 0, confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: 'VST name "TuneSlop"; synth-proxy: corresponds to Detune Amt.' });
add('OPT/CSlop', { label: 'Cutoff variance', module: 'Trimmers', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('OPT/GSlop', { label: 'Glide variance', module: 'Trimmers', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('OPT/PSlop', { label: 'Pulse-width variance', module: 'Trimmers', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('OPT/ESlop', { label: 'Envelope-rate variance', module: 'Trimmers', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
for (let v = 1; v <= 8; v++) add(`OPT/V${v}Mod`, { label: `Voice Map ${v}`, module: 'Trimmers', init: 0, confidence: 'high', sources: ['vst', 'manual'], notes: 'Values for the VoiceMap modulation source.' });
add('OPT/TransM', { label: 'Transient Mode', module: 'Trimmers', enum: enumOf(['analog', 'dc reset', 'vcf reset', 'osc reset']), enumConfidence: 'low', init: 0, confidence: 'low', sources: ['manual', 'observed'], notes: 'Order assumed from the manual; only raw 0 observed.' });
for (const k of ['TPots', 'RndC', 'RndG', 'RndP', 'RndE', 'Acc', 'OffAcc', 'CtrPge']) {
  add(`OPT/${k}`, { label: `OPT ${k}`, module: 'Trimmers', confidence: 'unknown', sources: ['observed'], global: true, notes: 'Preserved verbatim.' });
}
add('OPT/Acc', { label: 'Accuracy', module: 'Global', confidence: 'medium', sources: ['vst', 'manual'], global: true, notes: 'Realtime accuracy (draft/fast/great/divine). Global, not written by diva-mcp.' });
add('OPT/OffAcc', { label: 'Offline Accuracy', module: 'Global', confidence: 'medium', sources: ['vst', 'manual'], global: true });

// ---------------------------------------------------------------- Envelopes
for (const n of [1, 2]) {
  const m = `Envelope ${n}`;
  const S = `ENV${n}`;
  add(`${S}/Atk`, { label: 'Attack', module: m, init: 0, unit: '0..100 knob (time curve undocumented)', confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Dec`, { label: 'Decay', module: m, init: 50, unit: '0..100 knob', confidence: 'high', sources: ['vst', 'manual'], notes: 'ADS model: shared decay/release time.' });
  add(`${S}/Sus`, { label: 'Sustain', module: m, init: n === 1 ? 100 : 0, unit: '0..100 level', confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Rel`, { label: 'Release', module: m, init: 20, unit: '0..100 knob', confidence: 'high', sources: ['vst', 'manual'], envModels: [1, 2], notes: 'ADS model uses Decay as release when Release On is set.' });
  add(`${S}/Vel`, { label: 'Velocity', module: m, init: n === 1 ? 30 : 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Model`, { label: 'Envelope Model', module: m, enum: enumOf(ENV_MODELS), enumConfidence: 'medium', init: 1, confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
  add(`${S}/Trig`, { label: 'Trigger', module: m, init: 0, confidence: 'low', sources: ['vst', 'synthproxy'], notes: '4 positions per synth-proxy; meanings undocumented. diva-mcp keeps 0 (gate, presumed).' });
  add(`${S}/Quant`, { label: 'Quantise (Q)', module: m, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, envModels: [2], confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Crve`, { label: 'Curve (C)', module: m, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, envModels: [2], confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/RelOn`, { label: 'Release On', module: m, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 1, envModels: [0], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
  add(`${S}/KeyFlw`, { label: 'KeyFollow (KYBD time scaling)', module: m, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
}

// ---------------------------------------------------------------- LFOs
for (const n of [1, 2]) {
  const m = `LFO ${n}`;
  const S = `LFO${n}`;
  add(`${S}/Sync`, { label: 'Sync (rate mode)', module: m, init: -2, confidence: 'medium', sources: ['vst', 'manual', 'observed'], notes: 'Raw -3..23 = 27 positions: "3 absolute times, plus 24 synchronized to song tempo" (manual). Negative values are free-running bases; exact divisions of 0..23 are unconfirmed. -2 is the most common value in real presets.' });
  add(`${S}/Trig`, { label: 'Restart', module: m, enum: enumOf(LFO_RESTART), enumConfidence: 'medium', init: 1, confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Wave`, { label: 'Waveform', module: m, enum: enumOf(LFO_WAVES), enumConfidence: 'medium', init: 1, confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
  add(`${S}/Phse`, { label: 'Phase', module: m, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Polar`, { label: 'Polarity', module: m, enum: { '0': 'bipolar', '1': 'unipolar' }, enumConfidence: 'medium', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`${S}/Dly`, { label: 'Delay (fade-in)', module: m, init: 0, confidence: 'high', sources: ['vst', 'manual'], notes: 'Manual: immediate .. about 20 s.' });
  src(`${S}/DMS1`, m, 'Depth Mod source');
  add(`${S}/DMD1`, { label: 'Depth Mod amount', module: m, init: n === 1 ? 0 : 100, confidence: 'high', sources: ['vst', 'manual'], notes: 'If the depth source is none, this knob scales the overall LFO level (manual).' });
  add(`${S}/Rate`, { label: 'Rate (offset from Sync)', module: m, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  src(`${S}/FMS1`, m, 'Rate Mod source');
  add(`${S}/FMD1`, { label: 'Rate Mod amount', module: m, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
}

// ---------------------------------------------------------------- MOD (modifications processors)
add('MOD/Quant', { label: 'Quantise steps', module: 'Modulation processors', init: 2, confidence: 'high', sources: ['vst', 'manual'], unit: '2..100 division factor' });
add('MOD/Slew', { label: 'Lag (slew rate)', module: 'Modulation processors', init: 50, confidence: 'high', sources: ['vst', 'manual'] });
src('MOD/RSrc', 'Modulation processors', 'Rectify input', { init: 0 });
src('MOD/ISrc', 'Modulation processors', 'Invert input', { init: 0 });
src('MOD/QSrc', 'Modulation processors', 'Quantise input', { init: 0 });
src('MOD/LSrc', 'Modulation processors', 'Lag input', { init: 0 });
src('MOD/A1Src', 'Modulation processors', 'Add input 1', { init: 0 });
src('MOD/A2Src', 'Modulation processors', 'Add input 2', { init: 0 });
src('MOD/M1Src', 'Modulation processors', 'Multiply input 1', { init: 0 });
src('MOD/M2Src', 'Modulation processors', 'Multiply input 2', { init: 0 });

// ---------------------------------------------------------------- OSC
const O = 'Oscillators';
add('OSC/Model', { label: 'Oscillator Model', module: O, enum: enumOf(OSC_MODELS), enumConfidence: 'high', init: 1, confidence: 'high', sources: ['vst', 'manual', 'synthproxy', 'factory'], notes: '0-based. Confirmed by factory MS-REV1 (MS-20 patch) = 3 (Dual VCO Eco).' });
add('OSC/Tune1', { label: 'Osc 1 octave / coarse tune', module: O, init: 0, unit: 'semitones; octave switch positions -24,-12,0,12,24 (32\'..2\')', confidence: 'medium', sources: ['vst', 'observed', 'synthproxy'], notes: 'Real presets use multiples of 12 (synth-proxy cardinality 5).' });
add('OSC/Tune2', { label: 'Osc 2 tune / detune', module: O, init: 0, unit: 'semitones (+/-30, fractional = fine detune)', oscModels: [0, 1, 3, 4], confidence: 'medium', sources: ['vst', 'manual', 'observed', 'synthproxy'], notes: 'Manual (Digital): +/-30 semitones. Real presets use values like 12.03 (= octave + 3 cents).' });
add('OSC/Tune3', { label: 'Osc 3 tune / detune', module: O, init: 0, unit: 'semitones (+/-30)', oscModels: [0], confidence: 'medium', sources: ['vst', 'observed', 'synthproxy'] });
add('OSC/VtoD', { label: 'Vibrato (LFO1 -> pitch)', module: 'Tuning', init: 0, confidence: 'high', sources: ['vst', 'manual'], notes: 'VST name "OSC: Vibrato"; manual: amount oscillators are pitch-modulated by LFO1.' });
add('OSC/PW', { label: 'Pulse Width', module: O, init: 50, oscModels: [1, 2, 3, 4], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: 'Dual VCO/DCO: nominal pulse width. Digital: wave-dependent (PW for Pulse mode).' });
for (const i of [1, 2, 3]) add(`OSC/Shape${i}`, { label: `Osc ${i} Waveform (Triple VCO morph)`, module: O, init: 5, unit: '1..9 continuous: ramp -> triangle -> saw -> square -> narrow pulse; 8.00 = 25% pulse (manual)', oscModels: [0], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/FM', { label: 'FM 1->2/3 / Cross Mod', module: O, init: 0, oscModels: [0, 1, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/Sync2', { label: 'Sync osc 2 -> 1', module: O, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, oscModels: [0, 1, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/Sync3', { label: 'Sync osc 3 -> 1', module: O, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, oscModels: [0], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/OscMix', { label: 'Osc Mix (VCO1 <-> VCO2)', module: O, init: 50, oscModels: [1, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/Vol1', { label: 'Volume 1', module: O, init: 100, oscModels: [0, 3], confidence: 'medium', sources: ['vst', 'synthproxy'], notes: 'Triple VCO mixer osc 1; Dual VCO Eco level 1.' });
add('OSC/Vol2', { label: 'Volume 2', module: O, init: 0, oscModels: [0, 3], confidence: 'medium', sources: ['vst', 'synthproxy'] });
add('OSC/Vol3', { label: 'Volume 3 / DCO Sub level', module: O, init: 0, oscModels: [0, 2], confidence: 'medium', sources: ['vst', 'synthproxy'], notes: 'Triple VCO mixer osc 3; DCO sub-oscillator level (synth-proxy).' });
add('OSC/PWShp', { label: 'DCO Pulse selector', module: O, init: 0, oscModels: [2], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: '4 positions. Position 0 = off/silence; the 4th position (raw 3) reacts to pulse width (manual: "4th option from the top"). Exact shapes of 1..2 shown only as pictures.' , enum: { '0': 'off', '1': 'pulse shape 1', '2': 'pulse shape 2', '3': 'PWM pulse (reacts to PW)' }, enumConfidence: 'low' });
add('OSC/SawShp', { label: 'DCO Sawtooth selector', module: O, init: 1, oscModels: [2], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: '6 positions; 0 = off; raw 3 (4th) reacts to PW per manual. Other shapes undocumented in text.', enum: { '0': 'off', '1': 'saw', '2': 'saw shape 2', '3': 'PW-reactive saw', '4': 'saw shape 4', '5': 'saw shape 5' }, enumConfidence: 'low' });
add('OSC/SubShp', { label: 'DCO Sub-oscillator selector', module: O, init: 0, oscModels: [2], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: '6 pulse-based waves: top four one octave down, the others two octaves down (manual). Raw index -> picture order assumed.', enum: { '0': '-1 oct shape 1', '1': '-1 oct shape 2', '2': '-1 oct shape 3', '3': '-1 oct shape 4', '4': '-2 oct shape 1', '5': '-2 oct shape 2' }, enumConfidence: 'low' });
src('OSC/TM1Src', O, 'Tune Mod 1 source', { init: 15, notes: 'Pitch modulation source (ENV2 by default per manual).' });
add('OSC/TM1Dpt', { label: 'Tune Mod 1 depth', module: O, init: 0, unit: 'semitones? (+/-24)', confidence: 'high', sources: ['vst', 'manual'] });
src('OSC/TM2Src', O, 'Tune Mod 2 source', { init: 17, oscModels: [1, 2, 3, 4] });
add('OSC/TM2Dpt', { label: 'Tune Mod 2 depth', module: O, init: 0, oscModels: [1, 2, 3, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
src('OSC/PWMSrc', O, 'PWM source', { init: 17, oscModels: [1, 2, 4] });
add('OSC/PWMDpt', { label: 'PWM depth', module: O, init: 0, oscModels: [1, 2, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
src('OSC/Sh1Src', O, 'Shape Mod source', { init: 17, oscModels: [0, 4] });
add('OSC/Sh1Dpt', { label: 'Shape Mod depth', module: O, init: 0, oscModels: [0, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
const sw = (id: string, label: string, models: number[], extra: Partial<Curated> = {}) =>
  add(id, { label, module: O, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, oscModels: models, confidence: 'high', sources: ['vst', 'manual', 'synthproxy'], ...extra });
sw('OSC/Tri1', 'Dual VCO: VCO1 triangle', [1]);
sw('OSC/Saw1', 'Dual VCO: VCO1 saw', [1], { init: 1 });
sw('OSC/PWM1', 'Dual VCO: VCO1 pulse / Digital: osc1 param-2 mod switch', [1, 4]);
sw('OSC/Noise1', 'Dual VCO: VCO1 noise', [1]);
sw('OSC/Sin2', 'Dual VCO: VCO2 sine', [1]);
sw('OSC/Tri2', 'Dual VCO: VCO2 triangle', [1]);
sw('OSC/Saw2', 'Dual VCO: VCO2 saw', [1], { init: 1 });
sw('OSC/PW2', 'Dual VCO: VCO2 pulse', [1]);
sw('OSC/PWM2', 'Dual VCO: PWM switch / Digital: osc2 param-2 mod switch', [1, 4], { confidence: 'medium', notes: 'synth-proxy: "PWM switch for Dual VCO". The manual describes a switch applying PW/PWM to VCO1 only or both; mapping to this flag is unconfirmed.' });
add('OSC/triSp', { label: 'Dual VCO Shape (hardware revision)', module: O, enum: enumOf(['ideal', 'analog1', 'analog2']), enumConfidence: 'medium', init: 1, oscModels: [1], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/Noise', { label: 'Noise volume', module: O, init: 0, oscModels: [0, 2], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy', 'observed'], notes: 'deepdiva lists 0..4 but observed values reach 93: treated as 0..100.' });
add('OSC/NoiseC', { label: 'Noise colour', module: O, enum: { '0': 'pink', '1': 'white' }, enumConfidence: 'low', init: 0, oscModels: [0], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
for (const i of [1, 2, 3]) {
  sw(`OSC/TM${i}On`, `Tune mod on osc ${i}`, i === 3 ? [0] : [0, 4]);
  sw(`OSC/SM${i}On`, `Shape mod on osc ${i}`, i === 3 ? [0] : [0, 4]);
}
add('OSC/TMmode', { label: 'Dual VCO Tune Mod target', module: O, enum: enumOf(['1', 'both', '2', 'split']), enumConfidence: 'low', init: 1, oscModels: [1], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: 'Manual: 4-way switch 1 / BOTH / 2 / SPLIT. Raw order assumed from manual.' });
add('OSC/Wave1', { label: 'Eco VCO1 waveform', module: O, init: 1, oscModels: [3], confidence: 'low', sources: ['vst', 'synthproxy', 'observed'], notes: 'Raw 1..4. Waveform names per position are not documented in text; treat as raw selector.' });
add('OSC/Wave2', { label: 'Eco VCO2 waveform', module: O, init: 1, oscModels: [3], confidence: 'low', sources: ['vst', 'synthproxy', 'observed'], notes: 'Raw 1..4; see Wave1.' });
add('OSC/RMPwm', { label: 'Ring mod (pulse)', module: O, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'low', init: 0, oscModels: [3, 4], confidence: 'low', sources: ['vst', 'synthproxy', 'manual'], notes: 'VST "RingmodPulse". synth-proxy says Digital only; the manual describes RING for both Eco and Digital.' });
add('OSC/Drift', { label: 'Voice Drift', module: 'Trimmers', init: 0, unit: '0..200', confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: 'Slow wavering of overall pitch (TRIMMERS). Keep low for good tuning.' });
src('OSC/FmSrc', O, 'FM & Cross Mod depth source', { init: 0, oscModels: [0, 1, 4] });
add('OSC/FmDpt', { label: 'FM & Cross Mod depth amount', module: O, init: 0, oscModels: [0, 1, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
src('OSC/NoisSrc', O, 'Noise & Dual VCO Mix mod source', { init: 0 });
add('OSC/NoisDpt', { label: 'Noise & Dual VCO Mix mod amount', module: O, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
for (const k of ['JpSp1', 'JpSp2']) add(`OSC/${k}`, { label: `OSC ${k}`, module: O, confidence: 'unknown', sources: ['observed'], init: 1, notes: 'Undocumented; always 1 in reference presets.' });
add('OSC/BpNoise', { label: 'Bipolar Noise', module: 'Trimmers', enum: { '0': 'off', '1': 'on' }, enumConfidence: 'low', init: 1, confidence: 'low', sources: ['manual', 'observed', 'inference'], notes: 'Manual: "best left switched on". Always 1 in references.' });
for (const i of [1, 2, 3]) add(`OSC/RstPh${i}`, { label: `Reset Phase osc ${i}`, module: 'Trimmers', init: 0, confidence: 'low', sources: ['manual', 'inference'], notes: 'Only effective with Transient Mode = osc reset.' });
add('OSC/DgtlTp1', { label: 'Digital osc 1 waveform', module: O, enum: enumOf(DIGITAL_WAVES), enumConfidence: 'low', init: 5, oscModels: [4], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: '7 waveforms; raw order assumed to follow the manual list.' });
add('OSC/DgtlTp2', { label: 'Digital osc 2 waveform', module: O, enum: enumOf(DIGITAL_WAVES), enumConfidence: 'low', init: 5, oscModels: [4], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
add('OSC/DgtlSp2', { label: 'Digital shape 2', module: O, init: 50, oscModels: [4], confidence: 'low', sources: ['vst', 'synthproxy'], notes: 'Per-waveform knob (DETUNE/MULTI/WRAP/BEND/Q/HARMONICS ...). Exact assignment undocumented.' });
add('OSC/DgtlSp3', { label: 'Digital shape 3', module: O, init: 50, oscModels: [4], confidence: 'low', sources: ['vst', 'synthproxy'] });
add('OSC/DgtlSp4', { label: 'Digital shape 4', module: O, init: 0, oscModels: [4], confidence: 'low', sources: ['vst', 'synthproxy'] });
add('OSC/DNoAlia', { label: 'Digital High Quality (anti-alias)', module: O, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'medium', init: 1, oscModels: [4], confidence: 'medium', sources: ['vst', 'manual'] });

// ---------------------------------------------------------------- HPF
const H = 'High-pass / Feedback';
add('HPF/Model', { label: 'HPF / Feedback model', module: H, enum: enumOf(HPF_MODELS), enumConfidence: 'high', init: 0, oscModels: [1, 2, 3, 4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy', 'factory'], notes: 'Not shown when OSC = Triple VCO (that model has its own mixer + feedback). Factory MS-REV1 = 3 (HPF Bite).' });
add('HPF/Freq', { label: 'HPF Frequency', module: H, init: 30, hpfModels: [2, 3], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('HPF/Res', { label: 'HPF Peak (resonance)', module: H, init: 0, hpfModels: [3], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('HPF/Rev', { label: 'HPF Bite revision', module: H, enum: { '1': 'Rev 1', '2': 'Rev 2' }, enumConfidence: 'medium', init: 1, hpfModels: [3], confidence: 'high', sources: ['vst', 'manual', 'factory'] });
add('HPF/KeyScl', { label: 'HPF KeyFollow', module: H, init: 0, confidence: 'low', sources: ['vst', 'synthproxy'], notes: 'synth-proxy could not locate this control in the UI.' });
src('HPF/FMSrc', H, 'HPF cutoff mod source', { init: 0, hpfModels: [3] });
add('HPF/FMDpt', { label: 'HPF cutoff mod amount', module: H, init: 0, hpfModels: [3], confidence: 'high', sources: ['vst', 'synthproxy'] });
add('HPF/PFreq', { label: 'Post-HPF frequency switch', module: H, init: 0, hpfModels: [1], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: 'Raw -1..3 (5 positions). Manual: either boosts bass (BOOST) or removes lows; -1 is presumably BOOST (inference).' });

// ---------------------------------------------------------------- VCF1
const F = 'Main filter';
add('VCF1/Model', { label: 'Filter Model', module: F, enum: enumOf(FILTER_MODELS), enumConfidence: 'high', init: 1, confidence: 'high', sources: ['vst', 'manual', 'synthproxy', 'factory'], notes: '0-based. Factory MS-REV1 = 3 (Bite) with SkRev 1.' });
add('VCF1/Freq', { label: 'Cutoff', module: F, init: 100, unit: 'semitone-like scale; observed 30..150', confidence: 'high', sources: ['vst', 'manual', 'observed'] });
add('VCF1/Res', { label: 'Resonance / Emphasis / Peak', module: F, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
src('VCF1/FMSrc', F, 'Cutoff mod 1 source', { init: 15, notes: 'Default ENV2 (manual).' });
add('VCF1/FMDpt', { label: 'Cutoff mod 1 amount', module: F, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
src('VCF1/FM2Src', F, 'Cutoff mod 2 source', { init: 17, notes: 'Default LFO2 (manual).' });
add('VCF1/FM2Dpt', { label: 'Cutoff mod 2 amount', module: F, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCF1/KeyScl', { label: 'Key follow (KYBD)', module: F, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
add('VCF1/FFM', { label: 'Filter FM (from osc 1)', module: F, init: 0, filterModels: [0, 1, 2, 4], confidence: 'high', sources: ['vst', 'manual'] });
add('VCF1/LMode', { label: 'Pole mode (24/12 dB)', module: F, enum: { '0': '4-pole 24 dB', '1': '2-pole 12 dB' }, enumConfidence: 'low', init: 0, filterModels: [0, 1], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
add('VCF1/LColor', { label: 'Cascade Rough/Clean', module: F, enum: { '0': 'rough', '1': 'clean' }, enumConfidence: 'low', init: 1, filterModels: [1], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
add('VCF1/SkRev', { label: 'Bite revision', module: F, enum: { '1': 'Rev 1', '2': 'Rev 2' }, enumConfidence: 'medium', init: 1, filterModels: [3], confidence: 'high', sources: ['vst', 'manual', 'factory'] });
add('VCF1/SvfMode', { label: 'Multimode type', module: F, enum: enumOf(['LP4', 'LP2', 'HP', 'BP']), enumConfidence: 'low', init: 0, filterModels: [2], confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'], notes: 'Order assumed from the manual (LP4, LP2, HP, BP).' });
add('VCF1/Fback', { label: 'Feedback (post-filter -> mixer)', module: 'High-pass / Feedback', init: 0, confidence: 'high', sources: ['vst', 'manual', 'synthproxy'], notes: 'Active for Triple VCO (mixer) or when HPF Model = No HPF (Feedback).' });
src('VCF1/ResSrc', F, 'Resonance Mod source', { init: 0 });
add('VCF1/ResDpt', { label: 'Resonance Mod amount', module: F, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
src('VCF1/FfmSrc', F, 'Filter FM Mod source', { init: 0 });
add('VCF1/FfmDpt', { label: 'Filter FM Mod amount', module: F, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
src('VCF1/FbSrc', F, 'Feedback Mod source', { init: 0 });
add('VCF1/FbDpt', { label: 'Feedback Mod amount', module: F, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCF1/InTune', { label: 'VCF1 InTune', module: F, confidence: 'unknown', sources: ['observed'], init: 1, notes: 'Undocumented; always 1 in references.' });
add('VCF1/ShpMix', { label: 'Uhbie Mix (LP -> BR/BP -> HP)', module: F, init: 0, filterModels: [4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
src('VCF1/SMSrc', F, 'Uhbie Mix mod source', { init: 0, filterModels: [4] });
add('VCF1/SMDpt', { label: 'Uhbie Mix mod amount', module: F, init: 0, filterModels: [4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });
add('VCF1/BpUbie', { label: 'Uhbie BR/BP switch', module: F, enum: { '0': 'band-reject (notch)', '1': 'band-pass' }, enumConfidence: 'medium', init: 0, filterModels: [4], confidence: 'high', sources: ['vst', 'manual', 'synthproxy'] });

// ---------------------------------------------------------------- VCA
const A = 'Amplifier';
add('VCA1/Pan', { label: 'Pan', module: A, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCA1/Vol', { label: 'Volume (VCA gain)', module: A, init: 50, confidence: 'high', sources: ['vst', 'manual'], notes: 'Positive/high values can subtly overdrive the amplifier.' });
add('VCA1/VCA', { label: 'VCA source', module: A, enum: { '0': 'Gate', '1': 'Env1' }, enumConfidence: 'medium', init: 1, confidence: 'medium', sources: ['vst', 'manual', 'synthproxy'] });
src('VCA1/ModSrc', A, 'Vol Mod source', { init: 0 });
add('VCA1/ModDpt', { label: 'Vol Mod amount', module: A, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
src('VCA1/PanSrc', A, 'Pan Mod source', { init: 0 });
add('VCA1/PanDpt', { label: 'Pan Mod amount', module: A, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
add('VCA1/Mode', { label: 'VCA1 Mode', module: A, init: 0, confidence: 'unknown', sources: ['vst', 'observed'], notes: 'Always 0 in references; purpose unknown.' });
add('VCA1/Offset', { label: 'VCA1 Offset', module: A, confidence: 'unknown', sources: ['vst', 'observed'], notes: 'Undocumented; preserved.' });

// ---------------------------------------------------------------- Scope
for (const k of ['Mode', 'frq', 'scl', 'Inp', 'cs1', 'cs2', 'pc', 'Mod']) add(`Scope1/${k}`, { label: `Scope ${k}`, module: 'Scope', confidence: 'low', sources: ['vst', 'observed'], global: true, notes: 'Oscilloscope display only; does not affect sound.' });

// ---------------------------------------------------------------- FX
for (const n of [1, 2]) {
  add(`FX${n}/Module`, { label: `FX${n} type`, module: 'Effects', enum: Object.fromEntries(FX_MODULES.map((m) => [`'${m}${n}'`, m])), enumConfidence: 'high', init: `'Chorus${n}'`, confidence: 'high', sources: ['vst', 'observed', 'manual'], notes: `String value, e.g. 'Chorus${n}', 'Phaser${n}', 'Plate${n}', 'Delay${n}', 'Rotary${n}'. Parameters live in sections Chrs${n}/Phase${n}/Plate${n}/Delay${n}/Rtary${n}.` });
  const e = `Effects (FX${n})`;
  add(`Chrs${n}/Type`, { label: 'Chorus Type', module: e, enum: enumOf(['Classic', 'Dramatic', 'Ensemble']), enumConfidence: 'low', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Chrs${n}/Rate`, { label: 'Chorus Rate', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Chrs${n}/Depth`, { label: 'Chorus Depth', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Chrs${n}/Wet`, { label: 'Chorus Wet', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Type`, { label: 'Phaser Type', module: e, enum: { '0': 'Stoned', '1': 'Flanged' }, enumConfidence: 'low', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Rate`, { label: 'Phaser Rate / Beats', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/FB`, { label: 'Phaser Feedback', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Stereo`, { label: 'Phaser Stereo', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'], notes: 'Stoned type: max width at +/-25.' });
  add(`Phase${n}/Sync`, { label: 'Phaser Sync', module: e, enum: { '0': 'off', '1': 'on' }, enumConfidence: 'high', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Phase`, { label: 'Phaser LFO Phase', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Wet`, { label: 'Phaser Wet', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Depth`, { label: 'Phaser Depth', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Phase${n}/Center`, { label: 'Phaser Center', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Pre`, { label: 'Plate PreDelay', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Diff`, { label: 'Plate Diffusion', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Damp`, { label: 'Plate Damp', module: e, init: 80, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Decay`, { label: 'Plate Decay', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Size`, { label: 'Plate Size', module: e, init: 150, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Dry`, { label: 'Plate Dry', module: e, init: 90, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Plate${n}/Wet`, { label: 'Plate Wet', module: e, init: 40, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/LDel`, { label: 'Delay Left time', module: e, init: 3, unit: 'sixteenth notes (integer = exact semiquaver)', confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/CDel`, { label: 'Delay Center time (= feedback time)', module: e, init: 4, unit: 'sixteenth notes', confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/RDel`, { label: 'Delay Right time', module: e, init: 6, unit: 'sixteenth notes', confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/SVol`, { label: 'Delay Side Vol', module: e, init: 30, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/CVol`, { label: 'Delay Center Vol', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/FeedB`, { label: 'Delay Feedback', module: e, init: 30, confidence: 'high', sources: ['vst', 'manual'], notes: '100 = infinite with HP min / LP max.' });
  add(`Delay${n}/HP`, { label: 'Delay HP (feedback path)', module: e, init: 10, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/LP`, { label: 'Delay LP (feedback path)', module: e, init: 80, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/Dry`, { label: 'Delay Dry', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Delay${n}/Wow`, { label: 'Delay Wow (tape wobble)', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Mode`, { label: 'Rotary Mode', module: e, enum: enumOf(['Normal', 'SyncBass', 'NoBass']), enumConfidence: 'low', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Mix`, { label: 'Rotary Mix', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Bal`, { label: 'Rotary Balance (horn/bass)', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Drive`, { label: 'Rotary Drive', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Stereo`, { label: 'Rotary Stereo', module: e, init: 100, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Out`, { label: 'Rotary Out', module: e, init: 0, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Slow`, { label: 'Rotary Slow speed', module: e, init: 30, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Fast`, { label: 'Rotary Fast speed', module: e, init: 85, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/RTime`, { label: 'Rotary RiseTime', module: e, init: 50, confidence: 'high', sources: ['vst', 'manual'] });
  add(`Rtary${n}/Cont`, { label: 'Rotary speed Controller', module: e, enum: enumOf(['ModWheel', 'CtrlA', 'CtrlB', 'Pressure']), enumConfidence: 'low', init: 0, confidence: 'high', sources: ['vst', 'manual'] });
}

export const CURATION: Readonly<Record<string, Curated>> = C;

/**
 * Fixed modulation slots of Diva. Diva has NO free modulation matrix: each
 * destination has its own dedicated source selector(s) + amount knob(s).
 */
export const MODULATION_SLOTS: { destination: string; source: string; amount: string; note?: string }[] = [
  { destination: 'Cutoff (mod 1)', source: 'VCF1/FMSrc', amount: 'VCF1/FMDpt', note: 'default ENV2' },
  { destination: 'Cutoff (mod 2)', source: 'VCF1/FM2Src', amount: 'VCF1/FM2Dpt', note: 'default LFO2' },
  { destination: 'Cutoff key follow', source: '(KeyFollow, fixed)', amount: 'VCF1/KeyScl' },
  { destination: 'Resonance', source: 'VCF1/ResSrc', amount: 'VCF1/ResDpt', note: 'MODIFICATIONS panel' },
  { destination: 'Filter FM amount', source: 'VCF1/FfmSrc', amount: 'VCF1/FfmDpt', note: 'MODIFICATIONS panel' },
  { destination: 'Feedback amount', source: 'VCF1/FbSrc', amount: 'VCF1/FbDpt', note: 'Triple VCO or HPF=Feedback only' },
  { destination: 'Uhbie mix', source: 'VCF1/SMSrc', amount: 'VCF1/SMDpt', note: 'Uhbie only' },
  { destination: 'HPF cutoff', source: 'HPF/FMSrc', amount: 'HPF/FMDpt', note: 'HPF Bite only' },
  { destination: 'Pitch (tune mod 1)', source: 'OSC/TM1Src', amount: 'OSC/TM1Dpt', note: 'Triple VCO: per-osc switches TM1On..TM3On' },
  { destination: 'Pitch (tune mod 2)', source: 'OSC/TM2Src', amount: 'OSC/TM2Dpt', note: 'Dual VCO / DCO / Eco / Digital' },
  { destination: 'Vibrato (LFO1, fixed source)', source: '(LFO1, fixed)', amount: 'OSC/VtoD' },
  { destination: 'Pulse width', source: 'OSC/PWMSrc', amount: 'OSC/PWMDpt', note: 'Dual VCO / DCO / Digital' },
  { destination: 'Waveform shape', source: 'OSC/Sh1Src', amount: 'OSC/Sh1Dpt', note: 'Triple VCO (switches SM1On..SM3On) / Digital' },
  { destination: 'FM / Cross mod depth', source: 'OSC/FmSrc', amount: 'OSC/FmDpt', note: 'MODIFICATIONS panel' },
  { destination: 'Noise level / Dual VCO mix', source: 'OSC/NoisSrc', amount: 'OSC/NoisDpt', note: 'MODIFICATIONS panel' },
  { destination: 'VCA volume', source: 'VCA1/ModSrc', amount: 'VCA1/ModDpt' },
  { destination: 'Pan', source: 'VCA1/PanSrc', amount: 'VCA1/PanDpt' },
  { destination: 'LFO1 depth', source: 'LFO1/DMS1', amount: 'LFO1/DMD1' },
  { destination: 'LFO1 rate', source: 'LFO1/FMS1', amount: 'LFO1/FMD1' },
  { destination: 'LFO2 depth', source: 'LFO2/DMS1', amount: 'LFO2/DMD1' },
  { destination: 'LFO2 rate', source: 'LFO2/FMS1', amount: 'LFO2/FMD1' },
  { destination: 'Envelope level', source: '(Velocity, fixed)', amount: 'ENV1/Vel, ENV2/Vel' },
  { destination: 'Envelope times', source: '(KeyFollow, fixed)', amount: 'ENV1/KeyFlw, ENV2/KeyFlw' },
  { destination: 'Rotary speed', source: 'Rtary1/Cont (ModWheel/CtrlA/CtrlB/Pressure)', amount: '-' },
];
