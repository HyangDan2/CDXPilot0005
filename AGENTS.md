# VALKYRIE contributor contract

Read this file before every change.

## Purpose and stack

Deliver a playable original 2.5D arcade action game using Phaser 3, TypeScript strict, Vite, npm, Vitest, Playwright, ESLint and Prettier. Static GitHub Pages deployment; no backend or paid API.

## Architecture and responsibilities

- `src/game/entities`, `physics`, `combat`, `ai` and `src/data`: pure deterministic simulation. Never import Phaser or DOM here.
- `scenes`, `animation`, `camera`, `ui`: presentation adapters; do not decide damage or stage outcomes.
- `input`: translate keys into commands. Simulation consumes those commands at 60 Hz.
- Attack dimensions/timing live in data, not renderer code. Screen Y = depth Y - Z; sorting always uses depth Y.
- SD v3 actors include weapons in their authored frames (user-approved replacement). Separate sword rigs are legacy fallback only. Keep attack timing and collision metadata synchronized with authored poses.

## Style

Strict types, named exports, explicit state transitions, small focused modules. Prettier formatting; no unchecked any. No unseeded random decisions in simulation. Use seconds for clocks and frames only in attack data.

## Commands

`npm install`, `npm run dev`, `npm run build`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run verify`. Install browser once using `npx playwright install chromium`. `npm run assets:generate` regenerates original art; `npm run assets:check` validates it.

## Assets and protected areas

Only original/licensed art. Record provenance in ART_PIPELINE.md. Fixed transparent frame canvases and metadata are mandatory. Preserve original input files; the legacy separate sword keeps its grip/size invariant. Do not hand-edit package-lock.json, generated PNG bytes, or test snapshots to mask failures. Do not remove failing tests or alter unrelated user files. No secrets or deployment credentials in source.

## Definition of Done

Relevant regression tests pass; verify and E2E pass for gameplay changes; visually inspect screenshots after visual changes. Update maintenance/art docs for pipeline changes and CHANGELOG for features. Record unverified checks honestly. Never claim remote deployment from a local build.

## Completion report

Report implemented behavior, file locations, commands, test/build outcomes, asset limitations, known issues and deployment requirements.
