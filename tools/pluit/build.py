"""Builds PLUIT -- SONIC ARCHITECTURES VOL. 01 through the serum-mcp MCP server.

Talks to the server over the real MCP stdio protocol (the same way Claude
Code does), using the repo's scripts/serum-mcp.sh launcher:

  1. initialize + tools/list         -> confirm the server is reachable
  2. list_parameters()               -> confirm the schema is served
  3. find_reference_presets(...)     -> look for local Factory/user references
  4. generate_preset(spec, subfolder) for each of the 20 specs, refusing to
     overwrite any file that already exists
  5. describe_preset(path)           -> read every written file back

Writes tools/pluit/build_log.json and tools/pluit/describe_dump.txt.
Run with the serum-mcp virtualenv:
  uv run --directory <serum-mcp> python tools/pluit/build.py
"""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE))
from bank import bank  # noqa: E402

SUBFOLDER = "PLUIT - SONIC ARCHITECTURES VOL 01"
PRESETS_ROOT = Path(os.environ.get("SERUM_PRESETS_PATH", REPO / "serum" / "Presets" / "User"))
REFERENCE_QUERIES = ["ambient pad", "pad", "sub bass", "bass", "pluck", "texture", "keys",
                     "electric piano", "lead", "future garage", "downtempo"]


def text_of(result) -> str:
    return "\n".join(c.text for c in result.content if getattr(c, "type", "") == "text")


async def main() -> int:
    params = StdioServerParameters(command="bash", args=[str(REPO / "scripts" / "serum-mcp.sh")],
                                   env={**os.environ})
    log: dict = {"subfolder": SUBFOLDER, "presets": [], "errors": []}
    dump: list[str] = []
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            init = await session.initialize()
            tools = [t.name for t in (await session.list_tools()).tools]
            log["server"] = {"name": init.serverInfo.name, "version": init.serverInfo.version,
                             "tools": tools}
            print("server:", init.serverInfo.name, "tools:", tools)

            lp = json.loads(text_of(await session.call_tool("list_parameters", {})))
            log["list_parameters_sections"] = sorted(lp.keys())
            print("list_parameters sections:", len(lp))

            refs = {}
            for q in REFERENCE_QUERIES:
                r = json.loads(text_of(await session.call_tool("find_reference_presets",
                                                               {"query": q, "limit": 5})))
                refs[q] = r.get("count", 0)
            log["find_reference_presets"] = refs
            print("reference matches:", refs)

            for spec in bank():
                name = spec["name"]
                dest = PRESETS_ROOT / SUBFOLDER / f"{name}.SerumPreset"
                if dest.exists():
                    msg = f"refusing to overwrite existing file: {dest}"
                    print("SKIP", name, "-", msg)
                    log["errors"].append({"name": name, "error": msg})
                    continue
                res = await session.call_tool("generate_preset",
                                              {"spec": spec, "subfolder": SUBFOLDER})
                out = text_of(res)
                if res.isError:
                    print("ERR ", name, "-", out[:400])
                    log["errors"].append({"name": name, "error": out})
                    continue
                lines = out.splitlines()
                path = lines[0].strip()
                desc = text_of(await session.call_tool("describe_preset", {"preset_path": path}))
                dump.append(desc)
                log["presets"].append({"name": name, "path": path, "dependencies": lines[1:],
                                       "mod_routes": len(spec["mod_routes"]),
                                       "fx_units": len(spec["fx_chain"]),
                                       "macros": [m["name"] for m in spec["macros"]]})
                print("OK  ", name)

    (HERE / "build_log.json").write_text(json.dumps(log, indent=2, ensure_ascii=False))
    (HERE / "describe_dump.txt").write_text("\n\n" + ("\n\n" + "=" * 78 + "\n\n").join(dump))
    print(f"done: {len(log['presets'])} written, {len(log['errors'])} errors")
    return 1 if log["errors"] else 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
