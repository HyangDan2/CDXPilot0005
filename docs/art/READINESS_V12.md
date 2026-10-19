# Eira v12: costume continuity, bow gait, readiness and boss support

## Authored assets

The user-approved idle identity in `art/generated/sd-v10/style-reference.png` is the costume reference. Built-in image generation edited each source sheet; originals remain intact. v12 uses layered ivory panels, gold patterned hems and hanging tassels, fitted blue/gold pointed boots, silver braid and helmet feathers. Tiny ornament counts still vary between generated poses; this is not pixel-identical hand-authored animation.

All 146 Eira poses were revised across 11 sheets: idle 12, sword-walk 8, move 16, combo 24, attack 12, defense 16, reaction 16, stop 6, roll 12, bow 16, bow-walk 8. Existing attack order/timing/collision data is retained. Bow idle holds the bow low with relaxed arms. Idle, movement and equip/unequip contain no nocked arrows; the shot preparation retains its arrow. Flight shaft is 48 pixels, up from 32, with unchanged damage/collision.

Generated output IDs (under the original Codex generated_images thread directory):

| v12 file | Output ID |
|---|---|
| idle | 32e30b2f-1935-4a3e-89a4-b2f930f5521a |
| sword-walk | 1e944cd6-8b11-41f5-8de3-99b12d55f7a3 |
| move | 90195c49-e10a-4f2a-b9d7-700c4b589374 |
| combo | 4aebe9c4-ea43-42bc-a2bc-0e633eff72bc |
| attack | e48bfdfb-4c26-45fe-b67e-0874750825ea |
| defense | bc6aa64c-9b53-4214-9410-ea3ba1c3d5a7 |
| reaction | f749ab7f-1e9b-4ff3-90ac-49b678fcebbc |
| stop | 0c6293c3-0fcc-4600-9e70-df9216ae8879 |
| roll | b492e03c-b18b-47a5-a38e-b8fc629056c3 |
| bow | 0aa61d94-c3c1-4b20-b6c9-6a4ebbb0de11 |
| bow-walk | 08e0223c-3851-408e-a9ec-dd512e5aa397 |

Costume prompts are preserved in `art/generated/sd-v12/costume-prompts.json`. Reaction was regenerated with isolated transparent gutters after component validation rejected touching poses. Bow walking was regenerated from the accepted bow-idle crop to retain the same grip hand, low diagonal bow and relaxed empty hand. Its eight contact/down/passing/reach poses are played sequentially with 120/100/65/75 ms per half-cycle. Horizontal pelvis anchors are explicitly registered rather than following weapon bounds. Runtime frames are transparent 512×512 with a shared ground anchor.

Reproduce: `node scripts/prepare-sd-v12.mjs`, `npm run assets:pack-sd`, `npm run assets:check`. No PNG byte painting is used. The packing step only crops, registers and scales authored images.

## Gameplay

- Dodge meter beneath HP reads the real 1.2-second roll cooldown. 100% displays READY only when the simulation permits rolling; airborne/locked states show WAIT. Touch roll button shares the charge indicator.
- Boss support triggers once at 70% HP (rusher + grunt) and 35% HP (archer + grunt). Up to three live support enemies; remaining requests queue. Each spawn gets one second of warning and stays at least 160 units away on X. If the player approaches, the warning relocates to the far edge and restarts. Boss death wins immediately, clearing support and arrows.
- Deterministic tests cover thresholds, cap, delayed fourth add, safe spawn relocation, boss victory cleanup and shared roll availability.

## Visual review

`docs/screenshots/v12-poses.png` samples each corrected sheet; `v12-bow-walking.gif` shows the packed walk loop. All generated sheets were visually inspected before packing. Browser screenshots verify the recharge meter and boss warning. Browser touch emulation is tested; physical iOS/Android hardware is not tested. No remote deployment is implied by a local build.
