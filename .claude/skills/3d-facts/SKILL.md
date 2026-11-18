---
name: 3d-facts
description: "3D Facts" shorts (9:16, ~50–60 s): one surprising true fact about your body, brain or a strange true incident, told as a fast, continuous, second-person story ("If you…", "You're almost asleep when…") in a lit, textured three.js world with the rigged everyman, X-ray / glass-body inserts and an explainer-graphics layer (rings, arrows, icons, label pills) on every claim. Follows the Viral Shorts Standard with three measured gates (`scripts/shorts_gate.py --profile facts`). Built with buildKit inside Remotion; output `3D Facts/Completed/`. Use when the user says "3d facts", "fact short", "next fact", "make a 3D fact about ___", "why does your body ___", or names a 3D Facts topic. Not for "how to build a ___" (build-it-3d) or 2D story shorts (dark-fable-2d).
---

# 3D Facts (body, brain and true-oddity shorts in 3D)

## 🔒 Viral Shorts Standard (user rule 2026-11-09, overrides anything below that conflicts)
**Read `.claude/skills/storytelling/references/viral-shorts-standard.md` and load `storytelling` before every job.** On 2026-11-09 our five Facts shorts (Falling Jolt, Brain On A Crush, 3AM Cringe, Mike the Headless Chicken, Never Hold A Sneeze) were measured against the inspo (*Your Brain's Secret* for the script, *How Nine Tails* and *How a Jungle* for the 3D). Our topics were the most relatable we have; our **delivery** was a lecture, and all five failed:

| | Inspo | Our Facts | Gate (`--profile facts`) |
|---|---|---|---|
| Words / speech span | 145–277, 3.5–4.0 w/s | 143–167, **2.7–3.2 w/s** (slowest of ours) | 170–240, ≥ 3.6 w/s |
| Pauses > 350 ms / min | 1.7–6.1 | 21–26 | ≤ 6 |
| Words per sentence | 12.7–20 | 7.3–11.1 | ≥ 11 |
| so/but/you-see turns per min | 8–14 | 3.4–7.5 | ≥ 3.5 connectors / 100 words |
| Lecture signposts | none | "Here's why.", "Here's what's happening.", "It's called a ___." | banned |
| Frame 0 | the scene | **black** in all five | luma ≥ 25 |
| Motion inside shots | 4.5–5.0 | 1.7–3.1 | ≥ 4.4 |
| Ambient motion | 3.1–3.3 | 1.0–1.9 | ≥ 3.0 |
| Near-black pixels | 10–21 % | 15–69 % | ≤ 22 % (`--night` ≤ 35 %) |
| Tail after last word | 0.3 s (2D) | 1.1–2.1 s | ≤ 0.6 s |

**Three gates, in order; write each result into the script .md:**
1. `python3 scripts/shorts_gate.py script "../3D Facts/Scripts/<NN - Title>.md" --profile facts`, before the voice is generated.
2. `python3 scripts/shorts_gate.py voice public/jobs/fact-<slug> --profile facts`, after `tighten_vo.py`, before building pictures.
3. `python3 scripts/shorts_gate.py video "../3D Facts/Completed/<Title>.mp4" --profile facts --words public/jobs/fact-<slug>/words.json`, before delivery.

The gate script runs from `_engine/`.

Also read `.claude/skills/storytelling/references/feed-look.md` (safe zone, depth layers, detail level §7). The standard §9 lists the feed-look rules it overrides.

## Folders and code
- `3D Facts/Scripts/NN - <Title>.md` (sections: `## Script`, `## Visual beats`, `## Fact check` with sources, `## Story Gate`, `## Gates`), `3D Facts/Completed/<Title>.mp4`.
- Code: `_engine/src/build/Fact<Camel>.tsx` + `fact<Camel>Words.ts`, registered in `src/Root.tsx` at 1080×1920, 30 fps (`<Composition id="Fact<Camel>" … durationInFrames={Math.round(<X>_SEC * 30)}/>`).
- Built on `src/build/buildKit.tsx` (`Human`, `Mat`/`TEX`, `Boulder`, `Tree`, `SkyDome`, `Sun`, `Shadows`). **Start new films from `FactTickle.tsx`** (2026-11-09, the first Fact made to the Viral Shorts Standard). It has the orbit camera, the overlay layer (pill, meter, rings pinned with `projector`, stopwatch, path arrow), one-word captions, the canvas wallpaper and tile textures for detail, `RobotArm`, and no fade-in. The best references for other techniques:
  - `ExampleFact.tsx`: X-ray glass animal, self-drawing nerve paths, organ badges, a map follow-cam, posters, a festival crowd.
  - `FactSneeze.tsx`: fresnel glass anatomy bust with airway tubes and flow arrows.
  - `FactCrush.tsx`: a glass head with a self-drawing brain circuit, two outfits on the everyman.
  - `FactCringe.tsx`: a canvas "home video" on a ceiling, a memory-cube mind space, an apartment-block ripple.
  - `FactJolt.tsx`: X-ray muscles parented to bones, a pit the floor falls into.
- Job dir `_engine/public/jobs/fact-<slug>/`: `script.txt`, `voice.mp3` + `words.json` (from el_voice, then tightened), `music_plan.json` → `Music/fact-<slug>.mp3`, `music_auto.py` (optional volume automation), `gen_sfx.py` (ElevenLabs SFX into `SFX/Generated/<slug>/`), `make_cues.py` → `cues.json` (every cue says what is on screen), `silent.mp4`, `mix.wav`. Copy these four .py/.json files from `fact-mike/` and edit them.

## Topic
Pass the standard's topic test (§7): **an everyday experience or a true oddity, with a surprising cause the viewer would repeat to a friend, already viral elsewhere** (check with VidIQ `vidiq_youtube_search`, order viewCount, and `vidiq_outliers`).
- Good: the hypnic jerk, a held sneeze, why you cringe at 3 a.m., why your stomach growls when you're nervous, why onions make you cry, why you can't tickle yourself, why a song gets stuck in your head, the headless chicken that lived 18 months.
- Avoid: a fact with no picture, or a lesson ("you should drink more water").
- Title: a question or unfinished sentence about the viewer: "Why Your Body Jolts Awake…", "Your Brain's 3 A.M. Secret", "The Chicken That Lived Without a Head". Not "The Falling Jolt".

## Script (170–240 words → 48–62 s at ~3.8 words/s)
Write it like the inspo's *Your Brain's Secret*, never like a lecture:
1. **Line 1 (10–20 words): the strange experience or action, with the cause held back.** "If you fall asleep holding two steel balls, you might wake up a genius." / "You're almost asleep when your whole body slams awake like you just fell off a cliff, and your brain did that on purpose."
2. **Walk through it in the second person, present tense, as a chain of cause and effect** joined by so / but / you see / now / which means. Every mechanism is shown as something happening to *you* ("your hands go limp, the balls smash into the plates, and the noise jolts you awake"), never as a definition. The science term may appear once, **inside** a sentence ("…a strange halfway state called hypnagogia, where…"), and never as "It's called X."
3. **One surprise turn at 45–70 %** ("But Thomas Edison was rumored to do it on purpose." / "Some scientists think it's an old reflex from when falling asleep meant falling out of a tree.").
4. **A small laugh about every 8 s** ("Sounds like the worst nap ever.").
5. **The last line is the payoff that flips line 1, then cut** ("…so you wake up holding the idea instead of the balls."). No advice, no "so next time", no "the lesson". The final frame loops into frame 0.
- At most one proper name, and no years in the voice (a date goes on one badge after 2 s). Banned: "here's why", "here's what's happening", "did you know", "let's".
- Facts stay true: hedge hypotheses in the sentence ("some scientists think"), and source everything in `## Fact check`.
- Run the **script gate** until it passes. Show the script to the user unless they said "go".

## Voice
1. From `_engine/`: `node --env-file=../.env.local scripts/el_voice.mjs fact-<slug> <voiceId> public/jobs/fact-<slug>/script.txt 1.1`. **Never tempo above 1.1.** `eleven_v4` ignores the speed argument.
2. `python3 scripts/tighten_vo.py public/jobs/fact-<slug>`: every silence trimmed to 0.12 s (default). Use `--keep "<word>:0.5"` for at most one beat (e.g. Mike's silence after "show.").
3. **Voice gate** (≥ 3.6 words/s, ≤ 6 pauses/min). Brian `nPczCjzI2devNBz1zQrb` is the current voice, and it passes with a joined-sentence script plus tempo 1.1 and tighten 0.12 (Tickle: 3.99 words/s, 1.1 pauses/min). The old choppy Falling Jolt script still fails after tightening. If he still fails, run the casting audition in standard §2 and let the user pick (a warmer, younger conversational voice suits body facts).
4. Dump the **tightened** `words.json` to `src/build/fact<Camel>Words.ts`.

## Look
- **One world, 4–9 sets, all lit and textured** (feed-look §7 3D). People are the rigged `Human` with outfit tints and portalled props (hair, hats, an axe in `RightHand`). Every surface gets `<Mat tex=…/>`. Use `SkyDome`, `Sun`, `<Shadows/>`, fog, particles (dust in light beams, snow, steam, sparks).
- **Exposure:** near-black ≤ 22 % of pixels (`--night` ≤ 35 %). Night scenes need about 2× the light you think (hemisphere ~1.4, moon 2.6, lamp 3), plus a rim light on the hero, warm/cool contrast and a visible practical light. The Falling Jolt measured 69 % near-black: never again.
- **The body-inside shot is the signature:** a fresnel glass shell (`glassMat`; a flat-opacity shell is invisible) with organs, nerves or muscles inside that light up, flow or switch off on the words.
- **Explainer-graphics layer on every claim** (from *How Nine Tails*), as an HTML/SVG overlay inside the safe zone:
  - a pulsing target ring around the part;
  - red arrows pushing in;
  - icons: ✓, ✕, battery, heart, clock, thermometer, BPM counter;
  - a small rounded label pill top-centre (y ≈ 300) naming the part or chemical ("NOREPINEPHRINE", "BRAIN STEM").
  
  Each draws in over 6–10 frames with back-ease. **Nothing but captions before 2.0 s.**
- **Captions:** one word at a time, mid-frame (y ≈ 1100–1200), Inter Tight 800 white with a soft shadow, one coloured keyword (yellow, red for danger).
- **Frame 0 is the hook action, fully lit, already moving.** No fade-in. Our old Facts opened on black.

## Motion
- 28–58 cuts/min is fine (the 3D inspo makes 32–55); what was missing is **motion inside each shot**: target ≥ 4.4, ambient ≥ 3.0.
- **Every shot travels:** an orbit of 15–40°, a crane, or a 0.5–1.5 m dolly over 2–3 s, expo-out at the beat start. Never a slow 2 % push.
- **Something always moves in the world:** the Human breathing or fidgeting, steam, curtains, particles, pulsing glows, a flicker.
- The first 3 s carry the biggest move (motion ≥ 4.0): the jolt, the sneeze, the axe.
- Cut on motion (pose change 0.1 s before the cut, as in Mike's axe).

## Sound
Follow `.claude/skills/storytelling/references/sound-design.md` with the standard's §6 changes:
- **SFX play under the voice.** The voice doesn't stop for hits; there's at most one ≤ 0.5 s beat.
- A new ElevenLabs score per film from `music_plan.json` (sections cut on story words; ask for "light, airy, no sub-bass"). Measure its sections and automate the volume with `music_auto.py`: ElevenLabs ignores "fade to silence". Then high-pass the score at 100 Hz.
- 20–30 story-specific SFX via `gen_sfx.py`, an ambience bed per set, and cues in `make_cues.py` written as what is on screen.
- Render silent, then `python3 scripts/mix_sound.py public/jobs/fact-<slug>/cues.json public/jobs/fact-<slug>/mix.wav --video <silent.mp4> --master "../3D Facts/Completed/<Title>.mp4"`. The VO gate must PASS, at −14 LUFS. **End ≤ 0.6 s after the last word.**

## Workflow
1. Topic test + script `.md` → **script gate** → show the user (unless "go").
2. Voice → tighten → **voice gate** → words module.
3. Music plan + SFX list + cue sheet (all keyed to words, so a new take moves everything).
4. Build `src/build/Fact<Camel>.tsx`: a shot table keyed to words with `at(WORDS, 'word', n)`, sets shown only while their shot is live, an overlay layer for the graphics and captions. Register it in `Root.tsx`.
5. QA stills (unsandboxed): `PUBLIC_DIR=<scratch>/pub node scripts/day_stills.mjs Fact<Camel> <out> 0 <secs…>`, where `pub` holds symlinks to `jobs/fact-<slug>`, `sfx` and `models`. Check second 0.0 (lit, not black), exposure, every claim's graphic, faces and hands visible, and text inside the safe zone.
6. Render silent (unsandboxed, from `_engine/`): `npx remotion render src/index.ts Fact<Camel> public/jobs/fact-<slug>/silent.mp4 --public-dir=<scratch>/pub --concurrency=3 --gl=angle --timeout=120000` (~6 min). In a background shell, prefix `cd <abs>/_engine &&`.
7. Mix and master (Sound), then the **video gate**. On FAIL, fix and re-render. Then `open` the video.
8. Log it in `_engine/edit-log.md` (code, job, sets, buildKit additions, lessons, all three gate results).

## Lessons from Elevator / Fingers / Foot (2026-11-16)
- **Shared kit.** `src/build/factKit.tsx` now holds what every Fact used to copy from FactTickle: `M`, `rbox`, `ctex`, `tileTex`, `Glow`, `Motes`, `Box`, `glassMat()`, `Path`/`Flow`/`curve`, `makeCam(SHOTS, SHAKE, handheld)` (orbit camera with optional `follow(t)` to track a moving object, e.g. a falling elevator car), and the overlay pieces `Pill`, `RingO`, `Icon` (✓/✕), `Arrow` (red push-in arrow), `Bars`, `Caption`. Start new films from FactElevator / FactFingers / FactFoot, which use it.
- **New poses** in buildKit: `float` (weightless), `crouch` (about to jump), `crossleg` (sitting cross-legged on the floor with a controller), `wobble` (standing on a numb foot).
- **Motion.** Close-up / studio sets (glass hand, cross-section, giant foot) measured in-shot 3.3 with the default 0.36 rad orbit; pass `SHOTS.map(s => ({...s, orbit: Math.max(s.orbit ?? 0, 0.8)}))` and `makeCam(…, 0.08)` from the start. A tall shaft the camera follows (FactElevator) gets 7+ for free.
- **Follow-cam offsets** must include the set origin (`[SH[0], carY(t), 0]`), or the camera films empty space.
- **One bad word reference kills every render**: Root imports all comps, so a `wt('which', 3)` that doesn't exist throws at module load and breaks other films' renders too. Check every `wt()` against words.json before rendering.
- **Font fetch timeouts** (Google Fonts) can fail a render at start: retry with `--timeout=240000`. Don't run two Chrome jobs (stills + render) at once.
- **Low end.** A fingers mix measured 0.36 with the score at −17 dB + HP 100 Hz; use HP 120 Hz twice and −18.5 dB for soft plucked scores.

## Lessons from FactTickle (2026-11-09)
- **Camera.** Lerping a→b alone measured 3.1 in-shot motion. Every shot needs an extra ~20° orbit around its look point, plus a handheld of 0.05 m and a 0.03 m look jitter (`camAt` in FactTickle). The first shot starts far and pushes in fast (0.55 s expo-out).
- **Detail.** Plain plaster walls measured 3.6 % edge detail. Use canvas textures with real pattern: wallpaper, tiles, grids (`wallTex`, `tileTex`).
- **Poses.** `flail` is authored for a body lying down; standing it looks broken. For seated laughing use `giggle`. New seated poses in buildKit: `tickle`, `giggle`, `lab`; plus `reach` (standing, tickling someone).
- **Robot arm.** `RobotArm` with yaw `a = π/2` points along +X. Base 0.5 m from the target, `b ≈ 1.0`, `c ≈ 1.25` lands the foam tip at about 0.9 m height (scale 0.62).
- **Hands.** The ReadyPlayerMe hands rarely land exactly on a prop. Check stills from the camera that will film it, and move the prop to the hand, not the hand to the prop.

## Lessons from the first five films (keep)
- 9:16 is only ~0.52 × distance wide at fov 50: close-ups need 1.2 m+, and a lying body needs a top-down or foot-end angle.
- Glows with depthTest off clutter any shot where limbs sit between the camera and the subject: shoot the head from above the chest.
- Head bone frame: +Z forward, +Y up; hair caps need z +0.015 and −0.25 rad pitch. Outfit tints multiply a red-brown texture, so use light blue or light pink to get distinct people.
- Thin glass on a light backdrop vanishes: use the fresnel rim shader. Iron texture reads as rust blotches on big walls; light it from two sides.
- A camera behind a standing Human sees only his back or hat brim: move him per shot. Banner text must auto-fit (measureText).
- A ceiling plane rotated [π/2,0,0] reads upright from the foot of the bed; check text on stills.
