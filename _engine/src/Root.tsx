import React from 'react';
import {Composition} from 'remotion';
import {ExampleShort, EXAMPLE_SEC} from './fable/ExampleShort';
import {ExampleLong, EXAMPLE_LONG_SEC} from './fable/ExampleLong';
import {ExampleFact, EXAMPLE_FACT_SEC} from './build/ExampleFact';

// DUMMY examples. Copy one, rename it, register your own composition here. See .claude/skills/*/SKILL.md.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ExampleShort" component={ExampleShort} width={1080} height={1920} fps={30} durationInFrames={Math.round(EXAMPLE_SEC * 30)} />
    <Composition id="ExampleLong" component={ExampleLong} width={1920} height={1080} fps={30} durationInFrames={EXAMPLE_LONG_SEC * 30} />
    <Composition id="ExampleFact" component={ExampleFact} width={1080} height={1920} fps={30} durationInFrames={Math.round(EXAMPLE_FACT_SEC * 30)} />
  </>
);
