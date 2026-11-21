# Test Report

Date: 2026-11-21 · Environment: Linux container, Node.js 22.23, Claude Code CLI · **No u-he Diva installation available.**

## Summary

| Level | Result |
|---|---|
| Automated tests (`npm test`) | **69 / 69 passed** (5 files) |
| Extended corpus run (`DIVA_TEST_PRESETS_DIR` = 55 real presets) | **124 / 124 passed** |
| Structural validation of all 55 reference presets (`cli validate`) | **55 / 55 passed** |
| Claude Code integration | **passed** — `claude mcp get diva-mcp` → `✓ Connected`; a headless `claude -p` session called `get_library_info`, `generate_preset`, `validate_preset` and received a valid preset |
| PLUIT — DIVA LAB VOL. 01 | **5 / 5 created**, structural validation passed, bit-identical on regeneration |
| **Diva load test** | **NOT RUN** — Diva is not installed here and no safe automated loader exists |
| **Audio verification** | **NOT RUN** — no audio rendering |

## Tests by requirement

| # | Requirement | File | What is checked | Result |
|---|---|---|---|---|
| 1 | Read | `tests/parser.test.ts` | metadata, header, `#ms` occurrences, known params, binary detection, older 402-line layout, structured analysis (model names, mod routes, Triple VCO HPF inactive) | ✅ |
| 2 | Round-trip | `tests/parser.test.ts` | parse → serialize is **byte-identical**; re-parse gives identical params, meta and binary tail; CRLF and footer-less files; one edit = exactly one changed line. Runs on the 3 fixtures and on every file in `DIVA_TEST_PRESETS_DIR` | ✅ (3 + 55 files) |
| 3 | Parameter editing | `tests/edit.test.ts` | edit `VCF1/Res`: original file hash unchanged, new `… v2.h2p`, all other params equal, only one line differs, binary block preserved; relative edits + clamping + version increments; partial-spec ("musical") edits touch only 3 params; rejects out-of-range, unknown ids, global params, invalid enums, incompatible controls, params absent from older layouts; warning for inactive-module edits; overwrite creates backup; factory folder is never written | ✅ |
| 4 | Sound architecture | `tests/architecture.test.ts` | all **5 oscillator × 5 filter = 25** combinations build, validate and only write parameters active for the chosen models; 14 incompatible specs are rejected (PWM on Triple VCO, HPF with Triple VCO, shape mod on DCO, Uhbie mod on Ladder, multimode mode on Cascade, filter FM on Bite, release on ADS, Q on Analogue, feedback with HPF Pre, HPF resonance on Pre, unknown source, out-of-range cutoff, invalid voice count, unknown field); mod-slot and FX mapping; determinism; UTF-8 metadata | ✅ |
| 5 | Bank generation | `tests/bank.test.ts` | 5-preset bank with 5 different architectures, each file re-validated, README + report + ZIP (contents verified); failing spec does not stop the batch; unique names; no silent overwrite; refuses to guess an output folder without a Diva install; uses `<user presets>/diva-mcp` when present | ✅ |
| 6 | MCP integration | `tests/mcp.test.ts` | spawns the real stdio server through the MCP SDK client: 10 tools listed, `list_parameters` filtering, generate → analyze → describe → validate → edit, tool errors for invalid specs (nothing written), read-only search, `generate_bank` | ✅ |
| 6b | Claude Code | manual | `claude mcp add --scope local diva-mcp -- node dist/src/mcp/server.js`; `claude mcp get` → Connected; `claude -p` called 3 tools successfully | ✅ |
| 7 | Diva compatibility | `tests/mcp.test.ts` | asserts that `diva_load_test` and `audio_verification` are always `not_run` | ✅ (honesty check). **Real-Diva test still required.** |

## Reference corpus

| Source | Files | Licence / use |
|---|---|---|
| Fannon/u-he-preset-randomizer "Diva Generated Vol. 1" | 50 | MIT; 3 copied as fixtures |
| instatetragrammaton/Patches (saved by Diva 16519) | 4 | no licence — analysed locally only, not redistributed |
| maudgrol/deepdiva `MS-Rev1_deepdiva.h2p` (factory patch) | 1 | analysed locally only, not redistributed |

## PLUIT — DIVA LAB VOL. 01

Folder: `banks/PLUIT - DIVA LAB VOL. 01/` · archive: `banks/PLUIT - DIVA LAB VOL. 01.zip` · spec: `banks/specs/pluit-diva-lab-vol-01.json`

| Preset | Architecture | Key ideas | Structural | Diva load | Audio |
|---|---|---|---|---|---|
| PD Analog Memories | Dual VCO → Cascade | 2 saws +0.08 st, slow swell, drift 70, per-voice detune, LFO1 random-glide vibrato, chorus → plate | passed | not run | not run |
| BS Deep Current | Triple VCO → Ladder | saw + detuned square + sub-octave triangle, mixer feedback, Env2 +48, MW → cutoff, mono, dry | passed | not run | not run |
| KY Faded Piano | DCO → Multimode LP4 | PW-reactive pulse 30 %, HPF Pre, digital envelopes with curve, velocity → cutoff, random pan, chorus → plate | passed | not run | not run |
| PL Distant Echo | Digital → Uhbie | triangle + octave saw, short Env2 snap, tape-wow delay → large plate | passed | not run | not run |
| LD Northern Light | Triple VCO → Bite Rev 2 | MW-controlled delayed vibrato, aftertouch → cutoff, legato glide, delay → plate | passed | not run | not run |

Per-preset parameter lists and parameter-derived descriptions are in the bank's `README.md` and `bank_report.json`.

The metadata uses the ASCII name "PLUIT - DIVA LAB VOL. 01" (hyphen instead of em dash) to avoid encoding issues in Diva's browser and file systems.

## Unconfirmed features (verify in Diva)

1. **Loading of generated text-only presets in Diva** — expected to work (same form as randomizer default output and deepdiva), not verified here.
2. **Edits of presets that contain the binary block** — the block is preserved; that Diva prefers the edited text values over it is assumed, not verified.
3. Raw-value semantics with **low confidence** (see `docs/PARAMETER_SCHEMA.md`):
   - Dual VCO Eco waveform positions (`OSC/Wave1/2`), ring switch (`OSC/RMPwm`);
   - Digital oscillator per-wave knobs (`OSC/DgtlSp2..4`) and waveform order (`OSC/DgtlTp1/2`);
   - DCO pulse/saw/sub shape order beyond "0 = off, 3 = PW-reactive";
   - LFO `Sync` tempo divisions (0..23) and which negative value is slowest;
   - Voice Stack (`VCC/Voicing`) value → stack count; Stack Tune (`VCC/Vc1..8`);
   - pole switch polarity (`VCF1/LMode`), Rough/Clean polarity (`VCF1/LColor`), Multimode order (`VCF1/SvfMode`), chorus/phaser/rotary type order, Transient Mode order;
   - whether `OSC/Tune2/3` are relative to osc 1's octave switch (avoided by keeping osc 1 at octave 0).
4. Envelope/LFO times and cutoff in physical units — not published by u-he, never converted.
5. Linux default preset paths — guessed, not documented by u-he.
6. 45 parameters (mostly PCore/OPT/UI internals) have unknown meaning; they are preserved verbatim and never written.

## How to run the real-Diva test

1. Copy `banks/PLUIT - DIVA LAB VOL. 01/` into your Diva user preset folder (or unzip the archive there).
2. In Diva: preset browser → *Refresh*; load each preset.
3. Check: loads without error; oscillator/filter models match the table above; FX slots as described; play and judge.
4. Optionally run `node dist/src/cli.js validate <file>` on any preset Diva re-saves and compare with `analyze`.
5. Report any preset that fails to load — together with the file — so the template or mapping can be corrected.
