// Technical registration only: align regenerated silhouettes to existing pose anchors.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
const source = fs.readFileSync('scripts/sd-atlas.mjs', 'utf8');
const literal = source
  .slice(source.indexOf('const specs = ') + 14, source.indexOf('\n// v10 overrides'))
  .trim()
  .replace(/;$/, '');
const specs = Function('return (' + literal + ')')();
const names = ['idle', 'move', 'combo', 'attack', 'defense', 'reaction', 'stop', 'bow', 'roll'];
const overrides = {};
const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
function silhouettes(path, count, cols, minBottom = 0) {
  const png = PNG.sync.read(fs.readFileSync(path));
  const major = components(png)
    .parts.filter((p) => p.count > 2000 && p.bottom >= minBottom)
    .sort((a, b) => a.bottom - b.bottom);
  if (major.length !== count) throw Error(`${path}: ${major.length} poses, expected ${count}`);
  const sorted = [];
  for (let i = 0; i < count; i += cols)
    sorted.push(...major.slice(i, i + cols).sort((a, b) => a.left - b.left));
  return { png, sorted };
}
for (const name of names) {
  const key = 'smooth-' + name,
    old = specs[key],
    path = `art/generated/sd-v10/${name}.png`;
  const a = silhouettes(old.source, old.count, old.columns);
  const start = name === 'attack' ? 12 : 0;
  if (start) {
    a.sorted = a.sorted.slice(start);
    old.roots = old.roots.slice(start);
    old.count = 12;
    old.columns = 3;
  }
  const b = silhouettes(path, old.count, old.columns, 0);
  const scale =
    old.scale *
    (name === 'attack' ? 1.22 : 1) *
    median(a.sorted.map((p, i) => (p.bottom - p.top) / (b.sorted[i].bottom - b.sorted[i].top)));
  const roots = b.sorted.map((p, i) => {
    const prev = a.sorted[i],
      u = (old.roots[i] - prev.left) / (prev.right - prev.left);
    return Math.round(p.left + u * (p.right - p.left));
  });
  const clipped = b.sorted
    .map((p, i) =>
      p.left < 2 || p.top < 2 || p.right > b.png.width - 3 || p.bottom > b.png.height - 3
        ? i
        : null,
    )
    .filter((x) => x !== null);
  if (clipped.length) throw Error(`${name}: clipped source frames ${clipped.join(',')}`);
  console.log(name, 'scale', scale.toFixed(3), 'edge frames', clipped);
  overrides[key] = { ...old, scale: Number(scale.toFixed(4)), roots, source: path };
}
fs.writeFileSync(
  'art/generated/sd-v10/registration.json',
  JSON.stringify(overrides, null, 2) + '\n',
);
