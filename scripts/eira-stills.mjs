import fs from 'node:fs';
import { PNG } from 'pngjs';
function resize(input, output, width) {
  const p = PNG.sync.read(fs.readFileSync(input)),
    h = Math.round((p.height * width) / p.width),
    o = new PNG({ width, height: h });
  for (let y = 0; y < h; y++)
    for (let x = 0; x < width; x++) {
      const i =
        (Math.min(p.height - 1, Math.floor((y * p.height) / h)) * p.width +
          Math.floor((x * p.width) / width)) *
        4;
      p.data.copy(o.data, (y * width + x) * 4, i, i + 4);
    }
  fs.writeFileSync(output, PNG.sync.write(o));
  return [width, h];
}
const size = resize(
  'art/generated/oathblade-v2.png',
  'public/assets/weapons/oathblade-v2.png',
  512,
);
resize('art/generated/eira-portrait.png', 'public/assets/characters/eira-v2/portrait.png', 256);
fs.copyFileSync('art/generated/eira-master-v1.png', 'public/assets/characters/eira-v2/master.png');
fs.writeFileSync(
  'public/assets/weapons/oathblade-v2.json',
  JSON.stringify(
    { size, pivot: [90, size[1] / 2], tip: [491, size[1] / 2], displayScale: 0.21 },
    null,
    2,
  ) + '\n',
);
console.log('Packed immutable sword, HUD portrait and full-resolution master.');
