# Eira size review — 2026-10-20

Scope: requested precision inspection and minimal preview, before changing production artwork. Open `/actor-size-review.html` with Vite. No simulation, runtime selector, production PNG, source image or registration is changed.

## Reproduce

Use Node >=22.13. Run `node scripts/audit-actor-size.mjs`, then `npm run dev`. The audit reads 24 runtime atlas frames and writes `public/assets/size-review/audit.json`. It copies the approved `art/generated/sd-v10/style-reference.png` byte-for-byte into the review directory for static hosting. Original provenance remains in STYLE_V10.md. No image generation, painting, deformation, or atlas repacking occurs.

The JSON records source SHA-256 values, bounds at alpha >=128, and red helmet-medallion bounding boxes. The red mask is R>155, G<115, B<100 and R>1.7G. Connected components are filtered by area/aspect, with an explicit spatial exclusion for the hair ribbon in air frame 9. Medallions were visually checked. This is a reproducible proxy, not anatomical measurement; raster rounding, perspective, and authored ornament changes affect it.

## Findings

- `ActorView.update` uses the manifest's constant 0.5 scale. `ArenaView` calls it without an extra scale. Jump elevation changes position, not size.
- Sword idle 0–3: heights 309,309,310,309 atlas pixels; 4–7: 304,305,305,305; 8–11: 292 each. The final group lasts one second of the three-second loop. Height falls 5.5% relative to frame 0 (8.5 gameplay pixels), then snaps back at the loop boundary.
- Idle red medallions stay 23–25 pixels wide and 20–21 high. Head-aligned comparison shows similar head size while the body posture lowers. Whole-character enlargement would also enlarge the unchanged head and sword, so it is not the first correction.
- Air attack 6–11: medallions 23×25,23×24,25×23,25×24,25×22,24×21. Jump/fall/landing 2–7: 21×21,22×21,23×22,22×21,23×21,22×22. Air artwork tends to be larger in this proxy. The enlarged visual comparison also shows a larger-looking head in initial air poses, but foreshortening and costume articulation prevent a single exact anatomical scale claim.
- Current packing aligns every pose to the lowest opaque silhouette pixel. For airborne poses this can be a sword tip rather than a foot. This can add apparent vertical discontinuity; the preview's fixed registration line is not an anatomical ground claim.

## Preview candidates and limits

1. Idle: use existing frames `[0,1,2,3,4,5,6,7,6,4,2,1]` at the same 4 fps / 3-second cycle. No pixel/scale changes. Height range narrows to 304–310 pixels. Tradeoff: shallower breathing and altered motion cadence. Original low poses remain intact.
2. Air: a **provisional 94% uniform scale** only during attack frames, adjustable 90–100% for comparison. This is a visual trial, not an automatically measured optimum or an approved runtime fix. It also reduces sword length and changes nearest-neighbor sampling. Leave runtime unchanged until continuity and identity can be judged together.

The preview removes vertical jump travel deliberately to isolate size. Air playback uses 4 startup / 11 active / 12 recovery frames at 60 Hz, matching current attack data and frame selection. Idle/jump/landing holds are illustrative, not a simulation replay. A faint idle baseline and fixed-size head/torso crops support comparison. The reference thumbnail is for identity, not absolute size calibration.

If uniform scale cannot match head, torso and weapon simultaneously, do not force it with per-part stretching. Keep the existing frame and revisit the authored pose separately. Future accepted gameplay edits require verify + E2E and runtime visual inspection.

## Validation

- `npm run verify`: passed (asset checks, ESLint, TypeScript, 17 Vitest files / 92 tests, production build).
- `npm run test:e2e`: passed (20 tests).
- Additional browser inspection: all 24 measurement rows loaded, before/after frame labels and provisional scale checked, no page errors, no horizontal overflow at 390px, screenshots captured for all six air poses and left-facing gameplay-size view. Head/torso crops and full comparison screenshots visually inspected.
- SHA-256 recheck confirmed the three measured runtime sheets and authoritative reference were unchanged; reference copy is byte-identical.
- Local screenshots: `artifacts/size-review/`. No deployment performed. The static review page ships with the normal build if later deployed; local access requires the Vite server.
