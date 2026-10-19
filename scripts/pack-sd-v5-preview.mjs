import fs from 'node:fs';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
const dir = 'public/assets/sd-v5-preview';
fs.mkdirSync(dir, { recursive: true });
const source = PNG.sync.read(fs.readFileSync('art/generated/sd-v5/walk-hair-source.png'));
const parts = components(source)
  .parts.filter((p) => p.count > 2000)
  .sort((a, b) => Math.floor(a.top / 500) - Math.floor(b.top / 500) || a.left - b.left);
if (parts.length !== 8) throw Error('Expected eight silhouettes');
const roots = [280, 640, 1000, 1380, 275, 635, 1000, 1380];
const metadata = { size: 512, origin: [320, 440], fps: 10, frames: [] };
const board = new PNG({ width: 800, height: 400 });
for (let f = 0; f < 8; f++) {
  const b = parts[f],
    p = new PNG({ width: 512, height: 512 });
  const ground = f < 4 ? 482 : 976;
  for (let y = 0; y < 512; y++)
    for (let x = 0; x < 512; x++) {
      const sx = Math.round(roots[f] + (x - 320) / 0.8),
        sy = Math.round(ground + (y - 440) / 0.8);
      if (sx < b.left - 2 || sx > b.right + 2 || sy < b.top - 2 || sy > b.bottom + 2) continue;
      const si = (sy * source.width + sx) * 4,
        di = (y * 512 + x) * 4;
      source.data.copy(p.data, di, si, si + 4);
    }
  fs.writeFileSync(`${dir}/walk-${f}.png`, PNG.sync.write(p));
  metadata.frames.push({ frame: f, sourceBounds: b, sourceRoot: [roots[f], ground], scale: 0.8 });
  // Technical enlarged inspection crop; preserves pixels, no repainting.
  for (let y = 0; y < 200; y++)
    for (let x = 0; x < 200; x++) {
      const sx = roots[f] - 42 + Math.floor(x / 2),
        sy = (f < 4 ? 270 : 764) + Math.floor(y / 2);
      const si = (sy * source.width + sx) * 4,
        di = ((Math.floor(f / 4) * 200 + y) * 800 + (f % 4) * 200 + x) * 4;
      source.data.copy(board.data, di, si, si + 4);
    }
}
fs.writeFileSync(`${dir}/hands-contact.png`, PNG.sync.write(board));
fs.copyFileSync('art/generated/sd-v5/idle-elbow-hair.png', `${dir}/idle.png`);
fs.copyFileSync('art/generated/sd-v5/action-expressions.png', `${dir}/expressions.png`);
fs.writeFileSync(`${dir}/manifest.json`, JSON.stringify(metadata, null, 2));
console.log(
  'Packed 8 transparent 512px frames, fixed scale and ground anchors, hand inspection board.',
);
