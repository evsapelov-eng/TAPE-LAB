#!/usr/bin/env bash
# Launches the serum-mcp server (https://github.com/Celian-mrc/serum-mcp).
# Clones it and installs deps on first run, so a fresh session works out of the box.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${SERUM_MCP_DIR:-$HOME/.cache/serum-mcp}"
if [ ! -d "$SRC/.git" ]; then
  git clone --depth 1 https://github.com/Celian-mrc/serum-mcp "$SRC" >&2
fi
uv --directory "$SRC" sync --quiet >&2
export SERUM_PRESETS_PATH="${SERUM_PRESETS_PATH:-$ROOT/serum/Presets/User}"
export SERUM_TABLES_PATH="${SERUM_TABLES_PATH:-$ROOT/serum/Tables}"
export SERUM_SAMPLES_PATH="${SERUM_SAMPLES_PATH:-$ROOT/serum/Samples}"
exec uv --directory "$SRC" run serum-mcp
