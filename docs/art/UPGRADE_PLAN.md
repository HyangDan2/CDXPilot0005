# Eira art and combat upgrade — 2026-10-18

Authorized scope: reference-based detailed Eira, animation assets, independent sword, portrait, double-tap running, active/flanking AI, bounded aerial combos, tests and documentation.

1. Preserve supplied reference and generate a high-detail body-only master. Inspect detail and actual alpha.
2. Generate locomotion, combat and reaction sequences separately against the same master; retain original-resolution sheets. No cumulative edits through successive compressed outputs.
3. Extract/align reviewed cells into a versioned high-resolution atlas with per-frame hand anchors. Preserve old fallback assets. Runtime uses fixed-canvas sprites; title can use full-resolution art.
4. Implement 250 ms directional double tap, release/interruption cancellation, no Shift running.
5. Add timed flank/approach/retreat patterns and committed attack tells, plus deterministic crowd spacing.
6. Cap per-target air hits/relaunches, force knockdown, protect landing/recovery, boss launch resistance. No reset on brief floor contact.
7. Run model regressions, input-only playthrough, E2E, missing-image fallback and visual inspection. Record accepted keyframe counts and limitations honestly.
