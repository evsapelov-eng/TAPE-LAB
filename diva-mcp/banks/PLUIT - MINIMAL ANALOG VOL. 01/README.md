# PLUIT - MINIMAL ANALOG VOL. 01

30 preset(s) for u-he Diva generated with diva-mcp.

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
| PD Wide Horizon | Dual VCO -> Cascade | 74 / 40 | low | passed | not run | not run |
| PD Glass Cathedral | Digital -> Uhbie | 70 / 38 | low | passed | not run | not run |
| PD Organic Breath | Dual VCO -> Multimode | 76 / 42 | low | passed | not run | not run |
| PD Deep Ocean | Triple VCO -> Ladder | 72 / 40 | low | passed | not run | not run |
| ARP Minimal Pulse | DCO -> Multimode | 76 / 42 | low | passed | not run | not run |
| ARP Organic Kalimba | Digital -> Uhbie | 78 / 42 | low | passed | not run | not run |
| ARP Dub Steps | Dual VCO -> Cascade | 70 / 38 | low | passed | not run | not run |
| ARP Acid Bubble | Dual VCO -> Ladder | 70 / 38 | low | passed | not run | not run |
| ARP Marimba Groove | Triple VCO -> Multimode | 78 / 42 | low | passed | not run | not run |
| BS Reese Classic | Triple VCO -> Ladder | 70 / 38 | low | passed | not run | not run |
| BS Reese Wide | Dual VCO -> Cascade | 70 / 38 | low | passed | not run | not run |
| BS Reese Growl | Digital -> Bite | 68 / 36 | low | passed | not run | not run |
| BS Organic Thump | DCO -> Ladder | 76 / 42 | low | passed | not run | not run |
| FX Tape Riser | Triple VCO -> Multimode | 68 / 38 | low | passed | not run | not run |

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
- Likely use: percussion.

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
- Likely use: percussion.

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
- Likely use: percussion.

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
- Likely use: percussion.

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
- Likely use: percussion.

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
- Likely use: percussion.

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
- Likely use: sequence / stab.

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
- Likely use: sequence / stab.

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
- Likely use: effect / transition.

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

## PD Wide Horizon

**Category:** Pads:Analogue  
**Architecture:** Dual VCO -> Cascade  
**Description:** Wide, open analogue pad: saws a fifth apart, per-note random panning, ensemble chorus into a huge plate.  
**Usage:** Hold chords; each note lands at a different stereo position.  

### Sound concept

- **intent:** A wide horizon of sound that fills the stereo field without getting harsh.
- **spectral:** Dual VCO saws, VCO2 a fifth up (+7.04 st), quieter.
- **filtering:** Cascade clean, medium cutoff, slow Env2.
- **modulation:** Random -> pan (per-note stereo spread), slow LFO2 -> cutoff.
- **space:** Ensemble chorus -> large plate (size 195, decay 78).
- **architecture:** Dual VCO + Cascade, the Analog Memories family, widened.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Cascade.
- Dual VCO (Jupiter-style): VCO1 [saw] +0 st, VCO2 [saw] +7.04 st, mix 38. Detune: vco2 detuned by ~4 cents -> chorusing/beating. Voice drift 45 introduces analog pitch instability.
- Cascade filter, 4-pole 24 dB: cutoff 76 (warm / muted), resonance 8 (smooth). Env2 sweeps cutoff by 14 (peaks around 90) with a very slow attack and very slow decay. LFO2 moves cutoff (5). HPF Pre at 40 trims the lows.
- Amp envelope (Analogue): slow attack, sustains at 90, very slow release.
- Movement: LFO2 -> Cutoff (mod 2) (5); Random -> Pan (45).
- Effects: Chorus (Ensemble) -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Osc 2 tune / detune [OSC/Tune2] = 7.04; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 38.00
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 2; HPF Frequency [HPF/Freq] = 40.00
- **Main filter:** Cutoff [VCF1/Freq] = 76.00; Resonance / Emphasis / Peak [VCF1/Res] = 8.00; Key follow (KYBD) [VCF1/KeyScl] = 35.00; Cutoff mod 1 amount [VCF1/FMDpt] = 14.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 5.00
- **Envelope 1:** Attack [ENV1/Atk] = 60.00; Decay [ENV1/Dec] = 70.00; Sustain [ENV1/Sus] = 90.00; Release [ENV1/Rel] = 68.00; Velocity [ENV1/Vel] = 15.00
- **Envelope 2:** Attack [ENV2/Atk] = 65.00; Decay [ENV2/Dec] = 75.00; Sustain [ENV2/Sus] = 50.00; Release [ENV2/Rel] = 65.00; Velocity [ENV2/Vel] = 5.00
- **LFO 2:** Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -2.00
- **Amplifier:** Pan Mod source [VCA1/PanSrc] = 11; Pan Mod amount [VCA1/PanDpt] = 45.00; Volume (VCA gain) [VCA1/Vol] = 40.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Trimmers:** Voice Drift [OSC/Drift] = 45.00; Cutoff variance [OPT/CSlop] = 10.00
- **Main:** Output (main volume) [main/CcOp] = 74.00
- **Effects:** FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Chorus Type [Chrs1/Type] = 2; Chorus Rate [Chrs1/Rate] = 18.00; Chorus Depth [Chrs1/Depth] = 55.00; Chorus Wet [Chrs1/Wet] = 65.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 35.00; Plate Diffusion [Plate2/Diff] = 95.00; Plate Damp [Plate2/Damp] = 72.00; Plate Decay [Plate2/Decay] = 78.00; Plate Size [Plate2/Size] = 195.00; Plate Dry [Plate2/Dry] = 86.00; Plate Wet [Plate2/Wet] = 34.00

## PD Glass Cathedral

**Category:** Pads:Digital  
**Architecture:** Digital -> Uhbie  
**Description:** Shimmering digital space: Multisaw plus an octave triangle through a silky Uhbie, long echo and a cathedral plate.  
**Usage:** Hold notes high on the keyboard for shimmer.  

### Sound concept

- **intent:** A glassy, airy cathedral of sound for breakdowns.
- **spectral:** Digital Multisaw (dense supersaw-type) + triangle an octave up.
- **filtering:** Uhbie mostly low-pass, low resonance, strong key follow.
- **modulation:** Slow LFO2 -> Uhbie mix for a breathing tone.
- **space:** Delay (6/8/12 sixteenths, damped) -> plate size 200.
- **architecture:** Digital + Uhbie: digital spectrum for shimmer, Uhbie keeps it smooth.

### Parameter-derived description

- Synthesis: subtractive, Digital -> Uhbie.
- Digital (JP-8000-style): osc1 Multisaw, osc2 Triangle (+12 st), mix 35. Multisaw gives a dense supersaw-type spectrum.
- Uhbie filter: cutoff 88 (balanced), resonance 12 (smooth). Env2 sweeps cutoff by 10 (peaks around 98) with a very slow attack and very slow decay. HPF Pre at 50 trims the lows.
- Amp envelope (Analogue): very slow attack, sustains at 95, very slow release.
- Movement: LFO2 -> Uhbie mix (12).
- Effects: Delay -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 4; Digital osc 1 waveform [OSC/DgtlTp1] = 0; Osc 2 tune / detune [OSC/Tune2] = 12.00; Digital osc 2 waveform [OSC/DgtlTp2] = 6; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 35.00
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 2; HPF Frequency [HPF/Freq] = 50.00
- **Main filter:** Filter Model [VCF1/Model] = 4; Cutoff [VCF1/Freq] = 88.00; Resonance / Emphasis / Peak [VCF1/Res] = 12.00; Key follow (KYBD) [VCF1/KeyScl] = 60.00; Uhbie Mix (LP -> BR/BP -> HP) [VCF1/ShpMix] = 10.00; Cutoff mod 1 amount [VCF1/FMDpt] = 10.00; Uhbie Mix mod source [VCF1/SMSrc] = 17; Uhbie Mix mod amount [VCF1/SMDpt] = 12.00
- **Envelope 1:** Attack [ENV1/Atk] = 65.00; Decay [ENV1/Dec] = 70.00; Sustain [ENV1/Sus] = 95.00; Release [ENV1/Rel] = 75.00; Velocity [ENV1/Vel] = 10.00
- **Envelope 2:** Attack [ENV2/Atk] = 70.00; Decay [ENV2/Dec] = 70.00; Sustain [ENV2/Sus] = 60.00; Release [ENV2/Rel] = 70.00
- **LFO 2:** Waveform [LFO2/Wave] = 0; Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -2.50
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Delay Left time [Delay1/LDel] = 6.00; Delay Center time (= feedback time) [Delay1/CDel] = 8.00; Delay Right time [Delay1/RDel] = 12.00; Delay Center Vol [Delay1/CVol] = 10.00; Delay Feedback [Delay1/FeedB] = 45.00; Delay HP (feedback path) [Delay1/HP] = 35.00; Delay LP (feedback path) [Delay1/LP] = 60.00; Delay Wow (tape wobble) [Delay1/Wow] = 15.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 40.00; Plate Damp [Plate2/Damp] = 65.00; Plate Decay [Plate2/Decay] = 85.00; Plate Size [Plate2/Size] = 200.00; Plate Dry [Plate2/Dry] = 85.00; Plate Wet [Plate2/Wet] = 32.00

## PD Organic Breath

**Category:** Pads:Analogue  
**Architecture:** Dual VCO -> Multimode  
**Description:** Breathy, organic pad: triangle plus noise and a soft octave sine, gently moving filter, dramatic chorus.  
**Usage:** Velocity = breath. Great for organic house intros.  

### Sound concept

- **intent:** A soft, breathing pad with an airy, almost flute-like texture for organic house.
- **spectral:** Dual VCO: triangle + noise on VCO1, sine an octave up on VCO2.
- **filtering:** Multimode LP2, slow random cutoff movement.
- **modulation:** LFO2 random-glide -> cutoff mod 2; velocity on Env2.
- **space:** Dramatic chorus -> medium plate.
- **architecture:** Dual VCO lets noise ride inside VCO1 for natural breath; Multimode LP2 keeps it open.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Multimode.
- Dual VCO (Jupiter-style): VCO1 [triangle+noise] +0 st, VCO2 [sine] +12 st, mix 40. Voice drift 35 introduces analog pitch instability.
- Multimode filter (LP2): cutoff 74 (warm / muted), resonance 15 (smooth). Env2 sweeps cutoff by 15 (peaks around 89) with a slow attack and slow decay. LFO2 moves cutoff (9).
- Amp envelope (Analogue): slow attack, sustains at 80, slow release. Velocity-sensitive (35).
- Movement: LFO2 -> Cutoff (mod 2) (9).
- Effects: Chorus (Dramatic) -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Dual VCO: VCO1 triangle [OSC/Tri1] = 1; Dual VCO: VCO1 saw [OSC/Saw1] = 0; Dual VCO: VCO1 noise [OSC/Noise1] = 1; Osc 2 tune / detune [OSC/Tune2] = 12.00; Dual VCO: VCO2 sine [OSC/Sin2] = 1; Dual VCO: VCO2 saw [OSC/Saw2] = 0; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 40.00; Dual VCO Shape (hardware revision) [OSC/triSp] = 0
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 74.00; Resonance / Emphasis / Peak [VCF1/Res] = 15.00; Key follow (KYBD) [VCF1/KeyScl] = 45.00; Multimode type [VCF1/SvfMode] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 15.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 9.00
- **Envelope 1:** Attack [ENV1/Atk] = 45.00; Decay [ENV1/Dec] = 60.00; Sustain [ENV1/Sus] = 80.00; Release [ENV1/Rel] = 55.00; Velocity [ENV1/Vel] = 35.00
- **Envelope 2:** Attack [ENV2/Atk] = 50.00; Decay [ENV2/Dec] = 60.00; Sustain [ENV2/Sus] = 40.00; Release [ENV2/Rel] = 50.00; Velocity [ENV2/Vel] = 40.00
- **LFO 2:** Waveform [LFO2/Wave] = 7; Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -1.50
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Trimmers:** Voice Drift [OSC/Drift] = 35.00
- **Main:** Output (main volume) [main/CcOp] = 76.00
- **Effects:** FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Chorus Type [Chrs1/Type] = 1; Chorus Rate [Chrs1/Rate] = 15.00; Chorus Depth [Chrs1/Depth] = 45.00; Chorus Wet [Chrs1/Wet] = 50.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 20.00; Plate Diffusion [Plate2/Diff] = 90.00; Plate Decay [Plate2/Decay] = 62.00; Plate Size [Plate2/Size] = 160.00; Plate Dry [Plate2/Dry] = 88.00; Plate Wet [Plate2/Wet] = 30.00

## PD Deep Ocean

**Category:** Pads:Analogue  
**Architecture:** Triple VCO -> Ladder  
**Description:** Dark, submerged pad: triangle and an octave-down saw in a low ladder, slow phaser, deep plate.  
**Usage:** Low-register chords; mod wheel opens the filter.  

### Sound concept

- **intent:** A dark, slowly rolling underwater pad for deep minimal.
- **spectral:** Triple VCO: triangle osc1, saw osc2 an octave down, quiet detuned osc3.
- **filtering:** Ladder low cutoff; mod wheel opens it.
- **modulation:** Slow LFO2 -> cutoff; ModWhl -> cutoff mod 2.
- **space:** Slow Stoned phaser -> deep damped plate.
- **architecture:** Triple VCO + Ladder for a heavy, round, dark body.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Ladder.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~triangle (+0 st), osc2 ~saw (-12 st), osc3 ~triangle (+0.08 st) (waveform names approximate). Detune: osc3 detuned by ~8 cents -> chorusing/beating. Voice drift 40 introduces analog pitch instability.
- Ladder filter, 4-pole 24 dB: cutoff 56 (warm / muted), resonance 18 (classic analog emphasis). LFO2 moves cutoff (10).
- Amp envelope (Analogue): slow attack, sustains at 90, very slow release.
- Movement: LFO2 -> Cutoff (mod 1) (10).
- Performance control: ModWhl -> Cutoff (mod 2) (35).
- Effects: Phaser -> Plate.
- Voicing: poly, 8 voices.
- Likely use: pad / harmonic bed.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Osc 1 Waveform (Triple VCO morph) [OSC/Shape1] = 3.00; Volume 1 [OSC/Vol1] = 70.00; Osc 2 tune / detune [OSC/Tune2] = -12.00; Volume 2 [OSC/Vol2] = 60.00; Osc 3 tune / detune [OSC/Tune3] = 0.08; Osc 3 Waveform (Triple VCO morph) [OSC/Shape3] = 3.00; Volume 3 / DCO Sub level [OSC/Vol3] = 40.00
- **High-pass / Feedback:** Feedback (post-filter -> mixer) [VCF1/Fback] = 10.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 56.00; Resonance / Emphasis / Peak [VCF1/Res] = 18.00; Key follow (KYBD) [VCF1/KeyScl] = 25.00; Cutoff mod 1 source [VCF1/FMSrc] = 17; Cutoff mod 1 amount [VCF1/FMDpt] = 10.00; Cutoff mod 2 source [VCF1/FM2Src] = 1; Cutoff mod 2 amount [VCF1/FM2Dpt] = 35.00
- **Envelope 1:** Attack [ENV1/Atk] = 55.00; Decay [ENV1/Dec] = 70.00; Sustain [ENV1/Sus] = 90.00; Release [ENV1/Rel] = 70.00; Velocity [ENV1/Vel] = 15.00
- **Envelope 2:** Attack [ENV2/Atk] = 60.00; Decay [ENV2/Dec] = 70.00; Sustain [ENV2/Sus] = 50.00; Release [ENV2/Rel] = 60.00
- **LFO 2:** Restart [LFO2/Trig] = 3; Rate (offset from Sync) [LFO2/Rate] = -2.50
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Trimmers:** Voice Drift [OSC/Drift] = 40.00
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 40.00
- **Main:** Output (main volume) [main/CcOp] = 72.00
- **Effects:** FX1 type [FX1/Module] = 'Phaser1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Phaser Rate / Beats [Phase1/Rate] = 12.00; Phaser Feedback [Phase1/FB] = 30.00; Phaser Stereo [Phase1/Stereo] = 20.00; Phaser Wet [Phase1/Wet] = 60.00; Phaser Depth [Phase1/Depth] = 80.00; Phaser Center [Phase1/Center] = 45.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 25.00; Plate Diffusion [Plate2/Diff] = 95.00; Plate Damp [Plate2/Damp] = 85.00; Plate Decay [Plate2/Decay] = 75.00; Plate Size [Plate2/Size] = 185.00; Plate Dry [Plate2/Dry] = 88.00; Plate Wet [Plate2/Wet] = 30.00

## ARP Minimal Pulse

**Category:** Sequences:Arpeggio  
**Architecture:** DCO -> Multimode  
**Description:** Hypnotic minimal-techno arp: short DCO pulse plucks, light swing, 3/16 echo.  
**Usage:** Hold a chord; the host-synced arp plays it upwards. Velocity = brightness.  

### Sound concept

- **intent:** An endlessly rolling minimal arpeggio.
- **spectral:** DCO PW-reactive pulse 35%.
- **temporal:** Very short envelopes keep the arp tight.
- **filtering:** Multimode LP4 with a quick Env2 snap and Random micro-variation.
- **modulation:** Env2 -> cutoff, Random -> cutoff mod 2.
- **dynamics:** Arpeggiator up, swing 15.
- **space:** Dotted 3/16 echo.
- **architecture:** DCO + Multimode: stable, punchy, sequencer-friendly.

### Parameter-derived description

- Synthesis: subtractive, DCO -> Multimode.
- DCO (Juno-style single oscillator): pulse PWM pulse (reacts to PW), saw off, sub -1 oct shape 1 at 15.
- Multimode filter (LP4): cutoff 66 (warm / muted), resonance 28 (classic analog emphasis). Env2 sweeps cutoff by 40 (peaks around 106) with a instant attack and fast decay.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release. Velocity-sensitive (35).
- Movement: Random -> Cutoff (mod 2) (10).
- Effects: Delay.
- Arpeggiator: up, progression serial, swing 15 (host-synced).
- Voicing: poly, 8 voices.
- Likely use: rhythmic arpeggio (hold chords).

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 2; DCO Pulse selector [OSC/PWShp] = 3; DCO Sawtooth selector [OSC/SawShp] = 0; Volume 3 / DCO Sub level [OSC/Vol3] = 15.00; Pulse Width [OSC/PW] = 35.00
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 66.00; Resonance / Emphasis / Peak [VCF1/Res] = 28.00; Cutoff mod 1 amount [VCF1/FMDpt] = 40.00; Cutoff mod 2 source [VCF1/FM2Src] = 11; Cutoff mod 2 amount [VCF1/FM2Dpt] = 10.00
- **Envelope 1:** Decay [ENV1/Dec] = 20.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 18.00; Velocity [ENV1/Vel] = 35.00
- **Envelope 2:** Decay [ENV2/Dec] = 14.00; Release [ENV2/Rel] = 12.00; Velocity [ENV2/Vel] = 40.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Main:** Output (main volume) [main/CcOp] = 76.00
- **Arpeggiator:** Arp On/Off [ARP/OnOff] = 1; Clock Swing [CLK/Swing] = 15.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1
- **Effects (FX1):** Delay Center time (= feedback time) [Delay1/CDel] = 3.00; Delay Center Vol [Delay1/CVol] = 15.00; Delay Feedback [Delay1/FeedB] = 35.00; Delay HP (feedback path) [Delay1/HP] = 30.00; Delay LP (feedback path) [Delay1/LP] = 55.00; Delay Wow (tape wobble) [Delay1/Wow] = 10.00

## ARP Organic Kalimba

**Category:** Sequences:Arpeggio  
**Architecture:** Digital -> Uhbie  
**Description:** Kalimba-like organic-house arp: digital triangle plucks through a band-pass Uhbie, strong swing, warm echo.  
**Usage:** Hold a chord; swing gives the organic-house shuffle.  

### Sound concept

- **intent:** A wooden, kalimba-like arpeggio with an organic-house shuffle.
- **spectral:** Digital triangle (synced sine harmonic) + quiet triangle two octaves up for the 'tine'.
- **temporal:** Instant attack, short decay, a little release.
- **filtering:** Uhbie between LP and band-pass, moderate resonance.
- **dynamics:** Arp up+down 1, swing 35.
- **space:** Echo 3/4/6 with wow 20 -> small plate.
- **architecture:** Digital + Uhbie: clean tonal source with a silky resonant band.

### Parameter-derived description

- Synthesis: subtractive, Digital -> Uhbie.
- Digital (JP-8000-style): osc1 Triangle, osc2 Triangle (+24 st), mix 15.
- Uhbie filter: cutoff 84 (balanced), resonance 32 (classic analog emphasis). Env2 sweeps cutoff by 25 (peaks around 109) with a instant attack and fast decay.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release. Velocity-sensitive (45).
- Movement: essentially static (no LFO/random routes).
- Effects: Delay -> Plate.
- Arpeggiator: up+dn 1, progression serial, swing 35 (host-synced).
- Voicing: poly, 8 voices.
- Likely use: rhythmic arpeggio (hold chords).

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 4; Digital osc 1 waveform [OSC/DgtlTp1] = 6; Osc 2 tune / detune [OSC/Tune2] = 24.00; Digital osc 2 waveform [OSC/DgtlTp2] = 6; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 15.00
- **Main filter:** Filter Model [VCF1/Model] = 4; Cutoff [VCF1/Freq] = 84.00; Resonance / Emphasis / Peak [VCF1/Res] = 32.00; Key follow (KYBD) [VCF1/KeyScl] = 60.00; Uhbie Mix (LP -> BR/BP -> HP) [VCF1/ShpMix] = 35.00; Uhbie BR/BP switch [VCF1/BpUbie] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 25.00
- **Envelope 1:** Decay [ENV1/Dec] = 26.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 24.00; Velocity [ENV1/Vel] = 45.00
- **Envelope 2:** Decay [ENV2/Dec] = 12.00; Release [ENV2/Rel] = 10.00; Velocity [ENV2/Vel] = 40.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Main:** Output (main volume) [main/CcOp] = 78.00
- **Arpeggiator:** Arp On/Off [ARP/OnOff] = 1; Arp Mode / Direction [ARP/Dir] = 3; Clock Swing [CLK/Swing] = 35.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Delay Center Vol [Delay1/CVol] = 10.00; Delay HP (feedback path) [Delay1/HP] = 25.00; Delay LP (feedback path) [Delay1/LP] = 60.00; Delay Wow (tape wobble) [Delay1/Wow] = 20.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 10.00; Plate Diffusion [Plate2/Diff] = 85.00; Plate Decay [Plate2/Decay] = 40.00; Plate Size [Plate2/Size] = 110.00; Plate Dry [Plate2/Dry] = 92.00; Plate Wet [Plate2/Wet] = 20.00

## ARP Dub Steps

**Category:** Sequences:Arpeggio  
**Architecture:** Dual VCO -> Cascade  
**Description:** Dub-techno arp: saw + fifth stabs climbing through octaves in a dark cascade, deep echo.  
**Usage:** Hold one or two notes; the arp climbs through octaves.  

### Sound concept

- **intent:** Dub-techno stabs stepping through octaves and dissolving in echo.
- **spectral:** Dual VCO saws, VCO2 a fifth up (power-chord stab).
- **filtering:** Cascade low cutoff, short Env2.
- **dynamics:** Arp up+down 2, octaves raw 2 (octave count unconfirmed).
- **space:** Delay 3/6/9, feedback 52 -> plate.
- **architecture:** Dual VCO + Cascade: the dub-chord colour, made rhythmic.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Cascade.
- Dual VCO (Jupiter-style): VCO1 [saw] +0 st, VCO2 [saw] +7 st, mix 45.
- Cascade filter, 4-pole 24 dB: cutoff 60 (warm / muted), resonance 22 (classic analog emphasis). Env2 sweeps cutoff by 30 (peaks around 90) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release.
- Movement: essentially static (no LFO/random routes).
- Effects: Delay -> Plate.
- Arpeggiator: up+dn 2, progression serial (host-synced).
- Voicing: poly, 8 voices.
- Likely use: rhythmic arpeggio (hold chords).

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Osc 2 tune / detune [OSC/Tune2] = 7.00; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 45.00
- **Main filter:** Cutoff [VCF1/Freq] = 60.00; Resonance / Emphasis / Peak [VCF1/Res] = 22.00; Key follow (KYBD) [VCF1/KeyScl] = 40.00; Cutoff mod 1 amount [VCF1/FMDpt] = 30.00
- **Envelope 1:** Decay [ENV1/Dec] = 24.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 22.00
- **Envelope 2:** Decay [ENV2/Dec] = 20.00; Release [ENV2/Rel] = 18.00; Velocity [ENV2/Vel] = 30.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00
- **Arpeggiator:** Arp On/Off [ARP/OnOff] = 1; Arp Mode / Direction [ARP/Dir] = 4; Arp Octaves [ARP/Oct] = 2
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Delay Center time (= feedback time) [Delay1/CDel] = 6.00; Delay Right time [Delay1/RDel] = 9.00; Delay Side Vol [Delay1/SVol] = 40.00; Delay Center Vol [Delay1/CVol] = 20.00; Delay Feedback [Delay1/FeedB] = 52.00; Delay HP (feedback path) [Delay1/HP] = 35.00; Delay LP (feedback path) [Delay1/LP] = 45.00; Delay Wow (tape wobble) [Delay1/Wow] = 25.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 20.00; Plate Diffusion [Plate2/Diff] = 90.00; Plate Damp [Plate2/Damp] = 82.00; Plate Decay [Plate2/Decay] = 55.00; Plate Wet [Plate2/Wet] = 22.00

**Warnings:** arp.octaves_raw: only raw 1 is confirmed as the common value; the octave count of other values is unconfirmed

## ARP Acid Bubble

**Category:** Sequences:Arpeggio  
**Architecture:** Dual VCO -> Ladder  
**Description:** Bubbling acid-minimal arp: saw into a resonant ladder with a snappy envelope and random filter variation.  
**Usage:** Hold 1-3 notes. Mod wheel = more resonance.  

### Sound concept

- **intent:** A squelchy, bubbling minimal-acid line from a held chord.
- **spectral:** Dual VCO saw, VCO2 an octave down for weight.
- **filtering:** Ladder resonance 60, Env2 +50, Random -> cutoff mod 2.
- **modulation:** ModWhl -> resonance.
- **dynamics:** Arp random order, swing 10.
- **space:** Short 3/16 echo.
- **architecture:** Dual VCO + Ladder: the classic squelch.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Ladder.
- Dual VCO (Jupiter-style): VCO1 [saw] +0 st, VCO2 [saw] -12 st, mix 30.
- Ladder filter, 4-pole 24 dB: cutoff 50 (dark), resonance 60 (pronounced peak). Env2 sweeps cutoff by 50 (peaks around 100) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, moderate decay to 20, fast release.
- Movement: Random -> Cutoff (mod 2) (12).
- Performance control: ModWhl -> Resonance (25).
- Effects: Delay.
- Arpeggiator: random, progression serial, swing 10 (host-synced).
- Voicing: poly, 6 voices.
- Likely use: rhythmic arpeggio (hold chords).

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Osc 2 tune / detune [OSC/Tune2] = -12.00; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 30.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 50.00; Resonance / Emphasis / Peak [VCF1/Res] = 60.00; Key follow (KYBD) [VCF1/KeyScl] = 40.00; Cutoff mod 1 amount [VCF1/FMDpt] = 50.00; Cutoff mod 2 source [VCF1/FM2Src] = 11; Cutoff mod 2 amount [VCF1/FM2Dpt] = 12.00; Resonance Mod source [VCF1/ResSrc] = 1; Resonance Mod amount [VCF1/ResDpt] = 25.00
- **Envelope 1:** Decay [ENV1/Dec] = 22.00; Sustain [ENV1/Sus] = 20.00; Release [ENV1/Rel] = 15.00
- **Envelope 2:** Decay [ENV2/Dec] = 18.00; Release [ENV2/Rel] = 14.00; Velocity [ENV2/Vel] = 50.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 4
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00
- **Arpeggiator:** Arp On/Off [ARP/OnOff] = 1; Arp Mode / Direction [ARP/Dir] = 5; Clock Swing [CLK/Swing] = 10.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1
- **Effects (FX1):** Delay Center time (= feedback time) [Delay1/CDel] = 3.00; Delay Side Vol [Delay1/SVol] = 25.00; Delay Center Vol [Delay1/CVol] = 10.00; Delay HP (feedback path) [Delay1/HP] = 30.00; Delay LP (feedback path) [Delay1/LP] = 55.00; Delay Wow (tape wobble) [Delay1/Wow] = 5.00

## ARP Marimba Groove

**Category:** Sequences:Arpeggio  
**Architecture:** Triple VCO -> Multimode  
**Description:** Organic-house marimba arp: soft FM-tinged triangles, short LP2 filter, played-order arp with heavy swing.  
**Usage:** Play a chord in the order you want; the arp repeats it with swing.  

### Sound concept

- **intent:** A warm, wooden marimba-like groove for organic house.
- **spectral:** Triple VCO triangles, osc2 two octaves up, a little FM for the mallet 'tock'.
- **temporal:** Instant attack, short decay.
- **filtering:** Multimode LP2 with fast Env2.
- **dynamics:** Arp in played order, swing 40.
- **space:** Small plate.
- **architecture:** Triple VCO is the only model with FM between oscillators for a mallet tone.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Multimode.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~triangle (+0 st), osc2 ~triangle (+24 st) (waveform names approximate). Audible FM 1->2/3 (12) adds metallic/clangorous sidebands.
- Multimode filter (LP2): cutoff 72 (warm / muted), resonance 10 (smooth). Env2 sweeps cutoff by 30 (peaks around 102) with a instant attack and fast decay.
- Amp envelope (Analogue): instant attack, moderate decay to 0, moderate release. Velocity-sensitive (45).
- Movement: essentially static (no LFO/random routes).
- Effects: Plate.
- Arpeggiator: played, progression serial, swing 40 (host-synced).
- Voicing: poly, 8 voices.
- Likely use: rhythmic arpeggio (hold chords).

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Osc 1 Waveform (Triple VCO morph) [OSC/Shape1] = 3.00; Volume 1 [OSC/Vol1] = 80.00; Osc 2 tune / detune [OSC/Tune2] = 24.00; Osc 2 Waveform (Triple VCO morph) [OSC/Shape2] = 3.00; Volume 2 [OSC/Vol2] = 30.00; FM 1->2/3 / Cross Mod [OSC/FM] = 12.00
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 72.00; Resonance / Emphasis / Peak [VCF1/Res] = 10.00; Key follow (KYBD) [VCF1/KeyScl] = 55.00; Multimode type [VCF1/SvfMode] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 30.00
- **Envelope 1:** Decay [ENV1/Dec] = 24.00; Sustain [ENV1/Sus] = 0.00; Release [ENV1/Rel] = 22.00; Velocity [ENV1/Vel] = 45.00
- **Envelope 2:** Decay [ENV2/Dec] = 10.00; Release [ENV2/Rel] = 8.00; Velocity [ENV2/Vel] = 40.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 5
- **Main:** Output (main volume) [main/CcOp] = 78.00
- **Arpeggiator:** Arp On/Off [ARP/OnOff] = 1; Arp Mode / Direction [ARP/Dir] = 0; Clock Swing [CLK/Swing] = 40.00
- **Effects:** FX1 type [FX1/Module] = 'Plate1'; FX1 active [main/#FX1] = 1
- **Effects (FX1):** Plate PreDelay [Plate1/Pre] = 5.00; Plate Diffusion [Plate1/Diff] = 85.00; Plate Decay [Plate1/Decay] = 35.00; Plate Size [Plate1/Size] = 100.00; Plate Dry [Plate1/Dry] = 92.00; Plate Wet [Plate1/Wet] = 20.00

## BS Reese Classic

**Category:** Bass:Synth  
**Architecture:** Triple VCO -> Ladder  
**Description:** Classic Reese bass: two saws detuned ~18 cents beating against each other, sub-octave triangle, round ladder.  
**Usage:** Mono/legato. Hold long notes; the beating moves on its own. MW = open filter.  

### Sound concept

- **intent:** A powerful, slowly phasing Reese bass with solid sub.
- **spectral:** Triple VCO: saw osc1, saw osc2 +0.18 st (beating), triangle osc3 an octave down for the sub.
- **filtering:** Ladder 60, low resonance.
- **modulation:** ModWhl -> cutoff; drift 20.
- **architecture:** Triple VCO: two saws for the beat plus a dedicated sub oscillator.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Ladder.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~saw (+0 st), osc2 ~saw (+0.18 st), osc3 ~triangle (-12 st) (waveform names approximate). Mixer feedback 12 thickens the low end. Detune: osc2 detuned by ~18 cents -> chorusing/beating.
- Ladder filter, 4-pole 24 dB: cutoff 60 (warm / muted), resonance 15 (smooth). Env2 sweeps cutoff by 15 (peaks around 75) with a instant attack and slow decay.
- Amp envelope (Analogue): instant attack, sustains at 85, fast release.
- Movement: essentially static (no LFO/random routes).
- Performance control: ModWhl -> Cutoff (mod 2) (35).
- Effects: none (dry).
- Voicing: legato, 16 voices, glide 8.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Volume 1 [OSC/Vol1] = 75.00; Osc 2 tune / detune [OSC/Tune2] = 0.18; Volume 2 [OSC/Vol2] = 70.00; Osc 3 tune / detune [OSC/Tune3] = -12.00; Osc 3 Waveform (Triple VCO morph) [OSC/Shape3] = 3.00; Volume 3 / DCO Sub level [OSC/Vol3] = 45.00
- **High-pass / Feedback:** Feedback (post-filter -> mixer) [VCF1/Fback] = 12.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 60.00; Resonance / Emphasis / Peak [VCF1/Res] = 15.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Cutoff mod 1 amount [VCF1/FMDpt] = 15.00; Cutoff mod 2 source [VCF1/FM2Src] = 1; Cutoff mod 2 amount [VCF1/FM2Dpt] = 35.00
- **Envelope 1:** Sustain [ENV1/Sus] = 85.00; Release [ENV1/Rel] = 15.00; Velocity [ENV1/Vel] = 20.00
- **Envelope 2:** Decay [ENV2/Dec] = 40.00; Sustain [ENV2/Sus] = 30.00; Release [ENV2/Rel] = 15.00; Velocity [ENV2/Vel] = 20.00
- **Voice:** Voice Mode [VCC/Mode] = 2; Glide [VCC/Porta] = 8.00; Transpose [VCC/Trsp] = -12
- **Trimmers:** Voice Drift [OSC/Drift] = 20.00
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00

## BS Reese Wide

**Category:** Bass:Synth  
**Architecture:** Dual VCO -> Cascade  
**Description:** Wide Reese: detuned dual saws through a rough cascade with slow filter motion and a touch of dramatic chorus.  
**Usage:** Mono/legato. Keep the low end of your mix mono if needed.  

### Sound concept

- **intent:** A wider, more aggressive Reese for drops.
- **spectral:** Dual VCO saws, VCO2 +0.22 st; HPF = Feedback adds weight.
- **filtering:** Cascade rough, LFO2 slowly moves the cutoff.
- **space:** Dramatic chorus at 30% wet for width.
- **architecture:** Dual VCO + Cascade (rough): grit without harsh peaks.

### Parameter-derived description

- Synthesis: subtractive, Dual VCO -> Cascade.
- Dual VCO (Jupiter-style): VCO1 [saw] +0 st, VCO2 [saw] +0.22 st, mix 50. Detune: vco2 detuned by ~22 cents -> chorusing/beating.
- Cascade filter, 4-pole 24 dB: cutoff 62 (warm / muted), resonance 18 (classic analog emphasis). Env2 sweeps cutoff by 12 (peaks around 74) with a instant attack and slow decay. LFO2 moves cutoff (10).
- Amp envelope (Analogue): instant attack, sustains at 85, fast release.
- Movement: LFO2 -> Cutoff (mod 2) (10).
- Effects: Chorus (Dramatic).
- Voicing: legato, 16 voices, glide 6.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Osc 2 tune / detune [OSC/Tune2] = 0.22
- **High-pass / Feedback:** Feedback (post-filter -> mixer) [VCF1/Fback] = 15.00
- **Main filter:** Cutoff [VCF1/Freq] = 62.00; Resonance / Emphasis / Peak [VCF1/Res] = 18.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Cascade Rough/Clean [VCF1/LColor] = 0; Cutoff mod 1 amount [VCF1/FMDpt] = 12.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 10.00
- **Envelope 1:** Sustain [ENV1/Sus] = 85.00; Release [ENV1/Rel] = 15.00; Velocity [ENV1/Vel] = 20.00
- **Envelope 2:** Decay [ENV2/Dec] = 40.00; Sustain [ENV2/Sus] = 30.00; Release [ENV2/Rel] = 15.00; Velocity [ENV2/Vel] = 20.00
- **LFO 2:** Restart [LFO2/Trig] = 0; Rate (offset from Sync) [LFO2/Rate] = -1.50
- **Voice:** Voice Mode [VCC/Mode] = 2; Glide [VCC/Porta] = 6.00; Transpose [VCC/Trsp] = -12
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 70.00
- **Effects:** FX1 active [main/#FX1] = 1
- **Effects (FX1):** Chorus Type [Chrs1/Type] = 1; Chorus Rate [Chrs1/Rate] = 15.00; Chorus Depth [Chrs1/Depth] = 40.00; Chorus Wet [Chrs1/Wet] = 30.00

## BS Reese Growl

**Category:** Bass:Synth  
**Architecture:** Digital -> Bite  
**Description:** Growling digital Reese: Multisaw plus an octave-down saw into Bite Rev 2 with an LFO wobble on the mod wheel.  
**Usage:** Mono/legato. MW = wobble depth.  

### Sound concept

- **intent:** The heaviest bass in the bank: dense, growling, wobbling on demand.
- **spectral:** Digital Multisaw + sawtooth an octave down.
- **filtering:** Bite Rev 2, resonance 30 (kept moderate: Bite is level dependent).
- **modulation:** LFO2 -> cutoff mod 2, its depth on the mod wheel.
- **architecture:** Digital Multisaw is a ready-made detuned stack; Bite adds the growl.

### Parameter-derived description

- Synthesis: subtractive, Digital -> Bite.
- Digital (JP-8000-style): osc1 Multisaw, osc2 Sawtooth (-12 st), mix 40. Multisaw gives a dense supersaw-type spectrum.
- Bite filter, Rev 2: cutoff 58 (warm / muted), resonance 30 (classic analog emphasis). Env2 sweeps cutoff by 20 (peaks around 78) with a instant attack and moderate decay. LFO2 moves cutoff (22). HPF Pre at 32 trims the lows.
- Amp envelope (Analogue): instant attack, sustains at 85, fast release.
- Movement: LFO2 -> Cutoff (mod 2) (22).
- Performance control: ModWhl -> LFO2 depth (100).
- Effects: none (dry).
- Voicing: legato, 16 voices, glide 6.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 4; Digital osc 1 waveform [OSC/DgtlTp1] = 0; Osc 2 tune / detune [OSC/Tune2] = -12.00; Osc Mix (VCO1 <-> VCO2) [OSC/OscMix] = 40.00
- **High-pass / Feedback:** HPF / Feedback model [HPF/Model] = 2; HPF Frequency [HPF/Freq] = 32.00
- **Main filter:** Filter Model [VCF1/Model] = 3; Cutoff [VCF1/Freq] = 58.00; Resonance / Emphasis / Peak [VCF1/Res] = 30.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Bite revision [VCF1/SkRev] = 2; Cutoff mod 1 amount [VCF1/FMDpt] = 20.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 22.00
- **Envelope 1:** Sustain [ENV1/Sus] = 85.00; Release [ENV1/Rel] = 15.00; Velocity [ENV1/Vel] = 20.00
- **Envelope 2:** Decay [ENV2/Dec] = 35.00; Sustain [ENV2/Sus] = 25.00; Release [ENV2/Rel] = 15.00; Velocity [ENV2/Vel] = 25.00
- **LFO 2:** Rate (offset from Sync) [LFO2/Rate] = -0.50; Depth Mod source [LFO2/DMS1] = 1
- **Voice:** Voice Mode [VCC/Mode] = 2; Glide [VCC/Porta] = 6.00; Transpose [VCC/Trsp] = -12
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 36.00
- **Main:** Output (main volume) [main/CcOp] = 68.00

## BS Organic Thump

**Category:** Bass:Synth  
**Architecture:** DCO -> Ladder  
**Description:** Punchy organic-house bass: round DCO square and sub with a fast filter thump.  
**Usage:** Mono. Velocity = thump.  

### Sound concept

- **intent:** A short, round, punchy bass that grooves with organic-house percussion.
- **spectral:** DCO square + strong sub.
- **temporal:** Short decay, low sustain: plucked bass.
- **filtering:** Ladder with a strong, fast Env2 and velocity.
- **architecture:** DCO + Ladder: stable pitch and a round thump.

### Parameter-derived description

- Synthesis: subtractive, DCO -> Ladder.
- DCO (Juno-style single oscillator): pulse PWM pulse (reacts to PW), saw off, sub -1 oct shape 1 at 90.
- Ladder filter, 4-pole 24 dB: cutoff 46 (dark), resonance 22 (classic analog emphasis). Env2 sweeps cutoff by 50 (peaks around 96) with a instant attack and moderate decay.
- Amp envelope (Analogue): instant attack, moderate decay to 25, fast release.
- Movement: essentially static (no LFO/random routes).
- Effects: none (dry).
- Voicing: mono, 16 voices.
- Likely use: bass line.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 2; DCO Pulse selector [OSC/PWShp] = 3; DCO Sawtooth selector [OSC/SawShp] = 0; Volume 3 / DCO Sub level [OSC/Vol3] = 90.00
- **Main filter:** Filter Model [VCF1/Model] = 0; Cutoff [VCF1/Freq] = 46.00; Resonance / Emphasis / Peak [VCF1/Res] = 22.00; Key follow (KYBD) [VCF1/KeyScl] = 35.00; Cutoff mod 1 amount [VCF1/FMDpt] = 50.00
- **Envelope 1:** Decay [ENV1/Dec] = 30.00; Sustain [ENV1/Sus] = 25.00; Release [ENV1/Rel] = 12.00
- **Envelope 2:** Decay [ENV2/Dec] = 20.00; Release [ENV2/Rel] = 10.00; Velocity [ENV2/Vel] = 55.00
- **Voice:** Voice Mode [VCC/Mode] = 1; Transpose [VCC/Trsp] = -12
- **Main:** Output (main volume) [main/CcOp] = 76.00

## FX Tape Riser

**Category:** FX  
**Architecture:** Triple VCO -> Multimode  
**Description:** Riser for build-ups: noise and saws slowly sweep up in pitch and brightness while a wobble accelerates.  
**Usage:** Hold one note for several bars; release to stop. Velocity = intensity.  

### Sound concept

- **intent:** A tension riser for minimal / organic house build-ups.
- **spectral:** Triple VCO: two detuned saws + white noise.
- **temporal:** Very slow Env1/Env2 attacks (duration in seconds is undocumented, judge by ear).
- **filtering:** Multimode LP2; Env2 opens the cutoff (+60).
- **modulation:** Env2 -> pitch of all three oscillators (+12, depth unit unconfirmed) and -> cutoff; LFO2 -> cutoff with its rate pushed up by Env2 (accelerating wobble).
- **space:** Long tape delay -> large plate.
- **architecture:** Triple VCO: per-oscillator tune-mod switches allow a whole-patch pitch rise.

### Parameter-derived description

- Synthesis: subtractive, Triple VCO -> Multimode.
- Triple VCO (Minimoog-style morphing oscillators): osc1 ~saw (+0 st), osc2 ~saw (+0.15 st) (waveform names approximate). white noise at 50. Detune: osc2 detuned by ~15 cents -> chorusing/beating.
- Multimode filter (LP2): cutoff 55 (dark), resonance 25 (classic analog emphasis). Env2 sweeps cutoff by 60 (peaks around 115) with a very slow attack and very slow decay. LFO2 moves cutoff (12).
- Amp envelope (Analogue): very slow attack, sustains at 100, slow release. Velocity-sensitive (40).
- Movement: LFO2 -> Cutoff (mod 2) (12).
- Effects: Delay -> Plate.
- Voicing: poly, 4 voices.
- Likely use: effect / transition.

_Inferred from parameter values only. The preset was NOT listened to and no audio analysis was performed._

### Parameters set (relative to the init template)

- **Oscillators:** Oscillator Model [OSC/Model] = 0; Volume 1 [OSC/Vol1] = 60.00; Osc 2 tune / detune [OSC/Tune2] = 0.15; Volume 2 [OSC/Vol2] = 55.00; Noise volume [OSC/Noise] = 50.00; Noise colour [OSC/NoiseC] = 1; Tune mod on osc 1 [OSC/TM1On] = 1; Tune mod on osc 2 [OSC/TM2On] = 1; Tune mod on osc 3 [OSC/TM3On] = 1; Tune Mod 1 depth [OSC/TM1Dpt] = 12.00
- **Main filter:** Filter Model [VCF1/Model] = 2; Cutoff [VCF1/Freq] = 55.00; Resonance / Emphasis / Peak [VCF1/Res] = 25.00; Key follow (KYBD) [VCF1/KeyScl] = 30.00; Multimode type [VCF1/SvfMode] = 1; Cutoff mod 1 amount [VCF1/FMDpt] = 60.00; Cutoff mod 2 amount [VCF1/FM2Dpt] = 12.00
- **Envelope 1:** Attack [ENV1/Atk] = 85.00; Decay [ENV1/Dec] = 80.00; Release [ENV1/Rel] = 50.00; Velocity [ENV1/Vel] = 40.00
- **Envelope 2:** Attack [ENV2/Atk] = 92.00; Decay [ENV2/Dec] = 80.00; Sustain [ENV2/Sus] = 100.00; Release [ENV2/Rel] = 50.00; Velocity [ENV2/Vel] = 40.00
- **LFO 2:** Rate (offset from Sync) [LFO2/Rate] = -1.00; Rate Mod source [LFO2/FMS1] = 15; Rate Mod amount [LFO2/FMD1] = 4.00
- **Voice:** Voices (polyphony) [VCC/Voices] = 2
- **Amplifier:** Volume (VCA gain) [VCA1/Vol] = 38.00
- **Main:** Output (main volume) [main/CcOp] = 68.00
- **Effects:** FX1 type [FX1/Module] = 'Delay1'; FX1 active [main/#FX1] = 1; FX2 type [FX2/Module] = 'Plate2'; FX2 active [main/#FX2] = 1
- **Effects (FX1):** Delay Left time [Delay1/LDel] = 4.00; Delay Center time (= feedback time) [Delay1/CDel] = 6.00; Delay Right time [Delay1/RDel] = 8.00; Delay Side Vol [Delay1/SVol] = 35.00; Delay Center Vol [Delay1/CVol] = 10.00; Delay Feedback [Delay1/FeedB] = 45.00; Delay HP (feedback path) [Delay1/HP] = 35.00; Delay LP (feedback path) [Delay1/LP] = 60.00; Delay Wow (tape wobble) [Delay1/Wow] = 30.00
- **Effects (FX2):** Plate PreDelay [Plate2/Pre] = 20.00; Plate Diffusion [Plate2/Diff] = 95.00; Plate Damp [Plate2/Damp] = 70.00; Plate Decay [Plate2/Decay] = 70.00; Plate Size [Plate2/Size] = 180.00; Plate Dry [Plate2/Dry] = 88.00; Plate Wet [Plate2/Wet] = 30.00

