"""Independent post-build verification of PLUIT -- SONIC ARCHITECTURES VOL. 01.

Reads the written .SerumPreset files directly (not the server's own report)
and checks, per preset:
  * container decodes (XferJson header + zstd CBOR) and re-packs byte-stable
  * no CBOR wire-type issues (serum-mcp's own safety scan)
  * round-trip via extract_spec matches the authored spec on key fields
  * mod-matrix slot count, named macros 1-4 each driving >= 1 real route
  * required FX present; every wet-route targets an FX that has a wet knob
  * multi-frame custom tables are actually scanned (table_position route)
  * every referenced custom table / sample file exists on disk
Writes tools/pluit/verification.json and prints a summary table.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from serum_mcp.preset.introspect import extract_spec
from serum_mcp.preset.packer import pack_bytes, unpack_bytes
from serum_mcp.preset.safety import scan_wire_types
from serum_mcp.preset.schema import MOD_SOURCE_IDS

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[1]
sys.path.insert(0, str(HERE))
from bank import bank  # noqa: E402

SUB = "PLUIT - SONIC ARCHITECTURES VOL 01"
SERUM = Path(os.environ.get("SERUM_ROOT", REPO / "serum"))
FOLDER = SERUM / "Presets" / "User" / SUB
ID2SRC = {v: k for k, v in MOD_SOURCE_IDS.items()}
NEEDS_SPACE_FX = {"PD", "PL", "TX", "KY", "LD"}


def check(spec: dict) -> dict:
    name = spec["name"]
    path = FOLDER / f"{name}.SerumPreset"
    rep: dict = {"name": name, "file": path.name, "problems": []}
    P = rep["problems"]
    if not path.is_file():
        P.append("file missing")
        return rep
    raw = path.read_bytes()
    pre = unpack_bytes(raw)
    data = pre.data
    rep["bytes"] = len(raw)
    if unpack_bytes(pack_bytes(pre)).data != data:
        P.append("repack round-trip changed data")
    if pre.metadata.get("presetName") != name:
        P.append("metadata name mismatch")
    issues = scan_wire_types(data)
    if issues:
        P.append(f"{len(issues)} CBOR wire-type issues")

    # --- mod matrix, straight from the raw ModSlots
    slots = [v for k, v in data.items() if k.startswith("ModSlot") and isinstance(v, dict)
             and v.get("source")]
    rep["mod_slots"] = len(slots)
    if len(slots) != len(spec["mod_routes"]):
        P.append(f"mod slots {len(slots)} != authored {len(spec['mod_routes'])}")
    used = {}
    for s in slots:
        for sid in s["source"]:
            if sid:
                used[ID2SRC.get(sid, sid)] = used.get(ID2SRC.get(sid, sid), 0) + 1
    rep["macro_routes"] = {}
    for i in range(4):
        n = used.get(f"macro{i}", 0)
        rep["macro_routes"][f"macro{i}"] = n
        if n == 0:
            P.append(f"macro{i} drives nothing")
    aux = sum(1 for s in slots if s["source"][1])
    rep["aux_scaled_routes"] = aux

    # --- round trip through serum-mcp's own reader
    ex = extract_spec(data)
    names = [m.name for m in ex.macros[:4]]
    rep["macro_names"] = names
    if names != [m["name"] for m in spec["macros"]]:
        P.append(f"macro names read back as {names}")
    for i, o in enumerate(spec["oscillators"]):
        got = ex.oscillators[i]
        if bool(o.get("enabled", True)) != bool(got.enabled):
            P.append(f"osc{i} enabled mismatch")
        if o.get("enabled", True) and "volume" in o and abs(got.volume - o["volume"]) > 1e-6:
            P.append(f"osc{i} volume {got.volume} != {o['volume']}")
    for i, f in enumerate(spec["filters"]):
        if ex.filters[i].type != f["type"]:
            P.append(f"filter{i} type {ex.filters[i].type} != {f['type']}")
    for i, e in enumerate(spec["envelopes"]):
        for k in ("attack", "decay", "sustain", "release"):
            if abs(getattr(ex.envelopes[i], k) - e[k]) > 1e-6:
                P.append(f"env{i}.{k} {getattr(ex.envelopes[i], k)} != {e[k]}")
    rep["active_oscillators"] = sum(1 for o in ex.oscillators if o.enabled)
    rep["active_filters"] = sum(1 for f in ex.filters if f.enabled)
    rep["lfos_used"] = len(spec["lfos"])

    # --- FX
    fx = [u["type"] for u in spec["fx_chain"]]
    rack = data["FXRack0"]["FX"]
    rep["fx_chain"] = [list(u.keys())[-1] for u in rack]
    if rep["fx_chain"] != fx:
        P.append(f"fx chain read back as {rep['fx_chain']}")
    if "FXComp" not in fx:
        P.append("no FXComp")
    if name.split()[1] in NEEDS_SPACE_FX and not ({"FXReverb", "FXDelay"} & set(fx)):
        P.append("no space FX")
    for r in spec["mod_routes"]:
        d = r["destination"]
        if d.startswith("fx") and d.endswith(".wet") and fx[int(d[2:].split(".")[0])] == "FXEQ":
            P.append(f"wet route into FXEQ: {d}")

    # --- movement through multi-frame tables
    for i, o in enumerate(spec["oscillators"]):
        multi = (o.get("custom_harmonics") and len(o["custom_harmonics"]) > 1) or \
                o.get("wavetable") in {"pwm", "dying_sine", "acid", "harmonic_smooth", "flute",
                                       "digital_fm", "default", "analog_basic"}
        if multi and o.get("enabled", True) and not o.get("multisample_source") and \
                o.get("table_position", 0) and not any(
                    r["destination"] == f"oscillator{i}.table_position" for r in spec["mod_routes"]):
            rep.setdefault("static_table_positions", []).append(f"osc{i}")

    # --- external file dependencies
    deps = []
    for k, v in data.items():
        if not k.startswith("Oscillator") or not isinstance(v, dict):
            continue
        wt = v.get(f"WTOsc{k[-1]}", {})
        rel = wt.get("relativePathToWT", "")
        if rel.startswith("User/serum-mcp/"):
            deps.append(("Tables", rel))
        for sub in (f"GranularOsc{k[-1]}", f"SampleOsc{k[-1]}"):
            c = v.get(sub, {})
            rel = c.get("samplePathRelative") or ""
            if isinstance(rel, str) and rel.startswith("User/serum-mcp/"):
                deps.append(("Samples", rel))
    rep["dependencies"] = [f"{a}/{b}" for a, b in deps]
    for a, b in deps:
        if not (SERUM / a / b).is_file():
            P.append(f"missing dependency {a}/{b}")
    return rep


def main() -> int:
    files = sorted(p.name for p in FOLDER.glob("*.SerumPreset"))
    specs = bank()
    summary = {
        "folder": str(FOLDER.relative_to(REPO)),
        "serumpreset_count": len(files),
        "unique_names": len(set(files)) == len(files),
        "numbering_01_20": [f[:2] for f in files] == [f"{i:02d}" for i in range(1, 21)],
        "other_files": sorted(p.name for p in FOLDER.iterdir()
                              if p.suffix != ".SerumPreset" and p.name != "README.md"),
    }
    reports = [check(s) for s in specs]
    summary["presets_with_problems"] = [r["name"] for r in reports if r["problems"]]
    (HERE / "verification.json").write_text(
        json.dumps({"summary": summary, "presets": reports}, indent=2, ensure_ascii=False))
    print(json.dumps(summary, indent=1))
    print(f"{'preset':28} osc flt lfo slots aux  m1 m2 m3 m4  fx  deps problems")
    for r in reports:
        m = r.get("macro_routes", {})
        print(f"{r['name']:28} {r.get('active_oscillators', '-'):>3} {r.get('active_filters', '-'):>3}"
              f" {r.get('lfos_used', '-'):>3} {r.get('mod_slots', '-'):>5} {r.get('aux_scaled_routes', '-'):>3}"
              f"  {m.get('macro0', 0):>2} {m.get('macro1', 0):>2} {m.get('macro2', 0):>2} {m.get('macro3', 0):>2}"
              f" {len(r.get('fx_chain', [])):>3} {len(r.get('dependencies', [])):>5} "
              f"{'; '.join(r['problems']) or 'ok'}"
              + (f"  [static tp: {r['static_table_positions']}]" if r.get("static_table_positions") else ""))
    ok = (summary["serumpreset_count"] == 20 and summary["unique_names"]
          and summary["numbering_01_20"] and not summary["presets_with_problems"])
    print("RESULT:", "PASS" if ok else "FAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
