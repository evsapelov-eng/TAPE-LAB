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
