# Animation Studio

Claude makes animated videos here, fully in code (Remotion + three.js), in three formats:

| Say | Skill | Folder |
|---|---|---|
| "fable short", "dark fable", "2d fable", "wojak" | `dark-fable-2d` | `Dark Fables 2D/` |
| "3d facts", "make a 3D fact about ___" | `3d-facts` | `3D Facts/` |

Before any script or plan, load the `storytelling` skill and pass its Story Gate.
Sound: follow `storytelling/references/sound-design.md`. Sounds go in `SFX/Library/` and `SFX/Generated/`, music in `Music/`.

## Rendering
Props must be `{plan: …}`. If Remotion's bundled Chrome crashes, keep the Chrome for Testing setting in `_engine/remotion.config.ts`. Run `npx remotion render` from `_engine/`.
