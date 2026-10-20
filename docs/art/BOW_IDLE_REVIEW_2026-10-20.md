# Idle application and bow preview — 2026-10-20

## Applied sword cadence

User approved the first size-review candidate. `src/game/animation/twohand.ts` now selects `[0,1,2,3,4,5,6,7,6,4,2,1]` at 4 fps, with a three-second period. Original frames 8–11 remain in the atlas. No PNG, scale, pivot, attack timing or collision data changes. `tests/unit/idle.test.ts` covers repeated-loop exclusion of low poses, wrap continuity, and independence of bow/air selection.

## Bow preview only

Open `/bow-idle-review.html` using `npm run dev`. All images come directly from the existing `smooth-bow.png`; reference is the byte-identical v10 copy introduced by SIZE_REVIEW_2026-10-20.md. No generated/repainted artwork or new provenance is introduced.

- A: existing 0,1 poses held 0.9 seconds each (1.8-second loop, versus current 3 seconds). This preserves the original pose sequence and is the most conservative option. Movement amplitude remains limited.
- B: 0,1,15,14,15,1 with holds 0.7,0.4,0.5,0.4,0.5,0.5 seconds. Frames 14/15 are bow-lowered switch completion poses, not newly authored breathing frames. Height at alpha >=128: 288,292,289,289 pixels for 0,1,14,15. Scale and bottom registration stay fixed; no stretching, whole-body bob, or crossfade.
- Visual limitation: frame 14 changes stance width, face angle and cloth shape. B has more visible movement but can read as a foot shift. Do not represent it as a finished natural breathing animation. A is the safer identity/continuity option. Both remain outside gameplay pending review.

## Air attack: preserve sword length

The earlier 94% preview is retired; the previous page is locked to 100% for air. Runtime remains unchanged. An integrated sprite scaled to 94% scales every visible sword segment by 6% as well. Therefore it does not meet the user's constraint.

All six air frames were visually inspected at a common scale, including the blade tips. Current packing uses the lowest silhouette pixel as its registration bottom; later downward cuts can register on a sword tip. This can contribute to apparent vertical jumps but cannot explain or repair anatomical proportion differences alone. Early air poses have larger-looking head proportions than the jump poses. Existing perspective and partial occlusion prevent a reliable single grip-to-tip length measurement for every pose. We make no claim that the original authored sword has perfectly equal projected length across frames.

To preserve the existing sword precisely, keep original PNGs and their render scale unchanged, as this change does. A future body-only correction would require explicit blade/grip/hand masks and joint registration, with identity review; it is not safely achieved by scaling the combined sprite. No such separation, repainting or nonuniform deformation is performed here.

## Validation and shared workspace

The workspace includes concurrent environment/combat edits outside this request; those files and unrelated documents were not edited here. The first `npm run verify` attempt passed assets, lint and typecheck but failed the integration playthrough assertion: 3 kills versus expected >=13, player near a wall at wave 1. This test consumes simulation, not the modified animation selector. The run had 117 passing tests and 1 failure; report full verification as failed, not green. Additional build/E2E outcomes are recorded below when complete.

- `npx vitest run tests/unit/idle.test.ts`: 2 passed.
- `npm run build`: passed.
- `npm run test:e2e`: 19 passed / 1 failed. Archer projectile-damage test expected HP <180, but HP stayed 180 for 5 seconds. The shared workspace's environment/projectile changes were not modified to mask this failure. Tests and snapshots were not removed or relaxed.
- Preview browser checks passed for all six B-sequence positions, A cadence, facing/scale controls, mobile horizontal overflow and absence of page errors. Captured and inspected original four bow poses, all six air poses and the running game's sword idle screenshot. Earlier measured runtime atlas/reference hashes still match.
- No remote deployment. Screenshots are under `artifacts/bow-review/`; the local Vite server serves both review pages. Shared workspace changes continued during validation, so these are recorded run outcomes, not a claim that the unrelated work is verified.
