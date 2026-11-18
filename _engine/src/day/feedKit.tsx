// Feed Look kit (2026-10-25): shared pieces for flat-2D cinematic shorts per .claude/skills/paper-explainer/references/feed-look.md.
// Everyman rig (adult proportions, dot eyes, no mouth), light shafts, dust motes, haze, blur wrapper, cabin set, muted palette, FeedDefs.
import React from 'react';
import {Limb, wob} from '../cine/cineKit';
import {rnd} from './dayKit';

// muted palette
export const K = {ink: '#15151c', skin: '#c99a78', skinD: '#a97c5d', you: '#3f6f6a', youD: '#2d524e', youHair: '#3a2a20', nad: '#2c3550', nadD: '#1f2640', nadTop: '#a8473f', nadHair: '#6a3f2c',
  cabin: '#1d2431', cabinHi: '#2e3646', seat: '#3a4152', seatD: '#2a3040', warm: '#ffd9a0', red: '#d8473a', amber: '#f2b04a'};

// ---------- everyman: adult proportions, dot eyes, no mouth; feet at y=0, facing +x; look shifts the eyes ----------
export type Man = {x: number; y: number; h: number; top: string; topD: string; hair: string; bun?: boolean; look?: number; armF?: number; armB?: number; elbF?: number; seated?: boolean; t: number; blink?: boolean; face?: number; lean?: number};
export const Everyman: React.FC<Man> = ({x, y, h, top, topD, hair, bun, look = 0.6, armF = 95, armB = 100, elbF = -10, seated, t, face = 1, lean = 0}) => {
  const u = h / 100, hr = 7.2 * u, br = wob(t, 2.2) * 0.4 * u;
  const blink = (t * 0.7) % 4 < 0.12;
  return (
    <g transform={`translate(${x} ${y}) scale(${face} 1)`}>
      <ellipse cx={0} cy={0} rx={22 * u} ry={3 * u} fill="#000" opacity={0.45} filter="url(#b10)" />
      <g transform={`rotate(${lean} 0 ${-50 * u})`}>
        {!seated && <>
          <Limb x={-4 * u} y={-48 * u} a={92} b={-4} L1={23 * u} L2={23 * u} w1={9 * u} w2={8 * u} end={4.5 * u} c="#262a36" sw={0} />
          <Limb x={5 * u} y={-48 * u} a={86} b={6} L1={23 * u} L2={23 * u} w1={9.5 * u} w2={8.5 * u} end={4.8 * u} c="#2f3442" sw={0} />
        </>}
        <Limb x={-6 * u} y={-80 * u + br} a={armB} b={-12} L1={17 * u} L2={16 * u} w1={7 * u} w2={6.2 * u} end={3.6 * u} c={topD} endC={K.skinD} sw={0} />
        {/* torso with soft shading */}
        <path d={`M${-11 * u} ${-48 * u} Q${-13 * u} ${-70 * u} ${-12 * u} ${-82 * u + br} Q0 ${-87 * u + br} ${12 * u} ${-82 * u + br} Q${14 * u} ${-66 * u} ${11 * u} ${-48 * u}Z`} fill={top} />
        <path d={`M${-11 * u} ${-48 * u} Q${-13 * u} ${-70 * u} ${-12 * u} ${-82 * u + br} Q${-6 * u} ${-84 * u} ${-3 * u} ${-84 * u} Q${-6 * u} ${-66 * u} ${-4 * u} ${-48 * u}Z`} fill={topD} opacity={0.8} />
        <rect x={-2.6 * u} y={-88 * u + br} width={5.2 * u} height={6 * u} fill={K.skinD} />
        {/* head */}
        <g transform={`translate(${1 * u} ${-95 * u + br})`}>
          <circle r={hr} fill={K.skin} />
          <path d={`M${-hr} 0 A${hr} ${hr} 0 0 1 ${-hr * 0.2} ${-hr * 0.98} Q${-hr * 0.5} 0 ${-hr * 0.4} ${hr * 0.92} A${hr} ${hr} 0 0 1 ${-hr} 0Z`} fill={K.skinD} opacity={0.55} />
          <path d={`M${-hr * 1.04} ${hr * 0.1} Q${-hr * 1.1} ${-hr * 1.15} ${hr * 0.1} ${-hr * 1.12} Q${hr * 1.05} ${-hr * 1.05} ${hr * 1.02} ${-hr * 0.25} Q${hr * 0.3} ${-hr * 0.7} ${-hr * 0.55} ${-hr * 0.35} Q${-hr * 0.8} ${0} ${-hr * 1.04} ${hr * 0.1}Z`} fill={hair} />
          {bun && <circle cx={-hr * 0.7} cy={-hr * 0.85} r={hr * 0.45} fill={hair} />}
          {!blink && [0.18, 0.62].map((ex) => <circle key={ex} cx={hr * (ex + look * 0.25)} cy={-hr * 0.02} r={hr * 0.085} fill={K.ink} />)}
          {blink && [0.18, 0.62].map((ex) => <rect key={ex} x={hr * (ex + look * 0.25) - hr * 0.09} y={-hr * 0.03} width={hr * 0.18} height={hr * 0.04} fill={K.ink} />)}
        </g>
        <Limb x={8 * u} y={-80 * u + br} a={armF} b={elbF} L1={17 * u} L2={16 * u} w1={7.4 * u} w2={6.6 * u} end={3.8 * u} c={top} cd={topD} endC={K.skin} sw={0} />
      </g>
    </g>
  );
};
export const you = (p: Partial<Man> & {x: number; y: number; h: number; t: number}) => <Everyman top={K.you} topD={K.youD} hair={K.youHair} {...p} />;
export const nadia = (p: Partial<Man> & {x: number; y: number; h: number; t: number}) => <Everyman top={K.nad} topD={K.nadD} hair={K.nadHair} bun {...p} />;

// ---------- light + atmosphere ----------
export const Shaft: React.FC<{x: number; y: number; w: number; h: number; tilt?: number; col?: string; o?: number}> = ({x, y, w, h, tilt = 0, col = K.warm, o = 0.22}) => (
  <polygon points={`${x - w * 0.15},${y} ${x + w * 0.15},${y} ${x + w / 2 + tilt},${y + h} ${x - w / 2 + tilt},${y + h}`} fill={col} opacity={o} filter="url(#b18)" />
);
export const Motes: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number}> = ({t, x, y, w, h, n = 22}) => (
  <g>{Array.from({length: n}, (_, i) => <circle key={i} cx={x + rnd(i) * w + wob(t, 0.6, i) * 18} cy={y + ((rnd(i + 7) * h + t * 14 * (0.4 + rnd(i))) % h)} r={1.6 + rnd(i * 3) * 2.4} fill="#fff4dc" opacity={0.35 + 0.3 * rnd(i + 2)} />)}</g>
);
export const Haze: React.FC<{y: number; h: number; col?: string; o?: number}> = ({y, h, col = '#9aa6bd', o = 0.25}) => <rect x={-100} y={y} width={1280} height={h} fill={col} opacity={o} filter="url(#b18)" />;
export const Blur: React.FC<{r: number; children: React.ReactNode}> = ({r, children}) => <g filter={`url(#b${r})`}>{children}</g>;

// cabin interior wall + window row + overhead bins, in cabin night light
export const CabinBG: React.FC<{t: number; red?: number}> = ({t, red = 0}) => (
  <g>
    <rect width={1080} height={1920} fill="url(#cabinG)" />
    <rect y={0} width={1080} height={430} fill="#141a25" />
    <path d="M0 430 Q540 520 1080 430 L1080 470 Q540 560 0 470Z" fill="#232a38" />
    {[120, 420, 720, 1020].map((x, i) => <rect key={i} x={x - 70} y={180} width={140} height={160} rx={18} fill="#1a2030" stroke="#262d3d" strokeWidth={6} />)}
    <rect width={1080} height={1920} fill={K.red} opacity={0.18 * red * (0.7 + 0.3 * wob(t, 3))} />
  </g>
);

// svg defs every feed-look scene uses: blur b4/b10/b18, night sky, cabin wall, door
export const FeedDefs: React.FC = () => (
  <defs>
    {[4, 10, 18].map((b) => <filter key={b} id={`b${b}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={b} /></filter>)}
    <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a1020" /><stop offset="0.6" stopColor="#1c2742" /><stop offset="1" stopColor="#38466a" /></linearGradient>
    <linearGradient id="cabinG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2130" /><stop offset="1" stopColor="#2a3140" /></linearGradient>
    <linearGradient id="doorG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5b6880" /><stop offset="1" stopColor="#7a879c" /></linearGradient>
  </defs>
);
