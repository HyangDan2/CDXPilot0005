## v0.4 maintenance

CombatInput uses DOM event time in milliseconds; simulation remains seconds at60Hz. Spin bypasses AttackBuffer and rechecks eligibility. Regenerate audio via npm run audio:generate; asset checks validate music. Preserve independent loot RNG. See [TWOHAND_V4.md](art/TWOHAND_V4.md).

## SD v3 maintenance

Use `scripts/sd-atlas.mjs` and `scripts/check-sd.mjs`. Update authored contact poses in `animation/sd.ts` together with strike shapes in `data/motions.ts`; keep shared pose thresholds. Left-facing origin must be `1-originX` because the weapon canvas is asymmetric. Recheck `/sd-review.html`, F1 collision overlays and E2E after edits. See [SD v3](art/SD_V3.md).

# Maintenance guide

## Architecture maintenance

Read AGENTS.md first. Maintain dependency direction: data/types → model systems → Simulation → scene adapters. Never import Phaser or DOM from AI, physics or combat. Add a new system as a pure module with explicit inputs and output events; let ArenaView/Interface/AudioEngine observe those events. Keep numerical rules in config/data. Avoid global mutable gameplay state.

To add an FSM state, update `State`, allowed transitions, completion conditions in physics/combat, pose counts and manifest generation, then test both valid and invalid transitions. Death must remain terminal and attacks must not be interruptible by ordinary movement. An AI state change belongs in brain.ts; time and range decisions must be explicit and seeded if randomized.

## Content maintenance

| Change               | Files and process                                                                  | Regression checks                                        |
| -------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| New player/character | Kind/Actor health, generator/source, manifest, ActorView and optional selection UI | asset validation, FSM/rig tests, verify + browser        |
| New attack/animation | AttackId, attacks.ts, chooseAttack/cancelInto, state poses/rig angles              | timing, depth, hit ledger, cancels, full playthrough     |
| New weapon           | Independent PNG + dimensions/pivot/length metadata, rig and view                   | real PNG dimensions + tip distance invariance, F1 visual |
| New enemy            | Kind/health, AI speed/range/guard rules, sprite, waves.ts                          | seeded AI transitions, damage, stage playthrough         |
| New stage            | Stage/wave data, WORLD length/ground bounds, backgrounds/camera                    | wave unlock/clear, camera and Pages assets               |
| New boss pattern     | AttackId if needed, timed boss cycle in brain.ts, telegraph event/view             | pre/post-enrage sequence, hit windows, playthrough       |

Stage progression is defined in `data/stages.ts`; add stage ids there before selecting stage-specific environment rules, and update `StageEnvironment`, stage views, title/clear UI, world bounds and checkpoint-flow tests together. Flyer, mage, guided-bolt, water and boss phase tuning lives in `data/enemies.ts` and `data/bossPhase.ts`. Keep AI, projectile collision, water slowdown, and phase transitions deterministic; views must not decide outcomes. Existing rusher/archer frames are temporary visual reuse for flyer/mage kinds until original dedicated sheets are authored and recorded in the art provenance log.

New characters currently require code registration; there is no editor or external mod API. When changing balance, keep tests about invariants rather than making every test depend on a single tuning value. The playthrough should remain achievable with ordinary inputs.

## Asset maintenance

Replace PNG only after provenance review. Keep fixed 48×64 body cells, transparent borders and foot baseline unless intentionally migrating the entire atlas. Manifest frame start/count/order must match the generated sheet. Both renderer and tests depend on those offsets. For FPS changes, update pose frame selection and generator metadata together; attack simulation timing remains defined in 60 Hz frames, not pose FPS.

Calibrate weapon grip with F1: the yellow point should be in the hand in both directions and all attack poses. Adjust body-relative anchor/rotation, never stretch the sword. Inspect body and effect layers independently. Run `assets:check`, extraction/packing tests, build and screenshots. Commit PNGs with their sources/metadata; do not hand-edit encoded PNG bytes. Use versioned branches or Git LFS for large art, keep reviewed references and record visual changes in CHANGELOG.

## Troubleshooting

| Symptom                       | Diagnosis and repair                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Character invisible           | Check texture path/case and manifest frame offset. Confirm hp/alpha/depth and origin. Test blocked-image fallback; restore missing PNGs with generator.                         |
| Hitbox seems displaced        | Ground footprint uses depth Y; hurtbox uses Y−Z. Verify facing and offsetX; red debug rectangle is not sword outline.                                                           |
| Sword rotates away from hand  | Match grip (8,6), sprite origin (8/52,.5), body scale and rig offsets. Never compensate by per-frame width changes.                                                             |
| Missing animation frames      | Verify counts/order and atlas columns; run PNG checker. Renderer falls back to base frame for unavailable texture frames, but release should correct manifest.                  |
| Jump collision mismatch       | Hit tests require ground-depth alignment AND vertical overlap. Never compare projected screen Y for depth. Confirm Z/vz gravity and landing transitions.                        |
| No sound                      | Click Begin first, check volume/browser mute/audio permission. Audio failure is nonfatal. Do not attempt autoplay before a gesture.                                             |
| Pages 404s                    | Set Pages source to Actions, inspect deploy logs, ensure `base:'./'` and BASE_URL asset paths. Avoid leading `/assets` and test under `/valkyrie/`.                             |
| Low FPS                       | Inspect F1 after warm-up, disable debug, profile draw calls and transparency. Reuse actor views; avoid allocating textures every frame. Cap particles and cleanup tweens/audio. |
| Inputs stuck after focus loss | Controller clears held keys on blur and pause; verify listener lifecycle and active element (range inputs ignore gameplay keys).                                                |
| E2E timeout                   | Check port 4173, installed Chromium and retained trace. Avoid running a different server on this port.                                                                          |

## Regression policy

All changes: lint/typecheck and relevant tests. Gameplay/balance: full model suite and input-only playthrough, then verify and E2E. UI/art/audio/input: browser suite, visual screenshot inspection, asset checks; manually listen to audio when changing timbre/mix. Build/paths/dependencies: clean `npm ci`, verify, nested-path E2E and audit. Documentation-only changes: check paths and command accuracy. Do not regenerate baselines to conceal a failure.

## Release management

Use Semantic Versioning: patch for compatible fixes, minor for new content/features, major for breaking save/mod/API contracts if those are introduced. Version package.json, lockfile and UI version consistently. Record user-visible features/fixes/known issues in CHANGELOG with dates.

Release checklist:

1. Review AGENTS.md and source/asset provenance; clean installation with Node 22.
2. Run verify and E2E; inspect title/combat/pause/boss/clear screenshots.
3. Check keyboard focus, resize, sound, missing-image fallback and console errors.
4. Update docs, QA and CHANGELOG; review generated dist only as an artifact.
5. Push tagged release to main through normal review. Ensure successful Actions and Pages job.
6. Smoke-test the published nested URL. Local build success is not proof of remote deployment.

Rollback by reverting to the previous release commit/tag and rerunning the main workflow (or restore its known-good Pages artifact through the same deploy mechanism). Never delete user state to fix an unrelated bug; this MVP has no persistent saves. Keep Node/Phaser/browser compatibility in README; after dependency upgrades repeat clean install and all tests. Chromium desktop is the automated baseline; Firefox, Safari, mobile and accessibility assistive technology require separate qualification.

## v0.2 additions

For detailed Eira, use `scripts/eira-spec.mjs` and `src/game/animation/eira.ts`, not the legacy 48×64 manifest. Keep source sheets in art/generated; run assets:pack-eira after reviewing alpha segmentation/root/hand changes. Check art-review.html for every affected clip and run eira.test.ts plus assets:check. Full-resolution sources should never be overwritten by downsampled runtime output.

Input changes require doubleTap tests plus the real browser run/interruption test. DoubleTap uses semantic directions with physical key edges; do not use KeyboardEvent.repeat as a tap. Scene cancellation must also respond to model Hit/Attack/Guard states.

Combat changes require juggle.test.ts (including wall edge and 30/60/144 Hz), combat tests, full playthrough and E2E. Never reset juggle.active on mere ground contact. AI tuning requires committed-direction, flank/separation and retreat regressions. Add new AI states to the type union and keep two attack reservations inclusive of guarding enemies.

## Ranged combat / v0.7

Projectile swept collision lives in `entities/projectiles.ts`; timing/damage in `data/attacks.ts`, phase-to-pose selection in `animation/twohand.ts` and `sd.ts`. Keep `public/sd-review.html` selections synchronized. Guard/roll cancellation is in `movement.ts`, roll timing in `physics/world.ts`, immunity in `combat.ts`. Settings uses localStorage keys `valkyrie.sfx` and `valkyrie.bgm`. Test-only `archer` fixture positions an aimed enemy for real projectile damage checks.

## Original Eira style

Use `art/generated/sd-v10/style-reference.png` as identity reference for future Eira edits. Preserve pose choreography separately; avoid recursively adopting costume changes from generated motion sheets. Registration is generated by `node scripts/prepare-sd-v10.mjs`, then `npm run assets:pack-sd`. Inspect source edge reports and same-scale head sizes before accepting regeneration.

See [Touch / v11 artwork](art/TOUCH_V11.md) for current source provenance, registration rebuild, touch input lifecycle and platform verification limits.

E2E port override: `PORT=4183 npm run test:e2e` uses the same port for preview startup and browser URL when 4173 is occupied.

### v12 readiness and boss reinforcements

`PLAYER.rollCooldown` and `canRoll` are shared by simulation and HUD. Support thresholds/caps live in `src/data/bossReinforcements.ts`; the deterministic queue lives in `entities/reinforcements.ts`. Presentation only draws its warnings. See `art/READINESS_V12.md` for the costume/bow regeneration pipeline.

### Bow idle playback

`public/assets/sd-v3/bow-idle.json` is the shared bow idle clip definition (durations in seconds). The runtime imports it and the review page fetches it, converting durations to milliseconds. Keep shooting/running frames out of this clip. Unit coverage verifies the loop boundary, facing directions, action overrides and an actual switch followed by idle simulation.

## GameHub return

The absolute destination is defined once in `src/game/config/navigation.ts`. The single header link sits immediately beside Settings on every screen, including landscape touch play. Title, clear and game-over navigate directly. Playing and paused runs open the native `hub-exit` dialog after pausing; its semantic confirmation anchor navigates in the same tab. Cancel/Escape keeps the run paused and returns focus to the header link. There is no run-save system. Settings retain their existing `valkyrie.*` keys.

Scene pagehide handling pauses the run, clears input and silences audio, including pending result-track fades. Browser Back may restore a paused page from cache or reload the title; neither promises restoration of an unfinished run. Start/resume returns keyboard focus to the canvas, while menus focus their primary action. Run `npm run verify` then `npm run test:e2e`; hub tests intercept external navigation and cover header placement, confirmation/cancellation, Enter/touch, settings, Back, rotation and audio. Hosted acceptance must separately check the production URL → GameHub → this game.

## Courtyard environment prototype

Tune courtyard bounds, barricade geometry/HP/height and flame timing/damage in `src/data/environment.ts`. `stageDepth(x)` widens only the first encounter, tapering back to the original corridor by x=1080. Movement, physics and AI consume those depth bounds. `StageEnvironment` owns per-run HP, phase time, warning events and flame damage cooldowns; `Simulation` advances it only while playing and outside hit stop. Restart creates fresh state. Environmental enemy kills award the existing 200-point kill reward and seeded loot roll, without attack-damage combo points.

`physics/obstacles.ts` resolves swept ground movement, landing/spawn overlap and deterministic visibility-graph detours. Navigation has extra clearance around collision bounds so corner following does not require exact coordinates. The layout contains one isolated barricade with two open detours; adding tightly packed obstacles or unreachable destinations requires additional route/layout validation. Ground collision uses actor half-extents 16×10; actors above barricade height can pass. Melee uses the existing authored hitbox and a per-swing hit ledger; arrows are intercepted before farther actors and are consumed even when breaking the wall. Low barricades do not shorten melee reach: an authored strike can reach actors beyond them.

Fire bypasses directional guard, respects existing invulnerability and roll timing, and is avoided at z>=40. The 0.75s interval limits repeated contact damage. Warning sound is played only near the player. Presentation lives in `scenes/EnvironmentView.ts`; do not move damage or stage outcomes there.

Run `npm run verify` followed by `npm run test:e2e` with Node >=22.13. New regression files are `tests/unit/environment.test.ts`, `tests/integration/environment.test.ts` and `tests/e2e/environment.spec.ts`. Test-only `courtyard` and `flame` fixtures require `?test=1`; production has no harness. Inspect the new desktop/mobile screenshots in `test-results/` after visual changes. There is no separate stage selector or new deployment step; the existing GitHub Pages build serves the prototype as part of the first stage.

## Stone cover / S passage (phase 2)

`depthProfile` in `src/data/environment.ts` is the shared piecewise-linear upper floor edge; `stageDepth(x)` interpolates it and `EnvironmentView` draws the same vertices. The second encounter is 150 units deep from x=1180 to x=1760, tapering back by x=1920. `pillarDefinitions` contains three permanent piers at x=1280/1470/1650, width 44, height 120, with alternating floor footprints. The positive `hp: 1` is an occupancy marker, not destructible health: only per-run wooden barricades receive structural damage. `StageEnvironment.solids` combines the two categories for movement, routing and arrows.

Keep each passage at least wide enough for actor half-extents 16×10 plus the navigation margin. The visibility graph rejects edges outside the actual floor profile, and overlap recovery chooses a valid floor edge. Do not use renderer coordinates or alpha to change solidity. `blocksMelee` prevents attacking through stone; the existing low-barricade reach rule remains intact. Ordinary jumps peak below the stone height. Existing authored knockback can move actors above 120; landing overlap still resolves to a legal ground position.

`firstArrowBlocker` is the shared nearest-surface query. `StageEnvironment.interceptArrow` consumes shots without damaging stone; AI checks the same horizontal height-aware lane before starting a shot. The renderer clips the committed aiming line at the first blocker. It does not retarget a shot after windup begins. Archers can hold a clear firing position within their normal range and need not walk through every passage. `waves[1].spawns` in `src/data/stage.ts` sets legal, deterministic approach and upper-lane archer positions; other waves retain their existing seeded placement.

`EnvironmentView` fades a pier when it would hide a living actor, while the footprint stays visible. Procedural visuals and metadata are recorded in ART_PIPELINE.md. The new regression files are `tests/unit/cover.test.ts`, `tests/integration/cover.test.ts` and `tests/e2e/cover.spec.ts`; the full-run input driver uses all solids between encounters. Browser-only fixtures `cloister`, `pillarCover` and `cloisterBattle` are gated behind `?test=1`. Run verify and E2E sequentially and inspect `test-results/cover-*` screenshots.

## Bow hand correction sources

The bow and bow-walk sources use the localized authored correction documented in [hand fix / effects review](art/HAND_FIX_AND_EFFECTS_2026-10-20.md). Preserve v12 inputs and `art/generated/hand-fix-v13/corrected-hand-crops.png`. Rebuild corrected sources with `node scripts/pack-hand-fixes.mjs`, then `npm run assets:pack-sd`; the compositor asserts unchanged alpha and pixels outside its restricted transfer mask. Bow A timing remains in `public/assets/sd-v3/bow-idle.json`. Effects in `/attack-effects-review.html` are preview-only, not gameplay behavior.

## Ashen Forge stage flow and machinery (phase 3)

`src/data/stages.ts` defines the two stages, their bounds, spawn points, names, waves, section art palette and completion reward. Gate coordinates remain 0–3600; forge coordinates are 3600–7200. `WORLD.length` remains the original fallback for isolated callers. Live simulation passes the active stage bounds to movement and integration, the end to projectile lifetime bounds, and start/end to the camera. `depthProfile` spans both maps; its last vertex bounds navigation. Do not globally change the original fallback to add a stage.

`Simulation.nextStage()` returns a new forge simulation only from gate clear. It carries score, best combo, kills and equipped weapon into an entry checkpoint; new actors restore full HP and clear commands, arrows, invulnerability, loot, reinforcements and environment state. `restartStage()` restores the current stage and its entry totals so restarting cannot farm score. Fresh title forge entry has no carried totals. ArenaScene resets input, fixed clock, actor views, camera and audio for either entry path. Forge clear has a replay of the forge checkpoint; there is no third-stage transition or persistent save/unlock.

The garden wave contains no enemies and opens the onward route automatically. Its negative-ID recovery pickup is inserted once when the wave triggers, remains available until collected, and uses the existing gold +50% HP rule. It is optional and requires a move toward the upper depth before committing to the boss arena. `sectionIndex` uses position rather than wave index so the HUD continues to show the garden after its empty wave opens the next route.

Forge environment definitions are separate from gate prototypes. `StageEnvironment(stageId)` owns the chosen barriers, piers and vents. `allBarricades`, `allPillars` and `allFlames` provide a stable render registry for both stages. `ForgeView` owns original five-area set dressing; `EnvironmentView` draws simulation-owned phase/HP and remains responsible for no damage or progression rules. The warden uses existing boss poses and attack timing with a presentation tint, rather than a new sprite atlas.

Call `bossMotion` after movement integration and before collision: active forge charges sweep the same expanded ground bounds and destroy hit wooden barriers once, then continue through the new opening. Call `bossImpact` after attack advancement: a landed active slam tags its per-attack hit ledger and starts one bank with warning 1.4s/active 1.2s. The next accepted slam alternates banks; slams during an ongoing cycle cannot stack or queue overlapping banks. North covers Y335–390, south Y425–475, leaving the center/opposite lane and horizontal edges safe from fire. Timing and geometry live in `src/data/environment.ts`. Environment death uses ordinary kill/seeded-loot handling; player death takes precedence on mutual KO. `finishBoss` extinguishes every vent, clears support/projectiles and applies `stage.clearBonus` once.

Regression sources: `tests/unit/forge.test.ts`, `tests/integration/forgePlaythrough.test.ts` and `tests/e2e/forge.spec.ts`. Keep the input-driven playthrough free of stat overrides. It reads warnings, navigates actual solids and collects the garden pickup. Test-only forge area/action fixtures remain gated by `?test=1`; production entry uses native menu buttons and no harness. Run verify before E2E and use isolated output/report folders and a separate production preview when other local validations share the repository.
