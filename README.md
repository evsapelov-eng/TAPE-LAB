# TAPE-LAB

## Serum 2 presets via serum-mcp

This repo is wired to [serum-mcp](https://github.com/Celian-mrc/serum-mcp) — an MCP server
that writes Xfer Serum 2 `.SerumPreset` files from a plain-language description.

- `.mcp.json` registers the `serum-mcp` server for Claude Code.
- `scripts/serum-mcp.sh` clones serum-mcp on first run (into `~/.cache/serum-mcp`,
  or `$SERUM_MCP_DIR`), runs `uv sync`, and starts the server. Requires `git` and `uv`.
- Generated presets land in `serum/Presets/User/`; custom wavetables in `serum/Tables/`,
  copied samples in `serum/Samples/`. Copy those into the matching folders of your real
  Serum 2 install (Serum menu → "Show Serum Presets folder").

To write straight into your local Serum folder instead, set `SERUM_PRESETS_PATH`
(and optionally `SERUM_TABLES_PATH` / `SERUM_SAMPLES_PATH`) before starting Claude Code.
