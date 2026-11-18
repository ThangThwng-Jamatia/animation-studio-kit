// motionKit: the "motion-rich" layer for Dark Fable shorts (2026-11-01).
// Numbers come from the frame-by-frame study of the inspo shorts: .claude/skills/dark-fable-2d/references/motion-study.md
//   camera re-frame every ~1 s (350–700 ms expo-out) + always-on float · motivated transitions (no black dips)
//   talk-synced mouth swaps every ~90 ms · mood snaps on keywords · 130–200 ms gestures with overshoot · particles on action words
// Reference build: ExampleShort.tsx.
import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const CL = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
export const INK = '#17151a';
export const SNAP = Easing.bezier(0.16, 1, 0.3, 1); // expo-out: fast start, long settle
export const IO = Easing.inOut(Easing.cubic);
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const ease = (t: number, a: number, b: number, e: (n: number) => number = IO) => interpolate(t, [a, b], [0, 1], {...CL, easing: e});

// ---------- micro-motion primitives ----------
// 0→1 with overshoot (gestures, pops): ~d s, peaks ~1.1
export const spring = (t: number, at: number, d = 0.28, over = 1.7) => interpolate(t, [at, at + d], [0, 1], {...CL, easing: Easing.out(Easing.back(over))});
// damped sine after an impact: hat spin, arm follow-through, swinging tags
export const wobble = (t: number, at: number, amp = 1, hz = 3.2, decay = 4) => {
  const u = t - at;
  return u < 0 ? 0 : amp * Math.exp(-u * decay) * Math.sin(u * hz * Math.PI * 2);
};
// squash on impact: returns [sx, sy] around the contact point, settles in ~0.25 s
export const squash = (t: number, at: number, k = 0.2) => {
  const u = t - at;
  if (u < 0 || u > 0.5) return [1, 1] as const;
  const w = Math.exp(-u * 11) * Math.cos(u * 34);
  return [1 + k * 0.8 * w, 1 - k * w] as const;
};
// value from a keyed list that SNAPS (expressions, poses): [[t, v], ...]
export function snapAt<T>(t: number, keys: [number, T][]): T {
  let v = keys[0][1];
  for (const [at, x] of keys) if (t >= at) v = x;
  return v;
}
// eased interpolation through [t, value] keys, each move takes d s (gesture angles, positions)
export const keyed = (t: number, keys: [number, number][], d = 0.18, e: (n: number) => number = Easing.out(Easing.back(1.4))) => {
  let v = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [at, x] = keys[i];
    if (t < at) break;
    v = mix(v, x, interpolate(t, [at, at + d], [0, 1], {...CL, easing: e}));
  }
  return v;
};

// ---------- camera ----------
// x,y = world point at frame centre; z = zoom; r = roll (deg). Each key is a move that starts at t and lasts d (expo-out).
export type CamKey = {t: number; x?: number; y?: number; z?: number; r?: number; d?: number; e?: (n: number) => number};
type CamV = {x: number; y: number; z: number; r: number};
export function cam(t: number, keys: CamKey[], drift = 0.016): CamV {
  let v: CamV = {x: keys[0].x ?? 540, y: keys[0].y ?? 960, z: keys[0].z ?? 1, r: keys[0].r ?? 0};
  let last = keys[0].t;
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const p = interpolate(t, [k.t, k.t + (k.d ?? 0.45)], [0, 1], {...CL, easing: k.e ?? SNAP});
    v = {x: mix(v.x, k.x ?? v.x, p), y: mix(v.y, k.y ?? v.y, p), z: mix(v.z, k.z ?? v.z, p), r: mix(v.r, k.r ?? v.r, p)};
    last = k.t;
  }
  // residual push after each move + the always-on float (inspo never rests: ambient diff 3.6–4.8)
  const z = v.z * (1 + drift * Math.min(4, Math.max(0, t - last)));
  return {
    x: v.x + Math.sin(t * 0.63) * 5 + Math.sin(t * 1.7 + 1) * 2.2,
    y: v.y + Math.sin(t * 0.81 + 2) * 4 + Math.sin(t * 2.1) * 1.6,
    z, r: v.r + Math.sin(t * 0.47) * 0.35,
  };
}
export const camTf = (c: CamV, W = 1080, H = 1920) => `translate(${W / 2} ${H / 2}) rotate(${c.r}) scale(${c.z}) translate(${-c.x} ${-c.y})`;
// decaying shake from hits [t, px]
export const shakeAt = (t: number, f: number, hits: [number, number][]) => {
  let x = 0, y = 0;
  for (const [at, a] of hits) {
    const u = t - at;
    if (u < 0 || u > 0.4) continue;
    const k = a * Math.exp(-u * 12);
    x += (rnd(f * 3.1) - 0.5) * 2 * k; y += (rnd(f * 7.7 + 2) - 0.5) * 2 * k;
  }
  return [x, y] as const;
};

// ---------- scenes + transitions ----------
export type Trans =
  | {k: 'cut'}
  | {k: 'dissolve'; d?: number} // move-through / shape match: 260–300 ms while both cameras keep moving
  | {k: 'whip'; d?: number; dir: [number, number]} // 230 ms with directional blur
  | {k: 'iris'; d?: number; at: [number, number]} // 130–200 ms circle from a point
  | {k: 'zoom'; d?: number} // push-through: old scales up and fades, new settles in
  | {k: 'flash'; d?: number}; // white bloom, cut at the peak
export type Scene = {from: number; to: number; tin?: Trans; cam: CamKey[]; draw: (t: number) => React.ReactNode};

const Shot: React.FC<{sc: Scene; t: number}> = ({sc, t}) => <g transform={camTf(cam(t, sc.cam))}>{sc.draw(t)}</g>;

export const SceneStack: React.FC<{scenes: Scene[]; t: number}> = ({scenes, t}) => {
  let i = scenes.findIndex((s) => t >= s.from && t < s.to);
  if (i < 0) i = t < scenes[0].from ? 0 : scenes.length - 1;
  const B = scenes[i], A = scenes[i - 1], tr = B.tin ?? {k: 'cut'};
  const d = 'd' in tr && tr.d ? tr.d : tr.k === 'iris' ? 0.2 : tr.k === 'whip' ? 0.24 : tr.k === 'flash' ? 0.2 : 0.28;
  const u = (t - B.from) / d;
  const blur = tr.k === 'whip' ? Math.sin(Math.PI * clamp01(u)) * 70 : 0;
  const defs = <defs>
    <filter id="whipH" x="-30%" y="-5%" width="160%" height="110%"><feGaussianBlur stdDeviation={`${blur} 0`} /></filter>
    <filter id="whipV" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation={`0 ${blur}`} /></filter>
  </defs>;
  if (!A || tr.k === 'cut' || u >= 1) return <>{defs}<Shot sc={B} t={t} /></>;
  const p = clamp01(u);
  if (tr.k === 'dissolve') return <>{defs}<Shot sc={A} t={t} /><g opacity={Easing.inOut(Easing.sin)(p)}><Shot sc={B} t={t} /></g></>;
  if (tr.k === 'flash') return <>{defs}<Shot sc={p < 0.5 ? A : B} t={t} /><rect x={-500} y={-500} width={2200} height={3000} fill="#fff8ec" opacity={Math.sin(Math.PI * p) * 0.9} /></>;
  if (tr.k === 'whip') {
    const e = IO(p), [dx, dy] = tr.dir, W = 1300, f = dx ? 'url(#whipH)' : 'url(#whipV)';
    return <>{defs}<g filter={f}>
      <g transform={`translate(${-dx * W * e} ${-dy * W * e})`}><Shot sc={A} t={t} /></g>
      <g transform={`translate(${dx * W * (1 - e)} ${dy * W * (1 - e)})`}><Shot sc={B} t={t} /></g>
    </g></>;
  }
  if (tr.k === 'iris') {
    const [cx, cy] = tr.at;
    return <>{defs}<clipPath id="irisC"><circle cx={cx} cy={cy} r={1600 * SNAP(p)} /></clipPath>
      <g opacity={1 - 0.6 * p}><Shot sc={A} t={t} /></g><g clipPath="url(#irisC)"><Shot sc={B} t={t} /></g></>;
  }
  // zoom (push-through)
  const za = 1 + 1.6 * Easing.in(Easing.quad)(p), zb = 0.82 + 0.18 * SNAP(p);
  return <>{defs}
    <g transform={`translate(540 960) scale(${za}) translate(-540 -960)`} opacity={1 - p}><Shot sc={A} t={t} /></g>
    <g transform={`translate(540 960) scale(${zb}) translate(-540 -960)`} opacity={clamp01(p * 2)}><Shot sc={B} t={t} /></g>
  </>;
};

// ---------- particles ----------
export type PKind = 'bill' | 'paper' | 'rust' | 'puff' | 'spark' | 'env' | 'coin' | 'page' | 'bubble' | 'drop' | 'glow' | 'dirt';
export const Burst: React.FC<{t: number; at: number; x: number; y: number; n?: number; kind: PKind; seed?: number; speed?: number; dir?: number; spread?: number; g?: number; life?: number; s?: number}> = ({t, at, x, y, n = 10, kind, seed = 0, speed = 900, dir = -Math.PI / 2, spread = 1.4, g = 1500, life = 1.5, s = 1}) => {
  const u = t - at;
  if (u < 0 || u > life) return null;
  const flutter = kind === 'bill' || kind === 'paper' || kind === 'env' || kind === 'page';
  const drag = flutter ? 2.6 : kind === 'puff' ? 4 : 1.2;
  return <g>{Array.from({length: n}, (_, i) => {
    const a = dir + (rnd(seed + i * 1.7) - 0.5) * spread, v = speed * (0.45 + rnd(seed + i * 3.3) * 0.75);
    const fx = (1 - Math.exp(-drag * u)) / drag;
    const px = x + Math.cos(a) * v * fx + (flutter ? Math.sin(u * 6 + i) * 34 : 0);
    const py = y + Math.sin(a) * v * fx + 0.5 * g * (flutter ? 0.22 : kind === 'puff' ? -0.05 : 1) * u * u;
    const rot = rnd(seed + i) * 360 + (rnd(seed + i * 5) - 0.5) * 900 * u;
    const o = 1 - clamp01((u - life * 0.7) / (life * 0.3));
    const flip = flutter || kind === 'coin' ? Math.cos(u * 9 + i) : 1;
    const sz = s * (0.7 + rnd(seed + i * 9) * 0.6);
    return <g key={i} transform={`translate(${px} ${py}) rotate(${rot}) scale(${sz * flip} ${sz})`} opacity={o}>{piece(kind, u, i)}</g>;
  })}</g>;
};
function piece(kind: PKind, u: number, i: number) {
  switch (kind) {
    case 'bill': return <><rect x={-34} y={-17} width={68} height={34} rx={4} fill="#9fcf8a" stroke={INK} strokeWidth={3} /><circle r={9} fill="none" stroke="#3f7a3a" strokeWidth={3} /><rect x={-28} y={-11} width={56} height={22} rx={2} fill="none" stroke="#5c9a52" strokeWidth={2} /></>;
    case 'paper': return <rect x={-16} y={-12} width={32} height={24} rx={2} fill="#f4efe2" stroke={INK} strokeWidth={2.5} />;
    case 'page': return <><rect x={-60} y={-40} width={120} height={80} rx={3} fill="#f6f1e4" stroke={INK} strokeWidth={3} /><path d="M-44 -20 h88 M-44 -4 h70 M-44 12 h80" stroke="#b9ae98" strokeWidth={4} /></>;
    case 'env': return <><rect x={-46} y={-30} width={92} height={60} rx={4} fill="#efe3c6" stroke={INK} strokeWidth={3.5} /><path d="M-46 -30 L0 6 L46 -30" fill="none" stroke={INK} strokeWidth={3} /><circle cx={0} cy={6} r={8} fill="#b8322f" /></>;
    case 'rust': return <path d="M-7 -5 L6 -7 L8 4 L-3 8 Z" fill={i % 2 ? '#b0562a' : '#8a3f1c'} />;
    case 'coin': return <><circle r={16} fill="#f2c94c" stroke={INK} strokeWidth={3} /><circle r={9} fill="none" stroke="#c99a2a" strokeWidth={2.5} /></>;
    case 'spark': return <path d="M0 -14 L3 -3 L14 0 L3 3 L0 14 L-3 3 L-14 0 L-3 -3 Z" fill="#fff4c2" />;
    case 'puff': return <circle r={22 + u * 70} fill="#e9e0cf" opacity={0.55} />;
    case 'bubble': return <g><circle r={12 + (i % 3) * 7} fill="#bfefff" fillOpacity={0.18} stroke="#d8f6ff" strokeWidth={3} /><circle cx={-4} cy={-5} r={3} fill="#fff" /></g>;
    case 'drop': return <path d="M0 -12 Q9 2 0 9 Q-9 2 0 -12 Z" fill="#9fdcf0" stroke={INK} strokeWidth={2} />;
    case 'glow': return <circle r={7} fill="#c8ff7a" filter="url(#glow)" />;
    case 'dirt': return <path d="M-9 -6 L7 -9 L10 5 L-5 9 Z" fill={i % 2 ? '#5a4030' : '#3e2c20'} />;
  }
}
// ambient dust motes in a light beam: always moving
export const Motes: React.FC<{t: number; n?: number; x?: number; y?: number; w?: number; h?: number; c?: string; seed?: number}> = ({t, n = 26, x = 0, y = 0, w = 1080, h = 1920, c = '#fff3d6', seed = 0}) =>
  <g>{Array.from({length: n}, (_, i) => {
    const px = x + ((rnd(i + seed) * w + t * (8 + rnd(i * 3) * 14) + Math.sin(t * 0.7 + i) * 18) % w);
    const py = y + ((rnd(i * 7 + seed) * h - t * (6 + rnd(i * 5) * 10)) % h + h) % h;
    return <circle key={i} cx={px} cy={py} r={1.6 + rnd(i * 11) * 2.6} fill={c} opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />;
  })}</g>;

// ---------- talk: limited-animation mouth swaps synced to the voice ----------
export type Word = [string, number, number];
// start time of the nth occurrence of a word (case and punctuation ignored): keeps every beat tied to the voice
export const at = (words: Word[], word: string, nth = 1) => {
  const hits = words.filter(([w]) => w.toLowerCase().replace(/[^a-z0-9é]/g, '') === word.toLowerCase());
  if (hits.length < nth) throw new Error(`word "${word}" #${nth} not in the voice`);
  return hits[nth - 1][1];
};
export type Mouth = 'closed' | 'o' | 'e' | 'a' | 'smirk' | 'grin' | 'flat' | 'wave' | 'small' | 'shock';
// while one of the speaker's words is active, swap mouth shape every ~3 frames (inspo: 66–200 ms per swap)
export const talkMouth = (t: number, words: Word[], windows: [number, number][], seed = 0): Mouth | null => {
  if (!windows.some(([a, b]) => t >= a && t < b)) return null;
  const w = words.find(([, s, e]) => t >= s && t < e + 0.03);
  if (!w) return 'closed';
  const shapes: Mouth[] = ['a', 'o', 'e', 'closed', 'a', 'e'];
  return shapes[Math.floor(rnd(Math.floor(t * 11) + seed) * shapes.length)];
};

// ---------- the character rig (inspo look: white round head, ink outline, rubber-hose limbs) ----------
export type Mood = 'flat' | 'smug' | 'grin' | 'wink' | 'wide' | 'sus' | 'worry' | 'happy' | 'shock' | 'angry';
export type Arm = [number, number]; // [shoulder angle deg (0 = down, + = out/up), elbow bend deg]
export type Look = {skin?: string; dress?: boolean; hair?: 'slick' | 'bald' | 'curly' | 'ginger' | 'none' | 'bob' | 'crop'; hairC?: string; stache?: 'pencil' | 'walrus' | 'beard' | 'none'; glasses?: boolean; hat?: 'fedora' | 'bowler' | 'kepi' | 'chef' | 'dive' | 'stahl' | 'none'; hatC?: string; suit: string; shirt?: string; tie?: string; bow?: string; pants?: string};
export type ToonP = {x: number; y: number; s?: number; flip?: number; t: number; look: Look; mood?: Mood; mouth?: Mouth | null; eye?: number; armL?: Arm; armR?: Arm; lean?: number; tilt?: number; sq?: readonly [number, number];
  walk?: number; run?: boolean; seat?: boolean; blush?: number; sweat?: number; hatLift?: number; hatRot?: number; noHat?: boolean; seed?: number; back?: boolean; handR?: React.ReactNode; handL?: React.ReactNode; o?: number; light?: number};
const HR = 96; // head radius
export const Toon: React.FC<ToonP> = ({x, y, s = 1, flip = 1, t, look, mood = 'flat', mouth, eye = 0, armL = [14, 10], armR = [14, 10], lean = 0, tilt = 0, sq = [1, 1], walk, run, seat, blush = 0, sweat = 0, hatLift = 0, hatRot = 0, noHat, seed = 0, back, handR, handL, o = 1, light = 1}) => {
  const L = {stroke: INK, strokeWidth: 9, strokeLinecap: 'round' as const, fill: 'none', strokeLinejoin: 'round' as const};
  const breathe = 1 + Math.sin(t * 1.9 + seed) * 0.014;
  const moving = walk !== undefined;
  const sw = moving ? Math.sin(walk!) * (run ? 42 : 24) : 0;
  const bob = moving ? -Math.abs(Math.cos(walk!)) * (run ? 16 : 8) : 0;
  const hip = seat ? -150 : -150, shY = -300, hy = -395;
  const leg = (d: number) => {
    if (seat) return <path d={`M${d * 20} ${hip} L${d * 20 + 70} ${hip + 6} L${d * 20 + 66} ${-6}`} {...L} />;
    const a = ((d * sw) * Math.PI) / 180;
    const fx = d * 20 + Math.sin(a) * 150, fy = hip + Math.cos(a) * 150;
    return <g><path d={`M${d * 20} ${hip} Q${d * 24 + Math.sin(a) * 60} ${hip + 80} ${fx} ${fy}`} {...L} /><ellipse cx={fx + 14} cy={fy + 2} rx={26} ry={12} fill="#222" stroke={INK} strokeWidth={4} /></g>;
  };
  const arm = (d: number, [ang, bend]: Arm, hand?: React.ReactNode) => {
    const swing = moving ? -d * sw * 0.9 : 0;
    const a = ((ang + swing) * Math.PI) / 180, sx0 = d * 46, len = 135;
    const hx = sx0 + d * Math.sin(a) * len, hyy = shY + Math.cos(a) * len;
    const mx = (sx0 + hx) / 2 + d * Math.cos(a) * bend * 0.9, my = (shY + hyy) / 2 - Math.sin(a) * bend * 0.9;
    return <g><path d={`M${sx0} ${shY} Q${mx} ${my} ${hx} ${hyy}`} {...L} />
      <g transform={`translate(${hx} ${hyy})`}>{hand}<circle r={17} fill={look.skin ?? '#fbfaf7'} stroke={INK} strokeWidth={5} /><ellipse cx={d * 13} cy={-9} rx={7} ry={10} fill={look.skin ?? '#fbfaf7'} stroke={INK} strokeWidth={4} transform={`rotate(${d * 30})`} /></g></g>;
  };
  const blink = (t + seed * 1.37) % (2.6 + rnd(seed) * 1.6) < 0.1 && mood !== 'wink' && mood !== 'happy';
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s * flip} ${s}) scale(${sq[0]} ${sq[1]})`} opacity={o}>
      <ellipse cx={0} cy={4} rx={95} ry={16} fill="#000" opacity={0.28 * light} filter="url(#soft)" />
      <g transform={`rotate(${lean + (run ? 10 : 0)} 0 ${hip})`}>
        {leg(-1)}{leg(1)}
        {/* body: suit with a cel shade side, lapels, tie */}
        <g transform={`translate(0 ${hip}) scale(1 ${breathe}) translate(0 ${-hip})`}>
          <path d={`M-58 ${hip + 4} L-60 ${shY + 10} Q-58 ${shY - 22} -20 ${shY - 24} L20 ${shY - 24} Q58 ${shY - 22} 60 ${shY + 10} L58 ${hip + 4} Q0 ${hip + 18} -58 ${hip + 4} Z`} fill={look.suit} stroke={INK} strokeWidth={7} />
          <path d={`M18 ${shY - 22} Q56 ${shY - 18} 58 ${shY + 10} L56 ${hip + 6} Q34 ${hip + 12} 22 ${hip + 12} Z`} fill="#000" opacity={0.2} />
          {!back && look.dress && <><path d={`M-30 ${shY - 22} Q0 ${shY + 26} 30 ${shY - 22} L22 ${shY - 24} Q0 ${shY + 4} -22 ${shY - 24} Z`} fill={look.shirt ?? '#f4f1ea'} stroke={INK} strokeWidth={4} /><path d={`M-54 ${hip - 6} Q0 ${hip + 8} 54 ${hip - 6}`} stroke={INK} strokeWidth={4} opacity={0.5} fill="none" /></>}
          {!back && !look.dress && <><path d={`M-22 ${shY - 22} L0 ${shY + 50} L22 ${shY - 22} Z`} fill={look.shirt ?? '#f4f1ea'} stroke={INK} strokeWidth={4} />
            {look.tie && <path d={`M-6 ${shY - 14} L6 ${shY - 14} L10 ${shY + 40} L0 ${shY + 54} L-10 ${shY + 40} Z`} fill={look.tie} stroke={INK} strokeWidth={3} />}
            {look.bow && <path d={`M0 ${shY - 14} L-20 ${shY - 26} L-20 ${shY - 2} Z M0 ${shY - 14} L20 ${shY - 26} L20 ${shY - 2} Z`} fill={look.bow} stroke={INK} strokeWidth={3} />}
            <path d={`M-22 ${shY - 22} L-36 ${shY + 30} L-6 ${shY + 66} M22 ${shY - 22} L36 ${shY + 30} L6 ${shY + 66}`} fill="none" stroke={INK} strokeWidth={4} opacity={0.75} />
            {[0, 1].map((b) => <circle key={b} cx={0} cy={shY + 82 + b * 34} r={4.5} fill={INK} />)}</>}
        </g>
        {arm(-1, armL, handL)}
        {/* head */}
        <g transform={`rotate(${tilt} 0 ${hy + 70})`}>
          <circle cx={0} cy={hy} r={HR} fill={back ? (look.hairC ?? '#3a2a20') : (look.skin ?? 'url(#skinG)')} stroke={INK} strokeWidth={7} />
          {!back && <Face mood={mood} mouth={mouth} hy={hy} eye={eye} blink={blink} look={look} t={t} blush={blush} />}
          {!back && look.hair === 'slick' && <path d={`M-92 ${hy - 22} Q-84 ${hy - 96} 0 ${hy - 98} Q84 ${hy - 96} 92 ${hy - 22} Q70 ${hy - 70} 10 ${hy - 70} Q-20 ${hy - 56} -36 ${hy - 72} Q-70 ${hy - 60} -92 ${hy - 22} Z`} fill={look.hairC ?? '#2b2420'} stroke={INK} strokeWidth={5} />}
          {!back && look.hair === 'bald' && <><path d={`M-95 ${hy + 4} Q-110 ${hy - 26} -84 ${hy - 46} Q-80 ${hy - 14} -95 ${hy + 4} Z M95 ${hy + 4} Q110 ${hy - 26} 84 ${hy - 46} Q80 ${hy - 14} 95 ${hy + 4} Z`} fill={look.hairC ?? '#6b4a2e'} stroke={INK} strokeWidth={4} /><path d={`M-40 ${hy - 76} q40 -14 70 -2`} stroke="#fff" strokeWidth={8} opacity={0.7} strokeLinecap="round" /></>}
          {!back && (look.hair === 'curly' || look.hair === 'ginger') && Array.from({length: 7}, (_, i) => <circle key={i} cx={-78 + i * 26} cy={hy - 78 + Math.abs(i - 3) * 10} r={24} fill={look.hairC ?? (look.hair === 'ginger' ? '#c8642c' : '#4a3020')} stroke={INK} strokeWidth={4} />)}
          {!back && look.hair === 'bob' && <path d={`M-104 ${hy + 62} Q-122 ${hy - 104} 0 ${hy - 110} Q122 ${hy - 104} 104 ${hy + 62} Q82 ${hy + 70} 74 ${hy + 34} Q84 ${hy - 40} 40 ${hy - 54} Q-30 ${hy - 40} -78 ${hy - 26} Q-82 ${hy + 20} -74 ${hy + 34} Q-82 ${hy + 70} -104 ${hy + 62} Z`} fill={look.hairC ?? '#3a2418'} stroke={INK} strokeWidth={5} />}
          {!back && look.hair === 'crop' && <path d={`M-94 ${hy - 14} Q-90 ${hy - 100} 0 ${hy - 102} Q90 ${hy - 100} 94 ${hy - 14} Q60 ${hy - 62} 0 ${hy - 62} Q-60 ${hy - 62} -94 ${hy - 14} Z`} fill={look.hairC ?? '#1a1412'} stroke={INK} strokeWidth={5} />}
          {sweat > 0 && <path d={`M${74} ${hy - 30 + sweat * 50} q10 18 0 26 q-10 -8 0 -26`} fill="#9fd8ff" stroke={INK} strokeWidth={3} opacity={clamp01(sweat * 4) * (1 - clamp01((sweat - 0.85) * 6))} />}
          {!noHat && look.hat && look.hat !== 'none' && <g transform={`translate(0 ${hy - 70 - hatLift * 70}) rotate(${hatRot - hatLift * 12})`}><Hat kind={look.hat} c={look.hatC} /></g>}
        </g>
        {arm(1, armR, handR)}
      </g>
    </g>
  );
};
export const Hat: React.FC<{kind: 'fedora' | 'bowler' | 'kepi' | 'chef' | 'dive' | 'stahl'; c?: string}> = ({kind, c}) => {
  if (kind === 'chef') return <g><path d="M-72 10 L-66 -44 Q-112 -60 -84 -104 Q-62 -132 -30 -112 Q0 -146 34 -112 Q70 -130 88 -100 Q110 -60 66 -44 L72 10 Q0 26 -72 10 Z" fill="#f6f3ec" stroke={INK} strokeWidth={6} /><path d="M-66 -10 Q0 4 66 -10" stroke="#c9c2b4" strokeWidth={5} fill="none" /><path d="M-30 -60 v40 M10 -66 v44" stroke="#d9d3c6" strokeWidth={4} /></g>;
  if (kind === 'stahl') return <g><path d="M-112 34 Q-118 -92 0 -96 Q118 -92 112 34 Q60 18 0 16 Q-60 18 -112 34 Z" fill={c ?? '#4c5148'} stroke={INK} strokeWidth={7} /><path d="M-96 -2 Q0 -22 96 -2" stroke="#2e322c" strokeWidth={6} fill="none" /><path d="M-60 -66 Q-20 -84 30 -78" stroke="#fff" strokeWidth={7} opacity={0.14} fill="none" /></g>;
  if (kind === 'dive') return <g transform="translate(0 70)"><circle r={124} fill="none" stroke={c ?? '#e2b12e'} strokeWidth={34} /><circle r={124} fill="none" stroke={INK} strokeWidth={4} /><circle r={141} fill="none" stroke={INK} strokeWidth={6} /><circle r={107} fill="#bfefff" fillOpacity={0.14} stroke={INK} strokeWidth={6} /><path d="M-72 -56 Q-40 -88 0 -90" stroke="#fff" strokeWidth={9} opacity={0.5} fill="none" strokeLinecap="round" /><rect x={-34} y={-182} width={68} height={40} rx={10} fill="#2a2a30" stroke={INK} strokeWidth={5} /><circle cx={0} cy={-162} r={15} fill="#fff4c2" filter="url(#glow)" /></g>;
  if (kind === 'fedora') return <g><ellipse cx={0} cy={6} rx={128} ry={22} fill={c ?? '#2c2a33'} stroke={INK} strokeWidth={6} /><path d="M-72 8 Q-80 -70 -30 -76 Q0 -60 30 -76 Q80 -70 72 8 Z" fill={c ?? '#2c2a33'} stroke={INK} strokeWidth={6} /><path d="M-74 -10 Q0 4 74 -10 L72 6 Q0 18 -72 6 Z" fill="#7a2730" /><path d="M30 -60 Q50 -40 52 -4" stroke="#fff" strokeWidth={5} opacity={0.18} fill="none" /></g>;
  if (kind === 'bowler') return <g><ellipse cx={0} cy={6} rx={112} ry={18} fill={c ?? '#2f2a26'} stroke={INK} strokeWidth={6} /><path d="M-70 8 Q-74 -84 0 -84 Q74 -84 70 8 Z" fill={c ?? '#2f2a26'} stroke={INK} strokeWidth={6} /><path d="M-70 -6 Q0 6 70 -6" stroke="#55493f" strokeWidth={10} fill="none" /></g>;
  return <g><path d="M-74 10 L-64 -70 L64 -70 L74 10 Z" fill={c ?? '#1f2b52'} stroke={INK} strokeWidth={6} /><path d="M-64 -70 L64 -70" stroke="#c8202a" strokeWidth={10} /><path d="M-80 8 Q0 34 80 8 L60 26 Q0 44 -60 26 Z" fill="#111" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-30} r={11} fill="#e2b33c" stroke={INK} strokeWidth={3} /></g>;
};
const Face: React.FC<{mood: Mood; mouth?: Mouth | null; hy: number; eye: number; blink: boolean; look: Look; t: number; blush: number}> = ({mood, mouth, hy, eye, blink, look, blush}) => {
  const ey = hy - 4, ex = eye * 12, E = {stroke: INK, strokeWidth: 6, strokeLinecap: 'round' as const, fill: 'none'};
  const dot = (cx: number) => <g key={cx}>{look.skin && <circle cx={cx + ex * 0.4} cy={ey} r={17} fill="#fff" stroke={INK} strokeWidth={3} />}<circle cx={cx + ex} cy={ey} r={10} fill={INK} /><circle cx={cx + ex + 3} cy={ey - 4} r={3} fill="#fff" /></g>;
  let eyes: React.ReactNode;
  if (blink) eyes = [-30, 30].map((c) => <path key={c} d={`M${c - 11} ${ey} h22`} {...E} />);
  else if (mood === 'wide' || mood === 'shock') eyes = [-30, 30].map((c) => <g key={c}><circle cx={c} cy={ey} r={20} fill="#fff" stroke={INK} strokeWidth={5} /><circle cx={c + ex} cy={ey} r={7} fill={INK} /></g>);
  else if (mood === 'happy') eyes = [-30, 30].map((c) => <path key={c} d={`M${c - 13} ${ey + 4} Q${c} ${ey - 14} ${c + 13} ${ey + 4}`} {...E} />);
  else if (mood === 'wink') eyes = [<path key="w" d={`M-43 ${ey} Q-30 ${ey - 12} -17 ${ey}`} {...E} />, dot(30)];
  else if (mood === 'sus') eyes = [-30, 30].map((c) => <g key={c}><path d={`M${c - 14} ${ey - 3} h28`} {...E} /><circle cx={c + ex} cy={ey + 4} r={6} fill={INK} /></g>);
  else if (mood === 'smug') eyes = [-30, 30].map((c) => <g key={c}>{dot(c)}<path d={`M${c - 14} ${ey - 6} h28`} stroke={INK} strokeWidth={7} strokeLinecap="round" /></g>);
  else eyes = [-30, 30].map(dot);
  const brow: Record<Mood, string> = {
    flat: `M-44 ${hy - 34} h26 M18 ${hy - 34} h26`, smug: `M-44 ${hy - 30} h26 M18 ${hy - 44} q14 -8 28 2`, grin: `M-44 ${hy - 38} q13 -6 26 0 M18 ${hy - 38} q13 -6 26 0`,
    wink: `M-44 ${hy - 30} h26 M18 ${hy - 46} q14 -8 28 2`, wide: `M-46 ${hy - 50} q14 -10 28 0 M18 ${hy - 50} q14 -10 28 0`, shock: `M-46 ${hy - 54} q14 -10 28 0 M18 ${hy - 54} q14 -10 28 0`,
    sus: `M-46 ${hy - 36} L-18 ${hy - 26} M18 ${hy - 26} L46 ${hy - 36}`, worry: `M-44 ${hy - 28} L-18 ${hy - 40} M18 ${hy - 40} L44 ${hy - 28}`, happy: `M-44 ${hy - 38} q13 -6 26 0 M18 ${hy - 38} q13 -6 26 0`,
    angry: `M-46 ${hy - 44} L-18 ${hy - 28} M18 ${hy - 28} L46 ${hy - 44}`,
  };
  const my = hy + 40;
  const m: Mouth = mouth ?? ({flat: 'flat', smug: 'smirk', grin: 'grin', wink: 'smirk', wide: 'small', shock: 'shock', sus: 'wave', worry: 'wave', happy: 'grin', angry: 'flat'} as Record<Mood, Mouth>)[mood];
  const mouths: Record<Mouth, React.ReactNode> = {
    closed: <path d={`M-14 ${my} h28`} {...E} />, flat: <path d={`M-18 ${my} h36`} {...E} />, small: <ellipse cx={0} cy={my + 4} rx={8} ry={10} fill={INK} />,
    o: <ellipse cx={0} cy={my + 2} rx={13} ry={16} fill="#3a1418" stroke={INK} strokeWidth={4} />, e: <path d={`M-22 ${my - 4} Q0 ${my + 16} 22 ${my - 4} Z`} fill="#3a1418" stroke={INK} strokeWidth={4} />,
    a: <path d={`M-20 ${my - 6} Q0 ${my + 28} 20 ${my - 6} Z`} fill="#3a1418" stroke={INK} strokeWidth={4} />,
    smirk: <path d={`M-18 ${my + 2} Q6 ${my + 10} 24 ${my - 8}`} {...E} />, wave: <path d={`M-22 ${my + 2} q7 -8 14 0 q7 8 14 0 q7 -8 14 0`} {...E} />,
    grin: <g><path d={`M-34 ${my - 8} Q0 ${my + 40} 34 ${my - 8} Z`} fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d={`M-28 ${my + 2} Q0 ${my + 10} 28 ${my + 2}`} stroke={INK} strokeWidth={3} fill="none" /></g>,
    shock: <ellipse cx={0} cy={my + 8} rx={18} ry={26} fill="#3a1418" stroke={INK} strokeWidth={5} />,
  };
  return <g>
    {blush > 0 && [-50, 50].map((c) => <ellipse key={c} cx={c} cy={hy + 18} rx={22} ry={12} fill="#ff6f8a" opacity={0.6 * blush} />)}
    {eyes}<path d={brow[mood]} {...E} />
    {look.glasses && [-30, 30].map((c) => <circle key={c} cx={c} cy={ey} r={24} fill="#fff" fillOpacity={0.12} stroke={INK} strokeWidth={5} />)}
    {look.glasses && <path d={`M-6 ${ey} h12`} stroke={INK} strokeWidth={5} />}
    {look.stache === 'pencil' && <path d={`M-30 ${my - 14} Q-14 ${my - 22} 0 ${my - 14} Q14 ${my - 22} 30 ${my - 14} Q34 ${my - 18} 38 ${my - 22}`} stroke={look.hairC ?? '#2b2420'} strokeWidth={7} fill="none" strokeLinecap="round" />}
    {look.stache === 'walrus' && <path d={`M-38 ${my - 4} Q-30 ${my - 30} 0 ${my - 20} Q30 ${my - 30} 38 ${my - 4} Q20 ${my - 10} 0 ${my - 8} Q-20 ${my - 10} -38 ${my - 4} Z`} fill={look.hairC ?? '#6b4a2e'} stroke={INK} strokeWidth={3} />}
    {look.stache === 'beard' && <path d={`M-80 ${hy + 10} Q-70 ${hy + 100} 0 ${hy + 104} Q70 ${hy + 100} 80 ${hy + 10} Q60 ${hy + 60} 30 ${my + 20} L-30 ${my + 20} Q-60 ${hy + 60} -80 ${hy + 10} Z`} fill={look.hairC ?? '#c8642c'} stroke={INK} strokeWidth={4} />}
    {mouths[m]}
  </g>;
};
// shared defs every scene needs (skin gradient, soft blur, glow, FG blur)
export const KitDefs: React.FC = () => <defs>
  <radialGradient id="skinG" cx="38%" cy="34%" r="75%"><stop offset="0" stopColor="#ffffff" /><stop offset="0.7" stopColor="#f3efe8" /><stop offset="1" stopColor="#d9d2c6" /></radialGradient>
  <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
  <filter id="fg" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16" /></filter>
  <filter id="bgb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6" /></filter>
  <filter id="beam" x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="26" /></filter>
  <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
  <filter id="grainF"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.9 0" /></filter>
</defs>;

// ---------- captions: 1–2 words, switch on every word, snap on (inspo) at our mid-frame spot (feed-look §4) ----------
export type Chunk = {words: string[]; from: number; to: number};
export const chunkWords = (words: Word[]): Chunk[] => {
  const out: Chunk[] = [];
  let cur: string[] = [], from = 0;
  words.forEach(([w, s], i) => {
    if (!cur.length) from = s;
    cur.push(w);
    const next = words[i + 1];
    const end = /[.,?!…:"]$/.test(w) || cur.length === 2 || !next || w.replace(/\W/g, '').length >= 6 || (next[0].replace(/\W/g, '').length >= 7);
    if (end) { out.push({words: cur, from, to: words[i][2]}); cur = []; }
  });
  return out.map((c, i) => ({...c, to: Math.min(i < out.length - 1 ? out[i + 1].from : c.to + 0.5, c.to + 0.5)}));
};
export const Captions: React.FC<{t: number; chunks: Chunk[]; keys: Record<string, string>; font: string; y?: number}> = ({t, chunks, keys, font, y = 1100}) => {
  const c = chunks.find((x) => t >= x.from - 0.02 && t < x.to);
  if (!c) return null;
  const fresh = t - c.from < 0.034; // 1-frame nudge, otherwise a hard snap like the inspo
  return <div style={{position: 'absolute', left: 60, right: 140, top: y, textAlign: 'center', transform: `scale(${fresh ? 1.05 : 1})`}}>
    {c.words.map((w, i) => {
      const clean = w.replace(/["“”]/g, '').replace(/[.,?!…:]+$/g, '');
      const col = keys[clean.toLowerCase().replace(/[^a-z0-9é]/g, '')];
      return <span key={i} style={{fontFamily: font, fontWeight: 900, fontSize: 88, color: col ?? '#fff', WebkitTextStroke: '5px #000', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.75)', margin: '0 12px', display: 'inline-block'}}>{clean}</span>;
    })}
  </div>;
};

// current time in seconds (used by the example compositions)
export const useCurrentFrameT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return f / fps; };
