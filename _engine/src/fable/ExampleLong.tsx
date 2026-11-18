// EXAMPLE 2: Fable LONG (16:9, no voice) built with fableKit. DUMMY content: copy, rename, replace the scenes, text and timings.
// Pattern: SCENES with a slow camera move, the everyman `Guy` + glowing demon, `Whisper` / `Narr` text on timings, music added later.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useCurrentFrameT} from './motionKit';
import {ease, FableDefs, Floor, Guy, mix, Narr, Whisper, FLOOR} from './fableKit';

export const EXAMPLE_LONG_SEC = 20;
type Sc = {from: number; to: number; a: {x: number; y: number; s: number}; b: {x: number; y: number; s: number}; draw: (t: number) => React.ReactNode};
const SCENES: Sc[] = [
  {from: 0, to: 10, a: {x: 900, y: 600, s: 1}, b: {x: 960, y: 560, s: 1.25}, draw: (t) => <>
    <Floor /><Guy x={700} t={t} mood="tired" seed={1} /><Guy x={1180} t={t} demon dmood="smile" seed={2} flip />
  </>},
  {from: 10, to: EXAMPLE_LONG_SEC, a: {x: 960, y: 560, s: 1.2}, b: {x: 960, y: 540, s: 1}, draw: (t) => <>
    <Floor /><Guy x={960} t={t} mood="smile" seed={1} />
  </>},
];

export const ExampleLong: React.FC = () => {
  const t = useCurrentFrameT();
  const sc = SCENES.find((s) => t >= s.from && t < s.to) ?? SCENES[SCENES.length - 1];
  const k = ease(t, sc.from, sc.to);
  return (
    <AbsoluteFill style={{background: '#0b0b0e'}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080"><FableDefs />
        <g transform={`translate(960 540) scale(${mix(sc.a.s, sc.b.s, k)}) translate(${-mix(sc.a.x, sc.b.x, k)} ${-mix(sc.a.y, sc.b.y, k) - (FLOOR - 840)})`}>{sc.draw(t)}</g>
      </svg>
      <Narr t={t} at={0.8} out={5} a="This is a placeholder line." b="Swap it for your own." bAt={2.6} />
      <Whisper t={t} at={5.5} out={9} x={1180} y={300} text="just one more." />
    </AbsoluteFill>
  );
};
