#!/usr/bin/env python3
"""Score a short with ElevenLabs Music, sections cut to the story's beats.
    python3 scripts/el_music.py <plan.json> <out.mp3>      (ELEVENLABS_API_KEY from ../.env.local)
plan.json: {"words": path, "sec": 59.6, "global": [...], "avoid": [...], "sections": [{"name": "..", "until": {"w": "three", "n": 1} | "end", "styles": [...], "avoid": [...]}]}
Times come from the voice, so the score turns on the same word the picture does.
"""
import json, re, sys, urllib.request
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
key = next(l.split('=', 1)[1].strip() for l in open(ROOT / '.env.local') if l.startswith('ELEVENLABS_API_KEY'))
P = json.load(open(sys.argv[1])); W = json.load(open(ROOT / P['words']))
def at(r):
    if 't' in r: return r['t']
    return [x for x in W if re.sub(r'[^a-z0-9]', '', x[0].lower()) == r['w']][r.get('n', 1) - 1][1]
secs, t0 = [], 0.0
for s in P['sections']:
    t1 = P['sec'] if s['until'] == 'end' else at(s['until'])
    secs.append({'section_name': s['name'], 'positive_local_styles': s['styles'], 'negative_local_styles': s.get('avoid', []), 'duration_ms': int((t1 - t0) * 1000), 'lines': []}); t0 = t1
print([(s['section_name'], s['duration_ms']) for s in secs], flush=True)
body = {'composition_plan': {'positive_global_styles': P['global'], 'negative_global_styles': P['avoid'] + ['vocals', 'singing'], 'sections': secs}, 'respect_sections_durations': True}
q = urllib.request.Request('https://api.elevenlabs.io/v1/music?output_format=mp3_44100_192', data=json.dumps(body).encode(), headers={'xi-api-key': key, 'content-type': 'application/json'})
try:
    d = urllib.request.urlopen(q, timeout=280).read()
except urllib.error.HTTPError as e:
    sys.exit(f'{e.code} {e.read()[:400]}')
Path(sys.argv[2]).parent.mkdir(parents=True, exist_ok=True); open(sys.argv[2], 'wb').write(d); print('wrote', sys.argv[2], len(d))
