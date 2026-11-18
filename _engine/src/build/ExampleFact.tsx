// EXAMPLE 3: 3D FACT short (9:16) with three.js via buildKit/factKit. DUMMY content: copy, rename, build your own set + shots.
// Pattern: SHOTS (camera a->b per shot) -> makeCam, a lit world, word-by-word Caption, explainer Pill. Uses primitives only (no model files needed).
import React, {useMemo} from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {CameraRig, ease, useT} from '../day/dayKit';
import {Shadows, SkyDome, Sun} from './buildKit';
import {Box, Caption, GOLD, makeCam, Pill, type Shot} from './factKit';
import {WORDS} from '../fable/exampleWords';

export {EXAMPLE_SEC as EXAMPLE_FACT_SEC} from '../fable/exampleWords';
const SHOTS: Shot[] = [
  {from: 0, to: 4, a: [[2.5, 1.6, 4], [0, 1.2, 0]], b: [[1.2, 1.4, 3], [0, 1.2, 0]]},
  {from: 4, to: 99, a: [[-2, 1.2, 3], [0, 1, 0]], b: [[-1, 1.5, 2.2], [0, 1.2, 0]], orbit: 0.5},
];
const {shotAt, camAt} = makeCam(SHOTS);

export const ExampleFact: React.FC = () => {
  const {width: W, height: H} = useVideoConfig();
  const t = useT();
  const cam = useMemo(() => camAt(t), [t]);
  void shotAt;
  return (
    <AbsoluteFill style={{background: '#111'}}>
      <ThreeCanvas width={W} height={H} camera={{fov: cam.fov, position: cam.pos, near: 0.02, far: 200}} gl={{antialias: true}}>
        <CameraRig cam={cam} />
        <SkyDome /><Sun target={[0, 1, 0]} /><Shadows />
        <Box p={[0, -0.05, 0]} s={[12, 0.1, 12]} c="#d8d2c4" />
        {/* stand-in character from primitives. For the real rigged everyman, add public/models/everyman.glb and use buildKit's <Human/> */}
        <group position={[0, 0.5 + Math.abs(Math.sin(t * 3)) * 0.06, 0]}>
          <Box p={[0, 0.45, 0]} s={[0.5, 0.8, 0.3]} c="#3b5ea8" />
          <mesh position={[0, 1.15, 0]}><sphereGeometry args={[0.28, 24, 24]} /><meshStandardMaterial color="#f1d9c0" /></mesh>
          <Box p={[-0.33, 0.45, 0]} s={[0.14, 0.7, 0.14]} c="#f1d9c0" r={[0, 0, Math.sin(t * 4) * 0.4]} />
          <Box p={[0.33, 0.45, 0]} s={[0.14, 0.7, 0.14]} c="#f1d9c0" r={[0, 0, -Math.sin(t * 4) * 0.4]} />
        </group>
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 0, right: 140, top: 300, textAlign: 'center'}}><Pill k={ease(t, 1, 1.4)} text="DUMMY FACT" col={GOLD} /></div>
      <Caption t={t} WORDS={WORDS} KEY={{story: GOLD, voice: GOLD}} top={1110} />
    </AbsoluteFill>
  );
};
