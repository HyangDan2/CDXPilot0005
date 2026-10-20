# Architecture

## Data flow

`DOM Keyboard → Controller → Input → FixedClock → Simulation → GameEvent → ArenaView / AudioEngine / Interface`

Simulation never imports Phaser, document or window. Input is read once per fixed step; queued key edges survive render frames that contain no step. A fixed 1/60 s clock clamps long frame gaps to 100 ms, preventing a background-tab spiral. Thus ordinary 30–144 Hz refresh changes do not change game speed. Large stalls intentionally drop elapsed time instead of catching up many seconds.

Actor owns X, ground Y, height Z, velocity, HP, facing, FSM, attack ledger and AI state/timers. Projection is `(x, y-z)` and render depth is ground Y, including when airborne. Movement is normalized diagonally and restricted by the piecewise-linear floor profile (Y 330–480 in widened rooms, returning to 376–480 in the original corridors). ActorView renders image/weapon/shadow separately. Camera follows X with exponential smoothing and world bounds.

## Combat update order

1. Queue commands and expire old input; account for hitstop.
2. Apply player locomotion, choose an allowed buffered attack and integrate physics.
3. Advance timed attack windows.
4. Update each enemy's deterministic brain, physics and attack timeline.
5. Resolve player→enemy then enemy→player; killed/interrupted attacks cannot retaliate.
6. Update combo/score, loss state, wave completion and next wave spawn.

Each attack instance owns `Set<targetId>`. Hit eligibility requires an active window, horizontal overlap, ground-depth proximity, vertical overlap, living target and expired invulnerability. Damage and knockback use external attack data. Guard is directional; kicks and rising slash break it. Player invulnerability is 700 ms; enemy invulnerability is 90 ms. Hitstop pauses the world for roughly 55–70 ms while input remains buffered.

FSM guards prohibit locomotion during attacks and restrict knockdown→recovery→idle. Hit/death interrupts are explicit. Attack cancels are admitted only after active frames and only into configured targets. Death cannot recover. Combo counts confirmed hits, resets on player hit or after 2.2 seconds, and has no influence on damage (score only).

## AI and stage

AI: Idle/Chase/Attack/Recover/Hit/Down/Death. Kind selects chase speed, range, guarding and pattern. At most two enemies initiate attacks concurrently. Spawn depth is seeded (default 731); no frame-random AI decisions. Boss performs triple melee, charge and slam; below half HP, speed increases and charge/slam recur more often. Startup tells are rendered from authoritative attack phase/hitbox data.

Stage definitions in `src/data/stages.ts` contain active world bounds, entry, waves, section names and completion reward. The gate retains four encounters; the forge has five areas including an empty garden wave with one optional recovery pickup. Entering a trigger spawns its authored/seeded wave; all enemies dead unlocks travel without automatic between-encounter healing. A final boss defeat clears surviving reinforcements/arrows, extinguishes machinery, applies the stage reward once and emits clear. Player HP zero takes precedence.

`Simulation.nextStage()` derives a fresh forge model only from gate clear, carrying score/best combo/kills/weapon into an entry checkpoint with full HP. `restartStage()` restores the current stage and those entry totals. ArenaScene activates the returned model, clears input and fixed-clock state, and resets views/camera/audio. Native title, stage-clear and replay buttons call these transitions; presentation does not decide completion.

`StageEnvironment(stageId)` owns the selected solids, periodic/manual vents and hit ledgers. Forge charge sweeps break wood before collision; a landed active slam triggers an alternating, non-stacking warned bank after attack advancement. Both sides use the same environmental damage rules. `EnvironmentView` and `ForgeView` read those states to draw original procedural scenery, machinery and effects. Stage bounds are explicit for camera/projectiles, while original helper defaults remain compatible with the first map.

## Presentation and lifecycle

ArenaScene owns adapters and resets Simulation on restart. Interface renders accessible DOM menus/HUD outside Phaser. ArenaView pools actor views by ID, destroys obsolete views, and renders effects. Weapon angle/pivot come from `rig.ts`; a single immutable texture is reused, with constant per-kind scale. Effects never deform the weapon. All PNG requests may fail without stopping scene creation; fallback textures are generated locally. The bundled manifest remains a build-time requirement.

AudioEngine lazily creates AudioContext after a start gesture. Volume and pause affect a master gain. Synth voices disconnect when done; music scheduling happens only during active play. Scene shutdown removes input listeners and closes audio.

`?test=1` exposes snapshot and named fixtures, exclusively for E2E. It is not a production cheat UI; no test API is installed on normal URLs. Since all state is local, it contains no secrets or privileged operations.


## v0.2 extension

DoubleTap is a pure input-edge recognizer; Controller supplies real event timing and ignores OS repeats. ArenaScene cancels the run latch when simulation enters an interrupting state. The simulation remains independent of DOM.

Actor.juggle tracks active/launches/airHits/forced/groundedTime. Combat updates budgets and prevents forced-down/grounded-down/recovery hits; physics resets only after recovery completion and grants wake protection. Bosses stagger briefly instead of launching. AI adds Flank/Retreat, timed approach bursts, separation and committed telegraphs.

Detailed player animation comes from eira.ts plus a versioned manifest of per-action 384px sheets, with hand anchors for each keypose. ActorView selects detailed textures when available and retains the legacy renderer for missing assets. weaponPose supports both generated and legacy fixed weapon geometry. The title uses the full-resolution master and HUD uses a separate portrait. The art-review page is a static development artifact that ships with the build.
