// Registration/cropping only; authored pixels are never repainted.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
const old = JSON.parse(fs.readFileSync('art/generated/sd-v10/registration.json'));
const result = {};
for (const [name, count, columns, reference] of [
  ['idle', 12, 4, 'idle'],
  ['bow', 16, 4, 'bow'],
  ['bow-walk', 8, 4, 'bow'],
  ['sword-walk', 8, 4, 'idle'],
]) {
  const source = `art/generated/sd-v11/${name}.png`;
  const png = PNG.sync.read(fs.readFileSync(source));
  const { parts, labels } = components(png);
  const major = parts.filter((p) => p.count > 2000).sort((a, b) => a.bottom - b.bottom);
  if (major.length !== count) throw Error(`${name}: expected ${count}, got ${major.length}`);
  const sorted = [];
  for (let i = 0; i < count; i += columns)
    sorted.push(...major.slice(i, i + columns).sort((a, b) => a.left - b.left));
  const ref = old['smooth-' + reference];
  const prev = PNG.sync.read(fs.readFileSync(ref.source));
  const heights = components(prev)
    .parts.filter((p) => p.count > 2000)
    .map((p) => p.bottom - p.top)
    .sort((a, b) => a - b);
  const newHeights = sorted.map((p) => p.bottom - p.top).sort((a, b) => a - b);
  const scale =
    (ref.scale * heights[Math.floor(heights.length / 2)]) /
    newHeights[Math.floor(newHeights.length / 2)];
  const roots = sorted.map((p) => {
    if (p.left < 2 || p.top < 2 || p.right > png.width - 3 || p.bottom > png.height - 3)
      throw Error(`${name}: clipped source`);
    // Center ground contact rather than braid/weapon bounding box.
    let left = Infinity,
      right = -Infinity;
    for (let y = Math.floor(p.bottom - (p.bottom - p.top) * 0.12); y <= p.bottom; y++)
      for (let x = p.left; x <= p.right; x++)
        if (labels[y * png.width + x] === p.id) {
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
    return Math.round((left + right) / 2);
  });
  result['smooth-' + name] = { count, columns, scale: Number(scale.toFixed(4)), roots, source };
  console.log(name, count, scale.toFixed(4));
}
fs.writeFileSync('art/generated/sd-v11/registration.json', JSON.stringify(result, null, 2) + '\n');
