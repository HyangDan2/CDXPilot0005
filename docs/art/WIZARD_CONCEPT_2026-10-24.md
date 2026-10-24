# Wizard concept proposal — 2026-10-24

## Direction

Give the monastery mage an unmistakable spellcaster silhouette: a half-masked ash-seer in layered midnight-teal and charcoal robes, pale stone trim, muted copper clasps, and a short crystal staff. Blue-violet crystal color ties the character to the existing magic projectile. Avoid bows, quivers, and arrows so the role reads separately from the current archer placeholder.

## Concept image

- Proposal: `art/generated/sd-v3/wizard-concept-2026-10-24.png`
- Provenance: generated with the built-in image generation tool on 2026-10-24.
- Reference role: `public/assets/sd-v3/smooth-archer.png` was used only for SD v3 pixel scale, outline weight, and small-sprite readability.
- Prompt: a transparent 4×4 sheet with sixteen right-facing poses for idle, approach, retreat, spell gathering/release/recovery, hit recoil, stagger, and defeat. The staff is integrated into the poses. Bows, quivers, arrows, environment, text, and extra characters were excluded.
- The generated source is preserved unchanged at 1254×1254 with transparent alpha.

## Runtime application — 2026-10-25

The selected concept is registered as its own `smooth-mage` sheet. The atlas pipeline extracts sixteen connected poses into fixed 512×512 transparent frames, aligns each pose to the ground anchor, and assigns the separated idle, approach, retreat, cast, hit, kneel and defeat poses from the existing mage animation state. Runtime loading and selection are independent from `smooth-archer`; mage gameplay, attack timing and spell effects are unchanged.

The generated source itself remains the preserved 1254×1254 proposal. Inspect the packed atlas at gameplay scale before further animation polishing; the two-frame locomotion loops and recovery reuse are intentionally simple.
