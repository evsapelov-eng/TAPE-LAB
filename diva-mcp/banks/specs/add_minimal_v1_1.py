"""Appends the v1.1 additions (spatial pads, rhythmic arps, Reese basses, riser)
to banks/specs/pluit-minimal-analog-vol-01.json. Idempotent: skips existing names.

    python3 -I banks/specs/add_minimal_v1_1.py
"""
import json
import os

P = os.path.join(os.path.dirname(__file__), 'pluit-minimal-analog-vol-01.json')
A = "PLUIT / diva-mcp"


def preset(name, cat, desc, usage, feat, char, concept, body, level):
    d = {"meta": {"name": name, "author": A, "description": desc, "usage": usage, "categories": [cat], "features": feat, "character": char}, "concept": concept}
    d.update(body)
    d.setdefault("amp", {})
    d["amp"].update({"output": level[0], "volume": level[1], "vca": "env1"})
    d.setdefault("fx1", {"type": "off"})
    d.setdefault("fx2", {"type": "off"})
    return d


def env(a, d, s, r, v=30, m="analogue", **k):
    return dict(model=m, attack=a, decay=d, sustain=s, release=r, velocity=v, **k)


def dv(o1, o2, **k):
    osc1 = {"octave": 0, "triangle": False, "saw": False, "pulse": False, "noise": False, **o1}
    osc2 = {"sine": False, "triangle": False, "saw": False, "pulse": False, **o2}
    return {"model": "dual_vco", "osc1": osc1, "osc2": osc2, **k}


def tv(o1, o2, o3, **k):
    base = {"noise": {"volume": 0}, "feedback": 0, "fm": 0, "tune_mod_targets": [], "shape_mod_targets": []}
    base.update(k)
    return {"model": "triple_vco", "osc1": {"octave": 0, **o1}, "osc2": o2, "osc3": o3, **base}


def lfo(w, r, restart="random", **k):
    return {"waveform": w, "restart": restart, "sync_raw": -2, "rate": r, "depth": 100, "depth_source": "none", **k}


NEW = [
    # ---------------- SPATIAL PADS
    preset("PD Wide Horizon", "Pads:Analogue", "Wide, open analogue pad: saws a fifth apart, per-note random panning, ensemble chorus into a huge plate.", "Hold chords; each note lands at a different stereo position.", ["Poly", "Stereo"], ["Wide", "Warm", "Spacey"],
           {"intent": "A wide horizon of sound that fills the stereo field without getting harsh.", "spectral": "Dual VCO saws, VCO2 a fifth up (+7.04 st), quieter.", "filtering": "Cascade clean, medium cutoff, slow Env2.", "modulation": "Random -> pan (per-note stereo spread), slow LFO2 -> cutoff.", "space": "Ensemble chorus -> large plate (size 195, decay 78).", "architecture": "Dual VCO + Cascade, the Analog Memories family, widened."},
           {"oscillator": dv({"saw": True}, {"semitones": 7.04, "saw": True}, mix=38, shape_model="analog1"),
            "hpf": {"model": "pre", "frequency": 40}, "filter": {"model": "cascade", "cutoff": 76, "resonance": 8, "key_follow": 35, "slope": "24db", "character": "clean"},
            "env1": env(60, 70, 90, 68, 15), "env2": env(65, 75, 50, 65, 5), "lfo2": lfo("triangle", -2),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 14}, "cutoff_2": {"source": "LFO2", "amount": 5}, "pan": {"source": "Random", "amount": 45}},
            "voice": {"mode": "poly", "voices": 8}, "trimmers": {"drift": 45, "cutoff_variance": 10},
            "fx1": {"type": "chorus", "variant": "ensemble", "rate": 18, "depth": 55, "wet": 65},
            "fx2": {"type": "plate", "predelay": 35, "diffusion": 95, "damp": 72, "decay": 78, "size": 195, "dry": 86, "wet": 34}}, (74, 40)),
    preset("PD Glass Cathedral", "Pads:Digital", "Shimmering digital space: Multisaw plus an octave triangle through a silky Uhbie, long echo and a cathedral plate.", "Hold notes high on the keyboard for shimmer.", ["Poly", "Stereo"], ["Bright", "Glassy", "Spacey"],
           {"intent": "A glassy, airy cathedral of sound for breakdowns.", "spectral": "Digital Multisaw (dense supersaw-type) + triangle an octave up.", "filtering": "Uhbie mostly low-pass, low resonance, strong key follow.", "modulation": "Slow LFO2 -> Uhbie mix for a breathing tone.", "space": "Delay (6/8/12 sixteenths, damped) -> plate size 200.", "architecture": "Digital + Uhbie: digital spectrum for shimmer, Uhbie keeps it smooth."},
           {"oscillator": {"model": "digital", "osc1": {"octave": 0, "wave": "multisaw"}, "osc2": {"semitones": 12, "wave": "triangle"}, "mix": 35, "high_quality": True},
            "hpf": {"model": "pre", "frequency": 50}, "filter": {"model": "uhbie", "cutoff": 88, "resonance": 12, "key_follow": 60, "uhbie_mix": 10, "uhbie_center": "notch"},
            "env1": env(65, 70, 95, 75, 10), "env2": env(70, 70, 60, 70, 0), "lfo2": lfo("sine", -2.5),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 10}, "uhbie_mix": {"source": "LFO2", "amount": 12}},
            "voice": {"mode": "poly", "voices": 8},
            "fx1": {"type": "delay", "left": 6, "center": 8, "right": 12, "side_vol": 30, "center_vol": 10, "feedback": 45, "hp": 35, "lp": 60, "dry": 100, "wow": 15},
            "fx2": {"type": "plate", "predelay": 40, "diffusion": 100, "damp": 65, "decay": 85, "size": 200, "dry": 85, "wet": 32}}, (70, 38)),
    preset("PD Organic Breath", "Pads:Analogue", "Breathy, organic pad: triangle plus noise and a soft octave sine, gently moving filter, dramatic chorus.", "Velocity = breath. Great for organic house intros.", ["Poly", "Stereo"], ["Soft", "Organic", "Airy"],
           {"intent": "A soft, breathing pad with an airy, almost flute-like texture for organic house.", "spectral": "Dual VCO: triangle + noise on VCO1, sine an octave up on VCO2.", "filtering": "Multimode LP2, slow random cutoff movement.", "modulation": "LFO2 random-glide -> cutoff mod 2; velocity on Env2.", "space": "Dramatic chorus -> medium plate.", "architecture": "Dual VCO lets noise ride inside VCO1 for natural breath; Multimode LP2 keeps it open."},
           {"oscillator": dv({"triangle": True, "noise": True}, {"semitones": 12, "sine": True}, mix=40, shape_model="ideal"),
            "filter": {"model": "multimode", "mode": "lp2", "cutoff": 74, "resonance": 15, "key_follow": 45},
            "env1": env(45, 60, 80, 55, 35), "env2": env(50, 60, 40, 50, 40), "lfo2": lfo("random_glide", -1.5),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 15}, "cutoff_2": {"source": "LFO2", "amount": 9}},
            "voice": {"mode": "poly", "voices": 8}, "trimmers": {"drift": 35},
            "fx1": {"type": "chorus", "variant": "dramatic", "rate": 15, "depth": 45, "wet": 50},
            "fx2": {"type": "plate", "predelay": 20, "diffusion": 90, "damp": 80, "decay": 62, "size": 160, "dry": 88, "wet": 30}}, (76, 42)),
    preset("PD Deep Ocean", "Pads:Analogue", "Dark, submerged pad: triangle and an octave-down saw in a low ladder, slow phaser, deep plate.", "Low-register chords; mod wheel opens the filter.", ["Poly", "Stereo"], ["Dark", "Deep", "Moving"],
           {"intent": "A dark, slowly rolling underwater pad for deep minimal.", "spectral": "Triple VCO: triangle osc1, saw osc2 an octave down, quiet detuned osc3.", "filtering": "Ladder low cutoff; mod wheel opens it.", "modulation": "Slow LFO2 -> cutoff; ModWhl -> cutoff mod 2.", "space": "Slow Stoned phaser -> deep damped plate.", "architecture": "Triple VCO + Ladder for a heavy, round, dark body."},
           {"oscillator": tv({"shape": 3, "volume": 70}, {"semitones": -12, "shape": 5, "volume": 60}, {"semitones": 0.08, "shape": 3, "volume": 40}, feedback=10),
            "filter": {"model": "ladder", "cutoff": 56, "resonance": 18, "key_follow": 25, "slope": "24db"},
            "env1": env(55, 70, 90, 70, 15), "env2": env(60, 70, 50, 60, 0), "lfo2": lfo("triangle", -2.5),
            "modulation": {"cutoff_1": {"source": "LFO2", "amount": 10}, "cutoff_2": {"source": "ModWhl", "amount": 35}},
            "voice": {"mode": "poly", "voices": 8}, "trimmers": {"drift": 40},
            "fx1": {"type": "phaser", "variant": "stoned", "rate": 12, "feedback": 30, "stereo": 20, "depth": 80, "wet": 60, "center": 45},
            "fx2": {"type": "plate", "predelay": 25, "diffusion": 95, "damp": 85, "decay": 75, "size": 185, "dry": 88, "wet": 30}}, (72, 40)),
    # ---------------- RHYTHMIC ARPS
    preset("ARP Minimal Pulse", "Sequences:Arpeggio", "Hypnotic minimal-techno arp: short DCO pulse plucks, light swing, 3/16 echo.", "Hold a chord; the host-synced arp plays it upwards. Velocity = brightness.", ["Poly", "Arp", "Stereo"], ["Hypnotic", "Plucky"],
           {"intent": "An endlessly rolling minimal arpeggio.", "spectral": "DCO PW-reactive pulse 35%.", "temporal": "Very short envelopes keep the arp tight.", "filtering": "Multimode LP4 with a quick Env2 snap and Random micro-variation.", "modulation": "Env2 -> cutoff, Random -> cutoff mod 2.", "dynamics": "Arpeggiator up, swing 15.", "space": "Dotted 3/16 echo.", "architecture": "DCO + Multimode: stable, punchy, sequencer-friendly."},
           {"oscillator": {"model": "dco", "octave": 0, "pulse_shape": 3, "pulse_width": 35, "saw_shape": 0, "sub_shape": 0, "sub_volume": 15, "noise_volume": 0},
            "filter": {"model": "multimode", "mode": "lp4", "cutoff": 66, "resonance": 28, "key_follow": 50},
            "env1": env(0, 20, 0, 18, 35), "env2": env(0, 14, 0, 12, 40),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 40}, "cutoff_2": {"source": "Random", "amount": 10}},
            "arp": {"enabled": True, "mode": "up", "progression": "serial", "octaves_raw": 1, "swing": 15, "strict_sync": True},
            "voice": {"mode": "poly", "voices": 8},
            "fx1": {"type": "delay", "left": 3, "center": 3, "right": 6, "side_vol": 30, "center_vol": 15, "feedback": 35, "hp": 30, "lp": 55, "dry": 100, "wow": 10}}, (76, 42)),
    preset("ARP Organic Kalimba", "Sequences:Arpeggio", "Kalimba-like organic-house arp: digital triangle plucks through a band-pass Uhbie, strong swing, warm echo.", "Hold a chord; swing gives the organic-house shuffle.", ["Poly", "Arp", "Stereo"], ["Organic", "Woody", "Bright"],
           {"intent": "A wooden, kalimba-like arpeggio with an organic-house shuffle.", "spectral": "Digital triangle (synced sine harmonic) + quiet triangle two octaves up for the 'tine'.", "temporal": "Instant attack, short decay, a little release.", "filtering": "Uhbie between LP and band-pass, moderate resonance.", "dynamics": "Arp up+down 1, swing 35.", "space": "Echo 3/4/6 with wow 20 -> small plate.", "architecture": "Digital + Uhbie: clean tonal source with a silky resonant band."},
           {"oscillator": {"model": "digital", "osc1": {"octave": 0, "wave": "triangle"}, "osc2": {"semitones": 24, "wave": "triangle"}, "mix": 15, "high_quality": True},
            "filter": {"model": "uhbie", "cutoff": 84, "resonance": 32, "key_follow": 60, "uhbie_mix": 35, "uhbie_center": "bandpass"},
            "env1": env(0, 26, 0, 24, 45), "env2": env(0, 12, 0, 10, 40),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 25}},
            "arp": {"enabled": True, "mode": "up_down_1", "progression": "serial", "octaves_raw": 1, "swing": 35, "strict_sync": True},
            "voice": {"mode": "poly", "voices": 8},
            "fx1": {"type": "delay", "left": 3, "center": 4, "right": 6, "side_vol": 30, "center_vol": 10, "feedback": 30, "hp": 25, "lp": 60, "dry": 100, "wow": 20},
            "fx2": {"type": "plate", "predelay": 10, "diffusion": 85, "damp": 80, "decay": 40, "size": 110, "dry": 92, "wet": 20}}, (78, 42)),
    preset("ARP Dub Steps", "Sequences:Arpeggio", "Dub-techno arp: saw + fifth stabs climbing through octaves in a dark cascade, deep echo.", "Hold one or two notes; the arp climbs through octaves.", ["Poly", "Arp", "Stereo"], ["Dark", "Dubby", "Spacey"],
           {"intent": "Dub-techno stabs stepping through octaves and dissolving in echo.", "spectral": "Dual VCO saws, VCO2 a fifth up (power-chord stab).", "filtering": "Cascade low cutoff, short Env2.", "dynamics": "Arp up+down 2, octaves raw 2 (octave count unconfirmed).", "space": "Delay 3/6/9, feedback 52 -> plate.", "architecture": "Dual VCO + Cascade: the dub-chord colour, made rhythmic."},
           {"oscillator": dv({"saw": True}, {"semitones": 7, "saw": True}, mix=45),
            "filter": {"model": "cascade", "cutoff": 60, "resonance": 22, "key_follow": 40, "slope": "24db", "character": "clean"},
            "env1": env(0, 24, 0, 22, 30), "env2": env(0, 20, 0, 18, 30),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 30}},
            "arp": {"enabled": True, "mode": "up_down_2", "progression": "serial", "octaves_raw": 2, "strict_sync": True},
            "voice": {"mode": "poly", "voices": 8},
            "fx1": {"type": "delay", "left": 3, "center": 6, "right": 9, "side_vol": 40, "center_vol": 20, "feedback": 52, "hp": 35, "lp": 45, "dry": 100, "wow": 25},
            "fx2": {"type": "plate", "predelay": 20, "diffusion": 90, "damp": 82, "decay": 55, "size": 150, "dry": 90, "wet": 22}}, (70, 38)),
    preset("ARP Acid Bubble", "Sequences:Arpeggio", "Bubbling acid-minimal arp: saw into a resonant ladder with a snappy envelope and random filter variation.", "Hold 1-3 notes. Mod wheel = more resonance.", ["Poly", "Arp"], ["Resonant", "Squelchy"],
           {"intent": "A squelchy, bubbling minimal-acid line from a held chord.", "spectral": "Dual VCO saw, VCO2 an octave down for weight.", "filtering": "Ladder resonance 60, Env2 +50, Random -> cutoff mod 2.", "modulation": "ModWhl -> resonance.", "dynamics": "Arp random order, swing 10.", "space": "Short 3/16 echo.", "architecture": "Dual VCO + Ladder: the classic squelch."},
           {"oscillator": dv({"saw": True}, {"semitones": -12, "saw": True}, mix=30),
            "filter": {"model": "ladder", "cutoff": 50, "resonance": 60, "key_follow": 40, "slope": "24db"},
            "env1": env(0, 22, 20, 15, 30), "env2": env(0, 18, 0, 14, 50),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 50}, "cutoff_2": {"source": "Random", "amount": 12}, "resonance": {"source": "ModWhl", "amount": 25}},
            "arp": {"enabled": True, "mode": "random", "progression": "serial", "octaves_raw": 1, "swing": 10, "strict_sync": True},
            "voice": {"mode": "poly", "voices": 6},
            "fx1": {"type": "delay", "left": 3, "center": 3, "right": 6, "side_vol": 25, "center_vol": 10, "feedback": 30, "hp": 30, "lp": 55, "dry": 100, "wow": 5}}, (70, 38)),
    preset("ARP Marimba Groove", "Sequences:Arpeggio", "Organic-house marimba arp: soft FM-tinged triangles, short LP2 filter, played-order arp with heavy swing.", "Play a chord in the order you want; the arp repeats it with swing.", ["Poly", "Arp", "Stereo"], ["Organic", "Warm", "Woody"],
           {"intent": "A warm, wooden marimba-like groove for organic house.", "spectral": "Triple VCO triangles, osc2 two octaves up, a little FM for the mallet 'tock'.", "temporal": "Instant attack, short decay.", "filtering": "Multimode LP2 with fast Env2.", "dynamics": "Arp in played order, swing 40.", "space": "Small plate.", "architecture": "Triple VCO is the only model with FM between oscillators for a mallet tone."},
           {"oscillator": tv({"shape": 3, "volume": 80}, {"semitones": 24, "shape": 3, "volume": 30}, {"volume": 0}, fm=12),
            "filter": {"model": "multimode", "mode": "lp2", "cutoff": 72, "resonance": 10, "key_follow": 55},
            "env1": env(0, 24, 0, 22, 45), "env2": env(0, 10, 0, 8, 40),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 30}},
            "arp": {"enabled": True, "mode": "played", "progression": "serial", "octaves_raw": 1, "swing": 40, "strict_sync": True},
            "voice": {"mode": "poly", "voices": 8},
            "fx1": {"type": "plate", "predelay": 5, "diffusion": 85, "damp": 80, "decay": 35, "size": 100, "dry": 92, "wet": 20}}, (78, 42)),
    # ---------------- REESE / POWER BASS
    preset("BS Reese Classic", "Bass:Synth", "Classic Reese bass: two saws detuned ~18 cents beating against each other, sub-octave triangle, round ladder.", "Mono/legato. Hold long notes; the beating moves on its own. MW = open filter.", ["Mono", "Dry"], ["Phat", "Dark", "Moving"],
           {"intent": "A powerful, slowly phasing Reese bass with solid sub.", "spectral": "Triple VCO: saw osc1, saw osc2 +0.18 st (beating), triangle osc3 an octave down for the sub.", "filtering": "Ladder 60, low resonance.", "modulation": "ModWhl -> cutoff; drift 20.", "architecture": "Triple VCO: two saws for the beat plus a dedicated sub oscillator."},
           {"oscillator": tv({"shape": 5, "volume": 75}, {"semitones": 0.18, "shape": 5, "volume": 70}, {"semitones": -12, "shape": 3, "volume": 45}, feedback=12),
            "filter": {"model": "ladder", "cutoff": 60, "resonance": 15, "key_follow": 30, "slope": "24db"},
            "env1": env(0, 50, 85, 15, 20), "env2": env(0, 40, 30, 15, 20),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 15}, "cutoff_2": {"source": "ModWhl", "amount": 35}},
            "voice": {"mode": "legato", "note_priority": "last", "glide": 8, "glide_mode": "time", "transpose": -12},
            "trimmers": {"drift": 20}}, (70, 38)),
    preset("BS Reese Wide", "Bass:Synth", "Wide Reese: detuned dual saws through a rough cascade with slow filter motion and a touch of dramatic chorus.", "Mono/legato. Keep the low end of your mix mono if needed.", ["Mono", "Stereo"], ["Wide", "Gritty", "Moving"],
           {"intent": "A wider, more aggressive Reese for drops.", "spectral": "Dual VCO saws, VCO2 +0.22 st; HPF = Feedback adds weight.", "filtering": "Cascade rough, LFO2 slowly moves the cutoff.", "space": "Dramatic chorus at 30% wet for width.", "architecture": "Dual VCO + Cascade (rough): grit without harsh peaks."},
           {"oscillator": dv({"saw": True}, {"semitones": 0.22, "saw": True}, mix=50, feedback=15),
            "hpf": {"model": "feedback"},
            "filter": {"model": "cascade", "cutoff": 62, "resonance": 18, "key_follow": 30, "slope": "24db", "character": "rough"},
            "env1": env(0, 50, 85, 15, 20), "env2": env(0, 40, 30, 15, 20), "lfo2": lfo("triangle", -1.5, restart="sync"),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 12}, "cutoff_2": {"source": "LFO2", "amount": 10}},
            "voice": {"mode": "legato", "note_priority": "last", "glide": 6, "transpose": -12},
            "fx1": {"type": "chorus", "variant": "dramatic", "rate": 15, "depth": 40, "wet": 30}}, (70, 38)),
    preset("BS Reese Growl", "Bass:Synth", "Growling digital Reese: Multisaw plus an octave-down saw into Bite Rev 2 with an LFO wobble on the mod wheel.", "Mono/legato. MW = wobble depth.", ["Mono"], ["Aggressive", "Gritty", "Dark"],
           {"intent": "The heaviest bass in the bank: dense, growling, wobbling on demand.", "spectral": "Digital Multisaw + sawtooth an octave down.", "filtering": "Bite Rev 2, resonance 30 (kept moderate: Bite is level dependent).", "modulation": "LFO2 -> cutoff mod 2, its depth on the mod wheel.", "architecture": "Digital Multisaw is a ready-made detuned stack; Bite adds the growl."},
           {"oscillator": {"model": "digital", "osc1": {"octave": 0, "wave": "multisaw"}, "osc2": {"semitones": -12, "wave": "sawtooth"}, "mix": 40, "high_quality": True},
            "hpf": {"model": "pre", "frequency": 32},
            "filter": {"model": "bite", "revision": 2, "cutoff": 58, "resonance": 30, "key_follow": 30},
            "env1": env(0, 50, 85, 15, 20), "env2": env(0, 35, 25, 15, 25),
            "lfo2": lfo("triangle", -0.5, restart="gate", **{}) | {"depth_source": "ModWhl"},
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 20}, "cutoff_2": {"source": "LFO2", "amount": 22}},
            "voice": {"mode": "legato", "note_priority": "last", "glide": 6, "transpose": -12}}, (68, 36)),
    preset("BS Organic Thump", "Bass:Synth", "Punchy organic-house bass: round DCO square and sub with a fast filter thump.", "Mono. Velocity = thump.", ["Mono", "Dry"], ["Punchy", "Warm", "Round"],
           {"intent": "A short, round, punchy bass that grooves with organic-house percussion.", "spectral": "DCO square + strong sub.", "temporal": "Short decay, low sustain: plucked bass.", "filtering": "Ladder with a strong, fast Env2 and velocity.", "architecture": "DCO + Ladder: stable pitch and a round thump."},
           {"oscillator": {"model": "dco", "octave": 0, "pulse_shape": 3, "pulse_width": 50, "saw_shape": 0, "sub_shape": 0, "sub_volume": 90, "noise_volume": 0},
            "filter": {"model": "ladder", "cutoff": 46, "resonance": 22, "key_follow": 35, "slope": "24db"},
            "env1": env(0, 30, 25, 12, 30), "env2": env(0, 20, 0, 10, 55),
            "modulation": {"cutoff_1": {"source": "Env2", "amount": 50}},
            "voice": {"mode": "mono", "note_priority": "last", "transpose": -12}}, (76, 42)),
    # ---------------- RISER
    preset("FX Tape Riser", "FX", "Riser for build-ups: noise and saws slowly sweep up in pitch and brightness while a wobble accelerates.", "Hold one note for several bars; release to stop. Velocity = intensity.", ["Poly", "Stereo"], ["Bright", "Moving", "Tension"],
           {"intent": "A tension riser for minimal / organic house build-ups.", "spectral": "Triple VCO: two detuned saws + white noise.", "temporal": "Very slow Env1/Env2 attacks (duration in seconds is undocumented, judge by ear).", "filtering": "Multimode LP2; Env2 opens the cutoff (+60).", "modulation": "Env2 -> pitch of all three oscillators (+12, depth unit unconfirmed) and -> cutoff; LFO2 -> cutoff with its rate pushed up by Env2 (accelerating wobble).", "space": "Long tape delay -> large plate.", "architecture": "Triple VCO: per-oscillator tune-mod switches allow a whole-patch pitch rise."},
           {"oscillator": tv({"shape": 5, "volume": 60}, {"semitones": 0.15, "shape": 5, "volume": 55}, {"volume": 0}, noise={"volume": 50, "color": "white"}, tune_mod_targets=[1, 2, 3]),
            "filter": {"model": "multimode", "mode": "lp2", "cutoff": 55, "resonance": 25, "key_follow": 30},
            "env1": env(85, 80, 100, 50, 40), "env2": env(92, 80, 100, 50, 40),
            "lfo2": lfo("triangle", -1, restart="gate", rate_mod={"source": "Env2", "amount": 4}),
            "modulation": {"pitch_1": {"source": "Env2", "amount": 12}, "cutoff_1": {"source": "Env2", "amount": 60}, "cutoff_2": {"source": "LFO2", "amount": 12}},
            "voice": {"mode": "poly", "voices": 4},
            "fx1": {"type": "delay", "left": 4, "center": 6, "right": 8, "side_vol": 35, "center_vol": 10, "feedback": 45, "hp": 35, "lp": 60, "dry": 100, "wow": 30},
            "fx2": {"type": "plate", "predelay": 20, "diffusion": 95, "damp": 70, "decay": 70, "size": 180, "dry": 88, "wet": 30}}, (68, 38)),
]

bank = json.load(open(P))
have = {p["meta"]["name"] for p in bank["presets"]}
added = [p for p in NEW if p["meta"]["name"] not in have]
bank["presets"].extend(added)
bank["revision"] = "1.1 - added 4 spatial pads, 5 rhythmic arps, 4 Reese/power basses, 1 riser"
with open(P, "w") as f:
    json.dump(bank, f, indent=2)
print(f"added {len(added)}, total {len(bank['presets'])}")
