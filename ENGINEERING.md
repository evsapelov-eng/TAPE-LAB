# TAPE LAB — Engineering references and quality gate

Research baseline: 2026-11-11. These are references and design decisions, **not proof of an iPad build**.

## Authoritative references

- [Apple — Swift Playgrounds](https://developer.apple.com/documentation/swift-playgrounds): iPad App Playgrounds, diagnostics and app capabilities.
- [Apple — SwiftUI app life cycle](https://developer.apple.com/tutorials/swiftui/creating-and-combining-views): one `@main` app entry point, separate `ContentView`.
- [Apple — Adding source files in iPad Playgrounds](https://support.apple.com/guide/playgrounds-ipad/add-swift-files-images-and-swift-packages-itc18b7bce9d/ipados).
- [Apple — AVAudioFile](https://developer.apple.com/documentation/avfaudio/avaudiofile): decode audio into PCM buffers for waveform analysis.
- [AudioKit/Waveform](https://github.com/AudioKit/Waveform): an open-source waveform renderer with demo and tests; architectural reference only.
- [GRimAce11/WaveformKit](https://github.com/GRimAce11/WaveformKit): playback adapters, waveform summary, seeking and cache; architectural reference only.

## Rules for the next implementation

1. Use Swift/SwiftUI + AVFoundation (not Python) for the iPad app.
2. Maintain a paste-ready `ContentView.swift` that contains **no `@main`**; leave Playgrounds' generated app entry point in place. Avoid compiling a second `ContentView` into packaged examples.
3. Verify the actual source committed to GitHub can be fetched back and matches what was sent.
4. Distinguish **syntax review**, **iPadOS build**, and **on-device playback tests**. Never call a prototype working without the latter two.
5. Small progression: file import -> audible playback -> waveform -> touch seek -> audible forward/reverse scrubbing -> DSP/effects.
6. Keep `main` unchanged and preserve known-good snapshots.
7. Analyze long audio off the main thread and cap waveform sample memory/CPU costs before moving to production.
8. For tactile audible reverse scrubbing, `AVAudioPlayer.currentTime` alone is not an adequate final engine; evaluate `AVAudioEngine` and buffer scheduling or low-level sample playback.
9. Validate edge cases: unsupported formats, empty/corrupt audio, permission failures, silence, long recordings, device audio session changes and interruption.
10. When build diagnostics are unavailable on the iPad, minimize feature surface rather than claim the cause of the failure.

## Current observations

- The first large single-file prototype failed to build on the user's iPad; no diagnostic log was available.
- A `ContentView.swift` variant was made to eliminate the plausible duplicate `@main` issue. Its iPad build remains unverified.
- Treat these as hypotheses, not established root causes.
