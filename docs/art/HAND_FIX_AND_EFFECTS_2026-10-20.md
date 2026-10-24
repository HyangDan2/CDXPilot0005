# Bow hand-color correction, approved cadence, and effect preview

## Implemented

- Bow idle A is applied: existing frames 0 and 1 each last 0.9 seconds (1.8-second cycle). `public/assets/sd-v3/bow-idle.json` remains the runtime source. Boundary assertions in `tests/unit/bowIdle.test.ts` and `idle.test.ts` reflect the explicitly approved timing; no tests were removed.
- Over-saturated red finger/hand shading was confirmed in the v12 bow and bow-walk sources. It was not a new glove design: pale fingers emerge from blue/gold bracers. Legitimate red ribbons and helmet medallions remain red.
- Applied localized imagegen-authored hand colors to the two sources, retaining original alpha and original geometry. Original v12 input files remain intact. `scripts/sd-atlas.mjs` reads the v13 source override after v12; anchors, scales and frame counts remain the v12 values. Only the two bow runtime PNGs change; sword/air/other runtime PNGs and manifest stay unchanged.

## Provenance and reproduction

Built-in imagegen, not an API/CLI fallback, was used. Whole-sheet trials were rejected because they changed unrelated artwork and insufficiently corrected red hand shadows:

- bow: `call_efccefd6b20b4826b10eab4fc57644da`
- bow-walk: `call_aa87a1dd58ba4ac38cc936d8e38a515d`, `call_1182338530c74cb1b455df27147c4200`

The selected hand contact-sheet edit is `call_4c59b9b1bbd5479b832f3e83eb965966`, saved in `art/generated/hand-fix-v13/corrected-hand-crops.png`. The 48 input patches were losslessly extracted from original source regions (4× nearest-neighbor enlargement) by `scripts/prepare-hand-review.mjs`; `patches.json` records their source coordinates. The input is preserved as `hand-crops.png`.

Final prompt (verbatim):

> This is an 8-column 6-row contact sheet of 48 close-up hand patches extracted from a game sprite. Precise color repair, not redesign. ALL RED shading on these hands/fingers is erroneous and looks bloody. Recolor ALL red/crimson/saturated orange-red pixels in these patches into DESATURATED GRAY-BROWN / TAUPE finger shading. Keep peach/ivory highlights. Fingers must have neutral dark brown-gray separation lines, not red. Preserve every patch's exact position, silhouette, finger geometry, grip, gold bow, blue bracer, image dimensions1152x864 and 144px cell layout. Do not shift or redraw anything. Change colors only. No red should remain anywhere in this contact sheet; there are NO hair ribbons or helmet medals here to preserve. Transparent pixels stay transparent. Output the corrected complete 48-patch sheet, no added labels.

`node scripts/pack-hand-fixes.mjs` transfers only generated RGB samples where original pixels meet the documented red-hand mask and donor samples meet a neutral skin/shadow color gate. It never transfers donor alpha or wholesale hand silhouettes. The script accounts for the generated contact sheet's resolution and asserts byte-identical alpha plus byte-identical pixels outside the transfer mask. Changes: 2,710 source pixels in bow; 2,249 in bow-walk. `validation.json` records these counts. Normal warm skin shading remains; the intent is correction of the saturated red appearance, not desaturation of all skin.

Reproduce using Node >=22.13:

1. `node scripts/prepare-hand-review.mjs` (rebuild original contact sheet/coordinates).
2. Keep the selected authored `corrected-hand-crops.png`; no new generation needed.
3. `node scripts/pack-hand-fixes.mjs`.
4. `npm run assets:pack-sd` then `npm run assets:check`.

The original runtime bow sheet is copied to `public/assets/hand-review/bow-before.png` solely for the before/after page. Source PNGs are not edited by hand to bypass checks.

## Attack effects: initial preview only (2026-10-20)

Open `/attack-effects-review.html`. Three modes show a short pale-blue sword trail, downward air trail, and brief bow-release flash. Default opacity 0.7, low option 0.45. Effects exist on a separate canvas and clear the character's entire alpha silhouette (including nonzero anti-aliased edge pixels) plus a four-pixel margin. The original actor is then drawn unchanged above the effect. There is no character glow, body tint, scale pulse, sword extension or full-screen flash.

The air attack still uses its original PNG and scale. Phase lengths mirror current data: sword 11/6/14, air 4/11/12, bow 42/1/36 frames at 60 Hz. Effects disappear after active phase plus at most 0.1 seconds. The trail shape is an artistic proposal, not a claim of exact blade-tip tracking or collision coverage. Air travel is omitted to isolate the artwork. The effect is intentionally not wired into live gameplay yet.

## Visual/technical validation

- Inspected all 48 corrected hand patches, full six-pose air comparison, and effects before/after screenshots.
- Browser pixel comparison: 246 samples across three attacks and both facings; zero altered character pixels, with visible effect pixels for each mode.
- Original alpha/geometry and all pixels outside the transfer mask checked in the compositing script. `git diff` confirms only bow/bow-walk runtime PNGs changed; air attack PNG is unchanged.
- `npm run verify` latest run passed; earlier intermediate run caught old bow timing expectations, which were updated to the user-approved A timing. Shared-workspace stage changes also occurred during verification. Final counts and E2E outcome appended below.
- Screenshots: `artifacts/effects-review/`. No remote deployment; serve locally with `npm run dev`, then use the review page. Static deployment requires the normal build/publish process.

Final recorded outcomes (completed 2026-10-21 KST):

- `npm run verify`: 21 files / 127 tests passed; asset validation, lint, typecheck and build passed. Subsequent standalone build also passed.
- Initial E2E reused a shared server that disconnected mid-run. A separate-port full run produced 22 passes / 1 failure (clear-screen hub Back navigation, missing stage after return). The failing test then passed against a fixed build copy on port 4191. This is a full-run failure plus a successful targeted retry, not a claim of one uninterrupted 23/23 run. Concurrent shared-workspace builds were observed; the exact cause of the navigation failure is not established.
- Runtime screenshots of corrected bow idle and walk were captured and visually inspected. Mobile preview width and default A selection passed. `git diff --check` passed.
- Hashes of the original sword idle, air attack, reaction and approved identity reference still match the first audit.

## Current SD v3 Eira effect review — 2026-10-24

The review page now uses the current Eira art path: the weapon-inclusive `smooth-combo`, `smooth-attack`, and `smooth-bow` frames under `public/assets/sd-v3/`. It deliberately does not load the legacy 48×64 sheets or the detailed `characters/eira-v2` fallback. Slash1 follows `twohandFrame` frames 0–5, air follows frames 6–11, and shot follows the current bow release frames 4–7. Their phase lengths remain the attack data values 11/6/14, 4/11/12, and 42/1/36 at 60 Hz.

The effect stays on its own canvas; the SD v3 actor frame, including its integrated weapon, is redrawn unchanged above it. A four-pixel expanded alpha mask protects the actor. The preview controls effect strength, contrast, afterimage duration, and deterministic particle count. Sword trail keypoints are hand-measured from SD v3 combo frames 2 and 3 for visual alignment; these are art anchors, not collision metadata. The bow flash uses the reviewed frame-7 contact `(348,246)` transformed from the runtime origin and 0.5 scale. Air effects follow the authored downward blade direction and use the player baseline as the landing reference; vertical travel is omitted in this isolated art preview.

Playwright QA (`tests/e2e/attackEffectsReview.spec.ts`) sampled each attack's active phase facing both directions. All six samples showed effect pixels, reported zero changed SD v3 actor pixels, and produced no browser errors. The contrast control and tail-duration UI were also exercised. Captures are in `artifacts/effects-review/eira-sd-v3-2026-10-24/`. `npm run typecheck`, `npm run lint`, the Playwright build and the focused E2E passed. Full-suite verification was not run. These changes update the review page only; no gameplay effect was enabled.
