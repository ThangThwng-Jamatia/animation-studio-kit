// Shared kit for the 2D no-voice Fable longs.
// Everything is a pure function of the absolute second t. Characters breathe, blink, walk/run and act; the demon
// takes any glow colour. SVG pieces live in a 1920×1080 world with the floor at FLOOR.
import React from 'react';
import {AbsoluteFill, Easing, interpolate} from 'remotion';
import {loadFont as loadNunito} from '@remotion/google-fonts/Nunito';
import {loadFont as loadHand} from '@remotion/google-fonts/PatrickHand';

export const {fontFamily: SANS} = loadNunito('normal', {weights: ['400', '700', '900'], subsets: ['latin']});
export const {fontFamily: HAND} = loadHand('normal', {weights: ['400'], subsets: ['latin']});

export const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const ease = (t: number, a: number, b: number, e = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...CL, easing: e});
export const win = (t: number, a: number, b: number, f = 0.4) => ease(t, a, a + f) * (1 - ease(t, b - f, b));
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const SKIN = '#ECE6D8', INK = '#16161a', PINK = '#ff2d78', RED = '#ff3344', WARM = '#ffcf8a', BLUE = '#8fc4ff';
export const FLOOR = 840;

// ---------- characters ----------
export type Mood = 'flat' | 'tired' | 'sad' | 'smile' | 'wide' | 'closed' | 'determined' | 'hurt';
export const Face: React.FC<{mood: Mood; look?: number}> = ({mood, look = 0}) => {
  const er = mood === 'wide' ? 7.5 : 5.5;
  const lid = mood === 'tired' || mood === 'sad' || mood === 'hurt';
  const eyes = mood === 'closed'
    ? [-18, 18].map((x) => <path key={x} d={`M${x - 9} -2 q9 7 18 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />)
    : [-18, 18].map((x) => <g key={x}>
      {mood === 'wide' && <circle cx={x} cy={-4} r={13} fill="white" stroke={INK} strokeWidth={2.5} />}
      <circle cx={x + look * 4} cy={-4} r={er} fill={INK} />
      {lid && <path d={`M${x - 11} -6 L${x + 11} -6 L${x + 11} -14 L${x - 11} -14 Z`} fill={SKIN} />}
      {lid && <line x1={x - 10} y1={-6} x2={x + 10} y2={-6} stroke={INK} strokeWidth={3} strokeLinecap="round" />}
    </g>);
  const brows = (mood === 'sad' || mood === 'hurt') ? [-1, 1].map((s) => <line key={s} x1={s * 10} y1={-22} x2={s * 28} y2={-17} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />)
    : mood === 'determined' ? [-1, 1].map((s) => <line key={s} x1={s * 8} y1={-15} x2={s * 28} y2={-22} stroke={INK} strokeWidth={4} strokeLinecap="round" />) : null;
  const mouth = mood === 'smile' ? 'M-12 18 q12 10 24 0' : (mood === 'sad' || mood === 'hurt') ? 'M-11 24 q11 -8 22 0' : mood === 'wide' ? 'M-6 22 q6 4 12 0' : mood === 'determined' ? 'M-9 21 L9 20' : 'M-10 21 L10 21';
  return <g>{eyes}{brows}<path d={mouth} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" /></g>;
};

export type Pose = 'stand' | 'sit' | 'hug' | 'kneel';
export type DMood = 'smile' | 'laugh' | 'scream';
export type GuyP = {
  x: number; y?: number; s?: number; pose?: Pose; mood?: Mood; phone?: number; reach?: number; reachY?: number; tilt?: number; look?: number;
  demon?: boolean; col?: string; dmood?: DMood; o?: number; flip?: boolean;
  t?: number; seed?: number; walk?: number; run?: boolean; hold?: React.ReactNode; armUp?: number;
};
// t → breathing + blinks. walk = phase (radians) while moving, run = bigger stride. hold = node drawn at the raised hand.
export const Guy: React.FC<GuyP> = ({x, y = FLOOR, s = 1, pose = 'stand', mood = 'flat', phone = 0, reach = 0, reachY = 0, tilt = 0, look = 0, demon, col = RED, dmood = 'smile', o = 1, flip, t = 0, seed = 0, walk, run, hold, armUp = 0}) => {
  const fill = demon ? '#08040a' : SKIN;
  const st = demon ? {stroke: col, strokeWidth: 3, filter: 'url(#glow)'} : {};
  const limb = {stroke: fill, strokeWidth: 24, strokeLinecap: 'round' as const, fill: 'none'};
  const limbGlow = demon ? {...limb, stroke: col, strokeWidth: 30, opacity: 0.5} : null;
  const sit = pose === 'sit', hug = pose === 'hug', kneel = pose === 'kneel';
  const moving = walk !== undefined;
  const stride = run ? 34 : 20;
  const ph = walk ?? 0;
  const bob = moving ? -Math.abs(Math.sin(ph)) * (run ? 12 : 6) : 0;
  const breath = 1 + Math.sin(t * 2 * Math.PI * 0.3 + seed) * 0.015;
  const blink = !demon && ((t + seed * 1.7) % (2.6 + rnd(seed) * 1.4)) < 0.12;
  const m: Mood = blink && mood !== 'closed' ? 'closed' : mood;
  const headY = hug ? -170 : sit ? -320 : kneel ? -240 : -300;
  const sh = sit ? -255 : kneel ? -195 : -215;
  const hand: [number, number] = armUp ? [mix(48, 70, armUp), mix(sh + 95, sh - 70, armUp)]
    : phone ? [14, headY + 50] : reach ? [mix(46, 150, reach), mix(sh + 90, sh + 10 + reachY, reach)] : [48, sh + 95];
  const lean = run ? 8 : 0;
  const face = demon
    ? <g>
      <path d="M-26 -8 l16 5 M26 -8 l-16 5" stroke={col} strokeWidth={5} strokeLinecap="round" />
      {dmood === 'smile' && <path d="M-22 16 q22 16 44 0" stroke={col} strokeWidth={4.5} fill="none" strokeLinecap="round" />}
      {dmood === 'laugh' && <path d={`M-22 12 q22 ${22 + Math.sin(t * 30) * 6} 44 0 Z`} fill={col} opacity={0.85} />}
      {dmood === 'scream' && <ellipse cx={0} cy={22} rx={16} ry={20 + Math.sin(t * 40) * 3} fill={col} />}
    </g>
    : <Face mood={m} look={look} />;
  const legs = moving
    ? [1, -1].map((d) => { const a = Math.sin(ph) * stride * d; const r = (a * Math.PI) / 180; return <line key={d} x1={d * 12} y1={-110} x2={d * 12 + Math.sin(r) * 104} y2={-110 + Math.cos(r) * 104} {...limb} />; })
    : [-17, 17].map((d) => <line key={d} x1={d} y1={-110} x2={d * 1.1} y2={-6} {...limb} />);
  const swing = moving ? Math.sin(ph + Math.PI) * (run ? 40 : 22) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      {demon && <ellipse cx={0} cy={headY + 120} rx={150} ry={260} fill="url(#demonGlow)" />}
      <g transform={`translate(0 ${bob}) rotate(${lean} 0 -100)`}>
        {hug ? <>
          <ellipse cx={-6} cy={-80} rx={52} ry={78 * breath} fill={fill} {...st} />
          <circle cx={34} cy={-90} r={42} fill={fill} {...st} />
          <path d="M-30 -120 Q40 -150 60 -70" {...limb} />
        </> : sit ? <>
          {[-14, 14].map((d) => <path key={d} d={`M${d} -140 L${80 + d / 2} -140 L${84 + d / 2} -6`} {...limb} />)}
          <rect x={-42} y={-290} width={84} height={165 * breath} rx={40} fill={fill} {...st} />
        </> : kneel ? <>
          <path d="M-14 -70 L-60 -10 L20 -10" {...limb} />
          <path d="M14 -70 L70 -70 L74 -6" {...limb} />
          <rect x={-42} y={-225} width={84} height={150 * breath} rx={40} fill={fill} {...st} />
        </> : <>
          {limbGlow && legs.map((l, i) => React.cloneElement(l as React.ReactElement<React.SVGProps<SVGLineElement>>, {key: 'g' + i, ...limbGlow}))}
          {legs}
          <rect x={-42} y={-250 - 150 * (breath - 1)} width={84} height={150 * breath} rx={40} fill={fill} {...st} />
        </>}
        {!hug && <>
          <path d={`M-36 ${sh + 8} L${-50 + swing * 0.9} ${sh + 98}`} {...limb} />
          <path d={`M36 ${sh + 8} L${phone ? 54 : (hand[0] + 36) / 2 + 8 - swing * 0.4} ${phone ? sh + 70 : (sh + 8 + hand[1]) / 2 + 6} L${hand[0] - (moving && !reach ? swing : 0)} ${hand[1]}`} {...limb} />
        </>}
        {hold && <g transform={`translate(${hand[0]} ${hand[1]})`}>{hold}</g>}
        <g transform={`rotate(${tilt} 0 ${headY + 60})`}>
          <circle cx={0} cy={headY} r={58} fill={fill} {...st} />
          <g transform={`translate(0 ${headY})`}>{face}</g>
        </g>
        {phone > 0 && <g>
          <rect x={hand[0] - 13} y={hand[1] - 46} width={28} height={48} rx={6} fill="#0b0b10" stroke="#333" strokeWidth={2} />
          <rect x={hand[0] - 10} y={hand[1] - 43} width={22} height={40} rx={3} fill={BLUE} opacity={0.6 + 0.4 * phone} />
        </g>}
      </g>
    </g>
  );
};

// ---------- set pieces ----------
export const Floor: React.FC<{c?: string}> = ({c = '#2a2a30'}) => <line x1={-600} y1={FLOOR} x2={2600} y2={FLOOR} stroke={c} strokeWidth={3} />;
export const Window: React.FC<{x: number; y: number; day?: number}> = ({x, y, day = 0}) => (
  <g>
    <polygon points={`${x - 70},${y + 70} ${x + 70},${y + 70} ${x + 260},${FLOOR} ${x - 160},${FLOOR}`} fill={day > 0.5 ? WARM : '#c8d8ff'} opacity={day > 0.5 ? 0.09 : 0.045} />
    <rect x={x - 70} y={y - 70} width={140} height={140} fill={day > 0.5 ? '#ffb46b' : '#0a0c14'} stroke="#9a9aa8" strokeWidth={5} />
    {day < 0.5 ? <circle cx={x + 24} cy={y - 24} r={13} fill="#f4f1e6" /> : <circle cx={x} cy={y + 46} r={34} fill="#fff1c9" />}
    <line x1={x} y1={y - 70} x2={x} y2={y + 70} stroke="#9a9aa8" strokeWidth={5} /><line x1={x - 70} y1={y} x2={x + 70} y2={y} stroke="#9a9aa8" strokeWidth={5} />
    <rect x={x - 84} y={y + 70} width={168} height={12} rx={3} fill="#3a3a44" />
  </g>
);
export const Clock: React.FC<{x: number; y: number; text: string; s?: number; ring?: number; t?: number; dim?: boolean}> = ({x, y, text, s = 1, ring = 0, t = 0, dim}) => {
  const jx = ring ? Math.sin(t * 70) * 3 * ring : 0;
  return <g transform={`translate(${x + jx} ${y}) scale(${s}) rotate(${ring ? Math.sin(t * 55) * 2 * ring : 0})`}>
    {ring > 0 && [-1, 1].map((d) => <path key={d} d={`M${d * 70} -20 q${d * 14} 20 0 40 M${d * 84} -32 q${d * 22} 32 0 64`} stroke={RED} strokeWidth={3} fill="none" opacity={0.6 * ring * (0.5 + 0.5 * Math.sin(t * 20))} />)}
    <rect x={-56} y={-34} width={112} height={68} rx={10} fill="#141418" stroke="#3a3a42" strokeWidth={3} />
    <text x={0} y={14} textAnchor="middle" fontFamily="monospace" fontWeight={700} fontSize={40} fill={RED} opacity={dim ? 0.25 : 1} filter={dim ? undefined : 'url(#glowSoft)'}>{text}</text>
  </g>;
};
export const Nightstand: React.FC<{x: number; clock: string; ring?: number; t?: number; s?: number}> = ({x, clock, ring, t, s = 1}) => (
  <g transform={`translate(${x} ${FLOOR}) scale(${s}) translate(${-x} ${-FLOOR})`}>
    <rect x={x - 80} y={FLOOR - 140} width={160} height={140} rx={6} fill="#1d1d22" stroke="#34343c" strokeWidth={3} />
    <rect x={x - 66} y={FLOOR - 120} width={132} height={50} rx={4} fill="#25252b" stroke="#3c3c44" strokeWidth={3} />
    <circle cx={x} cy={FLOOR - 95} r={5} fill="#666" />
    <Clock x={x} y={FLOOR - 176} text={clock} ring={ring} t={t} />
  </g>
);
// lying: head on pillow · lump: blanket pulled over the head (k = 0..1 how far it's pulled up)
export const Bed: React.FC<{x: number; lying?: boolean; lump?: number; mood?: Mood; glow?: number; s?: number; head?: number}> = ({x, lying, lump = 0, mood = 'tired', glow = 0, s = 1, head = 0}) => (
  <g transform={`translate(${x} ${FLOOR}) scale(${s}) translate(${-x} ${-FLOOR})`}>
    <rect x={x} y={FLOOR - 120} width={560} height={90} rx={10} fill="#1c1c24" />
    <rect x={x - 10} y={FLOOR - 230} width={22} height={230} rx={8} fill="#22222a" />
    <rect x={x + 548} y={FLOOR - 160} width={18} height={160} rx={8} fill="#22222a" />
    <rect x={x + 24} y={FLOOR - 170} width={120} height={50} rx={22} fill="#d8d2c4" />
    {lying && lump < 1 && <>
      <circle cx={x + 110} cy={FLOOR - 190 - head * 40} r={52} fill={SKIN} />
      <g transform={`translate(${x + 110} ${FLOOR - 190 - head * 40}) scale(0.9)`}><Face mood={mood} /></g>
      {glow > 0 && <ellipse cx={x + 110} cy={FLOOR - 190} rx={110} ry={90} fill={BLUE} opacity={0.12 * glow} />}
    </>}
    <path d={`M${mix(x + 120, x + 40, lump)} ${FLOOR - 150} Q${mix(x + 140, x + 90, lump)} ${mix(FLOOR - 200, FLOOR - 270, lump)} ${x + 300} ${FLOOR - 190 - lump * 20} L${x + 560} ${FLOOR - 170} L${x + 560} ${FLOOR - 100} L${mix(x + 110, x + 30, lump)} ${FLOOR - 100} Z`} fill="#2d3a5c" />
  </g>
);
// oval mirror; reflection = 'guy' (tired copy) or 'demon' (scale ds, dmood); peek = demon head leaning in from the side
export const Mirror: React.FC<{x: number; crack: number; t: number; reflect: 'guy' | 'demon'; ds?: number; dmood?: DMood; peek?: number; col?: string; mood?: Mood}> = ({x, crack, t, reflect, ds = 0.82, dmood = 'smile', peek = 0, col = RED, mood = 'tired'}) => (
  <g>
    <defs><clipPath id={`mclip${x}`}><ellipse cx={x} cy={FLOOR - 270} rx={120} ry={180} /></clipPath></defs>
    <ellipse cx={x} cy={FLOOR - 270} rx={128} ry={188} fill="#0c0c10" stroke="#8a8a96" strokeWidth={8} />
    <g clipPath={`url(#mclip${x})`}>
      {reflect === 'guy' ? <Guy x={x} y={FLOOR - 60} s={0.82} mood={mood} t={t} flip /> : <Guy x={x} y={FLOOR - 60 + (ds - 0.82) * 260} s={ds} demon col={col} dmood={dmood} t={t} />}
      {peek > 0 && <Guy x={x + mix(200, 70, peek)} y={FLOOR - 40} s={0.8} demon col={col} t={t} tilt={-14} />}
    </g>
    {crack > 0 && <g stroke="#e8e8f0" strokeWidth={3} fill="none" opacity={crack}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${x + 10} ${FLOOR - 300} l${Math.cos(i * 0.9 + 0.3) * 60} ${Math.sin(i * 0.9 + 0.3) * 60} l${Math.cos(i * 0.9 + 0.6) * 70 * crack} ${Math.sin(i * 0.9 + 0.6) * 90 * crack}`} />)}
    </g>}
    <rect x={x - 60} y={FLOOR - 70} width={120} height={70} rx={6} fill="#24242a" />
  </g>
);
// world-space speech bubble (moves with the camera); tail points down-left (dir -1) or down-right (1)
export const Bubble: React.FC<{t: number; at: number; out: number; x: number; y: number; text: string; dir?: number; size?: number}> = ({t, at, out, x, y, text, dir = -1, size = 30}) => {
  const k = win(t, at, out, 0.25); if (k <= 0) return null;
  const shown = text.slice(0, Math.ceil(text.length * ease(t, at, at + Math.min(1, text.length * 0.05), Easing.linear)));
  const w = text.length * size * 0.52 + 48, h = size + 34;
  const sc = 0.8 + 0.2 * ease(t, at, at + 0.25, Easing.out(Easing.back(2)));
  return <g transform={`translate(${x} ${y}) scale(${sc})`} opacity={k}>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={h / 2} fill="#f6f3ea" />
    <path d={`M${dir * 18} -2 L${dir * 44} 26 L${dir * 46} -2 Z`} fill="#f6f3ea" />
    <text x={0} y={-h / 2 + size * 0.36} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} fill={INK}>{shown}</text>
  </g>;
};

// ---------- screen overlays ----------
export const Whisper: React.FC<{t: number; at: number; out: number; x: number; y: number; text: string; size?: number; color?: string}> = ({t, at, out, x, y, text, size = 46, color = RED}) => {
  const k = win(t, at, out, 0.3); if (k <= 0) return null;
  const f = Math.floor(t * 12);
  const n = Math.ceil(text.length * ease(t, at, at + Math.min(1.2, text.length * 0.06), Easing.linear));
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) translate(${(rnd(f) - 0.5) * 3}px, ${(rnd(f + 9) - 0.5) * 3}px) rotate(-3deg)`, fontFamily: HAND, fontSize: size, color, opacity: k, textShadow: `0 0 18px ${color}`, whiteSpace: 'nowrap'}}>{text.slice(0, n)}</div>;
};
// the big shaking insult: chromatic split + smear
export const Shout: React.FC<{t: number; at: number; out: number; text: string; y?: number; size?: number; color?: string}> = ({t, at, out, text, y = 170, size = 110, color = RED}) => {
  const k = win(t, at, out, 0.15); if (k <= 0) return null;
  const f = Math.floor(t * 24); const j = (rnd(f) - 0.5) * 14, jy = (rnd(f + 3) - 0.5) * 10;
  const base: React.CSSProperties = {position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: size, letterSpacing: '0.02em', opacity: k, whiteSpace: 'nowrap'};
  return <>
    <div style={{...base, color: '#00e5ff', transform: `translate(${j - 8}px, ${jy}px)`, opacity: k * 0.5, mixBlendMode: 'screen'}}>{text}</div>
    <div style={{...base, color, transform: `translate(${j}px, ${jy}px)`, textShadow: `0 0 30px ${color}`}}>{text}</div>
  </>;
};
export const Narr: React.FC<{t: number; at: number; out: number; a: string; b?: string; bAt?: number; y?: number}> = ({t, at, out, a, b, bAt, y = 500}) => {
  const k = win(t, at, out, 0.6); if (k <= 0) return null;
  return <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: SANS, color: 'white', opacity: k, textShadow: '0 4px 24px #000'}}>
    <div style={{fontSize: 42, fontWeight: 400, opacity: b && t > (bAt ?? 0) ? 0.55 : 1, transform: `translateY(${(1 - ease(t, at, at + 0.8)) * 12}px)`}}>{a}</div>
    {b && <div style={{fontSize: 50, fontWeight: 900, marginTop: 12, opacity: ease(t, bAt ?? at, (bAt ?? at) + 0.6), transform: `translateY(${(1 - ease(t, bAt ?? at, (bAt ?? at) + 0.8)) * 12}px)`}}>{b}</div>}
  </div>;
};
export const Glitch: React.FC<{t: number; a: number; b: number; color?: string}> = ({t, a, b, color = RED}) => {
  if (t < a || t > b) return null;
  const f = Math.floor(t * 30);
  return <AbsoluteFill>
    <AbsoluteFill style={{background: color, opacity: 0.14 + rnd(f) * 0.12, mixBlendMode: 'screen'}} />
    {Array.from({length: 6}, (_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: rnd(f * 7 + i) * 1080, height: 4 + rnd(f + i) * 26, background: rnd(i + f) > 0.5 ? color : '#00e5ff', opacity: 0.35}} />)}
  </AbsoluteFill>;
};
export const Motes: React.FC<{t: number; n?: number; color?: string; o?: number}> = ({t, n = 26, color = '#fff', o = 0.25}) => (
  <g>{Array.from({length: n}, (_, i) => {
    const x = (rnd(i) * 2200 - 140 + t * (8 + rnd(i + 5) * 14)) % 2200 - 140;
    const y = (rnd(i + 11) * 1100 + Math.sin(t * 0.4 + i) * 30);
    return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i + 2) * 2.5} fill={color} opacity={o * (0.4 + 0.6 * rnd(i + 7))} />;
  })}</g>
);
// the SVG <defs> every fable needs (glow filters, demon glow in col, vignette, fg blur)
export const FableDefs: React.FC<{col?: string}> = ({col = RED}) => (
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="fgBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    <radialGradient id="demonGlow"><stop offset="0" stopColor={col} stopOpacity={0.22} /><stop offset="1" stopColor={col} stopOpacity={0} /></radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient>
    <radialGradient id="faceGlow"><stop offset="0" stopColor={BLUE} stopOpacity={0.35} /><stop offset="1" stopColor={BLUE} stopOpacity={0} /></radialGradient>
  </defs>
);
