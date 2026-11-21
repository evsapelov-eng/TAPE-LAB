"""Synthesizes the two granular source recordings used by PLUIT Vol. 01.

Both are tuned to the pitch class C so that Serum's granular engine stays in
key relative to the played note regardless of which octave it treats as root.
The layout uses a fixed seed: the result is deterministic and reproducible,
randomness only decides *where* in the file each event sits.

  pluit_particle_source.wav  -- 8 s of short bell-like partial clusters on a
                                C-major-pentatonic set (TX Particle Field)
  pluit_organic_source.wav   -- 8 s of breath-like filtered noise resonating on
                                the C harmonic series, slowly undulating
                                (TX Organic System)
"""

from __future__ import annotations

import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).parent / "sources")


def write_wav(path: Path, x: np.ndarray) -> None:
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.7  # -3 dBFS peak, headroom kept
    pcm = (x * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def particles() -> np.ndarray:
    rng = np.random.default_rng(7)
    dur = 8.0
    n = int(SR * dur)
    out = np.zeros(n)
    c4 = 261.6256
    # C major pentatonic across two octaves (ratios in equal temperament)
    semis = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]
    for _ in range(46):
        start = rng.uniform(0, dur - 1.5)
        f = c4 * 2 ** (rng.choice(semis) / 12)
        length = rng.uniform(0.35, 1.4)
        t = np.arange(int(SR * length)) / SR
        env = (1 - np.exp(-t / 0.004)) * np.exp(-t / (length * 0.32))
        tone = (np.sin(2 * np.pi * f * t)
                + 0.28 * np.sin(2 * np.pi * 2 * f * t)
                + 0.09 * np.sin(2 * np.pi * 3 * f * t)
                + 0.04 * np.sin(2 * np.pi * 4.0 * f * t))
        i = int(start * SR)
        seg = tone * env * rng.uniform(0.4, 1.0)
        out[i:i + len(seg)] += seg[: n - i]
    # quiet sustained C drone glues the grains into a field
    t = np.arange(n) / SR
    out += 0.12 * (np.sin(2 * np.pi * c4 / 2 * t) + 0.5 * np.sin(2 * np.pi * c4 * 1.5 * t))
    return out


def organic() -> np.ndarray:
    rng = np.random.default_rng(11)
    dur = 8.0
    n = int(SR * dur)
    t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    spec = np.fft.rfft(noise)
    freqs = np.fft.rfftfreq(n, 1 / SR)
    c3 = 130.8128
    shape = np.zeros_like(freqs)
    # resonant peaks on the C harmonic series (bowed / breathed body)
    for h, amp in zip(range(1, 13), [1, .8, .7, .45, .35, .3, .12, .2, .1, .08, .03, .05]):
        f0 = c3 * h
        bw = 2.5 + h * 0.6
        shape += amp * np.exp(-0.5 * ((freqs - f0) / bw) ** 2)
    shape += 0.015 / (1 + (freqs / 3000) ** 2)  # faint breath air
    body = np.fft.irfft(spec * shape, n)
    # slow, slightly irregular breathing undulation
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.31 * t) * np.sin(2 * np.pi * 0.07 * t + 1.3)
    tone = 0.25 * np.sin(2 * np.pi * c3 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.11 * t))
    return body / np.max(np.abs(body)) * lfo + tone


if __name__ == "__main__":
    write_wav(OUT / "pluit_particle_source.wav", particles())
    write_wav(OUT / "pluit_organic_source.wav", organic())
    print("written to", OUT)
