// Wojak-mode kit for Dark Fables (first used by BOOMER, 2026-10-26). Line-art people (original designs, not memes) over
// photoreal plates (lineKit Plate/Finish), plus the full-frame diegetic inserts the format lives on: phone screens held
// by a drawn hand, calendar, clock, whiteboard, stat cards. Pure functions of the absolute second t.
import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {ease, win, mix, rnd, SANS, HAND} from './fableKit';

export const INK = '#141416';
const OUT = {stroke: INK, strokeWidth: 4.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
const LINE = {stroke: INK, strokeWidth: 3.2, fill: 'none', strokeLinecap: 'round' as const};
const SKIN = '#efece4', SHADE = '#cdc9c1';

export type Hair = 'boy' | 'girl' | 'blond' | 'dad' | 'mom';
export type Look = {hair: Hair; top: string; topShade: string; pants: string; broad?: number; stubble?: number; girl?: boolean; jacket?: boolean; hairCol?: string};
export const BOY: Look = {hair: 'boy', top: '#2b2d33', topShade: '#1b1c21', pants: '#2e4566'};
export const BOY_UP: Look = {hair: 'boy', top: '#1c2230', topShade: '#121620', pants: '#18181c', broad: 1, stubble: 1, jacket: true};
export const MAYA: Look = {hair: 'girl', top: '#b94a66', topShade: '#8d3349', pants: '#2b3550', girl: true, hairCol: '#4a2e1c'};
export const CHAD: Look = {hair: 'blond', top: '#e6e1d6', topShade: '#bdb7aa', pants: '#3a3a40', broad: 0.6};
export const DAD: Look = {hair: 'dad', top: '#55654a', topShade: '#3e4b36', pants: '#3a3a40'};
export const MOM: Look = {hair: 'mom', top: '#86577a', topShade: '#6a4260', pants: '#2b2b33', girl: true, hairCol: '#3a2a22'};

export type Mood = 'flat' | 'tired' | 'sad' | 'smile' | 'grin' | 'wide' | 'closed' | 'determined' | 'hurt' | 'cry';

const HEAD_M = 'M-70 -50 C-76 -150 76 -150 70 -50 C72 10 66 58 42 90 L16 110 Q0 117 -16 110 L-42 90 C-66 58 -72 10 -70 -50Z';
const HEAD_F = 'M-66 -50 C-72 -146 72 -146 66 -50 C68 14 60 60 36 92 Q0 122 -36 92 C-60 60 -68 14 -66 -50Z';

export const Head: React.FC<{look: Look; mood: Mood; gaze?: number; tears?: number; blush?: number; glow?: number; glowCol?: string; t?: number}> = ({look, mood, gaze = 0, tears = 0, blush = 0, glow = 0, glowCol = '#9fc0ff', t = 0}) => {
  const f = !!look.girl;
  const head = f ? HEAD_F : HEAD_M;
  const hc = look.hairCol ?? (look.hair === 'blond' ? '#d9b46a' : look.hair === 'dad' ? '#8d8a86' : '#2a2019');
  const drained = mood === 'tired' || mood === 'cry' || mood === 'hurt';
  const shut = mood === 'closed';
  const eye = (s: number) => {
    const cx = s * 31, cy = -10;
    const lid = mood === 'wide' ? -15 : drained ? -5 : mood === 'determined' ? -7 : -11;
    return <g key={s}>
      {drained && <path d={`M${cx - 18} ${cy + 9} Q${cx} ${cy + 24} ${cx + 18} ${cy + 9} Q${cx} ${cy + 16} ${cx - 18} ${cy + 9}Z`} fill="#8a7f8c" opacity={0.5} />}
      {shut || mood === 'grin' ? <path d={mood === 'grin' ? `M${cx - 17} ${cy + 2} Q${cx} ${cy - 10} ${cx + 17} ${cy + 2}` : `M${cx - 17} ${cy} Q${cx} ${cy + 8} ${cx + 17} ${cy}`} {...LINE} strokeWidth={4} /> : <>
        <path d={`M${cx - 19} ${cy} Q${cx} ${cy + lid} ${cx + 19} ${cy} Q${cx} ${cy + 12} ${cx - 19} ${cy}Z`} {...LINE} fill="#fbfaf6" />
        <circle cx={cx + gaze * 7} cy={cy + 1} r={mood === 'wide' ? 5 : 7} fill={INK} />
        <circle cx={cx + gaze * 7 + 2.5} cy={cy - 2} r={1.8} fill="#fff" />
        <path d={`M${cx - 21} ${cy - 1} Q${cx} ${cy + lid - 3} ${cx + 21} ${cy - 1}`} stroke={INK} strokeWidth={f ? 5.5 : 4.5} fill="none" strokeLinecap="round" />
        {f && <path d={`M${cx + s * 18} ${cy - 3} l${s * 7} -6`} {...LINE} strokeWidth={3} />}
      </>}
    </g>;
  };
  const bw = f ? 3.2 : 5.5;
  const brow = mood === 'sad' || mood === 'hurt' || mood === 'cry' ? 'M-52 -38 Q-34 -42 -12 -30 M52 -38 Q34 -42 12 -30'
    : mood === 'determined' ? 'M-52 -36 Q-32 -32 -10 -26 M52 -36 Q32 -32 10 -26'
    : mood === 'wide' ? 'M-50 -48 Q-32 -56 -12 -48 M50 -48 Q32 -56 12 -48' : 'M-50 -40 Q-32 -45 -12 -40 M50 -40 Q32 -45 12 -40';
  const mouth = mood === 'smile' ? 'M-20 58 Q0 70 20 58' : mood === 'grin' ? 'M-24 54 Q0 78 24 54 Q0 62 -24 54Z'
    : mood === 'sad' || mood === 'hurt' ? 'M-20 66 Q0 56 20 66' : mood === 'cry' ? `M-18 62 Q0 ${50 + Math.sin(t * 18) * 3} 18 62 Q0 72 -18 62Z`
    : mood === 'wide' ? 'M-8 62 Q0 68 8 62' : mood === 'determined' ? 'M-18 62 L18 61' : 'M-18 62 Q0 60 18 63';
  return <g>
    {/* long hair behind the head */}
    {look.hair === 'girl' && <path d="M-80 -60 C-96 -170 96 -170 80 -60 C92 40 96 130 110 190 Q60 210 30 150 L-30 150 Q-60 210 -110 190 C-96 130 -92 40 -80 -60Z" fill={hc} {...OUT} />}
    {look.hair === 'mom' && <ellipse cx={0} cy={-142} rx={40} ry={30} fill={hc} {...OUT} />}
    {[-1, 1].map((s) => <path key={s} d={`M${s * 68} -18 Q${s * 88} -26 ${s * 86} 0 Q${s * 84} 22 ${s * 66} 18`} fill={SKIN} {...OUT} />)}
    <path d={head} fill={SKIN} {...OUT} />
    <path d={f ? 'M38 -72 C64 -40 66 40 36 92 Q22 104 10 108 C40 76 52 10 38 -72Z' : 'M40 -72 C66 -40 68 40 42 90 L16 110 Q10 112 6 112 C40 80 54 10 40 -72Z'} fill={SHADE} opacity={0.55} />
    {glow > 0 && <path d={head} fill="url(#wFaceGlow)" opacity={glow} style={{mixBlendMode: 'screen'}} />}
    {(look.stubble ?? 0) > 0 && <path d="M-62 30 C-58 70 -40 92 -16 108 Q0 114 16 108 C40 92 58 70 62 30 Q40 76 22 74 Q0 70 -22 74 Q-40 76 -62 30Z" fill="#6d665c" opacity={0.28 * (look.stubble ?? 0)} />}
    {look.hair === 'dad' && <path d="M-26 44 Q0 34 26 44 Q0 52 -26 44Z" fill={hc} {...OUT} strokeWidth={2.5} />}
    {look.hair === 'dad' && <path d="M-26 -84 Q0 -90 26 -84" {...LINE} strokeWidth={2.2} opacity={0.5} />}
    <path d={brow} stroke={look.hair === 'blond' ? '#8a6a30' : INK} strokeWidth={bw} fill="none" strokeLinecap="round" />
    {eye(-1)}{eye(1)}
    {blush > 0 && [-1, 1].map((s) => <ellipse key={s} cx={s * 40} cy={22} rx={18} ry={9} fill="#ff7a8a" opacity={0.45 * blush} />)}
    {f ? <path d="M2 10 Q-4 26 2 30 Q8 31 12 28" {...LINE} strokeWidth={2.8} /> : <path d="M6 4 L-4 30 Q2 36 14 32" {...LINE} />}
    {f && mood !== 'grin' ? <path d={mouth} stroke="#b04456" strokeWidth={5} fill={mood === 'cry' ? '#5a2030' : 'none'} strokeLinecap="round" /> : <path d={mouth} {...LINE} strokeWidth={3.6} fill={mood === 'grin' || mood === 'cry' ? '#3a1a1e' : 'none'} />}
    {tears > 0 && [-1, 1].map((s) => <path key={s} d={`M${s * 31} 0 q${s * 4} ${40 * tears} ${s * 2} ${80 * tears}`} stroke="#9fd2ff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />)}
    {/* hair on top */}
    {look.hair === 'boy' && <path d="M-74 -46 C-92 -150 40 -190 82 -78 L76 -46 Q72 -86 52 -100 Q30 -78 -6 -100 Q-30 -76 -60 -92 Q-70 -70 -74 -46Z" fill={hc} {...OUT} />}
    {look.hair === 'boy' && <path d="M-40 -130 Q0 -150 40 -126 M-10 -146 Q30 -150 60 -118" stroke="#4a3a2c" strokeWidth={3} fill="none" strokeLinecap="round" />}
    {look.hair === 'blond' && <path d="M-72 -50 C-84 -150 84 -160 74 -50 Q66 -96 30 -104 Q0 -92 -30 -106 Q-62 -92 -72 -50Z" fill={hc} {...OUT} />}
    {(look.hair === 'girl' || look.hair === 'mom') && <path d="M-70 -40 C-84 -160 84 -160 70 -40 Q60 -100 10 -112 Q-30 -80 -70 -40Z" fill={hc} {...OUT} />}
    {look.hair === 'dad' && <path d="M-72 -46 C-80 -110 -50 -140 -20 -130 M72 -46 C80 -110 50 -140 20 -130" stroke={hc} strokeWidth={14} fill="none" strokeLinecap="round" />}
  </g>;
};

export type PersonP = {
  look: Look; x: number; y: number; s?: number; mood?: Mood; gaze?: number; tilt?: number; t?: number; seed?: number;
  pose?: 'stand' | 'sit' | 'floor'; walk?: number; run?: boolean; flip?: boolean;
  phone?: number; raise?: number; hold?: React.ReactNode; holdL?: React.ReactNode; clap?: boolean; tears?: number; blush?: number; glow?: number; glowCol?: string; shake?: number; o?: number;
};
// feet at (x,y). ~800 units tall standing.
export const Person: React.FC<PersonP> = ({look, x, y, s = 1, mood = 'flat', gaze = 0, tilt = 0, t = 0, seed = 0, pose = 'stand', walk, run, flip,
  phone = 0, raise = 0, hold, holdL, clap, tears = 0, blush = 0, glow = 0, glowCol, shake = 0, o = 1}) => {
  const breath = Math.sin(t * 2 * Math.PI * 0.28 + seed);
  const blink = ((t + seed * 1.7) % (2.8 + rnd(seed) * 1.3)) < 0.11;
  const m: Mood = blink && mood !== 'closed' && mood !== 'grin' ? 'closed' : mood;
  const sit = pose === 'sit', floor = pose === 'floor';
  const ph = walk ?? 0, moving = walk !== undefined;
  const bob = moving ? -Math.abs(Math.sin(ph)) * (run ? 14 : 7) : 0;
  const jx = shake ? (rnd(Math.floor(t * 30)) - 0.5) * 6 * shake : 0;
  const hipY = sit ? -170 : floor ? -40 : -300;
  const sh = 74 + 14 * (look.broad ?? 0) - (look.girl ? 10 : 0);
  const shY = hipY - (look.girl ? 195 : 210) - breath * 2.5;
  const headY = shY - 150;
  const cl = clap ? Math.abs(Math.sin(t * 9)) : 0;
  const handR: [number, number] = clap ? [mix(8, 46, cl), shY + 120] : phone ? [mix(62, 26, phone), mix(hipY - 20, headY + 170, phone)] : raise ? [mix(70, 96, raise), mix(hipY + 10, headY - 40, raise)] : hold ? [96, hipY - 30] : [70 + (moving ? -Math.sin(ph) * 30 : 0), hipY + 10];
  const handL: [number, number] = clap ? [mix(-8, -46, cl), shY + 120] : holdL ? [-90, hipY - 20] : [-66 + (moving ? Math.sin(ph) * 30 : 0), hipY + 10];
  const stride = run ? 32 : 18;
  const leg = (d: number) => {
    if (sit || floor) {
      const ky = floor ? -150 : hipY + 30;
      return <g key={d}>
        {floor ? <path d={`M${d * 26 - 30} ${hipY} L${d * 26 + 70} ${ky} L${d * 26 + 104} ${ky + 26} L${d * 26 + 10} ${hipY + 30}Z`} fill={look.pants} {...OUT} />
          : <path d={`M${d * 30 - 34} ${hipY} L${d * 30 + 120} ${hipY + 6} L${d * 30 + 116} ${hipY + 60} L${d * 30 - 40} ${hipY + 60}Z`} fill={look.pants} {...OUT} />}
        <path d={`M${d * 30 + 84} ${ky} L${d * 30 + 80} -8 L${d * 30 + 128} -8 L${d * 30 + 124} ${ky}Z`} fill={look.pants} {...OUT} />
        <path d={`M${d * 30 + 72} -12 Q${d * 30 + 70} 4 ${d * 30 + 88} 4 L${d * 30 + 150} 4 Q${d * 30 + 150} -14 ${d * 30 + 128} -16Z`} fill="#ececec" {...OUT} />
      </g>;
    }
    const a = moving ? Math.sin(ph) * stride * d : 0;
    return <g key={d} transform={`rotate(${a} ${d * 24} ${hipY})`}>
      <path d={`M${d * 24 - 27} ${hipY} L${d * 24 + 27} ${hipY} L${d * 26 + 24} -14 L${d * 26 - 24} -14Z`} fill={look.pants} {...OUT} />
      <path d={`M${d * 26 - 30} -16 Q${d * 26 - 34} 4 ${d * 26 - 10} 4 L${d * 26 + 44} 4 Q${d * 26 + 44} -16 ${d * 26 + 22} -18Z`} fill="#ececec" {...OUT} />
    </g>;
  };
  const arm = (d: number) => {
    const [hx, hy] = d > 0 ? handR : handL;
    const up = d > 0 && (phone || raise);
    const ex = up ? 104 : clap ? d * 70 : d * (sh + 6), ey = up ? shY + 140 : shY + 130;
    const p = `M${d * (sh - 8)} ${shY + 20} Q${ex + d * 16} ${ey - 50} ${ex} ${ey} L${hx} ${hy}`;
    return <g key={d}>
      <path d={p} stroke={INK} strokeWidth={56} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={p} stroke={d > 0 ? look.top : look.topShade} strokeWidth={47} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={hx} cy={hy + 14} rx={19} ry={22} fill={SKIN} {...OUT} />
    </g>;
  };
  const w = sh + 4;
  return (
    <g transform={`translate(${x + jx} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o}>
      <ellipse cx={0} cy={2} rx={sit || floor ? 200 : 120} ry={16} fill="#000" opacity={0.45} filter="url(#wsoft)" />
      <g transform={`translate(0 ${bob})`}>
        {[-1, 1].map(leg)}
        {arm(-1)}
        <path d={`M-${w} ${shY + 18} Q-${w + 12} ${shY + 120} -${w - 4} ${hipY + 30} Q0 ${hipY + 46} ${w - 4} ${hipY + 30} Q${w + 12} ${shY + 120} ${w} ${shY + 18} Q0 ${shY - 22} -${w} ${shY + 18}Z`} fill={look.top} {...OUT} />
        <path d={`M20 ${shY + 10} Q${w - 4} ${shY + 120} ${w - 12} ${hipY + 30} Q${w} ${hipY + 32} ${w - 4} ${hipY + 30} Q${w + 12} ${shY + 120} ${w} ${shY + 18}Z`} fill={look.topShade} opacity={0.8} />
        {look.jacket ? <>
          <path d={`M-30 ${shY + 4} L-14 ${hipY + 40} L14 ${hipY + 40} L30 ${shY + 4} Q0 ${shY + 30} -30 ${shY + 4}Z`} fill="#f1efe8" {...OUT} />
          <path d={`M-30 ${shY + 4} L-52 ${shY + 70} L-22 ${shY + 90} M30 ${shY + 4} L52 ${shY + 70} L22 ${shY + 90}`} {...LINE} strokeWidth={3.5} />
        </> : look.girl ? <path d={`M-34 ${shY + 6} Q0 ${shY + 50} 34 ${shY + 6}`} {...LINE} fill={SKIN} />
          : look.hair === 'boy' ? <>
            <path d={`M-46 ${hipY - 40} Q0 ${hipY - 52} 46 ${hipY - 40} L54 ${hipY + 8} M-46 ${hipY - 40} L-54 ${hipY + 8}`} {...LINE} strokeWidth={2.8} />
            <path d={`M-60 ${shY + 6} Q0 ${shY + 64} 60 ${shY + 6} Q0 ${shY + 30} -60 ${shY + 6}Z`} fill={look.topShade} {...OUT} />
            {[-14, 14].map((d) => <path key={d} d={`M${d} ${shY + 36} q${d * 0.2} 40 ${d * 0.4} 70`} stroke="#d8d8d8" strokeWidth={4} fill="none" strokeLinecap="round" />)}
          </> : <path d={`M-30 ${shY + 8} Q0 ${shY + 40} 30 ${shY + 8}`} {...LINE} />}
        <path d={`M-${w - 4} ${hipY + 18} Q0 ${hipY + 34} ${w - 4} ${hipY + 18}`} {...LINE} strokeWidth={2.6} />
        {arm(1)}
        {holdL && <g transform={`translate(${handL[0]} ${handL[1]})`}>{holdL}</g>}
        {hold && <g transform={`translate(${handR[0]} ${handR[1]})`}>{hold}</g>}
        {phone > 0 && <g transform={`translate(${handR[0]} ${handR[1]}) rotate(-8)`}>
          <rect x={-22} y={-44} width={44} height={80} rx={8} fill="#111" stroke={INK} strokeWidth={3} />
          <rect x={-17} y={-38} width={34} height={66} rx={4} fill={glowCol ?? '#7fa6ff'} opacity={0.5 * phone} />
        </g>}
        <g transform={`translate(0 ${headY}) rotate(${tilt} 0 110) scale(1.3)`}>
          <Head look={look} mood={m} gaze={gaze} tears={tears} blush={blush} glow={glow || phone * 0.9} glowCol={glowCol} t={t} />
        </g>
      </g>
    </g>
  );
};

// ---------- props held in hands ----------
export const Flowers: React.FC = () => <g transform="rotate(-20)">
  <path d="M0 0 L-6 -90" stroke="#3d6b3a" strokeWidth={6} />
  {[[-20, -100], [6, -112], [-4, -128], [16, -96], [-28, -120]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill={i % 2 ? '#e0405a' : '#f06a80'} {...OUT} strokeWidth={3} />)}
  <path d="M-16 -40 L16 -40 L6 10 L-6 10Z" fill="#f2e6c8" {...OUT} strokeWidth={3} />
</g>;
export const Trophy: React.FC = () => <g>
  <path d="M-30 -110 L30 -110 Q30 -60 0 -50 Q-30 -60 -30 -110Z" fill="#e8b84a" {...OUT} strokeWidth={3.5} />
  <rect x={-6} y={-52} width={12} height={30} fill="#d4a03a" {...OUT} strokeWidth={3} />
  <rect x={-22} y={-24} width={44} height={14} rx={3} fill="#3a2a1a" {...OUT} strokeWidth={3} />
</g>;
export const Mic: React.FC = () => <g><rect x={-7} y={-60} width={14} height={50} rx={4} fill="#222" {...OUT} strokeWidth={3} /><circle cx={0} cy={-66} r={13} fill="#555" {...OUT} strokeWidth={3} /></g>;
export const Keys: React.FC = () => <g><circle cx={0} cy={-8} r={9} fill="none" stroke="#bbb" strokeWidth={3} /><rect x={-10} y={-2} width={20} height={30} rx={6} fill="#1a1a1a" {...OUT} strokeWidth={2.5} /></g>;
export const Book: React.FC = () => <g transform="rotate(-10)"><path d="M-60 -60 L0 -50 L60 -60 L60 0 L0 10 L-60 0Z" fill="#f4efe2" {...OUT} strokeWidth={3.5} /><line x1={0} y1={-50} x2={0} y2={10} stroke={INK} strokeWidth={3} /></g>;
export const Bar: React.FC<{w?: number}> = ({w = 520}) => <g>
  <rect x={-w / 2} y={-8} width={w} height={16} rx={6} fill="#9a9aa2" {...OUT} strokeWidth={3} />
  {[-1, 1].map((d) => <g key={d}><rect x={d * w / 2 - (d > 0 ? 60 : 0)} y={-80} width={36} height={160} rx={8} fill="#1d1d22" {...OUT} strokeWidth={3} /><rect x={d * w / 2 - (d > 0 ? 24 : -36)} y={-60} width={24} height={120} rx={6} fill="#2a2a30" {...OUT} strokeWidth={3} /></g>)}
</g>;

// ---------- full-frame inserts ----------
// a big drawn hand holding a phone; children = screen content (HTML, 460×900)
export const PhoneInsert: React.FC<{t: number; at: number; children: React.ReactNode; tilt?: number; thumb?: number}> = ({t, at, children, tilt = -4, thumb = 0}) => {
  const k = ease(t, at, at + 0.5, Easing.out(Easing.cubic));
  const bobY = Math.sin(t * 1.3) * 6;
  return <AbsoluteFill style={{transform: `translateY(${(1 - k) * 140 + bobY}px) rotate(${tilt}deg) scale(${1.02 + (t - at) * 0.006})`}}>
    <div style={{position: 'absolute', left: 730, top: 70, width: 500, height: 980, borderRadius: 60, background: '#0c0c0f', border: `6px solid ${INK}`, boxShadow: '0 40px 120px rgba(0,0,0,0.7)'}}>
      <div style={{position: 'absolute', left: 20, top: 20, right: 20, bottom: 20, borderRadius: 42, overflow: 'hidden', background: '#f6f6f8'}}>{children}</div>
      <div style={{position: 'absolute', left: 200, top: 30, width: 100, height: 26, borderRadius: 14, background: '#0c0c0f'}} />
    </div>
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      {/* palm + fingers wrapping the phone from the bottom right */}
      <path d="M1180 1100 Q1240 820 1236 700 Q1238 640 1200 640 Q1170 642 1168 700 L1160 800 Q1100 860 1040 880 Q960 900 900 1100Z" fill={SKIN} {...OUT} strokeWidth={6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M1232 ${720 + i * 70} q40 0 40 30 q0 30 -40 30`} fill={SKIN} {...OUT} strokeWidth={5} />)}
      <g transform={`translate(${-thumb * 30} ${-thumb * 120})`}><path d="M760 1100 Q760 900 820 820 Q860 780 890 810 Q900 840 870 880 Q840 940 860 1100Z" fill={SKIN} {...OUT} strokeWidth={6} /></g>
    </svg>
  </AbsoluteFill>;
};

const appBar = (title: string, sub?: string) => <div style={{height: 120, paddingTop: 52, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 22, borderBottom: '1px solid #ddd', background: '#fff'}}>
  <div style={{width: 52, height: 52, borderRadius: 26, background: 'linear-gradient(135deg,#f6a,#a6f)'}} />
  <div><div style={{fontFamily: SANS, fontWeight: 800, fontSize: 26, color: '#111'}}>{title}</div>{sub && <div style={{fontFamily: SANS, fontSize: 18, color: '#888'}}>{sub}</div>}</div>
</div>;

export type Msg = {at: number; me?: boolean; text: string};
export const ChatScreen: React.FC<{t: number; name: string; msgs: Msg[]; seen?: {at: number; text: string}; typing?: [number, number]}> = ({t, name, msgs, seen, typing}) => (
  <div style={{position: 'absolute', inset: 0, background: '#f2f2f5'}}>
    {appBar(name, 'online')}
    <div style={{position: 'absolute', left: 18, right: 18, top: 150, display: 'flex', flexDirection: 'column', gap: 12}}>
      {msgs.filter((m) => t >= m.at).map((m, i) => {
        const k = ease(t, m.at, m.at + 0.25, Easing.out(Easing.back(2)));
        return <div key={i} style={{alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '78%', padding: '14px 20px', borderRadius: 26, background: m.me ? '#2f7bf6' : '#fff', color: m.me ? '#fff' : '#111', fontFamily: SANS, fontSize: 28, fontWeight: 600, transform: `scale(${k})`, transformOrigin: m.me ? 'right bottom' : 'left bottom', boxShadow: '0 2px 6px rgba(0,0,0,0.08)'}}>{m.text}</div>;
      })}
      {typing && t >= typing[0] && t < typing[1] && <div style={{alignSelf: 'flex-start', padding: '14px 22px', borderRadius: 26, background: '#fff', fontSize: 30, color: '#999', fontFamily: SANS}}>{'•'.repeat(1 + (Math.floor(t * 4) % 3))}</div>}
      {seen && t >= seen.at && <div style={{alignSelf: 'flex-end', fontFamily: SANS, fontSize: 20, color: '#888', opacity: ease(t, seen.at, seen.at + 0.3)}}>{seen.text}</div>}
    </div>
    <div style={{position: 'absolute', left: 18, right: 18, bottom: 26, height: 64, borderRadius: 32, background: '#fff', border: '1px solid #ddd', fontFamily: SANS, fontSize: 24, color: '#aaa', display: 'flex', alignItems: 'center', paddingLeft: 24}}>Message…</div>
  </div>
);

// mini line-art head used inside phone photos
export const MiniHead: React.FC<{look: Look; mood?: Mood; x: number; y: number; s?: number; tilt?: number}> = ({look, mood = 'smile', x, y, s = 0.5, tilt = 0}) =>
  <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
    <path d="M-100 260 Q-100 120 0 110 Q100 120 100 260Z" fill={look.top} {...OUT} />
    <Head look={look} mood={mood} />
  </g>;

export const PhotoScreen: React.FC<{bg: string; caption?: string; children: React.ReactNode; top?: string; captionY?: number}> = ({bg, caption, children, top, captionY = 640}) => (
  <div style={{position: 'absolute', inset: 0, background: bg}}>
    <svg viewBox="0 0 460 900" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>{children}</svg>
    {top && <div style={{position: 'absolute', top: 60, left: 22, right: 22, display: 'flex', alignItems: 'center', gap: 12}}>
      <div style={{width: 46, height: 46, borderRadius: 23, border: '3px solid #f6a', background: '#ddd'}} />
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 24, color: '#fff', textShadow: '0 2px 6px #000'}}>{top}</div>
    </div>}
    {top && <div style={{position: 'absolute', top: 40, left: 22, right: 22, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.4)'}}><div style={{width: '60%', height: '100%', background: '#fff', borderRadius: 3}} /></div>}
    {caption && <div style={{position: 'absolute', top: captionY, left: 0, right: 0, textAlign: 'center'}}><span style={{fontFamily: SANS, fontWeight: 900, fontSize: 40, color: '#111', background: '#fff', padding: '6px 18px', borderRadius: 10}}>{caption}</span></div>}
  </div>
);

export const CalendarInsert: React.FC<{t: number; steps: [number, string][]; label?: string; cross?: boolean}> = ({t, steps, label = 'DAY', cross}) => {
  let i = 0; steps.forEach(([a], j) => { if (t >= a) i = j; });
  const [a, text] = steps[i];
  const flip = ease(t, a, a + 0.25, Easing.out(Easing.cubic));
  return <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: 640, height: 640, background: '#f7f4ec', border: `6px solid ${INK}`, borderRadius: 24, boxShadow: '0 40px 100px rgba(0,0,0,0.6)', transform: `rotate(-3deg) perspective(900px) rotateX(${(1 - flip) * -60}deg)`, transformOrigin: 'top', overflow: 'hidden'}}>
      <div style={{height: 150, background: '#c4373f', borderBottom: `6px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 70, color: '#fff', letterSpacing: 8}}>{label}</div>
      <div style={{height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: text.length > 3 ? 210 : 280, color: INK, position: 'relative'}}>
        {text}
        {cross && <svg viewBox="0 0 640 480" style={{position: 'absolute', inset: 0}}><path d="M120 80 L520 400 M520 80 L120 400" stroke="#c4373f" strokeWidth={22} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ease(t, a + 0.3, a + 0.7))} /></svg>}
      </div>
    </div>
  </AbsoluteFill>;
};

export const ClockInsert: React.FC<{t: number; text: string}> = ({t, text}) => <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
  <div style={{padding: '50px 90px', background: '#111114', border: `6px solid ${INK}`, borderRadius: 36, boxShadow: '0 0 120px rgba(255,40,50,0.25)', transform: `scale(${1 + t * 0.01})`}}>
    <div style={{fontFamily: 'monospace', fontWeight: 700, fontSize: 220, color: '#ff3344', textShadow: '0 0 40px #ff3344'}}>{text}</div>
  </div>
</AbsoluteFill>;

export const Whiteboard: React.FC<{t: number; at: number; title: string; items: string[]; per?: number}> = ({t, at, title, items, per = 0.55}) => {
  const n = items.length;
  const cur = Math.min(n - 1, Math.max(0, Math.floor((t - at - 0.6) / per)));
  const hy = 330 + cur * 82, hx = 300 + Math.min(1, ((t - at - 0.6) % per) / per) * items[cur].length * 26;
  return <AbsoluteFill>
    <div style={{position: 'absolute', left: 150, top: 90, width: 1620, height: 900, background: '#fbfbf8', border: '18px solid #b9bcc2', borderRadius: 10, boxShadow: '0 30px 80px rgba(0,0,0,0.5)'}}>
      <div style={{position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontFamily: HAND, fontSize: 110, color: INK, opacity: ease(t, at, at + 0.4)}}>{title}</div>
      {items.map((it, i) => {
        const a = at + 0.6 + i * per;
        const nch = Math.ceil(it.length * ease(t, a, a + per * 0.9, Easing.linear));
        return <div key={i} style={{position: 'absolute', left: 140, top: 210 + i * 82, fontFamily: HAND, fontSize: 64, color: '#1d3f8f'}}>{t >= a ? '- ' + it.slice(0, nch) : ''}</div>;
      })}
    </div>
    {t < at + 0.6 + n * per && t > at + 0.6 && <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${hx} ${hy + Math.sin(t * 40) * 4})`}>
        <rect x={-10} y={-90} width={22} height={100} rx={6} fill="#1d3f8f" {...OUT} strokeWidth={3} transform="rotate(30)" />
        <path d="M10 0 Q60 10 90 60 Q120 140 60 200 L-60 200 Q-40 90 10 0Z" fill={SKIN} {...OUT} strokeWidth={5} />
      </g>
    </svg>}
  </AbsoluteFill>;
};

export const StatCards: React.FC<{t: number; at: number}> = ({t, at}) => {
  const fund = ease(t, at + 0.3, at + 1.4);
  const subs = Math.round(1_000_000 * ease(t, at + 1.8, at + 3.6, Easing.out(Easing.cubic)));
  const card = (k: number): React.CSSProperties => ({width: 700, height: 520, background: '#fff', border: `6px solid ${INK}`, borderRadius: 30, boxShadow: '0 30px 90px rgba(0,0,0,0.5)', padding: 50, transform: `translateY(${(1 - k) * 200}px)`, opacity: k});
  return <AbsoluteFill style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 80}}>
    <div style={card(ease(t, at, at + 0.5))}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#777'}}>SEED ROUND · CLOSED</div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#16a34a', marginTop: 50}}>${Math.round(2_000_000 * fund).toLocaleString('en-US')}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: INK, marginTop: 40, opacity: ease(t, at + 1.4, at + 1.7)}}>✓ funded</div>
    </div>
    <div style={card(ease(t, at + 1.5, at + 2))}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: '#777'}}>YOUR CHANNEL</div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 120, color: '#e11d2a', marginTop: 50}}>{subs.toLocaleString('en-US')}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: INK, marginTop: 40}}>subscribers</div>
    </div>
  </AbsoluteFill>;
};

export const Rain: React.FC<{t: number; o?: number}> = ({t, o = 0.5}) => (
  <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 90}, (_, i) => {
      const x = rnd(i) * 2100 - 90, sp = 1400 + rnd(i + 3) * 600;
      const y = ((rnd(i + 7) * 1200 + t * sp) % 1300) - 150;
      return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 60} stroke="#cfe0ff" strokeWidth={2} opacity={o * (0.4 + rnd(i + 1) * 0.6)} />;
    })}
  </svg>
);

export const WojakDefs: React.FC = () => <defs>
  <filter id="wsoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" /></filter>
  <radialGradient id="wFaceGlow" cx="0.5" cy="0.75" r="0.7"><stop offset="0" stopColor="#9fc0ff" stopOpacity={0.55} /><stop offset="1" stopColor="#9fc0ff" stopOpacity={0} /></radialGradient>
  <filter id="gNight"><feColorMatrix type="matrix" values="0.72 0 0 0 0.01  0 0.76 0 0 0.02  0 0 0.88 0 0.05  0 0 0 1 0" /></filter>
  <filter id="gWarm"><feColorMatrix type="matrix" values="1 0 0 0 0.02  0 0.94 0 0 0.01  0 0 0.84 0 0  0 0 0 1 0" /></filter>
  <filter id="gDay"><feColorMatrix type="matrix" values="0.96 0 0 0 0  0 0.96 0 0 0  0 0 0.96 0 0  0 0 0 1 0" /></filter>
  <filter id="gNeon"><feColorMatrix type="matrix" values="0.8 0 0 0 0.04  0 0.7 0 0 0  0 0 0.9 0 0.06  0 0 0 1 0" /></filter>
</defs>;

export {win, mix, ease};
