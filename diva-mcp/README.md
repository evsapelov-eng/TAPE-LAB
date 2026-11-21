# diva-mcp — AI Sound Designer for u-he Diva

Local [MCP](https://modelcontextprotocol.io) server that lets **Claude Code** create, edit, analyse and validate real **u-he Diva** presets (`.h2p`).

```
You:    Создай тёплый аналоговый пэд в эстетике Kiasmos, с двумя слегка
        расстроенными осцилляторами, медленной атакой и мягким фильтром.
Claude: get_sound_design_guide("pad") -> concept -> PresetSpec
        generate_preset(spec)  ->  …/Diva/diva-mcp/PD Kiasmos Haze.h2p
        Dual VCO (2 saws, +0.08 st) -> Cascade 74 / res 12, env1 attack 48 …
        Structural validation passed · Diva load test: not run · Audio: not run
```

The server contains **no LLM**. Claude does the sound-design reasoning; diva-mcp maps a structured `PresetSpec` onto Diva's real parameters, enforces model compatibility, and writes a byte-exact, lossless `.h2p`.

## Status

| Criterion | State |
|---|---|
| MCP server starts (stdio) | ✅ |
| Claude Code discovers and calls the tools | ✅ verified with `claude mcp get` (Connected) and a headless `claude -p` session calling 3 tools |
| Reads real Diva presets | ✅ 55 real files (3 shipped as fixtures) |
| Round-trip without changes | ✅ byte-identical on all 55 files |
| Edits change only requested parameters | ✅ (line-level check, binary block preserved) |
| New presets created + structurally valid | ✅ all 5 osc × 5 filter models |
| Bank generation (README, report, ZIP) | ✅ |
| Banks | PLUIT — DIVA LAB VOL. 01 v1.1 (5) and PLUIT — MINIMAL ANALOG VOL. 01 v1.1 (30) — see `banks/` |
| **Loaded in the real Diva plugin** | ✅ confirmed by the user for PLUIT — DIVA LAB VOL. 01 (all 5 load and play); new banks need the same check |
| Output level standard | Output 80 / VCA 42 by default + heuristic `level_check` (not a loudness measurement) |
| Audio verification | ❌ not performed (no rendering) |

See [docs/TEST_REPORT.md](docs/TEST_REPORT.md) for details and the list of unconfirmed features.

## Quick start

Requirements: Node.js ≥ 20, Claude Code.

```bash
cd diva-mcp
npm install
npm run build
npm test            # optional: 74 tests
```

Register with Claude Code (use the absolute path of your checkout):

```bash
claude mcp add diva-mcp -- node /ABSOLUTE/PATH/TO/diva-mcp/dist/src/mcp/server.js
claude mcp get diva-mcp        # should show: Status: ✓ Connected
```

Optional environment variables (`claude mcp add diva-mcp -e NAME=value -- node …`):

| Variable | Purpose |
|---|---|
| `DIVA_USER_PRESETS_DIR` | Your Diva **user** preset folder, if it is not in the default location |
| `DIVA_MCP_OUTPUT_DIR` | Write here instead of `<user presets>/diva-mcp` |
| `DIVA_FACTORY_PRESETS_DIR` | Factory ("local") preset folder — read for references, never written |
| `DIVA_REFERENCE_DIRS` | Extra folders for `find_reference_presets` (`:`/`;` separated) |
| `DIVA_PROTECTED_DIRS` | Extra folders diva-mcp must never write into |

Default locations (Diva User Guide 1.4.8): macOS user presets `~/Library/Audio/Presets/u-he/Diva/`, factory `/Library/Audio/Presets/u-he/Diva/`; Windows user presets `Documents\u-he\Diva.data\UserPresets\Diva\`, factory `Documents\u-he\Diva.data\Presets\Diva\`. Linux paths are not documented by u-he and are only guessed (`~/.u-he/Diva/…`). If no user folder is found, diva-mcp refuses to guess and asks for `DIVA_USER_PRESETS_DIR`/`DIVA_MCP_OUTPUT_DIR`. Full details: [docs/INSTALLATION.md](docs/INSTALLATION.md).

Then just ask Claude Code, e.g. *"Сделай плотный бас на Triple VCO с ladder-фильтром"* or *"Опиши пресет …/HS Greek Horn.h2p"* or *"Сделай атаку медленнее в этом пресете"*.

## Tools

| Tool | What it does |
|---|---|
| `list_parameters(module?, search?)` | Documented parameter schema: exact ids, labels, ranges, enums, defaults, model compatibility, confidence; models; `#ms` sources; fixed modulation slots |
| `analyze_preset(path)` | Structured analysis: osc/filter/HPF models, envelopes, LFOs, active modulation routes, FX, voice, metadata, unknown parameters |
| `describe_preset(path)` | Musical description inferred from parameters (explicitly *not* listened to) |
| `generate_preset(spec, subfolder?)` | Deterministic new preset from a `PresetSpec`, validated before writing |
| `edit_preset(path, changes)` | Raw (`{"VCF1/Res": {"add": -10}}`) or musical (partial spec) edits; writes `<name> v2.h2p` by default; preserves everything else byte-for-byte |
| `find_reference_presets(query)` | Read-only search by name/category/metadata/architecture |
| `validate_preset(path)` | Structural validation; reports `diva_load_test` and `audio_verification` separately as `not_run` |
| `generate_bank(specs, output_folder)` | Batch generation, unique names, per-file validation, error report, README, ZIP |
| `get_sound_design_guide(topic?)` | Workflow, architecture traits, archetypes, adjective lexicon |
| `get_library_info()` | Detected Diva folders, output folder, protected folders |

A command-line interface exposes the same operations: `node dist/src/cli.js <analyze|describe|validate|generate|edit|bank|find|info|serve> …`.

## PresetSpec (excerpt)

```json
{
  "meta": { "name": "PD Analog Memories", "categories": ["Pads:Analogue"] },
  "concept": { "intent": "warm, unstable tape-like pad", "architecture": "Dual VCO + Cascade" },
  "oscillator": { "model": "dual_vco", "osc1": { "saw": true }, "osc2": { "semitones": 0.08, "saw": true }, "mix": 45 },
  "filter": { "model": "cascade", "cutoff": 74, "resonance": 12, "key_follow": 35 },
  "env1": { "model": "analogue", "attack": 48, "sustain": 85, "release": 58 },
  "modulation": { "cutoff_1": { "source": "Env2", "amount": 18 }, "cutoff_2": { "source": "LFO2", "amount": 6 } },
  "trimmers": { "drift": 70 },
  "fx1": { "type": "chorus", "variant": "classic", "wet": 70 },
  "fx2": { "type": "plate", "decay": 62, "wet": 32 }
}
```

Values use Diva's own raw scales (mostly 0–100; cutoff 30–150). u-he does not publish the time/frequency curves, so diva-mcp does not invent conversions to seconds or Hz. Requesting a control that the chosen model does not have (e.g. PWM on Triple VCO, an HPF with Triple VCO, `release` on an ADS envelope, Uhbie mix modulation on a Ladder filter) is rejected with an explanation. Full field list: `generate_preset`'s input schema or [`src/engine/spec.ts`](src/engine/spec.ts).

## Safety

- Never writes into the factory library (detected local folders + `DIVA_PROTECTED_DIRS`); never deletes anything.
- New presets go to `<Diva user presets>/diva-mcp/…`; existing files are never overwritten unless `overwrite=true`, which first copies the old file to `.diva-mcp-backups/`.
- `edit_preset` writes a new version by default; editing a factory preset writes the copy into `diva-mcp/edits/`.
- `find_reference_presets`, `analyze_preset`, `describe_preset`, `validate_preset` are read-only.

## Documentation

- [docs/INSTALLATION.md](docs/INSTALLATION.md) — install, connect, configure, troubleshoot
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — research findings, `.h2p` format, three-layer design
- [docs/PARAMETER_SCHEMA.md](docs/PARAMETER_SCHEMA.md) — every parameter with sources and confidence (generated)
- [docs/SOUND_DESIGN_GUIDE.md](docs/SOUND_DESIGN_GUIDE.md) — how descriptions become patches
- [docs/TEST_REPORT.md](docs/TEST_REPORT.md) — what was tested, what is unconfirmed

## Credits and licence

MIT — see [LICENSE](LICENSE). Built after studying [Fannon/u-he-preset-randomizer](https://github.com/Fannon/u-he-preset-randomizer) (MIT) and [Celian-mrc/serum-mcp](https://github.com/Celian-mrc/serum-mcp) (MIT); no code was copied. Parameter facts were cross-checked with the Diva User Guide and the sources listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). u-he and Diva are trademarks of Heckmann Audio GmbH; this project is not affiliated with u-he.
