# PLUIT - MINIMAL ANALOG VOL. 01

16 preset(s) for u-he Diva generated with diva-mcp.

## Installation

Copy the `.h2p` files into a folder inside your Diva **user** preset folder, e.g.

- macOS: `~/Library/Audio/Presets/u-he/Diva/PLUIT - MINIMAL ANALOG VOL. 01/`
- Windows: `Documents\u-he\Diva.data\UserPresets\Diva\PLUIT - MINIMAL ANALOG VOL. 01\`

Then use *Refresh* in Diva's preset browser.

## Verification status

| Preset | Architecture | Output / VCA | Level risk | Structural validation | Diva load test | Audio verification |
|---|---|---|---|---|---|---|
| PRC Analog Tom | Triple VCO -> Ladder | 78 / 42 | low | passed | not run | not run |
| PRC Minimal Rim | Dual VCO -> Multimode | 76 / 42 | low | passed | not run | not run |
| PRC Metal Tick | Triple VCO -> Multimode | 74 / 40 | low | passed | not run | not run |
| PRC Resonant Ping | Triple VCO -> Ladder | 70 / 38 | low | passed | not run | not run |
| PRC Noise Hat | Triple VCO -> Multimode | 74 / 40 | low | passed | not run | not run |
| PRC Wood Clave | Digital -> Uhbie | 78 / 42 | low | passed | not run | not run |
| BS Minimal Sub | DCO -> Ladder | 76 / 42 | low | passed | not run | not run |
| BS Rubber Pluck | Dual VCO -> Ladder | 72 / 40 | low | passed | not run | not run |
| BS Deep Pulse | Triple VCO -> Cascade | 74 / 40 | low | passed | not run | not run |
| BS Bite Growl | DCO -> Bite | 70 / 38 | low | passed | not run | not run |
| PD Analog Memories II | Dual VCO -> Cascade | 78 / 42 | low | passed | not run | not run |
| PD Velvet Haze | Triple VCO -> Cascade | 76 / 40 | low | passed | not run | not run |
| KY Dusty Chords | DCO -> Multimode | 78 / 42 | low | passed | not run | not run |
| SQ Dub Chord Stab | Triple VCO -> Cascade | 70 / 38 | low | passed | not run | not run |
| SQ Minimal Blip | Digital -> Uhbie | 78 / 42 | low | passed | not run | not run |
| FX Dub Space | Dual VCO -> Cascade | 72 / 40 | low | passed | not run | not run |

Level standard: Output 80 / VCA 42 (real Diva presets: median Output 92, VCA 42). Level risk is a parameter heuristic, not a loudness measurement.

> These presets passed diva-mcp's structural validation. They have **not** been loaded into Diva or listened to by the tool. Please load each preset in Diva to confirm.
> Files are text-only .h2p (no compressed binary block), built from diva-mcp's own init template.

## PRC Analog Tom

**Category:** Drums:Percussion  
**Architecture:** Triple VCO -> Ladder  
**Description:** Round analogue tom/kick-tom: a triangle-ish VCO with a fast pitch drop from Env2.  
**Usage:** Play C1-C3 for different tom pitches. Velocity = level and punch.  

### Sound concept

- **intent:** A warm, rounded analogue tom that sits under minimal grooves.
- **spectral:** Single Triple VCO oscillator near triangle; mixer feedback for low weight.
- **temporal:** Instant attack, short decay, no sustain; Env2 drops the pitch quickly.
- **filtering:** Ladder at a medium cutoff, little resonance.
- **modulation:** Env2 -> pitch (tune mod 1, osc 1 only). Depth unit of tune mod is not confirmed; amount chosen conservatively.
- **architecture:** Triple VCO + Ladder: the only model with per-oscillator tune-mod switches and a mixer feedback path.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Ladder.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~triangle (+0 st) (waveform names approximate). Mixer feedback 15 thickens the low end.
- Ladder filter, 4-pole 24 dB: cutoff 80 (warm / muted), resonance 10 (smooth). Env2 sweeps cutoff by 10 (peaks around 90) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release. Velocity-sensitive (40).
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Osc 1 Waveform (Triple VCO morph) [OSC/Shape1] = 3.00; Volume 1 [OSC/Vol1] = 90.00; Tune mod on osc 1 [OSC/TM1On] = 1; Tune Mod 1 depth [OSC/TM1Dpt] = 14.00
- **High-pass / Feedback:** Feedback (post-filter -> mixer) [VCF1/Fback] = 15.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 80.00; Resonance / Emphasis / Peak [VCF1/Res] = 10.00; Cutoff mod 1 amount [VCF1/FMDpt] = 10.00
- **Envelope 1:** Decay [ENV1/Dec] = 35.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 30.00; Velocity [ENV1/Vel] = 40.00
- **Envelope 2:** Decay [ENV2/Dec] = 18.00; Release [ENV2/Rel] = 15.00; Velocity [ENV2/Vel] = 20.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5; Transpose [VCC/Trsp] = -12
- **Main:** Output (main volume) [main/CcOp] = 78.00

## PRC Minimal Rim

**Category:** Drums:Percussion  
**Architecture:** Dual VCO -> Multimode  
**Description:** Short, woody rim/click: pulse + noise through a resonant band-pass.  
**Usage:** Velocity = level. Works high on the keyboard too.  

### Sound concept

- **intent:** A tight rim click for minimal techno grooves.
- **spectral:** Dual VCO: pulse + noise on VCO1, a sine a fifth above on VCO2 for a tonal knock.
- **temporal:** Very short envelopes (decay ~10).
- **filtering:** Multimode band-pass with moderate resonance; HPF Pre removes body.
- **space:** A tiny, short plate for room.
- **architecture:** Dual VCO + Multimode BP: only Multimode offers a dedicated band-pass mode.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Multimode.
- Dual VCO (Jupiter-style): VCO1 [pulse+noise] +0 st, VCO2 [sine] +7 st, mix 40.
- Multimode filter (BP): cutoff 98 (balanced), resonance 35 (classic analog emphasis). Env2 sweeps cutoff by 25 (peaks around 123) with a instant attack and fast decay. HPF Pre at 60 trims the lows.
- Amp envelope (Analogue): instant attack, fast decay to 0, fast release. Velocity-sensitive (50).
- Movement: essentially static (no LFO/random routes).
- Effects: Plate.
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Dual VCO: VCO1 saw [OSC/Saw1] = 0; Dual VCO: VCO1 pulse / Digital: osc1 param-2 mod switch [OSC/PWM1] = 1; Dual VCO: VCO1 noise [OSC/Noise1] = 1; Osc 2 tune / detune [OSC/Tune2] = 7.00; Dual VCO: VCO2 sine [OSC/Sin2] = 1; Dual VCO: VCO2 saw [OSC/Saw2] = 0; Pulse Width [OSC/PW] = 30.00; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 40.00
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 2; HPF Frequency [HPF/Freq] = 60.00
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 98.00; Resonance / Emphasis / Peak [VCF1/Res] = 35.00; Key follow (KYBD) [VCF1/KeyScl] = 60.00; Multimode type [VCF1/SvfMode] = 3; Cutoff mod 1 amount [VCF1/FMDpt] = 25.00
- **Envelope 1:** Decay [ENV1/Dec] = 10.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 8.00; Velocity [ENV1/Vel] = 50.00
- **Envelope 2:** Decay [ENV2/Dec] = 8.00; Release [ENV2/Rel] = 6.00; Velocity [ENV2/Vel] = 30.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Main:** Output (main volume) [main/CcOp] = 76.00
- **Effects:** FX1 type [FX1/Module] = 'Plate1'; FX1 active [main/#FX1] = 1
- **Effects (FX1):** Plate Diffusion [Plate1/Diff] = 80.00; Plate Damp [Plate1/Damp] = 85.00; Plate Decay [Plate1/Decay] = 22.00; Plate Size [Plate1/Size] = 50.00; Plate Dry [Plate1/Dry] = 95.00; Plate Wet [Plate1/Wet] = 15.00

## PRC Metal Tick

**Category:** Drums:Percussion  
**Architecture:** Triple VCO -> Multimode  
**Description:** Metallic tick/cowbell-ish hit: three VCOs at inharmonic ratios with FM, high-passed.  
**Usage:** Velocity = level.  

### Sound concept

- **intent:** A short metallic accent for off-beats.
- **spectral:** Triple VCO tuned to non-harmonic intervals (+6.6 and +17.3 semitones) with FM 1->2/3 for clangorous sidebands.
- **temporal:** Very short decay.
- **filtering:** Multimode high-pass keeps it thin and bright.
- **architecture:** Triple VCO is the only model with three independently tuned oscillators plus FM.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Multimode.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~saw (+0 st), osc2 ~square (+6.6 st), osc3 ~narrow pulse (+17.3 st) (waveform names approximate). Audible FM 1->2/3 (55) adds metallic/clangorous sidebands. Detune: osc2 detuned by ~40 cents, osc3 detuned by ~30 cents -> chorusing/beating.
- Multimode filter (HP): cutoff 105 (balanced), resonance 20 (classic analog emphasis). Env2 sweeps cutoff by 12 (peaks around 117) with a instant attack and fast decay.
- Amp envelope (Analogue): instant attack, fast decay to 0, fast release. Velocity-sensitive (45).
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Volume 1 [OSC/Vol1] = 70.00; Osc 2 tune / detune [OSC/Tune2] = 6.60; Osc 2 Waveform (Triple VCO morph) [OSC/Shape2] = 7.00; Volume 2 [OSC/Vol2] = 60.00; Osc 3 tune / detune [OSC/Tune3] = 17.30; Osc 3 Waveform (Triple VCO morph) [OSC/Shape3] = 8.00; Volume 3 / DCO Sub level [OSC/Vol3] = 40.00; FM 1->2/3 / Cross Mod [OSC/FM] = 55.00
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 105.00; Resonance / Emphasis / Peak [VCF1/Res] = 20.00; Key follow (KYBD) [VCF1/KeyScl] = 40.00; Multimode type [VCF1/SvfMode] = 2; Cutoff mod 1 amount [VCF1/FMDpt] = 12.00
- **Envelope 1:** Decay [ENV1/Dec] = 9.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 7.00; Velocity [ENV1/Vel] = 45.00
- **Envelope 2:** Decay [ENV2/Dec] = 7.00; Release [ENV2/Rel] = 6.00; Velocity [ENV2/Vel] = 20.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 74.00

## PRC Resonant Ping

**Category:** Drums:Percussion  
**Architecture:** Triple VCO -> Ladder  
**Description:** Filter ping: a short noise/osc burst excites a near-self-oscillating ladder that tracks the keyboard.  
**Usage:** Pitch follows the keyboard (key follow 100). Velocity = level.  

### Sound concept

- **intent:** Pitched 'pings' and bleeps made by the filter itself — classic minimal percussion.
- **spectral:** Very low oscillator and noise levels: the resonance does the work (Diva manual tip: lower input levels let resonance speak).
- **temporal:** Short amp decay, very short Env2 kick into the filter.
- **filtering:** Ladder, resonance 88, key follow 100.
- **architecture:** Triple VCO (mixer gives fine control of the low input level) + Ladder.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Ladder.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~triangle (+0 st) (waveform names approximate). white noise at 30.
- Ladder filter, 4-pole 24 dB: cutoff 82 (balanced), resonance 88 (near self-oscillation). Env2 sweeps cutoff by 30 (peaks around 112) with a instant attack and fast decay. Strong key tracking keeps high notes bright.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release. Velocity-sensitive (40).
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Osc 1 Waveform (Triple VCO morph) [OSC/Shape1] = 3.00; Volume 1 [OSC/Vol1] = 25.00; Noise volume [OSC/Noise] = 30.00; Noise colour [OSC/NoiseC] = 1
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 82.00; Resonance / Emphasis / Peak [VCF1/Res] = 88.00; Key follow (KYBD) [VCF1/KeyScl] = 100.00; Cutoff mod 1 amount [VCF1/FMDpt] = 30.00
- **Envelope 1:** Decay [ENV1/Dec] = 30.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 30.00; Velocity [ENV1/Vel] = 40.00
- **Envelope 2:** Decay [ENV2/Dec] = 10.00; Release [ENV2/Rel] = 8.00; Velocity [ENV2/Vel] = 30.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00

## PRC Noise Hat

**Category:** Drums:Hihat  
**Architecture:** Triple VCO -> Multimode  
**Description:** Closed analogue hi-hat: white noise through a resonant high-pass.  
**Usage:** Velocity = level. Shorter on higher keys (env key follow).  

### Sound concept

- **intent:** A crisp closed hat to complete a minimal kit.
- **spectral:** White noise only (all VCOs muted).
- **temporal:** Very short decay; envelope key follow shortens high notes.
- **filtering:** Multimode HP with a little resonance.
- **architecture:** Triple VCO's mixer has a white/pink noise selector; Multimode supplies the high-pass.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Multimode.
- Triple VCO (Minimoog-style morphing oscillators): all oscillators muted (waveform names approximate). white noise at 100.
- Multimode filter (HP): cutoff 118 (bright), resonance 18 (classic analog emphasis).
- Amp envelope (Analogue): instant attack, fast decay to 0, fast release. Velocity-sensitive (45).
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Volume 1 [OSC/Vol1] = 0.00; Noise volume [OSC/Noise] = 100.00; Noise colour [OSC/NoiseC] = 1
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 118.00; Resonance / Emphasis / Peak [VCF1/Res] = 18.00; Key follow (KYBD) [VCF1/KeyScl] = 0.00; Multimode type [VCF1/SvfMode] = 2
- **Envelope 1:** Decay [ENV1/Dec] = 7.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 6.00; Velocity [ENV1/Vel] = 45.00; KeyFollow (KYBD time scaling) [ENV1/KeyFlw] = 30.00
- **Envelope 2:** Decay [ENV2/Dec] = 6.00; Release [ENV2/Rel] = 5.00; Velocity [ENV2/Vel] = 20.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 74.00

## PRC Wood Clave

**Category:** Drums:Percussion  
**Architecture:** Digital -> Uhbie  
**Description:** Hollow clave/wood-block: digital triangle through a band-pass Uhbie, with a short dub echo.  
**Usage:** Velocity = level.  

### Sound concept

- **intent:** A woody, tonal clave with a dub-techno echo tail.
- **spectral:** Digital triangle (with its synced sine harmonic).
- **temporal:** Short decay.
- **filtering:** Uhbie with mix at the band-pass centre and moderate resonance.
- **space:** Damped 3/16 delay with a little wow.
- **architecture:** Digital + Uhbie: clean source, SEM-style band-pass.

### Parameter-derived description

- Synthesis: subtractive, Digital -> Uhbie.
- Digital (JP-8000-style): osc1 Triangle, osc2 Triangle (+12 st), mix 0.
- Uhbie filter: cutoff 90 (balanced), resonance 45 (classic analog emphasis). Env2 sweeps cutoff by 20 (peaks around 110) with a instant attack and fast decay.
- Amp envelope (Analogue): instant attack, fast decay to 0, fast release. Velocity-sensitive (45).
- Movement: essentially static (no LFO/random routes).
- Effects: Delay.
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 4; Digital osc 1 waveform [OSC/DgtlTp1] = 6; Osc 2 tune / detune [OSC/Tune2] = 12.00; Digital osc 2 waveform [OSC/DgtlTp2] = 6; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 0.00
- **Main filter:** Filter Model [VCF1/Model] = 4; Cutoff [VCF1/Freq] = 90.00; Resonance / Emphasis / Peak [VCF1/Res] = 45.00; Key follow (KYBD) [VCF1/KeyScl] = 60.00; Uhbie Mix (LP -> BR/BP -> HP) [VCF1/ShpMix] = 50.00; Uhbie BR/BP switch [VCF1/BpUbie] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 20.00
- **Envelope 1:** Decay [ENV1/Dec] = 12.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 10.00; Velocity [ENV1/Vel] = 45.00
- **Envelope 2:** Decay [ENV2/Dec] = 10.00; Release [ENV2/Rel] = 8.00; Velocity [ENV2/Vel] = 20.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Main:** Output (main volume) [main/CcOp] = 78.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1
- **Effects (FX1):** Delay Center time (= feedback time) [Delay1/CDel] = 6.00; Delay Right time [Delay1/RDel] = 3.00; Delay Side Vol [Delay1/SVol] = 25.00; Delay Center Vol [Delay1/CVol] = 10.00; Delay HP (feedback path) [Delay1/HP] = 30.00; Delay LP (feedback path) [Delay1/LP] = 50.00; Delay Wow (tape wobble) [Delay1/Wow] = 20.00

## BS Minimal Sub

**Category:** Bass:Synth  
**Architecture:** DCO -> Ladder  
**Description:** Clean sub bass: DCO square plus sub-oscillator through a low ladder.  
**Usage:** Mono. Velocity = slight brightness.  

### Sound concept

- **intent:** A clean, solid sub that leaves room for the kick.
- **spectral:** DCO PW-reactive pulse at 50% (square) plus sub-oscillator one octave down.
- **temporal:** Instant attack, medium sustain, short release.
- **filtering:** Ladder low cutoff, little resonance, small Env2 bump for definition.
- **architecture:** DCO + Ladder: very stable pitch for a sub, round filter.

### Parameter-derived description

- Synthesis: subtractive, DCO -> Ladder.
- DCO (Juno-style single oscillator): pulse PWM pulse (reacts to PW), saw off, sub -1 oct shape 1 at 80.
- Ladder filter, 4-pole 24 dB: cutoff 50 (dark), resonance 8 (smooth). Env2 sweeps cutoff by 20 (peaks around 70) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, sustains at 60, fast release.
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: mono, 16 voices.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 2; DCO Pulse selector [OSC/PWShp] = 3; DCO Sawtooth selector [OSC/SawShp] = 0; Volume 3 / DCO Sub level [OSC/Vol3] = 80.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 50.00; Resonance / Emphasis / Peak [VCF1/Res] = 8.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Cutoff mod 1 amount [VCF1/FMDpt] = 20.00
- **Envelope 1:** Decay [ENV1/Dec] = 40.00; Sustain [ENV1/Sus] = 60.00; Release [ENV1/Rel] = 10.00; Velocity [ENV1/Vel] = 20.00
- **Envelope 2:** Decay [ENV2/Dec] = 25.00; Release [ENV2/Rel] = 10.00; Velocity [ENV2/Vel] = 30.00
- **Voice:** Voice Mode [VCC/Mode] = 1; Transpose [VCC/Trsp] = -12
- **Main:** Output (main volume) [main/CcOp] = 76.00

## BS Rubber Pluck

**Category:** Bass:Synth  
**Architecture:** Dual VCO -> Ladder  
**Description:** Rubbery minimal bass: two saws an octave apart, resonant ladder with a snappy envelope, legato glide.  
**Usage:** Legato = glide. Velocity = filter punch.  

### Sound concept

- **intent:** A bouncy, slightly acidic minimal-techno bass line sound.
- **spectral:** Dual VCO saws, VCO2 an octave down; mild filter feedback.
- **temporal:** Short filter decay, medium amp sustain.
- **filtering:** Ladder, resonance 48, Env2 +55 with velocity.
- **modulation:** Env2 -> cutoff.
- **architecture:** Dual VCO + Ladder with HPF = Feedback for extra low-end weight.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Ladder.
- Dual VCO (Jupiter-style): VCO1 [saw] +0 st, VCO2 [saw] -12 st, mix 35.
- Ladder filter, 4-pole 24 dB: cutoff 48 (dark), resonance 48 (pronounced peak). Env2 sweeps cutoff by 55 (peaks around 103) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, sustains at 50, fast release.
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: legato, 16 voices, glide 10.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Osc 2 tune / detune [OSC/Tune2] = -12.00; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 35.00
- **High-pass / Feedback:** Feedback (post-filter -> mixer) [VCF1/Fback] = 15.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 48.00; Resonance / Emphasis / Peak [VCF1/Res] = 48.00; Key follow (KYBD) [VCF1/KeyScl] = 40.00; Cutoff mod 1 amount [VCF1/FMDpt] = 55.00
- **Envelope 1:** Decay [ENV1/Dec] = 45.00; Sustain [ENV1/Sus] = 50.00; Release [ENV1/Rel] = 12.00; Velocity [ENV1/Vel] = 25.00
- **Envelope 2:** Decay [ENV2/Dec] = 22.00; Release [ENV2/Rel] = 15.00; Velocity [ENV2/Vel] = 50.00
- **Voice:** Voice Mode [VCC/Mode] = 2; Glide [VCC/Porta] = 10.00; Transpose [VCC/Trsp] = -12
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 72.00

## BS Deep Pulse

**Category:** Bass:Synth  
**Architecture:** Triple VCO -> Cascade  
**Description:** Deep techno bass: square-ish main VCO, detuned saw and a sub triangle through a rough cascade.  
**Usage:** Velocity = brightness.  

### Sound concept

- **intent:** A heavy, hypnotic pulse bass for long minimal grooves.
- **spectral:** Triple VCO: ~square osc1, saw osc2 +4 cents, triangle osc3 an octave down; light feedback.
- **temporal:** Instant attack, short filter envelope.
- **filtering:** Cascade (rough) low cutoff; Env2 +35; velocity on cutoff mod 2.
- **architecture:** Triple VCO + Cascade: dense source, smoother than Ladder at high input.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Cascade.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~square (+0 st), osc2 ~saw (+0.04 st), osc3 ~triangle (-12 st) (waveform names approximate). Detune: osc2 detuned by ~4 cents -> chorusing/beating.
- Cascade filter, 4-pole 24 dB: cutoff 52 (dark), resonance 20 (classic analog emphasis). Env2 sweeps cutoff by 35 (peaks around 87) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, sustains at 70, fast release.
- Movement: essentially static (no LFO/random routes).
- Performance control: Velocity -> Cutoff (mod 2) (15).
- Effects: none (dry).
- Voicing: mono, 16 voices.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Osc 1 Waveform (Triple VCO morph) [OSC/Shape1] = 7.00; Volume 1 [OSC/Vol1] = 80.00; Osc 2 tune / detune [OSC/Tune2] = 0.04; Volume 2 [OSC/Vol2] = 45.00; Osc 3 tune / detune [OSC/Tune3] = -12.00; Osc 3 Waveform (Triple VCO morph) [OSC/Shape3] = 3.00; Volume 3 / DCO Sub level [OSC/Vol3] = 50.00
- **High-pass / Feedback:** Feedback (post-filter -> mixer) [VCF1/Fback] = 10.00
- **Main filter:** Cutoff [VCF1/Freq] = 52.00; Resonance / Emphasis / Peak [VCF1/Res] = 20.00; Key follow (KYBD) [VCF1/KeyScl] = 35.00; Cascade Rough/Clean [VCF1/LColor] = 0; Cutoff mod 1 amount [VCF1/FMDpt] = 35.00; Cutoff mod 2 source [VCF1/FM2Src] = 6; Cutoff mod 2 amount [VCF1/FM2Dpt] = 15.00
- **Envelope 1:** Sustain [ENV1/Sus] = 70.00; Release [ENV1/Rel] = 12.00; Velocity [ENV1/Vel] = 25.00
- **Envelope 2:** Decay [ENV2/Dec] = 30.00; Sustain [ENV2/Sus] = 10.00; Release [ENV2/Rel] = 12.00; Velocity [ENV2/Vel] = 35.00
- **Voice:** Voice Mode [VCC/Mode] = 1; Transpose [VCC/Trsp] = -12
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 74.00

## BS Bite Growl

**Category:** Bass:Synth  
**Architecture:** DCO -> Bite  
**Description:** Growling bass: DCO pulse + saw through Bite filters (HPF Bite + VCF Bite), slow PWM.  
**Usage:** Velocity = growl.  

### Sound concept

- **intent:** A gritty, MS-20-flavoured bass for darker minimal tracks.
- **spectral:** DCO pulse (PWM by slow LFO2) + saw + some sub.
- **filtering:** HPF Bite Rev 1 trims mud; VCF Bite Rev 1 with resonance 45 adds growl.
- **modulation:** Env2 -> cutoff, LFO2 -> PW.
- **architecture:** DCO + Bite: stable oscillator into the most characterful filter.

### Parameter-derived description

- Synthesis: subtractive, DCO -> Bite.
- DCO (Juno-style single oscillator): pulse PWM pulse (reacts to PW), saw saw, sub -1 oct shape 1 at 40.
- Bite filter, Rev 1: cutoff 58 (warm / muted), resonance 45 (classic analog emphasis). Env2 sweeps cutoff by 40 (peaks around 98) with a instant attack and moderate decay. HPF Bite at 40 trims the lows.
- Amp envelope (Analogue): instant attack, sustains at 65, fast release.
- Movement: LFO2 -> Pulse width (8).
- Effects: none (dry).
- Voicing: mono, 16 voices.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 2; DCO Pulse selector [OSC/PWShp] = 3; Volume 3 / DCO Sub level [OSC/Vol3] = 40.00; Pulse Width [OSC/PW] = 35.00; PWM depth [OSC/PWMDpt] = 8.00
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 3; HPF Frequency [HPF/Freq] = 40.00; HPF Peak (resonance) [HPF/Res] = 20.00
- **Main filter:** Filter Model [VCF1/Model] = 3; Cutoff [VCF1/Freq] = 58.00; Resonance / Emphasis / Peak [VCF1/Res] = 45.00; Key follow (KYBD) [VCF1/KeyScl] = 40.00; Cutoff mod 1 amount [VCF1/FMDpt] = 40.00
- **Envelope 1:** Decay [ENV1/Dec] = 40.00; Sustain [ENV1/Sus] = 65.00; Release [ENV1/Rel] = 12.00; Velocity [ENV1/Vel] = 25.00
- **Envelope 2:** Decay [ENV2/Dec] = 28.00; Sustain [ENV2/Sus] = 15.00; Release [ENV2/Rel] = 12.00; Velocity [ENV2/Vel] = 40.00
- **LFO 2:** Restart [LFO2/Trig] = 0; Rate (offset from Sync) [LFO2/Rate] = -0.50
- **Voice:** Voice Mode [VCC/Mode] = 1; Transpose [VCC/Trsp] = -12
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00

## PD Analog Memories II

**Category:** Pads:Analogue  
**Architecture:** Dual VCO -> Cascade  
**Description:** Darker, tape-worn sequel to Analog Memories: detuned saws, more drift, chorus into a wobbling delay.  
**Usage:** Hold chords. Velocity = level.  

### Sound concept

- **intent:** The same warm memory, further away: darker, wobblier, like an old cassette copy.
- **references:** PD Analog Memories (PLUIT VOL. 01)
- **spectral:** Dual VCO saws, VCO2 +11 cents.
- **temporal:** Slower swell and longer release than the original.
- **filtering:** Cascade cutoff 66 (darker), low resonance.
- **modulation:** Env2 slow -> cutoff; LFO2 random restart breathes cutoff; LFO1 random-glide vibrato; drift 90.
- **space:** Classic chorus -> damped delay with wow 60 (tape).
- **architecture:** Same Dual VCO + Cascade as the original you liked.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Cascade.
- Dual VCO (Jupiter-style): VCO1 [saw] +0 st, VCO2 [saw] +0.11 st, mix 45. Detune: vco2 detuned by ~11 cents, per-voice detune (amount 30) -> chorusing/beating. Voice drift 90 introduces analog pitch instability.
- Cascade filter, 4-pole 24 dB: cutoff 66 (warm / muted), resonance 10 (smooth). Env2 sweeps cutoff by 16 (peaks around 82) with a slow attack and very slow decay. LFO2 moves cutoff (7). HPF Pre at 40 trims the lows.
- Amp envelope (Analogue): slow attack, sustains at 85, very slow release.
- Movement: LFO2 -> Cutoff (mod 2) (7); LFO1 vibrato (5).
- Effects: Chorus (Classic) -> Delay.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Osc 2 tune / detune [OSC/Tune2] = 0.11; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 45.00
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 2; HPF Frequency [HPF/Freq] = 40.00
- **Main filter:** Cutoff [VCF1/Freq] = 66.00; Resonance / Emphasis / Peak [VCF1/Res] = 10.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Cutoff mod 1 amount [VCF1/FMDpt] = 16.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 7.00
- **Envelope 1:** Attack [ENV1/Atk] = 55.00; Decay [ENV1/Dec] = 60.00; Sustain [ENV1/Sus] = 85.00; Release [ENV1/Rel] = 62.00; Velocity [ENV1/Vel] = 20.00
- **Envelope 2:** Attack [ENV2/Atk] = 60.00; Decay [ENV2/Dec] = 70.00; Sustain [ENV2/Sus] = 40.00; Release [ENV2/Rel] = 60.00; Velocity [ENV2/Vel] = 10.00
- **LFO 1:** Waveform [LFO1/Wave] = 7; Restart [LFO1/Trig] = 3; Rate (offset from Sync) [LFO1/Rate] = -1.50; Depth Mod amount [LFO1/DMD1] = 100.00; Depth Mod source [LFO1/DMS1] = 0
- **LFO 2:** Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -2.00
- **Tuning:** Vibrato (LFO1 -> pitch) [OSC/VtoD] = 5.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Trimmers:** Voice Drift [OSC/Drift] = 90.00; Detune Amt (voice detune scaling) [OPT/TSlop] = 30.00; Cutoff variance [OPT/CSlop] = 18.00; Envelope-rate variance [OPT/ESlop] = 12.00; Voice 1 detune, osc 1 [OPT/V1T1] = 7.00; Voice 2 detune, osc 1 [OPT/V2T1] = -5.00; Voice 3 detune, osc 1 [OPT/V3T1] = 4.00; Voice 4 detune, osc 1 [OPT/V4T1] = -8.00; Voice 5 detune, osc 1 [OPT/V5T1] = 6.00; Voice 6 detune, osc 1 [OPT/V6T1] = -3.00; Voice 7 detune, osc 1 [OPT/V7T1] = 5.00; Voice 8 detune, osc 1 [OPT/V8T1] = -6.00; Voice 1 detune, osc 2 [OPT/V1T2] = -6.00; Voice 2 detune, osc 2 [OPT/V2T2] = 8.00; Voice 3 detune, osc 2 [OPT/V3T2] = -4.00; Voice 4 detune, osc 2 [OPT/V4T2] = 5.00; Voice 5 detune, osc 2 [OPT/V5T2] = -7.00; Voice 6 detune, osc 2 [OPT/V6T2] = 3.00; Voice 7 detune, osc 2 [OPT/V7T2] = -5.00; Voice 8 detune, osc 2 [OPT/V8T2] = 7.00
- **Main:** Output (main volume) [main/CcOp] = 78.00
- **Effects:** FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Delay2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Chorus Rate [Chrs1/Rate] = 22.00; Chorus Depth [Chrs1/Depth] = 60.00; Chorus Wet [Chrs1/Wet] = 65.00
- **Effects (FX2):** Delay Left time [Delay2/LDel] = 4.00; Delay Center time (= feedback time) [Delay2/CDel] = 6.00; Delay Right time [Delay2/RDel] = 8.00; Delay Side Vol [Delay2/SVol] = 25.00; Delay Feedback [Delay2/FeedB] = 40.00; Delay HP (feedback path) [Delay2/HP] = 25.00; Delay LP (feedback path) [Delay2/LP] = 45.00; Delay Wow (tape wobble) [Delay2/Wow] = 60.00

## PD Velvet Haze

**Category:** Pads:Analogue  
**Architecture:** Triple VCO -> Cascade  
**Description:** Three detuned saws, smooth cascade, gentle shape movement, ensemble chorus and plate.  
**Usage:** Hold chords.  

### Sound concept

- **intent:** A lush, velvety analogue bed, sibling of Analog Memories but fuller.
- **spectral:** Triple VCO, three saws detuned +9 / -7 cents.
- **temporal:** Slow attack, long release.
- **filtering:** Cascade clean at 72.
- **modulation:** LFO2 -> cutoff (5) and -> waveform shape of osc 2+3 (8) for slow animation; drift 50.
- **space:** Ensemble chorus -> plate.
- **architecture:** Triple VCO + Cascade: three oscillators make the thickest pad source; Cascade handles dense input smoothly.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Cascade.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~saw (+0 st), osc2 ~saw (+0.09 st), osc3 ~saw (-0.07 st) (waveform names approximate). Detune: osc2 detuned by ~9 cents, osc3 detuned by ~7 cents -> chorusing/beating. Voice drift 50 introduces analog pitch instability.
- Cascade filter, 4-pole 24 dB: cutoff 72 (warm / muted), resonance 10 (smooth). Env2 sweeps cutoff by 15 (peaks around 87) with a slow attack and very slow decay. LFO2 moves cutoff (5).
- Amp envelope (Analogue): slow attack, sustains at 90, slow release.
- Movement: LFO2 -> Cutoff (mod 2) (5); LFO2 -> Waveform shape (8).
- Effects: Chorus (Ensemble) -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Volume 1 [OSC/Vol1] = 70.00; Osc 2 tune / detune [OSC/Tune2] = 0.09; Volume 2 [OSC/Vol2] = 65.00; Osc 3 tune / detune [OSC/Tune3] = -0.07; Volume 3 / DCO Sub level [OSC/Vol3] = 55.00; Shape mod on osc 2 [OSC/SM2On] = 1; Shape mod on osc 3 [OSC/SM3On] = 1; Shape Mod depth [OSC/Sh1Dpt] = 8.00
- **Main filter:** Cutoff [VCF1/Freq] = 72.00; Resonance / Emphasis / Peak [VCF1/Res] = 10.00; Key follow (KYBD) [VCF1/KeyScl] = 35.00; Cutoff mod 1 amount [VCF1/FMDpt] = 15.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 5.00
- **Envelope 1:** Attack [ENV1/Atk] = 52.00; Decay [ENV1/Dec] = 60.00; Sustain [ENV1/Sus] = 90.00; Release [ENV1/Rel] = 60.00; Velocity [ENV1/Vel] = 20.00
- **Envelope 2:** Attack [ENV2/Atk] = 60.00; Decay [ENV2/Dec] = 70.00; Sustain [ENV2/Sus] = 50.00; Release [ENV2/Rel] = 60.00; Velocity [ENV2/Vel] = 10.00
- **LFO 2:** Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -1.50
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Trimmers:** Voice Drift [OSC/Drift] = 50.00; Cutoff variance [OPT/CSlop] = 12.00
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 76.00
- **Effects:** FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Chorus Type [Chrs1/Type] = 2; Chorus Rate [Chrs1/Rate] = 20.00; Chorus Wet [Chrs1/Wet] = 60.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 25.00; Plate Diffusion [Plate2/Diff] = 90.00; Plate Damp [Plate2/Damp] = 78.00; Plate Decay [Plate2/Decay] = 65.00; Plate Size [Plate2/Size] = 165.00; Plate Dry [Plate2/Dry] = 88.00; Plate Wet [Plate2/Wet] = 30.00

## KY Dusty Chords

**Category:** Keys:Chords  
**Architecture:** DCO -> Multimode  
**Description:** Deep-house/minimal chord keys: DCO pulse + saw, soft LP2, Juno-style chorus and a short plate.  
**Usage:** Play chords; velocity = brightness.  

### Sound concept

- **intent:** Dusty, slightly worn chord keys for deep minimal.
- **spectral:** DCO pulse (40%) + saw + a little sub and noise.
- **temporal:** Struck envelope, low sustain; digital envelope with curve.
- **filtering:** Multimode LP2 (brighter 2-pole) at 68.
- **space:** Classic chorus -> short dark plate.
- **architecture:** DCO + Multimode + Chorus: the Juno-style chain.

### Parameter-derived description

- Synthesis: subtractive, DCO -> Multimode.
- DCO (Juno-style single oscillator): pulse PWM pulse (reacts to PW), saw saw, sub -1 oct shape 1 at 25. Voice drift 30 introduces analog pitch instability.
- Multimode filter (LP2): cutoff 68 (warm / muted), resonance 10 (smooth). Env2 sweeps cutoff by 25 (peaks around 93) with a instant attack and slow decay.
- Amp envelope (Digital): instant attack, slow decay to 30, slow release. Velocity-sensitive (40).
- Movement: essentially static (no LFO/random routes).
- Performance control: Velocity -> Cutoff (mod 2) (10).
- Effects: Chorus (Classic) -> Plate.
- Voicing: poly, 12 voices.
- Likely use: keys / chords.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 2; DCO Pulse selector [OSC/PWShp] = 3; Volume 3 / DCO Sub level [OSC/Vol3] = 25.00; Noise volume [OSC/Noise] = 4.00; Pulse Width [OSC/PW] = 40.00
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 68.00; Resonance / Emphasis / Peak [VCF1/Res] = 10.00; Multimode type [VCF1/SvfMode] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 25.00; Cutoff mod 2 source [VCF1/FM2Src] = 6; Cutoff mod 2 amount [VCF1/FM2Dpt] = 10.00
- **Envelope 1:** Envelope Model [ENV1/Model] = 2; Decay [ENV1/Dec] = 55.00; Sustain [ENV1/Sus] = 30.00; Release [ENV1/Rel] = 40.00; Velocity [ENV1/Vel] = 40.00; Curve (C) [ENV1/Crve] = 1
- **Envelope 2:** Envelope Model [ENV2/Model] = 2; Decay [ENV2/Dec] = 40.00; Sustain [ENV2/Sus] = 10.00; Release [ENV2/Rel] = 35.00; Velocity [ENV2/Vel] = 50.00; Curve (C) [ENV2/Crve] = 1
- **Voice:** Voices (polyphony) [VCC/Voices] = 6
- **Trimmers:** Voice Drift [OSC/Drift] = 30.00; Envelope-rate variance [OPT/ESlop] = 10.00
- **Main:** Output (main volume) [main/CcOp] = 78.00
- **Effects:** FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Chorus Rate [Chrs1/Rate] = 28.00; Chorus Depth [Chrs1/Depth] = 45.00; Chorus Wet [Chrs1/Wet] = 60.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 10.00; Plate Diffusion [Plate2/Diff] = 85.00; Plate Damp [Plate2/Damp] = 85.00; Plate Size [Plate2/Size] = 120.00; Plate Wet [Plate2/Wet] = 24.00

## SQ Dub Chord Stab

**Category:** Sequences  
**Architecture:** Triple VCO -> Cascade  
**Description:** Dub-techno minor chord stab: three VCOs tuned root / minor third / fifth, short filter snap, long damped echo.  
**Usage:** One key = one minor chord. Play off-beats.  

### Sound concept

- **intent:** The classic dub-techno chord stab: one key, a dark minor chord echoing into space.
- **spectral:** Triple VCO saws at 0, +3 and +7 semitones (minor triad).
- **temporal:** Short decay, no sustain.
- **filtering:** Cascade low cutoff, Env2 snap.
- **space:** Delay 3/6/9 sixteenths, feedback 55, LP 45, wow 25 -> plate.
- **architecture:** Triple VCO: three oscillators = a full triad from one key.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Cascade.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~saw (+0 st), osc2 ~saw (+3 st), osc3 ~saw (+7 st) (waveform names approximate).
- Cascade filter, 4-pole 24 dB: cutoff 62 (warm / muted), resonance 18 (classic analog emphasis). Env2 sweeps cutoff by 30 (peaks around 92) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release. Velocity-sensitive (35).
- Movement: essentially static (no LFO/random routes).
- Effects: Delay -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Volume 1 [OSC/Vol1] = 70.00; Osc 2 tune / detune [OSC/Tune2] = 3.00; Volume 2 [OSC/Vol2] = 60.00; Osc 3 tune / detune [OSC/Tune3] = 7.00; Volume 3 / DCO Sub level [OSC/Vol3] = 60.00
- **Main filter:** Cutoff [VCF1/Freq] = 62.00; Resonance / Emphasis / Peak [VCF1/Res] = 18.00; Key follow (KYBD) [VCF1/KeyScl] = 40.00; Cutoff mod 1 amount [VCF1/FMDpt] = 30.00
- **Envelope 1:** Decay [ENV1/Dec] = 30.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 30.00; Velocity [ENV1/Vel] = 35.00
- **Envelope 2:** Decay [ENV2/Dec] = 24.00; Velocity [ENV2/Vel] = 30.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Delay Center time (= feedback time) [Delay1/CDel] = 6.00; Delay Right time [Delay1/RDel] = 9.00; Delay Side Vol [Delay1/SVol] = 40.00; Delay Center Vol [Delay1/CVol] = 20.00; Delay Feedback [Delay1/FeedB] = 55.00; Delay HP (feedback path) [Delay1/HP] = 35.00; Delay LP (feedback path) [Delay1/LP] = 45.00; Delay Wow (tape wobble) [Delay1/Wow] = 25.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 20.00; Plate Diffusion [Plate2/Diff] = 90.00; Plate Damp [Plate2/Damp] = 82.00; Plate Decay [Plate2/Decay] = 55.00; Plate Wet [Plate2/Wet] = 22.00

## SQ Minimal Blip

**Category:** Sequences  
**Architecture:** Digital -> Uhbie  
**Description:** Minimal techno blip: short digital pulse through a band-pass Uhbie, random per-note filter variation, ping-pong echo.  
**Usage:** Sequence 16ths; each note varies slightly (Random -> cutoff).  

### Sound concept

- **intent:** A tiny, constantly varying blip for hypnotic minimal sequences.
- **spectral:** Digital pulse wave.
- **temporal:** Very short envelopes.
- **filtering:** Uhbie at the band-pass centre, resonance 35.
- **modulation:** Env2 -> cutoff; Random -> cutoff mod 2 (per-note micro-variation).
- **space:** Short multi-tap delay.
- **architecture:** Digital + Uhbie: crisp source, silky band-pass.

### Parameter-derived description

- Synthesis: subtractive, Digital -> Uhbie.
- Digital (JP-8000-style): osc1 Pulse, osc2 Pulse (+12 st), mix 0.
- Uhbie filter: cutoff 85 (balanced), resonance 35 (classic analog emphasis). Env2 sweeps cutoff by 35 (peaks around 120) with a instant attack and fast decay.
- Amp envelope (Analogue): instant attack, fast decay to 0, fast release. Velocity-sensitive (40).
- Movement: Random -> Cutoff (mod 2) (12).
- Effects: Delay.
- Voicing: poly, 8 voices.
- Likely use: pluck / arpeggio.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 4; Digital osc 1 waveform [OSC/DgtlTp1] = 4; Osc 2 tune / detune [OSC/Tune2] = 12.00; Digital osc 2 waveform [OSC/DgtlTp2] = 4; Pulse Width [OSC/PW] = 30.00; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 0.00
- **Main filter:** Filter Model [VCF1/Model] = 4; Cutoff [VCF1/Freq] = 85.00; Resonance / Emphasis / Peak [VCF1/Res] = 35.00; Uhbie Mix (LP -> BR/BP -> HP) [VCF1/ShpMix] = 45.00; Uhbie BR/BP switch [VCF1/BpUbie] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 35.00; Cutoff mod 2 source [VCF1/FM2Src] = 11; Cutoff mod 2 amount [VCF1/FM2Dpt] = 12.00
- **Envelope 1:** Decay [ENV1/Dec] = 14.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 12.00; Velocity [ENV1/Vel] = 40.00
- **Envelope 2:** Decay [ENV2/Dec] = 10.00; Release [ENV2/Rel] = 8.00; Velocity [ENV2/Vel] = 30.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Main:** Output (main volume) [main/CcOp] = 78.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1
- **Effects (FX1):** Delay Left time [Delay1/LDel] = 2.00; Delay Center time (= feedback time) [Delay1/CDel] = 3.00; Delay Right time [Delay1/RDel] = 4.00; Delay Center Vol [Delay1/CVol] = 10.00; Delay Feedback [Delay1/FeedB] = 35.00; Delay HP (feedback path) [Delay1/HP] = 30.00; Delay LP (feedback path) [Delay1/LP] = 60.00; Delay Wow (tape wobble) [Delay1/Wow] = 10.00

## FX Dub Space

**Category:** FX  
**Architecture:** Dual VCO -> Cascade  
**Description:** Evolving dub atmosphere: detuned saws and noise, slowly wandering resonant filter, long tape echo and plate.  
**Usage:** Hold a note or chord and let it evolve.  

### Sound concept

- **intent:** A slowly breathing dub-techno space to sit behind the groove.
- **spectral:** Dual VCO saws (+12 cents) plus VCO1 noise.
- **temporal:** Slow swell, long release.
- **filtering:** Cascade with resonance 35; LFO2 random-glide moves the cutoff slowly.
- **modulation:** LFO2 (random glide, slow) -> cutoff mod 2 (+25); drift 60.
- **space:** Delay feedback 58, LP 40, wow 50 -> plate.
- **architecture:** Dual VCO + Cascade, like Analog Memories, pushed into texture.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Cascade.
- Dual VCO (Jupiter-style): VCO1 [saw+noise] +0 st, VCO2 [saw] +0.12 st, mix 50. Detune: vco2 detuned by ~12 cents -> chorusing/beating. Voice drift 60 introduces analog pitch instability.
- Cascade filter, 4-pole 24 dB: cutoff 60 (warm / muted), resonance 35 (classic analog emphasis). Env2 sweeps cutoff by 10 (peaks around 70) with a very slow attack and very slow decay. LFO2 moves cutoff (25). HPF Pre at 45 trims the lows.
- Amp envelope (Analogue): very slow attack, sustains at 100, very slow release.
- Movement: LFO2 -> Cutoff (mod 2) (25).
- Effects: Delay -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Dual VCO: VCO1 noise [OSC/Noise1] = 1; Osc 2 tune / detune [OSC/Tune2] = 0.12
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 2; HPF Frequency [HPF/Freq] = 45.00
- **Main filter:** Cutoff [VCF1/Freq] = 60.00; Resonance / Emphasis / Peak [VCF1/Res] = 35.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Cutoff mod 1 amount [VCF1/FMDpt] = 10.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 25.00
- **Envelope 1:** Attack [ENV1/Atk] = 70.00; Decay [ENV1/Dec] = 80.00; Release [ENV1/Rel] = 75.00; Velocity [ENV1/Vel] = 10.00
- **Envelope 2:** Attack [ENV2/Atk] = 70.00; Decay [ENV2/Dec] = 80.00; Sustain [ENV2/Sus] = 60.00; Release [ENV2/Rel] = 70.00
- **LFO 2:** Waveform [LFO2/Wave] = 7; Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -2.50
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Trimmers:** Voice Drift [OSC/Drift] = 60.00
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 72.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Delay Left time [Delay1/LDel] = 4.00; Delay Center time (= feedback time) [Delay1/CDel] = 6.00; Delay Right time [Delay1/RDel] = 8.00; Delay Side Vol [Delay1/SVol] = 35.00; Delay Center Vol [Delay1/CVol] = 15.00; Delay Feedback [Delay1/FeedB] = 58.00; Delay HP (feedback path) [Delay1/HP] = 30.00; Delay LP (feedback path) [Delay1/LP] = 40.00; Delay Wow (tape wobble) [Delay1/Wow] = 50.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 30.00; Plate Diffusion [Plate2/Diff] = 95.00; Plate Decay [Plate2/Decay] = 75.00; Plate Size [Plate2/Size] = 185.00; Plate Dry [Plate2/Dry] = 88.00; Plate Wet [Plate2/Wet] = 35.00

