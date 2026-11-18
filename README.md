# Animation Studio Kit

Claude Code skills + Remotion engine for making two kinds of animated videos:
**2D Fables** (shorts and longs), and **3D Facts** shorts.

## Setup (once)
1. Install: [Node.js 20+](https://nodejs.org), Python 3.10+, `ffmpeg` (`brew install ffmpeg` on Mac), and [Claude Code](https://claude.com/claude-code).
2. Put this folder at `~/Documents/Videos` (some scripts assume that path).
3. `cd _engine && npm install`
4. `pip install numpy`
5. Optional: Whisper / an ElevenLabs paid account for AI voice-over (the skills explain where it's used).
6. Open the folder in Claude Code.

## Use
Just ask Claude:

- "Fable short about the man who sold the Eiffel Tower"
- "3D fact about why your knuckles crack"

Claude writes the script, gets your OK, makes the voice, builds the scene in code and renders to the `Completed/` folder.

## What's inside
- `.claude/skills/` – the instructions Claude follows (`dark-fable-2d`, `3d-facts`, `storytelling`, `3d-motion-graphics`)
- `_engine/src` – Remotion components (`fable/`, `day/` 3D world, kits)
- `_engine/scripts` – pipeline + quality gates (`shorts_gate.py`, `motion_metrics.py`, `mix_sound.py`, `tighten_vo.py`, …)
- Empty working folders: `Dark Fables 2D/`, `3D Facts/`, `SFX/`, `Music/`

## Not included (add your own)
Videos, inspiration clips, music and SFX files (licensing). Drop inspo videos into each format's `Inspirations/` folder and sounds into `SFX/Library/`. The sound-index script builds its index from whatever you add.
Note: your own API key goes in a file named `.env.local` (copy `.env.example`). Never share that file.

## Examples
`_engine/src/fable/ExampleShort.tsx`, `ExampleLong.tsx` and `build/ExampleFact.tsx` are dummy starter videos (placeholder script and characters). Preview with `cd _engine && npx remotion studio`. Copy one, rename it, and register it in `src/Root.tsx`.
The rigged 3D character (`<Human/>` in `build/buildKit.tsx`) needs a model file you supply at `_engine/public/models/everyman.glb` (any rigged humanoid). The example uses simple shapes instead.
