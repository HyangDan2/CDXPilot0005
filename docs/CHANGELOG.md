## 0.5.0 — 2026-10-20

- Add 84 Eira and 72 enemy authored poses, doubling prior asset counts; add six interruptible run-stop poses.
- Lower idle braid, increase movement follow-through, regenerate rigid integrated blades and two-handed grips.
- Map rising attack to four ascending strike phases; retain existing combat durations.
- Verification: 65 unit tests, 8 Chromium E2E tests, asset checks, lint, typecheck and production build pass locally.

## Unreleased — retro player motion refresh

- Replace all player motion selections with 42 new retro pixel poses: idle, walk/run, two slashes, rising, air attack, guard/spin, jump/fall/landing, hit/down/recovery.
- Lower idle braid, retain two-handed sword and remove helmet protrusion; update portrait and motion review.

## 0.4.0 — 2026-10-19

Two-handed sword art; K guard replaces kick; down-forward-J rising replaces L; strict J+K armored spin costs20% maximum HP once on hit. Remove wave heal; add5% potion drop with10/20/50% tiers. Original medieval-style synthesized BGM normal/boss loops, independent volume, pause/restart lifecycle. Fix Escape while volume control focused.

## 0.3.0 — 2026-10-19

- SD player and four enemy roles; 72 preserved authored poses with integrated weapons and clear kick keys.
- Pose-linked swept strike envelopes, revised hurt height, corrected mirrored origin; removed detached sword arc.
- Faster pursuit, shorter re-engagement/flanking delay; anti-juggle and double-tap retained.
- Reduced player hitstop, removed v2 sheets from normal preload, SD portrait/title and motion review page.
- 49 unit/integration tests and seven Chromium E2E tests passed; full pipeline notes in art/SD_V3.md.

# Changelog

## 0.2.0 — 2026-10-18

- Reference-based detailed Eira: 72 unique poses, full-resolution master, portrait and independently rigged generated sword.
- Versioned alpha silhouette extraction/packing and interactive art-review page; legacy assets remain fallback-only.
- Directional double-tap-and-hold running; removed Shift binding and added interruption handling.
- Faster enemy approach, flank/retreat/re-entry, crowd spacing and fixed attack direction after tells.
- Per-target air hit/launch budget, forced protected knockdown, wake protection and boss launch resistance.
- Added model and browser regressions for input, AI, juggle rules and generated assets.

## 0.1.0 — 2026-10-18

- Initial playable Phaser/TypeScript static arcade game, original Valkyrie protagonist and ruined-cloister stage.
- Fixed-step XYZ movement, jump/dash/guard, explicit FSM, buffered combo combat and independent immutable sword rig.
- Three enemy types, timed boss with enrage, four encounters, game over/restart and stage clear.
- Original procedural pixel sheets/backgrounds, fallback textures, effects and synthesized SFX/BGM.
- Responsive title/HUD/pause/volume/field-guide UI and F1 diagnostics.
- PNG pipeline, Vitest model/playthrough coverage, Playwright Chromium production-path coverage, CI/Pages configuration and maintenance documentation.
- Known scope: programmatic MVP art; keyboard desktop only; one stage; remote deployment and non-Chromium browsers not yet verified.
