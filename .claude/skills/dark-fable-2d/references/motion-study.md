# Motion study: the Dark Fable shorts inspo, frame by frame (2026-11-01)

Source: `Dark Fables 2D/Inspirations/shorts/` "What the Grave" (59.6 s) and "Why Cashiers Keep" (57.8 s), both 30 fps (1 frame = 33.3 ms).
Method (`_engine/scripts/motion_metrics.py`): per-frame luminance diff + phase-correlation camera shift (Python on raw frames), histogram cut detection, 1 fps contact sheets, 30 fps strips around every transition, whisper word timestamps.
**Read this before building any Dark Fable short.** It explains *why ours look static* and gives the numbers to copy. Implementation: `_engine/src/fable/motionKit.tsx` (demo build `src/fable/ExampleShort.tsx`).

## 1. The numbers

| Measure | What the Grave | Why Cashiers Keep | Our ONE OMELETTE |
|---|---|---|---|
| Frames with no motion (diff < 0.3) | **0.6 %** | **2.3 %** | **17.5 %** |
| Mean frame diff inside shots | **8.1** | **7.4** | **0.78** (10× less motion) |
| Hard cuts (histogram) | 12 | 24 | 16, each with a 100 ms black dip |
| Fast moves ("bursts", diff > 12) | 21 | 26 | 17, and they are only the cuts |
| Burst length, median | **700 ms** (p25 100, p75 930) | **400 ms** (p25 170, p75 620) | n/a (a slow push over the whole scene) |
| Gap between bursts, median | **1.1 s** | **0.7 s** | 3–5 s |
| Ambient motion between bursts (median diff) | 4.8 | 3.6 | 0.53 |
| Narration pace | 3.7 words/s | 3.5 words/s | 3.3 words/s |
| Word length, median | 220 ms | 220 ms | n/a |
| First spoken word | 0.00 s | 0.00 s | 0.00 s |
| Twist | 63 % ("he was never dead") | 72 % (the guy from the store wears a badge) | 72 % |

**The single biggest difference:** they never let the frame rest. A fast, eased move happens **about once a second**, and between moves something small is *always* moving (a face, a hand, particles, the camera's float). Ours does one slow linear push per scene and nothing else.

## 2. Camera: a virtual 3D camera, not a zoom on a picture

The sets are built as 3D-feeling rooms (strong perspective floors, walls with depth, cross-sections), and the camera *travels* inside them:
- **Snap dolly-in, 400 ms, ease-out.** Wide counter → Kyle's face → down to the ticket in 12 frames: scale ramps ~1 → 2.5 fast at the start and settles (expo-out, like `bezier(0.16, 1, 0.3, 1)`). Then a slow residual drift for the rest of the beat.
- **Crane / tilt reveals, 600–700 ms.** Bell on the grave → camera rises and pulls back to show the underground cross-section with the "dead" man and the bell rope (Grave 3.9–4.6 s). The reveal *is* the information.
- **Every phrase gets its own framing.** Inside one location the camera re-frames on almost every clause (counter wide → face → ticket → hand → face). These re-frames count as most of the "bursts". A location rarely holds one framing longer than 1.5 s.
- **Ambient float never stops.** Even "held" shots drift 1–3 px/frame and breathe in scale; the measured mean diff in calm stretches is 3.6–4.8, far from 0.
- **Shake only on impacts** (door slam, police reveal): 3–5 frames, decaying.

## 3. Transitions: motivated, short, and mostly *not* hard cuts

| Type | Frames | Example |
|---|---|---|
| **Move-through** (camera keeps moving, next shot dissolves in under it) | 8 frames / 260 ms dissolve while the pull-back continues | bell close-up → coffin room ("Well, he was never dead") |
| **Shape-match dissolve** | 9 frames / 300 ms | Kyle's round smiling head → the full moon over his dream yacht |
| **Foreground-object wipe** | ~6 frames | top-down camera tilts through the green hat, the hat fills the frame, dissolves into the next store with the hat now in the foreground |
| **Iris / spotlight** | 4 frames / 130 ms | trash can → Kyle's face inside a soft circular spotlight (the "secret" moment) |
| **Hard cut on action** | 1 frame | used for punchlines and for rapid 100 ms inserts (Grave 38.9–41.4 s: four cuts in 2.5 s) |
| **Flash / white bloom** | 3–4 frames | "the next morning": white bloom, then the car |

Rule: every transition carries meaning (same shape, same object, same direction of travel). There's no black dip, ever.

## 4. Characters: micro-acting on every word

- **The face changes every 66–200 ms while someone talks.** In the coffin close-up (Grave 5–8 s) the face swaps expression or mouth shape every 2–6 frames: wide eyes → X eyes → grin → flat → open mouth. The cashier lady changes mouth shape on nearly every syllable of "Wow, congratulations, just wait right here". It's limited animation (pose swaps), but **synced to the voice**.
- **Expression snaps land on the keyword.** Flat → grin happens in **2 frames** exactly on "fishing" (Cashiers 13.3 s), and suspicious → smug lands on the punchline word. No tween; a snap reads as a joke.
- **Gestures are 4–6 frames (130–200 ms) with overshoot.** An arm raises the ticket in 4 frames and settles. The rubber-hose arms flail with a follow-through (Kyle "elbow deep in the trash": the arm whips, overshoots and wobbles).
- **Blink every 2–4 s; sweat drops, eyebrow flicks and head tilts** are the idle layer.
- **Secondary motion and particles sell the action:** paper scraps fly out of the trash (6–8 pieces with spin), bills burst on "he owed money", dirt specks drift in the cross-section, a scanner beam flickers red on the ticket, fireworks behind the dream yacht.

## 5. Captions

- **1–2 words per caption** (rarely 3), switching on *every word*, so captions change at ~3.5 Hz. Snap on: no pop, no fade, no scale.
- White bold sans (Inter/Arial Black feel), thin black outline plus a soft shadow, small (~4 % of frame width per letter cap height). Always the same spot: **centred at ~70 % of the frame height**.
- For our channel, feed-look §4 still applies (mid-frame y ≈ 1100–1200, one coloured keyword) because it's the user's standing rule; copy the inspo's *timing* (1–2 words, snap, every word), keep our *placement and keyword colour*.

## 6. Flow and story (what the motion is serving)

- The first frame is the most extreme image ("buried alive with a bell tied to his finger", "saw it had won a million and said: not a winner"), and **the first word lands on frame 0**.
- Second person and asides re-hook every 5–8 s: "You see,", "Except", "Wait, practiced?", "So,".
- Every sentence has a picture that *does* something: the line "the whole street is out on their porches" is shown as a drone glide down the street, not as a still.
- The twist at 63–72 % is followed by a fast "explainer" run (top-down camera, rapid inserts, a wall of photos), then a quiet final image that loops to the start.

## 7. Why ours looked static, and what to change (the checklist)

| Ours (Omelette, Discipline) | Do instead |
|---|---|
| One linear push per scene (`push: [1.0, 1.12]` over 3–6 s) | **Camera keyframes per phrase**: a 350–700 ms expo-out re-frame every ~1 s, plus a residual drift and an always-on float (`motionKit.cam`). |
| Hard cut + 100 ms 50 % black dip | **Motivated transitions**: move-through dissolve (260 ms), shape match (300 ms), foreground wipe, iris (130 ms), whip pan (230 ms with directional blur). Hard cuts only on punchlines. |
| Arms at fixed angles, faces change once per scene | **Talk-driven mouth flaps** from `words.json` (open/close at ~8–10 Hz while the speaker's words play), **mood snaps on keywords** (`moodAt(t, [[t, mood]…])`), gestures of 130–200 ms with overshoot (`springTo`). |
| No secondary motion | **Particles on every action word** (bills, paper, rust flakes, sparks, steam) with gravity and spin; ambient motes always on. |
| Squash/stretch missing | Landings, stamps and slams get a 120–180 ms squash (scaleY 0.82 / scaleX 1.15 → 1). |
| Captions in 3-word chunks with a scale pop | 1–2 words, switch on every word, snap on (1 frame). |
| ~16 shots per minute | 14–18 locations per minute, but **40–60 framings** per minute (re-frames inside a location count). |

## 8. Result: THE EIFFEL CON (first motionKit build, same metrics)

| Measure | Inspo | Omelette (before) | **Eiffel Con** |
|---|---|---|---|
| Static frames | 0.6–2.3 % | 17.5 % | **2.95 %** |
| Mean diff inside shots | 7.4–8.1 | 0.78 | **4.74** (6× Omelette) |
| Bursts / gap median | 21–26 / 0.7–1.1 s | 17 / 3–5 s | **52 / 0.77 s** |
| Burst length median | 400–700 ms | n/a | 133 ms (our moves are snappier and shorter) |
| Ambient motion between bursts | 3.6–4.8 | 0.53 | **1.31**, still the biggest remaining gap |

Next steps to close the gap: longer camera moves (500–700 ms instead of 350 ms), more travel *inside* a set between beats (a dolly or pan of 150–300 px over 2–3 s rather than a 1.6 % zoom drift), background life in every shot (people walking past, curtains, smoke, traffic), and painted plates (feed-look §7) behind the code-built cast.

**QA gate for motion (add to the stills check):** render a 30 fps strip of any 2 s and count. Pass if: the camera re-frames at least once per 1.5 s, something besides the camera moves in every frame, a face changes at least every 0.5 s while someone talks, and no transition is a black dip.
