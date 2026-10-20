// Read-only measurements of runtime atlases; no character pixels are modified.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
const targets = {
  idle: Array.from({ length: 12 }, (_, i) => i),
  reaction: [2, 3, 4, 5, 6, 7],
  attack: [6, 7, 8, 9, 10, 11],
};
const records = [];
const hashes = {};
for (const [sheet, frames] of Object.entries(targets)) {
  const path = `public/assets/sd-v3/smooth-${sheet}.png`;
  const bytes = fs.readFileSync(path);
  hashes[path] = crypto.createHash('sha256').update(bytes).digest('hex');
  const png = PNG.sync.read(bytes);
  for (const frame of frames) {
    const mask = new PNG({ width: 512, height: 512 });
    let left = 512,
      top = 512,
      right = 0,
      bottom = 0;
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 512; x++) {
        const i = ((Math.floor(frame / 4) * 512 + y) * png.width + (frame % 4) * 512 + x) * 4;
        const [r, g, b, a] = png.data.subarray(i, i + 4);
        if (a < 128) continue;
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
        if (r > 155 && g < 115 && b < 100 && r > g * 1.7) mask.data[(y * 512 + x) * 4 + 3] = 255;
      }
    // Visually checked medallion candidates. Air frame 9's upper red patch is a hair ribbon.
    const medal = components(mask)
      .parts.filter(
        (p) =>
          p.count > 220 &&
          (p.right - p.left) / (p.bottom - p.top) > 0.8 &&
          (p.right - p.left) / (p.bottom - p.top) < 1.4 &&
          !(sheet === 'attack' && frame === 9 && p.left < 250),
      )
      .sort((a, b) => a.top - b.top)[0];
    if (!medal) throw Error(`Medallion not found: ${sheet}/${frame}`);
    records.push({
      sheet: `smooth-${sheet}`,
      frame,
      bounds: [left, top, right, bottom],
      height: bottom - top + 1,
      medal: [medal.left, medal.top, medal.right - medal.left + 1, medal.bottom - medal.top + 1],
    });
  }
}
const reference = 'art/generated/sd-v10/style-reference.png';
const bytes = fs.readFileSync(reference);
hashes[reference] = crypto.createHash('sha256').update(bytes).digest('hex');
fs.mkdirSync('public/assets/size-review', { recursive: true });
fs.copyFileSync(reference, 'public/assets/size-review/reference.png');
fs.writeFileSync(
  'public/assets/size-review/audit.json',
  JSON.stringify(
    {
      runtimeScale: 0.5,
      alphaThreshold: 128,
      note: 'Medallion bounds are a raster/perspective-sensitive proxy, NOT a body-size measurement. All dimensions are atlas pixels.',
      hashes,
      idleCandidate: [0, 1, 2, 3, 4, 5, 6, 7, 6, 4, 2, 1],
      airCandidateScale: 0.94,
      records,
    },
    null,
    2,
  ) + '\n',
);
console.log('Measured 24 frames; runtime atlases unchanged. Reference copied byte-for-byte.');
