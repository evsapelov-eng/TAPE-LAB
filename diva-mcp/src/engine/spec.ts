/**
 * PresetSpec: the structured, synth-specific description of a Diva patch.
 *
 * Layer 2 of the pipeline (Sound Design Reasoning -> Parameter Mapping -> Serialization).
 * All knob values use Diva's own raw scales (mostly 0..100) because the
 * manual does not publish time/frequency curves; we do not pretend otherwise.
 * Every field is optional: unspecified fields keep the value of the base
 * (init template for generate_preset, the existing file for edit_preset).
 */
import { z } from 'zod';

const knob = z.number().min(0).max(100);
const bipolar100 = z.number().min(-100).max(100);
export const ModSourceZ = z
  .string()
  .describe(
    'Modulation source name from the #ms list: none, ModWhl, PitchW, CtrlA, CtrlB, Gate, Velocity, Pressure (aftertouch), KeyFollow, KeyFollow2, Alternate, Random, StackVoice, VoiceMap, Env1, Env2, LFO1, LFO2, Rectify, Invert, Quant, Lag, Adder, Multiply',
  );
const route = (amountMin: number, amountMax: number) =>
  z.object({ source: ModSourceZ, amount: z.number().min(amountMin).max(amountMax) }).strict();

export const MetaZ = z
  .object({
    name: z.string().min(1).max(64).optional().describe('Preset name, e.g. "PD Analog Memories" (u-he convention: 2-3 letter category prefix)'),
    author: z.string().max(64).optional(),
    bank: z.string().max(64).optional(),
    description: z.string().max(1000).optional(),
    usage: z.string().max(500).optional().describe('Performance notes, e.g. "MW = vibrato, AT = brightness"'),
    categories: z.array(z.string()).max(4).optional().describe('u-he style "Type:Subtype", e.g. "Pads:Analogue", "Bass:Synth", "Keys:Electric", "Leads:Mono", "Plucks"'),
    features: z.array(z.string()).max(10).optional().describe('e.g. Poly, Mono, Glide, Arp, Dry, Stereo'),
    character: z.array(z.string()).max(10).optional().describe('e.g. Warm, Dark, Moving, Vintage, Soft'),
  })
  .strict();

const octave = z.number().int().min(-2).max(2).describe('Octave switch: -2 (32\') .. +2 (2\'), 0 = 8\'');
const semitones30 = z
  .number()
  .min(-30)
  .max(30)
  .describe('Semitones incl. fraction (0.07 = 7 cents). Real presets use e.g. 0.05, 7.00, 12.03, -12.00. Whether this is relative to osc1\'s octave switch is unconfirmed: keep osc1 octave 0 and set the register with voice.transpose so both readings agree.');

export const TripleVcoZ = z
  .object({
    model: z.literal('triple_vco'),
    osc1: z.object({ octave: octave.optional(), shape: z.number().min(1).max(9).optional(), volume: knob.optional() }).strict().optional(),
    osc2: z.object({ semitones: semitones30.optional(), shape: z.number().min(1).max(9).optional(), volume: knob.optional(), sync: z.boolean().optional() }).strict().optional(),
    osc3: z.object({ semitones: semitones30.optional(), shape: z.number().min(1).max(9).optional(), volume: knob.optional(), sync: z.boolean().optional() }).strict().optional(),
    fm: knob.optional().describe('FM 1 -> 2/3'),
    noise: z.object({ volume: knob.optional(), color: z.enum(['pink', 'white']).optional() }).strict().optional(),
    feedback: knob.optional().describe('Mixer feedback (VCF1/Fback): subtle bass boost .. howl'),
    tune_mod_targets: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).optional().describe('Which oscillators receive modulation.pitch_1'),
    shape_mod_targets: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).optional().describe('Which oscillators receive modulation.shape'),
  })
  .strict()
  .describe('Shape 1..9: ramp -> triangle -> saw -> square -> narrower pulses; only "8.00 = 25% pulse" is documented (manual), intermediate positions (~3 triangle, ~5 saw) are approximate');

export const DualVcoZ = z
  .object({
    model: z.literal('dual_vco'),
    osc1: z.object({ octave: octave.optional(), triangle: z.boolean().optional(), saw: z.boolean().optional(), pulse: z.boolean().optional(), noise: z.boolean().optional() }).strict().optional(),
    osc2: z.object({ semitones: semitones30.optional(), sine: z.boolean().optional(), triangle: z.boolean().optional(), saw: z.boolean().optional(), pulse: z.boolean().optional() }).strict().optional(),
    pulse_width: knob.optional(),
    pwm_switch: z.boolean().optional().describe('OSC/PWM2 flag (low confidence: presumed PWM switch)'),
    sync: z.boolean().optional(),
    cross_mod: knob.optional(),
    mix: knob.optional().describe('0 = VCO1 only, 100 = VCO2 only'),
    shape_model: z.enum(['ideal', 'analog1', 'analog2']).optional(),
    tune_mod_target: z.enum(['1', 'both', '2', 'split']).optional(),
    feedback: knob.optional().describe('Only effective with hpf.model = "feedback"'),
  })
  .strict();

export const DcoZ = z
  .object({
    model: z.literal('dco'),
    octave: octave.optional(),
    pulse_shape: z.number().int().min(0).max(3).optional().describe('0 = off; 3 = PW-reactive pulse'),
    saw_shape: z.number().int().min(0).max(5).optional().describe('0 = off; 1 = plain saw; 3 = PW-reactive'),
    sub_shape: z.number().int().min(0).max(5).optional().describe('0..3 one octave down, 4..5 two octaves down'),
    sub_volume: knob.optional(),
    noise_volume: knob.optional(),
    pulse_width: knob.optional(),
    feedback: knob.optional().describe('Only effective with hpf.model = "feedback"'),
  })
  .strict();

export const EcoZ = z
  .object({
    model: z.literal('dual_vco_eco'),
    osc1: z.object({ octave: octave.optional(), wave_raw: z.number().int().min(1).max(4).optional(), volume: knob.optional() }).strict().optional(),
    osc2: z.object({ semitones: semitones30.optional(), wave_raw: z.number().int().min(1).max(4).optional(), volume: knob.optional() }).strict().optional(),
    ring: z.boolean().optional().describe('OSC/RMPwm (low confidence)'),
    feedback: knob.optional(),
  })
  .strict()
  .describe('LOW CONFIDENCE: Eco waveform positions are raw selectors (1..4) with undocumented names.');

export const DigitalZ = z
  .object({
    model: z.literal('digital'),
    osc1: z.object({ octave: octave.optional(), wave: z.enum(['multisaw', 'triwrap', 'noise', 'feedback', 'pulse', 'sawtooth', 'triangle']).optional() }).strict().optional(),
    osc2: z.object({ semitones: semitones30.optional(), wave: z.enum(['multisaw', 'triwrap', 'noise', 'feedback', 'pulse', 'sawtooth', 'triangle']).optional() }).strict().optional(),
    shape2: knob.optional().describe('Raw per-wave knob (assignment undocumented, low confidence)'),
    shape3: knob.optional(),
    shape4: knob.optional(),
    pulse_width: knob.optional(),
    cross: knob.optional(),
    sync: z.boolean().optional(),
    mix: knob.optional(),
    high_quality: z.boolean().optional(),
    feedback: knob.optional().describe('Only effective with hpf.model = "feedback"'),
  })
  .strict();

export const OscillatorZ = z.discriminatedUnion('model', [TripleVcoZ, DualVcoZ, DcoZ, EcoZ, DigitalZ]);

export const HpfZ = z
  .object({
    model: z.enum(['feedback', 'post', 'pre', 'bite']),
    frequency: z.number().min(30).max(150).optional().describe('pre / bite'),
    resonance: knob.optional().describe('bite only (PEAK)'),
    revision: z.union([z.literal(1), z.literal(2)]).optional().describe('bite only'),
    post_freq_raw: z.number().int().min(-1).max(3).optional().describe('post only, raw 5-position switch'),
  })
  .strict()
  .describe('Not available with oscillator.model = triple_vco (it has a mixer instead)');

export const FilterZ = z
  .object({
    model: z.enum(['ladder', 'cascade', 'multimode', 'bite', 'uhbie']),
    cutoff: z.number().min(30).max(150).optional().describe('Diva cutoff scale; ~30 very dark .. 150 fully open'),
    resonance: knob.optional(),
    key_follow: knob.optional(),
    filter_fm: z.number().min(-24).max(24).optional().describe('FM from osc 1 (not Bite)'),
    slope: z.enum(['24db', '12db']).optional().describe('ladder / cascade'),
    character: z.enum(['rough', 'clean']).optional().describe('cascade only (low confidence mapping)'),
    mode: z.enum(['lp4', 'lp2', 'hp', 'bp']).optional().describe('multimode only'),
    revision: z.union([z.literal(1), z.literal(2)]).optional().describe('bite only'),
    uhbie_mix: knob.optional().describe('uhbie: 0 LP .. 50 BR/BP .. 100 HP'),
    uhbie_center: z.enum(['notch', 'bandpass']).optional(),
  })
  .strict();

export const EnvelopeZ = z
  .object({
    model: z.enum(['ads', 'analogue', 'digital']).optional(),
    attack: knob.optional(),
    decay: knob.optional(),
    sustain: knob.optional(),
    release: knob.optional().describe('analogue / digital only (ADS uses decay as release)'),
    velocity: knob.optional(),
    key_follow: knob.optional(),
    release_on: z.boolean().optional().describe('ADS only'),
    quantise: z.boolean().optional().describe('digital only'),
    curve: z.boolean().optional().describe('digital only'),
  })
  .strict();

export const LfoZ = z
  .object({
    waveform: z.enum(['sine', 'triangle', 'saw_up', 'saw_down', 'square_hi_lo', 'square_lo_hi', 'random_hold', 'random_glide']).optional(),
    restart: z.enum(['sync', 'gate', 'single', 'random']).optional(),
    sync_raw: z.number().int().min(-3).max(23).optional().describe('Raw Sync position: -3..-1 free-running bases (-2 most common), 0..23 tempo divisions (exact mapping unconfirmed)'),
    rate: z.number().min(-5).max(5).optional().describe('Offset from the Sync value'),
    phase: knob.optional(),
    delay: knob.optional().describe('Fade-in, up to ~20 s'),
    polarity: z.enum(['bipolar', 'unipolar']).optional(),
    depth: knob.optional().describe('Depth Mod amount; scales overall level when depth_source = none'),
    depth_source: ModSourceZ.optional(),
    rate_mod: route(-5, 5).optional(),
  })
  .strict();

export const ModulationZ = z
  .object({
    cutoff_1: route(-120, 120).optional(),
    cutoff_2: route(-120, 120).optional(),
    resonance: route(-100, 100).optional(),
    filter_fm: route(-24, 24).optional(),
    feedback: route(-100, 100).optional(),
    uhbie_mix: route(-100, 100).optional(),
    hpf_cutoff: route(-120, 120).optional(),
    pitch_1: route(-24, 24).optional().describe('Tune Mod 1 (Triple VCO: use oscillator.tune_mod_targets)'),
    pitch_2: route(-24, 24).optional().describe('Tune Mod 2 (not Triple VCO)'),
    vibrato: knob.optional().describe('Fixed LFO1 -> pitch amount (OSC/VtoD)'),
    pulse_width: route(-50, 50).optional().describe('Dual VCO / DCO / Digital'),
    shape: route(-50, 50).optional().describe('Triple VCO / Digital'),
    fm_depth: route(-100, 100).optional(),
    noise_mix: route(-100, 100).optional(),
    vca: route(-100, 100).optional(),
    pan: route(-100, 100).optional(),
  })
  .strict()
  .describe('Diva has fixed modulation slots, not a matrix. Each key is one physical slot.');

export const ProcessorsZ = z
  .object({
    rectify: ModSourceZ.optional(),
    invert: ModSourceZ.optional(),
    quantise: z.object({ source: ModSourceZ, steps: z.number().min(2).max(100).optional() }).strict().optional(),
    lag: z.object({ source: ModSourceZ, rate: knob.optional() }).strict().optional(),
    add: z.tuple([ModSourceZ, ModSourceZ]).optional(),
    multiply: z.tuple([ModSourceZ, ModSourceZ]).optional(),
  })
  .strict();

export const VoiceZ = z
  .object({
    mode: z.enum(['poly', 'mono', 'legato', 'duo', 'poly2']).optional(),
    voices: z
      .number()
      .int()
      .refine((v) => [2, 3, 4, 5, 6, 8, 12, 16].includes(v), 'voices must be one of 2, 3, 4, 5, 6, 8, 12, 16')
      .optional()
      .describe('Polyphony: 2, 3, 4, 5, 6, 8, 12 or 16'),
    stack_raw: z.number().int().min(0).max(6).optional().describe('LOW CONFIDENCE raw Voice Stack value (1 = no stacking)'),
    note_priority: z.enum(['last', 'lowest', 'highest']).optional(),
    glide: knob.optional(),
    glide2: bipolar100.optional(),
    glide_mode: z.enum(['time', 'rate']).optional(),
    glide_range: knob.optional(),
    transpose: z.number().int().min(-24).max(24).optional(),
    fine_tune_cents: bipolar100.optional(),
    pitchbend_up: z.number().int().min(0).max(48).optional().describe('0..24, 36 or 48'),
    pitchbend_down: z.number().int().min(0).max(48).optional(),
  })
  .strict();

export const TrimmersZ = z
  .object({
    drift: z.number().min(0).max(200).optional().describe('Voice Drift: slow pitch wavering'),
    detune_amount: knob.optional().describe('Scales the per-voice detune grid (OPT/TSlop)'),
    voice_detune: z
      .object({ osc1: z.array(bipolar100).length(8).optional(), osc2: z.array(bipolar100).length(8).optional(), osc3: z.array(bipolar100).length(8).optional() })
      .strict()
      .optional()
      .describe('Per-voice detune knobs (8 per oscillator row), scaled by detune_amount'),
    cutoff_variance: knob.optional(),
    glide_variance: knob.optional(),
    pw_variance: knob.optional(),
    envelope_variance: knob.optional(),
    voice_map: z.array(bipolar100).length(8).optional(),
  })
  .strict();

export const ArpZ = z
  .object({
    enabled: z.boolean().optional(),
    mode: z.enum(['played', 'up', 'down', 'up_down_1', 'up_down_2', 'random']).optional().describe('Arp mode (manual order)'),
    progression: z.enum(['serial', 'round', 'leap', 'repeat']).optional().describe('When the arp moves to the next octave'),
    octaves_raw: z.number().int().min(0).max(3).optional().describe('LOW CONFIDENCE raw octave value; real presets use 1 (presumably 1 octave), 2, 3'),
    restart_raw: z.number().int().min(0).max(12).optional().describe('Raw restart position: 0 = none, then 4..10, 12, 14, 16, 24, 32 notes (manual order)'),
    clock_base_raw: z.number().int().min(0).max(3).optional().describe('LOW CONFIDENCE raw clock time base; 2 = value used by Diva-saved files'),
    clock_multiply: z.number().min(50).max(200).optional().describe('Clock interval scale in %: 50 = twice as fast, 200 = half speed (manual: 0.50..2.00)'),
    swing: knob.optional().describe('Clock swing: 50 = 2:1 triplet feel, 100 = 3:1 (manual)'),
    strict_sync: z.boolean().optional().describe('Align arp with host beats'),
  })
  .strict()
  .describe('Diva arpeggiator; its clock is always synced to host tempo (manual).');

export const AmpZ = z
  .object({
    volume: knob.optional(),
    pan: bipolar100.optional(),
    vca: z.enum(['env1', 'gate']).optional(),
    output: z.number().min(0).max(200).optional().describe('main/CcOp master output (100 nominal)'),
  })
  .strict();

const ChorusZ = z.object({ type: z.literal('chorus'), enabled: z.boolean().optional(), variant: z.enum(['classic', 'dramatic', 'ensemble']).optional(), rate: knob.optional(), depth: knob.optional(), wet: knob.optional() }).strict();
const PhaserZ = z.object({ type: z.literal('phaser'), enabled: z.boolean().optional(), variant: z.enum(['stoned', 'flanged']).optional(), rate: knob.optional(), feedback: knob.optional(), stereo: z.number().min(-50).max(50).optional(), sync: z.boolean().optional(), phase: knob.optional(), wet: knob.optional(), depth: knob.optional(), center: knob.optional() }).strict();
const PlateZ = z.object({ type: z.literal('plate'), enabled: z.boolean().optional(), predelay: z.number().min(0).max(250).optional(), diffusion: knob.optional(), damp: knob.optional(), decay: knob.optional(), size: z.number().min(1).max(200).optional(), dry: knob.optional(), wet: knob.optional() }).strict();
const DelayZ = z.object({ type: z.literal('delay'), enabled: z.boolean().optional(), left: z.number().min(1).max(16).optional().describe('sixteenths'), center: z.number().min(1).max(16).optional().describe('sixteenths; also the feedback time'), right: z.number().min(1).max(16).optional(), side_vol: knob.optional(), center_vol: knob.optional(), feedback: knob.optional(), hp: knob.optional(), lp: knob.optional(), dry: knob.optional(), wow: knob.optional() }).strict();
const RotaryZ = z.object({ type: z.literal('rotary'), enabled: z.boolean().optional(), mode: z.enum(['normal', 'syncbass', 'nobass']).optional(), mix: knob.optional(), balance: knob.optional(), drive: knob.optional(), stereo: knob.optional(), out: z.number().min(-20).max(20).optional(), slow: knob.optional(), fast: knob.optional(), rise_time: knob.optional(), controller: z.enum(['modwheel', 'ctrla', 'ctrlb', 'pressure']).optional() }).strict();
export const EffectZ = z.discriminatedUnion('type', [ChorusZ, PhaserZ, PlateZ, DelayZ, RotaryZ]);
export const EffectOffZ = z.object({ type: z.literal('off') }).strict();

/** Sound Design Reasoning layer output (stored, not mapped to parameters). */
export const ConceptZ = z
  .object({
    intent: z.string().optional().describe('One-sentence sonic goal'),
    references: z.array(z.string()).optional().describe('Aesthetic references (artists, eras) — inspiration only'),
    spectral: z.string().optional(),
    temporal: z.string().optional(),
    filtering: z.string().optional(),
    modulation: z.string().optional(),
    dynamics: z.string().optional(),
    space: z.string().optional(),
    architecture: z.string().optional().describe('Why this oscillator/filter model was chosen'),
  })
  .strict();

export const PresetSpecZ = z
  .object({
    meta: MetaZ.optional(),
    concept: ConceptZ.optional(),
    oscillator: OscillatorZ.optional(),
    hpf: HpfZ.optional(),
    filter: FilterZ.optional(),
    env1: EnvelopeZ.optional().describe('Envelope 1 (amp by default, VCA = env1)'),
    env2: EnvelopeZ.optional().describe('Envelope 2 (default filter/pitch mod source)'),
    lfo1: LfoZ.optional().describe('LFO1 also feeds vibrato (modulation.vibrato)'),
    lfo2: LfoZ.optional(),
    modulation: ModulationZ.optional(),
    processors: ProcessorsZ.optional(),
    voice: VoiceZ.optional(),
    trimmers: TrimmersZ.optional(),
    amp: AmpZ.optional(),
    arp: ArpZ.optional(),
    fx1: z.union([EffectZ, EffectOffZ]).optional(),
    fx2: z.union([EffectZ, EffectOffZ]).optional(),
  })
  .strict();

export type PresetSpec = z.infer<typeof PresetSpecZ>;
export type OscillatorSpec = z.infer<typeof OscillatorZ>;
export type EffectSpec = z.infer<typeof EffectZ>;
