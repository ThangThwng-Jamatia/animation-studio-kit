// shortKit: the shared shell + helpers for Fable shorts built on motionKit (2026-11-04).
// FableFrame = grade, grain, vignette, captions, voice, music, SFX. reframe() = a word-timed camera key about once a second.
import React from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {CamKey, Captions, Chunk, CL, INK, KitDefs, Motes, rnd, Scene, SceneStack, shakeAt, Word} from './motionKit';

export const Sky: React.FC<{id: string; stops: [number, string][]}> = ({id, stops}) => <>
  <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}</linearGradient></defs>
  <rect x={-1800} y={-2400} width={5600} height={6800} fill={`url(#${id})`} />
</>;
export const Glow: React.FC<{x: number; y: number; r: number; c: string; o?: number; id: string}> = ({x, y, r, c, o = 0.5, id}) => <>
  <defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity={o} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient></defs>
  <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
</>;
// a camera key on the first word after `every` seconds, cycling through anchors [x, y, z, roll]
export const reframe = (words: Word[], a: number, b: number, anchors: [number, number, number, number?][], every = 1.0, d = 0.55): CamKey[] => {
  const k = (t: number, i: number, dd?: number): CamKey => { const [x, y, z, r = 0] = anchors[i % anchors.length]; return {t, x, y, z, r, d: dd}; };
  const keys = [k(a, 0)];
  let last = a, i = 1;
  for (const [, s] of words) if (s > a + 0.25 && s < b - 0.2 && s - last >= every) { keys.push(k(s, i++, d)); last = s; }
  return keys;
};
// always-on rising bubbles
export const Bubbles: React.FC<{t: number; n?: number; x?: number; y?: number; w?: number; h?: number; seed?: number; o?: number}> = ({t, n = 24, x = -200, y = -200, w = 1500, h = 2400, seed = 0, o = 0.7}) =>
  <g opacity={o}>{Array.from({length: n}, (_, i) => {
    const sp = 60 + rnd(i * 3 + seed) * 150, py = y + h - ((rnd(i * 7 + seed) * h + t * sp) % h), px = x + rnd(i + seed) * w + Math.sin(t * 2 + i) * 16, r = 4 + rnd(i * 5 + seed) * 13;
    return <g key={i}><circle cx={px} cy={py} r={r} fill="#bfefff" fillOpacity={0.12} stroke="#d8f6ff" strokeWidth={2.5} /><circle cx={px - r * 0.3} cy={py - r * 0.3} r={r * 0.22} fill="#fff" /></g>;
  })}</g>;
// moving light ripples on a surface
export const Caustics: React.FC<{t: number; c?: string; o?: number; y?: number; h?: number}> = ({t, c = '#8fe6e0', o = 0.1, y = -400, h = 2600}) =>
  <g opacity={o} filter="url(#soft)">{Array.from({length: 11}, (_, i) => {
    const yy = y + (i / 11) * h + Math.sin(t * 0.8 + i) * 30, a = Math.sin(t * 1.2 + i * 1.7) * 70;
    return <path key={i} d={`M-500 ${yy} Q0 ${yy + a} 540 ${yy - a * 0.6} T1700 ${yy + a * 0.5}`} stroke={c} strokeWidth={18} fill="none" />;
  })}</g>;
// a label plate drawn in the top safe band (feed-look: one badge at a time)
export const Badge: React.FC<{k: number; text: string; font: string; bg?: string; fg?: string; size?: number; top?: number}> = ({k, text, font, bg = '#c8322f', fg = '#fff', size = 76, top = 296}) =>
  k <= 0 ? null : <div style={{position: 'absolute', left: 0, right: 140, top, textAlign: 'center', transform: `scale(${k})`}}>
    <div style={{display: 'inline-block', background: bg, border: `6px solid ${INK}`, borderRadius: 16, padding: '6px 30px', fontFamily: font, fontWeight: 900, fontSize: size, color: fg, letterSpacing: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>{text}</div>
  </div>;

export const FableFrame: React.FC<{scenes: Scene[]; sec: number; job: string; chunks: Chunk[]; keys: Record<string, string>; font: string; hits: [number, number][]; sfx: [number, string, number][]; defs?: React.ReactNode; over?: (t: number) => React.ReactNode; grade?: string; music?: number; mote?: string; float?: number; mute?: boolean}> =
({scenes, sec, job, chunks, keys, font, hits, sfx, defs, over, grade = 'saturate(0.86) contrast(1.06)', music = 0.2, mote = '#fff3d6', float = 1, mute}) => {
  const f = useCurrentFrame(), {fps} = useVideoConfig(), t = f / fps;
  const [sx, sy] = shakeAt(t, f, hits);
  // handheld float on top of the scene camera: the inspo drifts 1–3 px a frame even in held shots
  const hx = (Math.sin(t * 1.5) * 12 + Math.sin(t * 3.1 + 1) * 6 + Math.sin(t * 2.3 + 2) * 7) * float, hy = (Math.sin(t * 1.9 + 1) * 10 + Math.sin(t * 3.7) * 5 + Math.sin(t * 2.7 + 0.5) * 7) * float, hr = Math.sin(t * 1.1) * 0.7 * float, hz = 1.03 + 0.012 * float + Math.sin(t * 0.8) * 0.012;
  return <AbsoluteFill style={{background: '#000'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <KitDefs />{defs}
      <g transform={`translate(${540 + sx + hx} ${960 + sy + hy}) rotate(${hr}) scale(${hz}) translate(-540 -960)`}><SceneStack scenes={scenes} t={t} /></g>
      {/* drifting haze (feed-look §1 "air"): the frame never rests, even on a flat dark shot */}
      <g filter="url(#beam)" style={{mixBlendMode: 'screen'}}>{[0, 1, 2, 3].map((i) => { const x = ((t * (46 + i * 19) + i * 420) % 1700) - 300, y = 300 + i * 390 + Math.sin(t * 0.9 + i * 2) * 120; return <ellipse key={i} cx={x} cy={y} rx={300 + i * 40} ry={130 + i * 22} fill={mote} opacity={0.1 + 0.04 * Math.sin(t * 1.7 + i)} />; })}</g>
      <Motes t={t} n={34} c={mote} seed={21} />
      <rect width={1080} height={1920} filter="url(#grainF)" opacity={0.07} transform={`translate(${(f % 3) * 7} ${(f % 2) * 5})`} style={{mixBlendMode: 'overlay'}} />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.6) 100%)'}} />
    <AbsoluteFill style={{backdropFilter: grade}} />
    {over?.(t)}
    <Captions t={t} chunks={chunks} keys={keys} font={font} y={1110} />
    {/* mute: sound comes from scripts/mix_sound.py and is muxed in at mastering, so a mix change needs no re-render */}
    {!mute && <Audio src={staticFile(`${job}/voice.mp3`)} />}
    {!mute && <Audio src={staticFile(`${job}/music.wav`)} volume={(fr) => interpolate(fr / fps, [0, 0.6, sec - 1.2, sec], [0, music, music, 0], CL)} />}
    {!mute && sfx.map(([at, name, v], j) => <Sequence key={j} from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(3 * fps)}><Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>)}
  </AbsoluteFill>;
};
