#!/usr/bin/env python3
"""Map whisper word times onto the script's own words -> <job>/words.json ([word,start,end][]) + words.txt.
For voices made outside el_voice.mjs (e.g. VidIQ voiceover), which return no timestamps.
usage: align_words.py <job> <whisper.json>   (script from <job>/script.txt)"""
import json, re, sys, difflib
J, wj = sys.argv[1], sys.argv[2]
S = open(f'{J}/script.txt').read().split()
W = [(w['word'].strip(), w['start'], w['end']) for seg in json.load(open(wj))['segments'] for w in seg.get('words', [])]
n = lambda w: re.sub(r"[^a-z0-9]", '', w.lower())
a, b = [n(w) for w in S], [n(w) for w, _, _ in W]
out = [None] * len(S)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag == 'equal':
        for k in range(i2 - i1): out[i1 + k] = (W[j1 + k][1], W[j1 + k][2])
    elif j2 > j1:  # spread the whisper span across the script words
        s, e = W[j1][1], W[j2 - 1][2]; m = i2 - i1
        for k in range(m): out[i1 + k] = (s + (e - s) * k / m, s + (e - s) * (k + 1) / m)
for i in range(len(out)):  # fill gaps by interpolation
    if out[i] is None:
        p = out[i - 1][1] if i else 0.0
        q = next((o[0] for o in out[i + 1:] if o), p + 0.2)
        out[i] = (p, max(p + 0.05, min(q, p + 0.25)))
res = [[w, round(s, 3), round(e, 3)] for w, (s, e) in zip(S, out)]
json.dump(res, open(f'{J}/words.json', 'w'))
open(f'{J}/words.txt', 'w').write('\n'.join(f'{s:.2f} {w}' for w, s, _ in res))
miss = sum(1 for t in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes() if t[0] != 'equal')
print(f'{len(res)} script words, {len(W)} whisper words, {miss} non-equal blocks, end {res[-1][2]}s')
