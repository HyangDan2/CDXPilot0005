## Unreleased — double mage appearances in Stage III

- Add a mage to the Drowned Entry, replacing its guard so the encounter size stays the same. Mage encounters now appear in two of the Monastery's three combat waves, with the Floodgate encounter unchanged.

## Unreleased — return to title after stage clear

- Add a `BACK TO THE MAIN` button to stage-clear screens. `PLAY AGAIN` and the existing next-stage continuation remain available; starting again from the title opens the stage picker.

## Unreleased — fewer flyer encounters

- Reduce flyer appearances by half across the six combat waves in the Ashen Forge and Drowned Monastery: from six waves to three. Keep the Ashen Forge's opening and furnace flyers plus one Monastery appearance in the Split Cloister; use ground enemies to preserve those waves' enemy counts.

## Unreleased — development stage picker

- Remove the direct Ashen Forge and Drowned Monastery buttons from the title screen. `BEGIN YOUR OATH` now opens a dedicated picker for all three stages; confirming a choice starts a fresh run directly in that stage.
- Keep story progression available through stage-clear continuation. Add keyboard Enter/Escape support and a compact touch-friendly selection layout.

## Unreleased — dedicated Ashwing and bow-run animation

- Replace the Ashwing's shared rusher appearance with a separate 16-pose flying, dive, hit, fall, down and recovery sheet.
- Airborne hits force the Ashwing into a gravity-driven knockdown. Existing height-aware obstacle collision moves it to the nearest open side before ground landing.
- Add eight Eira bow-run poses and play them at 24 fps, matching the sword-run cadence and one-third-second loop.
- Refine the bow-run poses with more visible upper-body, elbow and bow follow-through while preserving Eira's approved design and bow carry.
- Preserve the existing Eira bow source sheets, attack rules and enemy collision volumes. Add atlas and simulation regressions.

## Unreleased — boss phase two acceleration

- Defer the half-health phase change until a committed boss attack ends, then show a 0.45-second transition before phase two begins.
- Increase boss locomotion, committed charge travel, AI decision cadence and attack animation/timing by 25% in phase two. Existing attack poses and hitboxes advance together through the shared attack clock; environmental warning durations remain unchanged.
- Add regression coverage for deferred transition, one-time phase change and 1.25× movement/attack speed.

## Unreleased — The Ashen Forge

- Add a separate second stage with five areas: cinder approach, stockhouse, furnace hall, cooling garden and forge warden arena. Introduce destructible stockades, stockhouse cover, alternating furnace vents and an optional +50% HP garden potion before the boss combines the mechanics.
- Add title entry and gate-clear continuation into the forge. Carry score, best combo, kills and weapon while restoring HP. Restart the current stage from its entry totals; final forge completion extinguishes machinery, removes support and awards a one-time 1,000-point bonus.
- Forge warden slams activate alternating vent banks after a 1.4s warning, with a safe middle/opposite depth lane; committed charges shatter swept wooden barriers. Both sides take the same environment damage.
- Add original procedural scenery, pipes, pressure indicators, area HUD, stage-specific boss name and warm boss tint using existing authored poses.
- Add stage-flow/device tests, a full five-area input-driven playthrough and browser coverage for entry, continuation, garden recovery, machinery, completion, restart and landscape touch.

## Unreleased — stone cover and S passage

- Add three permanent, 120-unit-high stone piers to the widened second encounter. Alternating bottom/top/bottom gaps form an S passage; stone blocks arrows from both sides and melee through its footprint.
- Author second-wave spawn positions, placing its archer in the upper lane at (1580, 365). Archers seek a clear line around cover and align after detours; committed shots can still be absorbed when a target takes cover.
- Share nearest-surface arrow queries between simulation, AI and clipped aiming telegraphs. Keep paths and overlap recovery inside the piecewise-linear floor boundary.
- Fade stone that obscures actors, mark ground footprints/passages and add original procedural masonry art.
- Add cover, routing, spawn, progression, combat and keyboard/touch browser regressions; retain the full-run survival and clear assertions.

## Unreleased — bow hand correction and approved idle A

- Correct over-saturated red hand shading in bow and bow-walk with localized authored color transfers; preserve original geometry, alpha, costume and weapons.
- Apply approved 1.8-second bow idle cadence. Add preview-only sword, air and bow effects with character-silhouette exclusion.

## Unreleased — one air attack per jump

- Limit sword air attacks to one per airborne interval, including takeoff and low descent. Restore the attack on landing, retain the limit after interruption, and discard extra airborne inputs so they do not trigger a ground attack on landing.

## Unreleased — courtyard environment prototype

- Widen the first encounter's depth from 104 to 150 world units, with tapered entrances and a visible tiled floor.
- Add an original procedural wooden barricade with 64 HP. Melee and arrows can destroy it; actors can detour or jump over its 60-unit height. Rolls, knockback and charges respect its collision.
- Add a furnace vent with 2.8s rest, 1.4s visual/audio warning and 1.2s active fire. Ground fire deals 12 damage at most every 0.75s to either side; jump height 40+ and the established roll window avoid it, while guard does not reduce it.
- Route enemies around intact geometry, preserve seeded loot/kill rewards for environmental defeats, and reset environment state on restart.
- Add simulation and keyboard/touch browser regressions; extend the full-run test driver to navigate between encounters around surviving geometry.

## Unreleased — approved sword idle continuity

- Apply the approved three-second sword idle sequence without rescaling or repainting the character.
- Add two preview-only bow idle cadence options; retire the air-attack shrink preview to preserve sword length.

## Unreleased — character size inspection preview

- Add a non-destructive 24-frame size audit and comparison page with pause, slow playback, facing, scale and landmark controls.
- Preview an idle sequence adjustment and provisional air-attack scaling without changing production artwork or gameplay.

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

## Unreleased — v0.21 stage, enemy and combo expansion

- Extend stage progression from the Ashen Gate through the Ashen Forge to a five-area Drowned Monastery, including new title entry, checkpoint restart, sluice route changes, water slowdown, and a final completion reward.
- Introduce the Ashwing flyer from stage two: it spirals toward the player, marks its dive landing, and limits simultaneous dive attacks. Add the fleeing monastery mage with a telegraphed, limited-homing spell that loses guidance on a well-timed roll or disappears on stone.
- Make enemy attack tells more legible with stronger weapon arcs, aim indicators, flyer landing markers, spell targeting markers, and a clearer boss phase-two treatment.
- At half health, bosses finish their current attack, signal a one-time transition, then move and attack 25% faster with animation and hit timing advanced together.
- Allow a buffered rising attack to cancel into the existing descending combo. Carry running direction and momentum into that same descending strike.
- Add deterministic simulation, progression, combat and browser regressions. New enemy visuals reuse the existing original SD v3 rusher/archer frames; no bitmap assets were generated or modified.

## Unreleased — bow arrow alignment

- Align player arrow tips to the authored bow release pose in both facings; remove automatic height changes based on nearby flyers without adding aiming controls.
- Give player arrows a longer, readable shaft, pointed head and fletching. Preserve character frames, scale, damage and existing projectile collision rules.

## Unreleased — SD v3 Eira attack effects

- Add layered cyan, ivory and gold trails to all four sword combo hits, a rising arc for the uppercut, a full circular sweep for the spin, paired descending trails and impact ring for the air attack, and a bow charge/release flash with aftertrail.
- Render effects behind the current SD v3 Eira actor at its depth, using authored sheet origins and the 0.5 runtime scale. Keep integrated weapon frames, combat timing, hitboxes and projectile behavior unchanged.
- Add browser coverage for all eight attack effects in both facings; capture representative gameplay frames for visual review.
