# v0.7 ranged combat and animation QA

Built-in image generation supplied five sheets, preserved in `art/generated/sd-v9`. The approved Eira identity is retained: slender SD proportions, blue/gold armor, ivory cloth, silver braid/red ribbon, both white helmet feather wings, integrated hands/weapons. Only technical segmentation, nearest-neighbor scaling and atlas alignment follow generation.

Accepted source IDs:

- idle: 597831d2-f109-41e8-9f93-87747996a9a4
- combo: 531f94d8-a58c-431c-bbdf-0cc218562e19
- bow: 76df5e65-ee51-421a-9efb-9cb65bfd2fc4
- roll: 2a07ba80-efed-46de-a03f-b02614eadf1c
- archer: 1c1a6edd-fbf5-45cd-abd8-5adecda89edc

Generation specifications: idle—12 isolated poses, 4×3, calm breathing with lower braid and tiny tip variation; combo—24 isolated poses, 4×6, consistent small head, longer rigid straight two-handed sword, overhead cut, grounded rising cut, thrust and turning finish; bow—16 isolated poses, 4×4, idle/walk/draw/release/guard/hit/fall/equip; roll—12 poses, 6×2, sword then bow, crouch/tuck/inverted/landing/recovery; archer—16 isolated poses, 4×4, green hood/leather, aimed bow release, movement and reactions. Bow repair restored clipped lower poses; combo repairs expanded sword clearance and separated touching silhouettes. Rejected short-blade and overlapping sheets were not shipped.

Packing: 512px fixed frames, ground420, originX256 for modern sheets. v9 combo scale1.4, idle0.92, bow1.15, roll0.95, archer1.2. One scale per sheet, no per-frame body stretching. Combo source poses are selected explicitly by phase; review page matches gameplay. Compare rendered idle/attack/bow/roll at the same atlas scale; inspect both feather wings, wrists, blade alignment and foot anchors. 368 packed frames include legacy sheets, not 368 new frames. This update adds44 frames and replaces36.

The 3-second sword idle loop has restrained hair/cloth movement. Bow walk uses two poses, roll six poses per weapon; these are generated keyposes rather than a fully hand-drawn animation set. Small ornament and head-angle variations remain. Blade hitboxes remain authored envelopes, not per-pixel masks. Existing special-attack sheets are retained.

Original result music is synthesized by `scripts/result-music.mjs`: major fanfare11.52s and minor lament27.2s, with a320ms battle fade. These are medieval-inspired synthesized arrangements, not sampled orchestral recordings. `npm run audio:generate` regenerates all four tracks. PCM validation checks duration, non-silence, peak limits and loop boundaries.

Combat numbers: switch400ms; shot700ms windup,1 active simulation frame,600ms recovery,31 damage; enemy shot800ms windup,900ms recovery,12 damage. Direction is committed at preparation, with no homing or piercing. Draw can be interrupted by hit, guard or roll. Bow disallows sword specials. Front guard takes20% sword/40% bow rounded damage. Roll lasts500ms, invulnerability only100–300ms, next use after1200ms from start. Normal sword attacks allow roll only in the last40% of recovery. Dagger6 damage/210 movement; heavy24 damage/82 movement/120HP; archer42HP with a short bounded retreat after nearby attacks.

Settings pauses active gameplay, restores previous pause state, blocks combat keys and persists separate volume values. Result-music restart restores the configured gain. Tests cover these interactions separately from artwork inspection.
