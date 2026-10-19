// Register authored v12 fixes; preserve previous pose roots unless explicitly hip-registered.
import fs from 'node:fs';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
const previous = {
  ...JSON.parse(fs.readFileSync('art/generated/sd-v10/registration.json')),
  ...JSON.parse(fs.readFileSync('art/generated/sd-v11/registration.json')),
};
const result = {};
function read(path, count, cols) {
  const png = PNG.sync.read(fs.readFileSync(path));
  const parts = components(png)
    .parts.filter((p) => p.count > 2000)
    .sort((a, b) => a.bottom - b.bottom);
  if (parts.length !== count) throw Error(`${path}: ${parts.length} poses, expected ${count}`);
  const frames = [];
  for (let i = 0; i < count; i += cols)
    frames.push(...parts.slice(i, i + cols).sort((a, b) => a.left - b.left));
  return { png, frames };
}
for (const name of [
  'idle',
  'sword-walk',
  'move',
  'combo',
  'attack',
  'defense',
  'reaction',
  'stop',
  'roll',
  'bow',
  'bow-walk',
]) {
  const old = previous['smooth-' + name],
    path = `art/generated/sd-v12/${name}.png`;
  if (!fs.existsSync(path)) throw Error(`Missing ${path}`);
  const a = read(old.source, old.count, old.columns),
    b = read(path, old.count, old.columns);
  const ratios = a.frames
    .map((p, i) => (p.bottom - p.top) / (b.frames[i].bottom - b.frames[i].top))
    .sort((x, y) => x - y);
  const scale = old.scale * ratios[Math.floor(ratios.length / 2)];
  const roots = b.frames.map((p, i) => {
    if (p.left < 2 || p.top < 2 || p.right > b.png.width - 3 || p.bottom > b.png.height - 3)
      throw Error(`${name}/${i}: source clipped`);
    const prev = a.frames[i];
    return Math.round(
      p.left + ((old.roots[i] - prev.left) / (prev.right - prev.left)) * (p.right - p.left),
    );
  });
  if (name === 'bow-walk') roots.splice(0, 8, 225, 665, 1105, 1545, 225, 665, 1105, 1545);
  result['smooth-' + name] = { ...old, source: path, scale: Number(scale.toFixed(4)), roots };
  console.log(name, old.count, scale.toFixed(3));
}
fs.writeFileSync('art/generated/sd-v12/registration.json', JSON.stringify(result, null, 2) + '\n');
