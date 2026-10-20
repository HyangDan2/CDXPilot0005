## v0.4 two-handed update

Two new built-in imagegen sheets add24 two-handed poses; prior sources retained. Current selector uses twohand/defense, no separate sword. Prompt set and validation: [TWOHAND_V4.md](art/TWOHAND_V4.md).

## Current SD v3 pipeline

The user-approved SD integrated-weapon pipeline supersedes the separate body/sword requirement below. See [SD_V3.md](art/SD_V3.md) for sources, generation prompt set, rejected layout, extraction, anchors and checks. v2 remains an archived reference.

# Eira v0.2 — reference-based generated art

The user supplied `art/reference/valkyrie.png` after the initial release. The built-in image generator produced the master, separate action sheets, sword and portrait sequentially. Source files are preserved in `art/generated/`; the first run draft is retained for comparison but is not shipped.

- Runtime: `public/assets/characters/eira-v2/`, 384×384 cells, foot origin (192,350), constant display scale 0.48. The larger canvas was chosen after inspecting gold/face detail.
- 72 unique drawn poses: idle 6, walk 8, run 8, slash 6, slash2 6, rising 6, kick 6, jump/landing 6, air attack 6, reactions 8 (4 hit + 4 down), guard 6.
- Jump/Fall/Land select the appropriate parts of the shared jump sequence. Recovery combines a down pose, landing/crouch poses and idle. Death reuses the down sequence and holds/fades. These are explicit reuse, not claims of separately generated poses for every logical frame.
- `scripts/sprite-components.mjs` identifies disconnected alpha silhouettes; this avoids naive grid cuts across long braid/fist extensions. Small neighboring alpha components are assigned spatially. Three-pixel translucent edges are retained. Original RGB/alpha values are not repainted.
- `scripts/eira-spec.mjs` stores visually reviewed roots and individual sword-hand coordinates in source space. Fixed scale per sheet preserves crouching versus standing height; no per-frame stretching.
- `npm run assets:pack-eira`: extract and align silhouettes, emit per-action PNG strips and metadata, pack portrait/sword and copy the full-resolution master. It requires the committed original sheets; it does not invoke image generation.
- `npm run assets:check`: checks legacy assets AND new atlas dimensions, meaningful transparent area, edge clipping, keyframe counts and anchor bounds. Human review remains required for anatomy and design consistency.
- Sword v2: immutable 512×171 PNG, grip (90,85.5), tip (491,85.5), constant scale 0.21. The body hands are empty; the image rotates around the actual grip and uses each pose's hand metadata. Effects remain separate.
- The title uses the original-resolution master; normal play uses the transparent atlas; HUD uses the separate portrait. Missing v2 textures fall back to original procedural textures without a crash.
- `public/art-review.html` compares each clip at 384 px and actual gameplay scale, including its hand marker. Inspect all poses before accepting replacements.

The original art below remains the **legacy fallback pipeline**. `assets:generate` only regenerates that legacy set and cannot overwrite Eira v2. Sources and normalized generation prompts are documented in `docs/art/PROMPTS.md` and `docs/art/UPGRADE_QA.md`.

---

# Art pipeline and provenance

## Original MVP assets

No supplied reference image was present in the workspace. `scripts/assets.mjs` draws all artwork from original rectangles/polygons and seeded detail. It generates transparent body sprite sheets for Eira, Grunt, Rusher, Guard and Hollow King, a separate oathblade, distant ruins and terrace masonry. No scraped artwork, stock resource, AI-generated collage, external font or audio sample is used. AudioEngine synthesizes original tones/music; effects use Phaser graphics. Empty audio/effects folders are conceptual asset slots, not missing runtime files.

Current art is intentionally a programmatic MVP: restrained palette, repeated masonry, limited pose articulation. It is not represented as final hand-drawn commercial animation. Character differences currently share a base body silhouette with palette/helmet/shield/scale changes. Replacing them with richer original artwork is the next visual milestone.

## Canonical format

- PNG RGBA; body cells **48×64**, 8 columns, 60 used frames (64 grid cells).
- Origin **(0.5, 0.9375)** = foot line at pixel Y 60. Common body gameplay scale 1.65, boss 2.65; title hero uses an additional display-only scale.
- Idle 4, Walk 6, Run 6, Jump 4, Fall 4, Land 4, Attack 4, Kick 4, RisingSlash 5, Hit 3, Knockdown 4, Recovery 4, Guard 4, Death 4.
- Both slashes and air attack share the 4 body attack poses; the independent weapon motion differentiates them. Idle/Walk/Run/Guard loop. Pose FPS is 10 (Run 14).
- `public/assets/manifest.json`: real frame offsets/counts, origin, dimensions, FPS, sword pivot, resource paths.
- Sword **52×12**, grip **(8,6)**, blade length constant 39. Only rotation/translation/mirroring and fixed display scale are allowed; never frame-dependent length scaling.
- Distant background 960×270; world background 1800×270; rendered at ×2 with nearest-neighbor sampling.

## Commands and processing

```bash
npm run assets:generate
npm run assets:check
node scripts/assets.mjs extract input.png /tmp/my-frames 48 64
node scripts/assets.mjs pack /tmp/my-frames /tmp/packed.png
```

Generation builds each body pose in an identical transparent canvas, assembles sheets and writes metadata. Extraction accepts only exact regular grids; it writes PNG frames and `frames.json`. It also extracts trailing grid padding, so remove blank trailing frames from that imported manifest after review. Packing reads frames.json, centers each smaller frame horizontally and aligns its feet to the common bottom. Oversized frames fail rather than silently crop. Packed metadata is written beside the PNG. Preserve canonical transparent foot padding when replacing art; pack does not infer a character's anatomy or foot location.

Validation checks existence, exact sprite dimensions, used frame counts, nonempty content, transparency ratio and clear outer pixel borders per frame (catching frame overflow). It checks sword dimensions. The runtime synthesizes fallback textures for missing/failed PNGs; release validation deliberately still fails on missing assets. Manifest itself must exist for compilation.

## Required human QA

A rectangular crop is not sufficient validation. Inspect every imported frame on both dark and checkerboard backgrounds for letters, painted backgrounds, extra limbs, missing hands, neighboring-frame contamination and cut silhouettes. Automated transparency/border checks cannot detect all these semantic faults. Do not mark imported or AI art production-ready based only on the checker. Current procedural sheets have no embedded text/background and no drawn body weapons.

## Weapon anchor calibration

Body hand is approximately pixel (37,42). At gameplay scale, anchor is +21 facing pixels and -30 vertical pixels relative to the foot. Attack raises it by 3.3 pixels; rising frames raise it incrementally. `rig.ts` provides the matching translation and rotation. ActorView uses sprite origin (8/52, 0.5). The same sword PNG is used in every frame; swing arcs are in a separate effect layer. Use F1 to inspect the yellow grip marker. Tests verify PNG dimensions and pivot-to-tip length across angles and mirrored facings.

## Replacement workflow

Keep original input art outside generated outputs; add provenance before importing. Extract → inspect → normalize/pack → update manifest and `rig.ts` together → assets:check → test → verify → E2E → inspect screenshots. Commit generator/source, PNG and metadata in the same change. Use Git LFS if source art grows large; avoid bloating history with repeated huge raw exports. Do not run generate after manually replacing outputs unless you intend to overwrite them with canonical procedural assets.

## Retro player refresh (2026-10-19)

42 new authored player poses, lower resting braid and compact 1990s pixel style. Provenance, prompt constraints, frame mapping and limitations: [RETRO_V6.md](art/RETRO_V6.md). Repack with `npm run assets:pack-sd`; inspect `/sd-review.html`.

## Smooth v7

See [smooth motion notes](art/SMOOTH_V7.md) for 162 new poses, provenance, anchor changes and validation limitations.

See [v8 combo and branding](art/COMBO_V8.md) for source provenance, prompts and limits.

## v0.7

See [ranged/roll artwork and music provenance](art/RANGED_V9.md). `npm run assets:pack-sd` includes sd-v9 sources. Run `npm run audio:generate` for battle and result music.

## Eira original style restoration

[Style v10](art/STYLE_V10.md) documents the single original idle reference, nine regenerated Eira sheets, prompts, source IDs and registration. Enemy sheets remain unchanged.


See [Touch / v11 artwork](art/TOUCH_V11.md) for current source provenance, registration rebuild, touch input lifecycle and platform verification limits.

## v12 costume and bow continuity

See [READINESS_V12.md](art/READINESS_V12.md) for all 11 source sheets, original generation IDs, prompts, rejected-sheet repair and visual limitations. Run `node scripts/prepare-sd-v12.mjs` before `npm run assets:pack-sd` to reproduce the 146 revised Eira poses. v12 registration overrides v11; originals are preserved.

## Non-destructive size review

See [2026-10-20 size audit](art/SIZE_REVIEW_2026-10-20.md). `node scripts/audit-actor-size.mjs` records measurements and hashes without repacking runtime artwork. `/actor-size-review.html` compares an existing-frame idle sequence and a provisional uniform air-attack scale; both are preview-only. The reference copy is byte-identical to the approved v10 source.

## Approved idle cadence and bow preview

[Idle application / bow review](art/BOW_IDLE_REVIEW_2026-10-20.md) records the applied existing-frame sword sequence, two preview-only bow cadence candidates, and why integrated air-attack scaling was retired to preserve sword length. All original PNGs remain unchanged. Open `/bow-idle-review.html` for visual comparison.

## Courtyard environment prototype — 2026-10-20

The widened courtyard tiles, wooden barricade, debris, vent grille, warning markings and flame triangles are original procedural Phaser graphics authored in `src/game/scenes/EnvironmentView.ts`. They use no external artwork or generated bitmap files. Barricade geometry, height and maximum HP come from `src/data/environment.ts`; the view displays simulation-owned HP and flame phase. Barricade depth sorting uses its ground/depth center, independently of its visible height. The warning sound is an original synthesized tone in `src/game/ui/AudioEngine.ts` and follows the existing SFX volume control.

These are prototype visuals. The flames use geometric shapes and the barricade has a single damaged appearance plus debris, rather than authored animation frames. No character sheets, source PNGs, manifests or asset generation steps change. If replaced with raster art, preserve originals and introduce fixed transparent canvases and collision/anchor metadata through the existing asset pipeline.

## Localized bow hand colors and effects preview

[Hand fix and effects](art/HAND_FIX_AND_EFFECTS_2026-10-20.md) records the selected built-in imagegen output, final prompt, restricted RGB compositing and alpha/geometry invariants. Run `node scripts/pack-hand-fixes.mjs` before `npm run assets:pack-sd` to rebuild the two corrected bow sheets. Original v12 sources remain unchanged. `/attack-effects-review.html` shows silhouette-protected effects outside gameplay.

## Stone cloister cover — phase 2

The three masonry piers, capstones, seams, runes, ground footprints and passage chevrons are original code-authored Phaser graphics in `src/game/scenes/EnvironmentView.ts`. Their geometry/height comes from `pillarDefinitions` in `src/data/environment.ts`; ground vertices come from the same `depthProfile` used by simulation. Each pier sorts by ground/depth center and fades only for visual occlusion; collision and arrow interception remain unchanged when translucent.

No external or AI-generated raster assets are introduced by phase 2, and no sprite sheets or asset-generation commands are changed for this feature. Stone geometry is deliberately simple prototype art; alpha fading and marked footprints keep the combat area readable.
