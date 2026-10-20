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
