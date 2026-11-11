# Reusable Skill — Native iPad Audio App Engineering

Version: 0.1 | Status: living engineering playbook, NOT an installed executable ChatGPT skill.

## Purpose
Reusable development practices for future iPad applications, beginning with TAPE LAB. Keep this file product-agnostic; maintain product requirements separately.

## Response contract with the product owner
- Communicate in Russian, succinctly; communicate only new information.
- No repeated summaries, speculative success claims, or instructions that assume the user codes.
- Provide direct GitHub links to complete copy-paste-ready source files.
- Any failure: diagnose before asking the user to retry; request details only when unavailable.
- Distinguish code review, actual compilation, and on-device testing.

## Research workflow (before nontrivial changes)
1. Consult current Apple primary documentation for Swift, SwiftUI, Swift Playgrounds and AVFoundation APIs; check target iPadOS availability.
2. Inspect maintained open-source examples for architecture and failure patterns, not for blind copying.
3. Check developer discussions to establish reproducible failure cases; avoid unverified forum advice.
4. Capture links, constraints and decisions in the repository; verify citations and API signatures before relying on them.

## Code and compatibility checks
1. Identify exact target: iPad Swift Playgrounds **App Playground** vs Xcode package; don't conflate their file layouts.
2. Preserve the user-created Playgrounds `@main` app entry point when delivering replacement `ContentView.swift`; one entry point only.
3. Keep commits small, reversible, and isolated on feature branches. Preserve known-good versions.
4. Review source for duplicate types, missing imports, actor isolation issues, API availability, unsafe force unwraps, and unbounded memory/CPU work.
5. Validate file import permissions, local persistence, unsupported formats, zero-length files and interruptions.
6. Audio-reactive UI must reflect real audio data and playback state; no decorative substitutes.
7. Run automated checks when infrastructure supports them. Never imply Linux/macOS syntax checks prove iPadOS compilation.
8. Fetch committed files from GitHub after a write to confirm content actually exists.
9. Ask for an iPad device test only after static review; record results as passed/failed/unverified.

## Audio-specific principles
- Prefer AVFoundation for native file playback and decoding; evaluate AVAudioEngine / custom PCM scheduling for variable-direction audible scrubbing.
- Distinguish a waveform renderer from actual audio transport.
- Plan for latency, click-free transitions, rate changes, looping boundaries and interruptions.
- Avoid memory-loading an entire recording just to draw the waveform; use bounded analysis or caching.

## Build/test evidence rubric
- **Code written:** only file creation verified.
- **Static-reviewed:** checked for likely compile/API errors; still not built.
- **Compiled:** a real compiler/build tool succeeded for the stated target.
- **Device-tested:** the owner confirmed runtime behavior on iPad.
- **Release-ready:** tests, edge cases, performance and packaging passed.

## Reference starting points
- Apple Swift Playgrounds: https://developer.apple.com/documentation/swift-playgrounds
- SwiftUI: https://developer.apple.com/documentation/swiftui
- AVFAudio: https://developer.apple.com/documentation/avfaudio
- AudioKit Waveform: https://github.com/AudioKit/Waveform

## Lessons learned
- 2026-11-11: Repository metadata indicating `push=true` did not prove write access; direct create-branch initially returned 403 until GitHub App installation was corrected.
- 2026-11-11: A Playgrounds app must not have duplicated `@main` entry points. Provide a paste-ready view separate from the app entry point.
- 2026-11-11: `Build Failed` without diagnostics does not establish a particular root cause; proposed changes remain hypotheses until device retest.
- 2026-11-11: A single-file prototype with audio, waveform, and UI has not yet been confirmed to compile on iPad. Reduce scope for the next verification cycle.

## Maintenance
After each confirmed bug or meaningful discovery, append: date, failure, root cause (or unknown), evidence, remedy, and regression check. Separate assumptions from verified findings. Future projects can copy this playbook and adapt it.
