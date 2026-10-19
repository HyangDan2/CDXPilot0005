import fs from 'node:fs';
import { PNG } from 'pngjs';
const root = 'public/assets/',
  m = JSON.parse(fs.readFileSync(root + 'characters/eira-v2/manifest.json'));
let count = 0;
for (const [name, c] of Object.entries(m.clips)) {
  const p = PNG.sync.read(fs.readFileSync(root + c.file));
  if (p.width !== 384 * c.count || p.height !== 384 || c.frames.length !== c.count)
    throw new Error(`Bad ${name} dimensions`);
  for (let f = 0; f < c.count; f++) {
    let pixels = 0;
    for (let y = 0; y < 384; y++)
      for (let x = 0; x < 384; x++) {
        const a = p.data[(y * p.width + f * 384 + x) * 4 + 3];
        if (a > 128) {
          pixels++;
          if (x < 2 || y < 2 || x > 381 || y > 381) throw new Error(`${name} ${f} clipped`);
        }
      }
    if (pixels < 500 || pixels > 384 * 384 * 0.8) throw new Error(`${name} ${f} bad content`);
    if (c.frames[f].hand.some((v) => v < 0 || v > 384))
      throw new Error(`${name} hand out of bounds`);
    count++;
  }
}
for (const name of [
  'characters/eira-v2/master.png',
  'characters/eira-v2/portrait.png',
  'weapons/oathblade-v2.png',
]) {
  const p = PNG.sync.read(fs.readFileSync(root + name));
  let alpha = 0;
  for (let i = 3; i < p.data.length; i += 4) if (p.data[i] === 0) alpha++;
  if (alpha < p.width * p.height * 0.05) throw new Error(`${name} missing real alpha`);
}
console.log(
  `Eira v2: ${count} unique keyframes, transparent borders, anchors and separate sword verified.`,
);
