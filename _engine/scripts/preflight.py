# Preflight: one pre-publish check for a finished 9:16 short (YouTube Shorts + Instagram Reels).
# Skill: .claude/skills/preflight/SKILL.md
#
#   python3 scripts/preflight.py <final.mp4> [--slug name] [--profile fable|build|facts|talk]
#                                [--words words.json] [--variants] [--hook-text "..."] [--no-whisper]
#
# Writes _engine/preflight/<slug>/: report.md, report.json, hook_sheet.jpg, story_sheet.jpg, end_sheet.jpg
# and with --variants: variants/A_original.mp4, B_coldopen.mp4, C_texthook.mp4 (needs --hook-text), D_faststart.mp4
# Appends the measured features to _engine/preflight/index.jsonl (used by preflight_log.py predict).
# Exit 0 = no BLOCKER lines, 1 = at least one BLOCKER.
import sys, os, re, json, argparse, subprocess, shutil, tempfile, datetime
import numpy as np, cv2

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PF = os.path.join(ENGINE, 'preflight')
FONT = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
SAFE = dict(top=250, bottom=450, right=140)  # IG/YT UI overlay, px on a 1080x1920 frame

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('--slug'); ap.add_argument('--words')
ap.add_argument('--profile', choices=['fable', 'build', 'facts', 'talk'], default='talk')
ap.add_argument('--variants', action='store_true'); ap.add_argument('--hook-text')
ap.add_argument('--no-whisper', action='store_true')
A = ap.parse_args()
src = os.path.abspath(A.video)
slug = A.slug or re.sub(r'[^a-z0-9]+', '-', os.path.splitext(os.path.basename(src))[0].lower()).strip('-')
out = os.path.join(PF, slug); os.makedirs(out, exist_ok=True)

rows, blockers = [], 0
def row(level, name, val, target):
    global blockers
    blockers += level == 'BLOCKER'
    rows.append((level, name, val, target))

def sh(cmd, **k): return subprocess.run(cmd, capture_output=True, text=True, **k)

# ---------- probe ----------
pr = json.loads(sh(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', src]).stdout)
vs = next(s for s in pr['streams'] if s['codec_type'] == 'video')
has_audio = any(s['codec_type'] == 'audio' for s in pr['streams'])
Wd, Hd = int(vs['width']), int(vs['height'])
num, den = map(int, vs['r_frame_rate'].split('/')); fps = num / den
dur = float(pr['format']['duration'])

row('ok' if (Wd, Hd) == (1080, 1920) else 'BLOCKER', 'resolution', f'{Wd}x{Hd}', '1080x1920 (9:16)')
row('ok' if fps >= 24 else 'WARN', 'fps', f'{fps:.2f}', '>= 24 (30 or 60 ideal)')
row('ok' if dur <= 180 else 'BLOCKER', 'duration s', f'{dur:.1f}', '<= 180 (Shorts and Reels limit)')
if dur > 90: row('WARN', 'long for a short', f'{dur:.1f}', 'completion falls fast past 60–90 s; only keep if every 8 s re-hooks')

# ---------- frames (small grey + small colour) ----------
SW, SH = 180, 320
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={SW}:{SH},fps=30', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
rgb = np.frombuffer(raw, np.uint8).reshape(-1, SH, SW, 3).astype(np.float32)
g = rgb.mean(3); n = len(g); F = 30
diff = np.abs(np.diff(g, axis=0)).mean(axis=(1, 2))
hs = np.array([np.histogram(x, bins=32, range=(0, 256))[0] / x.size for x in g]); hd = np.abs(np.diff(hs, axis=0)).sum(1)
cuts = []
for i in range(n - 1):
    if (hd[i] > 0.35 or (diff[i] > 25 and hd[i] > 0.2)) and (not cuts or i + 1 - cuts[-1] > 2): cuts.append(i + 1)
def colourful(f):  # Hasler–Süsstrunk
    rg = f[..., 0] - f[..., 1]; yb = 0.5 * (f[..., 0] + f[..., 1]) - f[..., 2]
    return float(np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2))
colour = np.array([colourful(rgb[i]) for i in range(0, n, 3)])
cutset = set(cuts)
inshot = np.array([diff[i] for i in range(n - 1) if (i + 1) not in cutset])
static_s = 0.0; run = 0  # longest stretch with no cut and almost no motion
for i in range(n - 1):
    run = run + 1 if (diff[i] < 0.6 and (i + 1) not in cutset) else 0
    static_s = max(static_s, run / F)

f0 = float(g[0].mean())
row('ok' if f0 >= 25 else 'BLOCKER', 'frame 0 luma', f'{f0:.0f}', '>= 25 — never open on black; frame 0 is the feed thumbnail')
hm = float(diff[:F].mean()) if n > F else 0.0
row('ok' if hm >= 2.0 else 'WARN', 'motion in first 1 s', f'{hm:.2f}', '>= 2.0 — something must move before the thumb does')
c3 = sum(1 for c in cuts if c < 3 * F)
row('ok' if 1 <= c3 <= 6 else 'WARN', 'cuts in first 3 s', c3, '1–6 — a new picture inside 3 s, but not a strobe')
cpm = len(cuts) / dur * 60
row('ok' if 10 <= cpm <= 60 else 'WARN', 'cuts per minute', f'{cpm:.0f}', '10–60 (2D inspo ~19, 3D/talk 20–58)')
row('ok' if static_s <= 2.5 else 'WARN', 'longest frozen stretch s', f'{static_s:.1f}', '<= 2.5 — a held still is a swipe')
row('ok' if colour.mean() >= 35 else 'WARN', 'colourfulness', f'{colour.mean():.0f}', '>= 35 (viral inspo 42–85)')
row('ok' if g.mean() >= 70 else 'WARN', 'mean brightness', f'{g.mean():.0f}', '>= 70 (dark films read as muddy on phones)')
loop = float(1 - np.abs(g[0] - g[-1]).mean() / 255)
row('info', 'loop match (last vs first frame)', f'{loop:.2f}', '> 0.85 means the replay can feel seamless (helps rewatch)')

# ---------- audio ----------
lufs = tp = None; onset_audio = None
if has_audio:
    e = sh(['ffmpeg', '-nostats', '-i', src, '-af', 'ebur128=peak=true', '-f', 'null', '-']).stderr
    m = re.findall(r'I:\s+(-?[\d.]+) LUFS', e); lufs = float(m[-1]) if m else None
    m = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e); tp = float(m[-1]) if m else None
    if lufs is not None: row('ok' if -16 <= lufs <= -12 else 'WARN', 'loudness LUFS', f'{lufs:.1f}', '-16 … -12 (both apps normalise to ~-14)')
    if tp is not None: row('ok' if tp <= -1.0 else 'WARN', 'true peak dBTP', f'{tp:.1f}', '<= -1.0 (else clipping after the app re-encodes)')
    sd = sh(['ffmpeg', '-i', src, '-t', '4', '-af', 'silencedetect=n=-40dB:d=0.15', '-f', 'null', '-']).stderr
    ends = re.findall(r'silence_end: ([\d.]+)', sd); starts = re.findall(r'silence_start: ([\d.]+)', sd)
    onset_audio = float(ends[0]) if starts and float(starts[0]) < 0.05 and ends else 0.0
    row('ok' if onset_audio <= 0.3 else 'BLOCKER', 'sound starts at s', f'{onset_audio:.2f}', '<= 0.3 — silence at the start reads as a broken video')
else:
    row('BLOCKER', 'audio', 'none', 'a short needs sound')

# ---------- words ----------
words = None; wsrc = None
if A.words:
    W = json.load(open(A.words))
    words = [(w['word'].strip(), w['start'], w['end']) for s in W['segments'] for w in s['words']] if isinstance(W, dict) and 'segments' in W else [tuple(w[:3]) for w in W]
    wsrc = 'words.json'
elif has_audio and not A.no_whisper and shutil.which('whisper'):
    d = tempfile.mkdtemp(); wav = os.path.join(d, 'v.wav')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '16000', wav], check=True)
    subprocess.run(['whisper', wav, '--model', 'base.en', '--word_timestamps', 'True', '--output_format', 'json',
                    '--output_dir', d, '--fp16', 'False', '--language', 'en'], capture_output=True)
    try:
        J = json.load(open(os.path.join(d, 'v.json')))
        words = [(w['word'].strip(), w['start'], w['end']) for s in J['segments'] for w in s.get('words', [])]
        wsrc = 'whisper base.en'
    except Exception: words = None
first_line = last_line = ''; speech_onset = None; fl_words = 0; wps = None
if words:
    speech_onset = words[0][1]
    toks = [w[0] for w in words]
    i = next((k for k, t in enumerate(toks) if re.search(r'[.?!]$', t)), min(len(toks), 20) - 1)
    first_line = ' '.join(toks[:i + 1]); fl_words = i + 1
    j = max((k for k, t in enumerate(toks[:-1]) if re.search(r'[.?!]$', t)), default=-1)
    last_line = ' '.join(toks[j + 1:])
    span = words[-1][2] - words[0][1]; wps = len(words) / span if span > 0 else None
    row('ok' if speech_onset <= 0.5 else 'WARN', 'first word spoken at s', f'{speech_onset:.2f}', '<= 0.5 (talking/voiced shorts)')
    row('ok' if 6 <= fl_words <= 22 else 'WARN', 'first line words', fl_words, '6–22 — one complete, curious thought (viral standard: 10–20)')
    if wps: row('ok' if wps >= 3.0 else 'WARN', 'words per second', f'{wps:.2f}', '>= 3.0 (viral inspo 3.5–4.0)')
    tail = dur - words[-1][2]
    row('ok' if tail <= 1.2 else 'WARN', 'tail after last word s', f'{tail:.1f}', '<= 1.2 — cut on the payoff; dead tail = swipe before the loop')
    BAN = [r"\bin this video\b", r"\bfollow for\b", r"\bsubscribe\b", r"\blike and\b", r"\bhey guys\b", r"\bwhat'?s up\b", r"\bpart \d\b", r"\blink in bio\b"]
    hit = [b for b in BAN if re.search(b, ' '.join(toks[:25]).lower())]
    if hit: row('WARN', 'weak opener phrase in first 25 words', ', '.join(hit), 'start on the story, not the channel')

# ---------- format gate ----------
gate = None
if A.profile in ('fable', 'build', 'facts'):
    cmd = ['python3', os.path.join(ENGINE, 'scripts', 'shorts_gate.py'), 'video', src, '--profile', A.profile] + (['--words', A.words] if A.words else [])
    r = sh(cmd, cwd=ENGINE); gate = r.stdout.strip()
    gp = 'SHORTS GATE' in gate and gate.rstrip().endswith('PASS')
    row('ok' if gp else 'BLOCKER', f'shorts_gate video ({A.profile})', 'PASS' if gp else 'FAIL', 'Viral Shorts Standard — see gate output below')

# ---------- contact sheets ----------
def grab(t):
    p = os.path.join(tempfile.gettempdir(), f'pf_{os.getpid()}_{t:.3f}.png')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t):.3f}', '-i', src, '-frames:v', '1', '-vf', 'scale=360:640', p])
    im = cv2.imread(p); os.remove(p) if os.path.exists(p) else None
    return im if im is not None else np.zeros((640, 360, 3), np.uint8)
def tile(times, path, safe=True, cols=None):
    ims = []
    for t in times:
        im = grab(t).copy(); s = 360 / 1080
        if safe:
            ov = im.copy()
            cv2.rectangle(ov, (0, 0), (359, int(SAFE['top'] * s)), (0, 0, 255), -1)
            cv2.rectangle(ov, (0, 639 - int(SAFE['bottom'] * s)), (359, 639), (0, 0, 255), -1)
            cv2.rectangle(ov, (359 - int(SAFE['right'] * s), 0), (359, 639), (0, 0, 255), -1)
            im = cv2.addWeighted(ov, 0.22, im, 0.78, 0)
        cv2.rectangle(im, (0, 0), (110, 34), (0, 0, 0), -1)
        cv2.putText(im, f'{t:.2f}s', (6, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2)
        ims.append(im)
    cols = cols or len(ims)
    while len(ims) % cols: ims.append(np.zeros_like(ims[0]))
    grid = np.vstack([np.hstack(ims[r * cols:(r + 1) * cols]) for r in range(len(ims) // cols)])
    cv2.imwrite(path, grid, [cv2.IMWRITE_JPEG_QUALITY, 85])
tile([0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.5, 3.0], os.path.join(out, 'hook_sheet.jpg'), cols=4)
tile([dur * (k - 0.5) / 12 for k in range(1, 13)], os.path.join(out, 'story_sheet.jpg'), safe=False, cols=6)
tile([max(0, dur - 3.2 + k * 0.6) for k in range(5)] + [max(0, dur - 0.25)], os.path.join(out, 'end_sheet.jpg'), cols=6)

# ---------- variants ----------
variants = {}
def enc(args, name):
    p = os.path.join(out, 'variants', name); os.makedirs(os.path.dirname(p), exist_ok=True)
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y'] + args + ['-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', p], capture_output=True, text=True)
    if r.returncode == 0: variants[name] = p
    else: print(f'variant {name} failed: {r.stderr[-400:]}')
if A.variants and has_audio:
    enc(['-i', src], 'A_original.mp4')
    # B: cold open — the most striking 1.2 s from 30–85 % of the film, then the film from the top.
    fr = np.arange(len(colour)) * 3 / F
    win = int(1.2 * F)
    best, bt = -1, None
    for s in np.arange(0.30 * dur, 0.85 * dur - 1.2, 0.2):
        a, b = int(s * F), int(s * F) + win
        if b >= n - 1: break
        sc = diff[a:b].mean() + 0.15 * colour[(fr >= s) & (fr < s + 1.2)].mean()
        if any(a < c < b for c in cuts): sc *= 0.7  # prefer one clean shot
        if sc > best: best, bt = sc, float(s)
    if bt is not None:
        f = (f'[0:v]trim={bt:.3f}:{bt + 1.2:.3f},setpts=PTS-STARTPTS[v0];[0:a]atrim={bt:.3f}:{bt + 1.2:.3f},asetpts=PTS-STARTPTS,afade=t=out:st=1.05:d=0.15[a0];'
             f'[0:v]setpts=PTS-STARTPTS[v1];[0:a]asetpts=PTS-STARTPTS[a1];[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]')
        enc(['-i', src, '-filter_complex', f, '-map', '[v]', '-map', '[a]'], 'B_coldopen.mp4')
        variants['B_coldopen.mp4 source'] = f'{bt:.1f}s'
    # C: text hook — big centred line for the first 2.5 s (mid-frame, inside the safe zone).
    if A.hook_text:
        from PIL import Image, ImageDraw, ImageFont
        img = Image.new('RGBA', (Wd, Hd), (0, 0, 0, 0)); dr = ImageDraw.Draw(img); ft = ImageFont.truetype(FONT, 78)
        lines, cur = [], ''
        for w in A.hook_text.split():
            t = (cur + ' ' + w).strip()
            if dr.textlength(t, font=ft) > Wd - 2 * 110 - SAFE['right'] and cur: lines.append(cur); cur = w
            else: cur = t
        lines.append(cur); y = SAFE['top'] + 50  # just under the app's top bar, above most faces
        for ln in lines:
            x = (Wd - SAFE['right'] - dr.textlength(ln, font=ft)) / 2
            dr.text((x, y), ln, font=ft, fill='white', stroke_width=7, stroke_fill='black'); y += 96
        png = os.path.join(out, 'variants', 'hook_text.png'); os.makedirs(os.path.dirname(png), exist_ok=True); img.save(png)
        enc(['-i', src, '-i', png, '-filter_complex', "[0:v][1:v]overlay=0:0:enable='lt(t,2.5)'[v]", '-map', '[v]', '-map', '0:a'], 'C_texthook.mp4')
    # D: fast start — only when speech starts late.
    if speech_onset and speech_onset > 0.4:
        enc(['-ss', f'{speech_onset - 0.08:.3f}', '-i', src], 'D_faststart.mp4')

# ---------- write report ----------
feat = dict(slug=slug, date=datetime.date.today().isoformat(), profile=A.profile, duration=round(dur, 2), frame0_luma=round(f0, 1),
            hook_motion=round(hm, 2), cuts_first3s=c3, cuts_per_min=round(cpm, 1), static_max=round(static_s, 2), colourfulness=round(float(colour.mean()), 1),
            brightness=round(float(g.mean()), 1), loop=round(loop, 3), lufs=lufs, speech_onset=speech_onset, first_line_words=fl_words,
            wps=round(wps, 2) if wps else None, gate_pass=(None if gate is None else ('PASS' in gate.splitlines()[-1])), blockers=blockers,
            warns=sum(1 for r in rows if r[0] == 'WARN'), first_line=first_line, last_line=last_line, source=src)
json.dump(dict(features=feat, rows=rows, variants=variants, gate=gate), open(os.path.join(out, 'report.json'), 'w'), indent=1)
with open(os.path.join(PF, 'index.jsonl'), 'a') as fh: fh.write(json.dumps(feat) + '\n')

md = [f'# Preflight: {slug}', f'`{src}` · {dur:.1f} s · profile {A.profile} · {datetime.date.today()}', '',
      '| | check | value | target |', '|---|---|---|---|']
md += [f"| {'✅' if l == 'ok' else '⛔' if l == 'BLOCKER' else '⚠️' if l == 'WARN' else 'ℹ️'} | {nm} | {v} | {t} |" for l, nm, v, t in rows]
md += ['', f'**First line** ({wsrc or "no transcript"}): {first_line or "-"}', f'**Last line:** {last_line or "-"}', '',
       'Sheets: `hook_sheet.jpg` (0–3 s, red = app UI zones), `story_sheet.jpg`, `end_sheet.jpg`.']
if gate: md += ['', '## shorts_gate', '```', gate, '```']
if variants: md += ['', '## Variants'] + [f'- {k}: {v}' for k, v in variants.items()]
md += ['', '## Stranger review (Claude fills this in after looking at the sheets)', '', '_pending_']
open(os.path.join(out, 'report.md'), 'w').write('\n'.join(md) + '\n')

print('\n'.join(f"{l:7} {nm}: {v}  (target {t})" for l, nm, v, t in rows))
print(f'\nFIRST LINE: {first_line}\nLAST LINE:  {last_line}')
if gate: print('\n' + gate)
for k, v in variants.items(): print('variant', k, v)
print(f'\nPREFLIGHT {slug}: {"BLOCKED (" + str(blockers) + ")" if blockers else "CLEAR"} · report {os.path.join(out, "report.md")}')
sys.exit(1 if blockers else 0)
