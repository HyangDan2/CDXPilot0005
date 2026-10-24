## The Ashen Forge — 2026-10-21 (Asia/Seoul)

- `npm run verify`: assets, lint, strict TypeScript, all 162 unit/integration cases and the production build passed with Node 24.19.0. Added 13 forge definition/flow/device cases plus a full five-area input-driven playthrough. The playthrough retains ordinary player/enemy stats, reads warnings, collects the optional garden heal, observes machinery/arena destruction and defeats the boss with surviving HP. The gate full-run regression also passes.
- Forge state tests cover legal five-area spawns, conditional continuation, carried score/best combo/kills/weapon, full-HP entry, current-stage checkpoint restart, camera/projectiles beyond the original map, optional garden pickup once, final completion reward once, alternating non-stacking slam warnings, safe fire lanes, symmetric actor damage, swept charge destruction, no triggers after extinguishing, environmental boss completion and defeat precedence on mutual KO.
- Added six browser cases for direct title entry and current-stage restart; gate-clear continuation and forge final replay; all five areas and real-input recovery collection; slam warning/active/pause and charge destruction; mobile touch entry/warning/defeat/restart; and production entry without the developer harness. The isolated full browser suite passed all 32 cases (2.1 minutes). After the final forge-only label placement adjustment, all six forge browser cases passed again (29.4 seconds); verify again passed all 162 cases and the build. Inspected the final furnace title and warning separation. Full-suite artifacts: /tmp/valkyrie-phase3-20261021.hxy4Oj/final-results and final-report; latest forge screenshots/report: /tmp/valkyrie-phase3-20261021.hxy4Oj/polish-results and polish-report. The production previews used independent bundles/ports 43773 and 43777 to avoid shared build/trace artifacts.
- Inspected desktop approach, stockhouse, furnace hall, cooling garden/potion, warden room, active vent and landscape mobile warning screenshots. Production menu flows are native buttons with keyboard activation. Persistent save/unlock, gamepads, physical iOS/Android devices and non-Chromium engines remain unverified.
- Stage balance: approach 2 enemies and HP 40 stockade; stockhouse 3 enemies with upper-lane archer and cover; furnace 3 enemies and alternating vents; quiet garden with optional +50% potion; HP 640 warden with existing reinforcement rules. Manual vent cycles warn 1.4s then burn 1.2s with one bank at a time and a safe center/opposite lane. Existing 12-damage/0.75s environment rules apply to both sides. Warden charges smash wooden barriers; final clear awards 1,000 points once.
- Entry/rest/replay behavior: forge entry restores HP; continuation preserves entry totals/weapon; stage restart restores those totals and resets environment, combat input, camera and audio. Garden pickup is optional and does not respawn by backtracking. Completion extinguishes vents and removes surviving support/arrows.
- Original procedural scenery reuses existing approved character frames and synthesized sounds. The forge warden is a warm-tinted existing boss design, with environmental behavior rather than new authored poses; there is no dedicated forge soundtrack. No raster asset pipeline changes, external services or new dependencies were introduced.
- Local build and tests are not remote deployment. GitHub Pages publishing still requires the existing workflow after review/commit/push; this task did not publish.

## Stone cover / S passage — 2026-10-21 (Asia/Seoul)

- `npm run verify`: passed asset checks, ESLint, strict TypeScript, all 148 unit/integration cases and the production build with Node 24.19.0.
- Added 21 unit/integration cases for the widened second encounter, both directions of the complete S route, floor-bound paths and overlap recovery, player/enemy/boss collision, permanent stone versus both arrow teams, nearest-blocker/height/depth rules, melee occlusion, every regular enemy approach role, blocked-archer repositioning, shooting beside the navigation margin, authored spawn positions, actual movement-command traversal, committed-shot cover and wave progression. The full-run survival/kill/clear assertions remain and pass without health or damage overrides.
- Added three browser cases: keyboard bottom/top/bottom traversal; a real bow shot absorbed by stone followed by a successful alternate approach; and mobile landscape touch layout with the real second-wave archer placement. Inspected desktop entry, upper passage, translucent stone and mobile encounter screenshots.
- An initial 26-case default-output browser run completed 24 cases, but two existing cases failed during trace/context teardown with missing Playwright artifact files (`ENOENT`), rather than gameplay assertions. Final validation uses an isolated production bundle, port and output/report directories to avoid shared artifacts being removed or overwritten.
- Final isolated Chromium E2E: all 26 cases passed in 2.4 minutes. Command: PORT=43765 npm run test:e2e -- --output=/tmp/valkyrie-phase2-20261021.dZonim/results (with PLAYWRIGHT_HTML_OUTPUT_DIR=/tmp/valkyrie-phase2-20261021.dZonim/report). Served the matching Vite production bundle from /tmp/valkyrie-phase2-20261021.dZonim/dist on its own preview process. Inspected final blocked/clear bow shots, translucent-pier traversal and the mobile encounter; report and screenshots are retained in those directories.
- The pier artwork is original procedural prototype geometry. It fades to 35% when obscuring a living actor; its solid footprint stays visible. No new raster source, external artwork or asset-generation changes are part of this feature. Physical devices, other engines and arbitrary dense obstacle layouts remain unverified.
- This extends encounter two inside the existing stage. Separate stage selection and phase 3 content are pending. Remote deployment was not performed; use the existing GitHub Pages workflow separately.

## Courtyard environment prototype — 2026-10-20 (Asia/Seoul)

- `npm run verify`: passed environment/asset checks, ESLint, strict TypeScript, all 119 unit/integration tests and the production build using bundled Node 24.19.0. The default shell uses Node 16 and cannot start the current Vite/Vitest; the project still requires Node >=22.13 and no global runtime settings were changed.
- Final `npm run test:e2e`: all 23 Chromium tests passed (1.9 minutes), including the three new environment cases and all existing gameplay, mobile, hub and readiness cases. A further focused keyboard case passed after moving the destroyed-barricade capture before the pause overlay; inspected its unobscured debris screenshot under `test-results/environment-visual-review/`.
- Added 25 environment unit/integration cases covering widened depth/tapering, swept movement in either direction, rolls, jump clearance/landing resolution, both detours, authored damage and hit ledgers, spin cost, arrow interception/order, all regular enemy navigation roles, post-detour archer alignment, warning cycles, shared damage/cooldown rules, guard/roll/jump responses, environmental kills and progression, defeat, restart and deterministic replay.
- Added three Chromium browser cases for real keyboard movement/destruction/passage/restart; harmless warning, pause freeze and active fire; and 844×390 landscape touch rendering/pause. The existing full-run driver now navigates around surviving geometry between encounters using movement commands, retaining its health, kill-count and boss-clear assertions without stat overrides.
- Initial E2E found that an archer could finish its detour at a depth from which its horizontal arrows missed. The archer now completes depth alignment after a detour before firing; a dedicated regression covers that transition. Existing clear-lane attack behavior is retained.
- Visually inspected final desktop intact-barricade and mobile warning screenshots after moving labels above the combat area; also inspected expanded depth, destroyed debris and active flames. Screenshots are generated under `test-results/environment-*`. No external artwork or bitmap changes are required; procedural shapes are prototype visuals.
- Scope is the first encounter of the existing stage, with one isolated barricade and one vent. Dense obstacle layouts, separate stage selection, physical iOS/Android devices and non-Chromium engines remain unverified. Low barricades block movement and low arrows but do not shorten authored melee reach. Remote deployment was not attempted; use the existing GitHub Pages workflow separately.

## GameHub header placement — 2026-10-20 (Asia/Seoul)

- Moved the single GameHub link to the header, directly left of Settings, across title/gameplay/pause/results. Removed duplicate menu links. Landscape touch keeps both header actions visible; pause has separate space to their left.
- Playing/paused activation pauses the game and opens a labelled native dialog. Cancel, Space on Cancel, and Escape return focus to the header link while retaining the pause menu. Confirmation uses a same-tab anchor and closes the dialog before navigation, so Back does not restore a stale exit dialog.
- `npm run verify`: passed assets/lint/typecheck, 92 unit/integration tests and build. `PORT=4185 npm run test:e2e`: all 20 Chromium tests passed, including header adjacency, mobile touch confirmation, cancellation focus, no input leakage, exact destination, settings and Back. An initial test incorrectly treated Space on the focused Cancel button as an ignored gameplay shortcut; corrected it to verify native button activation and cancellation.
- Visually inspected desktop header/title and 667×375 touch-emulated header/title/pause/confirmation screenshots in `test-results/`. No artwork changes. Physical devices and other browser engines remain unverified.
- Hosted navigation acceptance follows the successful Pages workflow; the final completion report records its result.

## GameHub return — 2026-10-20 (Asia/Seoul)

- `npm run verify`: passed asset validation, ESLint, strict TypeScript, 92 unit/integration tests and production build with bundled Node 24.19.0.
- `PORT=4185 npm run test:e2e`: 19 Chromium tests passed. Default port 4173 was occupied by another local project; the first rerun could not start its server, then the documented port override succeeded.
- Six focused browser cases cover exact same-tab destination from title/pause/defeat/clear, direct entry with an ignored return-URL parameter, Enter isolation, one touch navigation, paused time, resume focus, settings preservation, Back, portrait rotation, and cancellation of pending result music on pagehide. External navigation is fulfilled with a local hub substitute for these tests.
- Visually inspected desktop title/result and 667×375 touch-emulated title/pause screenshots in `test-results/`. The link has a 44px minimum height and a visible keyboard focus outline; menus leave combat touch regions inactive.
- No art was generated or replaced. Existing authored-frame limitations remain. Physical iOS/Android devices and non-Chromium engines were not tested.
- Hosted round-trip acceptance is recorded in the integration completion report after the Pages workflow completes.

## TODO Ver0.21 — three-stage combat expansion (2026-10-24, Asia/Seoul)

- Added the Ashwing flyer from stage two, stronger attack tells, the five-area Drowned Monastery and fleeing guided-magic enemy. Bosses gain a deferred half-health phase transition and 1.25× speed; rising chains into the existing descending strike, and running feeds forward momentum into that strike.
- The stage-three route now supports entry, continuation, completion, score/reward carry, HP restore and checkpoint restart. Sluice impacts change the active water bank, including the boss arena. Flyers route around high pillars and stay inside the world bounds.
- `npm run verify`: Node 24.19.0; asset checks, ESLint, strict typecheck, **172 unit/integration tests** and production build passed.
- `PORT=4185 npm run test:e2e`: **34 Chromium tests passed** after aligning legacy progression expectations with stage three and restoring game-canvas focus in the keyboard-input case.
- Visually inspected desktop entry, flyer dive/ring/aim, mage bolt, boss phase-two tint/health bar and the mobile-emulated sluice flood in `test-results/`. No new raster assets; flyer/mage reuse the SD v3 rusher/archer sheets. Provenance is recorded in [ART_PIPELINE.md](ART_PIPELINE.md).
- Physical mobile devices, Firefox/Safari, remote GitHub Actions/Pages deployment and hosted URL were not tested. Detailed checklist: [QA_Ver0.21.md](../QA_Ver0.21.md).

### 2026-10-24 boss phase two

- Applied the half-health phase change after the current boss attack completes, followed by a 0.45-second tell. Phase two accelerates boss movement, AI timing, charge travel and attack animation/hit timing by 1.25×. Environmental warning durations remain at their authored durations.
- Added integration regressions for deferred transition, phase persistence, faster movement and attack speed.
- `npm run verify`: passed asset checks, ESLint, strict TypeScript, **164 unit/integration tests** and production build. `npm run test:e2e`: **32 Chromium tests passed** (2.5 minutes). `git diff --check`: passed.
- No new art or generated assets. Browser coverage is Chromium; physical mobile and non-Chromium engines remain unverified.

## v0.7.1 Eira style restoration

- Regenerated9 Eira sheets/130 poses from the first approved idle reference. Enemy PNGs and simulation rules are unchanged.
- `npm run verify`: passed assets/lint/typecheck/84 unit+integration tests/build.
- `npm run test:e2e`:11 passed; review coverage now visits all20 Eira clips. One initial preview-server port collision cleared before retry.
- Final special-attack display-scale adjustment and centered, unclipped review canvases passed a targeted Chromium review rerun. The scale adjustment passed `npm run assets:check`; all356 packed frames have valid bounds and transparent borders. Source registration rejects clipped silhouettes.
- Visually compared idle/move/combo/bow/jump/rising/guard/roll at identical rendering scale. Small ornament/hand-shape differences remain a limitation of generated keyposes.
- Provenance, prompts and registration are in `art/STYLE_V10.md` and `art/generated/sd-v10`.

## v0.7 verification

- `npm run verify`: assets, ESLint, strict TypeScript,84 unit/integration tests and production build passed.
- `npm run test:e2e`:11 Chromium tests passed against the built `/valkyrie/` subpath, including real bow input/cancel/release, roll, archer projectile damage, settings pause/resume and result music/restart volume.
  -368 atlas frames pass transparent-border, dimension and anchor checks. All four PCM tracks pass duration, non-silence, clipping and boundary validation.
- Visually inspected same-scale pose comparison, bow draw, bow roll, archer and settings screenshots under `docs/screenshots/v9-*`.
- Fixed asynchronous settings close/resume race. Combo E2E now waits for simulation attack progress rather than adding screenshot latency to the input window.
- Art is generated keyposes with minor ornament/proportion variation; collision is authored envelopes. See `art/RANGED_V9.md` for provenance and limitations.
- Remote GitHub Actions/Pages completion must be verified separately; local build is not deployment confirmation.

## v0.4 QA

63 unit/integration tests and8 Chromium E2E cases. New coverage includes strict40ms chords, command rising, spin cost/armor, loot and BGM lifecycle. See [TWOHAND_V4.md](art/TWOHAND_V4.md) for validation scope and audio limitations.

## SD v3 check — 2026-10-19

49 unit/integration tests and seven Chromium E2E tests passed with asset/lint/type/build checks. SD image quality and pose alignment reviewed with screenshots and contact strips; rejected touching-silhouette layout was regenerated. Local 240-frame sample median/p95 around16.7ms; not a cross-device performance claim. Scope, reuse and evidence in [SD_V3.md](art/SD_V3.md).

# Verification log

- Phase 0: empty workspace audited; missing reference assets noted in implementation plan.
- Phase 1: Node 22.23.3; verify passed (lint, strict typecheck, 1 bootstrap test, Vite production build). System Node 16 is too old. Isolated temporary runtime used for this session. Vitest 5 selected after npm peer-resolution error with 4; npm audit reports 0 vulnerabilities.
- Phase 2: verify passed, 7 tests. Projection, landing, restricted FSM, 30/144 Hz fixed-step equivalence, camera bounds, animation counts and immutable weapon grip/scale tested. Basic Phaser scene accepts movement/jump/dash and F1.
- Phase 3: verify passed, 15 tests. Attack timing, facing/depth/height hitboxes, duplicate-hit ledger, damage/guard, invulnerability, launch, input expiry and J→J→K→L cancel chain verified.
- Phase 4: verify passed, 22 tests. Seeded waves, progression/clear/death, enemy timers/guard, boss attack cycle/enrage and normal player input verified. HTML title/HUD/pause/restart menus wired to the simulation. An empty CSS import warning was removed before polish.
- Phase 5: verify passed, 22 tests plus 8-PNG asset validation. 60 fixed-canvas poses per actor and one sword texture generated. Strict typecheck caught a Phaser frame-key string requirement and it was fixed. Sword hand offset calibrated to generated body coordinates. Browser visual validation follows in Phase 6.

## Phase 6 — final verification (2026-10-18, Asia/Seoul)

- Clean `npm ci`: passed with Node 22.23.3 / npm 10.9.9. Dependency audit: 0 vulnerabilities.
- `npm run verify`: passed. Actual PNG validation, ESLint, strict TypeScript, **26 tests in 6 files**, production build.
- `npm run test:e2e`: **4 Chromium tests passed** (12.6 seconds), production served under `/valkyrie/`.
- Full automated model playthrough clears all 4 encounters / 13 enemies using movement and timed attack commands only. No HP, damage, enemy-health or stage skips are used in that test.
- Real-browser coverage includes keyboard movement/jump/sword damage, F1, pause freezes simulation, resume/restart, resize, title, field guide, no runtime/console errors, PNG-failure fallbacks, and production relative paths.
- Boss/game-over/clear screen checks use explicit named fixtures; they are UI tests, not browser playthrough claims.
- Screenshots inspected: title, gameplay/debug, boss and clear. Initial boss screenshot caught the camera mid-pan; the test now waits for authoritative camera position before capturing. Representative output is in `docs/screenshots/`.
- Calibrated ground bounds to the rendered terrace and added explicit enrage-pattern regression.
- Build: 30 transformed modules. Main JS 1,239.23 kB (gzip 343.96 kB); CSS 9.78 kB (gzip 3.00 kB); static assets copied into dist. Phaser is bundled locally; no runtime CDN dependency.
- Workflow prepared for all branch pushes/PRs; deploy restricted to successful main runs. README, architecture, harness, art, design, maintenance, implementation plan and changelog reviewed.

## Acceptance status

Implemented and locally verified: movement/depth/jump/dash; two slashes/kick/rising/air attack; input buffering/cancels; hit/hurt/depth/height/invulnerability; immutable independent sword; 3 enemy kinds and boss; waves, HP/score/combo, pause/restart, game over/clear; original art/fallbacks; effects/synth audio; F1; asset pipeline; automated tests; static build and CI/Pages configuration; all requested guides.

## Limits / unverified checks

- GitHub Actions and actual GitHub Pages hosting are **not remotely executed**: no Git repository/remote was supplied. Nested-path serving passed locally.
- Browser automation covers Chromium desktop only. Safari/Firefox/mobile and screen-reader qualification are not performed.
- Audio synthesis paths are exercised through browser play but subjective listening/mix quality is not manually verified. No performance benchmark across hardware is claimed; 60 FPS is the design target.
- Pixel art is original procedural MVP art, with shared enemy silhouettes and limited body articulation; no commercial JRPG art-quality claim. Reference image was absent.
- No touchscreen controls, gamepad, saves, extra stages or multiplayer (outside MVP scope).

## v0.2 upgrade verification

See docs/art/UPGRADE_QA.md for sequential generation and visual review. Final verify passed with 43 Vitest tests in 9 files; all 6 Chromium E2E tests passed. Tests include actual double-tap run/cancellation, active AI, bounded juggle at multiple render rates and 72 detailed pose frames. Build and PNG checks passed. Original v0.1 title/gameplay screenshots are preserved in screenshots/v0.1; current screenshots show the new reference-based art. Remote hosting and cross-browser checks remain unverified.

## v0.6 local verification — 2026-10-20

`npm run verify`: passed324-frame alpha/border validation, audio, lint, typecheck,74 unit/integration tests and production build. `npm run test:e2e`:9 Chromium tests passed, including actual keyboard four-strike chain and social/favicon HTTP loading. Inspected packed combo and gameplay preparation screenshots, feather restoration and32px icon. Remote GitHub runner was still queued at time of local verification; no remote deployment success claimed.

## Touch / v11 update (2026-10-20)

- `npm run verify`: passed lint, strict typecheck, 86 unit/integration tests, asset checks and production build.
- `PORT=4183 npm run test:e2e`: 12 passed. Port4173 was occupied by an unrelated preview server; no process was terminated. Playwright now accepts PORT.
- Final bow frame ordering and transparent bowstring repair: `node scripts/prepare-sd-v11.mjs && npm run assets:pack-sd && npm run assets:check` passed (372 transparent/unclipped frames,29 sheets); `PORT=4183 npm run test:e2e -- --grep 'SD review|landscape touch'`:2 passed, including production rebuild.
- Mobile emulation: real CDP multi-touch movement+guard, attack hold/cancel, bow fire, rising swipe, two-finger pinch (viewport scale1), portrait pause, landscape resume with cleared movement, settings adjustment. Existing keyboard/combat suites passed.
- Visual review: final bow idle/walk review screenshots, sword walking contact sheet, mobile landscape overlay, fixed-canvas sprites and weapon/feather margins. Saved `docs/screenshots/v11-*`.
- Not verified: physical iOS Safari / Android devices. No remote publication performed in this update. Minor generated pose/ornament variations remain.

### 2026-10-20 v12

- `npm run verify`: pass; asset validation 372 frames/29 sheets, ESLint, TypeScript, 90 unit/integration tests and production build.
- All 11 revised Eira source sheets visually reviewed; packed contact sheet and bow gait preview saved in `docs/screenshots/v12-*`.
- Initial E2E run: 12/13 passed; production page returned 404 while another concurrent verification rebuilt `dist`. Re-running E2E after build completion avoids this artifact-directory race. Do not run two production build writers against the same `dist` during browser tests.
- Physical mobile hardware and remote deployment are not verified.
- Final sequential `PORT=4183 npm run test:e2e`: **13/13 passed** (56.0 seconds), including production URL, mobile multitouch/rotation, recharge and boss support. `git diff --check`: pass.

### 2026-10-20 bow idle playback

- Fixed the runtime's constant bow idle frame. The game and review page now use the same two-pose, three-second clip definition.
- Visually checked actual game screenshots after switching to bow and again after 1.6 seconds: relaxed low bow, empty hands/no nocked arrow, feet on the ground, and visibly different idle poses. Screenshots: `screenshots/bow-idle-loop-start.png`, `screenshots/bow-idle-loop-breath.png`.
- Artwork was not regenerated. This restores the existing restrained two-key-pose animation; it is not a new interpolated six/eight-frame breathing cycle.
- Validation: `npm run verify` passed (92 unit/integration tests, assets, lint, types and build); sequential `PORT=4183 npm run test:e2e` passed 13/13. `git diff --check` passed. No remote deployment performed for this fix.

### README gallery refresh

Four unretouched game-area captures from the current local build replace the old roll screenshot in the README: `readme-sword.png`, `readme-bow.png`, `readme-boss.png`, `readme-mobile.png`. Desktop images are 1200×675; the mobile emulation image is 960×540. Sword and mobile captures use the first encounter with movement input; bow and boss captures start from the existing `archer` and `bossSupport` test fixtures and then advance the actual game. These are illustrative runtime screenshots, not evidence of a full manual boss playthrough or physical mobile validation. All four were visually inspected for visible actors, HUD, weapons and control placement. Historical QA screenshots are retained.

## Stage-clear return to title — 2026-10-24

- Added a `BACK TO THE MAIN` action to clear screens, preserving Play Again and next-stage continuation. Browser regression checks return to title and reopen the stage picker.
- Full Chromium E2E passed 38/38 with the stage-picker-aware test entry helper, including returning to title after clear. `npm run verify` passed after these updates.

## Reduced flyer frequency — 2026-10-24

- Reduced flyer-bearing combat waves across Forge and Monastery from 6/6 to 3/6. The new regression verifies the exact frequency and distribution. Replaced removed flyer slots with ground enemies so encounter counts stay consistent.
- `npm run verify`: passed asset validation, ESLint, strict TypeScript, 177 unit/integration tests and production build.
- Focused Chromium E2E passed 3/3: all Forge areas, gate→Forge→Monastery flow, and the Monastery flyer/mage behavior. Run with `PORT=4188 npm run test:e2e -- --grep 'all five forge areas|gate and forge flow|flyer dives'`.
- No art or asset pipeline changes; full unrelated E2E suite and physical devices were not retested for this frequency-only adjustment. No remote deployment was performed.

## Development stage picker — 2026-10-24

- Title no longer exposes direct Forge/Monastery launch buttons. `BEGIN YOUR OATH` opens the three-stage picker; choosing a stage and confirming starts it as a fresh run. Gate-clear continuation remains intact.
- `npm run verify`: passed asset validation, ESLint, strict TypeScript, all 177 unit/integration tests, production build, and `git diff --check`.
- Added browser coverage for the three choices, default Gate selection, direct fresh Monastery entry, old-shortcut removal and Escape return. Focused picker and keyboard-combat browser checks passed 2/2; the keyboard-combat case passed on isolated rerun after one transient failure in the full run.
- Full `PORT=4185 npm run test:e2e`: 35/38 passed. Two mobile cases reached teardown but Playwright failed to copy/remove shared trace artifacts (`ENOENT`); the remaining keyboard rising-attack assertion passed on isolated rerun. Existing stage continuation, touch Forge entry, picker, stage-start and game-flow checks passed.
- Visually inspected the 1200×675 stage-picker screenshot at `/tmp/valkyrie-picker-results-final/game-title-opens-a-stage-p-2636e-chosen-stage-as-a-fresh-run/stage-select.png`. Stage cards, selected state, confirmation and return action fit without obscuring the character. No asset pipeline changes; physical devices and remote deployment were not tested.
- Keyboard Enter opens/confirms the picker; Escape and Back return to the title. Touch buttons use the same native button controls.

## Dedicated Ashwing and Eira bow run — 2026-10-24

- `npm run verify`: passed environment, asset, lint, strict TypeScript, 177 unit/integration tests and production build. SD asset checks report 396 transparent, unclipped frames across 31 sheets.
- Visually inspected `/character-art-review.html` at the actual 0.5 runtime scale: existing Eira bow-walk beside new bow-run, rusher beside dedicated Ashwing, and Ashwing dive/hit/fall/down/recovery frames. The final Eira sheet was regenerated from the approved bow-walk reference after rejecting a draft with visible identity drift.
- Isolated Playwright checks passed for the new art review and production entry (2/2). The existing monastery flyer/mage scenario passed on a clean retry. One full E2E run against a fixed isolated production bundle completed 33/37: three existing environment/forge/title cases hit their 30-second limits, and the sword double-tap input case observed `Walk` instead of `Run`. The new art review and flyer/mage checks passed. A first shared-output run also exhibited missing Playwright trace files, so those failures are recorded separately from code assertions.
- New unit coverage verifies flyer sheet selection, dive/fall poses, gravity after an airborne hit, side ejection from an obstacle, and all eight Eira run frames at 24 fps.
- No remote deployment was performed. The visual asset generator can produce minor frame-to-frame costume detail variation; the final sheet preserves Eira's face, helmet, braid, main armor palette, ivory panels and golden bow closely at runtime scale, but is not pixel-identical to the source frames.

### Eira bow-run motion refinement — 2026-10-24

- Applied the approved stronger ImageGen sheet as `art/generated/sd-v13/bow-run-v2.png`; the first generated bow-run source remains preserved for comparison. Registration still packs eight 512px transparent frames and the runtime plays them at 24 fps.
- `npm run assets:pack-sd`, `npm run assets:check` and `npm run build` passed. SD validation reports 396 transparent, unclipped, anchored frames across 31 sheets.
- Browser-checked the 8-frame preview controls (play/pause, manual selection and speed) and visually inspected `/character-art-review.html` at the 0.5 runtime scale after atlas packing. Preview screenshot: `artifacts/effects-review/bow-run-runtime-review.png`.
- The generated poses keep Eira recognizable and the bow inside packed frame bounds. Minor per-frame detail variation remains; no unrelated gameplay code, attack timing, hitboxes, bow length metadata or movement cadence changed. No remote deployment was performed.

## Live SD v3 Eira attack effects — 2026-10-24

Following the user's approval, connected the reviewed effects to the live game renderer in `src/game/animation/AttackEffectsView.ts`. The renderer follows the current attack clock, SD v3 sheet origin and runtime scale. It adds no simulation state, random choices, hitboxes, damage, or timing. A dedicated Phaser Graphics object is depth-sorted immediately behind the player's SD v3 sprite, keeping the integrated weapon and actor art on top. The imagegen concept is retained at `art/generated/effects/eira-attack-effects-concept-2026-10-24.png`; the shipped effects are Phaser vector graphics to keep the actual authored character pixels untouched.

Added `tests/e2e/attackEffectsLive.spec.ts`. Its test-only harness places the live player in the active pose for all four combo hits, rising uppercut, spin, air attack, and bow shot at the authored attack clock, freezes rendering for clean captures, and checks both facings. Captures are in `artifacts/effects-review/eira-sd-v3-live-2026-10-24/`. The screenshots are visually inspected after this update. Source character PNGs and attack rules are unchanged.

Validation: `npm run verify` passed asset validation (396 SD v3 frames), ESLint, strict typecheck, all 177 Vitest cases and the production build. `npm run test:e2e` passed all 37 Chromium tests, including 16 live captures across the four-hit combo, rising uppercut, spin, air attack and bow shot in both facings. `git diff --check` passed. No remote deployment had been performed when this local QA was recorded.
