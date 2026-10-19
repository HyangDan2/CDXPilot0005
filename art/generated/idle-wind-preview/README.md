# Idle wind concept preview — 2026-10-19

Built-in image_gen reference: exec-6b14adb3-1020-4ac3-b180-c4fc724bcd22.png (approved compact pixel Valkyrie, helmet protrusion removed).
Generated source: exec-a727ac36-b797-49cb-b93b-ff5b634abd80.png, preserved as source.png.

Prompt brief: six idle wind phases, 3x2 transparent sheet; fixed stance, hands and straight sword; small breathing; braid, loose hair and ribbon follow a gentle cyclic breeze; preserve front three-quarter view, proportions, costume and 1990s pixel style.

Technical extraction: scripts/pack-idle-wind-preview.mjs retains RGBA pixels, aligns front foot/ground on fixed 560px canvases. No repainting or image warping. Ten displayed frames reuse six authored poses in a forward/back sequence at 5 fps. GIF assembled with ffmpeg palettegen/paletteuse, loops every 2 seconds.

Checked: six separate complete silhouettes, actual transparent alpha, full sword and boot bounds. This is a concept animation, not applied to gameplay. Generated frames retain slight costume/body differences; high braid pose has a more pronounced movement than adjacent poses and needs further in-between frames before final runtime use.
