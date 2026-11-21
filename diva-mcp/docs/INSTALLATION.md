# Installation

## 1. Requirements

- Node.js 20 or newer (`node -v`)
- Claude Code (`claude --version`)
- u-he Diva installed (for the preset folders and to actually play the results)

## 2. Build

```bash
git clone <this repository>
cd <repository>/diva-mcp
npm install
npm run build        # compiles TypeScript to dist/
npm test             # optional, runs the automated test suite
```

The server entry point is `dist/src/mcp/server.js` (stdio transport).

## 3. Connect to Claude Code

```bash
claude mcp add diva-mcp -- node /ABSOLUTE/PATH/TO/diva-mcp/dist/src/mcp/server.js
```

- Add `--scope user` to make it available in every project, or `--scope project` to share it via `.mcp.json` (Claude Code then asks for approval on first use).
- Pass environment variables with `-e`, e.g.
  `claude mcp add diva-mcp -e DIVA_USER_PRESETS_DIR="/Users/me/Library/Audio/Presets/u-he/Diva" -- node …/server.js`
- Windows: use the full path with forward slashes or escaped backslashes, e.g. `node C:/dev/diva-mcp/dist/src/mcp/server.js`.

Check the connection:

```bash
claude mcp get diva-mcp     # Status: ✓ Connected
```

Inside Claude Code, `/mcp` lists the server and its 10 tools.

Without building (development), you can also run the TypeScript directly:

```bash
claude mcp add diva-mcp-dev -- node --import tsx /ABSOLUTE/PATH/TO/diva-mcp/src/mcp/server.ts
```

(run from the `diva-mcp` folder so `tsx` resolves from `node_modules`).

## 4. Where presets are written

diva-mcp determines the output folder from the real installation:

| Platform | User preset folder (manual) | diva-mcp output |
|---|---|---|
| macOS | `~/Library/Audio/Presets/u-he/Diva/` | `~/Library/Audio/Presets/u-he/Diva/diva-mcp/` |
| Windows | `Documents\u-he\Diva.data\UserPresets\Diva\` | `…\UserPresets\Diva\diva-mcp\` |
| Linux | not documented by u-he — guessed `~/.u-he/Diva/UserPresets/Diva` or `~/.u-he/Diva.data/UserPresets/Diva` | `…/diva-mcp/` |

If none exists, generation stops with an explanatory error instead of guessing. Set one of:

- `DIVA_USER_PRESETS_DIR` — your user preset folder (output becomes `<it>/diva-mcp`)
- `DIVA_MCP_OUTPUT_DIR` — an explicit output folder

Use the `get_library_info` tool (or `node dist/src/cli.js info`) to see what was detected.

Factory/local folders (macOS `/Library/Audio/Presets/u-he/Diva/`, Windows `Documents\u-he\Diva.data\Presets\Diva\`, plus `DIVA_FACTORY_PRESETS_DIR` and `DIVA_PROTECTED_DIRS`) are **never written to**.

After generating, press *Refresh* in Diva's preset browser (directory context menu) to see new files.

## 5. Command line (optional)

```bash
node dist/src/cli.js info
node dist/src/cli.js analyze  "path/to/preset.h2p"
node dist/src/cli.js describe "path/to/preset.h2p"
node dist/src/cli.js validate "path/to/preset.h2p"
node dist/src/cli.js generate spec.json --subfolder Tests
node dist/src/cli.js edit "preset.h2p" changes.json        # changes = {"params": {...}} or {"spec": {...}}
node dist/src/cli.js bank banks/specs/pluit-diva-lab-vol-01.json "PLUIT - DIVA LAB VOL. 01"
node dist/src/cli.js find "warm pad cascade"
```

## 6. Maintaining the schema

`schemas/diva_parameters.json`, `docs/PARAMETER_SCHEMA.md` and `templates/diva-init.h2p` are generated:

```bash
# optional: refresh statistics from your own presets (only aggregates are stored)
npm run collect:observations -- "/path/to/Diva/presets" "/another/folder"
npm run build:schema
```

Edit knowledge in `src/schema/curation.ts` (labels, enums, compatibility, confidence, sources), never in the generated JSON.

## 7. Troubleshooting

| Symptom | Fix |
|---|---|
| `claude mcp get` shows *Failed* | Run `node dist/src/mcp/server.js` manually — it should wait silently on stdin. Rebuild with `npm run build`. Check the absolute path. |
| "No Diva user preset folder was found" | Set `DIVA_USER_PRESETS_DIR` or `DIVA_MCP_OUTPUT_DIR`. |
| New presets don't appear in Diva | Use *Refresh* in the browser; make sure the output folder is inside the user preset folder. |
| A preset does not load in Diva | Please report it with the file — compatibility is only confirmed by loading in Diva (see TEST_REPORT.md). |
