# Retro player motion refresh — 2026-10-19

Approved reference: exec-6b14adb3-1020-4ac3-b180-c4fc724bcd22.png. Compact 1990s pixel style, front view, helmet protrusion removed, two hands in front, low idle braid approved after height correction. Built-in image_gen generated all artwork; source PNGs preserved in art/generated/sd-v3. Existing enemy sheets remain unchanged.

## Sources and prompts

- retro-idle.png: exec-02b0a348-3808-42a6-a7a3-d6c83b6a2c45.png; six idle poses, braid descends diagonally under gravity, ribbon at waist, loose tip subtly sways. Background extraction pass following exec-fceab15f-0e34-4c7a-a2d4-40f4563abea1.png.
- retro-move.png: exec-30d29741-e429-49c6-8c1a-caea415ce1bf.png; eight poses, four walking contacts/passing and four running extension/tuck phases; natural front two-hand carry, straight trailing blade, focused running expression.
- retro-attack.png: exec-85e553e0-59e4-4ad1-bad9-d013fbe33c9f.png; twelve poses, three each forward slash, reverse slash, rising and air slash. Prep/first contact/second contact, straight two-handed sword, focused expression.
- retro-action.png: exec-bb472685-a527-4960-98b6-8694f8e48b5f.png; sixteen guard/spin/jump/landing/hit/fall/prone/recovery poses. Spacing repair of exec-835a53fe-91e0-42ca-a24b-eeaff673918a.png. Distinct blocking, concentrated and pain expressions.

Shared constraints: same identity, blue/gold armor, ivory cloth, slender silver braid/red ribbon, no helmet visor protrusion, complete transparent silhouettes, no FX, rigid straight blade, natural two-hand wrists, consistent compact proportions. Anatomical consistency remains a visual review requirement, not a claim guaranteed by generation.

## Integration

scripts/sd-atlas.mjs segments alpha silhouettes, retains RGBA with nearest sampling, packs fixed 512px frames using reviewed pelvis/ground anchors and a fixed scale per sheet. Original legacy sources preserved. 42 new frames in four sheets. Portrait cropped from new idle. twohandFrame maps every supported player state and all player attacks; separate Jump/Fall/Land and hit/down/recovery. Existing simulation startup/active/recovery timing and hit ledger preserved. Active poses use shared strikePoseProgress thresholds. Review at /sd-review.html includes every new clip, scrub, flip, large and game-size views.

Limitations: four authored frames per walking/running cycle; generated cloth and limb details can vary between poses. Hitboxes remain the existing gameplay envelopes rather than pixel-perfect blade masks. Legacy enemy style is retained. No remote deployment.

## Validation

`npm run verify` passed: 138 preserved/packed frames (42 new), lint, strict TypeScript, 63 tests across 11 files, production build. `npm run test:e2e` passed all 8 Chromium cases (29.6 seconds); initial attempt hit a temporary preview-port conflict, retry completed. Review contact captures for all 11 player clips and in-game screenshot saved under docs/screenshots/retro-*.png. Inspected walk, spin, rising and live game captures; no atlas clipping in validation. Remote deployment and non-Chromium browsers not tested.
