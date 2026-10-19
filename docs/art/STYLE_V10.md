# Eira original-idle style restoration

The user requested that all Eira actions retain their choreography while recovering the first approved idle drawing style. The authoritative reference is `art/generated/sd-v10/style-reference.png`, originally `exec-6b14adb3-1020-4ac3-b180-c4fc724bcd22.png`: visor protrusion removed, silver-gray braid, blue/gold armor, ivory cloth, feather wings, delicate relatively small head and slender SD proportions.

The built-in image generator was used, not an API fallback. Every modern Eira animation sheet was regenerated from this same reference rather than recursively using the previous generated animation as its identity. Pose instructions describe the existing actions. Shared constraints: crisp 1990s pixel clusters, neutral silver hair, broad blue armor with gold edges, central chest diamond, long ivory panels/gold tassels, both feather wings; complete straight two-handed sword, connected shoulders/elbows/wrists, no extra hands. Rejected outputs included clipped feather/sword tips, touching silhouettes and bow poses incorrectly holding swords. Technical registration/cropping/nearest-neighbor atlas packing follows generation; no procedural repainting.

Accepted source IDs:

- idle:91b7128b-e4cb-4dcc-8d5f-4ea1608d3865 (padding repair)
- move:90fd515f-ee59-4a72-bc77-edd5545512d3
- combo:d466db25-1d1a-4ab3-8c56-f7600f4eaa67
- defense:4e2275dc-362b-4842-9eaa-5c61202b76c6
- reaction:858427dc-e7f8-4410-8188-a663eb11630a
- stop:5cf539fb-bae9-4339-a74f-3a9acaec6e75
- bow:8bd75692-6a96-4893-bc38-1e8099fc2a70 (weapon correction)
- roll:3a293bb9-5a46-487c-8d0a-c7ee70dfa0d5
- attack:d8b1abc0-eaa4-4164-aa94-03d7ac01c54e (sword-tip repair)

Sequences:12 idle;16 walk/run;24 combo;12 special attack (6 rising+6 air);16 guard/spin;16 jump/hit/down/recovery;6 stop;16 bow/equip;12 sword/bow rolls. Total130 Eira poses across9 runtime sheets. Special-attack indices moved from12/18 to0/6 because obsolete non-runtime slash poses were omitted; modern combo retains its separate24-pose sheet. Gameplay timing, damage, inputs, enemy assets and audio are unchanged.

`node scripts/prepare-sd-v10.mjs` derives one scale per sheet and pelvis anchors from original registrations; inspect and then run `npm run assets:pack-sd`. Special-attack scale has a1.22 visual correction because raised blades inflated the silhouette-height estimate; it was checked against idle head size. This preserves original sources and fixed512px atlas cells with ground420. `registration.json` is versioned. HUD portrait is a technical crop of the authoritative reference. Review page sequences match runtime indices.

Limitations: these are generated keyposes, not identical hand-drawn inbetweens; small costume/hand/face-angle variations remain. Same-scale contact sheets and runtime screenshots complement structural alpha/bounds checks, which cannot certify anatomy. No claim of perfect identity matching or per-pixel collision.
