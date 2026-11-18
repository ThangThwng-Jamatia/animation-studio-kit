// Shared kit for 3D Facts shorts (2026-11-16), lifted from FactTickle so new films don't copy-paste it:
// materials, canvas textures, glows, motes, fresnel glass, self-drawing paths + flow dots, the orbiting shot camera,
// the overlay layer (pill, ring, icon, compare bars, badge) and one-word captions. Viral Shorts Standard rules live in the films.
import React from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {Cam, FONT, mix, mix3, pop, rnd, V3} from '../day/dayKit';
import {Mat, TEX} from './buildKit';

export const PI = Math.PI;
export const ORANGE = '#ff8a3a', TEAL = '#2f8a96', GOLD = '#ffc23a', RED = '#ff4d4d', GREEN = '#5ee08a', BLUE = '#5fd0ff', PINK = '#ff7ab0';
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
export const wordClock = (WORDS: [string, number, number][]) => (w: string, n = 1) => {
  const m = WORDS.filter((x) => norm(x[0]) === w); if (!m[n - 1]) throw new Error(`no word ${w} #${n}`); return m[n - 1][1];
};

// ---------- materials + geometry ----------
export const M: React.FC<{c: string; e?: number; o?: number; r?: number; m?: number; side?: THREE.Side}> = ({c, e = 0, o = 1, r = 0.8, m = 0, side}) =>
  <meshStandardMaterial color={c} emissive={c} emissiveIntensity={e} roughness={r} metalness={m} transparent={o < 1} opacity={o} side={side} depthWrite={o > 0.6} />;
const rcache: Record<string, THREE.BufferGeometry> = {};
export const rbox = (w: number, h: number, d: number, r: number) => (rcache[`${w},${h},${d},${r}`] ??= new RoundedBoxGeometry(w, h, d, 4, r));
const tcache: Record<string, THREE.CanvasTexture> = {};
export const ctex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep?: [number, number]) => {
  if (tcache[key]) return tcache[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  if (rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); }
  return (tcache[key] = tx);
};
export const tileTex = (base: string, line: string, key: string, n: number) => ctex(key, 256, 256, (g) => {
  g.fillStyle = base; g.fillRect(0, 0, 256, 256); g.strokeStyle = line; g.lineWidth = 6; g.strokeRect(3, 3, 250, 250); g.lineWidth = 2; g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke();
}, [n, n]);
export const glowTex = () => ctex('glow', 256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
export const Glow: React.FC<{p: V3; s: number; col: string; o?: number; top?: boolean}> = ({p, s, col, o = 1, top}) =>
  <sprite position={p} scale={[s, s, s]} renderOrder={top ? 20 : 0}><spriteMaterial map={glowTex()} color={col} transparent opacity={Math.max(0, Math.min(1, o))} depthWrite={false} depthTest={!top} blending={THREE.AdditiveBlending} /></sprite>;
export const Motes: React.FC<{t: number; c: V3; sz: V3; n?: number; col?: string; up?: number}> = ({t, c, sz, n = 40, col = '#fff2d0', up = 0.05}) => <>{Array.from({length: n}, (_, i) => {
  const x = c[0] + (rnd(i) - 0.5) * sz[0] + Math.sin(t * 0.4 + i) * 0.08, y = c[1] + ((((rnd(i * 3) * sz[1] + t * up * (0.5 + rnd(i))) % sz[1]) + sz[1]) % sz[1]) - sz[1] / 2, z = c[2] + (rnd(i * 7) - 0.5) * sz[2];
  return <Glow key={i} p={[x, y, z]} s={0.03 + rnd(i * 5) * 0.03} col={col} o={0.5 + 0.4 * Math.sin(t * 2 + i)} />;
})}</>;
export const Box: React.FC<{p: V3; s: V3; c?: string; tex?: keyof typeof TEX; rep?: [number, number]; r?: V3; e?: number; m?: number; ro?: number}> = ({p, s, c = '#fff', tex, rep, r, e = 0, m = 0, ro = 0.8}) =>
  <mesh position={p} rotation={r} castShadow receiveShadow><boxGeometry args={s} />{tex ? <Mat tex={tex} color={c} rep={rep} /> : <M c={c} e={e} m={m} r={ro} />}</mesh>;

// ---------- fresnel glass (a flat-opacity shell is invisible) ----------
export const glassMat = (col = '#ffe2cf', o = 0.2) => new THREE.ShaderMaterial({transparent: true, depthWrite: false, uniforms: {c: {value: new THREE.Color(col)}, o: {value: o}},
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 c; uniform float o; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0); gl_FragColor = vec4(c * (0.8 + f * 0.6), clamp(o * 0.35 + f * o * 3.6, 0.0, 0.9)); }'});

// ---------- self-drawing tube paths + flowing dots ----------
const tubeCache: Record<string, THREE.TubeGeometry> = {};
const tube = (key: string, c: THREE.Curve<THREE.Vector3>, r: number) => (tubeCache[key] ??= new THREE.TubeGeometry(c, 96, r, 10, false));
export const Path: React.FC<{id: string; curve: THREE.Curve<THREE.Vector3>; k: number; col: string; o?: number; r?: number; top?: boolean}> = ({id, curve, k, col, o = 1, r = 0.014, top = true}) => {
  if (k <= 0.001 || o <= 0.001) return null;
  const g1 = tube(id + 'a' + r, curve, r), g2 = tube(id + 'b' + r, curve, r * 2.8);
  g1.setDrawRange(0, Math.floor((g1.index!.count * Math.min(1, k)) / 6) * 6); g2.setDrawRange(0, Math.floor((g2.index!.count * Math.min(1, k)) / 6) * 6);
  return <><mesh geometry={g1} renderOrder={12}><meshBasicMaterial color={col} transparent opacity={o} depthTest={!top} depthWrite={false} toneMapped={false} /></mesh>
    <mesh geometry={g2} renderOrder={11}><meshBasicMaterial color={col} transparent opacity={0.35 * o} depthTest={!top} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh></>;
};
export const Flow: React.FC<{curve: THREE.Curve<THREE.Vector3>; t: number; n: number; speed: number; col: string; o?: number; s?: number}> = ({curve, t, n, speed, col, o = 1, s = 0.07}) => <>{Array.from({length: n}, (_, i) => {
  const u = ((t * speed + i / n) % 1 + 1) % 1, p = curve.getPointAt(Math.min(0.999, u)), f = Math.sin(PI * u);
  return <Glow key={i} p={[p.x, p.y, p.z]} s={s} col={col} o={o * f} top />;
})}</>;
export const curve = (pts: V3[]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));

// ---------- camera: every shot travels (expo-out start + steady glide + ~20° orbit + handheld) ----------
// a/b = [pos, look] at start/end. follow (optional) = a moving point added to both (track a falling car etc.)
export type Shot = {from: number; to: number; a: [V3, V3]; b: [V3, V3]; fov?: [number, number]; orbit?: number; follow?: (t: number) => V3; set?: string};
export const makeCam = (SHOTS: Shot[], SHAKE: [number, number, number][] = [], hh = 0.05) => {
  const shotAt = (t: number) => SHOTS.find((x) => t >= x.from && t < x.to) ?? SHOTS[SHOTS.length - 1];
  const glide = (t: number, s: Shot) => { const u = (t - s.from) / Math.max(0.01, s.to - s.from); const fast = 1 - Math.pow(1 - Math.min(1, (t - s.from) / 0.55), 3); return Math.min(1, 0.5 * fast + 0.5 * Math.min(1, u)); };
  const camAt = (t: number): Cam => {
    const s = shotAt(t), k = glide(t, s), off = s.follow ? s.follow(t) : [0, 0, 0] as V3;
    const p0 = mix3(s.a[0], s.b[0], k), look = mix3(s.a[1], s.b[1], k);
    const i = SHOTS.indexOf(s), ang = (i % 2 ? 1 : -1) * (s.orbit ?? 0.36) * (k - 0.5);
    const dx = p0[0] - look[0], dz = p0[2] - look[2];
    const pos: V3 = [look[0] + dx * Math.cos(ang) - dz * Math.sin(ang), p0[1], look[2] + dx * Math.sin(ang) + dz * Math.cos(ang)];
    const sh = SHAKE.reduce((a, [at, d, amp]) => a + (t >= at && t < at + d ? amp * (1 - (t - at) / d) : 0), 0);
    return {pos: [off[0] + pos[0] + Math.sin(t * 0.9) * hh + Math.sin(t * 2.3 + 1) * hh * 0.5 + Math.sin(t * 47) * sh, off[1] + pos[1] + Math.sin(t * 1.3) * hh * 0.8 + Math.sin(t * 2.9) * hh * 0.4 + Math.sin(t * 53) * sh, off[2] + pos[2] + Math.sin(t * 0.7) * hh],
      look: [off[0] + look[0] + Math.sin(t * 1.7) * 0.03, off[1] + look[1] + Math.sin(t * 2.1 + 1) * 0.025, off[2] + look[2]], fov: s.fov ? mix(s.fov[0], s.fov[1], k) : 50};
  };
  return {shotAt, camAt};
};

// ---------- overlay pieces (HTML, inside the IG safe zone) ----------
export const Pill: React.FC<{k: number; text: string; col?: string}> = ({k, text, col = GOLD}) => k <= 0 ? null :
  <div style={{transform: `scale(${k})`, display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(10,16,30,0.82)', border: `3px solid ${col}`, borderRadius: 999, padding: '12px 34px',
    color: col, fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: 2, whiteSpace: 'nowrap', boxShadow: `0 10px 30px rgba(0,0,0,0.45), 0 0 30px ${col}44`}}>{text}</div>;
export const RingO: React.FC<{x: number; y: number; r: number; col: string; k: number; t: number}> = ({x, y, r, col, k, t}) => k <= 0 ? null :
  <div style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', border: `8px solid ${col}`, boxShadow: `0 0 26px ${col}, inset 0 0 20px ${col}66`,
    transform: `scale(${k * (1 + 0.06 * Math.sin(t * 8))})`, opacity: Math.min(1, k * 1.4)}} />;
// ✓ / ✕ badge pinned to a screen point
export const Icon: React.FC<{x: number; y: number; ok: boolean; k: number; s?: number}> = ({x, y, ok, k, s = 120}) => k <= 0 ? null :
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: ok ? GREEN : RED, border: '6px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transform: `scale(${k})`, boxShadow: `0 8px 24px rgba(0,0,0,0.45), 0 0 24px ${ok ? GREEN : RED}`, color: 'white', fontFamily: FONT, fontWeight: 900, fontSize: s * 0.62, lineHeight: 1}}>{ok ? '✓' : '✕'}</div>;
// red arrow pushing in toward (x,y) from angle a (radians, screen space)
export const Arrow: React.FC<{x: number; y: number; a: number; k: number; t: number; col?: string; len?: number}> = ({x, y, a, k, t, col = RED, len = 150}) => k <= 0 ? null : (() => {
  const push = 18 * Math.sin(t * 9), d = 40 + push + (1 - k) * 80;
  const ex = x - Math.cos(a) * d, ey = y - Math.sin(a) * d, sx = ex - Math.cos(a) * len * k, sy = ey - Math.sin(a) * len * k;
  const hx = (q: number) => ex + Math.cos(a + q) * -46, hy = (q: number) => ey + Math.sin(a + q) * -46;
  return <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
    <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="white" strokeWidth={26} strokeLinecap="round" opacity={0.9 * k} />
    <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={col} strokeWidth={16} strokeLinecap="round" opacity={k} />
    <path d={`M${ex + Math.cos(a) * 14} ${ey + Math.sin(a) * 14} L${hx(0.55)} ${hy(0.55)} L${hx(-0.55)} ${hy(-0.55)} Z`} fill={col} stroke="white" strokeWidth={5} opacity={k} />
  </svg>;
})();
// labelled horizontal bars (speed compare etc.)
export const Bars: React.FC<{k: number; rows: {label: string; v: number; col: string; val: string}[]}> = ({k, rows}) => k <= 0 ? null :
  <div style={{transform: `scale(${k})`, background: 'rgba(10,16,30,0.82)', borderRadius: 26, padding: '20px 26px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.45)'}}>
    {rows.map((r, i) => <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: 'white', width: 130, letterSpacing: 1}}>{r.label}</span>
      <div style={{width: 420, height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.14)', overflow: 'hidden'}}><div style={{width: `${Math.max(3, r.v * 100 * Math.min(1, k))}%`, height: '100%', borderRadius: 17, background: r.col, boxShadow: `0 0 16px ${r.col}`}} /></div>
      <span style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: r.col, width: 150, textAlign: 'right'}}>{r.val}</span>
    </div>)}
  </div>;

// ---------- captions: one word at a time, mid-frame, keywords coloured ----------
export const Caption: React.FC<{t: number; WORDS: [string, number, number][]; KEY: Record<string, string>; top?: number}> = ({t, WORDS, KEY, top = 1100}) => {
  const i = WORDS.findIndex((w, j) => t >= w[1] - 0.03 && (j === WORDS.length - 1 || t < WORDS[j + 1][1] - 0.03));
  if (i < 0) return null;
  const [w, s, e] = WORDS[i];
  if (t > e + 0.35) return null;
  const clean = w.replace(/[.,?!…]/g, ''), n = norm(clean), k = pop(t, s - 0.03, 0.14);
  return <div style={{position: 'absolute', left: 60, right: 140, top, textAlign: 'center'}}>
    <span style={{display: 'inline-block', transform: `scale(${0.88 + 0.12 * k})`, fontFamily: FONT, fontWeight: 900, fontSize: 92, color: KEY[n] ?? 'white', textTransform: 'uppercase',
      WebkitTextStroke: '3px rgba(0,0,0,0.9)', paintOrder: 'stroke fill', textShadow: '0 6px 18px rgba(0,0,0,0.65)', letterSpacing: 1}}>{clean}</span>
  </div>;
};
