// Transfer imagegen-authored RGB only through a restricted red-hand mask.
// Original alpha, all geometry and all pixels outside this mask remain byte-identical.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { PNG } from 'pngjs';
const base = 'art/generated/hand-fix-v13/';
const patches = JSON.parse(fs.readFileSync(base + 'patches.json'));
const donor = PNG.sync.read(fs.readFileSync(base + 'corrected-hand-crops.png'));
const registration = JSON.parse(fs.readFileSync('art/generated/sd-v12/registration.json'));
const overrides = {},
  report = [];
const red = (r, g, b, a) => a >= 128 && r > 130 && g < 115 && b < 105 && r > 1.65 * g;
const skin = (r, g, b, a) =>
  a >= 128 && r > 40 && g / r > 0.51 && g / r < 1.08 && b / g > 0.6 && b / g < 1.18;
for (const name of ['bow', 'bow-walk']) {
  const original = PNG.sync.read(fs.readFileSync(`art/generated/sd-v12/${name}.png`));
  const out = PNG.sync.read(fs.readFileSync(`art/generated/sd-v12/${name}.png`));
  const allowed = new Set();
  let changed = 0;
  for (let n = 0; n < patches.length; n++) {
    const p = patches[n];
    if (p.sheet !== name) continue;
    for (let y = 0; y < p.size; y++)
      for (let x = 0; x < p.size; x++) {
        const i = ((p.y + y) * out.width + p.x + x) * 4;
        if (!red(...original.data.subarray(i, i + 4))) continue;
        const dx = Math.floor((((n % 8) * 144 + x * 4 + 2) * donor.width) / 1152);
        const dy = Math.floor(((Math.floor(n / 8) * 144 + y * 4 + 2) * donor.height) / 864);
        const j = (dy * donor.width + dx) * 4;
        if (!skin(...donor.data.subarray(j, j + 4))) continue;
        donor.data.copy(out.data, i, j, j + 3);
        allowed.add(i);
        changed++;
      }
  }
  for (let i = 0; i < out.data.length; i += 4) {
    assert.equal(out.data[i + 3], original.data[i + 3]);
    if (!allowed.has(i))
      assert.deepEqual(out.data.subarray(i, i + 4), original.data.subarray(i, i + 4));
  }
  const source = base + name + '.png';
  fs.writeFileSync(source, PNG.sync.write(out));
  overrides['smooth-' + name] = { ...registration['smooth-' + name], source };
  report.push({ sheet: name, changed, alphaPreserved: true, outsideMaskUnchanged: true });
}
fs.writeFileSync(base + 'registration.json', JSON.stringify(overrides, null, 2) + '\n');
fs.writeFileSync(base + 'validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(report);
