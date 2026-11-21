# Sound Design Guide

How diva-mcp turns a musical description into a Diva patch. The same knowledge is served to Claude by the `get_sound_design_guide` tool (`src/design/guide.ts`).

> All numbers are **starting points on Diva's raw scales** (knobs 0–100, cutoff 30–150, LFO rate −5…+5). u-he does not publish time/frequency curves, so no conversion to seconds/Hz is claimed. Nothing here is the result of listening tests.

## 1. Pipeline

1. **Concept** — one-sentence intent + references (inspiration only; never copy commercial presets).
2. **Architecture** — pick oscillator and filter models; write the reason into `concept.architecture`.
3. **Spectrum** — waveforms, detune, octave, noise, FM/sync.
4. **Time** — `env1` (amp) and `env2` (filter/pitch modulation).
5. **Filtering** — cutoff, resonance, key follow, `cutoff_1` (Env2) and `cutoff_2`.
6. **Modulation** — only Diva's fixed slots; few and deliberate.
7. **Dynamics** — velocity on envelopes/cutoff; mod wheel, aftertouch (`Pressure`).
8. **Space** — FX1 → FX2 in series.
9. **Spec → generate_preset → describe_preset**, then load in Diva.

## 2. Architectures

| Oscillator | Character | Typical partners |
|---|---|---|
| Triple VCO | Minimoog-style, 3 morphing VCOs, mixer feedback, FM, sync. No HPF panel. | Ladder (bass), Bite (lead), Cascade (brass) |
| Dual VCO | Jupiter-8-style, mixable waves per VCO, sync, cross mod, PWM. | Cascade/Multimode pads, sync leads |
| DCO | Juno-style, pulse/saw/sub selectors, very stable. | Multimode + Chorus keys/pads/basses |
| Dual VCO Eco | MS-20-style, CPU-light. **Low confidence** waveform mapping in diva-mcp. | Bite + HPF Bite |
| Digital | JP-8000-style Multisaw, TriWrap, Feedback, Pulse, Saw+sine, Tri+sine. Shape knobs are raw (low confidence). | Uhbie, Multimode |

| Filter | Character |
|---|---|
| Ladder | 24 dB Moog ladder (12 dB option), round and fat |
| Cascade | cleaner 4-pole, Rough/Clean, smooth with dense input — big pads |
| Multimode | LP4 / LP2 / HP / BP, polished poly-synth filter |
| Bite | MS-20-style 2-pole, level and peak dependent, aggressive |
| Uhbie | SEM-style 2-pole SVF, LP → notch/BP → HP crossfade, silky |

## 3. Archetypes (starting points)

| Archetype | Envelopes | Filter | Modulation | FX |
|---|---|---|---|---|
| Warm pad | env1 A 35–60, S 70–100, R 40–65 | cutoff 65–90, res 5–20, env2 slow +10…+30 | LFO2 slow → cutoff 5–15; drift 20–60 | chorus → plate |
| Bass | env1 A 0–2, D 35–55, S 40–80, R 5–20; mono/legato | cutoff 45–70, res 15–40, env2 fast +30…+60 | velocity / MW → cutoff | dry |
| Electric keys | env1 A 0–2, D 50–70, S 10–35 | cutoff 70–95, env2 +15…+35 | random → pan, slow PWM | chorus/phaser → plate |
| Pluck | env1 A 0, D 30–45, S 0–10 | cutoff 55–75, env2 D 20–35 S 0 +35…+60 | velocity → cutoff | delay (wow) → plate |
| Expressive lead | env1 A 2–10, S 80–100; legato + glide | cutoff 70–100, res 15–35 | MW → LFO1 depth (vibrato), AT → cutoff_2 | delay → plate |

## 4. Lexicon

| Word | Parameter tendency |
|---|---|
| warm | lower cutoff, low resonance, Cascade/Ladder, saw/triangle, slight drift, chorus |
| dark | cutoff < 65, low key follow, damped plate |
| bright | cutoff > 105, key follow 50+, saw/pulse |
| vintage | drift 30–80, per-voice detune (trimmers), cutoff variance 10–30, classic chorus |
| tape / old cassette | delay wow 40–70 + LP 50–70, LFO1 random-glide vibrato 3–8, drift |
| unstable | drift 50–120, envelope/cutoff variance 10–25 |
| melancholic | simple waves, slow attack, dark cutoff, long release, gentle chorus |
| soft | attack 10+, low resonance, 12 dB / LP2, velocity on env1 |
| glassy | Digital triangle/TriWrap, Uhbie, bright plate |
| aggressive | Bite, high resonance, feedback, FM/sync, rotary drive |
| wide | ensemble chorus, delay side vol, StackVoice → pan, detuned osc2 |
| evolving | slow LFOs on cutoff/shape/PW, LFO delay |

## 5. Worked example: "Boards of Canada-style melancholic pad, old cassette"

- **Concept:** muted, wavering analogue pad, tape wobble, gentle chorus.
- **Architecture:** Dual VCO (2 saws, osc2 +0.08 st) → Cascade (clean, smooth).
- **Spectrum/filter:** cutoff ~70, res ~10, key follow ~30, HPF Pre ~38.
- **Time:** env1 A ~50, S ~85, R ~60; env2 A ~55, amount +15.
- **Movement:** `lfo1.waveform = random_glide`, `modulation.vibrato` ~4 (pitch wander); `trimmers.drift` ~70; LFO2 slow → cutoff_2 +6.
- **Space:** chorus classic wet ~70 → delay with `wow` ~55 and `lp` ~55 or a dark plate.

## 6. Rules diva-mcp enforces

- Only existing controls: model-specific fields are rejected for other models.
- Only existing modulation slots (no matrix).
- Every value is range- and enum-checked against `schemas/diva_parameters.json`.
- Low-confidence controls (Eco waveforms, Digital shape knobs, LFO tempo divisions `sync_raw ≥ 0`, voice stack) produce warnings.
- Keep oscillator 1 at octave 0 and set the register with `voice.transpose`: whether `Tune2/Tune3` are relative to osc 1's octave switch is unconfirmed, and this choice makes both readings agree.
- `describe_preset` always states that the description is parameter-derived, not heard.
