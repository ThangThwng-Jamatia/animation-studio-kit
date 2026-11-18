# Feed Look: what stops the scroll (MANDATORY for every animated short)

Restored here on 2026-11-09 from `paper-explainer/references/feed-look.md` when that skill was removed; the content is unchanged except for the "Applies to" line and the exception below.
Source: 2026-10-25 side-by-side of viral Reels (stickocalypse_shorts "If everything collapsed today…", ~1M likes, 179K saves, 127K shares) against our WHERE IT STARTS Part 2 (1.9K views). The user said: "even I want to scroll off our videos". The gap was not one thing; it was these six. Apply all six. They override older look rules in any skill where the two conflict.
Applies to: dark-fable-2d, build-it-3d, 3d-facts, and any other animated short.

**Exception (2026-11-09):** for Dark Fable shorts, Build It 3D and 3D Facts, `viral-shorts-standard.md` §9 (this folder) overrides four rules here, based on measured inspo:
- §1 one muted grade → bright complementary colour per location;
- §4 title badge in the opening shot → nothing before 2 s;
- §5 first line ≤ 9 words → 10–20 words;
- §6 end on a share prompt → end on the payoff.

All other rules here still apply to those formats.

## 1. Cinematic finish, not a flat cartoon (biggest lever)
Flat, evenly lit, fully sharp frames read as "kids' cartoon" in under 0.5 s, and people swipe. Every shot needs:
- **Light:** a key-light direction, soft light shafts or window rays (low-opacity polygons with a blurred gradient), a warm or cool glow behind the subject, and soft gradient shading on big shapes (walls, floors, bodies). No large flat single-colour areas.
- **Depth:** 3 layers. A **blurred foreground object** (`filter: blur(10–18px)`: a cup, a bottle, a chair back, a door frame; it takes 10–25% of the frame at an edge), a sharp mid-ground subject, and a softened background (blur 4–8 px or haze).
- **Air:** haze or fog gradients outdoors, dust motes in light beams indoors, smoke from chimneys and mugs.
- **Soft contact shadows:** a blurred dark ellipse under every foot and object (never a hard grey oval). Objects cast soft directional shadows.
- **One grade per video** *(not for the three Viral-Standard formats, see the exception)*: desaturated, muted earth tones (warm sepia indoors, misty green or grey outdoors, cold teal at night) plus a vignette and fine grain. Saturation about 60–70% of "cartoon"; avoid pure primaries. Keep accent colours for the danger, the keyword or the hero object.

## 2. Characters: blank everymen, not cartoon kids
- The lead is an **everyman the viewer projects onto**: adult proportions (head ≈ 1/6–1/7 of height), simple round head, **small dot eyes**, minimal or no mouth, a cap or hair silhouette, plain clothes in muted colours. Calm, near-neutral faces. Tension comes from the situation, not the face. (Dark Fable shorts override this with the big-head `Toon` rig.)
- **No googly eyes, giant heads or huge open "shocked" mouths** unless it's a deliberate one-frame comedic beat. Big emotions go in posture, framing, light and sound.
- Never crop limbs or bodies awkwardly at the frame edge. Hands connect to arms. Feet stand on the floor with a contact shadow. A character is either clearly in frame or deliberately cropped (close-up, over-the-shoulder).

## 3. Camera: film angles, not a school photo
- **Never a frontal eye-level line-up of characters** against a flat wall.
- Rotate through these and **don't repeat an angle twice in a row**:
  - over-the-shoulder (a huge foreground object such as a phone, letter or door, with the character small behind)
  - high drone or establishing shot of the location
  - close-up insert of an object or supplies (water bottles, a cash jar, a lock)
  - side profile behind a blurred foreground (table, counter)
  - low angle looking up at a threat
  - POV
- **One subject per frame, off-centre** (rule of thirds), layered front, middle and back. Every shot moves.

## 4. Text and the Instagram/Shorts safe zone
- Frame 1080×1920. **Keep everything important out of:** the top 250 px (Reels header, back arrow, +), the bottom 450 px (username, caption, music, Vote/poll sticker, comment bar) and the right 140 px (like, comment, share and save buttons). The safe content box is x 60–940, y 250–1470.
- **Captions on shorts: ONE caption block at mid-frame, centre about y = 1100–1200** (55–62% down). Bold condensed sans (Anton / Inter Tight 900 / Oswald 700), white with a black outline and drop shadow, **exactly one keyword coloured** (yellow `#FFD23F` default; red for danger). Size about 84–100 px. No pill box. (Words per chunk: each format skill sets its own.)
- **Title or HUD: one centred badge** at y ≈ 260–520 *(the three Viral-Standard formats: not before 2 s)*. **No corner HUDs** (no top-left clock or top-right countdown sitting under IG icons). Counters, if needed, go centre-top inside the safe box.
- Never put text on a face or the key object. Never more than one text block plus captions on screen.

## 5. Hook: ordinary life first, then the break
- Frame 0 is **relatable life** (breakfast, scrolling in bed, a classroom, a checkout line) and the first line puts the viewer in it. Within 1–2 s the threat or the oddity lands. Contrast does the hooking.
- Second person, present tense *(first-line length: the Viral-Standard formats use 10–20 words)*.

## 6. Give them something to save and share
- Weave **real, accurate** facts or steps into the story. Facts stay true; source them in the script .md.
- *(Viral-Standard formats: no share prompt or challenge at the end; the payoff line is the ending. What gets shared is the surprising fact itself.)*

## 7. Detail level: rich, not "simple round figures" (user rule 2026-10-28)
The user compared our shorts with the inspo (How-you-invented rotisserie, What-the-Grave, Why-Cashiers-Keep) and asked for much more detail in characters and objects. Simple shapes with flat fills now count as unfinished.

**3D (build-it-3d, 3d-facts, any three.js scene):** build from `_engine/src/build/buildKit.tsx` (reference: `BuildWheel.tsx`, `ExampleFact.tsx`).
- People are the rigged, textured `Human` (`public/models/everyman.glb`), posed by bone aiming. Add poses in `poseDirs` and outfit tints in `TINT`. Never build people from capsules and spheres.
- Every surface uses `<Mat tex=…/>`: procedural texture plus bump. Add new textures to `TEX` instead of using flat colours.
- Organic shapes: `Boulder` (noise-displaced, smooth normals), `Tree` (bark trunk + lumpy leaf clumps). Small parts have real sub-detail: nails, bands, rims, rope, knots, cracks.
- `SkyDome` + `Sun` (soft cast shadows that follow the action) + `<Shadows/>` + fog for depth.

**2D (dark-fable-2d shorts and longs):** match the painted, lit storybook look of the dark-fable shorts inspo.
- **Characters:** ink outline with varied weight (thicker on the outer silhouette). Each character has 2–3 identity details (hair shape, moustache or glasses, hat, a uniform patch, a name tag, an apron) and clothes with a shade side and seams or folds. Hands have a thumb shape, and shoes have a sole. Each body part gets one cel shadow. A small eye highlight. Faces can be simple, but never empty.
- **Sets are rooms, not backdrops:** every interior has at least 6 specific, story-true props. Walls have texture and floors show perspective lines. Exteriors have 3 depth layers.
- **Light does the mood:** a visible source in every shot (lamp, window, moon, screen, fire) with a radial glow, a cast light pool on the floor, warm or cool rim light on characters, and soft shadows under everything.
- **Surface texture:** a subtle grain (SVG `feTurbulence` at about 4–8 % opacity) over large fills, gradients instead of flat fills, plus small wear details.
- **Objects that matter get insert close-ups** drawn at high detail.
- When a scene needs more richness than SVG can give, generate the background plate with an image tool and layer the rigged characters and moving props on top (for fable shorts this is now the default: see viral-shorts-standard §3).

**QA:** pause on any still at phone size. If a frame could pass for a kids' flash cartoon (big flat colour areas, empty walls, plain blob props), add detail before rendering.

## QA checklist (before every render)
1. Contact sheet with the **Instagram UI overlay**: draw the unsafe zones (top 250, bottom 450, right 140) as red translucent boxes over the stills and confirm nothing important sits under them.
2. Every shot has: a light direction, a blurred FG or BG layer, a soft contact shadow. No two consecutive shots share an angle.
3. Characters have no awkward edge crops; one subject per frame, off-centre.
4. Captions sit mid-frame with one coloured keyword; at most one title badge, centred.
5. The first 2 s show the hook; facts are true and sourced.
6. Detail level (§7): textured surfaces, detailed characters (3D: the rigged `Human`), at least 6 props per interior, a visible light source per shot.
