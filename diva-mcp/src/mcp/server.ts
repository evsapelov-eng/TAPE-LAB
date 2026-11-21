#!/usr/bin/env node
/**
 * diva-mcp — MCP server (stdio) for designing u-he Diva presets.
 *
 * There is no LLM inside this server: the calling model does the sound-design
 * reasoning and passes a structured PresetSpec.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { loadSchema, packageRoot } from '../schema/schema.js';
import { PresetSpecZ } from '../engine/spec.js';
import { analyzePreset, describePreset, editPreset, generateBank, generatePreset, validatePreset, SpecError } from '../engine/operations.js';
import { findReferencePresets } from '../library/search.js';
import { detectDivaLocations, outputRoot } from '../library/paths.js';
import { soundDesignGuide } from '../design/guide.js';

const pkg = JSON.parse(fs.readFileSync(path.join(packageRoot(), 'package.json'), 'utf8'));

const INSTRUCTIONS = `diva-mcp creates, edits, analyses and validates u-he Diva (.h2p) presets.
You (the calling model) are the sound designer. Workflow:
1) Call get_sound_design_guide (optionally with a topic such as "pad", "bass", "tape") and form a sound concept.
2) Choose oscillator + filter models deliberately (Diva: Triple VCO, Dual VCO, DCO, Dual VCO Eco, Digital; Ladder, Cascade, Multimode, Bite, Uhbie).
3) Build a PresetSpec using only fields that exist (list_parameters shows ranges, enums, confidence and the FIXED modulation slots — Diva has no free mod matrix).
4) generate_preset(spec) — values use Diva's raw knob scales; unspecified fields keep the init template value. Keep oscillator 1 at octave 0 and use voice.transpose for register (osc2/osc3 tune semantics relative to osc1 are unconfirmed).
5) describe_preset / validate_preset to check. Never claim a preset was heard: no audio is rendered, and loading in Diva is not automated.
Edits: edit_preset writes a new versioned file by default and never touches the factory library.`;

const server = new McpServer({ name: 'diva-mcp', version: pkg.version }, { instructions: INSTRUCTIONS });

const ok = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] });
const fail = (e: unknown) => ({
  isError: true,
  content: [{ type: 'text' as const, text: e instanceof SpecError ? e.message : `Error: ${(e as Error).message ?? String(e)}` }],
});
const wrap = <A>(fn: (args: A) => unknown) => async (args: A) => {
  try {
    return ok(await fn(args));
  } catch (e) {
    return fail(e);
  }
};

server.registerTool(
  'list_parameters',
  {
    title: 'List Diva parameters',
    description:
      'Documented schema of Diva parameters: exact internal id (SECTION/Key), label, module, type, range, enum values, init default, model compatibility and confidence. Also returns model lists, the #ms modulation source list and Diva\'s fixed modulation slots. Filter by module (e.g. "Main filter", "Oscillators", "Envelope 1", "Effects (FX1)") or by id substring.',
    inputSchema: {
      module: z.string().optional().describe('Case-insensitive module filter'),
      search: z.string().optional().describe('Substring of id or label'),
      include_unknown: z.boolean().optional().describe('Include parameters whose meaning is unknown (default false)'),
      include_global: z.boolean().optional().describe('Include global/UI parameters (default false)'),
    },
    annotations: { readOnlyHint: true },
  },
  wrap(({ module, search, include_unknown, include_global }) => {
    const s = loadSchema();
    const params = s.parameters.filter(
      (p) =>
        (include_unknown || p.confidence !== 'unknown') &&
        (include_global || !p.global) &&
        (!module || p.module.toLowerCase().includes(module.toLowerCase())) &&
        (!search || p.id.toLowerCase().includes(search.toLowerCase()) || p.label.toLowerCase().includes(search.toLowerCase())),
    );
    return {
      count: params.length,
      modules: [...new Set(s.parameters.map((p) => p.module))],
      confidence_levels: s.confidence_levels,
      models: s.models,
      mod_sources: s.mod_sources,
      modulation_slots: s.modulation_slots,
      parameters: params.map((p) => ({
        id: p.id, label: p.label, module: p.module, vst_name: p.vst_name, type: p.type, min: p.min, max: p.max,
        enum: p.enum && Object.keys(p.enum).length <= 12 ? p.enum : p.enum ? 'mod source index (see mod_sources)' : null,
        default: p.default, compatibility: p.compatibility, unit: p.unit, confidence: p.confidence, notes: p.notes, warnings: p.warnings.length ? p.warnings : undefined,
      })),
    };
  }),
);

server.registerTool(
  'analyze_preset',
  {
    title: 'Analyze a Diva preset',
    description: 'Reads a .h2p file and returns a structured analysis: oscillator model and settings, HPF, filter, envelopes, LFOs, active modulation routes, effects, voice settings, metadata and unknown parameters. Read-only.',
    inputSchema: { path: z.string().describe('Path to a .h2p file') },
    annotations: { readOnlyHint: true },
  },
  wrap(({ path: p }) => analyzePreset(p)),
);

server.registerTool(
  'describe_preset',
  {
    title: 'Describe a Diva preset musically',
    description: 'Musically meaningful description inferred from parameter values (character, synthesis type, oscillators, filtering, envelopes, movement, effects, likely use). Explicitly not based on listening. Read-only.',
    inputSchema: { path: z.string() },
    annotations: { readOnlyHint: true },
  },
  wrap(({ path: p }) => describePreset(p)),
);

server.registerTool(
  'validate_preset',
  {
    title: 'Validate a Diva preset',
    description: 'Structural validation (header, #ms list, sections, value ranges/enums, module compatibility, FX sections, binary block preservation, re-read stability). Reports three separate levels: structural_validation, diva_load_test and audio_verification — the latter two are never claimed as passed because they cannot be run automatically here.',
    inputSchema: { path: z.string() },
    annotations: { readOnlyHint: true },
  },
  wrap(({ path: p }) => validatePreset(p)),
);

server.registerTool(
  'generate_preset',
  {
    title: 'Generate a new Diva preset',
    description:
      'Creates a new .h2p from a structured PresetSpec (deterministic: same spec -> identical file). All values are validated against the schema and model compatibility before writing; requesting a control or modulation slot that does not exist for the chosen model is an error. Output goes to <Diva user presets>/diva-mcp/<subfolder> (detected from the real installation; override with DIVA_MCP_OUTPUT_DIR). Existing files are never overwritten unless overwrite=true (then a backup is made).',
    inputSchema: {
      spec: PresetSpecZ,
      subfolder: z.string().optional().describe('Subfolder inside the diva-mcp output folder'),
      overwrite: z.boolean().optional(),
      dry_run: z.boolean().optional().describe('Validate and report without writing'),
    },
  },
  wrap(({ spec, subfolder, overwrite, dry_run }) => generatePreset(spec, { subfolder, overwrite, dryRun: dry_run })),
);

server.registerTool(
  'edit_preset',
  {
    title: 'Edit an existing Diva preset',
    description:
      'Changes only the requested parameters and preserves everything else byte-for-byte (unknown parameters, ordering, binary block). changes.params: {"VCF1/Res": 20 | {"add": -10} | {"scale": 0.5} | {"set": 30}}. changes.spec: a partial PresetSpec (include oscillator.model / filter.model when touching those sections). By default a new versioned file "<name> v2.h2p" is written next to the original (or into diva-mcp/edits if the original is in the factory library). overwrite=true replaces the source after making a backup.',
    inputSchema: {
      path: z.string(),
      changes: z.object({
        params: z.record(z.string(), z.union([z.number(), z.string(), z.object({ add: z.number() }), z.object({ scale: z.number() }), z.object({ set: z.union([z.number(), z.string()]) })])).optional(),
        spec: PresetSpecZ.optional(),
      }),
      output_path: z.string().optional(),
      overwrite: z.boolean().optional(),
      dry_run: z.boolean().optional(),
    },
  },
  wrap(({ path: p, changes, output_path, overwrite, dry_run }) => editPreset(p, changes, { outputPath: output_path, overwrite, dryRun: dry_run })),
);

server.registerTool(
  'find_reference_presets',
  {
    title: 'Find reference presets',
    description: 'Searches existing Diva presets (detected user + factory folders, DIVA_REFERENCE_DIRS, or given dirs) by name, category, metadata and extracted architecture (oscillator/filter model, voice mode, attack, brightness). Read-only — found presets are never modified.',
    inputSchema: {
      query: z.string(),
      dirs: z.array(z.string()).optional(),
      limit: z.number().int().min(1).max(200).optional(),
    },
    annotations: { readOnlyHint: true },
  },
  wrap(({ query, dirs, limit }) => findReferencePresets(query, { dirs, limit })),
);

server.registerTool(
  'generate_bank',
  {
    title: 'Generate a preset bank',
    description: 'Generates several presets (each spec has the same shape as generate_preset.spec), with unique names, per-preset validation, error report (failures do not stop the batch), README.md, bank_report.json and a ZIP archive next to the bank folder.',
    inputSchema: {
      specs: z.array(z.any()).min(1).max(128).describe('Array of PresetSpec objects'),
      output_folder: z.string().describe('Bank folder name inside the diva-mcp output folder'),
      bank_name: z.string().optional(),
      zip: z.boolean().optional(),
    },
  },
  wrap(({ specs, output_folder, bank_name, zip }) => generateBank(specs, output_folder, { bankName: bank_name, zip })),
);

server.registerTool(
  'get_sound_design_guide',
  {
    title: 'Sound design guide',
    description: 'Workflow, architecture characteristics, archetype starting points (pad, bass, keys, pluck, lead) and an adjective lexicon (warm, dark, tape, unstable ...) for turning a musical description into a PresetSpec.',
    inputSchema: { topic: z.string().optional() },
    annotations: { readOnlyHint: true },
  },
  wrap(({ topic }) => soundDesignGuide(topic)),
);

server.registerTool(
  'get_library_info',
  {
    title: 'Diva installation and output folders',
    description: 'Shows detected Diva preset folders (user/factory), where diva-mcp writes, and which folders are protected.',
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  wrap(() => {
    let out: string | null = null;
    let outErr: string | null = null;
    try {
      out = outputRoot();
    } catch (e) {
      outErr = (e as Error).message;
    }
    return { ...detectDivaLocations(), output_root: out, output_root_error: outErr };
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
