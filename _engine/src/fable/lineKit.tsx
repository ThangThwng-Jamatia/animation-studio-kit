// "Line" look for Dark Fables (2026-10-26, after the Doomer inspo): photoreal AI plates + hand-drawn line-art everyman.
// Original character (not a Wojak): long egg head, tired almond eyes with bags, hoodie with folds, jeans, ink outline.
// Everything is a pure function of the absolute second t, like fableKit.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {rnd, mix} from './fableKit';

export const L = {ink: '#141416', skin: '#efece4', skinShade: '#c9c6c0', bag: '#8a7f8c', hood: '#2b2d33', hoodShade: '#1b1c21', jeans: '#2e4566', shoe: '#e9e9e9'};
const OUT = {stroke: L.ink, strokeWidth: 4.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const LINE = {stroke: L.ink, strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round' as const};

export type LMood = 'flat' | 'tired' | 'sad' | 'smile' | 'wide' | 'closed' | 'determined';
// head centred on (0,0), ~250 units tall. look: -1..1 pupils sideways
export const LHead: React.FC<{mood: LMood; look?: number; beanie?: boolean; glow?: number; light?: string}> = ({mood, look = 0, beanie, glow = 0, light = '#7fa6ff'}) => {
  const tired = mood === 'tired' || mood === 'sad' || mood === 'flat';
  const shut = mood === 'closed';
  const eye = (s: number) => {
    const cx = s * 34, cy = -8;
    const lid = mood === 'wide' ? -14 : tired ? -4 : -9;
    return <g key={s}>
      {/* eye bag */}
      {mood !== 'smile' && <path d={`M${cx - 20} ${cy + 9} Q${cx} ${cy + 26} ${cx + 20} ${cy + 9} Q${cx} ${cy + 18} ${cx - 20} ${cy + 9}Z`} fill={L.bag} opacity={0.55} />}
      {shut ? <path d={`M${cx - 18} ${cy} Q${cx} ${cy + 8} ${cx + 18} ${cy}`} {...LINE} /> : <>
        <path d={`M${cx - 20} ${cy} Q${cx} ${cy + lid} ${cx + 20} ${cy} Q${cx} ${cy + 11} ${cx - 20} ${cy}Z`} {...LINE} fill="#fbfaf6" />
        <circle cx={cx + look * 7 + s * 1} cy={cy + 1} r={mood === 'wide' ? 4.5 : 6.5} fill={L.ink} />
        {/* heavy upper lid */}
        <path d={`M${cx - 22} ${cy - 1} Q${cx} ${cy + lid - 3} ${cx + 22} ${cy - 1}`} stroke={L.ink} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </>}
      {mood === 'smile' && <path d={`M${cx - 14} ${cy + 14} Q${cx} ${cy + 19} ${cx + 14} ${cy + 14}`} {...LINE} strokeWidth={2.4} />}
    </g>;
  };
  const brow = mood === 'sad' ? 'M-58 -40 Q-40 -42 -16 -32 M58 -40 Q40 -42 16 -32'
    : mood === 'determined' ? 'M-58 -36 Q-36 -32 -14 -24 M58 -36 Q36 -32 14 -24'
    : mood === 'wide' ? 'M-56 -46 Q-36 -54 -16 -46 M56 -46 Q36 -54 16 -46' : 'M-56 -38 Q-36 -42 -16 -38 M56 -38 Q36 -42 16 -38';
  const mouth = mood === 'smile' ? 'M-24 62 Q0 76 24 62' : mood === 'sad' ? 'M-24 70 Q0 58 24 70'
    : mood === 'wide' ? 'M-10 66 Q0 72 10 66' : mood === 'determined' ? 'M-22 66 L22 64' : 'M-24 66 Q0 63 24 67';
  return <g>
    {/* ears */}
    {[-1, 1].map((s) => <path key={s} d={`M${s * 72} -14 Q${s * 92} -22 ${s * 90} 4 Q${s * 88} 26 ${s * 70} 22`} fill={L.skin} {...OUT} />)}
    <path d="M-74 -40 C-80 -150 80 -150 74 -40 C78 20 70 70 44 104 C24 128 -24 128 -44 104 C-70 70 -78 20 -74 -40Z" fill={L.skin} {...OUT} />
    {/* cheek / jaw shading on the shadow side */}
    <path d="M40 -70 C70 -40 72 40 44 104 C30 120 18 124 8 125 C40 90 56 20 40 -70Z" fill={L.skinShade} opacity={0.55} />
    {glow > 0 && <path d="M-74 -40 C-80 -150 80 -150 74 -40 C78 20 70 70 44 104 C24 128 -24 128 -44 104 C-70 70 -78 20 -74 -40Z" fill="url(#lfaceGlow)" opacity={glow} style={{mixBlendMode: 'screen'}} />}
    {/* forehead wrinkles */}
    {tired && <path d="M-30 -86 Q0 -92 30 -86 M-22 -72 Q0 -77 22 -72" {...LINE} strokeWidth={2.2} opacity={0.6} />}
    <path d={brow} {...LINE} strokeWidth={4.2} />
    {eye(-1)}{eye(1)}
    {/* nose */}
    <path d="M4 8 Q-8 30 -2 38 Q6 42 14 36" {...LINE} />
    {/* nasolabial lines */}
    {tired && <path d="M-26 38 Q-34 54 -30 70 M28 38 Q36 54 32 70" {...LINE} strokeWidth={2.2} opacity={0.5} />}
    <path d={mouth} {...LINE} strokeWidth={3.6} />
    {beanie && <g>
      <path d="M-80 -60 C-86 -170 86 -170 80 -60 Q0 -78 -80 -60Z" fill="#1e1f24" {...OUT} />
      <path d="M-84 -66 Q0 -86 84 -66 L82 -44 Q0 -62 -82 -44Z" fill="#26272d" {...OUT} />
      {[-60, -40, -20, 0, 20, 40, 60].map((x) => <line key={x} x1={x} y1={-74 + Math.abs(x) * 0.06} x2={x} y2={-52 + Math.abs(x) * 0.06} stroke="#3a3b42" strokeWidth={3} />)}
    </g>}
  </g>;
};

export type LGuyP = {x: number; y: number; s?: number; mood?: LMood; look?: number; tilt?: number; t?: number; seed?: number; beanie?: boolean;
  pose?: 'stand' | 'sit'; phone?: number; walk?: number; flip?: boolean; light?: string};
// feet at (x,y). ~640 units tall standing. phone 0..1 raises the phone to the face (blue glow on the face).
export const LGuy: React.FC<LGuyP> = ({x, y, s = 1, mood = 'tired', look = 0, tilt = 0, t = 0, seed = 0, beanie, pose = 'stand', phone = 0, walk, flip, light = '#7fa6ff'}) => {
  const breath = Math.sin(t * 2 * Math.PI * 0.28 + seed);
  const blink = ((t + seed * 1.7) % (2.8 + rnd(seed) * 1.3)) < 0.11;
  const m: LMood = blink && mood !== 'closed' ? 'closed' : mood;
  const sit = pose === 'sit';
  const ph = walk ?? 0, moving = walk !== undefined;
  const bob = moving ? -Math.abs(Math.sin(ph)) * 7 : 0;
  const hipY = sit ? -170 : -300;
  const shY = hipY - 210 - breath * 2.5;
  const headY = shY - 150;
  const handR: [number, number] = phone ? [mix(58, 26, phone), mix(hipY - 20, headY + 150, phone)] : [70, hipY + 10];
  const sw = moving ? Math.sin(ph) * 22 : 0;
  const leg = (d: number) => {
    if (sit) return <g key={d}>
      <path d={`M${d * 30 - 34} ${hipY} L${d * 30 + 120} ${hipY + 6} L${d * 30 + 116} ${hipY + 60} L${d * 30 - 40} ${hipY + 60}Z`} fill={L.jeans} {...OUT} />
      <path d={`M${d * 30 + 84} ${hipY + 30} L${d * 30 + 80} -8 L${d * 30 + 128} -8 L${d * 30 + 124} ${hipY + 30}Z`} fill={L.jeans} {...OUT} />
      <path d={`M${d * 30 + 72} -12 Q${d * 30 + 70} 4 ${d * 30 + 88} 4 L${d * 30 + 150} 4 Q${d * 30 + 150} -14 ${d * 30 + 128} -16Z`} fill={L.shoe} {...OUT} />
    </g>;
    const a = moving ? Math.sin(ph) * 18 * d : 0;
    return <g key={d} transform={`rotate(${a} ${d * 24} ${hipY})`}>
      <path d={`M${d * 24 - 26} ${hipY} L${d * 24 + 26} ${hipY} L${d * 26 + 24} -14 L${d * 26 - 24} -14Z`} fill={L.jeans} {...OUT} />
      <path d={`M${d * 24 - 6} ${hipY + 120} q6 20 0 40`} {...LINE} strokeWidth={2} opacity={0.4} />
      <path d={`M${d * 26 - 30} -16 Q${d * 26 - 34} 4 ${d * 26 - 10} 4 L${d * 26 + 44} 4 Q${d * 26 + 44} -16 ${d * 26 + 22} -18Z`} fill={L.shoe} {...OUT} />
    </g>;
  };
  const arm = (d: number) => {
    const [hx, hy] = d > 0 ? handR : [-62 - sw, hipY + 10];
    const ex = d > 0 && phone ? 96 : d * 80, ey = d > 0 && phone ? shY + 150 : shY + 130;
    return <g key={d}>
      <path d={`M${d * 66} ${shY + 20} Q${ex + d * 20} ${ey - 40} ${ex} ${ey} L${hx} ${hy}`} stroke={L.ink} strokeWidth={58} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${d * 66} ${shY + 20} Q${ex + d * 20} ${ey - 40} ${ex} ${ey} L${hx} ${hy}`} stroke={d > 0 ? L.hood : L.hoodShade} strokeWidth={49} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={hx} cy={hy + 14} rx={20} ry={23} fill={L.skin} {...OUT} />
    </g>;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} filter="url(#lgrade)">
      <ellipse cx={0} cy={2} rx={sit ? 190 : 120} ry={16} fill="#000" opacity={0.45} filter="url(#lsoft)" />
      <g transform={`translate(0 ${bob})`}>
        {[-1, 1].map(leg)}
        {arm(-1)}
        {/* hoodie torso */}
        <path d={`M-78 ${shY + 18} Q-92 ${shY + 120} -80 ${hipY + 30} Q0 ${hipY + 48} 80 ${hipY + 30} Q92 ${shY + 120} 78 ${shY + 18} Q0 ${shY - 22} -78 ${shY + 18}Z`} fill={L.hood} {...OUT} />
        <path d={`M20 ${shY + 10} Q74 ${shY + 120} 66 ${hipY + 30} Q80 ${hipY + 32} 80 ${hipY + 30} Q92 ${shY + 120} 78 ${shY + 18}Z`} fill={L.hoodShade} opacity={0.8} />
        {/* pocket, hem, folds */}
        <path d={`M-46 ${hipY - 40} Q0 ${hipY - 52} 46 ${hipY - 40} L54 ${hipY + 8} M-46 ${hipY - 40} L-54 ${hipY + 8}`} {...LINE} strokeWidth={2.8} />
        <path d={`M-80 ${hipY + 18} Q0 ${hipY + 34} 80 ${hipY + 18}`} {...LINE} strokeWidth={2.6} />
        <path d={`M-40 ${shY + 70} q10 30 2 60 M30 ${shY + 90} q-8 26 0 50`} {...LINE} strokeWidth={2.2} opacity={0.5} />
        {/* hood collar + strings */}
        <path d={`M-60 ${shY + 6} Q0 ${shY + 64} 60 ${shY + 6} Q0 ${shY + 30} -60 ${shY + 6}Z`} fill={L.hoodShade} {...OUT} />
        {[-14, 14].map((d) => <path key={d} d={`M${d} ${shY + 36} q${d * 0.2} 40 ${d * 0.4} 70`} stroke="#d8d8d8" strokeWidth={4} fill="none" strokeLinecap="round" />)}
        {arm(1)}
        {phone > 0 && <g transform={`translate(${handR[0]} ${handR[1]}) rotate(-8)`}>
          <rect x={-22} y={-44} width={44} height={80} rx={8} fill="#111" stroke={L.ink} strokeWidth={3} />
          <ellipse cx={0} cy={-6} rx={14} ry={22} fill={light} opacity={0.4 * phone} filter="url(#lsoft)" />
        </g>}
        <g transform={`translate(0 ${headY}) rotate(${tilt} 0 110)`}>
          <g transform="scale(1.32)"><LHead mood={m} look={look} beanie={beanie} glow={phone} light={light} /></g>
        </g>
      </g>
    </g>
  );
};

// photoreal AI plate (public/fable/plates/<name>.png) with camera push, defocus and a grade wash.
export const Plate: React.FC<{src: string; t: number; zoom?: [number, number]; dur?: number; blur?: number; ox?: number; oy?: number; grade?: string; gradeO?: number}> = ({src, t, zoom = [1.04, 1.12], dur = 6, blur = 2.5, ox = 0, oy = 0, grade = '#0d1a33', gradeO = 0.25}) => {
  const k = Math.min(1, Math.max(0, t / dur));
  const z = mix(zoom[0], zoom[1], k);
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <Img src={staticFile(`fable/plates/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `translate(${ox}px, ${oy}px) scale(${z})`, filter: `blur(${blur}px) saturate(0.8) brightness(0.92)`}} />
    <AbsoluteFill style={{background: grade, opacity: gradeO, mixBlendMode: 'multiply'}} />
  </AbsoluteFill>;
};

// film finish over everything: vignette, grain, slight letterbox-free crush
export const Finish: React.FC<{t: number; warm?: number}> = ({t, warm = 0}) => {
  const f = Math.floor(t * 24);
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.72) 100%)'}} />
    {warm > 0 && <AbsoluteFill style={{background: '#ff9a3c', opacity: 0.12 * warm, mixBlendMode: 'soft-light'}} />}
    <AbsoluteFill style={{opacity: 0.07, backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' seed='${f % 8}'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>")`, mixBlendMode: 'overlay'}} />
  </AbsoluteFill>;
};

export const LineDefs: React.FC = () => <defs>
  <filter id="lsoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
  {/* sits the drawing into a night plate: darker, cooler */}
  <filter id="lgrade"><feColorMatrix type="matrix" values="0.72 0 0 0 0.01  0 0.76 0 0 0.02  0 0 0.86 0 0.05  0 0 0 1 0" /></filter>
  <radialGradient id="lfaceGlow" cx="0.5" cy="0.75" r="0.7"><stop offset="0" stopColor="#9fc0ff" stopOpacity={0.55} /><stop offset="1" stopColor="#9fc0ff" stopOpacity={0} /></radialGradient>
</defs>;
