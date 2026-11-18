// Detail kit for Build It 3D (2026-10-28, after "add more detailing" feedback against the How-you-invented inspo).
// - Human: rigged, textured everyman (public/models/everyman.glb, ReadyPlayerMe avatar from the three.js examples), posed per
//   frame by aiming bones at directions, so poses are pure functions of t (push, pull-walk, lift, sit, cheer, stand).
// - Procedural canvas textures with bump maps: granite, bark, soil, grass, path dirt, wood planks, end grain, leaves.
// - Organic shapes: Boulder (noise-displaced), Tree (bark trunk + lumpy canopy clumps), Sky dome, shadows on everything.
import React, {useLayoutEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {createPortal, useThree} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone as skeletonClone} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {mergeVertices} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {continueRender, delayRender, staticFile} from 'remotion';
import {rnd, V3} from '../day/dayKit';

// ---------- noise ----------
const hash = (x: number, y: number, s: number) => { const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return h - Math.floor(h); };
const vnoise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
export const fbm = (x: number, y: number, s = 0, oct = 5) => { let f = 0, amp = 0.5, fr = 1; for (let i = 0; i < oct; i++) { f += amp * vnoise(x * fr, y * fr, s + i); amp *= 0.5; fr *= 2; } return f; };
const n3 = (x: number, y: number, z: number, s: number) => (fbm(x + z * 0.7, y - z * 0.3, s, 4) + fbm(y + 3.1, z + x * 0.5, s + 9, 4)) / 2;

// ---------- procedural textures (cached) ----------
type Tex = {map: THREE.CanvasTexture; bump: THREE.CanvasTexture};
const cache: Record<string, Tex> = {};
const makeTex = (key: string, size: number, px: (u: number, v: number) => [number, number, number, number], rep: [number, number] = [1, 1]): Tex => {
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas'), b = document.createElement('canvas');
  c.width = c.height = b.width = b.height = size;
  const cx = c.getContext('2d')!, bx = b.getContext('2d')!;
  const ci = cx.createImageData(size, size), bi = bx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const [r, g, bl, h] = px(x / size, y / size); const i = (y * size + x) * 4;
    ci.data[i] = r; ci.data[i + 1] = g; ci.data[i + 2] = bl; ci.data[i + 3] = 255;
    const hv = Math.max(0, Math.min(255, h * 255)); bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = hv; bi.data[i + 3] = 255;
  }
  cx.putImageData(ci, 0, 0); bx.putImageData(bi, 0, 0);
  const map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; }
  return (cache[key] = {map, bump});
};
// tileable fbm: sample on a torus-ish wrap by blending
const tf = (u: number, v: number, sc: number, s: number) => {
  const a = fbm(u * sc, v * sc, s), b = fbm((u - 1) * sc, v * sc, s), c = fbm(u * sc, (v - 1) * sc, s), d = fbm((u - 1) * sc, (v - 1) * sc, s);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};
const shade = (base: [number, number, number], k: number): [number, number, number] => [base[0] * k, base[1] * k, base[2] * k];

export const TEX = {
  granite: () => makeTex('granite', 512, (u, v) => {
    const n = tf(u, v, 8, 1), fine = hash(Math.floor(u * 512), Math.floor(v * 512), 3);
    const pit = tf(u, v, 22, 7) > 0.66 ? 0.55 : 1; const fleck = fine > 0.93 ? 1.35 : fine < 0.06 ? 0.55 : 1;
    const k = (0.72 + n * 0.5) * pit * fleck; const [r, g, b] = shade([148, 144, 138], k);
    return [r, g, b, n * 0.7 * pit + fine * 0.3];
  }),
  bark: () => makeTex('bark', 256, (u, v) => {
    const ridge = Math.abs(Math.sin(u * Math.PI * 14 + tf(u, v, 6, 2) * 6)); const n = tf(u, v * 0.3, 12, 5);
    const k = 0.55 + ridge * 0.45 * (0.7 + n * 0.5); const [r, g, b] = shade([104, 74, 50], k);
    return [r, g, b, ridge * 0.8 + n * 0.2];
  }, [1, 1]),
  soil: () => makeTex('soil', 512, (u, v) => {
    const n = tf(u, v, 10, 4), s = hash(Math.floor(u * 512), Math.floor(v * 512), 8);
    const pebble = tf(u, v, 40, 11) > 0.7 ? 1.3 : 1; const k = (0.75 + n * 0.45) * (s > 0.9 ? 1.2 : 1) * pebble; const [r, g, b] = shade([150, 120, 86], k);
    return [r, g, b, n * 0.6 + (pebble > 1 ? 0.4 : 0)];
  }),
  grass: () => makeTex('grass', 512, (u, v) => {
    const n = tf(u, v, 6, 6), blade = hash(Math.floor(u * 512), Math.floor(v * 256), 2);
    const k = 0.7 + n * 0.45 + (blade - 0.5) * 0.22; const dry = tf(u, v, 3, 9);
    return [104 * k + dry * 30, 150 * k + dry * 8, 64 * k, blade * 0.6 + n * 0.4];
  }),
  planks: () => makeTex('planks', 512, (u, v) => {
    const row = Math.floor(v * 6), gap = (v * 6) % 1 < 0.04 ? 0.35 : 1;
    const grain = Math.sin((u * 3 + row * 0.37) * 40 + tf(u, v, 5, row) * 10) * 0.5 + 0.5; const tone = 0.85 + hash(row, 0, 4) * 0.25;
    const knot = Math.hypot((u * 4 + row * 0.7) % 1 - 0.5, ((v * 6) % 1 - 0.5) * 3) < 0.08 ? 0.6 : 1;
    const k = (0.75 + grain * 0.3) * tone * gap * knot; const [r, g, b] = shade([168, 118, 72], k);
    return [r, g, b, grain * 0.5 * gap + (1 - gap) * 0];
  }),
  endgrain: () => makeTex('endgrain', 512, (u, v) => {
    const dx = u - 0.5, dy = v - 0.5, r = Math.hypot(dx, dy) * 2 + tf(u, v, 4, 3) * 0.06;
    if (r > 0.94) { const [a, b, c] = shade([92, 64, 42], 0.8 + tf(u, v, 20, 1) * 0.4); return [a, b, c, 0.4]; }
    const ring = Math.sin(r * 70) * 0.5 + 0.5, crack = Math.abs(Math.atan2(dy, dx) - 0.6) < 0.02 && r > 0.3 ? 0.5 : 1;
    const k = (0.8 + ring * 0.22) * crack; const [a, b, c] = shade([196, 156, 106], k);
    return [a, b, c, ring * 0.4 * crack];
  }),
  leaves: () => makeTex('leaves', 512, (u, v) => {
    const n = tf(u, v, 14, 2), cell = tf(u, v, 30, 6);
    const k = 0.55 + n * 0.4 + (cell > 0.6 ? 0.25 : 0); return [62 * k, 128 * k, 46 * k, cell * 0.7 + n * 0.3];
  }),
  iron: () => makeTex('iron', 256, (u, v) => {
    const n = tf(u, v, 12, 3), rust = tf(u, v, 5, 8) > 0.62 ? 1 : 0;
    return rust ? [120 + n * 40, 70 + n * 20, 40, n] : [70 + n * 30, 70 + n * 30, 76 + n * 30, n * 0.6];
  }),
  snow: () => makeTex('snow', 512, (u, v) => {
    const n = tf(u, v, 7, 12), fine = hash(Math.floor(u * 512), Math.floor(v * 512), 5), drift = tf(u, v, 2, 13);
    const k = 0.9 + n * 0.1 + (fine > 0.985 ? 0.08 : 0); const blue = 6 + drift * 14;
    return [Math.min(255, 238 * k - blue), Math.min(255, 244 * k - blue * 0.4), Math.min(255, 250 * k), n * 0.7 + fine * 0.3];
  }),
  ice: () => makeTex('ice', 512, (u, v) => {
    const n = tf(u, v, 4, 14), streak = Math.abs(Math.sin((u + n * 0.4) * 30)) > 0.97 ? 1.12 : 1, bub = tf(u, v, 28, 15) > 0.72 ? 1.1 : 1;
    const k = (0.86 + n * 0.16) * streak * bub; return [Math.min(255, 196 * k), Math.min(255, 224 * k), Math.min(255, 240 * k), n * 0.5 + (streak > 1 ? 0.4 : 0)];
  }),
  // added 2026-11-08 (FactJolt): woven cloth, wall plaster, rug pile. Neutral light tones: tint with color=…
  fabric: () => makeTex('fabric', 512, (u, v) => {
    const wx = Math.sin(u * Math.PI * 2 * 90) * 0.5 + 0.5, wy = Math.sin(v * Math.PI * 2 * 90) * 0.5 + 0.5, n = tf(u, v, 6, 21), fold = tf(u, v, 2, 22);
    const k = 0.78 + (wx * 0.5 + wy * 0.5) * 0.12 + n * 0.12 + fold * 0.1; return [222 * k, 222 * k, 222 * k, (wx + wy) * 0.35 + fold * 0.3];
  }),
  plaster: () => makeTex('plaster', 512, (u, v) => {
    const n = tf(u, v, 9, 23), fine = hash(Math.floor(u * 512), Math.floor(v * 512), 24), blot = tf(u, v, 3, 25);
    const k = 0.86 + n * 0.1 + blot * 0.06 + (fine - 0.5) * 0.04; return [230 * k, 226 * k, 218 * k, n * 0.6 + fine * 0.2];
  }),
  // added 2026-11-08 (FactCringe): running-bond brick with mortar lines. Neutral warm tone: tint with color=…
  brick: () => makeTex('brick', 512, (u, v) => {
    const rows = 16, row = Math.floor(v * rows), off = row % 2 ? 0.5 : 0, cols = 8, cu = u * cols + off, col = Math.floor(cu);
    const mort = (v * rows) % 1 < 0.1 || cu % 1 < 0.05; const n = tf(u, v, 10, 31), tone = 0.78 + hash(col, row, 32) * 0.3;
    if (mort) return [150 + n * 30, 146 + n * 30, 140 + n * 30, 0.1];
    const k = tone * (0.85 + n * 0.25); return [176 * k, 104 * k, 82 * k, 0.6 + n * 0.4];
  }),
  // added 2026-11-09 overlapping scalloped feather rows. Neutral cream: tint with color=…
  feathers: () => makeTex('feathers', 512, (u, v) => {
    const rows = 14, row = Math.floor(v * rows), off = row % 2 ? 0.5 : 0, cu = u * 10 + off, fx = (cu % 1) - 0.5, fy = (v * rows) % 1;
    const d = Math.hypot(fx, (fy - 0.1) * 0.9), edge = d > 0.48 ? 0.8 : 1, n = tf(u, v, 8, 41), shaft = Math.abs(fx) < 0.025 ? 0.93 : 1;
    const k = (0.86 + n * 0.1 + (1 - fy) * 0.06) * edge * shaft; return [240 * k, 234 * k, 222 * k, (1 - d) * 0.6 + n * 0.3];
  }),
  carpet: () => makeTex('carpet', 512, (u, v) => {
    const pile = hash(Math.floor(u * 512), Math.floor(v * 512), 26), n = tf(u, v, 8, 27);
    const band = Math.abs(((u * 6) % 1) - 0.5) < 0.06 || Math.abs(((v * 6) % 1) - 0.5) < 0.06 ? 0.82 : 1;
    const k = (0.78 + n * 0.16 + (pile - 0.5) * 0.14) * band; return [210 * k, 210 * k, 210 * k, pile * 0.6 + n * 0.3];
  }),
};

export const Mat: React.FC<{tex: keyof typeof TEX; rep?: [number, number]; bump?: number; color?: string; e?: number; ec?: string; rough?: number; metal?: number; side?: THREE.Side; clip?: THREE.Plane[]; o?: number}> = ({tex, rep, bump = 0.04, color = '#ffffff', e = 0, ec = '#000', rough = 0.92, metal = 0, side, clip, o = 1}) => {
  const t = TEX[tex]();
  const map = useMemo(() => { if (!rep) return t; const m = t.map.clone(), b = t.bump.clone(); m.repeat.set(rep[0], rep[1]); b.repeat.set(rep[0], rep[1]); m.needsUpdate = b.needsUpdate = true; return {map: m, bump: b}; }, [t, rep?.[0], rep?.[1]]);
  return <meshStandardMaterial map={map.map} bumpMap={map.bump} bumpScale={bump} color={color} roughness={rough} metalness={metal} emissive={ec} emissiveIntensity={e} side={side} clippingPlanes={clip} clipShadows={!!clip} transparent={o < 1} opacity={o} />;
};

// ---------- organic shapes ----------
const geoCache: Record<string, THREE.BufferGeometry> = {};
const lumpy = (key: string, detail: number, amp: number, freq: number, seed: number, squash: V3 = [1, 1, 1]) => {
  if (geoCache[key]) return geoCache[key];
  const g = mergeVertices(new THREE.IcosahedronGeometry(1, detail));
  const p = g.attributes.position as THREE.BufferAttribute; const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const d = 1 + (n3(v.x * freq, v.y * freq, v.z * freq, seed) - 0.5) * amp * 2;
    p.setXYZ(i, v.x * d * squash[0], v.y * d * squash[1], v.z * d * squash[2]);
  }
  g.computeVertexNormals();
  return (geoCache[key] = g);
};
export const Boulder: React.FC<{p: V3; s: number; seed?: number; squash?: V3; tint?: string; r?: V3}> = ({p, s, seed = 1, squash = [1.15, 0.85, 1], tint = '#ffffff', r}) =>
  <mesh position={p} scale={s} rotation={r ?? [0, rnd(seed) * 6, 0]} geometry={lumpy(`b${seed}`, 4, 0.22, 1.6, seed, squash)}><Mat tex="granite" bump={0.06} color={tint} /></mesh>;
export const Tree: React.FC<{p: V3; s?: number; seed?: number}> = ({p, s = 1, seed = 1}) => (
  <group position={p} scale={s} rotation={[0, rnd(seed) * 6, 0]}>
    <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[0.14, 0.24, 2.2, 12, 4]} /><Mat tex="bark" rep={[2, 3]} bump={0.08} /></mesh>
    {[[0.12, 2.2, 0.0, 0.5, 1.2]].map(([x, y, z, rz]) => <mesh key="br" position={[x, y, z]} rotation={[0, 0, rz]}><cylinderGeometry args={[0.05, 0.08, 0.9, 8]} /><Mat tex="bark" bump={0.06} /></mesh>)}
    {[[0, 2.75, 0, 1.0], [0.55, 2.45, 0.25, 0.72], [-0.55, 2.5, -0.15, 0.75], [0.1, 3.3, -0.1, 0.72], [-0.2, 2.6, 0.55, 0.62]].map(([x, y, z, r], i) =>
      <mesh key={i} position={[x, y, z]} scale={r} geometry={lumpy(`c${(seed + i) % 5}`, 3, 0.3, 2.6, seed + i, [1, 0.85, 1])}><Mat tex="leaves" bump={0.12} rough={0.95} /></mesh>)}
  </group>
);
export const SkyDome: React.FC<{top?: string; mid?: string; bot?: string}> = ({top = '#8fb4cc', mid = '#cfdde3', bot = '#e6ece8'}) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {top: {value: new THREE.Color(top)}, mid: {value: new THREE.Color(mid)}, bot: {value: new THREE.Color(bot)}},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      void main(){ float y = vP.y; vec3 c = y > 0.15 ? mix(mid, top, smoothstep(0.15, 0.7, y)) : mix(bot, mid, smoothstep(-0.05, 0.15, y));
        vec2 q = vP.xz / max(0.12, vP.y) * 1.6; float cl = n(q) * 0.5 + n(q * 2.3) * 0.3 + n(q * 5.1) * 0.2;
        c = mix(c, vec3(1.0), smoothstep(0.55, 0.85, cl) * smoothstep(0.08, 0.35, y) * 0.7); gl_FragColor = vec4(c, 1.0); }`,
  }), [top, mid, bot]);
  return <mesh material={mat} scale={80}><sphereGeometry args={[1, 32, 16]} /></mesh>;
};
// turn on cast/receive shadows for everything in the scene (cheap, idempotent)
export const Shadows: React.FC = () => {
  const {scene, gl} = useThree();
  useLayoutEffect(() => {
    gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.PCFSoftShadowMap;
    scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && !(o as THREE.Mesh).userData.noShadow) { o.castShadow = true; o.receiveShadow = true; } });
  });
  return null;
};
export const Sun: React.FC<{target: V3; intensity?: number; color?: string; dir?: V3}> = ({target, intensity = 2.2, color = '#ffe6c2', dir = [-5, 8, 6]}) => {
  const light = useMemo(() => {
    const l = new THREE.DirectionalLight(color, intensity);
    l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.02;
    const c = l.shadow.camera as THREE.OrthographicCamera; c.left = -7; c.right = 7; c.top = 7; c.bottom = -7; c.near = 0.5; c.far = 40;
    return l;
  }, [color]);
  light.intensity = intensity;
  light.position.set(target[0] + dir[0], target[1] + dir[1], target[2] + dir[2]);
  light.target.position.set(...target);
  light.target.updateMatrixWorld();
  return <><primitive object={light} /><primitive object={light.target} /></>;
};

// ---------- the everyman ----------
let gltfPromise: Promise<THREE.Group> | null = null;
const loadMan = () => (gltfPromise ??= new Promise((res, rej) => new GLTFLoader().load(staticFile('models/everyman.glb'), (g) => res(g.scene), undefined, rej)));
export const useEveryman = () => {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [handle] = useState(() => delayRender('everyman.glb'));
  useLayoutEffect(() => { loadMan().then((s) => setScene(skeletonClone(s) as THREE.Group)).catch((e) => { console.error(e); continueRender(handle); }); }, [handle]);
  return {scene, handle};
};

export type HPose = 'stand' | 'push' | 'pull' | 'lift' | 'sit' | 'cheer' | 'floor' | 'lie' | 'flail' | 'limp' | 'cover' | 'tickle' | 'giggle' | 'lab' | 'reach' | 'ledge' | 'thrash' | 'tread' | 'float' | 'crouch' | 'crossleg' | 'wobble';
type Dirs = Record<string, V3>; // bone name -> direction to its child, in the character's own frame (+Z forward, +Y up, +X = his left)
const dir = (x: number, y: number, z: number): V3 => [x, y, z];
const legSwing = (a: number, bend: number) => ({up: dir(0, -Math.cos(a), Math.sin(a)), low: dir(0, -Math.cos(a - bend), Math.sin(a - bend))});
const poseDirs = (pose: HPose, walk: number, t: number, strain: number): Dirs => {
  const walking = walk !== 0;
  const ph = walk;
  const sw = walking ? Math.sin(ph) * 0.5 : 0;
  const L = legSwing(sw, walking ? Math.max(0, -Math.sin(ph)) * 0.7 + 0.05 : 0.04), R = legSwing(-sw, walking ? Math.max(0, Math.sin(ph)) * 0.7 + 0.05 : 0.04);
  const d: Dirs = {LeftUpLeg: L.up, LeftLeg: L.low, RightUpLeg: R.up, RightLeg: R.low, LeftFoot: dir(0, -0.45, 1), RightFoot: dir(0, -0.45, 1)};
  const breathe = Math.sin(t * 1.8) * 0.015;
  const lean = (a: number) => { d.Spine = dir(0, Math.cos(a), Math.sin(a)); d.Head = dir(0, 1, 0.1 + Math.sin(t * 0.7) * 0.05); };
  const armSwing = walking ? Math.sin(ph) * 0.4 : 0;
  // arms default: hanging, slightly out
  d.LeftArm = dir(0.22, -1, -armSwing * 0.8); d.LeftForeArm = dir(0.12, -1, 0.15 - armSwing * 0.6); d.RightArm = dir(-0.22, -1, armSwing * 0.8); d.RightForeArm = dir(-0.12, -1, 0.15 + armSwing * 0.6);
  lean(0.04 + breathe);
  if (pose === 'push') {
    lean(0.55 + strain * 0.08 + breathe);
    d.LeftArm = dir(0.25, -0.45, 1); d.LeftForeArm = dir(0.1, -0.2, 1); d.RightArm = dir(-0.25, -0.45, 1); d.RightForeArm = dir(-0.1, -0.2, 1);
    if (!walking) { const a = legSwing(0.35, 0.55), b = legSwing(-0.45, 0.05); d.LeftUpLeg = a.up; d.LeftLeg = a.low; d.RightUpLeg = b.up; d.RightLeg = b.low; }
  }
  if (pose === 'pull') {
    lean(0.32 + strain * 0.12 + breathe);
    // rope over the right shoulder, both fists at the chest
    d.RightArm = dir(-0.25, -0.75, 0.45); d.RightForeArm = dir(0.45, 0.55, 0.55);
    d.LeftArm = dir(0.25, -0.8, 0.4); d.LeftForeArm = dir(-0.35, 0.5, 0.6);
    if (!walking && strain > 0.5) { const a = legSwing(0.4, 0.6), b = legSwing(-0.5, 0.05); d.LeftUpLeg = a.up; d.LeftLeg = a.low; d.RightUpLeg = b.up; d.RightLeg = b.low; }
  }
  if (pose === 'lift' || pose === 'cheer') {
    const w = pose === 'cheer' ? Math.sin(t * 8) * 0.35 : 0;
    d.LeftArm = dir(0.35 + w, 1, 0.15); d.LeftForeArm = dir(0.15 + w, 1, 0.05); d.RightArm = dir(-0.35 - w, 1, 0.15); d.RightForeArm = dir(-0.15 - w, 1, 0.05);
    lean(pose === 'lift' ? -0.08 : 0.0);
  }
  if (pose === 'floor') { // sitting on the ground, legs out, hugging the knees
    d.LeftUpLeg = dir(0.1, 0.25, 1); d.RightUpLeg = dir(-0.1, 0.25, 1); d.LeftLeg = dir(0.04, -0.45, 1); d.RightLeg = dir(-0.04, -0.45, 1);
    d.LeftArm = dir(0.2, -0.6, 0.8); d.LeftForeArm = dir(-0.3, 0.1, 1); d.RightArm = dir(-0.2, -0.6, 0.8); d.RightForeArm = dir(0.3, 0.1, 1);
    lean(0.3 + breathe);
  }
  // lying poses (added 2026-11-08, FactJolt): authored in the standing frame; rotate the Human's parent group by −π/2 about X
  // to lay him on his back (his +Z/front then faces up, head toward −Z). lie = asleep, limp = right arm slides off the bed edge, flail = the hypnic jerk.
  if (pose === 'lie' || pose === 'limp') {
    d.LeftUpLeg = dir(0.04, -1, 0.06); d.RightUpLeg = dir(-0.04, -1, 0.06); d.LeftLeg = dir(0, -1, -0.02); d.RightLeg = dir(0, -1, -0.02);
    d.LeftFoot = dir(0.15, -0.3, 1); d.RightFoot = dir(-0.15, -0.3, 1);
    d.LeftArm = dir(0.22, -1, 0.0); d.LeftForeArm = dir(0.02, -1, 0.12); d.RightArm = dir(-0.22, -1, 0.0); d.RightForeArm = dir(-0.02, -1, 0.12);
    d.Spine = dir(0, 1, Math.sin(t * 1.4) * 0.02); d.Head = dir(0, 1, 0.12);
    if (pose === 'limp') { d.RightArm = dir(-1, -0.25, -0.55); d.RightForeArm = dir(-0.35, -0.15, -1); }
  }
  if (pose === 'flail') {
    const j = Math.sin(t * 22) * 0.12;
    d.LeftArm = dir(1, 0.35 + j, 0.55); d.LeftForeArm = dir(0.8, 0.9, 0.35); d.RightArm = dir(-1, 0.35 - j, 0.55); d.RightForeArm = dir(-0.8, 0.9, 0.35);
    d.LeftUpLeg = dir(0.12, -0.65, 0.75); d.RightUpLeg = dir(-0.12, -0.75, 0.65 + j); d.LeftLeg = dir(0.05, -1, -0.15); d.RightLeg = dir(-0.05, -1, -0.1);
    d.Spine = dir(0, 1, 0.3); d.Head = dir(0, 1, 0.45);
  }
  // added 2026-11-08 (FactCringe): lying on the back with both forearms over the face (cringe). Rotate the parent −π/2 about X like 'lie'.
  if (pose === 'cover') {
    d.LeftUpLeg = dir(0.04, -1, 0.06); d.RightUpLeg = dir(-0.04, -1, 0.06); d.LeftLeg = dir(0, -1, -0.02); d.RightLeg = dir(0, -1, -0.02);
    d.LeftFoot = dir(0.15, -0.3, 1); d.RightFoot = dir(-0.15, -0.3, 1);
    d.LeftArm = dir(0.25, 0.18, 1); d.LeftForeArm = dir(-0.75, 0.6, -0.33); d.RightArm = dir(-0.25, 0.18, 1); d.RightForeArm = dir(0.75, 0.62, -0.3);
    d.Spine = dir(0, 1, Math.sin(t * 1.4) * 0.02); d.Head = dir(0, 1, 0.12);
  }
  if (pose === 'sit') {
    d.LeftUpLeg = dir(0.08, -0.05, 1); d.RightUpLeg = dir(-0.08, -0.05, 1); d.LeftLeg = dir(0, -1, 0.15); d.RightLeg = dir(0, -1, 0.15);
    d.LeftArm = dir(0.3, -1, 0.3); d.LeftForeArm = dir(0.05, -0.3, 1); d.RightArm = dir(-0.3, -1, 0.3); d.RightForeArm = dir(-0.05, -0.3, 1);
    lean(0.12 + breathe);
  }
  // added 2026-11-09 (FactTickle): seated poses. tickle = fingertips wiggling on his own ribs; giggle = arms clamped over the belly, rocking;
  // lab = left hand forward on a handle, right forearm flat on the table palm up; reach = standing, both hands reaching forward-down (tickling someone)
  if (pose === 'tickle' || pose === 'giggle' || pose === 'lab') {
    d.LeftUpLeg = dir(0.08, -0.05, 1); d.RightUpLeg = dir(-0.08, -0.05, 1); d.LeftLeg = dir(0, -1, 0.15); d.RightLeg = dir(0, -1, 0.15);
    lean(0.12 + breathe);
  }
  if (pose === 'tickle') {
    const wg = Math.sin(t * 26) * 0.12;
    d.LeftArm = dir(0.55, -1, -0.15); d.LeftForeArm = dir(-0.55, 0.45 + wg, 0.7); d.RightArm = dir(-0.55, -1, -0.15); d.RightForeArm = dir(0.55, 0.45 - wg, 0.7);
  }
  if (pose === 'giggle') {
    const rock = Math.sin(t * 9) * 0.22;
    d.LeftArm = dir(0.2, -1, 0.25); d.LeftForeArm = dir(-1, 0.2, 0.55); d.RightArm = dir(-0.2, -1, 0.25); d.RightForeArm = dir(1, 0.3, 0.55);
    d.Spine = dir(rock, 1, 0.35 + Math.abs(rock) * 0.5); d.Head = dir(rock * 1.4, 1, -0.25 + Math.sin(t * 13) * 0.1);
  }
  if (pose === 'lab') {
    d.LeftArm = dir(0.18, -0.55, 1); d.LeftForeArm = dir(0.05, -0.12, 1); d.RightArm = dir(-0.3, -0.7, 0.75); d.RightForeArm = dir(-0.15, -0.18, 1);
    lean(0.2 + breathe);
  }
  // added 2026-11-14 (FactIce): in water. ledge = both forearms flat forward on the ice edge; thrash = panicked arm swings above the water;
  // tread = slow sculling at the surface. Legs hang and kick slowly underwater.
  if (pose === 'ledge' || pose === 'thrash' || pose === 'tread') {
    const k = Math.sin(t * (pose === 'thrash' ? 9 : 3)) * (pose === 'thrash' ? 0.5 : 0.25);
    const a = legSwing(k, 0.3), b = legSwing(-k, 0.3); d.LeftUpLeg = a.up; d.LeftLeg = a.low; d.RightUpLeg = b.up; d.RightLeg = b.low;
  }
  if (pose === 'ledge') {
    d.LeftArm = dir(0.3, -0.05, 1); d.LeftForeArm = dir(0.05, -0.1, 1); d.RightArm = dir(-0.3, -0.05, 1); d.RightForeArm = dir(-0.05, -0.1, 1);
    lean(0.25 + breathe);
  }
  if (pose === 'thrash') {
    const j = Math.sin(t * 11), j2 = Math.sin(t * 11 + 2);
    d.LeftArm = dir(0.9, 0.5 + j * 0.6, 0.5); d.LeftForeArm = dir(0.4, 0.9 + j * 0.3, 0.3); d.RightArm = dir(-0.9, 0.5 + j2 * 0.6, 0.5); d.RightForeArm = dir(-0.4, 0.9 + j2 * 0.3, 0.3);
    d.Spine = dir(Math.sin(t * 7) * 0.12, 1, 0.1); d.Head = dir(Math.sin(t * 9) * 0.25, 1, -0.2);
  }
  if (pose === 'tread') {
    const s2 = Math.sin(t * 2.6) * 0.3;
    d.LeftArm = dir(0.8, -0.35, 0.4 + s2); d.LeftForeArm = dir(0.6, -0.2, 0.8 - s2); d.RightArm = dir(-0.8, -0.35, 0.4 - s2); d.RightForeArm = dir(-0.6, -0.2, 0.8 + s2);
    lean(0.08 + breathe);
  }
  if (pose === 'reach') {
    const wg = Math.sin(t * 24) * 0.15;
    lean(0.45 + breathe);
    d.LeftArm = dir(0.3, -0.5, 1); d.LeftForeArm = dir(0.1, -0.6 + wg, 1); d.RightArm = dir(-0.3, -0.5, 1); d.RightForeArm = dir(-0.1, -0.6 - wg, 1);
  }
  // added 2026-11-16 (FactElevator / FactFoot): float = weightless in a dropping elevator (arms drifting up, knees soft);
  // crouch = knees bent, about to jump; crossleg = sitting cross-legged on the floor holding a controller; wobble = standing on a numb right foot, arms out
  if (pose === 'float') {
    const f = Math.sin(t * 2.2) * 0.12, g = Math.sin(t * 1.7 + 1) * 0.12;
    d.LeftArm = dir(0.85, 0.45 + f, 0.25); d.LeftForeArm = dir(0.5, 0.85 + f, 0.2); d.RightArm = dir(-0.85, 0.45 + g, 0.25); d.RightForeArm = dir(-0.5, 0.85 + g, 0.2);
    const a = legSwing(0.35 + f * 0.5, 0.6), b = legSwing(0.15 - g * 0.5, 0.45); d.LeftUpLeg = a.up; d.LeftLeg = a.low; d.RightUpLeg = b.up; d.RightLeg = b.low;
    d.Spine = dir(f * 0.3, 1, -0.05); d.Head = dir(g * 0.4, 1, -0.15);
  }
  if (pose === 'crouch') {
    d.LeftUpLeg = dir(0.12, -0.55, 0.85); d.RightUpLeg = dir(-0.12, -0.55, 0.85); d.LeftLeg = dir(0.04, -1, -0.45); d.RightLeg = dir(-0.04, -1, -0.45);
    d.LeftArm = dir(0.2, -0.8, -0.5); d.LeftForeArm = dir(0.1, -0.6, -0.4); d.RightArm = dir(-0.2, -0.8, -0.5); d.RightForeArm = dir(-0.1, -0.6, -0.4);
    lean(0.45 + breathe);
  }
  if (pose === 'crossleg') {
    d.LeftUpLeg = dir(0.75, 0.05, 0.62); d.LeftLeg = dir(-0.85, -0.05, 0.45); d.RightUpLeg = dir(-0.75, 0.05, 0.62); d.RightLeg = dir(0.85, -0.02, 0.38);
    d.LeftFoot = dir(-0.5, -0.3, 0.8); d.RightFoot = dir(0.5, -0.3, 0.8);
    const tap = Math.sin(t * 14) * 0.06;
    d.LeftArm = dir(0.2, -1, 0.35); d.LeftForeArm = dir(-0.32, 0.18 + tap, 1); d.RightArm = dir(-0.2, -1, 0.35); d.RightForeArm = dir(0.32, 0.18 - tap, 1);
    lean(0.18 + breathe);
  }
  if (pose === 'wobble') {
    const w = Math.sin(t * 7) * 0.25;
    d.LeftArm = dir(0.8, -0.6 + w, 0.35); d.LeftForeArm = dir(0.6, 0.15 + w, 0.6); d.RightArm = dir(-0.8, -0.6 - w, 0.35); d.RightForeArm = dir(-0.6, 0.15 - w, 0.6);
    d.RightFoot = dir(-0.75, -0.75, 0.35); d.RightLeg = dir(-0.12, -1, 0.05);
    d.Spine = dir(w * 0.25, 1, 0.08); d.Head = dir(-w * 0.3, 1, 0.1);
  }
  return d;
};
const CHILD: Record<string, string> = {Spine: 'Neck', Head: 'HeadTop_End', LeftArm: 'LeftForeArm', LeftForeArm: 'LeftHand', RightArm: 'RightForeArm', RightForeArm: 'RightHand',
  LeftUpLeg: 'LeftLeg', LeftLeg: 'LeftFoot', RightUpLeg: 'RightLeg', RightLeg: 'RightFoot', LeftFoot: 'LeftToe_End', RightFoot: 'RightToe_End'};
const ORDER = ['Spine', 'Head', 'LeftArm', 'LeftForeArm', 'RightArm', 'RightForeArm', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _wq = new THREE.Quaternion(), _pq = new THREE.Quaternion(), _root = new THREE.Quaternion();
const aim = (bone: THREE.Object3D, child: THREE.Object3D, target: THREE.Vector3) => {
  bone.getWorldPosition(_a); child.getWorldPosition(_b);
  _d.subVectors(_b, _a).normalize();
  _q.setFromUnitVectors(_d, target);
  bone.getWorldQuaternion(_wq); _wq.premultiply(_q);
  bone.parent!.getWorldQuaternion(_pq);
  bone.quaternion.copy(_pq.invert().multiply(_wq));
  bone.updateMatrixWorld(true);
};

// outfit tints (multiply the avatar's textures): brown tee, dark work trousers, like the inspo everyman
const TINT: Record<string, string> = {Wolf3D_Outfit_Top: '#a07850', Wolf3D_Outfit_Bottom: '#4a4a52', Wolf3D_Headwear: '#5a4632'};
// p = feet position, ry = facing (0 = +Z, π/2 = +X). walk = gait phase (0 = standing still).
// opacity (optional, set it from the first frame): fades the whole body (x-ray shots). kids (optional): extra meshes parented to bones,
// in the bone's own frame (+Y runs along the bone to its child; len = that bone's length in metres). hide (optional): mesh names to hide.
export const Human: React.FC<{p: V3; ry?: number; pose: HPose; walk?: number; strain?: number; t: number; s?: number; outfit?: Record<string, string>;
  opacity?: number; kids?: Record<string, (len: number) => React.ReactNode>; hide?: string[]}> = ({p, ry = 0, pose, walk = 0, strain = 0, t, s = 1.12, outfit, opacity, kids, hide}) => {
  const {scene, handle} = useEveryman();
  const [released, setReleased] = useState(false);
  const bones = useMemo(() => {
    if (!scene) return null;
    const m: Record<string, THREE.Object3D> = {}; const rest: Record<string, THREE.Quaternion> = {};
    scene.traverse((o) => { m[o.name] = o; if ((o as THREE.Bone).isBone) rest[o.name] = o.quaternion.clone(); if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true; o.frustumCulled = false;
      const tint = (outfit ?? TINT)[o.name];
      if (tint) { const m = ((o as THREE.Mesh).material as THREE.MeshStandardMaterial).clone(); m.color = new THREE.Color(tint); (o as THREE.Mesh).material = m; }
      else if (opacity !== undefined) (o as THREE.Mesh).material = ((o as THREE.Mesh).material as THREE.Material).clone();
      if (hide?.includes(o.name)) o.visible = false; // e.g. hide={['Wolf3D_Headwear']} (no hat in bed)
    } });
    return {m, rest};
  }, [scene]);
  const {advance} = useThree();
  useLayoutEffect(() => {
    if (!scene || !bones) return;
    Object.entries(bones.rest).forEach(([n, q]) => bones.m[n].quaternion.copy(q));
    scene.updateMatrixWorld(true);
    scene.getWorldQuaternion(_root);
    if (opacity !== undefined) scene.traverse((o) => { if ((o as THREE.Mesh).isMesh) { const m = (o as THREE.Mesh).material as THREE.Material; m.transparent = opacity < 0.999; m.opacity = opacity; m.depthWrite = opacity > 0.6; } });
    const dirs = poseDirs(pose, walk, t, strain);
    for (const n of ORDER) {
      const v = dirs[n]; const b = bones.m[n], c = bones.m[CHILD[n]];
      if (!v || !b || !c) continue;
      aim(b, c, new THREE.Vector3(...v).normalize().applyQuaternion(_root));
    }
    advance(performance.now());
    if (!released) {  setReleased(true); requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))); }
  });
  if (!scene) return null;
  const bob = walk !== 0 ? -Math.abs(Math.sin(walk)) * 0.03 : 0;
  const crouch = pose === 'push' ? -0.08 : pose === 'sit' || pose === 'tickle' || pose === 'giggle' || pose === 'lab' ? -0.5 : pose === 'floor' || pose === 'crossleg' ? -0.86 : pose === 'crouch' ? -0.3 : 0;
  return <group position={[p[0], p[1] + bob + crouch * s, p[2]]} rotation={[0, ry, 0]} scale={s}><primitive object={scene} />
    {kids && bones && Object.entries(kids).map(([n, f]) => { const b = bones.m[n], c = bones.m[CHILD[n] ?? ''] ?? b?.children.find((x) => (x as THREE.Bone).isBone);
      return b ? <React.Fragment key={n}>{createPortal(<>{f(c ? c.position.length() : 0.1)}</>, b)}</React.Fragment> : null; })}
  </group>;
};
