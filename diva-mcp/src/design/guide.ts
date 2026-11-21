/**
 * Sound Design Reasoning layer (layer 1).
 *
 * diva-mcp contains no LLM. The calling model (Claude) performs the reasoning:
 * concept -> architecture -> PresetSpec. This module provides the structured
 * knowledge it reasons with. Numeric ranges are Diva raw knob values and are
 * heuristics ("starting points"), not measured facts.
 */

export const WORKFLOW = [
  '1. Concept: write a one-sentence sonic intent and list references (inspiration only, never copy a commercial preset).',
  '2. Architecture: choose oscillator model and filter model from the archetype table; justify it in concept.architecture.',
  '3. Spectrum: waveforms, octave/detune, noise, FM/sync -> how dense/bright the raw source is.',
  '4. Time: amp envelope (env1) and modulation envelope (env2) shapes.',
  '5. Filtering: cutoff, resonance, key follow, env2 -> cutoff amount (cutoff_1), second slot (cutoff_2).',
  '6. Modulation: only Diva\'s fixed slots exist (see list_parameters().modulation_slots). Prefer few, deliberate routes.',
  '7. Dynamics: velocity on env levels / cutoff, mod wheel and aftertouch routes for expression.',
  '8. Space: FX1 -> FX2 in series (chorus/phaser/plate/delay/rotary). Keep wet levels musical.',
  '9. Build the PresetSpec (only confirmed fields), call generate_preset, then describe_preset to sanity-check, and tell the user to load it in Diva.',
];

export const ARCHITECTURES = {
  oscillators: {
    triple_vco: 'Minimoog-style: 3 morphing VCOs + mixer + feedback. Fat basses, leads, brass. No HPF panel. Shape mod via switches. Most CPU.',
    dual_vco: 'Jupiter-8-style: 2 multi-wave VCOs, sync, cross mod, PWM, mix. Lush pads, strings, sync leads.',
    dco: 'Juno-style single DCO + sub + noise. Bright, stable, chorused pads/keys/basses. Pair with Multimode + Chorus.',
    dual_vco_eco: 'MS-20-style, CPU-light. LOW CONFIDENCE waveform mapping in diva-mcp — avoid unless needed.',
    digital: 'JP-8000-style: Multisaw (supersaw), TriWrap, Feedback, Pulse, Saw+sine, Tri+sine. Dense/glassy/digital timbres. Shape knobs are raw (low confidence).',
  },
  filters: {
    ladder: 'Moog 24 dB ladder (12 dB option). Round, fat, resonant bass/lead.',
    cascade: 'Cleaner 4-pole (Rough/Clean). Great for big smooth pads without grunge.',
    multimode: 'Jupiter/Juno-style LP4/LP2/HP/BP. Versatile, polished.',
    bite: 'MS-20 style 2-pole, very level/peak dependent; aggressive, screaming. Try low osc levels for resonance.',
    uhbie: 'Oberheim SEM-style 2-pole SVF, LP -> notch/BP -> HP crossfade. Silky, vocal, hollow.',
  },
};

export const ARCHETYPES: Record<string, { architecture: string; envelope: string; filter: string; modulation: string; fx: string }> = {
  warm_pad: {
    architecture: 'dual_vco or dco (+ cascade/multimode); triple_vco for darker',
    envelope: 'env1 attack 35-60, sustain 70-100, release 40-65; analogue model',
    filter: 'cutoff 65-90, resonance 5-20, key_follow 30-50, env2 slow (attack 30-55) amount +10..+30',
    modulation: 'LFO2 slow triangle -> cutoff_2 small (5-15); vibrato 0-5 or pitch drift via trimmers.drift 20-60',
    fx: 'chorus (ensemble/classic, wet 50-80) -> plate (decay 50-70, wet 20-35)',
  },
  bass: {
    architecture: 'triple_vco + ladder (classic), dco + multimode (tight), dual_vco + cascade',
    envelope: 'env1 attack 0-2, decay 35-55, sustain 40-80, release 5-20; mono or legato, glide 0-25',
    filter: 'cutoff 45-70, resonance 15-40, env2 fast (attack 0-2, decay 25-45, sustain 0-20) amount +30..+60, key_follow 20-50',
    modulation: 'velocity -> cutoff_2 +10..+25; mod wheel -> cutoff or vibrato',
    fx: 'usually dry; subtle chorus off; maybe no FX',
  },
  electric_keys: {
    architecture: 'dco or dual_vco (triangle/pulse) + multimode LP2/LP4 or uhbie',
    envelope: 'env1 attack 0-2, decay 50-70, sustain 10-35, release 25-45; digital/analogue',
    filter: 'cutoff 70-95, resonance 0-15, env2 moderate (decay 40-55) +15..+35, velocity -> cutoff',
    modulation: 'subtle LFO2 -> pan or VCA tremolo (5-15) for EP flavour',
    fx: 'chorus or phaser -> plate',
  },
  pluck: {
    architecture: 'digital (triangle/pulse), dual_vco, dco + uhbie/multimode/cascade',
    envelope: 'env1 attack 0, decay 30-45, sustain 0-10, release 20-35',
    filter: 'cutoff 55-75, resonance 10-30, env2 attack 0, decay 20-35, sustain 0, amount +35..+60',
    modulation: 'velocity -> cutoff; optional random -> pan',
    fx: 'delay (3/16 + 4/16, feedback 30-45, wow 20-50 for tape) -> plate small',
  },
  expressive_lead: {
    architecture: 'triple_vco (sync/detune) or dual_vco + ladder/cascade/bite',
    envelope: 'env1 attack 2-10, sustain 80-100, release 20-35; mono/legato, glide 15-35',
    filter: 'cutoff 70-100, resonance 15-35, env2 +15..+30',
    modulation: 'mod wheel -> LFO1 depth (vibrato 20-40 with lfo1.depth_source ModWhl); aftertouch -> cutoff_2 +15..+30',
    fx: 'delay (dotted) -> plate',
  },
};

export const LEXICON: Record<string, string> = {
  warm: 'lower cutoff (65-90), low resonance, cascade/ladder, saw/triangle mix, slight drift, chorus',
  dark: 'cutoff < 65, low key_follow, damped plate (damp 70-90)',
  bright: 'cutoff > 105, key_follow 50+, saw/pulse, less damping',
  vintage: 'drift 30-80, voice detune via trimmers, cutoff_variance 10-30, chorus classic',
  tape: 'delay wow 40-70, delay LP 50-70, slow LFO -> pitch tiny (pitch_1 or vibrato 3-8), drift',
  unstable: 'trimmers.drift 50-120, envelope/cutoff variance 10-25, random -> cutoff_2 small',
  melancholic: 'minor-friendly simple waves, slow attack, dark cutoff, long release, gentle chorus',
  soft: 'attack 10+, low resonance, LP2/12 dB, velocity on env1',
  glassy: 'digital triangle/tri-wrap, uhbie notch/HP mix, plate bright',
  aggressive: 'bite filter, high resonance, feedback, FM/sync, rotary drive',
  wide: 'chorus ensemble, delay side_vol, StackVoice -> pan, detuned osc2',
  plucky: 'env2 fast decay, sustain 0, strong env2 -> cutoff',
  evolving: 'slow LFOs (sync_raw -2/-3 with negative rate offset) on cutoff/shape/PW, LFO delay',
};

export function soundDesignGuide(topic?: string) {
  const t = topic?.toLowerCase();
  const pick = <T>(rec: Record<string, T>) => (t ? Object.fromEntries(Object.entries(rec).filter(([k]) => k.includes(t) || t.includes(k))) : rec);
  return {
    workflow: WORKFLOW,
    architectures: ARCHITECTURES,
    archetypes: pick(ARCHETYPES),
    lexicon: pick(LEXICON),
    caveats: [
      'All numbers are starting points on Diva raw scales (0..100 knobs, cutoff 30..150). They are heuristics, not measurements.',
      'Do not claim a preset sounds a certain way: no audio is rendered. Describe intent and parameter-derived character.',
      'Never copy commercial presets; use them only as references via find_reference_presets.',
      'Low-confidence controls (Eco waveforms, Digital shape knobs, LFO tempo divisions, stack) should be avoided or flagged to the user.',
    ],
  };
}
