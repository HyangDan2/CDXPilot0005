## Unreleased — GameHub header placement

- Move GameHub navigation beside the upper settings button on desktop and landscape touch layouts.
- Leaving a playing or paused run opens a paused confirmation dialog. Cancel/Escape restores header focus; title/results navigate directly.

## Unreleased — GameHub return

- Add accessible same-tab 게임 허브로 links to title, pause, victory and defeat menus.
- Warn that leaving a paused run discards unsaved progress; preserve stored settings.
- Prevent menu activation from triggering gameplay shortcuts and silence audio on page exit.

## 0.7.1

## Unreleased — touch controls and grounded walking

- Landscape touch overlay, portrait pause, game-area gesture suppression, configurable touch controls.
- Eight-frame bow walking and weighted sword walking; lowered idle braids, empty bow-idle hand, longer arrows.
- Keyboard controls and combat balance preserved.

- Redrew all nine modern Eira animation sheets (130 poses) from the first approved idle identity: silver-gray braid, slender SD proportions and consistent blue/gold costume.
- Preserved controls, combat timing and enemy assets; compacted special-attack atlas indices and synchronized review clips.
- Corrected source padding, sword tips and bow props; aligned regenerated poses and refreshed portrait from the original reference.

## 0.7.0

- I sword/bow switch, slow J shot, L dodge with vulnerable startup/landing and cooldown.
- Bow guard40% incoming damage versus sword20%; draw cancels on hit/guard/roll.
- Archer projectile enemy, agile low-damage dagger and slow high-damage heavy roles.
- Calm idle, longer sword combo, generated bow/roll/archer atlases.
- Upper-right settings, persistent separate SFX/BGM; major victory and minor defeat music.
- Added projectile, cancellation, roll-window and browser audio/settings regressions.

## 0.6.0 — 2026-10-20

- Four-stage vulnerable sword chain with increasing damage and interrupt reset; one buffered follow-up, mandatory windup and recovery gap.
- Add24 authored combo poses, restore both idle helmet plumes, improve small-component atlas ownership.
- Add generated1200×630 social preview, PNG/ICO favicons, Apple icon and Open Graph/Twitter metadata.

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

## 2026-10-20 — Eira v12 and boss support

- Added HP-adjacent roll recharge meter and mobile charge indication, including READY/WAIT state distinction.
- Revised all 146 Eira poses for ivory skirt/gold hem and fitted boot continuity; low bow idle and matching eight-frame walk, arrow-free equip/unequip.
- Lengthened player flight arrows from 32 to 48 pixels without changing damage or collision.
- Added telegraphed, capped boss support at 70% and 35% HP; boss defeat clears remaining support immediately.

## 2026-10-20 — Bow idle playback fix

- Fix bow idle being pinned to frame zero after switching weapons. Play the two existing relaxed poses in a three-second loop.
- Share bow-idle frame order and timing between the game and animation review through `public/assets/sd-v3/bow-idle.json`.
- Preserve authored artwork, weapon geometry and all combat timing.
