#!/usr/bin/env python3
"""Sound mixer for shorts: voice first, everything else fits around it.

    python3 scripts/mix_sound.py <cues.json> <out.wav> [--video in.mp4 --master out.mp4]

cues.json (paths are relative to the Videos folder):
  {"voice": "_engine/public/jobs/x/voice.mp3", "words": "_engine/public/jobs/x/words.json", "sec": 59.6,
   "music": {"file": "Music/x.mp3", "gain": -14},
   "beds":  [{"file": "...", "from": {"w": "sea"}, "to": {"w": "then"}, "gain": -22, "fade": 0.5}],
   "cues":  [{"file": "...", "at": {"w": "hits", "n": 1, "off": -0.05}, "gain": -6, "start": 0.0, "dur": 2.5, "note": "wave slams hull"}]}
`at` may also be {"t": 12.3}. Every time comes from the voice, so a new take moves the sound with it.

The rule (user, 2026-11-04): an SFX must never drown the voice. Enforced in two ways:
  1. Everything but the voice is split at 250 Hz. While the voice speaks, the speech band (above 250 Hz) of the
     bed is pushed down until it sits MARGIN dB under the voice. Sub weight stays, so a hit still lands.
  2. The VO gate measures the finished mix word by word and fails if any word is not on top in the speech band.
"""
import argparse, json, re, subprocess, sys
from pathlib import Path
import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parents[2]
MARGIN = 13.0     # dB the speech band of the bed must sit under the voice
GATE_MIN = 8.0    # dB: every spoken word of the master must clear this
ap = argparse.ArgumentParser()
ap.add_argument('cues'); ap.add_argument('out')
ap.add_argument('--video'); ap.add_argument('--master')
a = ap.parse_args()
C = json.load(open(a.cues))
W = json.load(open(ROOT / C['words']))
N = int(C['sec'] * SR)

def load(p, start=0.0, dur=None):
    c = ['ffmpeg', '-v', 'error', '-ss', str(start)]
    if dur: c += ['-t', str(dur)]
    c += ['-i', str(ROOT / p), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    b = subprocess.run(c, capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).reshape(-1, 2).astype(np.float64)

def when(r):
    if 't' in r: return r['t'] + r.get('off', 0)
    hits = [x for x in W if re.sub(r'[^a-z0-9é]', '', x[0].lower()) == r['w']]
    if len(hits) < r.get('n', 1): sys.exit(f'word {r} not in voice')
    x = hits[r.get('n', 1) - 1]
    return x[2 if r.get('end') else 1] + r.get('off', 0)

db = lambda g: 10 ** (g / 20)
def mavg(x, k):  # centred moving average in O(n)
    c = np.concatenate([[0.0], np.cumsum(x)]); i = np.arange(len(x))
    lo = np.maximum(i - k // 2, 0); hi = np.minimum(i + k - k // 2, len(x))
    return (c[hi] - c[lo]) / k
def place(buf, x, t):
    i = int(t * SR)
    if i >= N: return
    j = max(0, -i); i = max(0, i)
    n = min(len(x) - j, N - i)
    if n > 0: buf[i:i + n] += x[j:j + n]

def fade(x, fi, fo):
    n = len(x); a_, b_ = min(int(fi * SR), n), min(int(fo * SR), n)
    if a_: x[:a_] *= np.linspace(0, 1, a_)[:, None]
    if b_: x[n - b_:] *= np.linspace(1, 0, b_)[:, None]
    return x

def level(x):  # peak-safe: match every sound to one reference RMS first, so `gain` means the same on every file
    loud = np.sqrt(np.mean(x ** 2, axis=1))
    k = max(1, SR // 20)
    m = np.sqrt(mavg(loud ** 2, k))
    p = m.max() or 1
    return x * (0.25 / p)

def band(x, lo, hi):  # zero-phase FFT filter with soft edges
    f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 8)
    if hi: m *= 1 / (1 + (f / hi) ** 8)
    return np.fft.irfft(np.fft.rfft(x, axis=0) * m[:, None], n=len(x), axis=0)
BAND = band
voice = np.zeros((N, 2)); place(voice, load(C['voice']), 0)
sfx = np.zeros((N, 2)); bed = np.zeros((N, 2)); mus = np.zeros((N, 2))
if C.get('music'):
    m = C['music']; x = load(m['file'], m.get('start', 0))
    place(mus, fade(level(x) * db(m.get('gain', -14)), 0.5, 1.2), m.get('at', 0))
for b in C.get('beds', []):
    t0, t1 = when(b['from']), when(b['to'])
    x = level(load(b['file'], b.get('start', 0)))
    n = int((t1 - t0) * SR)
    if len(x) < n:  # loop with a short crossfade
        f = min(int(0.4 * SR), len(x) // 3); out = x.copy()
        while len(out) < n:
            r = np.linspace(0, 1, f)[:, None]
            out = np.vstack([out[:-f], out[-f:] * (1 - r) + x[:f] * r, x[f:]])
        x = out
    place(bed, fade(x[:n].copy(), b.get('fade', 0.4), b.get('fade', 0.4)) * db(b.get('gain', -24)), t0)
for c in C['cues']:
    x = load(c['file'], c.get('start', 0), c.get('dur'))
    if len(x) == 0: sys.exit(f"empty sound: {c['file']}")
    if c.get('lp'): x = BAND(x, None, c['lp'])
    place(sfx, fade(level(x) * db(c.get('gain', -8)), 0.002, min(0.08, len(x) / SR / 3)), when(c['at']))

# ---- keep the voice on top ----
def env(x, ms):
    k = int(SR * ms / 1000); e = np.mean(x ** 2, axis=1)
    return np.sqrt(np.maximum(mavg(e, k), 1e-12))
rest = sfx + bed + mus
rest_hi = band(rest, 250, None); rest_lo = rest - rest_hi
vb = band(voice, 300, 4000); eb = env(band(rest, 300, 4000), 40); ve = env(vb, 15)
# real speech spans: ElevenLabs word ends include the trailing silence, and that silence is where the big hits live
SPANS = []
for w_, t0, t1 in W:
    i0, i1 = int(t0 * SR), min(N, int(t1 * SR))
    if i1 <= i0 + 10: continue
    pk = ve[i0:i1].max()
    if np.median(ve[i0:i1]) < db(-45): continue  # whisper can place a word in a pause: no voice to protect there (-55 dB vs -18 for speech); median, as the next word's onset can leak into the span edge
    on = np.where(ve[i0:i1] > pk * db(-22))[0]
    SPANS.append([w_, (i0 + on[0]) / SR, (i0 + on[-1]) / SR, 0.0])  # word, start, real end, extra dB

def duck():
    g = np.ones(N)
    for w_, t0, t1, ex in SPANS:
        a0, a1 = int(max(0, t0 - 0.04) * SR), min(N, int((t1 + 0.05) * SR))
        v = np.sqrt(np.mean(vb[int(t0 * SR):max(int(t1 * SR), int(t0 * SR) + 1)] ** 2))
        g[a0:a1] = np.minimum(g[a0:a1], np.minimum(1.0, v * db(-MARGIN - ex) / np.maximum(eb[a0:a1], 1e-9)))
    la = int(0.03 * SR); g = np.minimum(g, np.roll(g, -la))  # 30 ms look-ahead
    s = np.ones(N); cur = 1.0; up = 1 / (0.09 * SR); dn = 1 / (0.012 * SR)  # fast down, quick up: a hit gets the whole pause
    for i in range(0, N, 16):
        tgt = g[i:i + 16].min()
        cur += (tgt - cur) * (min(1, dn * 16) if tgt < cur else min(1, up * 16))
        s[i:i + 16] = cur
    return s, rest_hi * s[:, None] + rest_lo * (0.85 + 0.15 * s)[:, None]

def score(ducked):
    bb = band(ducked, 300, 4000); out = []
    for k, (w_, t0, t1, ex) in enumerate(SPANS):
        if t1 - t0 < 0.06: continue
        i0, i1 = int(t0 * SR), int(t1 * SR)
        out.append((10 * np.log10(np.mean(vb[i0:i1] ** 2) / max(np.mean(bb[i0:i1] ** 2), 1e-12)), w_, t0, k))
    return out
for rnd in range(6):  # any word short of the gate gets exactly the extra it needs
    s, ducked = duck(); rows = score(ducked); low = [x for x in rows if x[0] < GATE_MIN + 0.3]
    if not low: break
    for x in low: SPANS[x[3]][3] += GATE_MIN + 1 - x[0]
mix = voice + ducked

# ---- master to -14 LUFS, true peak under -1.5 ----
peak = np.abs(mix).max()
if peak > 0.99: mix = np.tanh(mix / peak * 1.2) * 0.98
raw = a.out + '.raw.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', raw], input=mix.astype(np.float32).tobytes(), check=True)
p = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
L = json.loads(p[p.rindex('{'):p.rindex('}') + 1])
f = f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={L['input_i']}:measured_TP={L['input_tp']}:measured_LRA={L['input_lra']}:measured_thresh={L['input_thresh']}:offset={L['target_offset']}:linear=true,alimiter=limit=0.79:attack=2:release=40:level=false"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f, '-ar', str(SR), a.out], check=True)
Path(raw).unlink()

# ---- VO gate: is the voice on top, window by window? ----
buried = []
for c in C['cues']:  # did the rule swallow a sound? best gain in the cue's first 300 ms: the attack is what you hear
    t = when(c['at']); i0 = max(0, int(t * SR)); k = s[i0:i0 + int(0.3 * SR)]
    if len(k) and 20 * np.log10(max(k.max(), 1e-4)) < -9: buried.append((Path(c['file']).stem[:20], round(float(t), 1), round(float(20 * np.log10(max(k.max(), 1e-4))), 1)))
print(f'{len(buried)} of {len(C["cues"])} cues pressed under speech:', buried[:14] or 'none')
r = np.array([x[0] for x in rows]); bad = sorted([x for x in rows if x[0] < GATE_MIN], key=lambda x: x[0])
print(f'VO gate: {len(rows)} words, voice over everything else in the speech band: median {np.median(r):.1f} dB, worst {r.min():.1f} dB, {100 * np.mean(r >= GATE_MIN):.1f} % clear {GATE_MIN} dB')
if bad: print('  low:', [(x[1], round(float(x[2]), 1), round(float(x[0]), 1)) for x in bad[:12]])
print('VO GATE:', 'PASS' if not bad else 'FAIL')
print(f'cues {len(C["cues"])}, distinct sounds {len({c["file"] for c in C["cues"]})}, beds {len(C.get("beds", []))}')

if a.video and a.master:
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-i', a.out, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', a.master], check=True)
    print('master', a.master)
