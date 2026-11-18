# Results log for preflight: record real numbers, pick A/B winners, and predict views from YOUR history.
# Skill: .claude/skills/preflight/SKILL.md
#
#   python3 scripts/preflight_log.py add <slug> --platform ig_trial|ig|yt|tiktok --variant A|B|C|D|final --hours 48 \
#           --views 4200 [--hold 62] [--avg-pct 71] [--likes] [--comments] [--shares] [--saves] [--follows] [--subs]
#       --hold    = % who stayed (YT Studio "Stayed to watch"; IG = 100 - skip rate)
#       --avg-pct = average percentage viewed (YT) / avg watch time ÷ length (IG)
#   python3 scripts/preflight_log.py winner <slug> [--platform ig_trial]
#   python3 scripts/preflight_log.py predict <slug> [--platform yt]
#   python3 scripts/preflight_log.py show [slug]
import sys, os, csv, json, math, argparse, datetime
import numpy as np

ENGINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PF = os.path.join(ENGINE, 'preflight'); os.makedirs(PF, exist_ok=True)
LOG = os.path.join(PF, 'results.csv'); IDX = os.path.join(PF, 'index.jsonl')
COLS = ['date', 'slug', 'platform', 'variant', 'hours', 'views', 'hold', 'avg_pct', 'likes', 'comments', 'shares', 'saves', 'follows', 'subs']
FEATS = ['duration', 'frame0_luma', 'hook_motion', 'cuts_first3s', 'cuts_per_min', 'static_max', 'colourfulness', 'brightness',
         'loop', 'speech_onset', 'first_line_words', 'wps', 'warns']
MIN_FIT = 20  # published shorts needed before the model is trusted

def rows():
    if not os.path.exists(LOG): return []
    return list(csv.DictReader(open(LOG)))
def f(x):
    try: return float(x)
    except (TypeError, ValueError): return None
def features():
    d = {}
    if os.path.exists(IDX):
        for ln in open(IDX):
            try: j = json.loads(ln); d[j['slug']] = j  # latest preflight run wins
            except Exception: pass
    return d

def add(a):
    new = not os.path.exists(LOG)
    with open(LOG, 'a', newline='') as fh:
        w = csv.DictWriter(fh, COLS)
        if new: w.writeheader()
        w.writerow(dict(date=datetime.date.today().isoformat(), slug=a.slug, platform=a.platform, variant=a.variant, hours=a.hours,
                        views=a.views, hold=a.hold, avg_pct=a.avg_pct, likes=a.likes, comments=a.comments, shares=a.shares,
                        saves=a.saves, follows=a.follows, subs=a.subs))
    print(f'logged {a.slug} {a.platform} {a.variant} @ {a.hours} h: {a.views} views')

def winner(a):
    R = [r for r in rows() if r['slug'] == a.slug and (not a.platform or r['platform'] == a.platform)]
    if not R: sys.exit(f'no results for {a.slug}')
    best = {}
    for r in R:  # keep the latest (most hours) row per variant
        k = (r['platform'], r['variant'])
        if k not in best or f(r['hours'] or 0) >= f(best[k]['hours'] or 0): best[k] = r
    V = list(best.values())
    def eng(r):
        v = f(r['views']) or 0
        return 1000 * sum(f(r[c]) or 0 for c in ('shares', 'saves', 'follows', 'subs')) / v if v else 0
    print(f"{'variant':10}{'platform':10}{'views':>8}{'hold %':>8}{'avg %':>7}{'share+save+follow /1k':>23}")
    for r in sorted(V, key=lambda r: -(f(r['views']) or 0)):
        print(f"{r['variant']:10}{r['platform']:10}{r['views']:>8}{(r['hold'] or '-'):>8}{(r['avg_pct'] or '-'):>7}{eng(r):>23.1f}")
    H = [r for r in V if f(r['hold']) is not None and f(r['views'])]
    if len(H) >= 2:
        H.sort(key=lambda r: -f(r['hold'])); t, s = H[0], H[1]
        p1, p2, n1, n2 = f(t['hold']) / 100, f(s['hold']) / 100, f(t['views']), f(s['views'])
        p = (p1 * n1 + p2 * n2) / (n1 + n2); se = math.sqrt(max(p * (1 - p) * (1 / n1 + 1 / n2), 1e-12))
        z = (p1 - p2) / se; conf = 0.5 * (1 + math.erf(z / math.sqrt(2)))
        verdict = 'CLEAR WINNER' if conf >= 0.95 else 'LEANING' if conf >= 0.80 else 'TOO CLOSE / too few views — run longer or treat as a tie'
        print(f"\nhold: {t['variant']} {p1:.0%} vs {s['variant']} {p2:.0%} → {verdict} (confidence {conf:.0%})")
    else:
        V.sort(key=lambda r: -(f(r['views']) or 0))
        print(f"\nno hold % logged; by views {V[0]['variant']} leads. Views alone are noisy on trial reels — log --hold next time.")
    print('Primary metric = hold % (the swipe decision). Tie-breaker = shares+saves+follows per 1k views.')

def published(platform):
    """Latest row per slug for the platform's main post (variant final/A or platform yt/ig)."""
    out = {}
    for r in rows():
        if r['platform'] != platform or r['variant'] not in ('final', 'A', ''): continue
        if r['slug'] not in out or f(r['hours'] or 0) >= f(out[r['slug']]['hours'] or 0): out[r['slug']] = r
    return out

def predict(a):
    P = published(a.platform); FT = features()
    views = np.array([f(r['views']) for r in P.values() if f(r['views'])])
    me = FT.get(a.slug)
    print(f'history: {len(views)} published shorts on {a.platform} with logged views')
    if len(views) < 5:
        print('NOT ENOUGH HISTORY for any honest forecast (need 5+ to give a range, 20+ to fit a model). Log results with `add` after each post.')
        return
    q = np.percentile(views, [25, 50, 75, 90])
    print(f'your channel range: p25 {q[0]:,.0f} · median {q[1]:,.0f} · p75 {q[2]:,.0f} · p90 {q[3]:,.0f}')
    data = [(FT[s], f(r['views'])) for s, r in P.items() if s in FT and f(r['views']) and s != a.slug]
    if me is None:
        print(f'(no preflight run for {a.slug}; run preflight.py first for a feature-based estimate)'); return
    if len(data) < MIN_FIT:
        bad = me.get('blockers', 0) + 0.5 * me.get('warns', 0)
        band = (q[1], q[2]) if bad == 0 else (q[0], q[1]) if bad <= 2 else (views.min(), q[0])
        print(f'UNCALIBRATED ({len(data)}/{MIN_FIT} preflighted shorts with results): history range by preflight health '
              f'→ roughly {band[0]:,.0f}–{band[1]:,.0f} views. This is a prior, not a prediction.')
        return
    X = np.array([[x.get(k) if x.get(k) is not None else np.nan for k in FEATS] for x, _ in data], float)
    mu = np.nanmean(X, 0); sd = np.nanstd(X, 0) + 1e-6
    X = np.nan_to_num((X - mu) / sd); y = np.log10([v for _, v in data])
    lam = 3.0; Xb = np.c_[np.ones(len(X)), X]; I = np.eye(Xb.shape[1]); I[0, 0] = 0
    w = np.linalg.solve(Xb.T @ Xb + lam * I, Xb.T @ y)
    # leave-one-out error = the honest width of the range
    loo = []
    for i in range(len(X)):
        m = np.arange(len(X)) != i
        wi = np.linalg.solve(Xb[m].T @ Xb[m] + lam * I, Xb[m].T @ y[m]); loo.append(y[i] - Xb[i] @ wi)
    err = float(np.std(loo)); base = float(np.std(y - y.mean()))
    x = np.nan_to_num((np.array([me.get(k) if me.get(k) is not None else np.nan for k in FEATS], float) - mu) / sd)
    yh = float(np.r_[1, x] @ w)
    print(f'MODEL ({len(data)} shorts): expected ~{10 ** yh:,.0f} views, likely {10 ** (yh - err):,.0f}–{10 ** (yh + err):,.0f}')
    print(f'model error ±{err:.2f} log10 vs ±{base:.2f} for "just guess the median" '
          + ('→ the features carry real signal' if err < 0.9 * base else '→ features barely beat the median; trust the range, not the number'))
    top = sorted(zip(FEATS, w[1:]), key=lambda t: -abs(t[1]))[:5]
    print('strongest levers on YOUR channel: ' + ', '.join(f'{k} {"+" if v > 0 else "-"}' for k, v in top))

def show(a):
    R = [r for r in rows() if not a.slug or r['slug'] == a.slug]
    for r in R: print(', '.join(f'{k}={r[k]}' for k in COLS if r[k]))
    if not R: print('no results logged yet')

ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
p = sp.add_parser('add'); p.add_argument('slug'); p.add_argument('--platform', required=True, choices=['ig_trial', 'ig', 'yt', 'tiktok'])
p.add_argument('--variant', default='final'); p.add_argument('--hours', type=float, default=48); p.add_argument('--views', type=int, required=True)
for c in ('hold', 'avg_pct'): p.add_argument('--' + c.replace('_', '-'), dest=c, type=float)
for c in ('likes', 'comments', 'shares', 'saves', 'follows', 'subs'): p.add_argument('--' + c, type=int)
p = sp.add_parser('winner'); p.add_argument('slug'); p.add_argument('--platform')
p = sp.add_parser('predict'); p.add_argument('slug'); p.add_argument('--platform', default='yt', choices=['ig', 'yt', 'tiktok'])
p = sp.add_parser('show'); p.add_argument('slug', nargs='?')
a = ap.parse_args(); dict(add=add, winner=winner, predict=predict, show=show)[a.cmd](a)
