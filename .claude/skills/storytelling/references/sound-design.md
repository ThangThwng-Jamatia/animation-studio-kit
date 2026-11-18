# Sound design (MANDATORY for every animated short, user rule 2026-11-04)

Restored here on 2026-11-09 from `paper-explainer/references/sound-design.md` when that skill was removed. Content is unchanged except the §2 exception and the dropped Paper references.
The user said the visuals were great and the sound was holding them back: effects didn't match what happened on screen, and the music was the same every time. Measured: 19 synthesised sounds across ~210 cues, and three scores 0.999 alike. One rule came from the test mix: **an SFX must never drown the voice-over.**

## 1. The voice wins, always
- Run every mix through `_engine/scripts/mix_sound.py`. It ducks the speech band (above 250 Hz) of everything else, word by word, and **the VO gate must print PASS**: every spoken word at least 8 dB above the rest in the 300 Hz–4 kHz band. A FAIL is never delivered.
- Read its "cues pressed under speech" list too. The voice being clear is half the job. If a story hit shows up there, fix the timing, don't raise the gain.

## 2. Big hits go in the pause, with the picture
> **Not for Dark Fable shorts, Build It 3D or 3D Facts (2026-11-09).** For those, hits play **under** the continuous voice and the voice never stops for them: at most one ≤ 0.5 s beat per film, kept with `tighten_vo.py --keep`. The score is high-passed at 100 Hz (low-end share ≤ 0.36). Measured reason: the viral inspo pauses 2–6 times a minute while ours paused 20–29, and this rule was one cause. See `viral-shorts-standard.md` §6 (this folder). The rule below still applies to other formats (e.g. no-voice fable longs).

- Land big hits at the **end** of the word, in the silence after the line, not on it: "And the hand grabs back." [HIT] "He's alive!"
- Move the picture hit there too: `we('back')` in the film. Sound and image land together.
- Layer them: a low-passed `sub*` thud (cannot mask speech) under the real sound. Small foley can sit under words; it's meant to.
- ElevenLabs word ends include trailing silence. The mixer finds the real end of speech, so pauses stay usable.

## 3. Every cue describes the screen
- Write cues as what happens: "rubber glove clamps underwater", never `impact`. If you can't say what the sound is, it shouldn't be there.
- Every location gets its own ambience bed. Silence between locations should change with the place.
- Every transition gets a motivated whoosh; watery in water, airy in the air.
- Repeat a sound only on purpose (a motif, like the same hull knock for HOUR 20/40/60).

## 4. Where sounds come from
1. `SFX/Library/`: real recordings (Sonniss GDC). Find with `python3 _engine/scripts/sfx_index.py find whoosh metal --max 2`. Rebuild the index after new downloads.
2. `SFX/Generated/<film>/`: ElevenLabs, for story-specific moments (about 80 credits a sound here). Reference: `_engine/public/jobs/sound/design.py` and any `public/jobs/fact-*/gen_sfx.py`.
3. The old 19 synth sounds in `SFX/*.wav`: UI ticks only.

Licence: Sonniss sounds are free for monetised video, no credit, but never redistribute the raw files or use them to train AI. Only use ElevenLabs audio generated on the paid plan (since 2026-11-04); free-plan audio is non-commercial.

## 5. Music: a new score for every film
- Never reuse a score. `_engine/scripts/el_music.py <plan.json> Music/<film>.mp3`: sections are cut to the story's words, so the score turns on the same word as the picture. Log it in `Music/used.md`.
- Pick an idea from the story's world first (1920s waltz for the Radium Girls, 1940s spy pizzicato for the Nobel heist), then let it change as the story changes.
- ElevenLabs ignores "fade to silence": measure each section and automate the volume (`public/jobs/fact-mike/music_auto.py`).
- `gen_music_fable.py` is retired for voiced shorts: every track from it sounds the same.

## 6. Workflow
Render the film muted once (`<FableFrame mute …>` for fables; three.js films render silent). Then iterate on sound in seconds with no re-render:
`python3 scripts/mix_sound.py cues.json mix.wav --video silent.mp4 --master out.mp4` (run from `_engine/`; sound paths in the cue sheet resolve from the Videos folder).
Keep `at`/word references in the cue sheet: a new voice take moves all the sound with it.
