---
name: dark-fable-2d
description: Two formats. SHORTS (9:16, voiced, 40–60 s true story with a twist): EVERY fable short since 2026-11-09 follows the Viral Shorts Standard (`storytelling/references/viral-shorts-standard.md`: gossip-register script, continuous young conversational narrator with tightened pauses, 2.5D lit perspective plates in bright complementary colour, no text in the hook, cut on the payoff) on top of the Eiffel Con motion build (`_engine/src/fable/ExampleShort.tsx` + `motionKit.tsx`), with three measured gates (`scripts/shorts_gate.py` script / voice / video); see the 🔒 section. LONGS: 2D cinematic no-voice "fable" long videos (16:9, ~2.5–3 min) about self-improvement and life lessons (discipline, dopamine, lust vs love, procrastination, loneliness): dark minimal rooms, a white blob everyman, a glowing pink/red inner-voice demon whispering in handwritten text, a counter HUD (DAY 47 / SEEN 1,140 KNOWN 0), short white narration cards, a sad-piano score that turns hopeful, and a turning-point object. Built fully in code (SVG in Remotion). Two modes: Normal (vector blob + demon) and **Wojak** (photoreal AI plates + line-art cast + phone/calendar/whiteboard inserts, like "Doomers path to Happiness"). Use when the user says "wojak", "dark fable", "fable short", "2d fable short", "video like the Eiffel Con", "2d fable", "2d cinematic", "movie style 2d", "no voice animation", or shows inspo like DISCIPLINE / LUST VS LOVE. Not for voiced paper explainers (paper-explainer) or 3D shorts (build-it-3d, day-series).
---

# Dark Fables 2D (voiced shorts + no-voice cinematic longs)

## 🔒 THE way to make every Fable short (user rule 2026-11-09: Viral Shorts Standard on top of the Eiffel Con build; overrides anything below that conflicts)
**Read `.claude/skills/storytelling/references/viral-shorts-standard.md` first, every job. Reference build: `_engine/src/fable/Agloe.tsx` (THE TOWN THAT DIDN'T EXIST, 2026-11-09, the first fable made this way). Copy its `Plate` / `Lit` / `Rim` / desk-occluder pattern for every new fable.** On 2026-11-09 our four fable shorts (Eiffel Con, Glow, Corpse, Gold) were measured against the inspo (What the Grave, Why Cashiers Keep, The Window That, Your Brain's Secret) and all four failed on voice flow, script register, look and packaging. The Eiffel Con motion machinery stays: **copy `_engine/src/fable/ExampleShort.tsx` for scene and camera structure and build on `src/fable/motionKit.tsx`** (never `Omelette.tsx`). `references/motion-study.md` holds the frame-level motion numbers. What changed: the script voice, the narrator, 2.5D lit sets, no text in the hook, hits under the voice, and three measured gates. Applies to 9:16 shorts only; longs and Wojak mode keep their own sections.

**Gates (all three must PASS; write the results into the script .md):**
`python3 scripts/shorts_gate.py script "<script.md>" --profile fable` → `… voice public/jobs/<slug> --profile fable` → `… video "<master.mp4>" --profile fable --words public/jobs/<slug>/words.json`, plus `motion_metrics.py`. These are the numbers our old fables missed:

| | Inspo 2D | Our old fables | Gate |
|---|---|---|---|
| Pauses > 350 ms / min | 2.7–5.2 | 23–29 | ≤ 6 |
| Words per sentence | 12.9–20 | 7.1–8.8 | ≥ 12 |
| Proper names / years spoken | 0–2 / 0 | 3–12 / 1–2 | ≤ 2 / 0 |
| Colourfulness | 42–85 | 26–36 | ≥ 41 |
| Brightness | 86–171 | 80–118 | ≥ 100 (or `--night` ≥ 82) |
| Cuts / min | 12–25 | 33–48 | 10–28 |
| Ambient motion | 3.3–4.8 | 1.3–2.6 | ≥ 3.2 |
| Tail after last word | 0.04–0.49 s | 1.0–1.1 s | ≤ 0.5 s |
| Low end < 200 Hz | 0.24–0.32 | 0.34–0.69 | ≤ 0.36 |

1. **Topic and story.** Load `storytelling`. Pick a topic that passes the standard's topic test (§7): an everyday thing or a true incident with a hidden, clever system or a surprising cause, which the viewer would repeat, and which has gone viral elsewhere (check with VidIQ). Write `Dark Fables 2D/Scripts/<TITLE> (short).md` with: a `## Script` section, sourced facts, the Story Gate, the gate results and a shot plan (line, plate, framing, motion beats).
   - 40–60 s, **140–225 words**, one true story told through **roles, not names** ("a con man", "the cook", "his wife"); one name at most, late.
   - Line 1 (10–20 words) is the contradiction or the absurd action, and frame 0 shows it.
   - Sentences of 12–20 words joined with so / but / except / you see / wait. A small laugh or a spoken line about every 8 s, in the narrator's voice.
   - Twist at 45–72 %. The last line is the payoff and the film cuts within 0.5 s, on a frame that loops to frame 0. No moral.
   - Dates and places go on a badge after 2 s, never in the voice.
   - Facts stay true: if the catchy version is false, rewrite the hook ("came back and sold it again", not "sold it twice").
   - Rewrite examples of our own old lines are in the standard §1. Show the script plus its script-gate PASS to the user before building, unless they said "go".
   - Title: a question or unfinished sentence ("Why Con Men Loved the Eiffel Tower", "The Tower That Was Sold Twice"). Not a label like "THE GLOW".
2. **Voice.** **George is retired for fable shorts** (older British storyteller; the inspo is a young, casual, smiling American male who voices every character himself).
   - Until the user has picked the channel narrator, run the casting audition in standard §2 first and let the user choose by ear. Then record the voice here. **`FABLE NARRATOR = Liam TX3LPaxmHKxFdv7VOQHJ`** (audition 2026-11-09, provisional until the user confirms by ear; the alternatives are in standard §2).
   - Generate with `node --env-file=../.env.local scripts/el_voice.mjs <slug> TX3LPaxmHKxFdv7VOQHJ <script.txt> 1.1`. Tempo is never above 1.1, and `eleven_v4` ignores the speed argument.
   - Then run `python3 scripts/tighten_vo.py public/jobs/<slug>` (default gap 0.12 s), using `--keep "<twist word>:0.5"` for at most one beat.
   - Voice gate: ≥ 3.5 words/s, ≤ 6 pauses/min.
   - Then write `src/fable/<camel>Words.ts` from the tightened `words.json`.
   - Music: `scripts/el_music.py`, a new score per film, light and airy, then high-passed at 100 Hz (step 10).
3. **Timing comes from words.** Every camera key, mood snap, gesture and burst is tied to a word: `at(WORDS, 'bribe', 2)` from motionKit (nth occurrence), never a guessed second. Regenerated voice means the film follows.
4. **Camera: one keyed list per scene, and fewer scenes.** `cam: [{t, x, y, z, r, d}]`, a re-frame on nearly every phrase, so no framing lasts over 1.5 s. Moves take **500–700 ms** (350 ms only for punches), expo-out by default. Within a location, go wide → face → object → hand. **Stay in one lit room for 2–4 phrases** (target 10–28 cuts/min; our old fables made 33–48) and travel through it: a 150–300 px dolly, crane or push-in over 2–3 s between beats, with the parallax layers of step 8 moving at different speeds. `shakeAt` hits on impacts only. The first 3 s carry the biggest move of the film (motion ≥ 5.0).
5. **Transitions carry meaning** (`tin` on the scene): `dissolve` 260–300 ms while both cameras keep moving (best on a shape match), `whip` 240 ms when the story travels, `iris` 130–200 ms for a secret or name reveal, `zoom` push-through into an object, `flash` on a mood flip, hard cut only on punchlines. **Never a black dip.**
6. **Acting: something changes on every word.** Speaker's mouth from `talkMouth(t, WORDS, windows)`. Expressions switch with `snapAt` on the keyword, never tweened. Gestures via `keyed`/`armK` in 130–200 ms with overshoot, `spring` for pops, `squash` on landings and stamps, `wobble` for follow-through (hats, tags, tilts). Stagger groups by 50–60 ms.
7. **Particles and ambient life.** A `Burst` on every action word (bills, paper, rust, sparks, puffs, coins; add new kinds to `piece`). `Motes` plus at least **two moving background things per shot** (birds, flicker, smoke, steam, swinging lamp, curtains, passers-by), and the cast never freezes (blink, breathe, sway). Ambient motion must reach ≥ 3.2 (our old fables: 1.3–2.6, the biggest motion gap).
8. **Look: 2.5D lit sets** (standard §3, 2D). The inspo's flat characters stand in 3D-rendered perspective rooms; ours stood in front of flat, brown backdrops.
   - **Every location is a painted perspective plate** generated with Figma `generate_image`, as in `references/wojak-mode.md` § Plates, but in **portrait 9:16** and in the stylised 3D-cartoon prompt from the standard. Save to `_engine/public/fable/plates/<name>.png` and reuse across films.
   - **One complementary colour pair per location**, changing between locations (purple/orange, cyan/yellow, magenta/blue, cold night against a warm interior). No muddy brown or olive grade over the whole film.
   - **One practical light per plate** (lamp, neon, window, moon), with a screen-blend glow and a bloom pass. The cast gets a rim light from that side and a soft contact shadow.
   - **Three parallax layers in every shot:** plate (blur 2–6 px in close-ups), sharp cast and props, and a blurred foreground object (10–18 px).
   - `Toon` rig (big white head, ink outline, rubber-hose limbs), one `Look` per character with 2–3 identity details; this overrides feed-look §2 for fable shorts. A **face close-up (head 40–60 % of frame width) at least every 10 s**, with the expression snapping on the key word.
   - Code-drawn hero props get insert close-ups. Add reusable plates and sets to motionKit.
   - Video gate: colourfulness ≥ 41, brightness ≥ 100 (`--night` ≥ 82 for a deliberately dark film), near-black ≤ 35 %, detail ≥ 4.0 %. Agloe measured 55 / 119 / 22 % / 7.6 %.
   - **How Agloe does it** (copy it):
     - `Plate` draws the plate 1350×2400 centred, with parallax (0.38) and depth-of-field blur that grows with zoom.
     - **Anything painted onto the set is a child of `<Plate>`** (window glows, the store sign, the lamp glow), so it rides the plate's parallax. Drawn outside it, it slides off the building.
     - A character standing behind furniture gets a second `<Plate … clip="url(#deskClip)">` drawn on top, clipped to the furniture's outline in plate coordinates: the desk occludes their legs.
     - `<Lit tint="warm|dusk|teal|night">` gives the cast a colour matrix per plate, and `<Rim>` adds a screen-blended glow from the light source side.
     - Place things with `P(u, v)`, plate fractions read off a grid contact sheet of the plate.
     - Plates: generate 9:16 with `gpt-image-2.5-sunburst` at 1152×2048 (returns 864×1536), in Figma file `xWqwryqZ6RENKlUGXILclL`. Four plates covered 14 scenes.
9. **Text.** `Captions` at `y={1110}`: 1–2 words, changing on every word, snapped on, one coloured keyword via `KEY`. This overrides feed-look's 2–4 words; its placement and safe zone still stand. **Nothing else on screen before 2.0 s**: no "PARIS · 1925" pill on the hook. After that, at most **one** badge per film at top ≈ 290, carrying the date or place the voice no longer says. **Faces must clear the caption band:** keep heads above screen y ≈ 1090 in every framing, and check the numbers when placing a close-up.
10. **Sound.** Follow `.claude/skills/storytelling/references/sound-design.md` with the standard's §6 changes:
    - **Hits play under the voice.** The voice never stops for a hit; there's at most one ≤ 0.5 s beat, at the twist.
    - High-pass the score at 100 Hz; sub-thuds only at the twist; low-end share ≤ 0.36.
    - Unchanged: voice on top (VO gate must PASS), a cue for what is on screen, an ambience bed per location, a new story-sectioned score per film (`scripts/el_music.py`), mixed outside Remotion (`<FableFrame mute>` + `scripts/mix_sound.py`).
    - The master ends ≤ 0.5 s after the last word.
11. **QA, then render.**
    - Register at 1080×1920. Run `npx tsc --noEmit -p .` from `_engine/`.
    - Stills with `PUBLIC_DIR=<scratch>/pub node scripts/day_stills.mjs` (`pub` = symlinks to `jobs/<slug>` + `sfx`, run unsandboxed): about one per 1.5 s, **plus one inside every transition**. Tile, look, and fix captions on faces and hands missing their targets.
    - Render unsandboxed from `_engine/`: `npx remotion render src/index.ts <Id> <out> --public-dir=<scratch>/pub --concurrency=50%`.
    - Master with `scripts/mix_sound.py … --video <silent> --master "Dark Fables 2D/Completed/<TITLE> (short).mp4"` (two-pass −14 LUFS, VO gate must PASS).
    - **Motion gate:** `python3 _engine/scripts/motion_metrics.py <video> <out.json>` must print PASS.
    - **Shorts gate:** `python3 _engine/scripts/shorts_gate.py video "<master>" --profile fable --words _engine/public/jobs/<slug>/words.json` must print PASS (frame 0 not black, colour, light, motion, low end, tail).
    - A FAIL means fixing and re-rendering before delivery. Report the numbers honestly, then `open` the video and log it in `_engine/edit-log.md` along with the gate results.
    - Lessons from Agloe (2026-11-09):
      - `at()` normalises words, so `else's` is `elses`. Check the nth occurrence of common words against `words.txt`: the first `name`, `town` or `agloe` is often not the one you mean, and an `ease()` with a reversed range throws.
      - The first 3 s need two or three snap moves (crash-zoom with roll, then a re-frame) plus a moving light. One slow push measured 2.8.
      - `FableFrame float={1.9}` lifted ambient motion from 2.8 to 3.6.
      - Crispness: see standard §6 (the air EQ at mastering).

## 🎯 Feed Look (MANDATORY, user rule 2026-10-25)
Before every short, read `.claude/skills/storytelling/references/feed-look.md`: cinematic finish (light shafts, blurred foreground, haze, soft shadows, one muted grade), blank everyman characters (small dot eyes, adult proportions, no googly eyes), film angles (over-the-shoulder, drone, insert close-up, profile behind blurred FG; never a frontal line-up), **Instagram safe zone** (nothing in top 250 / bottom 450 / right 140 px), **mid-frame captions** (y≈1100–1200, one coloured keyword), one centred title badge (no corner HUDs), ordinary-life hook then the break, and real save-worthy steps ("FIRST: WATER"). It overrides older look, caption and HUD rules below where they conflict. **For 9:16 fable shorts, `storytelling/references/viral-shorts-standard.md` §9 overrides four feed-look rules:** bright complementary colour instead of one muted grade, no badge before 2 s, a 10–20 word first line, and ending on the payoff with no share prompt.

## Two modes (user rule 2026-10-26)
- **Normal** (default): the vector blob everyman + glowing demon look below (`fableKit.tsx`, e.g. DISCIPLINE).
- **Wojak** (user says "wojak", "wojak style", "like the doomer one"): the look of `Inspirations/Doomers path to Happiness.mp4`. Read `references/wojak-mode.md` and build from `src/fable/wojakKit.tsx` + `lineKit.tsx` (Plate, Finish). Reference film: `src/fable/Boomer.tsx` (BOOMER, 2026-10-26). In Wojak mode the demon, counter HUD and glow rules below do NOT apply; the story rules and motion rules still do.

## Folders
`Dark Fables 2D/Inspirations/` (DISCIPLINE, LUST VS LOVE: the style reference), `Dark Fables 2D/Scripts/` (one .md shot table per film), `Dark Fables 2D/Completed/`, `Dark Fables 2D/Thumbnails/`.
Code: `_engine/src/fable/<Camel>.tsx`. Pilot `src/fable/ExampleLong.tsx` (2026-10-25) holds the reusable pieces: `Guy` (poses stand/sit/hug, moods, phone, reach, guitar, `demon` variant), `Face`, set pieces (Window, Bed, Nightstand + Clock, Desk + lamp cone, LeanGuitar, Mirror with crack), `Whisper`, `Narr`, `HUD`, `Glitch`, scene table with per-scene camera. **Pull these into `src/fable/fableKit.tsx` on the first real episode**, then build on them.
Music: `scripts/gen_music_fable.py <sec> <out.wav> --hope <turn sec> --hits a,b --hush a,b` (sad piano → hopeful at the turn, low booms on the hits, pad only in the hush window). Job dir `_engine/public/jobs/<slug>/music.wav`. No voice.

## User verdict on the pilot
Style approved. **Motion and storytelling must be clearly better than the pilot** in every real episode. The pilot was too static (characters slide in and pose, little acting, long holds, small figures in wide frames) and its story was a list of states, not a story with moments. The rules below fix that and are mandatory.

## Storytelling rules (mandatory)
- **Length 2.5–3 min, 28–40 scenes of 3–6 s.** Three acts: **the loop** (habit feels good, ~35%), **the cost** (it takes something real, ends at rock bottom, ~35%), **the turn** (one small action, withdrawal, a slow win, ~30%).
- **Open on one line of narration** that sets a contradiction ("He had seen a thousand women." / "Every day started the same."), then show, don't tell. Narration cards ≤ 6 per film, ≤ 10 words each, white, lower-case-ish sentence case.
- **Concrete specific moments, not states.** Not "he scrolls a lot" but: the alarm 5:00 → snooze → 8:47 "again."; a missed call from Mom; a friend's message left on read; an untouched gym bag by the door. Every scene shows ONE action with a consequence.
- **A second character** to give stakes (crush, friend, parent, younger sibling) with tiny speech bubbles. The lesson lands through what he loses or almost loses with them.
- **The demon is a character:** it starts small and friendly ("just one more."), grows bigger and closer each act (scale 0.6 → 1.4), touches his shoulder, whispers *his own excuses*, and finally speaks *as his reflection*. At the turn it fights back (glitch, scream), then shrinks and fades over the hopeful scenes. Never kill it outright. The last shot shows it tiny, still watching.
- **A running counter** that tells the story by itself (DAY 1 → 25 → 47 → 112 → 301; SEEN 1,140 / KNOWN 0; MISSED CALLS 14). It resets or flips meaning at the turn.
- **A turning-point object** introduced early and paid off at the turn (the 5:00 alarm, the guitar, a photo, a notebook). The last scene **calls back the first shot** with one thing changed.
- **The thesis is 2 lines** at rock bottom or the ending: setup line (dimmed) + bold line ("But lazy isn't who you are. / It's what you repeat.").
- **End on an image, not a lecture:** "DAY 1." stamped big, or a quiet hopeful frame, then a short title card.
- Write the shot table first (t, scene, action, demon, text, SFX) into `Scripts/<TITLE>.md`, and show it to the user before building unless they said "go".

## Motion rules (mandatory)
- **Characters act, they don't pose.** Idle breathing (body scaleY 1 ± 0.015 at ~0.3 Hz), blinks every 2–4 s, head turns and tilts toward what they look at, a squash/settle when sitting or landing, walk cycles (legs alternate ±20°, body bob 6 px) whenever someone crosses a room, and hands that move to objects (reach → grab → bring to face). Add anticipation (small dip) before a big move.
- **Faces carry the scene:** emotion changes on the beat (flat → tired → sad → wide → smile). Close-ups (scale ≥ 2.2, head fills ~40% of frame) at every emotional peak: at least one every 20 s.
- **Characters big in frame:** default framing has the character at ~45–55% of frame height. Wide shots only to establish a new place (≤ 1 per location).
- **Camera always moves:** slow push or drift every scene, plus a motivated move per act (whip pan to the demon, push-in to the face, tilt down to the phone, rack from the window to the bed). Hard cuts on action, a fade through black only for time skips.
- **Transitions with meaning:** match cuts (phone screen → eye, alarm digits → next day's alarm), the counter ticking during a cut, light flicker cuts.
- **Living light:** phone glow pulses and colour-shifts on his face, the lamp flickers once at bad moments, the moon/sun moves across days, the room warms (amber wash) as he recovers. Dust motes or rain on the window for depth.
- **Parallax depth:** a blurred foreground layer (bed post, lamp, plant edge) moving faster than the room on camera moves.
- **Text animates:** whispers write on letter by letter with jitter and pink glow; the big red insult shakes and smears (chromatic split); narration fades in line by line.
- **Hit points:** the music `--hits` land on the crack/scream/rock bottom; the visuals hit on the same frame (shake 10–14 px, red glitch 0.2–1 s).

## Shorts mode
See the 🔒 section at the top and `storytelling/references/viral-shorts-standard.md`. `Omelette.tsx` is the old, static build (17.5 % still frames): keep it for history only. The four 2026-11 fable shorts (Eiffel Con, Glow, Corpse, Gold) are the "before" of the 2026-11-09 study: copy their motion code, but not their scripts, voice, grade or sets. Inspo: `Inspirations/shorts/` (What the Grave, Why Cashiers Keep, The Window That, Your Brain's Secret; How Nine Tails and How a Jungle are the 3D references for build-it-3d and 3d-facts).

## Detail level (MANDATORY, user rule 2026-10-28)
Follow feed-look §7 (2D). In short: characters with identity details, cel shading and clothing folds; every room furnished with at least 6 story-true props; a visible light source and light pool in every shot; grain and texture over large fills. If SVG can't reach the painted look, generate background plates and layer the characters in code on top.

## Look
1920×1080, 30 fps. Background `#0b0b0e`, floor line `#2a2a30`. Everyman: cream `#ECE6D8` blob head (r 58) with dot eyes and line mouth, capsule body, thick round limbs. Demon: same silhouette in near-black with a pink `#ff2d78` (lust/dopamine) or red `#ff3344` (laziness/anger) glow outline, slanted eyes, smile, soft radial glow. Fonts: Nunito (narration, HUD), Patrick Hand (whispers). HUD top-left small caps. Vignette always.

## Workflow
1. Topic + shot table (above). 2. Music: `gen_music_fable.py` with `--hope` at the turn, `--hits` on the peaks, `--hush` at rock bottom. 3. Build `src/fable/<Camel>.tsx` from the kit, register at 1920×1080. 4. QA stills (`scripts/day_stills.mjs`, `PUBLIC_DIR=<scratch>/pub` holding the `jobs/<slug>` + `sfx` symlinks) every ~6 s, tile and look: is the character big enough, is there an action in every frame, are the faces readable? 5. Render unsandboxed `npx remotion render src/index.ts <Id> <out> --public-dir=<scratch>/pub --concurrency=50%` (SVG, fast). 6. Master `-af loudnorm=I=-14:TP=-1.5:LRA=11` → `Dark Fables 2D/Completed/<TITLE>.mp4`, `open` it. 7. Thumbnail 1280×720: the demon behind the character, a big 1–2 word title (DISCIPLINE.). 8. Log in `_engine/edit-log.md`.
