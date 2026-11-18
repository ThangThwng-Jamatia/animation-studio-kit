# Tighten a voice-over the way the viral inspo sounds: no silence inside the read longer than --max-gap.
# Built 2026-11-09 from the Shorts Gap Study: inspo narrators pause (>350 ms) 2–6 times a minute, ours 20–29.
# usage (from _engine/): python3 scripts/tighten_vo.py public/jobs/<slug> [--max-gap 0.12] [--keep word:sec,...]
#   reads  <job>/voice.mp3 + <job>/words.json ([word,start,end][] from el_voice.mjs)
#   writes <job>/voice.mp3 + <job>/words.json + words.txt (tightened); originals kept once as voice_loose.mp3 / words_loose.json
#   --keep "back:0.5"  lets the silence right after that word stay up to 0.5 s (one deliberate beat; max 1–2 per film)
# Silence is found in the AUDIO (10 ms RMS, 15 dB under the median speech level; breaths and room tone count as silence), not from word times:
# ElevenLabs word ends include trailing silence, so word gaps under-count the real pauses by about half.
# Tested: Falling Jolt 3.15 -> 3.57 words/s at gap 0.20 (still FAILs: script too choppy). 2026-11-09 builds at gap 0.12 + tempo 1.1:
# Agloe (Liam) 3.22 -> 3.64 w/s, 3.1 pauses/min PASS; Tickle (Brian) 3.50 -> 3.99 w/s, 1.1 pauses/min PASS. eleven_v4 ignores voice_settings.speed.
# Each long silence is shortened from its middle with 15 ms fades, so no breath or word tail is clipped.
# Re-running always starts again from the *_loose originals.
import json, os, shutil, subprocess, argparse
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('job'); ap.add_argument('--max-gap', type=float, default=0.12); ap.add_argument('--keep', default='')
ap.add_argument('--floor-db', type=float, default=15.0, help='silence = this many dB under the median speech level')
a = ap.parse_args()
J = a.job.rstrip('/')
vo, wj = f'{J}/voice.mp3', f'{J}/words.json'
if not os.path.exists(f'{J}/voice_loose.mp3'):
    shutil.copy(vo, f'{J}/voice_loose.mp3'); shutil.copy(wj, f'{J}/words_loose.json')
W = json.load(open(f'{J}/words_loose.json'))
keep = {}
for kv in filter(None, a.keep.split(',')):
    k, v = kv.rsplit(':', 1); keep[k.lower().strip('.,!?')] = float(v)

SR = 44100
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{J}/voice_loose.mp3', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32)
hop = int(0.01 * SR)
n = len(x) // hop
rms = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-6)
thr = np.median(rms[rms > rms.max() - 45]) - a.floor_db
quiet = rms < thr

def runs(mask):
    r, i = [], 0
    while i < len(mask):
        if mask[i]:
            k = i
            while k < len(mask) and mask[k]: k += 1
            r.append((i * 0.01, k * 0.01)); i = k
        else: i += 1
    return r

t0, t1 = W[0][1], W[-1][2]
cuts = []
for s, e in runs(quiet):
    if s <= t0 + 0.05 or e >= len(x) / SR - 0.05:  # lead-in / tail: trim lead-in to 0, leave the tail to the editor
        if s <= 0.01 and e > 0.02: cuts.append((0.0, max(0.0, e - 0.02)))
        continue
    prev = [w for w in W if w[1] <= s]
    allow = keep.get(prev[-1][0].lower().strip('.,!?'), a.max_gap) if prev else a.max_gap
    if e - s > allow:
        mid, rm = (s + e) / 2, (e - s) - allow
        cuts.append((mid - rm / 2, mid + rm / 2))

out, pos, marks, removed = [], 0, [], 0.0
fade = int(0.015 * SR)
for cs, ce in cuts:
    s, e = int(cs * SR), int(ce * SR)
    seg = x[pos:s].copy()
    if len(seg) > 2 * fade:
        seg[-fade:] *= np.linspace(1, 0, fade)
        if pos > 0: seg[:fade] *= np.linspace(0, 1, fade)
    out.append(seg); pos = e
    removed += ce - cs; marks.append((cs, ce, removed))
tail = x[pos:].copy()
if pos > 0 and len(tail) > fade: tail[:fade] *= np.linspace(0, 1, fade)
out.append(tail)
y = np.concatenate(out)

def remap(t):
    d = 0.0
    for cs, ce, rem in marks:
        if t >= ce: d = rem
        elif t > cs: return round(cs - (rem - (ce - cs)), 3)  # inside a cut: snap to the cut point
    return round(t - d, 3)

W2 = [[w, remap(s), remap(e)] for w, s, e in W]
tmp = f'{J}/voice_tight.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-', tmp],
               input=np.clip(y, -32768, 32767).astype(np.int16).tobytes(), check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-ar', '44100', '-b:a', '192k', vo], check=True)
os.remove(tmp)
json.dump(W2, open(wj, 'w'))
open(f'{J}/words.txt', 'w').write('\n'.join(f'{s:.2f} {w}' for w, s, _ in W2))

def pauses(sig):
    m = len(sig) // hop
    r = 20 * np.log10(np.sqrt((sig[:m * hop].reshape(m, hop) ** 2).mean(1)) + 1e-6)
    rr = [p for p in runs(r < thr) if p[0] > 0.05 and p[1] < m * 0.01 - 0.05]
    span = m * 0.01
    return sum(1 for s, e in rr if e - s > 0.35) / span * 60, max([e - s for s, e in rr] or [0]), span

p0, mx0, sp0 = pauses(x); p1, mx1, sp1 = pauses(y)
print(f'{len(W)} words | {sp0:.1f}s -> {sp1:.1f}s (removed {removed:.1f}s in {len(cuts)} silences)')
print(f'words/s {len(W)/sp0:.2f} -> {len(W)/sp1:.2f} | pauses>350ms/min {p0:.1f} -> {p1:.1f} | longest silence {mx0:.2f}s -> {mx1:.2f}s')
print('Target (inspo): words/s 3.5–4.0, pauses/min ≤ 6, longest ≤ 0.6 s. Below 3.5 words/s: re-generate faster or rewrite, never atempo > 1.1.')
