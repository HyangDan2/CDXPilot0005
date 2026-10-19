# VALKYRIE implementation plan

## Phase 0 — audit (2026-10-18)

The workspace was empty, with no package.json, source, Git metadata, AGENTS.md, reference image, or art/audio assets. No existing product is overwritten. The supplied master order is the acceptance specification.

## Decisions and risks

- A static Phaser 3 / strict TypeScript / Vite application. Pure fixed-step simulation is independent of Phaser and DOM; rendering, input and audio adapt it.
- Original programmatically drawn pixel art with fixed transparent canvases. No missing reference image blocks implementation. Art remains MVP quality, not a hand-animated commercial JRPG asset set.
- Sword uses one immutable PNG, a hand-relative pivot and rotation only. Body animation has authored pose sequences and separate effects.
- 60 Hz simulation, seeded AI, buffered attacks, and a test-only harness behind `?test=1` support repeatable QA.
- Browser audio starts only after an explicit Start gesture. Web Audio is optional and falls back silently.
- GitHub publishing needs a remote repository and Pages settings; prepare workflows without claiming a remote deployment.

## Ordered implementation and gates

1. Bootstrap and harness: runnable title, scripts, lint/typecheck/unit/build, CI. Gate: npm run verify.
2. Engine: XYZ projection, fixed timestep, state machine, input, animation/rig, camera/debug. Gate: engine unit tests and verify.
3. Combat: external attack data, timed windows, hit ledger, combo cancels, launch, hitstop. Gate: combat tests and verify.
4. Enemy and stage: deterministic AI, three enemies/boss, waves, outcomes/UI. Gate: integration tests and verify.
5. Visual/audio: original pixel assets/pipeline, scrolling temple, animation, synthesized effects/music. Gate: asset checks, verify and browser inspection.
6. Release: E2E/screenshots, maintenance/harness/design/art docs, Pages workflow. Gate: full verify and Playwright.

Phase results are recorded in docs/QA.md. Failures are fixed before advancing. Remote Actions/Pages execution remains unverified until a repository is configured.

## Completion

Phases 1–6 implemented and their local gates passed. Final verification: 26 Vitest tests, 4 Chromium E2E tests, clean install, PNG checks, lint/typecheck/build. See QA.md for evidence, art limitations and remote-deployment checks that remain unverified.
