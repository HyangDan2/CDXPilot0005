import fs from 'node:fs';
import { PNG } from 'pngjs';

const src = PNG.sync.read(fs.readFileSync('art/generated/idle-wind-low-preview/source.png'));
const parts = Array.from({ length: 6 }, (_, i) => ({
  left: (i % 3) * 512,
  right: ((i % 3) + 1) * 512 - 1,
  top: Math.floor(i / 3) * 512,
  bottom: Math.floor(i / 3) * 512 + 510,
}));
if (parts.length !== 6) throw Error('Expected six isolated figures');
const roots = [262, 741, 1245, 262, 741, 1254];
const out = 'public/assets/idle-wind-low-preview';
fs.mkdirSync(out, { recursive: true });
const frames = [];
for (let f = 0; f < 6; f++) {
  const b = parts[f],
    p = new PNG({ width: 560, height: 560 }),
    ry = b.bottom;
  for (let y = 0; y < 560; y++)
    for (let x = 0; x < 560; x++) {
      const sx = x - 260 + roots[f],
        sy = y - 530 + ry;
      if (
        sx < b.left - 1 ||
        sx > b.right + 1 ||
        sy < b.top - 1 ||
        sy > b.bottom + 1 ||
        sx < 0 ||
        sy < 0 ||
        sx >= src.width ||
        sy >= src.height
      )
        continue;
      const si = (sy * src.width + sx) * 4,
        di = (y * 560 + x) * 4;
      src.data.copy(p.data, di, si, si + 4);
    }
  fs.writeFileSync(`${out}/frame-${f}.png`, PNG.sync.write(p));
  frames.push({ sourceBounds: b, anchor: [roots[f], ry] });
}
// Forward and backward wind phases soften the turn at the highest braid pose.
const sequence = [0, 1, 2, 3, 4, 5];
sequence.forEach((f, i) => fs.copyFileSync(`${out}/frame-${f}.png`, `${out}/loop-${i}.png`));
fs.writeFileSync(
  `${out}/manifest.json`,
  JSON.stringify({ size: 560, origin: [260, 530], fps: 4, sequence, frames }, null, 2),
);
console.log(JSON.stringify({ frames: parts.length, transparent: src.data[3] === 0, parts }));
