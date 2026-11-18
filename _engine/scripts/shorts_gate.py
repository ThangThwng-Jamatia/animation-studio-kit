# Shorts gate: checks a script, a voice-over or a finished short against the measured viral inspo.
# Source: the Shorts Gap Study (2026-11-09), .claude/skills/storytelling/references/viral-shorts-standard.md.
# Floors sit at (or just inside) the weakest inspo video on each measure, so PASS means "at least as good as their worst".
#
#   python3 scripts/shorts_gate.py script <script.txt|.md> --profile fable|build|facts
#   python3 scripts/shorts_gate.py voice  <job dir with words.json + voice.mp3> --profile fable|build|facts
#   python3 scripts/shorts_gate.py video  <final.mp4> --profile fable|build|facts [--words <words.json>]
#
# Exit code 0 = PASS, 1 = FAIL. Report the printed numbers to the user as they are; never deliver on FAIL
# without saying which line failed and why.
import sys, re, json, argparse, subprocess
import numpy as np, cv2

P = {  # per-profile targets. inspo 2D = Grave/Cashiers/Window/Brain; inspo 3D = Nine Tails/Jungle
 'fable': dict(words=(140, 225), sent_min=12.0, short_sent_max=4, first=(10, 20), names_max=2, years_max=0, conn_min=3.5, you_min=0.0,
               wps=3.5, pauses=6.0, maxpause=0.7,
               bright=100, bright_night=82, colorful=41, edge=4.0, dark=35, dark_night=46, cuts=(10, 28), inshot=4.7, ambient=3.2, m3=5.0, static=2.5, bass=0.36, air=0.09, tail=0.5),
 'build': dict(words=(230, 285), sent_min=11.0, short_sent_max=4, first=(10, 20), names_max=1, years_max=0, conn_min=4.0, you_min=4.0,
               wps=3.7, pauses=6.0, maxpause=0.7,
               bright=100, bright_night=85, colorful=41, edge=4.1, dark=22, dark_night=35, cuts=(20, 58), inshot=4.4, ambient=3.0, m3=4.0, static=1.5, bass=0.36, air=0.0, tail=1.9),
 'facts': dict(words=(170, 240), sent_min=11.0, short_sent_max=3, first=(10, 20), names_max=1, years_max=0, conn_min=3.5, you_min=4.0,
               wps=3.6, pauses=6.0, maxpause=0.7,
               bright=100, bright_night=85, colorful=41, edge=4.1, dark=22, dark_night=35, cuts=(20, 58), inshot=4.4, ambient=3.0, m3=4.0, static=1.5, bass=0.36, air=0.0, tail=0.6),
}
BANNED = [r"\bhere'?s why\b", r"\bhere'?s what'?s happening\b", r"\bhere'?s the thing\b", r"\bin this video\b", r"\blet['’]s\b",
          r"\bso remember\b", r"\bthe lesson\b", r"\bthe moral\b", r"\bdid you know\b", r"\bfollow for\b", r"\bsubscribe\b",
          r"\bcomment\b", r"\bsend this to\b", r"\bwhat would you do\b", r"\bpart \d\b"]
CONNECT = ['so', 'but', 'except', 'you see', 'wait', 'then', 'until', 'instead', 'now', 'because', 'which means', 'and that']

rows, ok = [], True
def check(name, val, good, target, fmt='.2f'):
    global ok
    ok = ok and good
    rows.append(f"{'ok  ' if good else 'FAIL'} {name}: {format(val, fmt) if isinstance(val, (int, float)) else val}  (target {target})")

def script_text(path):
    t = open(path).read()
    m = re.search(r'##\s*(?:Script|Voice script|VO)\s*\n(.*?)(?=\n##\s|\Z)', t, re.S | re.I)
    t = m.group(1) if m else t
    t = re.sub(r'[*_#>`]', '', t)
    return ' '.join(l.strip() for l in t.splitlines() if l.strip() and not l.strip().startswith(('-', '|')))

def do_script(path, p):
    t = script_text(path)
    sents = [s for s in re.split(r'(?<=[.!?])\s+', t) if re.search(r'\w', s)]
    lens = [len(s.split()) for s in sents]
    words = sum(lens)
    check('word count', words, p['words'][0] <= words <= p['words'][1], f"{p['words'][0]}–{p['words'][1]}", 'd')
    check('words per sentence (mean)', float(np.mean(lens)), np.mean(lens) >= p['sent_min'], f">= {p['sent_min']} (inspo 12.7–20)")
    short = [s for s, n in zip(sents, lens) if n < 5]
    check('sentences under 5 words', len(short), len(short) <= p['short_sent_max'], f"<= {p['short_sent_max']}", 'd')
    check('first sentence words', lens[0], p['first'][0] <= lens[0] <= p['first'][1], f"{p['first'][0]}–{p['first'][1]} (inspo 12–20)", 'd')
    caps = set()
    for s in sents:
        toks = re.findall(r"[A-Za-z][\w'’-]*", s)
        for w in toks[1:]:
            if w[0].isupper() and w not in ('I', "I'm", "I'll", "I've", "I'd", 'OK') and not w.isupper(): caps.add(w.strip("'’s"))
    check('proper names', len(caps), len(caps) <= p['names_max'], f"<= {p['names_max']} (use roles: 'a con man', 'the cook')", 'd')
    years = re.findall(r'\b(1[5-9]\d\d|20\d\d)\b', t)
    check('years / dates in the script', len(years), len(years) <= p['years_max'], f"<= {p['years_max']} (put a date on screen, not in the voice)", 'd')
    low = ' ' + re.sub(r"[^\w' ]", ' ', t.lower()) + ' '
    conn = sum(low.count(f' {c} ') for c in CONNECT) / words * 100
    check('connectors per 100 words', conn, conn >= p['conn_min'], f">= {p['conn_min']} (so / but / except / you see / wait)")
    you = sum(low.count(f' {w} ') for w in ['you', 'your', "you're", "you've", 'yourself']) / words * 100
    check('"you" share %', you, you >= p['you_min'], f">= {p['you_min']}")
    hits = [b for b in BANNED if re.search(b, t, re.I)]
    check('banned phrases', ', '.join(hits) or 'none', not hits, 'none (no lecture signposts, morals, CTAs or part numbers)')
    print('Estimated length at 3.7 words/s: %.0f s' % (words / 3.7))
    print('Shortest sentences:', ' | '.join(short[:6]) or '-')

def load_words(path):
    W = json.load(open(path))
    if isinstance(W, dict) and 'segments' in W:
        return [(w['word'].strip(), w['start'], w['end']) for s in W['segments'] for w in s['words']]
    return [tuple(w) for w in W]

def audio_pauses(mp3, t0, t1):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32); hop = 160; n = len(x) // hop
    r = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-6)
    thr = np.median(r[r > r.max() - 45]) - 15
    q = r < thr; out = []; i = int(t0 * 100)
    while i < min(n, int(t1 * 100)):
        if q[i]:
            k = i
            while k < n and q[k]: k += 1
            out.append((k - i) / 100); i = k
        else: i += 1
    return out

def whisper_words(mp3):
    """Word times from whisper small.en: the same yardstick the inspo was measured with (2026-11-09)."""
    import tempfile, shutil, os
    if not shutil.which('whisper'): return None
    d = tempfile.mkdtemp()
    wav = os.path.join(d, 'v.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp3, '-ac', '1', '-ar', '16000', wav], check=True)
    subprocess.run(['whisper', wav, '--model', 'small.en', '--word_timestamps', 'True', '--output_format', 'json', '--output_dir', d, '--fp16', 'False', '--language', 'en'], capture_output=True)
    try: return load_words(os.path.join(d, 'v.json'))
    except Exception: return None

def do_voice(job, p):
    W = load_words(f'{job}/words.json')
    t0, t1 = W[0][1], W[-1][2]; span = t1 - t0
    check('words per second', len(W) / span, len(W) / span >= p['wps'], f">= {p['wps']} (inspo 3.5–4.0)")
    WW = whisper_words(f'{job}/voice.mp3')
    if WW:
        g = [WW[i + 1][1] - WW[i][2] for i in range(len(WW) - 1)]; sp = WW[-1][2] - WW[0][1]
        how = 'whisper small.en, same as the inspo'
    else:
        g = audio_pauses(f'{job}/voice.mp3', t0, t1); sp = span
        how = 'audio silence (whisper not found: weaker than the inspo measure)'
    pm = sum(1 for x in g if x > 0.35) / sp * 60
    check('pauses > 350 ms per minute', pm, pm <= p['pauses'], f"<= {p['pauses']} (inspo 1.7–6.1; ours were 20–29) [{how}]", '.1f')
    check('longest pause s', max(g or [0]), max(g or [0]) <= p['maxpause'], f"<= {p['maxpause']}")
    print(f'{len(W)} words, {span:.1f} s of speech. If pauses FAIL: run scripts/tighten_vo.py {job} first; if they still FAIL, the script has too many full stops, so join sentences (standard §1 rule 4) and regenerate. If words/s FAILs: same fix; never atempo above 1.1.')

def do_video(path, p, words, night=False):
    W, H = 180, 320
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32); n = len(a); fps = 30
    check('frame 0 is a picture (mean luma)', float(a[0].mean()), a[0].mean() >= 25, '>= 25: never open on black, no fade-in', '.0f')
    d = np.abs(np.diff(a, axis=0)).mean(axis=(1, 2))
    hs = np.array([np.histogram(x, bins=32, range=(0, 256))[0] / x.size for x in a]); hd = np.abs(np.diff(hs, axis=0)).sum(1)
    cuts = []
    for i in range(n - 1):
        if (hd[i] > 0.35 or (d[i] > 25 and hd[i] > 0.2)) and (not cuts or i + 1 - cuts[-1] > 2): cuts.append(i + 1)
    cs = set(cuts); dur = n / fps
    cpm = len(cuts) / dur * 60
    check('cuts per minute', cpm, p['cuts'][0] <= cpm <= p['cuts'][1], f"{p['cuts'][0]}–{p['cuts'][1]} (travel inside a set instead of cutting)", '.0f')
    ins = float(np.mean([d[i] for i in range(n - 1) if i + 1 not in cs]))
    check('motion inside shots', ins, ins >= p['inshot'], f">= {p['inshot']}")
    ds = np.convolve(d, np.ones(3) / 3, 'same'); hot = ds > 12
    amb = float(np.median(ds[~hot])) if (~hot).any() else 0
    check('ambient motion (between moves)', amb, amb >= p['ambient'], f">= {p['ambient']}")
    m3 = float(d[:89].mean())
    check('motion in first 3 s', m3, m3 >= p['m3'], f">= {p['m3']}")
    st = float((d < 0.3).mean() * 100)
    check('static frames %', st, st <= p['static'], f"<= {p['static']}", '.1f')
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', 'fps=2,scale=360:640', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
    f = np.frombuffer(raw, np.uint8).reshape(-1, 640, 360, 3)
    V, C, Dk, E = [], [], [], []
    for x in f:
        g = cv2.cvtColor(x, cv2.COLOR_BGR2GRAY); V.append(cv2.cvtColor(x, cv2.COLOR_BGR2HSV)[..., 2].mean())
        Bc, Gc, Rc = [c.astype(float) for c in cv2.split(x)]; rg = Rc - Gc; yb = .5 * (Rc + Gc) - Bc
        C.append(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + .3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2))
        Dk.append((g < 40).mean() * 100); E.append((cv2.Canny(g, 80, 160) > 0).mean() * 100)
    bright, colf, dark, edge = float(np.mean(V)), float(np.mean(C)), float(np.mean(Dk)), float(np.mean(E))
    if night: p = dict(p, bright=p['bright_night'], dark=p['dark_night'])
    check('brightness (HSV value)', bright, bright >= p['bright'], f">= {p['bright']} (inspo 2D 86–171, 3D 102–133)", '.0f')
    check('colourfulness', colf, colf >= p['colorful'], f">= {p['colorful']} (inspo 42–85; ours were 25–36 fables, 25–62 3D)", '.0f')
    check('near-black pixels %', dark, dark <= p['dark'], f"<= {p['dark']}", '.0f')
    check('detail (edge pixels %)', edge, edge >= p['edge'], f">= {p['edge']} (Canny 80/160 at 360x640; inspo 2D 4.1–6.5, 3D 4.2–5.6)", '.1f')
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    s = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768; hop = 800
    fr = s[:len(s) // hop * hop].reshape(-1, hop); sp = np.abs(np.fft.rfft(fr * np.hanning(hop), axis=1)) ** 2
    fq = np.fft.rfftfreq(hop, 1 / 16000); tot = sp.sum(1) + 1e-12
    bass = float((sp[:, fq < 200].sum(1) / tot).mean()); air = float((sp[:, fq > 4000].sum(1) / tot).mean())
    check('low end share < 200 Hz', bass, bass <= p['bass'], f"<= {p['bass']} (inspo 0.24–0.35; ours were 0.39–0.52)")
    if p['air']: check('crispness share > 4 kHz', air, air >= p['air'], f">= {p['air']} (inspo 2D 0.12–0.13; our fables 0.03–0.08)")
    if words:
        Wd = load_words(words); tail = len(s) / 16000 - Wd[-1][2]
        check('tail after last word s', tail, tail <= p['tail'], f"<= {p['tail']} (inspo 0.04–0.49: cut on the payoff)")
    else:
        print('     (pass --words <final words.json> to check the tail after the last word)')
    print(f'{dur:.1f} s, {len(cuts)} cuts. Motion and colour FAILs mean more camera travel, more light and colour before delivery, not a re-grade in post.')

ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['script', 'voice', 'video']); ap.add_argument('path')
ap.add_argument('--profile', required=True, choices=list(P)); ap.add_argument('--words'); ap.add_argument('--night', action='store_true', help='a deliberately dark film (like the inspo Brain\'s Secret): lower brightness / dark floors; colour and detail still apply')
A = ap.parse_args(); p = P[A.profile]
{'script': lambda: do_script(A.path, p), 'voice': lambda: do_voice(A.path.rstrip('/'), p), 'video': lambda: do_video(A.path, p, A.words, A.night)}[A.mode]()
print('\n'.join(rows)); print(f"SHORTS GATE ({A.mode}, {A.profile}):", 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
