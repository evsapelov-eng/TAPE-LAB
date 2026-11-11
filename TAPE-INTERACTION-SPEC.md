# TAPE LAB — Interaction Specification
Status: design approved for exploration, NOT implemented. Date: 2026-11-11.

## Product
A tactile hybrid instrument: tape transport + 16-slice sampler + live looper/delay. All input must produce real audio changes; no decorative playback illusions.

## Modes
### TAPE — gesture-driven transport
- Finger down on waveform: suspend automatic transport; capture contact position.
- Horizontal **movement** (delta over time), not merely absolute finger position, controls instantaneous signed tape velocity. Right = forward; left = reverse.
- Signed velocity 0 means stationary head/silence or appropriately damped hold (avoid repeating a single sample as DC).
- Pitch follows playback rate (varispeed/tape behavior), rather than independent time-stretch.
- On finger release: return to paused state; user presses PLAY to resume. Do not silently restart.
- Smooth transitions: rate smoothing and short gain ramp/crossfade prevent clicks.
- Onscreen cursor reflects read position, clamped to valid frame bounds.

### SLICE — 16 performance pads
- Default 16 equal-time slices, adjustable boundaries in later version.
- Tap: one-shot trigger, press-and-hold: loop; optionally toggle persistent loop.
- Per-slice forward/reverse, playback speed, probability and loop length (later).
- Allow polyphony eventually; start monophonic to avoid CPU spikes and keep semantics clear.

### LOOP / DELAY — performance effects
- Capture/loop current window, feedback delay (with stability-limited feedback), tape-rate color.
- Filter, saturation and wow/flutter to follow after a functioning DSP transport.
- Avoid any layout that feels like skeuomorphic hardware.

## Audio architecture
- The working v0.1 uses AVAudioPlayer and a waveform view, verified by user on iPad.
- v0.2 proof-of-audio: AVAudioEngine + AVAudioPlayerNode, schedule real file segments for slice playback. Preserve original v0.1.
- v0.3 genuine bidirectional scrub: PCM sample reader with signed fractional phase and interpolated read; reverse cannot be implemented with AVAudioPlayer.currentTime seeking alone.
- v0.4 add looping with click-free boundary crossfade and simple feedback delay; manage ring buffer / CPU budget.
- v0.5 gesture mapping and performance tuning.
- For long audio, use bounded buffers or disk streaming, not unbounded memory allocation.
- Record actual device tests after each version.

## Evidence-based references
- Apple AVAudioPlayerNode scheduling file segments: https://developer.apple.com/documentation/avfaudio/avaudioplayernode/schedulesegment(_:startingframe:framecount:at:completionhandler:)
- Apple AVAudioPlayerNode buffers: https://developer.apple.com/documentation/avfaudio/avaudioplayernode
- Apple AVAudioUnitVarispeed: https://developer.apple.com/documentation/avfaudio/avaudiounitvarispeed
- Apple AVAudioUnitTimePitch: https://developer.apple.com/documentation/avfaudio/avaudiounittimepitch

## Acceptance criteria, first audio milestone
1. Previously working import and normal playback remain available.
2. A slice press audibly starts a chosen segment; different pads play visibly different parts of source recording.
3. Release/pause/stop reliably silence audio.
4. No Swift Playgrounds compile errors on target iPad.
5. No claims of validated playback before user confirmation.

## Unresolved UX decisions
- Gesture physicality (delta-to-velocity scaling, maximum signed velocity, dead zone).
- One-shot versus held looping per slice; model as configurable later.
- Delay range and sync once MASTER transport exists.

## Waveform authenticity and musical play (revision 2026-11-11)
- Every slice card draws its own actual source-audio interval, never repeats an illustrative waveform. Keep a shared sample-frame coordinate system for playback and drawing.
- Precompute multiresolution min/max amplitude buckets; use sufficiently high resolution for each slice and zoom. Retain quiet passages, transients and channel peaks; do not fabricate bars. The compact image is an accurate *downsampled envelope*, not literally every individual sample. Zoom allows sample-level inspection when feasible.
- Slice borders map to exact PCM frame intervals [startFrame, endFrame), and any re-cut triggers an envelope update for that interval.
- At 16 pads, a 4x4 grid is the performance view; tapping a pad plays its own region. Long press loops that region. Enter edit/zoom mode to change boundaries; avoid conflicting editing and performing gestures.
- In TAPE mode, short drag motions create signed sample-read velocity for audible vinyl-like scratching, with direction changes and interpolation; no audio illusion from seek alone.
- Make TAPE and SLICE gesture maps distinct, so vertical movement has no ambiguous action. FINE/WIDE sensitivity for precise scratch or travel.
- LOOP mode: a captured fragment can repeat and pass into a feedback delay with stability cap. Keep scratch independent of delay tail, and provide an immediate kill/reset control for runaway feedback.
- Performance strategy: one-shots -> held loops -> scratch per-slice in an explicit SCRATCH modifier -> delay send; later add mutations.
- For UI waveforms, consider min/max multi-resolution approach demonstrated by MetalWaveformKit, https://github.com/masaconm/MetalWaveformKit. Its demo visualizes waveforms but is not a playable audio engine.
- For signed tape playback, investigate AVAudioSourceNode PCM render block, https://developer.apple.com/documentation/avfaudio/avaudiosourcenode/init(format:renderblock:). Keep render callback lock-free, allocation-free and nonblocking.
- Avoid claiming sample-accurate whole-audio representation on a tiny screen: each pixel summarizes a range of real samples; higher zoom exposes more detail.
