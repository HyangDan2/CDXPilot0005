# Smooth motion v7

Original reference-based artwork generated with the built-in image generation tool. Full-resolution RGBA sources are preserved in art/generated/sd-v7; sources.json records accepted generation IDs. Rejected incomplete sheets were replaced before packing.

The 10 sheets provide 162 poses: 84 Eira poses (double the previous 42), six additional stop poses and 72 enemy poses (double the previous 36). Legacy 138 frames are preserved; the manifest has 300 frames. Runtime loads only smooth sheets.

Art constraints: 1990s pixel styling, restrained SD head proportions, slim front-visible heroine, natural two-handed grip, straight rigid blade, blue/gold armor and white cloth. Idle braid hangs lower; movement uses delayed braid-tip motion. Rising follows a low-to-high circular blade path. No detached runtime sword overlay.

Packing: npm run assets:pack-sd. Source pixels are segmented, nearest-neighbor sampled and aligned to authored foot anchors. New sheets use origin (256/512, 420/512); rendering and review use per-sheet origins. Attack timing is unchanged. Rising hit envelopes advance through four phases. Stop takes 0.3 seconds and can be interrupted by movement, guard, jump or attack.

Validation: all 300 frames have alpha and clear borders; selected movement/attack contact sheets inspected at enlarged size; 65 simulation tests and 8 Chromium tests pass. Generated poses still have minor silhouette/ornament variation; doubled authored counts do not mean every runtime state uses every pose. Boss down uses its single authored prone pose. Review sequences are pose previews, not exact combat timing.
