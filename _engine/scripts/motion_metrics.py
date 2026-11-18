# Motion metrics for a rendered video (see .claude/skills/dark-fable-2d/references/motion-study.md).
# usage: python3 _engine/scripts/motion_metrics.py <video.mp4> <out.json>  → cuts, shot lengths, static %, in-shot motion
import sys, subprocess, numpy as np, json
path, out = sys.argv[1], sys.argv[2]
W,H=180,320
p=subprocess.run(['ffmpeg','-v','error','-i',path,'-vf',f'scale={W}:{H}','-f','rawvideo','-pix_fmt','gray','-'],capture_output=True)
a=np.frombuffer(p.stdout,np.uint8).reshape(-1,H,W).astype(np.float32)
n=len(a); fps=30
d=np.abs(np.diff(a,axis=0)).mean(axis=(1,2))
# histogram diff for cuts
def hist(x): h,_=np.histogram(x,bins=32,range=(0,256)); return h/h.sum()
hs=np.array([hist(x) for x in a]); hd=np.abs(np.diff(hs,axis=0)).sum(1)
# global shift estimate (camera) via phase correlation on central band
def shift(a1,a2):
    F=np.fft.fft2(a1-a1.mean());G=np.fft.fft2(a2-a2.mean());R=F*np.conj(G);R/=np.abs(R)+1e-9
    r=np.fft.ifft2(R).real; y,x=np.unravel_index(r.argmax(),r.shape)
    if y>H/2:y-=H
    if x>W/2:x-=W
    return int(x),int(y)
# zoom estimate: compare center crop scale via radial energy - approximate with mean brightness of edges? skip; use shifts
sh=[shift(a[i],a[i+1]) for i in range(n-1)]
cuts=[i+1 for i in range(n-1) if hd[i]>0.35 or (d[i]>25 and hd[i]>0.2)]
# merge cuts closer than 3 frames
m=[]
for c in cuts:
    if not m or c-m[-1]>2: m.append(c)
json.dump({'n':n,'diff':d.round(2).tolist(),'hd':hd.round(3).tolist(),'shift':sh,'cuts':m},open(out,'w'))
print(path.split('/')[-1],'frames',n,'cuts',len(m))
print('cut times(s):',' '.join(f'{c/fps:.3f}' for c in m))
L=[0]+m+[n]; durs=[(L[i+1]-L[i])/fps for i in range(len(L)-1)]
print('shot durs: mean %.2f median %.2f min %.2f max %.2f'%(np.mean(durs),np.median(durs),min(durs),max(durs)))
print('durs:',' '.join(f'{x:.2f}' for x in durs))
# motion: frames with nonzero diff (static hold detection)
static=(d<0.3).sum(); print('static frames (diff<0.3):',static,'of',n-1, '=%.1f%%'%(100*static/(n-1)))
print('mean diff within shots: %.2f'%np.mean([d[i] for i in range(n-1) if i+1 not in m]))
# motion bursts + gate. FLOOR = the approved reference short, TARGET = the inspo shorts
ds=np.convolve(d,np.ones(3)/3,'same'); hot=ds>12
runs=[];i=0
while i<len(hot):
    if hot[i]:
        k=i
        while k<len(hot) and hot[k]: k+=1
        runs.append((i,k)); i=k
    else: i+=1
gaps=[(runs[n+1][0]-runs[n][1])/fps for n in range(len(runs)-1)]
cutset=set(m)
vals={'static %':100*static/(n-1),'in-shot motion':float(np.mean([d[i] for i in range(n-1) if i+1 not in cutset])),'burst gap s':float(np.median(gaps)) if gaps else 99.0,'ambient motion':float(np.median(ds[~hot]))}
gate={'static %':(3.0,'max',2.3),'in-shot motion':(4.5,'min',7.4),'burst gap s':(1.1,'max',1.1),'ambient motion':(1.3,'min',3.6)}
ok=True
for k,(floor,kind,target) in gate.items():
    good=vals[k]<=floor if kind=='max' else vals[k]>=floor
    ok=ok and good
    print(f"{'ok  ' if good else 'FAIL'} {k}: {vals[k]:.2f} ({kind} {floor}, inspo {target})")
print('MOTION GATE:','PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
