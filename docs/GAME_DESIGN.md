## v0.4 current rules

See [TWOHAND_V4.md](art/TWOHAND_V4.md) for authoritative input, spin-cost, loot and music specifications.

# Game design — v0.1.0

## Premise and visual direction

Eira, the last oathkeeper, enters Halvard's ruined cloister. Silver braid, winged helm, blue/gold armor and pale battle dress are an original Valkyrie silhouette. Blue-green stone, moss, restrained gold UI and warm hit sparks support a quiet ruined-realm atmosphere. The Hollow King seals the final gate.

## Core loop

Approach an encounter → align ground depth → attack/cancel/evade → clear all enemies → collect rare dropped potions → travel right. Three regular waves lead to one boss and Stage Clear. The game is endless-retry single-player; no save, inventory or equipment menu.

The player has 180 HP, moves at 185 units/s (314.5 after a directional double-tap within 250 ms), jumps with 440 units/s initial vertical velocity and 980 units/s² gravity. Ground depth movement is 65% horizontal speed. 960×540 logical view spans a 3600-unit world. Screens resize without changing simulation coordinates.

## Combat

| Attack    | Damage | Startup / active / recovery (60 Hz frames) | Role                             |
| --------- | -----: | ------------------------------------------ | -------------------------------- |
| Slash 1   |     23 | 6 / 7 / 15                                 | Opener                           |
| Slash 2   |     29 | 7 / 8 / 16                                 | J follow-up                      |
| Spin      |     40 | 6 / 24 / 24                                | Armor, first-hit max-HP20% cost  |
| Rising    |     34 | 9 / 10 / 22                                | Guard break, 420 launch velocity |
| Air slash |     27 | 4 / 11 / 12                                | Aerial follow-up                 |

AttackBuffer retains inputs for 200 ms. Cancel is legal only during recovery and along the data-defined graph; J→J→down-forward-J is supported. Each target takes at most one hit per attack instance. Hits add score based on damage ×10 ×combo; kills add 200. Guard absorbs 80% of frontal ordinary damage, with minimum 1. K is sword guard. Rising breaks guard. J+K is a fresh 40ms chord, grounded/free states only; spin is never buffered.

## Enemies and stage

Grunt (62 HP) approaches and attacks; Rusher (48) winds up and charges; Guard (90) raises shield then counters. Ordinary melee is 10 damage; charge 16. All attacks telegraph before becoming active. Two simultaneous attack initiations limit crowd pressure.

Encounters: Outer Watch (3), Broken Oaths (4), Ash & Iron (5), Gatekeeper (1). The king has 640 HP and cycles three melee strikes, charge and aerial slam (24 damage). Below half HP he moves faster, charges faster and adds extra charge/slam cycles. Aerial slam damages a wider footprint; leave the marked ground area.

## Tuning and future work

Current difficulty is an MVP baseline validated by a deterministic input-only bot, not by a broad human playtest. Next priorities: hand-authored per-action body poses, additional silhouettes, richer sound, human combo/difficulty tuning, gamepad/touch input, then further stages. Do not introduce a backend merely to extend content.

## v0.2 combat revision

Run activates on two released physical presses of the same semantic direction within 250 ms; key repeat/held aliases do not trigger it. Hold second press to continue. Release, opposite direction, attack, guard, jump, hit, blur and pause cancel the run latch. Shift is no longer a run binding.

Enemy chase speeds: Grunt 132 with a 215 opening burst, Rusher 175, Guard 112, Boss 145 (×1.3 enraged). Flank and Retreat are explicit timed AI states, allies softly separate, and at most two attacks/guard counters are committed at once. Once a tell starts, facing and depth do not track the player. Rusher recovery remains punishable.

Each target has a juggle budget. First launch is full strength, second ×0.35, third forces downward velocity. Three additional air hits also force down. The budget survives contact with the floor and resets only after 0.3 s grounded down + 0.35 s recovery. A further 0.5 s wake invulnerability prevents immediate recycling. Boss hit reaction is 0.13 s and never launches. Rising still has its un-cancellable 22-frame recovery and no new mana/cooldown UI.
