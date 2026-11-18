# Viral Shorts Standard (MANDATORY for Dark Fable shorts, Build It 3D and 3D Facts, user rule 2026-11-09)

**What this is.** On 2026-11-09 the six inspo shorts in `Dark Fables 2D/Inspirations/shorts/` were measured frame by frame and word by word against all 12 of our shorts (4 fable shorts, 3 Build It, 5 Facts). Report: https://claude.ai/artifact/JqLx8vGL6CEEiDDHpGM3mv (raw data was in that session's scratchpad).
- Inspo 2D, four story shorts (one channel): *What the Grave*, *Why Cashiers Keep*, *The Window That*, *Your Brain's Secret*. Our fable shorts are matched against these.
- Inspo 3D, two "How a ___" shorts (another channel): *How Nine Tails*, *How a Jungle*. Build It and Facts are matched against these.

The user asked that every future short in these three formats stand out like theirs. **Read this file before writing a script for any of them.** Every rule below comes from a measured gap. The gate script `_engine/scripts/shorts_gate.py` checks the numbers. All 6 inspo shorts pass it; all 12 of our old ones fail it.

## 0. The five gaps, in order of cost
1. **Voice flow.** Their narrator pauses (> 350 ms) 2–6 times a minute; ours paused 20–29 times. Their sentences average 13–20 words; ours averaged 7–10.
2. **Script register.** They write like someone telling a friend gossip; ours read like a documentary (names, dates, places, fragments, morals).
3. **Look.** Their 2D characters stand in lit, perspective, 3D-feeling rooms with bright complementary colour. Our fables sat in front of flat brown or dark-teal backdrops (colourfulness 26–36 against their 42–85). Their 3D has real materials plus an explainer-graphics layer; Build It was untextured toon colour.
4. **Motion.** The 2D inspo cuts about 19 times a minute (ours 33–48) but the camera keeps travelling inside each lit room. The 3D inspo moves about twice as much inside each shot as ours (4.5–5.0 against 1.7–3.1).
5. **Packaging.** They pick question topics, end on the payoff within 0.5 s, and never open on black. All 8 of our 3D shorts opened on a black frame.

Not the gap (don't spend time here): loudness (−14 LUFS everywhere), music level under the voice, first-word timing, number of locations.

## 1. Script: talk like a friend telling gossip
Run `python3 _engine/scripts/shorts_gate.py script <script .md or .txt> --profile fable|build|facts` on every draft. It reads the `## Script` section of an .md. It must PASS before the voice is generated.

| Measure | fable | build | facts | Inspo |
|---|---|---|---|---|
| Words | 140–225 | 230–285 | 170–240 | 145–220 (2D), 269–277 (3D) |
| Mean words per sentence | ≥ 12 | ≥ 11 | ≥ 11 | 12.7–20 |
| Sentences under 5 words | ≤ 4 | ≤ 4 | ≤ 3 | 0–4 |
| First sentence words | 10–20 | 10–20 | 10–20 | 12–20 |
| Proper names (capitalised, not sentence-first) | ≤ 2 | ≤ 1 | ≤ 1 | 0–2 |
| Years spoken | 0 | 0 | 0 | 0 |
| Connectors per 100 words (so, but, except, you see, wait, then, until, instead, now, because) | ≥ 3.5 | ≥ 4 | ≥ 3.5 | 3.6–6.3 |
| "you" share of words | any | ≥ 4 % | ≥ 4 % | 0.5–9.7 % |
| Banned | "here's why", "here's what's happening", "here's the thing", "let's", "in this video", "did you know", "so remember", "the lesson", "the moral", any CTA, "part N" |

**The seven rules** (every inspo transcript follows all of them):
1. **Line 1 is a contradiction or an absurd action, with the reason held back.** The rest of the video answers it.
   - "Gambling is illegal in Japan, yet there's a gambling hall on almost every street."
   - "If you fall asleep holding two steel balls, you might wake up a genius."
   - "They buried a man alive with a bell tied to his finger."
   - "He scanned a customer's lottery ticket, saw it had won a million dollars, and said, sorry man, not a winner."
   - "In legends, a fox with nine tails is the wisest creature in the forest. In real life, it couldn't catch a single mouse."
2. **Anonymous everyday people.** "A man", "the cashier", "the guy next door", "his wife", "you". At most one real name, and late if possible (*Your Brain's Secret* holds "Thomas Edison" until 40 % in, as a rumour). A date or place goes **on screen as a small badge after 2 s**, never into the voice.
3. **Present tense and "you".** Put the viewer in the scene: "So, you win a bucket yourself and try to cash it in."
4. **Join sentences with connectors, don't stop.** "So," "But," "Except," "You see," "Wait, practiced?" They re-hook every 5–8 s and keep the voice flowing. Write commas where we used to write full stops. One-word lines ("Divers." "Noon." "Boots outside.") are not allowed except one per film as a deliberate beat.
5. **A small laugh or spoken line about every 8 s, voiced by the narrator himself.** "you go check. No, you go check." · "story of my life" · "sounds like the worst nap ever" · "at least in his head". Humour also works in sad stories, as dry irony.
6. **The last line is the payoff, then cut.** "…and the house was all hers." · "…on paper, nobody gambles." · "…wake up holding the idea instead of the balls." No moral, no lesson, no "so if your boss…", no vote, no share prompt. (Build It keeps "Congratulations, you have built a ___", which the 3D inspo uses too.)
7. **Show the science inside an action, never a lecture.** Not "It's called a hypnic jerk. Here's what's happening." Instead: "the second you fall asleep, your hands go limp, the balls smash into the plates, and the noise jolts you awake."

**Rewrites of our own lines** (do this to every draft):
- ❌ "New Jersey, 1917. Grace Fryer is 18, painting glowing numbers on watches. The paint is radium. To keep the brush sharp, the girls use their lips."
  ✅ "She licked poison every single day, because her boss told her it was perfectly safe. You see, her job was painting glowing numbers onto watches, and the glow came from radium, so to keep the brush tip sharp, every girl in the room would dip it, paint, and slide it right back between her lips."
- ❌ "In 1925, a man sold the Eiffel Tower. Then he came back to sell it again. His name was Victor Lustig, and he was a con man."
  ✅ "A man sold the Eiffel Tower to a scrap dealer, and then he came back and sold it again, because the first buyer was too embarrassed to tell anyone he'd been robbed."
- ❌ "You're almost asleep. Then your whole body slams awake, like you just fell off a cliff. That's not a dream. It's called a hypnic jerk. Here's what's happening."
  ✅ "You're almost asleep when your whole body slams awake like you just fell off a cliff, and the weird part is that your brain did that on purpose. You see, the second you drift off, your muscles start switching off one by one, but the part of your brain that's still awake notices you going limp, and to it, that only means one thing."

## 2. Voice: continuous, natural speed, a friend's register
Run `python3 _engine/scripts/shorts_gate.py voice _engine/public/jobs/<slug> --profile …` after every generation. It must PASS before any picture work.

| Measure | fable | build | facts | Inspo |
|---|---|---|---|---|
| Words per second (speech span) | ≥ 3.5 | ≥ 3.7 | ≥ 3.6 | 3.5–4.0 |
| Pauses > 350 ms per minute | ≤ 6 | ≤ 6 | ≤ 6 | 1.7–6.1 (ours were 20–29) |
| Longest pause | ≤ 0.7 s | ≤ 0.7 s | ≤ 0.7 s | 0.42–1.02 s |

**Pipeline (always in this order). Tested recipe, 2026-11-09: both first builds passed with it.**
1. `node --env-file=../.env.local scripts/el_voice.mjs <slug> <voiceId> <script.txt> 1.1`. Tempo is **1.1, never higher**: `atempo` keeps every pause in proportion and makes the read sound phasey. `eleven_v4` **ignores** `voice_settings.speed` (tested: 22.8 s vs 22.9 s), so don't rely on the 5th argument.
2. `python3 scripts/tighten_vo.py public/jobs/<slug>` (default `--max-gap 0.12`, tested). It cuts every silence inside the read down to 0.12 s from the middle, with fades, and remaps `words.json`. 0.20 s was not enough: whisper still heard 8–14 pauses/min. Keep at most one deliberate beat with `--keep "word:0.5"`. Originals are kept as `voice_loose.mp3` / `words_loose.json`, and re-running starts from them. Results: Agloe (Liam) 3.22 → 3.64 words/s, 13.6 → 3.1 pauses/min; Tickle (Brian) 3.50 → 3.99 words/s, 13.9 → 1.1 pauses/min.
3. `shorts_gate.py voice …` (it measures pauses with whisper small.en, the same yardstick as the inspo). **Tightening alone is not enough:** the old Falling Jolt script, tightened, still fails (3.54 words/s, 8.5 pauses/min) because it has 7 sentences under 5 words. Every sentence end is a prosody pause the tightener can only shorten. If the gate fails, join sentences (rule 4) and regenerate. Don't stretch.
4. Write `<camel>Words.ts` from the **tightened** `words.json`. All timing hangs off it.

**Casting.**
- **Fable shorts:** the 2D inspo narrator is a young, casual, smiling American male (estimated pitch ~190 Hz) who voices every character himself. George (older British storyteller) is the opposite register and is **retired for fable shorts**. **Audition held 2026-11-09:** Liam `TX3LPaxmHKxFdv7VOQHJ` (young, energetic American), Will `bIHbv24MWmeRgasZH58o` (young, relaxed) and Chris `iP95p4xoKVk53GoZ742B` (casual, down-to-earth). At tempo 1.1 + tighten 0.12 they read 3.72 / 3.52 / 3.65 words/s. **Liam was used for the first fable (provisional, until the user confirms by ear;** the clips are in `_engine/public/jobs/aud-*`). If the user picks another, record it in `dark-fable-2d/SKILL.md` step 2. The original audition procedure, for any new candidate:
  - Pick 3 young, conversational American male voices from the ElevenLabs voice library. Liam `TX3LPaxmHKxFdv7VOQHJ` is already on the account; find two more with the voices list API (search young / casual / conversational).
  - Read the same ~60-word inspo-style paragraph with each, then run `tighten_vo.py` and `shorts_gate.py voice` on each.
  - Send the user the two best by the numbers to choose by ear. Record the winner's ID in `dark-fable-2d/SKILL.md` step 2 and use it on every fable short after that, as one channel voice.
- **Build It and Facts:** the 3D inspo narrator is a deeper male, so Brian `nPczCjzI2devNBz1zQrb` may stay, but only at tempo ≤ 1.1 plus `tighten_vo.py`, and only if the gate passes. If Brian can't reach the words/s floor, audition as above.
- **Dialogue:** the narrator does character lines in his own voice, inside the sentence ("…and the lady at the counter smiles and says, wow, congratulations, just wait right here"). No separate character voices in these three formats.

## 3. Look
### 2D (fable shorts): 2.5D lit sets
The inspo puts flat ink-outline characters inside **3D-rendered, perspective, lit rooms**. Do the same:
- **Every location is a painted perspective plate**, generated like Wojak plates (`dark-fable-2d/references/wojak-mode.md` § Plates: Figma `generate_image`, saved to `_engine/public/fable/plates/<name>.png`). Generate 9:16 (portrait) and leave margin for camera travel; keep zoom ≤ 1.6. Prompt pattern:
  > "Stylized 3D-rendered cartoon set for a premium animated short, <specific place full of story props>, strong perspective with a receding floor, <one practical light source: warm lamp / neon sign / window shaft / moonlight> with soft bloom, saturated complementary colours (<pair, e.g. purple dusk outside and warm orange lamp inside>), soft global illumination, thin painterly ink outlines, shallow depth of field, open floor space in the middle ground, no people, no text, no logos."
- **Complementary colour pair per location**, changing between locations: purple/orange, cyan/yellow, magenta/blue, cold-blue night against warm interior. Feed-look §1's "one muted grade, 60–70 % saturation" does **not** apply to these formats.
- **Light the cast to match the plate.** Rim light on the side facing the plate's source (a gradient stroke or `light` on `Toon`), a soft contact shadow on the plate's floor, a radial screen-blend glow at the source, and a bloom pass (blurred copy, screen blend, ~30 %) on practical lights.
- **Three depth layers on every shot:** plate (background, blur 2–6 px when the camera is close), cast and props (sharp), a blurred foreground object (10–18 px). On camera moves the layers parallax: foreground ×1.4, background ×0.6.
- **Big faces.** A face close-up (head 40–60 % of frame width) at least every 10 s, with the expression snapping on the key word (`snapAt`).
- **Dense props** on the plate plus 2–4 code-drawn hero props that act (ticket, jar, letter) with insert close-ups.
- Video targets: brightness ≥ 100, colourfulness ≥ 41, near-black ≤ 35 %, detail ≥ 4.0 %. A deliberately dark film passes `--night` (brightness ≥ 82, near-black ≤ 46 %), but colourfulness and detail still apply.

### 3D (Build It, Facts)
- **Real materials on every surface.** `<Mat tex=…/>` everywhere (dirt, stone, bark, wood, plaster, fabric, brick…), soft cast shadows (`<Shadows/>` + `Sun`), ambient-occlusion-like contact darkening (dark blurred decals under objects), `SkyDome` with clouds, fog for depth, and particles (dust, smoke, snow, sparks) in every outdoor shot. Build It's old "clean, toy-like, no realism attempt" rule is **retired**.
- **Explainer-graphics layer on every claim** (from *How Nine Tails*): a target circle (gold or green ring) around the subject, red arrows pointing at the part, an X-ray or transparent view of the inside, simple icons (battery, ✓ green, ✕ red, heart, clock), and a small rounded label pill top-centre naming the part ("MASSIVE HIPS", "ROPES OF ICE"). These draw in over 6–10 frames with back-ease and are animated: rings pulse, arrows push in.
- **Lighting with a mood:** a key light plus rim light on the hero, a warm/cool contrast, never a flat hemisphere-only scene. Night scenes need moonlight + rim + particles. Near-black ≤ 22 % (`--night` ≤ 35 %).
- Video targets: brightness ≥ 100, colourfulness ≥ 41, detail ≥ 4.1 %.

## 4. Motion
| Measure | fable | build / facts | Inspo |
|---|---|---|---|
| Cuts per minute | 10–28 | 20–58 | 2D 12–25, 3D 32–55 |
| Motion inside shots | ≥ 4.7 | ≥ 4.4 | 2D 4.8–8.1, 3D 4.5–5.0 |
| Ambient motion between moves | ≥ 3.2 | ≥ 3.0 | 3.1–4.8 (ours 1.0–2.7) |
| Motion in the first 3 s | ≥ 5.0 | ≥ 4.0 | 2D 5.5–16.2, 3D 4.1–5.5 |
| Static frames | ≤ 2.5 % | ≤ 1.5 % | 0.6–2.3 % |

- **Fables:** fewer cuts and more travel. Stay in one lit room for 2–4 phrases and move the camera through it (dolly, crane, push into an object), then use a motivated transition. Ambient life never stops: blinks, breathing, sway, particles, flicker, steam, passers-by.
- **3D:** keep the cut rate and **double the motion inside each shot**. Every shot has a camera move of real travel (orbit 15–40°, crane, dolly 0.5–1.5 m in 2–3 s), not a 2 % drift. Something in the world always moves (water, smoke, rope sway, the Human's idle, particles), and overlay graphics animate in.
- The first 3 seconds are the busiest of the film: the hook action happens on frame 0 with a camera move already under way.

## 5. Text on screen
- **Nothing but captions before 2.0 s.** No title pill, location badge, date, HUD, counter or "PART" tag in the hook. The hook is picture plus voice.
- At most **one** badge per film after 2 s, for the date or place the voice no longer says ("PARIS · 1925").
- Captions: keep each skill's caption rules (1–2 words for fables, 1 word for Build It and Facts, mid-frame, one coloured keyword per feed-look). The inspo uses plain white small sentence-case captions; the coloured keyword stays because it's the user's standing rule.

## 6. Sound (overrides `sound-design.md` §2 (this folder) for these three formats)
- **Hits play under the voice; the voice doesn't stop for them.** At most one deliberate pause beat per film (`tighten_vo.py --keep`, ≤ 0.5 s) at the twist. Picture hits land on the word itself.
- **Less low end.** High-pass the score at 90–120 Hz (`ffmpeg -af highpass=f=100`) before `mix_sound.py`. Use sub-thuds only at the twist. Target low-end share ≤ 0.36; ours were 0.39–0.69. Ask ElevenLabs music plans for "light, airy, plucked, no sub-bass".
- The VO gate in `mix_sound.py` still must PASS.
- **Crispness (air above 4 kHz).** Our masters measure about 0.05, against 0.12–0.13 for the 2D inspo. If the video gate fails on crispness, add a presence lift at mastering, after `mix_sound.py`:
  `ffmpeg -i <master> -c:v copy -af "highshelf=f=3000:g=8,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k <final>`
  Then listen for harsh "s" sounds and re-run the gate. Tested on Agloe: shelf +5 dB → 0.075, +8 dB at 3 kHz → 0.094 (PASS). Do not add `deesser`: it removes the same band (Agloe fell back to 0.05).

## 7. Packaging
- **Frame 0 is the hook picture at full brightness.** No fade from black, no black lead-in. The gate fails at mean luma < 25.
- **End within 0.5 s of the last word** (fable ≤ 0.5, facts ≤ 0.6, build ≤ 1.9 to hold the finished build), on a frame that loops back into frame 0.
- **Titles are questions or unfinished sentences** about an everyday thing: "Why Cashiers Keep…", "What the Grave…", "The Window That…", "Your Brain's Secret…", "How a ___…". Not labels like "THE GLOW" or "The Falling Jolt".
- **Topic test** (all three must be yes):
  1. Is it an everyday thing with a hidden, clever system or a surprising cause behind it?
  2. Would the viewer repeat the answer to a friend?
  3. Has the topic already gone viral elsewhere? Check with VidIQ `vidiq_youtube_search` (order viewCount) or `vidiq_outliers`. The grave-bell topic had 108.9M views on Zack D. Films before the inspo used it.

## 8. Gates, in order (write each result into the script .md)
1. `shorts_gate.py script` → PASS before generating the voice.
2. `shorts_gate.py voice` → PASS (after `tighten_vo.py`) before building pictures.
3. Format QA stills, then render.
4. `shorts_gate.py video <master.mp4> --profile … --words public/jobs/<slug>/words.json` → PASS before delivery. Fable shorts also keep `motion_metrics.py`. On FAIL, fix and re-render. If the user explicitly accepts a FAIL, report each failing line honestly.

## 9. What this overrides
- **feed-look.md:** §1 "one grade, desaturated, 60–70 % saturation" → bright complementary colour per location. §4 "title badge in the opening shot" → no badge before 2 s. §5 "first line ≤ 9 words" → 10–20 words. §6 "end on a challenge or share prompt" → end on the payoff. All other feed-look rules still apply (safe zone, depth layers, light sources, detail level, captions mid-frame).
- **storytelling SKILL.md:** "one *named* protagonist / identifiable victim" → one specific person, named by **role** ("the cashier"). "Payoff + lasting line (a lesson…)" → payoff only, no lesson.
- **sound-design.md §2** for these formats, as in §6 above.
- **dark-fable-2d:** George voice, tempo 1.28, flat sets. **build-it-3d:** "toy-like, no realism attempt", Brian at ×1.1 without tightening, 0.15 s fade from black.
