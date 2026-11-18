# Wojak mode (Dark Fables)

Style source: `Dark Fables 2D/Inspirations/Doomers path to Happiness.mp4` (Low Budget Stories). User approved the look on 2026-10-26; first film BOOMER (`src/fable/Boomer.tsx`, `Completed/BOOMER.mp4`).

## Why it looks professional
1. **Photoreal backgrounds** (AI plates), blurred a little (1.5 px wide, 9–16 px close-ups and inserts), graded per act: cold navy at night, amber when he recovers.
2. **Flat line-art characters** on top: thick ink outline (4.5), off-white skin, one shade side, a soft floor shadow, tinted by an SVG colour-matrix filter that matches the plate (`gNight`, `gDay`, `gWarm`, `gNeon` in `WojakDefs`).
3. **The story is told by objects, not captions**: phone screens held by a drawn hand (chat, stories, lock screen, a video), a tear-off calendar, a red clock, a whiteboard that writes on, stat cards. ≤ 8 short narration cards.
4. **Fast shots** (1.5–6 s), object-insert montages, a bookend location (first shot = last act), one big emotional peak.

## Plates
- Generate with Figma `generate_image`, model `gpt-image-2.5-sunburst`, 1920×1080 (returns 1536×864, fine). File "Dark Fable plates" (`xWqwryqZ6RENKlUGXILclL`, team plan). Download `image.url` with curl right away into `_engine/public/fable/plates/<name>.png` (the URL expires after 7 days). Calls can time out: retry with a shorter prompt.
- Prompt pattern: "Photorealistic cinematic film still, <empty place>, <light>, eye-level camera, shallow depth of field, haze, <grade>. Open floor in the foreground. No people, no text." Always say **no people, no text, no logos**.
- Existing plates (reuse first): bedroom_night, bedroom_morning, classroom, park_sunset, club_night, street_rain, junk (insert), gym, desk_night, dawn_road, bathroom, auditorium, street_car (badge-less coupe + café), dubai, alps, keynote, hill_sunset.
- Canva `generate-image` only returns a 199 px preview: don't use it for plates. The Higgsfield CLI install was blocked by the sandbox (curl | sh).

## Cast (`wojakKit.tsx`)
`Person` with a `Look`: BOY (17, hoodie), BOY_UP (glow-up: broad, stubble, jacket), MAYA (girl), CHAD, DAD, MOM. Lead is drawn **handsome** (user request): swept hair, angular jaw, clear eyes, bags only when tired/crying. Moods: flat, tired, sad, smile, grin, wide, closed, determined, hurt, cry. Props: phone (face glow), tears, blush, raise, hold (Flowers, Trophy, Mic, Keys, Book), clap, walk/run, sit/floor, shake. Close-ups via `CU` in Boomer.tsx (head centre at cy, s≈2.6); keep the shot's `ox` ≤ 200 at zoom 1.3, or the plate edge shows.
Original designs only: never draw Wojak/Pepe themselves or a real person's likeness (BOOMER's "Goggins video" is a silhouette runner with the quote as subtitles).

## Pipeline
Shot table appended to the user's script `.md`, Story Gate answered → plates → `src/fable/<Camel>.tsx` (a SHOTS table of {a, b, plate, zoom, blur, f, r (SVG), html (inserts)}) → music `gen_music_fable.py <sec> --hope --hits --hush` → stills via `day_stills.mjs` with `PUBLIC_DIR=<scratch>/pub` (symlink `jobs/<slug>`, `sfx`, `fable`; the real `public/` has a broken symlink) → render with `--public-dir=<scratch>/pub` → loudnorm master into `Completed/`.

## Music by mood (user rule 2026-10-26)
Wojak films change music with the story: romance → tension → sad sorrow → motivational build → majestic win. Generate one track per mood with VidIQ `vidiq_generate_music` (25 credits each, "instrumental", 35–50 s), poll `vidiq_job_poll`, curl into `public/jobs/<slug>/m_<mood>.wav`, then mix one `music_moods.wav` in ffmpeg (loudnorm each, atrim, afade 2–3 s crossfades, adelay to the act start, amix normalize=0). Duck the music to 0.25 under any clip with its own audio (BOOMER: the user's gym clip `goggins.mp4`, seconds 12–18 inside the phone at 91 s via `<Sequence from>` + `OffthreadVideo startFrom`, sized 960×960 so the picture band and captions show).
