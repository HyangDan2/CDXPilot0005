# Agent Harness

## 1. Architecture

AGENTS.md is the contributor contract. Pure model tests verify rules, integration tests verify whole encounters, Playwright verifies DOM/canvas wiring and real keyboard inputs. The asset checker validates actual PNG bytes. CI runs the same commands as a developer. Rendering does not determine game outcomes.

## 2. Local environment

Install Node 22.13+ (recommended Node 22 via `.nvmrc`) and npm. Clone/download the repository, run `npm ci`, then `npx playwright install chromium`. On Linux use `npx playwright install --with-deps chromium`. A committed lockfile fixes dependency versions. `.npmrc` fails early on unsupported Node versions. No keys or paid services are required.

## 3. Development server

`npm run dev` starts Vite on its displayed URL. Use `npm run build && npm run preview` to examine a production bundle. Browser refresh resets play; there is no persistent game save. Start button/Enter unlocks audio. If occupied, Vite selects another dev port; E2E expects 4173 and should not share it with unrelated servers.

## 4. Model verification

`npm run verify` runs environment presence/version checks, asset checks, ESLint, strict typecheck, Vitest and production build. `npm run test:watch` supports iteration. Unit tests cover projection, FSM, fixed-clock equivalence, hit windows/depth, damage, invulnerability, combo buffering, launch, rig dimensions and image extraction/packing. Integration tests cover AI timers, boss patterns, seeded waves, outcomes, and a complete input-only automated playthrough with no damage/health cheats.

## 5. E2E procedure

Run `npm run test:e2e`. Playwright builds production files and launches `scripts/serve-preview.mjs` mounted at `/valkyrie/`. Tests use one Chromium worker and seed 731. Assertions poll authoritative snapshots rather than relying on arbitrary sleeps (one short wait explicitly checks pause freezing).

- Actual keyboard movement, jump, sword hit, debug, pause/resume and restart.
- Responsive canvas aspect ratio, field guide and title.
- Boss and terminal screens use **named fixtures**, not a claim of full browser playthrough.
- All PNG requests aborted to exercise playable fallbacks.
- A normal URL has no harness and no failed asset responses.

`window.__VALKYRIE__.snapshot()` exists only with `?test=1`; `.fixture('combat'|'boss'|'over'|'clear')` prepares UI checks. Do not use fixture shortcuts to claim combat correctness; use the pure model playthrough and real keyboard hit tests.

## 6. Debug mode

F1 toggles FPS, player FSM, XYZ, current wave, attack frame, combo and enemy AI. Green boxes are hurtboxes projected vertically; red rectangles are ground hitbox footprints, not a literal on-screen sword silhouette. Yellow marker/cross is the weapon grip/anchor. Compare Y rather than screen Y when diagnosing depth misses. I holds guard.

## 7. Screenshots

The test suite writes title, gameplay, debug combat, pause, boss and clear screenshots under test-results. Open `npx playwright show-report` and inspect them at 100% for cut limbs, unstable sword shape, UI clipping, misplaced feet and unreadable text. `docs/screenshots/` stores a reviewed reference set, not automatic pixel-match baselines. Runtime effects cause expected small visual differences. Never replace reference images solely to hide an unintended regression.

## 8. Failure recovery

- Engine error: `node -v`, activate Node 22, then `npm ci`.
- Missing Chromium: install the browser and Linux dependencies.
- Missing PNG/manifest: `npm run assets:generate && npm run assets:check`.
- Type/lint/model failure: fix the implementation; do not disable assertions.
- Browser failure: inspect HTML report, screenshot and trace with `npx playwright show-trace <trace.zip>`. Check port 4173 and console output.
- Dependency graph corruption: preserve logs, regenerate dependencies with the supported runtime; never manually patch lockfile resolution fields.

## 9. CI

`.github/workflows/ci.yml` runs npm ci, verify, browser installation and E2E on all branch pushes and PRs; manual dispatch is available. Browser reports upload even on failure. Only a successful main run uploads/deploys Pages. Pull requests have read-only content permission. The separate deploy job receives pages/id-token permissions and uses the github-pages environment.

## 10. Codex workflow

Read AGENTS.md, audit existing files, record a plan, make a bounded change, run relevant regression tests, run verify and browser tests for gameplay/visual changes, visually inspect screenshots, update docs and report actual outcomes. Record blocked/unverified external checks. Preserve user files, original art sources and independent weapon geometry. Follow phase gates in IMPLEMENTATION_PLAN.md; do not advance after an unresolved failure.
