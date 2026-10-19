# SD v3 — integrated weapons, 2026-10-19

## Delivered assets and implementation

Built-in imagegen generated the SD redesign from the user's preserved `art/reference/valkyrie.png`. No external paid API or CLI fallback was used. Sources: `art/generated/sd-v3/`; runtime: `public/assets/sd-v3/`. Prior v2 source/runtime files remain intact. Runtime now loads SD sheets and the small original fallback sheets, not the eleven v2 sheets.

72 authored poses across seven accepted sheets: player 16, run 8, combat-spaced 12, grunt 8, rusher 8, guard 8, boss 12. These are source poses, not 72 distinct runtime animation states. Runtime PNG total approximately 5.6 MB; all generation sources including rejected combat layout approximately 12 MB.

`npm run assets:pack-sd` runs connected-alpha extraction, assigns small components to nearest silhouette, retains translucent edge pixels, nearest-neighbor scales once with a fixed scale per source sheet, and aligns manually reviewed pelvis/ground anchors. It never paints over or morphs the artwork. Frames are 512×512, four columns, origin (192,420), rendered at 0.5 scale. Asymmetric horizontal origin gives extended weapons room; the renderer mirrors the origin for left-facing sprites. Source originals retain full resolution. The HUD is an ordinary crop of the authored idle head.

`src/game/animation/sd.ts` selects frames using simulation attack timing. `src/data/motions.ts` contains the weapon/foot envelopes and shared contact-pose threshold. `combat.ts` sweeps the union of current and preceding 1/60-second contact envelopes when poses change. Collision checks depth independently from Z; startup/recovery cannot hit, and the attack ledger prevents duplicates. Hurt heights are 95 world pixels (boss 115), with a deliberately forgiving 32px body width excluding hair/weapons.

The SD sprite includes its own weapon. Separate weapon rendering is disabled for all SD actors. The old free-floating weapon arc was removed. Boss slam retains a visible ground shockwave matching its area attack. F1 overlays green hurtbox, red strike height and yellow depth footprint.

## Generation sequence and prompt set

Common prompt: production transparent SD pixel-art game sprite sheet; approximately three heads tall, bold outline and simplified readable armor; consistent head/body size and feet baseline; all poses face right; every weapon physically attached to the hand; full uncut silhouettes with generous transparent gutters; no text, grid, shadows or effects.

1. `player.png` — reference Valkyrie redesigned with silver braid, winged helmet, blue/gold armor and white skirt. 4×4 grid: four run keys; four sword slash keys; four kick keys (knee up, extending, full kick, returning); idle, low rising preparation, upward slash, tucked airborne jump. Accepted as identity/pose reference and kick/idle/jump source.
2. `run.png` — use player sheet as identity reference, eight connected run keys in 4×2 grid: contact, recoil, passing, flight, opposite contact, recoil, passing, flight. Sword at waist pointing forward throughout. Accepted for locomotion. Leg silhouettes vary less than a hand-animated cycle; no claim of fully bespoke in-between animation.
3. `combat.png` — 4×3 grid of slash, rising and reactions from player reference. Rejected runtime layout: extended sword touches neighboring hair, producing eleven instead of twelve connected silhouettes.
4. `grunt.png` — same SD style; masked ash raider, rust-red scarf, charcoal/copper armor, short broad sword. 4×2: idle, two walk contacts, run, raised windup, forward strike, hit, down.
5. `rusher.png` — grunt style reference; violet hooded rogue, pale mask, amber eyes, dagger; same eight role-specific poses with lunge.
6. `guard.png` — grunt style reference; broad teal/bronze knight, round shield, short sword; same eight poses with shield-forward movement and sword thrust.
7. `boss.png` — grunt style reference; black/crimson Ashen King, horned crown, red cape, greatsword. 4×3: idle/two walk/run; windup/strike/hit/down; charge prep/charge/overhead slam prep/ground slam.
8. `combat-spaced.png` — edit rejected combat sheet to preserve the twelve poses but repack 3×4 with smaller silhouettes and approximately 80px clear gutters. All twelve silhouettes then separated successfully. Accepted.

Generation files were copied from Codex generated_images outputs; retained filenames in order:

- player: exec-c64ee24d-09b3-4980-923c-5581092fcbf1.png
- run: exec-a4290207-30de-4027-9765-321c1ad10939.png
- rejected combat: exec-b6cecf93-590a-49eb-a2cd-66c17ccd9483.png
- grunt: exec-f91ccaa7-5bc6-442f-8b8f-a0f882b630a6.png
- rusher: exec-fffbc549-70dc-4153-8c7e-5a9fe7590bfb.png
- guard: exec-7cdac25c-0629-410f-ae8e-a36d54654ed5.png
- boss: exec-c490204b-6616-438e-ab94-98eea1abbb9e.png
- accepted combat: exec-a27c0e8d-a91b-4189-8a89-87309a2e9fc7.png

## Motion and difficulty

Run uses eight frames at 16 fps, walk the same sheet at 9.5 fps. Attack key poses are deliberately timed to startup/contact/recovery rather than all running at one frame rate. Slash2 reverses the slash contact sequence; air attack reuses sword poses at actor Z. Idle and jump use held poses; guard, land/recovery and knockdown reuse authored poses. Enemy locomotion uses three keys and attacks use windup/contact/return, not a fully bespoke eight-frame cycle for every action. Generated cloth/armor details still vary slightly across source sheets.

Grunt sustained speed 132→158, burst 215→245; rusher 175→210; guard 112→135; boss 145→170. Initial decision delay .22→.12s, flank commitment .65→.48s; post-attack extra recovery grunt/guard .36→.24s, rusher .55→.34s, boss .42→.30s (.28→.20 enraged). Attack telegraphs and two-attacker reservation cap remain, as do facing/depth commitment, separation and boss enrage pattern. HP and damage were not inflated. Player hitstop .055→.033s, rising .045s; received hitstop unchanged. Double-tap run and all anti-juggle rules retained.

## Verification

`npm run verify`: PNG checks (72 SD poses plus legacy), lint, typecheck, 49 unit/integration tests, production build. `npm run test:e2e`: seven Chromium tests including actual keyboard combat, double tap, interruptions, boss, pause/restart, fallback, relative paths and SD review/flip/all enemies. Input-only deterministic playthrough still clears all four encounters and thirteen enemies without HP/damage overrides.

Visual review: original sheets and separation masks; in-game normal and F1 screenshots; run/slash contact strips; left/right full kick; shield thrust; boss slam and actual boss combat. A left-facing asymmetric-origin offset was found and corrected during review. `sd-review.html` supports slow playback, scrubbing, actual-size comparison and flip; its playback table is a review aid, while game timing is authoritative in TS.

Headless Chromium local RAF intervals, 240 samples: before changes median16.7ms, p9516.8ms, max16.8ms; after changes boss scene median16.7ms, p9516.7ms, max16.8ms. These are short local samples in different encounters, not a hardware benchmark or proof that all user-device stutters are eliminated. See `docs/screenshots/sd-performance.json`. Other browsers and remote hosting were not tested or deployed.
