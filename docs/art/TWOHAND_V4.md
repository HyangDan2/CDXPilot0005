# v0.4 — two-handed commands, loot and medieval music

2026-10-19. User-authorized replacement of kick/button-rising with two-handed sword combat.

## Controls and semantics

- J: sword; K held: frontal sword guard. Guard permits 25% horizontal / 20% depth walking, takes 20% ordinary frontal damage, and preserves its facing. Rear attacks do full damage. K and J arbitration delays the first eligible key by at most 40ms plus the next simulation tick. Guard held plus J stays guarded.
- Down, forward, J: three fresh edges within 400ms, facing locked when down is pressed. Facing left means down-left-J. WASD and arrows work. L and I are unbound. Normal attacks retain a 200ms buffer.
- J+K: both keys must first be released, then fresh presses at most 40ms apart. Both edge snapshots must be eligible (Idle/Walk/Run, grounded, no attack). No attack, recovery, guard, aerial or hit cancellation. Invalid special inputs are never put in AttackBuffer. Repeats and adding K to a held J cannot trigger it. At most one special per full release cycle.
- Spin: six startup frames, 24 active, 24 recovery. Six authored turn poses, area coverage ±95 X / ±38 depth, one hit per target, damage40 and outward knockback300. Super armor throughout the move reduces incoming damage to20%, prevents stagger/launch and movement from knockback, but does not prevent death. No cancel graph.
- First actual spin hit charges 20% maximum HP exactly once per use, even across multiple enemies; whiff is free. Requires HP strictly greater than the cost at activation. Incoming damage can still make the first-hit cost lethal. Dead attackers cannot continue hitting subsequent enemies.
- No wave-end heal. Each enemy death independently rolls <.05; successful drops choose 10%/20%/50% max-HP potions at conditional70%/25%/5%. Separate seeded loot RNG does not perturb wave spawn randomness. Ground pickup after .4s within24 X and16 depth, Z<12, capped at maximum HP. Potions persist between encounters. Green/blue/gold and small/medium/large identify tiers.

Kick's gameplay input, cancel links and current review clip have been removed. Historical AttackId/data/art remain for archived regression coverage and old fallback metadata; there is no keyboard or current command route to kick.

## Image generation and preservation

Used built-in imagegen, not an API/CLI fallback. Sources copied to `art/generated/sd-v3/twohand.png` and `defense.png`, 12 poses each; packed into `public/assets/sd-v3/` using the existing technical alpha-extraction pipeline. No painted/code-generated substitutes. Originals and previous art remain intact. All24 new silhouettes separate cleanly, packed frames have clear borders. Only two new player sheets plus four enemy sheets preload in the current game.

Prompt set:

1. Reference: prior SD Valkyrie combat sheet. Production transparent SD pixel-art Valkyrie, silver braid, wing helmet, blue/gold armor, white skirt. One long TWO-HANDED sword, both hands together on the same long hilt in every pose. 3 columns ×4 rows: neutral idle/two walk contacts; run stride/passing/opposite stride; overhead windup/diagonal slash/horizontal slash; low rising preparation/diagonal rising/high rising. Same body scale and foot baseline, three heads tall, bold pixel clusters, generous transparent gutters, no text/FX/grid/shadow or detached weapon. Output `exec-dd2f3e88-b0ba-472b-a4e9-87922728159a.png`.
2. Reference: new twohand sheet. Same identity, BOTH hands wrapped around hilt, never blade, 3×4. Three guard keys (raise/planted vertical block/recoil); spin keys windup/front turn/back three-quarter/back-facing/front sweep/finish; tucked jump/recoil/fallen while holding sword. Natural torso/hip turn, no duplicate swords or effects, transparent isolated full silhouettes. Output `exec-455d824a-48b4-4794-b1e3-6e5ae53b53d0.png`.

Player motion selector: `src/game/animation/twohand.ts`; hit envelopes adjusted for new blade reach in `src/data/motions.ts`. Walk/run cycle uses four timed keys with a repeated passing pose. Idle/jump/guard are held keys; slash2 reverses contact poses; air shares slash poses; recovery uses crouched rising preparation. Generated small details can vary between keys. These are deliberate limited-animation sprites, not full hand-animated in-betweens.

## Original music

No dedicated music-generation service was available. `scripts/medieval-music.mjs` composes and renders original D-Dorian pieces using additive/plucked synthesis: lute-like decaying harmonics, recorder-like sustained melody, low open-fifth drone, resonant frame-drum-like hits. No copyrighted songs, samples, downloaded audio, or paid service.

- `public/assets/audio/cloister-march.wav`: general exploration/combat.
- `public/assets/audio/ashen-king.wav`: same theme, denser plucked subdivision and percussion for boss.
- Both mono22.05kHz/16-bit PCM, 38.4 seconds, 16bars at100BPM, looped; circular short room reflections preserve tail. Normalized peak .72; RMS approximately .17. Absolute adjacent loop-boundary sample jump .0033 / .0087. Regenerate with `npm run audio:generate`.

Two reusable HTMLAudio elements; one playing at a time. Playback starts after Start gesture; pause stops both, resume selects current track, restart resets both timelines. Boss switches track and preserves musical position when decoded. BGM and SFX volume independent. Prior background sine-note scheduler removed. Escape/F1 still work when volume sliders have focus.

Audio validation confirms PCM headers/duration/non-silence/no clipping/bounded loop edge, Chromium decoding and lifecycle. This is synthesized medieval-style instrumentation, not a live acoustic recording. Subjective listening quality and non-Chromium audio behavior were not independently verified.

## Verification

63 unit/integration tests: 0/20/40ms valid vs41ms invalid chords, held/repeated keys, busy-state rejection, no queued special, mirrored/expired rising input, first-hit cost exactly once, whiff/low-HP guardrails, armor/death, front/rear guard, exact loot thresholds, seeded100k drop count, heal cap and removal of wave heal. Existing input-only four-wave playthrough still clears without HP/damage overrides.

Eight Chromium E2E cases cover keyboard actions, pause/restart, fallbacks, SD inspection, new command input and BGM lifecycle. First lifecycle run exposed Escape being ignored after a slider gained focus; controller corrected and suite rerun. PNG validation checks96 preserved SD poses (72 previous +24 new), plus historical assets. Typecheck, lint and production build checked with Node22 runtime.

Visual evidence: `docs/screenshots/twohand-guard.png`, `twohand-spin.png`, `twohand-game.png`. Existing `sd-review.html` now exposes two-handed motions and no kick option. No remote deployment was performed.
