// EXAMPLE 1: Fable SHORT (9:16) built with motionKit. DUMMY content: copy this file, rename it, replace the scenes and the words.
// Pattern: SCENES (camera keys + draw) -> SceneStack, Toon characters, Captions from word timings, no audio until you add public/jobs/<slug>/voice.mp3.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {loadFont} from '@remotion/google-fonts/InterTight';
import {Captions, chunkWords, ease, INK, KitDefs, Look, Scene, SceneStack, spring, talkMouth, Toon, useCurrentFrameT} from './motionKit';
import {EXAMPLE_SEC, WORDS} from './exampleWords';

export {EXAMPLE_SEC};
const {fontFamily: CAP} = loadFont('normal', {weights: ['900'], subsets: ['latin']});
const HERO: Look = {hair: 'crop', hairC: '#2b2320', suit: '#3b5ea8', tie: '#f2c14e'};
const FRIEND: Look = {hair: 'bob', hairC: '#7a4a2b', suit: '#b04a5a'};
const SAY: [number, number][] = [[0, 6]];

const SCENES: Scene[] = [
  {from: 0, to: 3.2, cam: [{t: 0, x: 540, y: 900, z: 1}, {t: 3, x: 540, y: 860, z: 1.4, d: 3}], draw: (t) => <>
    <rect x={-600} y={-600} width={2300} height={2600} fill="#cfe3f1" /><rect x={-600} y={1400} width={2300} height={800} fill="#8fb79a" stroke={INK} strokeWidth={6} />
    <Toon x={540} y={1400} s={1.5} t={t} look={HERO} mood={t > 1 ? 'happy' : 'flat'} mouth={talkMouth(t, WORDS, SAY, 1)} />
  </>},
  {from: 3.2, to: EXAMPLE_SEC, tin: {k: 'whip', dir: [1, 0]}, cam: [{t: 3.2, x: 400, y: 900, z: 1.1}, {t: 8, x: 700, y: 880, z: 1.5, d: 4}], draw: (t) => <>
    <rect x={-600} y={-600} width={2300} height={2600} fill="#f4d9a8" /><rect x={-600} y={1400} width={2300} height={800} fill="#c9a06a" stroke={INK} strokeWidth={6} />
    <Toon x={380} y={1400} s={1.4} t={t} look={HERO} mood="grin" mouth={talkMouth(t, WORDS, SAY, 1)} />
    <g transform={`translate(760 1400) scale(${spring(t, 4, 0.3, 2)})`}><Toon x={0} y={0} s={1.4} t={t} look={FRIEND} mood="wide" flip={-1} seed={3} /></g>
    <text x={540} y={420} textAnchor="middle" fontFamily={CAP} fontSize={110} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={ease(t, 5, 5.4)}>YOUR STORY</text>
  </>},
];
const CHUNKS = chunkWords(WORDS);

export const ExampleShort: React.FC = () => {
  const t = useCurrentFrameT();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920"><KitDefs /><SceneStack scenes={SCENES} t={t} /></svg>
      <Captions t={t} chunks={CHUNKS} keys={{story: '#FFD23F', voice: '#ff4d4d'}} font={CAP} y={1110} />
      {/* <Audio src={staticFile('jobs/example/voice.mp3')} /> */}
    </AbsoluteFill>
  );
};
