import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
const root = 'public/assets/sd-v3/',
  m = JSON.parse(fs.readFileSync(root + 'manifest.json'));
let count = 0;
for (const [name, entry] of Object.entries(m.sheets)) {
  const p = PNG.sync.read(fs.readFileSync(root + name + '.png'));
  assert.equal(p.width, m.size * 4);
  assert.equal(p.height, m.size * Math.ceil(entry.count / 4));
  for (let f = 0; f < entry.count; f++) {
    let opaque = 0;
    for (let y = 0; y < m.size; y++)
      for (let x = 0; x < m.size; x++) {
        const alpha =
          p.data[((Math.floor(f / 4) * m.size + y) * p.width + (f % 4) * m.size + x) * 4 + 3];
        if (alpha) {
          opaque++;
          assert.ok(
            x > 1 && x < m.size - 2 && y > 1 && y < m.size - 2,
            `${name}/${f}: clipped edge`,
          );
        }
      }
    assert.ok(opaque > 1000, `${name}/${f}: empty silhouette`);
    count++;
  }
}
console.log(
  `SD validation: ${count} transparent, unclipped, anchored frames across ${Object.keys(m.sheets).length} sheets.`,
);
