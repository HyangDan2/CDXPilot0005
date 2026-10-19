# Four-strike combo and branding (v0.6)

Built-in image generation was used, with v7 stop.png as identity/helmet reference. Sources are preserved in art/generated/sd-v8 and art/generated/branding. No paid API fallback was used.

Accepted source IDs:

- combo: 1c5d5805-cf22-49f6-96b3-12e319742c18 (first sheet rejected for clipped overhead blade)
- idle: 968c411a-b60a-400a-a796-ca44fdc0019a
- share: 7c254686-3b9f-4bbe-865f-170d533f60b4
- helmet: 8dbea681-0eb1-4dd5-bf21-5023c951563f

Prompt specifications: exact slender SD 1990s pixel Valkyrie identity; blue/gold armor, ivory skirt, silver braid, red ribbon; both white helmet feather wings visible; rigid straight two-handed sword with natural wrists. Combo: 6 columns × 4 rows, 24 isolated full-body poses, each row preparation/contact/recovery for overhead kneeling slash, grounded rising slash, thrust and full-turn finisher. Repair pass reconstructed the clipped blade and added padding. Idle: preserve 12 poses and low braid, restore missing far-side upright plume from stop reference. Share: castle backdrop, Eira on right, exact title VALKYRIE / THE ASHEN GATE on left, 1200×630 ratio. Favicon: compact blue/gold helmet with two white wings, transparent background, no text.

Only technical resizing/atlas packing follows generation. Small disconnected alpha components now use nearest actual silhouette pixels rather than overlapping bounding boxes. Public social JPEG is 1200×630; favicon PNGs are 16/32px, ICO includes both sizes, Apple icon is180px.

Combat: 23/26/31/41 damage; windups11/10/12/16 simulation frames, active6/7/6/10, recovery14/16/17/25. Six recovery frames must elapse before chaining; next move starts its full windup. One buffered command only, expires after existing200ms. Normal chain has no launch or armor. Last swing knocks away and cannot cancel. Any received damage clears queued input; unguarded damage cancels the current normal attack. No chain memory survives an expired attack. Enemy regular hit reaction is180ms, player remains300ms.

Limitations: generated keyposes retain minor ornament/scale variation; no claim of hand-drawn inbetweens. Hitboxes are authored swept envelopes rather than per-pixel blade masks. External social services may cache older previews.
