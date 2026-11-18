#!/usr/bin/env python3
"""Sectioned epic superhero score, synthesised locally (no API). Used when ElevenLabs Music has no credits.
    python3 scripts/gen_music_epic.py <plan.json> <out.wav>
plan.json: {"sec": 86.5, "key": 38, "sections": [{"from": 0, "mode": "open|hush|drive|rise|silence|dark|climax|fall|dawn"}], "hits": [t, ...]}
Modes set what plays: drums (taiko), ostinato strings, low brass, choir pad, piano, sub drone. Hits = big braams.
"""
import json, sys, wave
import numpy as np

SR = 44100
P = json.load(open(sys.argv[1]))
SEC = P['sec']; N = int(SEC * SR); KEY = P.get('key', 38)  # D
rng = np.random.default_rng(7)
f = lambda m: 440.0 * 2 ** ((m - 69) / 12)
L = np.zeros(N); R = np.zeros(N)
tt = np.arange(N) / SR

MODES = {  # drums, ostinato, brass, choir, piano, drone, bpm
    'open':    (0.6, 0.5, 0.7, 0.3, 0.0, 0.6, 140),
    'hush':    (0.15, 0.0, 0.0, 0.25, 0.25, 0.7, 70),
    'drive':   (1.0, 0.9, 0.6, 0.2, 0.0, 0.4, 140),
    'rise':    (0.8, 0.8, 1.0, 0.8, 0.0, 0.4, 140),
    'silence': (0.0, 0.0, 0.0, 0.15, 0.0, 0.5, 60),
    'dark':    (0.5, 0.3, 0.9, 0.7, 0.0, 1.0, 70),
    'climax':  (1.0, 1.0, 1.0, 1.0, 0.0, 0.5, 150),
    'fall':    (0.0, 0.4, 0.2, 0.8, 0.3, 0.3, 70),
    'dawn':    (0.0, 0.0, 0.0, 0.4, 0.8, 0.3, 66),
}
secs = P['sections']
bounds = [(s['from'], secs[i + 1]['from'] if i + 1 < len(secs) else SEC, MODES[s['mode']], s['mode']) for i, s in enumerate(secs)]
# chord roots per mode: minor (i, VI, III, VII); dark uses i + bII
PROG = {'dark': [0, 1, 0, -1], 'dawn': [0, -4, 3, -2]}

def env(n, a, r):
    e = np.ones(n); ai = min(n, int(a * SR)); ri = min(n - ai, int(r * SR))
    if ai: e[:ai] = np.linspace(0, 1, ai)
    if ri: e[n - ri:] = np.linspace(1, 0, ri)
    return e

def add(start, sig, pan=0.0, g=1.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[:N - i] * g
    L[i:i + len(sig)] += sig * (1 - max(0, pan)); R[i:i + len(sig)] += sig * (1 + min(0, pan))

def saw(fr, n, det=0.0):
    ph = np.cumsum(np.full(n, fr * (1 + det)) / SR)
    return 2 * (ph % 1) - 1

def lp_fast(x, cut, passes=2):  # FFT one-pole-shaped low-pass (no scipy)
    n = len(x)
    if n < 4: return x
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(n, 1 / SR)
    return np.fft.irfft(X / (1 + (fr / cut) ** 2) ** (passes / 2), n)

def taiko(big=1.0):
    n = int(0.9 * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (55 + 60 * np.exp(-t * 18)) * t) * np.exp(-t * 5.5)
    slap = rng.standard_normal(n) * np.exp(-t * 40) * 0.35
    return (body + lp_fast(slap, 1800)) * big

def braam(root, dur=2.6):
    n = int(dur * SR); x = np.zeros(n)
    for m, g in ((root - 12, 1.0), (root - 5, 0.6), (root, 0.7)):
        for d in (-0.004, 0.0, 0.005): x += saw(f(m), n, d) * g
    x = lp_fast(x, 700) * env(n, 0.04, dur * 0.7)
    sub = np.sin(2 * np.pi * f(root - 24) * np.arange(n) / SR) * env(n, 0.01, dur * 0.8)
    return x * 0.18 + sub * 0.5

for (a, b, (dr, os_, br, ch, pi, dn, bpm), mode) in bounds:
    beat = 60 / bpm; prog = PROG.get(mode, [0, -4, 3, -2])
    bar = beat * 4
    nb = int(np.ceil((b - a) / bar))
    for k in range(nb):
        t0 = a + k * bar
        if t0 >= b: break
        root = KEY + 12 + prog[k % 4]; blen = min(bar, b - t0); n = int(blen * SR)
        if n <= 0: continue
        ramp = (t0 - a) / max(0.01, b - a) if mode in ('rise', 'climax', 'open') else 0.5
        third = 3 if mode != 'dawn' else 4
        # drone / sub
        if dn: add(t0, np.sin(2 * np.pi * f(KEY - 12) * np.arange(n) / SR) * env(n, 0.3, 0.3) * 0.22 * dn)
        # choir pad: detuned saws, soft, vowel-ish lowpass
        if ch:
            x = sum(saw(f(root + iv), n, d) for iv in (0, third + 0, 7, 12) for d in (-0.003, 0.004))
            add(t0, lp_fast(x, 900 + 900 * ramp) * env(n, 0.5, 0.5) * 0.035 * ch, pan=-0.2)
            add(t0, lp_fast(x, 1100) * env(n, 0.6, 0.5) * 0.03 * ch, pan=0.2)
        # low brass on beats 1 and 3
        if br:
            for q in (0, 2):
                if t0 + q * beat >= b: continue
                m = int(beat * 1.8 * SR); x = sum(saw(f(root - 12 + iv), m, d) for iv in (0, 7) for d in (-0.003, 0.003))
                add(t0 + q * beat, lp_fast(x, 500 + 700 * ramp) * env(m, 0.03, 0.4) * 0.07 * br)
        # string ostinato: 16ths on root / fifth / octave
        if os_:
            pat = [0, 0, 12, 0, 7, 0, 12, 3] if mode != 'climax' else [0, 12, 7, 12, 3, 12, 7, 15]
            st = beat / 2
            for j in range(int(blen / st)):
                m = int(st * 0.9 * SR); x = saw(f(root + pat[j % 8]), m, 0.002) + saw(f(root + pat[j % 8]), m, -0.002)
                add(t0 + j * st, lp_fast(x, 2400) * env(m, 0.005, st * 0.5) * 0.045 * os_ * (0.7 + 0.3 * ramp), pan=0.35 if j % 2 else -0.35)
        # taiko: beat 1, 2.5, 3, 4 + rolls in climax
        if dr:
            hits = [0, 1.5, 2, 3] if mode != 'climax' else [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.25, 3.5, 3.75]
            for q in hits:
                if t0 + q * beat < b: add(t0 + q * beat, taiko(1.0 if q in (0, 2) else 0.6) * 0.55 * dr, pan=(rng.random() - 0.5) * 0.4)
        # piano: arpeggio
        if pi:
            notes = [root + 12, root + 12 + third, root + 19, root + 24, root + 19, root + 12 + third]
            for j, m0 in enumerate(notes):
                tq = t0 + j * (bar / len(notes))
                if tq >= b: break
                m = int(2.2 * SR); tm = np.arange(m) / SR
                x = (np.sin(2 * np.pi * f(m0) * tm) + 0.3 * np.sin(4 * np.pi * f(m0) * tm)) * np.exp(-tm * 2.2)
                add(tq, x * 0.12 * pi, pan=0.15)
    # riser into next section for rise/climax
    if mode in ('rise', 'open', 'dark'):
        d = min(3.0, b - a); n = int(d * SR); nz = lp_fast(rng.standard_normal(n), 3000) * np.linspace(0, 1, n) ** 2
        add(b - d, nz * 0.12)

for h in P.get('hits', []): add(h, braam(KEY), g=0.9)
# last note: one unresolved low braam at the very end
if P.get('end_note'): add(P['end_note'], braam(KEY + 1, 3.0), g=0.7)

# gentle bus: soft clip + normalise to -1 dBFS peak
st = np.stack([L, R], 1); st = np.tanh(st * 1.6) / 1.6
st /= max(1e-6, np.abs(st).max()) / 0.89
fade = int(0.05 * SR); st[:fade] *= np.linspace(0, 1, fade)[:, None]
with wave.open(sys.argv[2], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
print('wrote', sys.argv[2], f'{SEC:.1f}s')
