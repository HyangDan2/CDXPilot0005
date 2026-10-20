import fs from 'node:fs';
import { PNG } from 'pngjs';
const bow = [
  [
    [186, 193],
    [257, 202],
  ],
  [
    [502, 186],
    [556, 204],
  ],
  [
    [817, 188],
    [872, 205],
  ],
  [
    [1136, 189],
    [1200, 206],
  ],
  [
    [164, 443],
    [276, 447],
  ],
  [
    [482, 437],
    [584, 446],
  ],
  [
    [784, 438],
    [894, 447],
  ],
  [
    [1096, 431],
    [1240, 448],
  ],
  [
    [182, 771],
    [235, 785],
  ],
  [
    [527, 766],
    [575, 788],
  ],
  [
    [852, 824],
    [880, 817],
  ],
  [
    [1148, 846],
    [1200, 831],
  ],
  [
    [146, 968],
    [239, 1061],
  ],
  [
    [525, 969],
    [543, 993],
  ],
  [
    [798, 1054],
    [866, 1061],
  ],
  [
    [1143, 1056],
    [1200, 1064],
  ],
];
const walk = Array.from({ length: 8 }, (_, f) => [
  [214 + 444 * (f % 4), 246 + 444 * Math.floor(f / 4)],
  [307 + 444 * (f % 4), 258 + 444 * Math.floor(f / 4)],
]);
const patches = [];
const out = new PNG({ width: 1152, height: 864 });
for (const [sheet, poses] of Object.entries({ bow, 'bow-walk': walk })) {
  const p = PNG.sync.read(fs.readFileSync(`art/generated/sd-v12/${sheet}.png`));
  for (let f = 0; f < poses.length; f++)
    for (const [cx, cy] of poses[f]) {
      const index = patches.length;
      patches.push({ sheet, frame: f, x: cx - 18, y: cy - 18, size: 36 });
      for (let y = 0; y < 144; y++)
        for (let x = 0; x < 144; x++) {
          const si = ((cy - 18 + Math.floor(y / 4)) * p.width + cx - 18 + Math.floor(x / 4)) * 4;
          const di = ((Math.floor(index / 8) * 144 + y) * out.width + (index % 8) * 144 + x) * 4;
          p.data.copy(out.data, di, si, si + 4);
        }
    }
}
fs.writeFileSync('art/generated/hand-fix-v13/hand-crops.png', PNG.sync.write(out));
fs.writeFileSync(
  'art/generated/hand-fix-v13/patches.json',
  JSON.stringify(patches, null, 2) + '\n',
);
