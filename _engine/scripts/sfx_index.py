#!/usr/bin/env python3
"""Index SFX/Library (Sonniss GDC recordings) so sounds can be found by what they are.
    python3 scripts/sfx_index.py                 -> rebuild SFX/Library/index.json
    python3 scripts/sfx_index.py find whoosh metal --max 4 --n 15
"""
import json, re, subprocess, sys, concurrent.futures as cf
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]; LIB = ROOT / 'SFX/Library'; IDX = LIB / 'index.json'
CAT = {'impact': r'impact|hit|punch|slam|thud|crash|smash|bang|body ?fall', 'whoosh': r'whoosh|swoosh|swish|whip|pass ?by|flyby|transition|swipe', 'riser': r'riser|braam|build|tension|stinger|sting',
 'footstep': r'footstep|\bsteps?\b|walk|boot', 'cloth': r'cloth|fabric|rustle|leather', 'paper': r'paper|book|page|envelope|card', 'door': r'door|drawer|latch|lock|\bkey', 'wood': r'wood|creak|plank|stick', 'metal': r'metal|chain|steel|iron|anvil|clang',
 'glass': r'glass|bottle|shatter|ceramic', 'coin': r'coin|money|cash', 'water': r'water|splash|drip|pour|bubble|underwater|hydrophone', 'sea': r'wave|ocean|\bsea\b|surf|boat|ship|harbo', 'rain': r'rain|thunder|storm', 'wind': r'\bwind\b|gust|breeze', 'fire': r'fire|flame|burn|ember|explosion',
 'crowd': r'crowd|walla|applause|people|children', 'human': r'gasp|breath|heart|cough|scream', 'room': r'room ?tone|interior|indoor|hall|office|factory|tunnel|basement|church|kitchen|restaurant', 'city': r'city|street|traffic|urban', 'nature': r'forest|bird|insect|jungle|garden',
 'machine': r'machine|engine|motor|mechanical|clock|tick|typewriter|lever|switch|button|gear', 'alarm': r'alarm|siren|bell|horn|radio|beep', 'tool': r'tool|hammer|saw|drill|shovel|dig', 'weapon': r'gun|rifle|shot|sword|reload', 'vehicle': r'car|truck|train|plane|tank'}
if len(sys.argv) > 1 and sys.argv[1] == 'find':
    q = [x for x in sys.argv[2:] if not x.startswith('--')]; args = sys.argv
    mx = float(args[args.index('--max') + 1]) if '--max' in args else 1e9
    n = int(args[args.index('--n') + 1]) if '--n' in args else 15
    q = [x for x in q if not re.fullmatch(r'[\d.]+', x)]
    for r in sorted((x for x in json.load(open(IDX)) if all(t in (x['path'].lower() + ' ' + ' '.join(x['tags'])) for t in q) and x['dur'] <= mx), key=lambda x: x['dur'])[:n]:
        print(f"{r['dur']:6.2f}s {r['ch']}ch  {r['path']}")
    sys.exit()
def probe(p):
    try:
        o = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=channels,sample_rate:format=duration', '-of', 'json', str(p)], capture_output=True, text=True).stdout)
        rel = str(p.relative_to(ROOT)); t = rel.lower()
        return {'path': rel, 'dur': round(float(o['format']['duration']), 2), 'ch': o['streams'][0]['channels'], 'sr': int(o['streams'][0]['sample_rate']), 'tags': [k for k, r in CAT.items() if re.search(r, t)]}
    except Exception:
        return None
fs = [p for p in LIB.rglob('*') if p.suffix.lower() in ('.wav', '.aif', '.aiff', '.flac')]
with cf.ThreadPoolExecutor(8) as ex: rows = [r for r in ex.map(probe, fs) if r]
json.dump(rows, open(IDX, 'w'))
import collections
c = collections.Counter(t for r in rows for t in r['tags'])
print(len(rows), 'sounds;', dict(c.most_common()))
