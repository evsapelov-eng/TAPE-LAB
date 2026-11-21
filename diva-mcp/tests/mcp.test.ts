/** Test 6 — MCP integration (real stdio server process) and Test 7 — Diva compatibility honesty. */
import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fixture, tmpDir } from './helpers.js';
import { validatePreset } from '../src/engine/operations.js';

const root = path.resolve(__dirname, '..');
const out = tmpDir();
let client: Client;

const call = async (name: string, args: Record<string, unknown>) => {
  const r = (await client.callTool({ name, arguments: args })) as { content: { text: string }[]; isError?: boolean };
  return { error: !!r.isError, text: r.content[0]!.text, json: () => JSON.parse(r.content[0]!.text) };
};

beforeAll(async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['--import', 'tsx', path.join(root, 'src/mcp/server.ts')],
    cwd: root,
    env: { ...(process.env as Record<string, string>), DIVA_MCP_OUTPUT_DIR: out },
    stderr: 'pipe',
  });
  client = new Client({ name: 'diva-mcp-test', version: '0.0.0' });
  await client.connect(transport);
}, 30000);

afterAll(async () => {
  await client?.close();
});

describe('Test 6 — MCP integration', () => {
  it('exposes all tools', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(
      ['analyze_preset', 'describe_preset', 'edit_preset', 'find_reference_presets', 'generate_bank', 'generate_preset', 'get_library_info', 'get_sound_design_guide', 'list_parameters', 'validate_preset'].sort(),
    );
    const gen = tools.find((t) => t.name === 'generate_preset')!;
    expect(JSON.stringify(gen.inputSchema)).toContain('triple_vco');
  });

  it('list_parameters filters by module', async () => {
    const r = (await call('list_parameters', { module: 'Main filter' })).json();
    expect(r.parameters.every((p: any) => p.module === 'Main filter')).toBe(true);
    expect(r.parameters.find((p: any) => p.id === 'VCF1/Model').enum['4']).toBe('Uhbie');
    expect(r.modulation_slots.length).toBeGreaterThan(10);
  });

  it('generate -> analyze -> describe -> validate -> edit round trip', async () => {
    const g = await call('generate_preset', {
      spec: { meta: { name: 'MCP Pad' }, oscillator: { model: 'dual_vco' }, filter: { model: 'cascade', cutoff: 78 }, env1: { attack: 45, release: 50 }, fx1: { type: 'chorus', variant: 'ensemble' } },
      subfolder: 'mcp',
    });
    expect(g.error, g.text).toBe(false);
    const p = g.json().path;
    expect(p).toBe(path.join(out, 'mcp', 'MCP Pad.h2p'));
    const a = (await call('analyze_preset', { path: p })).json();
    expect(a.filter.model).toBe('Cascade');
    const d = (await call('describe_preset', { path: p })).json();
    expect(d.basis).toMatch(/NOT listened/);
    const v = (await call('validate_preset', { path: p })).json();
    expect(v.structural_validation.status).toBe('passed');
    expect(v.diva_load_test.status).toBe('not_run');
    const e = (await call('edit_preset', { path: p, changes: { params: { 'VCF1/Res': { add: 10 } } } })).json();
    expect(e.path).toBe(path.join(out, 'mcp', 'MCP Pad v2.h2p'));
  });

  it('returns tool errors for invalid specs instead of writing files', async () => {
    const r = await call('generate_preset', { spec: { oscillator: { model: 'triple_vco' }, hpf: { model: 'pre' } }, subfolder: 'bad' });
    expect(r.error).toBe(true);
    expect(r.text).toMatch(/HPF\/Feedback panel does not exist/);
    expect(fs.existsSync(path.join(out, 'bad'))).toBe(false);
  });

  it('find_reference_presets is read-only', async () => {
    const dir = path.dirname(fixture('PD Current Plum Evy.h2p'));
    const before = fs.readdirSync(dir).map((f) => fs.statSync(path.join(dir, f)).mtimeMs);
    const r = (await call('find_reference_presets', { query: 'pad analogue bite', dirs: [dir] })).json();
    expect(r.results[0].name).toBe('PD Current Plum Evy');
    expect(fs.readdirSync(dir).map((f) => fs.statSync(path.join(dir, f)).mtimeMs)).toEqual(before);
  });

  it('generate_bank works over MCP', async () => {
    const r = (await call('generate_bank', { specs: [{ meta: { name: 'A' } }, { meta: { name: 'B' }, oscillator: { model: 'dco' } }], output_folder: 'bank' })).json();
    expect(r.created).toBe(2);
    expect(fs.existsSync(r.zip)).toBe(true);
  });
});

describe('Test 7 — Diva compatibility', () => {
  it('never reports a Diva load test or audio verification as passed', () => {
    const v = validatePreset(fixture('PD Current Plum Evy.h2p'));
    expect(v.diva_load_test.status).toBe('not_run');
    expect(v.audio_verification.status).toBe('not_run');
    expect(v.summary).toMatch(/Diva load test: not run/);
  });
});
