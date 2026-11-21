"""PLUIT -- SONIC ARCHITECTURES VOL. 01: the 20 PresetSpec definitions.

Each entry is a plain dict in the exact shape serum-mcp's ``PresetSpec``
expects (validated by Pydantic inside the server when generate_preset is
called over MCP). Conventions used across the bank:

  macro0 = CHARACTER   macro1 = MOVEMENT   macro2 = SPACE   macro3 = EXPRESSION
  (names are instrument-specific where that reads better; see README)

  MOVEMENT is implemented with ``aux_source='macro1'`` on the LFO routes it
  governs: serum-mcp documents the aux combination as
  effective = amount * (macro1 / 100), so the knob genuinely scales the depth
  of the internal modulation instead of being a token assignment.

  oscillators[]: 0..2 = Osc A/B/C, 3 = Noise, 4 = Sub (all 5 written
  explicitly so nothing inherits an unknown enabled state).
"""

from __future__ import annotations

from pathlib import Path

SOURCES = Path(__file__).resolve().parent / "sources"

# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------


def OFF() -> dict:
    return {"enabled": False}


def R(src: str, dst: str, amt: float, bip: bool = False, aux: str | None = None) -> dict:
    r = {"source": src, "destination": dst, "amount": amt, "bipolar": bip}
    if aux:
        r["aux_source"] = aux
    return r


def LFO(rate: float, *, shape: str | None = None, mode: str = "Free", smooth: float = 0.0,
        mono: bool = False, delay: float = 0.0, rise: float = 0.0, curve=None) -> dict:
    d = {"rate": rate, "beat_sync": False, "mode": mode, "smooth": smooth, "mono": mono,
         "delay": delay, "rise": rise}
    if shape:
        d["shape"] = shape
    if curve:
        d["curve"] = curve
    return d


def ENV(a: float, d: float, s: float, r: float, *, hold: float = 0.0, ac: float = 50.0,
        dc: float = 66.6, rc: float = 66.6) -> dict:
    return {"attack": a, "hold": hold, "decay": d, "sustain": s, "release": r,
            "attack_curve": ac, "decay_curve": dc, "release_curve": rc}


def FX(kind: str, wet: float, **params) -> dict:
    return {"type": kind, "wet": wet, "params": params}


def M(name: str, value: float) -> dict:
    return {"name": name, "value": value}


def EQ(f1: float, g1: float, f2: float, g2: float) -> dict:
    return FX("FXEQ", 100, kParamFreq1=f1, kParamGain1=g1, kParamFreq2=f2, kParamGain2=g2)


def COMP(thresh: float, ratio: float, att: float, rel: float, makeup: float, wet: float = 100) -> dict:
    return FX("FXComp", wet, kParamThresh=thresh, kParamRatio=ratio, kParamAttack=att,
              kParamRelease=rel, kParamMakeup=makeup)


def DELAY(tl: float, tr: float, fb: float, freq: float, wet: float) -> dict:
    return FX("FXDelay", wet, kParamTimeL=tl, kParamTimeR=tr, kParamBeatSync=False,
              kParamFeedback=fb, kParamFreq=freq)


def VERB(kind: str, size: float, pre: float, width: float, wet: float) -> dict:
    return FX("FXReverb", wet, kParamType=kind, kParamSize=size, kParamDelay=pre,
              kParamWidth=width)


def UTIL(width: float, hpf: float, lpf: float = 20000.0) -> dict:
    return FX("FXUtils", 100, kParamWidth=width, kParamHPF=hpf, kParamLPF=lpf)


def harm(spec: dict[int, float], n: int = 32) -> list[float]:
    """{harmonic_number: amplitude} -> dense list (index 0 = fundamental)."""
    top = max(max(spec), 1)
    out = [0.0] * max(n, top)
    for h, a in spec.items():
        out[h - 1] = round(a, 4)
    return out


# --------------------------------------------------------------------------
# bespoke wavetables (custom_harmonics) -- each written by serum-mcp as a
# real multi-frame .wav into Tables/User/serum-mcp
# --------------------------------------------------------------------------


def table_glass() -> list[list[float]]:
    """Mostly octave-related (even) partials: transparent, chord-friendly."""
    frames = []
    for k in range(6):
        frames.append(harm({1: 1.0, 2: 0.18 + 0.02 * k, 3: 0.03 * k, 4: 0.06 + 0.04 * k,
                            6: 0.03 * k, 8: 0.025 * k, 12: 0.02 * k, 16: 0.012 * k}))
    return frames


def table_radio() -> list[list[float]]:
    """Warm low core + a sparse, shifting crown of high odd partials."""
    crowns = [{9: .08, 17: .05}, {13: .1, 21: .04}, {9: .05, 13: .06, 25: .05},
              {17: .09, 27: .04}, {11: .07, 21: .07, 31: .03}]
    return [harm({1: 1.0, 2: 0.35, 3: 0.15, 4: 0.06, **c}) for c in crowns]


def table_collapse() -> list[list[float]]:
    """Harmonic saw-like spectrum collapsing toward a hollow prime-partial set."""
    primes = {5, 7, 11, 13, 17, 19}
    frames = []
    for k in range(8):
        d = {}
        for h in range(1, 21):
            a = 1.0 / h
            if h == 1:
                a = 1.0 - 0.08 * k
            elif h in primes:
                a = a + 0.05 * k
            elif h % 2 == 0:
                a = a * (1 - 0.11 * k)
            d[h] = max(a, 0.0)
        frames.append(harm(d))
    return frames


def table_night() -> list[list[float]]:
    """Round sine-ish body morphing into a dense odd-harmonic square character."""
    start = {1: 1.0, 2: 0.4, 3: 0.12}
    end = {h: (1.0 / h if h % 2 else 0.12 / h) for h in range(1, 22)}
    frames = []
    for k in range(4):
        t = k / 3
        keys = set(start) | set(end)
        frames.append(harm({h: (1 - t) * start.get(h, 0) + t * end.get(h, 0) for h in keys}))
    return frames


def table_fractal() -> list[list[float]]:
    """Six unrelated sparse partial sets (primes, Fibonacci, powers of two...)."""
    sets = [
        {1: 1, 3: .5, 5: .3},
        {h: 1 / h ** 0.5 for h in (1, 2, 3, 5, 7, 11, 13)},
        {h: 1 / h ** 0.6 for h in (1, 2, 3, 5, 8, 13, 21)},
        {h: 1 / h ** 0.5 for h in (1, 2, 4, 8, 16)},
        {1: 1, 3: .45, 9: .25, 27: .1},
        {h: 1 / h ** 0.7 for h in (1, 4, 7, 10, 13, 16)},
    ]
    return [harm(s) for s in sets]


def table_wood() -> list[list[float]]:
    """Bar-percussion ratios (1:4:10 like a tuned marimba bar), softening."""
    return [harm({1: 1, 4: .5, 10: .2}), harm({1: 1, 3: .3, 4: .4, 10: .12}),
            harm({1: 1, 2: .2, 4: .25, 7: .1})]


def table_tine() -> list[list[float]]:
    """Electric-piano tine: mellow (frame 0) -> barky with tine partials (frame 3)."""
    mellow = {1: 1.0, 2: 0.25, 3: 0.06}
    bright = {1: 1.0, 2: 0.45, 3: 0.2, 4: 0.15, 5: 0.08, 7: 0.12, 14: 0.08}
    out = []
    for k in range(4):
        t = k / 3
        keys = set(mellow) | set(bright)
        out.append(harm({h: (1 - t) * mellow.get(h, 0) + t * bright.get(h, 0) for h in keys}))
    return out


def table_bloom() -> list[list[float]]:
    """Pure sine progressively opening into a rich, tilted harmonic spectrum."""
    frames = []
    for k in range(8):
        top = 1 + 2 * k
        tilt = 1.6 - 0.12 * k
        frames.append(harm({h: (1 / h) ** tilt for h in range(1, top + 1)}))
    return frames


# --------------------------------------------------------------------------
# the bank
# --------------------------------------------------------------------------

STD_MACROS = ("CHARACTER", "MOVEMENT", "SPACE")


def bank() -> list[dict]:
    P: list[dict] = []

    # ===================================================== A. ATMOSPHERIC PADS
    # 01 -- detuned Juno-PWM + OSCAR layers, tape wow/flutter, bloom envelope
    P.append({
        "name": "01 PD Dust Memory",
        "description": "Melancholic detuned analog pad, worn tape wow and flutter, dust crackle, "
                       "blooms open while the chord is held. PLUIT Sonic Architectures Vol.01",
        "oscillators": [
            {"wavetable": "pwm", "table_position": 60, "unison": 3, "detune": 0.12,
             "volume": 0.6},
            {"wavetable": "analog_warm", "table_position": 120, "fine": -9, "unison": 2,
             "detune": 0.08, "volume": 0.45, "warp_mode": "filter_lpf", "warp_amount": 0.3},
            {"wavetable": "harmonic_smooth", "table_position": 40, "octave": -1,
             "volume": 0.34},
            {"noise_type": "Geiger", "volume": 0.07, "filter_routing": "master"},
            OFF(),
        ],
        "filters": [{"type": "moog_lowpass_24", "cutoff": 0.36, "resonance": 12, "drive": 18,
                     "key_track": True}],
        "envelopes": [ENV(1.6, 3.0, 0.85, 4.5, ac=35), ENV(4.5, 6.0, 0.6, 4.0)],
        "lfos": [LFO(0.45), LFO(5.5, shape="random_sh", smooth=70, mono=True), LFO(0.07)],
        "macros": [M("TAPE AGE", 30), M("MOVEMENT", 50), M("SPACE", 40), M("BLOOM", 35)],
        "fx_chain": [
            FX("FXDistortion", 35, kParamMode="kTapeSat", kParamDrive=22),          # 0
            FX("FXChorus", 30, kParamRate=0.35, kParamDepth=9, kParamDelay=7,
               kParamFilt=3000),                                                    # 1
            EQ(300, -2, 7000, -4),                                                  # 2
            COMP(0.45, 2.5, 20, 200, 1.6),                                          # 3
            DELAY(0.34, 0.29, 35, 2500, 12),                                        # 4
            VERB("kVintage", 72, 30, 90, 26),                                       # 5
            UTIL(115, 45),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 18), R("env1", "oscillator0.table_position", 20),
            R("env1", "oscillator2.table_position", 15),
            R("lfo0", "oscillator0.fine", 8, True, "macro1"),
            R("lfo0", "oscillator1.fine", 10, True, "macro1"),
            R("lfo1", "oscillator0.fine", 3, True, "macro1"),
            R("lfo1", "oscillator1.fine", 3, True, "macro1"),
            R("lfo2", "oscillator0.table_position", 30, True, "macro1"),
            R("random1", "oscillator1.fine", 3, True),
            R("velocity", "filter0.cutoff", 8),
            R("macro0", "filter0.cutoff", -15), R("macro0", "fx0.wet", 40),
            R("macro0", "oscillator3.volume", 12),
            R("macro1", "lfo0.rate", 10),
            R("macro2", "fx5.wet", 35), R("macro2", "fx1.wet", 25), R("macro2", "fx4.wet", 20),
            R("macro3", "filter0.cutoff", 20), R("macro3", "oscillator2.volume", 20),
        ],
        "global": {"master_volume": 0.42, "poly_count": 10},
    })

    # 02 -- bespoke 'glass' even-partial table, LP->HP series, cold air layer
    P.append({
        "name": "02 PD Glass Horizon",
        "description": "Cold, transparent pad built on an even-partial glass wavetable: airy, "
                       "wide, slow spectral motion, keeps complex chords legible.",
        "oscillators": [
            {"custom_harmonics": table_glass(), "table_position": 20, "unison": 2,
             "detune": 0.06, "volume": 0.6},
            {"wavetable": "harmonic_smooth", "table_position": 90, "octave": 1,
             "volume": 0.32, "pan": 0},
            {"wavetable": "default", "table_position": 0, "volume": 0.36},
            OFF(), OFF(),
        ],
        "filters": [
            {"type": "lowpass_12", "cutoff": 0.62, "resonance": 8, "key_track": True,
             "output_routing": "series"},
            {"type": "highpass_12", "cutoff": 0.12, "resonance": 0},
        ],
        "envelopes": [ENV(0.9, 2.0, 0.9, 3.2), ENV(2.5, 5.0, 0.4, 3.0)],
        "lfos": [LFO(0.11), LFO(0.23), LFO(0.17)],
        "macros": [M("FROST", 25), M("MOVEMENT", 50), M("SPACE", 40), M("BREATH", 20)],
        "fx_chain": [
            EQ(250, -3, 9000, 1.5),                                                 # 0
            FX("FXChorus", 22, kParamRate=0.2, kParamDepth=6, kParamDelay=12,
               kParamFilt=6000),                                                    # 1
            COMP(0.5, 2.0, 25, 220, 1.4),                                           # 2
            DELAY(0.30, 0.32, 28, 5000, 12),                                        # 3
            VERB("kHall", 80, 45, 100, 24),                                         # 4
            UTIL(130, 90),                                                          # 5
        ],
        "mod_routes": [
            R("env1", "oscillator0.table_position", 35),
            R("lfo0", "oscillator0.table_position", 40, True, "macro1"),
            R("lfo1", "filter0.cutoff", 12, True, "macro1"),
            R("lfo1", "oscillator1.table_position", 30, True, "macro1"),
            R("lfo2", "oscillator1.pan", 60, True, "macro1"),
            R("lfo2", "oscillator1.volume", 16, True, "macro1"),
            R("velocity", "oscillator1.volume", 15),
            R("macro0", "oscillator0.table_position", 30), R("macro0", "filter0.cutoff", 15),
            R("macro0", "oscillator1.volume", 15),
            R("macro2", "fx4.wet", 30), R("macro2", "fx3.wet", 20), R("macro2", "fx5.width", 25),
            R("macro3", "env0.attack", 15), R("macro3", "env0.release", 12),
        ],
        "global": {"master_volume": 0.45, "poly_count": 12},
    })

    # 03 -- dying-sine core vs. sync-warped acid texture + strings; 8 s evolution env
    P.append({
        "name": "03 PD Afterimage",
        "description": "Dark cinematic pad: deep low-mid core against a moving sync-warped "
                       "texture; an 8-second envelope audibly reshapes it as you hold.",
        "oscillators": [
            {"wavetable": "dying_sine", "table_position": 30, "octave": -1, "volume": 0.52,
             "warp_mode": "soft_clip", "warp_amount": 0.2},
            {"wavetable": "acid", "table_position": 10, "unison": 4, "detune": 0.18,
             "volume": 0.36, "warp_mode": "sync", "warp_amount": 0.05},
            {"multisample_source": "strings_full", "volume": 0.3,
             "multisample_env_attack": 0.3, "multisample_env_release": 3.0},
            OFF(),
            {"sub_shape": "triangle", "volume": 0.22, "octave": -1},
        ],
        "filters": [{"type": "moog_lowpass_24", "cutoff": 0.28, "resonance": 20, "drive": 25,
                     "key_track": True}],
        "envelopes": [ENV(2.2, 4.0, 0.9, 6.0), ENV(8.0, 10.0, 1.0, 6.0, ac=60)],
        "lfos": [LFO(0.06), LFO(0.13), LFO(0.31, shape="random_sh", smooth=85, mono=True)],
        "macros": [M("DENSITY", 20), M("MOVEMENT", 50), M("SPACE", 45), M("EVOLVE", 0)],
        "fx_chain": [
            FX("FXDistortion", 30, kParamMode="kSoftSat", kParamDrive=18),          # 0
            EQ(120, 1.5, 6000, -5),                                                 # 1
            COMP(0.4, 3.0, 20, 250, 2.0),                                           # 2
            FX("FXPhaser", 18, kParamRate=0.08, kParamDepth=35, kParamFeedback=20,
               kParamFreq=600, kParamNumPoles=6),                                   # 3
            VERB("kAbyss", 85, 60, 100, 30),                                        # 4
            UTIL(120, 30),                                                          # 5
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 30), R("env1", "oscillator0.table_position", 60),
            R("env1", "oscillator1.warp_amount", 45), R("env1", "oscillator1.volume", 25),
            R("lfo0", "oscillator1.table_position", 50, True, "macro1"),
            R("lfo1", "filter0.cutoff", 14, True, "macro1"),
            R("lfo2", "oscillator1.pan", 50, True, "macro1"),
            R("velocity", "env1.attack", -12), R("velocity", "filter0.cutoff", 6),
            R("macro0", "oscillator1.warp_amount", 30), R("macro0", "filter0.drive", 25),
            R("macro0", "oscillator0.table_position", 25),
            R("macro1", "lfo0.rate", 15),
            R("macro2", "fx4.wet", 30), R("macro2", "fx3.wet", 20),
            R("macro3", "env1.attack", -35), R("macro3", "oscillator2.volume", 20),
        ],
        "global": {"master_volume": 0.4, "poly_count": 8},
    })

    # 04 -- 'radio' table with shifting high crown, quantize grain, band-pass dial
    P.append({
        "name": "04 PD Lost Frequency",
        "description": "Fragile digital pad: warm core under unstable high harmonics, light "
                       "digital grain and a drifting band-pass like a far-off radio signal.",
        "oscillators": [
            {"custom_harmonics": table_radio(), "table_position": 0, "volume": 0.6},
            {"wavetable": "digital_fm", "table_position": 100, "octave": 1, "volume": 0.28,
             "warp_mode": "quantize", "warp_amount": 0.3},
            OFF(),
            {"noise_type": "White", "volume": 0.08},
            OFF(),
        ],
        "filters": [
            {"type": "lowpass_12", "cutoff": 0.48, "resonance": 15, "key_track": True,
             "output_routing": "series"},
            {"type": "bandpass_12", "cutoff": 0.55, "resonance": 25, "wet": 45},
        ],
        "envelopes": [ENV(0.6, 2.5, 0.75, 3.5)],
        "lfos": [LFO(1.7, shape="random_sh", smooth=60, mono=True),
                 LFO(0.9, shape="random_sh", smooth=90, mono=True), LFO(0.12),
                 LFO(7.0, shape="random_sh", smooth=20, mono=True)],
        "macros": [M("SIGNAL DECAY", 25), M("MOVEMENT", 50), M("SPACE", 40), M("DISTANCE", 15)],
        "fx_chain": [
            FX("FXDistortion", 18, kParamMode="kDownsample", kParamDrive=15),       # 0
            EQ(180, -2, 5500, -3),                                                  # 1
            FX("FXChorus", 18, kParamRate=0.6, kParamDepth=4, kParamDelay=6,
               kParamFilt=4000),                                                    # 2
            DELAY(0.27, 0.31, 40, 1800, 16),                                        # 3
            VERB("kSpace", 70, 35, 95, 24),                                         # 4
            COMP(0.5, 2.0, 15, 180, 1.5),                                           # 5
        ],
        "mod_routes": [
            R("lfo0", "oscillator0.table_position", 36, True, "macro1"),
            R("lfo0", "oscillator1.table_position", 24, True, "macro1"),
            R("lfo1", "oscillator0.fine", 6, True, "macro1"),
            R("lfo2", "filter1.cutoff", 20, True, "macro1"),
            R("lfo3", "oscillator1.volume", 30, True, "macro1"),
            R("velocity", "oscillator1.volume", 15), R("velocity", "filter0.cutoff", 10),
            R("key_track", "oscillator1.volume", -10),
            R("macro0", "oscillator1.warp_amount", 40), R("macro0", "fx0.wet", 40),
            R("macro0", "filter1.wet", 35),
            R("macro2", "fx4.wet", 30), R("macro2", "fx3.wet", 22),
            R("macro3", "filter0.cutoff", -20), R("macro3", "oscillator3.volume", 12),
            R("macro3", "fx4.wet", 15),
        ],
        "global": {"master_volume": 0.45, "poly_count": 8},
    })

    # 05 -- collapsing prime-partial table, formant->moog series, 5 non-commensurate LFOs
    P.append({
        "name": "05 PD Slow Collapse",
        "description": "Evolving experimental pad: a harmonic spectrum collapsing into hollow "
                       "prime partials, formant drift and five independent cycles; MORPH macro.",
        "oscillators": [
            {"custom_harmonics": table_collapse(), "table_position": 30, "unison": 2,
             "detune": 0.1, "volume": 0.55},
            {"wavetable": "default", "table_position": 128, "semitone": 7, "volume": 0.4,
             "warp_mode": "fold", "warp_amount": 0.25},
            {"wavetable": "flute", "table_position": 140, "octave": 1, "volume": 0.3},
            OFF(), OFF(),
        ],
        "filters": [
            {"type": "formant", "cutoff": 0.5, "resonance": 20, "var": 55,
             "output_routing": "series"},
            {"type": "moog_lowpass_12", "cutoff": 0.45, "resonance": 10, "key_track": True},
        ],
        "envelopes": [ENV(1.8, 4.0, 0.85, 5.0), ENV(6.0, 8.0, 0.5, 5.0)],
        "lfos": [LFO(0.05), LFO(0.083), LFO(0.19),
                 LFO(0.29, shape="random_sh", smooth=80, mono=True), LFO(0.037)],
        "macros": [M("MORPH", 0), M("MOVEMENT", 50), M("SPACE", 45), M("COLLAPSE", 10)],
        "fx_chain": [
            FX("FXBode", 8, kParamShift=3, kParamRange=100, kParamFeedback=10),     # 0
            FX("FXDistortion", 15, kParamMode="kSinFold", kParamDrive=20),          # 1
            EQ(200, -2, 7000, -2),                                                  # 2
            COMP(0.45, 2.5, 20, 220, 1.7),                                          # 3
            FX("FXFlanger", 15, kParamRate=0.05, kParamDepth=30, kParamFeedback=30,
               kParamWidth=180),                                                    # 4
            DELAY(0.34, 0.21, 45, 3000, 15),                                        # 5
            VERB("kAbyss", 90, 50, 100, 28),                                        # 6
            UTIL(125, 70),                                                          # 7
        ],
        "mod_routes": [
            R("env1", "oscillator0.table_position", 30), R("env1", "oscillator2.table_position", 25),
            R("lfo4", "oscillator1.table_position", 30, True, "macro1"),
            R("lfo0", "oscillator0.table_position", 50, True, "macro1"),
            R("lfo1", "filter0.var", 50, True, "macro1"),
            R("lfo2", "oscillator1.warp_amount", 40, True, "macro1"),
            R("lfo3", "oscillator2.pan", 60, True, "macro1"),
            R("lfo4", "filter1.cutoff", 20, True, "macro1"),
            R("macro0", "oscillator0.table_position", 55), R("macro0", "filter0.var", 35),
            R("macro0", "oscillator1.warp_amount", 35), R("macro0", "fx0.wet", 25),
            R("macro1", "lfo0.rate", 20), R("macro1", "lfo1.rate", 20),
            R("macro2", "fx6.wet", 30), R("macro2", "fx5.wet", 22), R("macro2", "fx7.width", 25),
            R("macro3", "filter1.cutoff", -25), R("macro3", "fx1.wet", 30),
            R("macro3", "lfo3.rate", 30),
        ],
        "global": {"master_volume": 0.4, "poly_count": 8},
    })

    # ============================================== B. ANALOG & ELECTRONIC BASS
    # 06 -- unfiltered sine fundamental + filtered harmonic layer; FXSplit keeps lows dry/mono
    P.append({
        "name": "06 BS Submerged",
        "description": "Deep musical sub: clean unfiltered fundamental plus a controlled "
                       "harmonic layer for small-speaker readability; lows stay dry and mono.",
        "oscillators": [
            {"wavetable": "warm_sub", "table_position": 0, "octave": -1, "volume": 0.72,
             "filter_routing": "master"},
            {"wavetable": "analog_mini", "table_position": 60, "octave": -1, "volume": 0.3,
             "warp_mode": "soft_clip", "warp_amount": 0.3},
            OFF(), OFF(), OFF(),
        ],
        "filters": [{"type": "moog_lowpass_12", "cutoff": 0.3, "resonance": 6, "drive": 12}],
        "envelopes": [ENV(0.004, 0.4, 0.85, 0.06), ENV(0.0, 0.18, 0.15, 0.05)],
        "lfos": [],
        "macros": [M("HARMONICS", 25), M("CONTOUR", 30), M("SPACE", 0), M("PUNCH", 20)],
        "fx_chain": [
            FX("FXDistortion", 25, kParamMode="kSoftSat", kParamDrive=25),          # 0
            FX("FXSplit", 100, kParamFreq=160.0, kParamModuleCount1=1.0,
               kParamModuleCount2=2.0),                                             # 1
            COMP(0.5, 3.0, 10, 90, 1.6),                       # 2 low band
            FX("FXChorus", 12, kParamRate=0.4, kParamDepth=3, kParamDelay=5,
               kParamFilt=5000),                               # 3 high band
            VERB("kVintage", 25, 10, 80, 6),                   # 4 high band
            EQ(45, 1.0, 900, 1.5),                                                  # 5
            UTIL(100, 25),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 18),
            R("velocity", "filter0.cutoff", 8), R("velocity", "oscillator1.volume", 12),
            R("key_track", "filter0.cutoff", 10),
            R("macro0", "oscillator1.volume", 25), R("macro0", "fx0.wet", 35),
            R("macro0", "filter0.cutoff", 12),
            R("macro1", "env1.decay", 20), R("macro1", "filter0.resonance", 12),
            R("macro2", "fx3.wet", 25), R("macro2", "fx4.wet", 15),
            R("macro3", "env0.sustain", -25), R("macro3", "filter0.drive", 25),
        ],
        "global": {"master_volume": 0.5, "mono": True, "poly_count": 1, "legato": True},
    })

    # 07 -- bent analog shape + square bite layer + triangle sub, pluck filter env, per-note random
    P.append({
        "name": "07 BS Broken Pulse",
        "description": "Rhythmic analog bass for sequences: dense low end, short decay, "
                       "expressive filter transient, soft tape saturation, subtle per-note life.",
        "oscillators": [
            {"wavetable": "analog_basic", "table_position": 110, "octave": -1, "volume": 0.62,
             "warp_mode": "bend", "warp_amount": 0.2},
            {"wavetable": "default", "table_position": 200, "volume": 0.28},
            OFF(), OFF(),
            {"sub_shape": "triangle", "volume": 0.4, "octave": -1},
        ],
        "filters": [{"type": "moog_lowpass_24", "cutoff": 0.22, "resonance": 28, "drive": 20,
                     "key_track": True}],
        "envelopes": [ENV(0.002, 0.32, 0.35, 0.08), ENV(0.0, 0.16, 0.0, 0.05)],
        "lfos": [LFO(2.3, mode="Retrig")],
        "macros": [M("BITE", 25), M("FILTER MOTION", 40), M("SPACE", 10), M("ACCENT", 20)],
        "fx_chain": [
            FX("FXDistortion", 40, kParamMode="kTapeSat", kParamDrive=30),          # 0
            COMP(0.4, 4.0, 5, 80, 2.4),                                             # 1
            EQ(70, 1.0, 3200, -2),                                                  # 2
            FX("FXSplit", 100, kParamFreq=220.0, kParamModuleCount1=0.0,
               kParamModuleCount2=2.0),                                             # 3
            DELAY(0.17, 0.25, 25, 2500, 8),                    # 4 high band
            VERB("kVintage", 20, 5, 80, 5),                    # 5 high band
            UTIL(100, 28),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 32),
            R("velocity", "filter0.cutoff", 10, aux="macro3"),
            R("lfo0", "filter0.cutoff", 10, True, "macro1"),
            R("random1", "filter0.cutoff", 4, True),
            R("macro0", "oscillator1.volume", 25), R("macro0", "filter0.resonance", 15),
            R("macro0", "fx0.wet", 30),
            R("macro1", "env1.decay", 25),
            R("macro2", "fx4.wet", 20), R("macro2", "fx5.wet", 10),
            R("macro3", "filter0.cutoff", 15), R("macro3", "env0.decay", 15),
        ],
        "global": {"master_volume": 0.48, "mono": True, "poly_count": 1},
    })

    # 08 -- bespoke 'night' table soft->dense + sync acid layer; CHARACTER re-voices the whole bass
    P.append({
        "name": "08 BS Night Engine",
        "description": "Dark saturated bass with an aggressive mid and controlled low end; "
                       "SOFT>DENSE (Macro 1) morphs it from a round bass to a dense driven engine.",
        "oscillators": [
            {"custom_harmonics": table_night(), "table_position": 0, "octave": -1,
             "unison": 2, "detune": 0.05, "volume": 0.6},
            {"wavetable": "acid", "table_position": 60, "volume": 0.3, "warp_mode": "sync",
             "warp_amount": 0.1},
            OFF(), OFF(),
            {"sub_shape": "triangle", "volume": 0.45, "octave": -1},
        ],
        "filters": [{"type": "moog_lowpass_24", "cutoff": 0.25, "resonance": 18, "drive": 35}],
        "envelopes": [ENV(0.004, 0.6, 0.8, 0.07), ENV(0.01, 0.35, 0.2, 0.06)],
        "lfos": [LFO(0.25), LFO(0.4)],
        "macros": [M("SOFT>DENSE", 0), M("MOVEMENT", 30), M("SPACE", 5), M("GROWL", 15)],
        "fx_chain": [
            FX("FXDistortion", 30, kParamMode="kDiode1", kParamDrive=35),           # 0
            COMP(0.4, 4.0, 6, 90, 2.2),                                             # 1
            EQ(110, -1.5, 1200, 2.0),                                               # 2
            FX("FXFilter", 100, kParamFreq=0.7, kParamReso=5),                      # 3
            FX("FXSplit", 100, kParamFreq=180.0, kParamModuleCount1=0.0,
               kParamModuleCount2=2.0),                                             # 4
            FX("FXChorus", 8, kParamRate=0.3, kParamDepth=4, kParamDelay=6,
               kParamFilt=4000),                               # 5 high band
            VERB("kVintage", 30, 10, 80, 6),                   # 6 high band
            UTIL(100, 28),                                                          # 7
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 22),
            R("velocity", "filter0.cutoff", 10),
            R("lfo0", "filter0.cutoff", 16, True, "macro1"),
            R("lfo1", "oscillator1.table_position", 30, True, "macro1"),
            R("macro0", "oscillator0.table_position", 85), R("macro0", "oscillator1.warp_amount", 45),
            R("macro0", "filter0.cutoff", 18), R("macro0", "filter0.drive", 30),
            R("macro0", "fx0.wet", 45), R("macro0", "oscillator4.volume", -15),
            R("macro2", "fx5.wet", 20), R("macro2", "fx6.wet", 12),
            R("macro3", "filter0.resonance", 20), R("macro3", "env1.decay", 20),
        ],
        "global": {"master_volume": 0.45, "mono": True, "poly_count": 1, "legato": True,
                   "portamento_time": 0.03},
    })

    # 09 -- round triangle body + woody fm_piano transient shaped by its own envelope
    P.append({
        "name": "09 BS Soft Pressure",
        "description": "Soft round downtempo bass: slight attack, woody finger-like transient, "
                       "natural velocity response; sits well next to acoustic instruments.",
        "oscillators": [
            {"wavetable": "default", "table_position": 30, "octave": -1, "volume": 0.7},
            {"wavetable": "fm_piano", "table_position": 0, "octave": -1, "volume": 0.15},
            OFF(), OFF(), OFF(),
        ],
        "filters": [{"type": "lowpass_12", "cutoff": 0.27, "resonance": 5, "key_track": True}],
        "envelopes": [ENV(0.012, 1.2, 0.6, 0.15), ENV(0.0, 0.3, 0.0, 0.1),
                      ENV(0.0, 0.22, 0.0, 0.05)],
        "lfos": [],
        "macros": [M("WARMTH", 25), M("PLUCK MOTION", 30), M("SPACE", 5), M("MUTE", 0)],
        "fx_chain": [
            FX("FXDistortion", 25, kParamMode="kTapeSat", kParamDrive=15),          # 0
            COMP(0.45, 2.5, 15, 120, 1.6),                                          # 1
            EQ(220, -1.5, 2500, -2),                                                # 2
            FX("FXSplit", 100, kParamFreq=200.0, kParamModuleCount1=0.0,
               kParamModuleCount2=2.0),                                             # 3
            FX("FXChorus", 8, kParamRate=0.3, kParamDepth=3, kParamDelay=5,
               kParamFilt=4000),                               # 4 high band
            VERB("kVintage", 22, 5, 70, 5),                    # 5 high band
            UTIL(100, 30),                                                          # 6
        ],
        "mod_routes": [
            R("env2", "oscillator1.volume", 30), R("env2", "filter0.cutoff", 10),
            R("velocity", "filter0.cutoff", 12), R("velocity", "oscillator1.volume", 10),
            R("macro0", "oscillator1.volume", 20), R("macro0", "filter0.cutoff", 12),
            R("macro0", "fx0.wet", 25),
            R("macro1", "env2.decay", 25), R("macro1", "filter0.resonance", 10),
            R("macro2", "fx4.wet", 15), R("macro2", "fx5.wet", 10),
            R("macro3", "env0.decay", -30), R("macro3", "env0.sustain", -30),
        ],
        "global": {"master_volume": 0.5, "mono": True, "poly_count": 1, "legato": True,
                   "portamento_time": 0.04},
    })

    # ======================================================== C. MELODIC PLUCKS
    # 10 -- real balafon multisample transient + soft synthetic body
    P.append({
        "name": "10 PL Rain Signal",
        "description": "Melancholic electronic pluck: soft wooden transient (Factory balafon) "
                       "fused with a warm synth body, short impulse, long spatial tail.",
        "oscillators": [
            {"multisample_source": "mallet_balafon", "volume": 0.42},
            {"wavetable": "default", "table_position": 40, "unison": 2, "detune": 0.06,
             "volume": 0.45},
            OFF(), OFF(), OFF(),
        ],
        "filters": [{"type": "moog_lowpass_12", "cutoff": 0.4, "resonance": 14,
                     "key_track": True}],
        "envelopes": [ENV(0.004, 0.55, 0.0, 0.6), ENV(0.0, 0.25, 0.0, 0.2)],
        "lfos": [LFO(0.18), LFO(0.4)],
        "macros": [M("WARMTH", 25), M("MOVEMENT", 40), M("SPACE", 45), M("DECAY", 20)],
        "fx_chain": [
            EQ(300, -2, 7000, -2),                                                  # 0
            COMP(0.4, 3.0, 3, 90, 2.0),                                             # 1
            FX("FXDistortion", 12, kParamMode="kTapeSat", kParamDrive=12),          # 2
            FX("FXChorus", 18, kParamRate=0.25, kParamDepth=5, kParamDelay=8,
               kParamFilt=4000),                                                    # 3
            DELAY(0.32, 0.24, 42, 2200, 20),                                        # 4
            VERB("kHall", 75, 25, 100, 26),                                         # 5
            UTIL(120, 80),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 28),
            R("velocity", "filter0.cutoff", 12), R("velocity", "env0.decay", 8),
            R("lfo0", "oscillator1.table_position", 25, True, "macro1"),
            R("lfo1", "filter0.cutoff", 10, True, "macro1"),
            R("random1", "oscillator1.pan", 20, True),
            R("macro0", "filter0.cutoff", 18), R("macro0", "oscillator0.volume", 15),
            R("macro0", "fx2.wet", 20),
            R("macro1", "env1.decay", 20),
            R("macro2", "fx4.wet", 25), R("macro2", "fx5.wet", 25),
            R("macro3", "env0.decay", 25), R("macro3", "env1.decay", 20),
        ],
        "global": {"master_volume": 0.48, "poly_count": 12},
    })

    # 11 -- true 2-operator FM (Osc B 3:1 modulator), FM-index envelope, noise click
    P.append({
        "name": "11 PL Distant Lights",
        "description": "Transparent digital pluck: two-operator FM glass, clean attack with an "
                       "FM-index envelope, precise pitch centre, delicate stereo delay.",
        "oscillators": [
            {"wavetable": "default", "table_position": 0, "volume": 0.6,
             "warp_mode": "fm", "warp_amount": 0.22},
            {"wavetable": "default", "table_position": 0, "octave": 1, "semitone": 7,
             "volume": 0.12},
            OFF(),
            {"noise_type": "White", "volume": 0.04},
            OFF(),
        ],
        "filters": [{"type": "lowpass_12", "cutoff": 0.7, "resonance": 6, "key_track": True}],
        "envelopes": [ENV(0.002, 0.38, 0.0, 0.35), ENV(0.0, 0.3, 0.0, 0.1),
                      ENV(0.0, 0.03, 0.0, 0.02)],
        "lfos": [LFO(0.3)],
        "macros": [M("GLASS", 20), M("MOVEMENT", 30), M("SPACE", 40), M("LENGTH", 15)],
        "fx_chain": [
            EQ(200, -3, 5000, 1.0),                                                 # 0
            COMP(0.45, 3.0, 2, 60, 1.8),                                            # 1
            DELAY(0.19, 0.25, 30, 6000, 16),                                        # 2
            VERB("kSpace", 55, 20, 100, 16),                                        # 3
            UTIL(110, 120),                                                         # 4
        ],
        "mod_routes": [
            R("env2", "oscillator3.volume", 25), R("env1", "oscillator0.warp_amount", 30),
            R("velocity", "oscillator0.warp_amount", 20), R("velocity", "env0.decay", 8),
            R("key_track", "oscillator0.warp_amount", -10),
            R("lfo0", "oscillator1.fine", 5, True, "macro1"),
            R("macro0", "oscillator0.warp_amount", 30), R("macro0", "oscillator1.volume", 10),
            R("macro0", "filter0.cutoff", 10),
            R("macro1", "env1.decay", 30),
            R("macro2", "fx2.wet", 25), R("macro2", "fx3.wet", 20), R("macro2", "fx4.width", 15),
            R("macro3", "env0.decay", 25), R("macro3", "env0.release", 20),
        ],
        "global": {"master_volume": 0.48, "poly_count": 12},
    })

    # 12 -- 'fractal' sparse-partial table picked per note, comb resonator, velocity-depth macro
    P.append({
        "name": "12 PL Fractal Drops",
        "description": "Experimental modulated pluck: sparse fractal partial sets chosen per note, "
                       "a comb resonator and strongly velocity-shaped timbre.",
        "oscillators": [
            {"custom_harmonics": table_fractal(), "table_position": 40, "volume": 0.55},
            {"wavetable": "analog_basic", "table_position": 60, "octave": 1, "volume": 0.3,
             "warp_mode": "sync", "warp_amount": 0.3},
            OFF(), OFF(), OFF(),
        ],
        "filters": [
            {"type": "comb", "cutoff": 0.55, "resonance": 35, "var": 60, "wet": 55,
             "output_routing": "series"},
            {"type": "lowpass_12", "cutoff": 0.6, "resonance": 5, "key_track": True},
        ],
        "envelopes": [ENV(0.001, 0.28, 0.0, 0.3), ENV(0.0, 0.12, 0.0, 0.1)],
        "lfos": [LFO(6.0, shape="random_sh", smooth=30, mono=True)],
        "macros": [M("FRACTURE", 20), M("MOVEMENT", 40), M("SPACE", 35), M("VELO DEPTH", 60)],
        "fx_chain": [
            FX("FXDistortion", 12, kParamMode="kXShaper", kParamDrive=12),          # 0
            EQ(220, -2, 6000, -1),                                                  # 1
            COMP(0.45, 3.0, 2, 70, 1.8),                                            # 2
            DELAY(0.15, 0.23, 45, 4000, 18),                                        # 3
            VERB("kSpace", 60, 15, 100, 18),                                        # 4
            UTIL(115, 100),                                                         # 5
        ],
        "mod_routes": [
            R("env1", "oscillator0.table_position", 25), R("env1", "filter1.cutoff", 20),
            R("env1", "oscillator1.table_position", 15),
            R("random_discrete", "oscillator0.table_position", 30, True),
            R("random2", "filter0.var", 12, True),
            R("random1", "oscillator0.pan", 14, True),
            R("velocity", "oscillator1.warp_amount", 35, aux="macro3"),
            R("velocity", "filter0.resonance", 20, aux="macro3"),
            R("velocity", "env0.decay", 15, aux="macro3"),
            R("velocity", "filter1.cutoff", 15, aux="macro3"),
            R("lfo0", "filter0.var", 16, True, "macro1"),
            R("macro0", "oscillator1.warp_amount", 30), R("macro0", "filter0.wet", 30),
            R("macro0", "oscillator0.table_position", 20),
            R("macro1", "lfo0.rate", 25),
            R("macro2", "fx3.wet", 25), R("macro2", "fx4.wet", 20),
            R("macro3", "env0.decay", 10),
        ],
        "global": {"master_volume": 0.46, "poly_count": 12},
    })

    # ====================================================== D. EVOLVING TEXTURES
    # 13 -- granular cloud of tuned pentatonic particles + breath bed, 6 independent cycles
    P.append({
        "name": "13 TX Particle Field",
        "description": "Generative digital texture: a granular cloud of tuned pentatonic "
                       "particles over a breath bed, six independent modulation cycles.",
        "oscillators": [
            {"granular_source": str(SOURCES / "pluit_particle_source.wav"), "volume": 0.6,
             "granular_density": 18, "granular_grain_length": 120,
             "granular_random_pitch": 0, "granular_random_pan": 70,
             "granular_random_grain_length": 40, "granular_random_offset": 60,
             "granular_max_grains": 32, "granular_random_window_amount": 30},
            {"wavetable": "flute", "table_position": 150, "volume": 0.3},
            OFF(),
            {"noise_type": "Pink", "volume": 0.05},
            OFF(),
        ],
        "filters": [
            {"type": "lowpass_24", "cutoff": 0.55, "resonance": 12, "output_routing": "series"},
            {"type": "highpass_12", "cutoff": 0.1, "resonance": 0},
        ],
        "envelopes": [ENV(1.2, 3.0, 0.9, 5.0), ENV(6.0, 10.0, 0.7, 5.0)],
        "lfos": [LFO(0.07), LFO(0.11, shape="random_sh", smooth=90, mono=True), LFO(0.17),
                 LFO(0.023), LFO(0.29), LFO(3.3, shape="random_sh", smooth=40, mono=True)],
        "macros": [M("SPECTRUM", 25), M("ACTIVITY", 50), M("SPACE", 50), M("SWELL", 0)],
        "fx_chain": [
            EQ(200, -2, 8000, -1.5),                                                # 0
            COMP(0.5, 2.0, 30, 250, 1.4),                                           # 1
            FX("FXPhaser", 15, kParamRate=0.05, kParamDepth=40, kParamFeedback=15,
               kParamFreq=900, kParamNumPoles=8),                                   # 2
            DELAY(0.34, 0.27, 55, 3500, 20),                                        # 3
            VERB("kAbyss", 92, 40, 100, 30),                                        # 4
            UTIL(140, 60),                                                          # 5
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 18), R("env1", "oscillator1.volume", 15),
            R("lfo0", "filter0.cutoff", 24, True, "macro1"),
            R("lfo1", "oscillator0.pan", 50, True, "macro1"),
            R("lfo2", "oscillator1.table_position", 50, True, "macro1"),
            R("lfo3", "oscillator0.volume", 30, True, "macro1"),
            R("lfo4", "oscillator1.fine", 8, True, "macro1"),
            R("lfo5", "filter1.cutoff", 12, True, "macro1"),
            R("macro0", "filter0.cutoff", 25), R("macro0", "oscillator1.table_position", 30),
            R("macro0", "fx2.wet", 20),
            R("macro1", "lfo0.rate", 15), R("macro1", "lfo1.rate", 15),
            R("macro2", "fx4.wet", 25), R("macro2", "fx3.wet", 20), R("macro2", "fx5.width", 20),
            R("macro3", "env0.attack", 20), R("macro3", "oscillator0.volume", 20),
        ],
        "global": {"master_volume": 0.42, "poly_count": 6},
    })

    # 14 -- Factory choir 'ghost vocal' + soft sine base, band-pass transmission, STATIC macro
    P.append({
        "name": "14 TX Ghost Transmission",
        "description": "Future-garage atmosphere: a ghostly choir through a drifting band-pass "
                       "over a soft base tone; STATIC (Macro 1) fades in noise and digital decay.",
        "oscillators": [
            {"multisample_source": "choir_ah", "volume": 0.45,
             "multisample_env_attack": 0.3, "multisample_env_release": 2.0},
            {"wavetable": "warm_sub", "table_position": 128, "volume": 0.35},
            OFF(),
            {"noise_type": "White", "volume": 0.06},
            OFF(),
        ],
        "filters": [
            {"type": "bandpass_12", "cutoff": 0.5, "resonance": 18, "wet": 60,
             "output_routing": "series"},
            {"type": "lowpass_12", "cutoff": 0.42, "resonance": 10, "key_track": True},
        ],
        "envelopes": [ENV(0.8, 3.0, 0.85, 4.0)],
        "lfos": [LFO(0.8, shape="random_sh", smooth=75, mono=True), LFO(0.21),
                 LFO(3.1, shape="random_sh", smooth=10, mono=True), LFO(0.37)],
        "macros": [M("STATIC", 15), M("MOVEMENT", 50), M("SPACE", 45), M("VOICE", 20)],
        "fx_chain": [
            FX("FXDistortion", 20, kParamMode="kDownsample", kParamDrive=18),       # 0
            EQ(250, -3, 4500, -4),                                                  # 1
            COMP(0.45, 2.5, 20, 200, 1.6),                                          # 2
            FX("FXChorus", 22, kParamRate=0.45, kParamDepth=7, kParamDelay=9,
               kParamFilt=3000),                                                    # 3
            DELAY(0.34, 0.32, 50, 1500, 18),                                        # 4
            VERB("kVintage", 80, 30, 100, 30),                                      # 5
            UTIL(125, 90),                                                          # 6
        ],
        "mod_routes": [
            R("lfo0", "filter1.cutoff", 18, True, "macro1"),
            R("lfo1", "filter0.cutoff", 12, True, "macro1"),
            R("lfo2", "oscillator0.volume", 24, True, "macro1"),
            R("lfo3", "oscillator0.fine", 12, True, "macro1"),
            R("velocity", "oscillator0.volume", 12),
            R("macro0", "oscillator3.volume", 40), R("macro0", "fx0.wet", 40),
            R("macro0", "filter0.wet", 30),
            R("macro1", "lfo0.rate", 15),
            R("macro2", "fx5.wet", 30), R("macro2", "fx4.wet", 22), R("macro2", "fx6.width", 20),
            R("macro3", "oscillator0.volume", 25), R("macro3", "filter1.cutoff", 15),
        ],
        "global": {"master_volume": 0.44, "poly_count": 8},
    })

    # 15 -- granular breath-resonance source + bespoke wood-bar table + OSCAR tonal base
    P.append({
        "name": "15 TX Organic System",
        "description": "Organic electronic texture: granular breath resonating on the harmonic "
                       "series, a wooden-bar wavetable and a warm tonal base; built for intros.",
        "oscillators": [
            {"granular_source": str(SOURCES / "pluit_organic_source.wav"), "volume": 0.5,
             "granular_density": 12, "granular_grain_length": 220,
             "granular_random_pan": 50, "granular_random_grain_length": 50,
             "granular_random_offset": 40, "granular_max_grains": 24},
            {"custom_harmonics": table_wood(), "table_position": 60, "volume": 0.4},
            {"wavetable": "analog_warm", "table_position": 60, "octave": -1, "volume": 0.3},
            OFF(), OFF(),
        ],
        "filters": [
            {"type": "moog_lowpass_12", "cutoff": 0.46, "resonance": 14, "key_track": True,
             "output_routing": "series"},
            {"type": "formant", "cutoff": 0.5, "resonance": 10, "var": 40, "wet": 35},
        ],
        "envelopes": [ENV(1.5, 3.0, 0.9, 4.0), ENV(5.0, 6.0, 0.7, 4.0)],
        "lfos": [LFO(0.13), LFO(0.071, shape="random_sh", smooth=95, mono=True), LFO(0.19),
                 LFO(0.43, shape="random_sh", smooth=85), LFO(0.05)],
        "macros": [M("GRAIN/WOOD", 20), M("MOVEMENT", 50), M("SPACE", 40), M("BLOOM", 10)],
        "fx_chain": [
            EQ(220, -2, 7000, -2),                                                  # 0
            COMP(0.5, 2.0, 25, 220, 1.4),                                           # 1
            FX("FXChorus", 20, kParamRate=0.2, kParamDepth=8, kParamDelay=10,
               kParamFilt=5000),                                                    # 2
            DELAY(0.31, 0.32, 35, 3000, 14),                                        # 3
            VERB("kHall", 78, 35, 100, 26),                                         # 4
            UTIL(130, 50),                                                          # 5
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 15),
            R("lfo0", "oscillator1.table_position", 60, True, "macro1"),
            R("lfo1", "filter0.cutoff", 16, True, "macro1"),
            R("lfo2", "filter1.var", 40, True, "macro1"),
            R("lfo3", "oscillator1.fine", 6, True, "macro1"),
            R("lfo4", "oscillator0.volume", 24, True, "macro1"),
            R("macro0", "oscillator0.volume", 20), R("macro0", "filter1.wet", 30),
            R("macro0", "oscillator1.table_position", 30),
            R("macro2", "fx4.wet", 28), R("macro2", "fx3.wet", 20), R("macro2", "fx2.wet", 15),
            R("macro3", "filter0.cutoff", 25), R("macro3", "oscillator2.volume", 15),
        ],
        "global": {"master_volume": 0.44, "poly_count": 8},
    })

    # ========================================================= E. ANALOG KEYS
    # 16 -- Factory grand piano, felt-darkened, electronic FM body, hammer-thump noise
    P.append({
        "name": "16 KY Felt Circuit",
        "description": "Soft electronic felt keys: muted grand-piano attack, a quiet FM body, "
                       "a faint hammer thump, controlled decay and natural velocity.",
        "oscillators": [
            {"multisample_source": "piano_grand", "volume": 0.55, "multisample_env_attack": 0.006},
            {"wavetable": "fm_piano", "table_position": 0, "volume": 0.25},
            OFF(),
            {"noise_type": "Brown", "volume": 0.03},
            OFF(),
        ],
        "filters": [{"type": "moog_lowpass_12", "cutoff": 0.3, "resonance": 6, "key_track": True}],
        "envelopes": [ENV(0.006, 2.5, 0.25, 0.5), ENV(0.0, 0.3, 0.0, 0.1),
                      ENV(0.0, 0.06, 0.0, 0.03)],
        "lfos": [LFO(0.25)],
        "macros": [M("FELT", 30), M("MOVEMENT", 30), M("SPACE", 15), M("PEDAL", 0)],
        "fx_chain": [
            EQ(180, -1, 6000, -4),                                                  # 0
            COMP(0.45, 2.5, 8, 120, 1.6),                                           # 1
            FX("FXDistortion", 15, kParamMode="kTapeSat", kParamDrive=10),          # 2
            VERB("kVintage", 35, 10, 80, 12),                                       # 3
            UTIL(105, 40),                                                          # 4
        ],
        "mod_routes": [
            R("env2", "oscillator3.volume", 18),
            R("velocity", "filter0.cutoff", 22), R("velocity", "oscillator1.volume", 10),
            R("velocity", "oscillator3.volume", 10),
            R("lfo0", "oscillator1.fine", 4, True, "macro1"),
            R("macro0", "filter0.cutoff", -18), R("macro0", "oscillator3.volume", 10),
            R("macro0", "fx2.wet", 15),
            R("macro2", "fx3.wet", 30), R("macro2", "fx4.width", 15),
            R("macro3", "env0.sustain", 40), R("macro3", "env0.release", 20),
        ],
        "global": {"master_volume": 0.48, "poly_count": 12},
    })

    # 17 -- Factory suitcase e-piano + detuned triangle, wow/flutter, tape hiss, glue comp
    P.append({
        "name": "17 KY Worn Cassette",
        "description": "Vintage keys on an old cassette: suitcase e-piano with a detuned analog "
                       "layer, wow and flutter, muted upper mids, soft tape compression.",
        "oscillators": [
            {"multisample_source": "epiano_suitcase", "volume": 0.5},
            {"wavetable": "analog_basic", "table_position": 40, "fine": 7, "volume": 0.3},
            OFF(),
            {"noise_type": "Pink", "volume": 0.05, "filter_routing": "master"},
            OFF(),
        ],
        "filters": [{"type": "lowpass_12", "cutoff": 0.38, "resonance": 8, "key_track": True}],
        "envelopes": [ENV(0.004, 2.8, 0.35, 0.6)],
        "lfos": [LFO(0.6), LFO(7.5, shape="random_sh", smooth=60, mono=True), LFO(0.09)],
        "macros": [M("TAPE AGE", 30), M("WOW/FLUTTER", 50), M("SPACE", 25), M("TONE", 20)],
        "fx_chain": [
            FX("FXDistortion", 35, kParamMode="kTapeSat", kParamDrive=28),          # 0
            COMP(0.35, 4.0, 15, 150, 2.4),                                          # 1
            EQ(120, -2, 4000, -6),                                                  # 2
            FX("FXChorus", 25, kParamRate=0.7, kParamDepth=5, kParamDelay=8,
               kParamFilt=3000),                                                    # 3
            VERB("kVintage", 45, 15, 85, 14),                                       # 4
            UTIL(110, 55, 9000),                                                    # 5
        ],
        "mod_routes": [
            R("lfo0", "oscillator0.fine", 10, True, "macro1"),
            R("lfo0", "oscillator1.fine", 10, True, "macro1"),
            R("lfo1", "oscillator0.fine", 2.5, True, "macro1"),
            R("lfo1", "oscillator1.fine", 2.5, True, "macro1"),
            R("lfo2", "filter0.cutoff", 5, True),
            R("random1", "oscillator0.fine", 3, True),
            R("velocity", "filter0.cutoff", 12),
            R("macro0", "fx0.wet", 35), R("macro0", "filter0.cutoff", -15),
            R("macro0", "oscillator3.volume", 10),
            R("macro1", "lfo0.rate", 10),
            R("macro2", "fx4.wet", 25), R("macro2", "fx3.wet", 15),
            R("macro3", "filter0.cutoff", 20), R("macro3", "oscillator1.volume", 15),
        ],
        "global": {"master_volume": 0.46, "poly_count": 12},
    })

    # 18 -- bespoke tine table swept by envelope+velocity, SuperJX pad body, Rhodes auto-pan
    P.append({
        "name": "18 KY Blue Hours",
        "description": "Melancholic electronic keys: a custom tine wavetable that barks on the "
                       "attack and mellows, a lush pad body, stereo auto-pan, long decay.",
        "oscillators": [
            {"custom_harmonics": table_tine(), "table_position": 0, "volume": 0.55},
            {"multisample_source": "synth_pad_superjx", "volume": 0.28,
             "multisample_env_attack": 0.05, "multisample_env_release": 1.2},
            OFF(), OFF(), OFF(),
        ],
        "filters": [{"type": "moog_lowpass_24", "cutoff": 0.5, "resonance": 8, "key_track": True}],
        "envelopes": [ENV(0.01, 4.0, 0.3, 1.2), ENV(0.0, 0.5, 0.1, 0.4)],
        "lfos": [LFO(4.2), LFO(0.2)],
        "macros": [M("TINE", 20), M("AUTO-PAN", 40), M("SPACE", 35), M("DYNAMICS", 60)],
        "fx_chain": [
            EQ(200, -1.5, 6500, -1.5),                                              # 0
            COMP(0.45, 2.5, 10, 140, 1.6),                                          # 1
            FX("FXPhaser", 15, kParamRate=0.15, kParamDepth=30, kParamFeedback=10,
               kParamFreq=700, kParamNumPoles=4),                                   # 2
            FX("FXChorus", 15, kParamRate=0.4, kParamDepth=4, kParamDelay=7,
               kParamFilt=5000),                                                    # 3
            DELAY(0.30, 0.32, 30, 3000, 14),                                        # 4
            VERB("kHall", 60, 25, 100, 20),                                         # 5
            UTIL(115, 60),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "oscillator0.table_position", 60),
            R("velocity", "oscillator0.table_position", 30, aux="macro3"),
            R("velocity", "filter0.cutoff", 12, aux="macro3"),
            R("lfo0", "oscillator0.pan", 36, True, "macro1"),
            R("lfo1", "filter0.cutoff", 8, True, "macro1"),
            R("key_track", "oscillator1.volume", -12),
            R("macro0", "oscillator0.table_position", 30), R("macro0", "filter0.cutoff", 12),
            R("macro1", "lfo0.rate", 15),
            R("macro2", "fx5.wet", 25), R("macro2", "fx4.wet", 18), R("macro2", "fx2.wet", 15),
            R("macro3", "env0.decay", 15),
        ],
        "global": {"master_volume": 0.46, "poly_count": 12},
    })

    # ==================================================== F. EXPERIMENTAL LEADS
    # 19 -- acid saw + PWM body, per-note pitch error, delayed vibrato, bend->filter
    P.append({
        "name": "19 LD Human Error",
        "description": "Expressive mono lead: slight analog pitch error, dense mid, expressive "
                       "filter, controlled glide; responds to pitch bend, mod wheel and velocity.",
        "oscillators": [
            {"wavetable": "acid", "table_position": 80, "unison": 2, "detune": 0.07,
             "volume": 0.6, "warp_mode": "bend", "warp_amount": 0.15},
            {"wavetable": "pwm", "table_position": 40, "octave": -1, "volume": 0.35},
            OFF(), OFF(), OFF(),
        ],
        "filters": [{"type": "moog_lowpass_24", "cutoff": 0.38, "resonance": 22, "drive": 25,
                     "key_track": True}],
        "envelopes": [ENV(0.012, 1.1, 0.75, 0.35), ENV(0.02, 0.6, 0.3, 0.3)],
        "lfos": [LFO(0.3, shape="random_sh", smooth=90, mono=True),
                 LFO(5.2, delay=0.5, rise=0.8)],
        "macros": [M("GRIT", 25), M("VIBRATO/DRIFT", 50), M("SPACE", 30), M("DYNAMICS", 60)],
        "fx_chain": [
            FX("FXDistortion", 30, kParamMode="kSoftSat", kParamDrive=25),          # 0
            COMP(0.45, 3.0, 8, 120, 2.0),                                           # 1
            EQ(250, -1.5, 5000, -2),                                                # 2
            FX("FXChorus", 10, kParamRate=0.5, kParamDepth=4, kParamDelay=6,
               kParamFilt=4000),                                                    # 3
            DELAY(0.34, 0.26, 38, 2600, 16),                                        # 4
            VERB("kHall", 55, 20, 100, 14),                                         # 5
            UTIL(110, 70),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "filter0.cutoff", 25), R("env1", "oscillator0.table_position", 12),
            R("lfo0", "oscillator0.fine", 8, True, "macro1"),
            R("lfo0", "oscillator1.table_position", 40, True, "macro1"),
            R("lfo1", "oscillator0.pitch", 2.4, True, "macro1"),
            R("lfo1", "oscillator1.pitch", 2.4, True, "macro1"),
            R("random1", "oscillator0.fine", 4, True), R("random2", "oscillator1.fine", 3, True),
            R("velocity", "filter0.cutoff", 15, aux="macro3"),
            R("velocity", "env1.decay", 10, aux="macro3"),
            R("pitch_bend", "filter0.cutoff", 10, True),
            R("mod_wheel", "filter0.resonance", 15),
            R("aftertouch", "oscillator0.pitch", 1.2, True),
            R("macro0", "fx0.wet", 35), R("macro0", "filter0.drive", 30),
            R("macro0", "oscillator0.warp_amount", 25),
            R("macro2", "fx4.wet", 25), R("macro2", "fx5.wet", 20),
            R("macro3", "filter0.cutoff", 10),
        ],
        "global": {"master_volume": 0.45, "mono": True, "poly_count": 1, "legato": True,
                   "portamento_time": 0.09, "bend_range_up": 2, "bend_range_down": -2},
    })

    # 20 -- bespoke 'bloom' sine->rich table on a 3.5 s envelope, comb shimmer, BLOOM macro
    P.append({
        "name": "20 LD Neural Bloom",
        "description": "Experimental melodic lead: a clear sine centre that gradually blooms "
                       "into richer harmonics as the note is held; BLOOM (Macro 4) transforms it.",
        "oscillators": [
            {"custom_harmonics": table_bloom(), "table_position": 0, "volume": 0.6},
            {"wavetable": "digital_fm", "table_position": 60, "octave": 1, "volume": 0.28,
             "warp_mode": "filter_lpf", "warp_amount": 0.4},
            OFF(), OFF(), OFF(),
        ],
        "filters": [
            {"type": "lowpass_12", "cutoff": 0.45, "resonance": 15, "key_track": True,
             "output_routing": "series"},
            {"type": "comb", "cutoff": 0.6, "resonance": 30, "var": 65, "wet": 25},
        ],
        "envelopes": [ENV(0.03, 1.5, 0.85, 0.6), ENV(3.5, 4.0, 0.8, 1.0)],
        "lfos": [LFO(5.0, delay=1.0, rise=1.5), LFO(0.16), LFO(0.09),
                 LFO(0.27, shape="random_sh", smooth=80, mono=True)],
        "macros": [M("HARMONICS", 20), M("MOVEMENT", 50), M("SPACE", 40), M("BLOOM", 25)],
        "fx_chain": [
            EQ(220, -1.5, 6000, -1),                                                # 0
            FX("FXDistortion", 15, kParamMode="kSoftSat", kParamDrive=15),          # 1
            COMP(0.45, 2.5, 10, 150, 1.7),                                          # 2
            FX("FXHyperD", 15, kParamRate=20, kParamDetune=15, kParamUnison=3,
               kParamDimESize=40, kParamDimEWet=30),                                # 3
            DELAY(0.34, 0.28, 45, 4500, 18),                                        # 4
            VERB("kSpace", 80, 30, 100, 22),                                        # 5
            UTIL(115, 80),                                                          # 6
        ],
        "mod_routes": [
            R("env1", "oscillator0.table_position", 70), R("env1", "filter0.cutoff", 20),
            R("env1", "oscillator1.volume", 18), R("env1", "filter1.wet", 20),
            R("lfo0", "oscillator0.pitch", 2.0, True, "macro3"),
            R("lfo1", "filter1.var", 30, True, "macro1"),
            R("lfo2", "oscillator0.table_position", 24, True, "macro1"),
            R("lfo2", "oscillator1.table_position", 30, True, "macro1"),
            R("lfo3", "oscillator1.pan", 50, True, "macro1"),
            R("velocity", "env1.attack", -15), R("velocity", "filter0.cutoff", 10),
            R("macro0", "oscillator1.warp_amount", 30), R("macro0", "oscillator1.volume", 15),
            R("macro1", "lfo1.rate", 15),
            R("macro2", "fx4.wet", 25), R("macro2", "fx5.wet", 22), R("macro2", "fx6.width", 20),
            R("macro3", "oscillator0.table_position", 40), R("macro3", "filter0.cutoff", 25),
            R("macro3", "filter1.wet", 30), R("macro3", "env1.attack", -30),
            R("macro3", "fx1.wet", 20),
        ],
        "global": {"master_volume": 0.44, "mono": True, "poly_count": 1, "legato": True,
                   "portamento_time": 0.12, "bend_range_up": 2, "bend_range_down": -2},
    })

    return P
