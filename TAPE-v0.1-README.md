# TAPE LAB / v0.1 Audio Foundation

**Status:** committed to a feature branch; iPad build and runtime have NOT been verified.

## Quick start — copying into Swift Playgrounds on iPad

1. Create a **new App Playground** (leave the previously working app untouched).
2. Open the app's existing Swift file and **replace the entire file contents** with [TapeLab.swift](TapeLab.swift).
3. If another `@main` App exists, remove that **duplicate entry point**. There must be exactly one `@main`.
4. Run the app on iPad.
5. Tap IMPORT and choose a short WAV or M4A file from Files.
6. Test PLAY, PAUSE, STOP, waveform display, and seeking by dragging on the waveform.

The Playgrounds app created in step 1 already contains project metadata: **you do not need to copy Package.swift** for this workflow.

## Functional scope

- Audio-file import to the app's Documents directory with security-scoped access.
- Real audio playback through AVAudioPlayer.
- Visible waveform derived from PCM samples.
- Touch seeking; interaction pauses playback, resume is manual.
- Restores the last imported file at next launch.

## Explicit non-features

Dragging does **not** play audible scrubbed audio or reverse the tape in this version. There is no varispeed, microphone, slices, FX, DRUM or FM yet.

## Test report required before proceeding to v0.2

Confirm (1) compilation, (2) audio import, (3) audible playback, (4) pause/resume, (5) waveform, (6) touch seek. Record any compiler message in full.

## Source

The one-file SwiftUI entry point is [TapeLab.swift](TapeLab.swift). `Package.swift` is a reference manifest for a Swift Playgrounds app package, not required when pasting into an existing App Playground.
