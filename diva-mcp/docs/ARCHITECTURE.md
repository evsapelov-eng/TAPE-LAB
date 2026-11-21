# Architecture

## 1. Research findings (Phase 1)

### Reference projects

| Project | Licence | What we learned | Reused? |
|---|---|---|---|
| [Fannon/u-he-preset-randomizer](https://github.com/Fannon/u-he-preset-randomizer) | MIT | `.h2p` layout (meta block, `#cm=` sections, `#ms` list, binary footer), install-path detection, MCP server in TypeScript, text-only presets work without the binary block (its default mode) | Concepts only. Its `src/parser.ts` is **not lossless** (re-formats meta, converts `"1.50"` to `1.5`, drops blank lines, regenerates the footer), so a new lossless parser was written. Three MIT presets from its soundset are used as test fixtures. |
| [Celian-mrc/serum-mcp](https://github.com/Celian-mrc/serum-mcp) | MIT | Tool set and separation "LLM reasons → structured spec → mapping → packer", confidence-annotated parameter schema, refusing to claim real-plugin tests | Architecture pattern only (Python, different format). |
| [maudgrol/deepdiva](https://github.com/maudgrol/deepdiva) | MIT | Mapping of Diva's 281 VST parameters to `.h2p` tags with value ranges; writes text-only presets that are loaded into Diva | Facts (index ↔ tag ↔ range), parsed statically from its source. |
| acids-ircam/flow_synthesizer `diva_params.txt` | – | Official VST automation names for all 281 parameters (e.g. `OSC: Vibrato` = `VtoD`) | Names as facts. |
| [pcmbs/synth-proxy](https://github.com/pcmbs/synth-proxy) | – | Which oscillator/filter model uses which parameter, cardinalities (built on the real plugin via DawDreamer) | Facts, cross-checked. |
| instatetragrammaton/Patches | no licence | 4 hand-made patches **saved by Diva build 16519** — the authoritative current text layout (401 lines) | Read for analysis only (key order / statistics). Not redistributed. |
| Diva User Guide v1.4.8 | u-he | Modules, controls, option order, fixed modulation design, default folders | Source of truth for semantics. |

### Corrections to third-party documentation

The Diva skill file shipped with u-he-preset-randomizer states that `OSC/Model` is 1-based (1 = Triple VCO … 5 = Digital) and that `VtoD` is an octave bitmask. Real files contradict both:

- `OSC/Model`, `VCF1/Model` take values **0–4**; the factory patch *MS-REV1* (an MS-20 emulation) has `OSC/Model=3` (Dual VCO Eco), `HPF/Model=3` (HPF Bite), `VCF1/Model=3` (Bite) with `SkRev=1` — matching a 0-based UI order.
- `VtoD` is the VST parameter "OSC: Vibrato" (LFO1 → pitch amount), not an octave switch.
- `Shape1..3` (range 1–9) are the Triple VCO waveforms; `Wave1/Wave2` are the Dual VCO Eco selectors.

### Corpus

55 real `.h2p` files were analysed (`schemas/sources/observed_stats.json` keeps only aggregates). Four parameter layouts exist:

| Lines | Files | Origin |
|---|---|---|
| 421 | 45 | randomizer output (PCore Rev 15152, extra PCore/MPE/OPT keys) |
| 402 / 404 | 6 | older Diva builds (Rev 9709–12092) |
| 401 | 4 | **Diva build 16519** (current) — used for the init template |

All 50 files saved by Diva or by `--binary` mode carry the compressed binary block; files written by randomizer's default mode and by deepdiva have none.

## 2. The `.h2p` format

```
/*@Meta                 <- meta block: "Key:\n'value'\n\n" (Bank, Author, Description, Usage,
Bank:                      Categories, Features, Character)
'…'
*/
#AM=Diva                <- header
#Vers=10001
#Endian=little
#nm=24
#ms=none … #ms=Multiply <- 24 modulation sources; every *Src parameter is an index into this list
#nv=2 / #mv=…
#cm=main                <- section marker; following lines belong to "main"
CcOp=100.00
#cm=PCore … #cm=Rtary2  <- ~30 sections
// Section for ugly compressed binary Data
// DON'T TOUCH THIS
$$$$2100 ?… =121639\0\0  <- optional opaque binary block (ends with NUL bytes)
```

Parameter id used everywhere in diva-mcp: `SECTION/Key` (e.g. `VCF1/Freq`); repeated keys get `#n` (`HEAD/#ms#17` = `LFO2`). Floats are written with two decimals (`73.00`) as Diva does; integers plainly; FX modules as quoted strings (`'Delay1'`).

### Lossless model (`src/h2p/parser.ts`)

The file is decoded as **latin1** so every byte maps to one character, and split into:

1. `pre` — everything up to the end of the meta block (kept verbatim unless metadata is changed),
2. `lines` — body lines split on `\n` (CR kept), each either a raw line or `{section, key, value, occurrence}`,
3. `tail` — from the binary marker to EOF, verbatim (including NULs).

`serialize(parse(x)) === x` for every input (tested on all 55 files, CRLF variants and files without meta/footer). Edits replace only the value substring of the targeted lines; unknown keys, ordering, blank lines and the binary block are untouched.

### Binary block policy

- **Edits** keep the binary block byte-for-byte. Text changes are expected to win (the randomizer's binary mode depends on this), but that is unverified here, so a warning is attached.
- **New presets** are text-only (no payload after the marker) — the format produced by randomizer's default mode and by deepdiva, both reported to load in Diva. They are built from `templates/diva-init.h2p`, which uses the build-16519 key order with diva-mcp's own init values (global/UI keys take the corpus' most common value).

## 3. Three-layer design

```
┌──────────────────────────────┐   Claude (no LLM in the server)
│ 1. Sound Design Reasoning    │   src/design/guide.ts  -> get_sound_design_guide
│    concept, architecture     │   PresetSpec.concept (stored in README/report)
└──────────────┬───────────────┘
               │ PresetSpec (zod, src/engine/spec.ts)
┌──────────────▼───────────────┐
│ 2. Parameter Mapping         │   src/engine/mapping.ts
│    spec -> {SECTION/Key: v}  │   model compatibility, fixed mod slots, enums,
│    + validation              │   ranges from src/schema (diva_parameters.json)
└──────────────┬───────────────┘
               │ Change[]
┌──────────────▼───────────────┐
│ 3. Preset Serialization      │   src/engine/preset.ts + src/h2p/parser.ts
│    template/doc -> .h2p      │   formatting, meta, lossless write, validation
└──────────────────────────────┘
```

Other components:

| Path | Role |
|---|---|
| `src/schema/curation.ts` | hand-curated knowledge with sources and confidence |
| `scripts/collect-observations.ts`, `scripts/build-schema.ts` | build `schemas/diva_parameters.json`, `docs/PARAMETER_SCHEMA.md`, `templates/diva-init.h2p` |
| `src/schema/schema.ts` | runtime schema lookup, value checks, formatting, compatibility |
| `src/engine/analyze.ts`, `describe.ts` | structured analysis and parameter-derived musical description |
| `src/engine/validate.ts` | structural validation with 3 separate result levels |
| `src/engine/operations.ts` | generate / edit / bank / read-only operations (shared by MCP and CLI) |
| `src/library/paths.ts`, `safety.ts`, `search.ts` | install detection, write guards + backups, reference search |
| `src/mcp/server.ts` | MCP stdio server (10 tools) |
| `src/cli.ts` | command line |

### Determinism

`buildPreset(spec)` is a pure function of the spec and the template: no timestamps, random numbers or environment data enter the file. The bank ZIP uses a fixed mtime.

### Compatibility enforcement

Every parameter in the schema can carry `oscillator_models`, `filter_models`, `hpf_models`, `envelope_models`. The mapper errors when a spec asks for a control or modulation slot that is inactive for the chosen models (e.g. `modulation.pulse_width` with Triple VCO, `hpf` with Triple VCO, `filter.mode` outside Multimode, `env.release` with ADS, feedback without Triple VCO / HPF=Feedback). A final sweep re-checks every written parameter.

### Diva's modulation design

Diva has no free modulation matrix. diva-mcp models exactly the fixed slots (cutoff ×2, resonance, filter FM, feedback, Uhbie mix, HPF cutoff, tune mod ×2, vibrato, PWM, shape, FM depth, noise/mix, VCA, pan, LFO depth/rate, plus 6 modulation processors). See `list_parameters().modulation_slots`.
