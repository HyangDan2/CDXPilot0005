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
