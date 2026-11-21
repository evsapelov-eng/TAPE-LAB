import path from 'node:path';
import { H2PDocument, getMetaValue, hasBinaryData, paramId, paramLines } from '../h2p/parser.js';
import { enumLabel, getParam, isActiveFor, modSourceName, parseRaw } from '../schema/schema.js';
import { DIGITAL_WAVES, ENV_MODELS, FILTER_MODELS, FX_MODULES, FX_SECTION_PREFIX, HPF_MODELS, MODULATION_SLOTS, OSC_MODELS, VOICE_COUNTS } from '../schema/curation.js';
import { getModels, num, str } from './preset.js';

export interface ModRoute {
  destination: string;
  source: string;
  amount: number;
  source_param: string;
  amount_param: string;
}

export function analyzeDocument(doc: H2PDocument, file?: string) {
  const models = getModels(doc);
  const n = (id: string) => num(doc, id);
  const meta: Record<string, string> = {};
  for (const m of doc.meta) meta[m.key] = getMetaValue(doc, m.key) ?? '';

  // ---------------------------------------------------------------- oscillator
  const osc: Record<string, unknown> = { model: OSC_MODELS[models.osc] ?? `unknown(${models.osc})`, model_index: models.osc };
  const oct = (semi: number) => `${semi >= 0 ? '+' : ''}${semi} st`;
  switch (models.osc) {
    case 0:
      osc.osc1 = { tune: oct(n('OSC/Tune1')), shape: n('OSC/Shape1'), volume: n('OSC/Vol1') };
      osc.osc2 = { tune: oct(n('OSC/Tune2')), shape: n('OSC/Shape2'), volume: n('OSC/Vol2'), sync: !!n('OSC/Sync2') };
      osc.osc3 = { tune: oct(n('OSC/Tune3')), shape: n('OSC/Shape3'), volume: n('OSC/Vol3'), sync: !!n('OSC/Sync3') };
      osc.fm = n('OSC/FM');
      osc.noise = { volume: n('OSC/Noise'), color: enumLabel('OSC/NoiseC', n('OSC/NoiseC')) };
      osc.feedback = n('VCF1/Fback');
      osc.tune_mod_targets = [1, 2, 3].filter((i) => n(`OSC/TM${i}On`));
      osc.shape_mod_targets = [1, 2, 3].filter((i) => n(`OSC/SM${i}On`));
      break;
    case 1:
      osc.vco1 = { tune: oct(n('OSC/Tune1')), waves: ['Tri1:triangle', 'Saw1:saw', 'PWM1:pulse', 'Noise1:noise'].filter((w) => n(`OSC/${w.split(':')[0]}`)).map((w) => w.split(':')[1]) };
      osc.vco2 = { tune: oct(n('OSC/Tune2')), waves: ['Sin2:sine', 'Tri2:triangle', 'Saw2:saw', 'PW2:pulse'].filter((w) => n(`OSC/${w.split(':')[0]}`)).map((w) => w.split(':')[1]) };
      osc.pulse_width = n('OSC/PW');
      osc.sync = !!n('OSC/Sync2');
      osc.cross_mod = n('OSC/FM');
      osc.mix = n('OSC/OscMix');
      osc.shape_model = enumLabel('OSC/triSp', n('OSC/triSp'));
      osc.tune_mod_target = enumLabel('OSC/TMmode', n('OSC/TMmode'));
      break;
    case 2:
      osc.tune = oct(n('OSC/Tune1'));
      osc.pulse = enumLabel('OSC/PWShp', n('OSC/PWShp'));
      osc.saw = enumLabel('OSC/SawShp', n('OSC/SawShp'));
      osc.sub = { shape: enumLabel('OSC/SubShp', n('OSC/SubShp')), volume: n('OSC/Vol3') };
      osc.noise = n('OSC/Noise');
      osc.pulse_width = n('OSC/PW');
      break;
    case 3:
      osc.vco1 = { tune: oct(n('OSC/Tune1')), wave_raw: n('OSC/Wave1'), volume: n('OSC/Vol1') };
      osc.vco2 = { tune: oct(n('OSC/Tune2')), wave_raw: n('OSC/Wave2'), volume: n('OSC/Vol2') };
      osc.ring = !!n('OSC/RMPwm');
      break;
    case 4:
      osc.osc1 = { tune: oct(n('OSC/Tune1')), wave: DIGITAL_WAVES[n('OSC/DgtlTp1')] ?? n('OSC/DgtlTp1') };
      osc.osc2 = { tune: oct(n('OSC/Tune2')), wave: DIGITAL_WAVES[n('OSC/DgtlTp2')] ?? n('OSC/DgtlTp2') };
      osc.shapes_raw = { shape2: n('OSC/DgtlSp2'), shape3: n('OSC/DgtlSp3'), shape4: n('OSC/DgtlSp4'), pulse_width: n('OSC/PW') };
      osc.cross = n('OSC/FM');
      osc.sync = !!n('OSC/Sync2');
      osc.mix = n('OSC/OscMix');
      osc.high_quality = !!n('OSC/DNoAlia');
      break;
  }
  osc.drift = n('OSC/Drift');
  osc.vibrato = n('OSC/VtoD');

  // ---------------------------------------------------------------- filters
  const filter: Record<string, unknown> = {
    model: FILTER_MODELS[models.filter] ?? `unknown(${models.filter})`,
    model_index: models.filter,
    cutoff: n('VCF1/Freq'),
    resonance: n('VCF1/Res'),
    key_follow: n('VCF1/KeyScl'),
  };
  if ([0, 1, 2, 4].includes(models.filter)) filter.filter_fm = n('VCF1/FFM');
  if ([0, 1].includes(models.filter)) filter.slope = enumLabel('VCF1/LMode', n('VCF1/LMode'));
  if (models.filter === 1) filter.character = enumLabel('VCF1/LColor', n('VCF1/LColor'));
  if (models.filter === 2) filter.mode = enumLabel('VCF1/SvfMode', n('VCF1/SvfMode'));
  if (models.filter === 3) filter.revision = n('VCF1/SkRev');
  if (models.filter === 4) Object.assign(filter, { uhbie_mix: n('VCF1/ShpMix'), uhbie_center: enumLabel('VCF1/BpUbie', n('VCF1/BpUbie')) });
  const hpf =
    models.osc === 0
      ? { active: false, note: 'Triple VCO: HPF panel replaced by the oscillator mixer', mixer_feedback: n('VCF1/Fback') }
      : {
          active: true,
          model: HPF_MODELS[models.hpf] ?? `unknown(${models.hpf})`,
          ...(models.hpf === 0 ? { feedback: n('VCF1/Fback') } : {}),
          ...([2, 3].includes(models.hpf) ? { frequency: n('HPF/Freq') } : {}),
          ...(models.hpf === 3 ? { peak: n('HPF/Res'), revision: n('HPF/Rev') } : {}),
          ...(models.hpf === 1 ? { post_freq_raw: n('HPF/PFreq') } : {}),
        };

  // ---------------------------------------------------------------- envelopes
  const env = (i: 1 | 2) => {
    const S = `ENV${i}`;
    const model = i === 1 ? models.env1 : models.env2;
    return {
      model: ENV_MODELS[model] ?? `unknown(${model})`,
      attack: n(`${S}/Atk`),
      decay: n(`${S}/Dec`),
      sustain: n(`${S}/Sus`),
      release: model === 0 ? (n(`${S}/RelOn`) ? `= decay (${n(`${S}/Dec`)}) [ADS]` : 'off [ADS]') : n(`${S}/Rel`),
      velocity: n(`${S}/Vel`),
      key_follow: n(`${S}/KeyFlw`),
      ...(model === 2 ? { quantise: !!n(`${S}/Quant`), curve: !!n(`${S}/Crve`) } : {}),
    };
  };
  const lfo = (i: 1 | 2) => {
    const S = `LFO${i}`;
    return {
      waveform: enumLabel(`${S}/Wave`, n(`${S}/Wave`)),
      restart: enumLabel(`${S}/Trig`, n(`${S}/Trig`)),
      sync_raw: n(`${S}/Sync`),
      sync_kind: n(`${S}/Sync`) < 0 ? 'free-running' : 'tempo-synced',
      rate_offset: n(`${S}/Rate`),
      phase: n(`${S}/Phse`),
      delay: n(`${S}/Dly`),
      polarity: enumLabel(`${S}/Polar`, n(`${S}/Polar`)),
      depth: n(`${S}/DMD1`),
      depth_source: modSourceName(n(`${S}/DMS1`)),
    };
  };

  // ---------------------------------------------------------------- modulation
  const routes: ModRoute[] = [];
  for (const slot of MODULATION_SLOTS) {
    if (!slot.source.includes('/') || !slot.amount.includes('/') || slot.amount.includes(',')) continue;
    const sp = getParam(slot.source);
    if (sp && !isActiveFor(sp, models)) continue;
    if (slot.source.startsWith('HPF/') && (models.osc === 0 || models.hpf !== 3)) continue;
    if (slot.source === 'VCF1/FbSrc' && models.osc !== 0 && models.hpf !== 0) continue;
    if (slot.source === 'VCF1/SMSrc' && models.filter !== 4) continue;
    const s = n(slot.source);
    const a = n(slot.amount);
    if (s !== 0 && a !== 0) routes.push({ destination: slot.destination, source: modSourceName(s), amount: a, source_param: slot.source, amount_param: slot.amount });
  }
  const fixed: { destination: string; source: string; amount: number }[] = [];
  if (n('OSC/VtoD')) fixed.push({ destination: 'Vibrato (pitch)', source: 'LFO1', amount: n('OSC/VtoD') });
  if (n('VCF1/KeyScl')) fixed.push({ destination: 'Cutoff key follow', source: 'KeyFollow', amount: n('VCF1/KeyScl') });
  for (const i of [1, 2]) {
    if (n(`ENV${i}/Vel`)) fixed.push({ destination: `Env${i} level`, source: 'Velocity', amount: n(`ENV${i}/Vel`) });
    if (n(`ENV${i}/KeyFlw`)) fixed.push({ destination: `Env${i} times`, source: 'KeyFollow', amount: n(`ENV${i}/KeyFlw`) });
  }
  const processors: Record<string, string> = {};
  for (const [k, label] of [['MOD/RSrc', 'rectify'], ['MOD/ISrc', 'invert'], ['MOD/QSrc', 'quantise'], ['MOD/LSrc', 'lag'], ['MOD/A1Src', 'add_1'], ['MOD/A2Src', 'add_2'], ['MOD/M1Src', 'multiply_1'], ['MOD/M2Src', 'multiply_2']] as const) {
    if (n(k)) processors[label] = modSourceName(n(k));
  }

  // ---------------------------------------------------------------- effects
  const effects = [1, 2].map((slot) => {
    const mod = str(doc, `FX${slot}/Module`)?.replace(/'/g, '') ?? '';
    const name = mod.replace(/\d$/, '') as (typeof FX_MODULES)[number];
    const sec = FX_SECTION_PREFIX[name] ? `${FX_SECTION_PREFIX[name]}${slot}` : undefined;
    const params: Record<string, string | number> = {};
    if (sec) {
      for (const l of paramLines(doc)) {
        if (l.section !== sec || l.key === '#cm') continue;
        const p = getParam(paramId(l.section, l.key));
        const v = parseRaw(l.value);
        params[p?.label ?? l.key] = enumLabel(paramId(l.section, l.key), v) ?? v;
      }
    }
    return { slot, type: name || mod, enabled: n(`main/#FX${slot}`) === 1, params };
  });

  // ---------------------------------------------------------------- voice / misc
  const voice = {
    mode: enumLabel('VCC/Mode', n('VCC/Mode')),
    voices: VOICE_COUNTS[n('VCC/Voices')] ?? `raw ${n('VCC/Voices')}`,
    stack_raw: n('VCC/Voicing'),
    note_priority: enumLabel('VCC/Prior', n('VCC/Prior')),
    glide: n('VCC/Porta'),
    glide_mode: enumLabel('VCC/PortaM', n('VCC/PortaM')),
    transpose: n('VCC/Trsp'),
    fine_tune_cents: n('VCC/FTun'),
    pitchbend: { up_raw: n('VCC/PB'), down_raw: n('VCC/PBD') },
  };
  const trimmers = {
    detune_amount: n('OPT/TSlop'),
    cutoff_variance: n('OPT/CSlop'),
    glide_variance: n('OPT/GSlop'),
    pw_variance: n('OPT/PSlop'),
    envelope_variance: n('OPT/ESlop'),
    voice_detune_nonzero: [1, 2, 3].map((o) => [1, 2, 3, 4, 5, 6, 7, 8].filter((v) => n(`OPT/V${v}T${o}`) !== 0).length),
  };
  const amp = { volume: n('VCA1/Vol'), pan: n('VCA1/Pan'), vca: enumLabel('VCA1/VCA', n('VCA1/VCA')), output: n('main/CcOp') };

  const unknown = paramLines(doc)
    .filter((l) => !['#cm', '#ms', '#mv'].includes(l.key) && !getParam(paramId(l.section, l.key)))
    .map((l) => `${paramId(l.section, l.key)}=${l.value}`);

  return {
    file: file ? path.resolve(file) : undefined,
    name: file ? path.basename(file, path.extname(file)) : meta.Name,
    metadata: meta,
    oscillator: osc,
    hpf,
    filter,
    envelopes: { env1: env(1), env2: env(2) },
    lfos: { lfo1: lfo(1), lfo2: lfo(2) },
    modulations: { routes, fixed, processors },
    effects,
    voice,
    amp,
    trimmers,
    unknown_parameters: unknown,
    binary_block_present: hasBinaryData(doc),
    note: 'Values are Diva raw knob values (mostly 0..100). Time/frequency curves are not published by u-he and are not converted.',
  };
}

export type Analysis = ReturnType<typeof analyzeDocument>;
