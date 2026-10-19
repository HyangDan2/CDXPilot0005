import fs from 'node:fs';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
import { specs } from './eira-spec.mjs';
const out = 'public/assets/characters/eira-v2';
fs.mkdirSync(out, { recursive: true });
const size = 384,
  origin = [0.5, 350 / 384],
  displayScale = 0.48;
const manifest = { version: 2, frameSize: [size, size], origin, displayScale, clips: {} };
for (const [name, spec] of Object.entries(specs)) {
  const source = PNG.sync.read(fs.readFileSync(`art/generated/eira-${name}.png`));
  const { parts, labels } = components(source);
  const big = parts.filter((p) => p.count > 5000).sort((a, b) => a.bottom - b.bottom);
  if (big.length !== spec.count)
    throw new Error(`${name}: expected ${spec.count} silhouettes, got ${big.length}`);
  const sorted = [];
  for (let row = 0; row < big.length; row += spec.columns)
    sorted.push(...big.slice(row, row + spec.columns).sort((a, b) => a.left - b.left));
  const owners = new Int16Array(parts.length + 1);
  owners.fill(-1);
  for (const p of parts) {
    let owner = sorted.findIndex((b) => b.id === p.id);
    if (owner < 0) {
      const cx = (p.left + p.right) / 2,
        cy = (p.top + p.bottom) / 2;
      let best = Infinity;
      sorted.forEach((b, i) => {
        const dx = Math.max(b.left - cx, 0, cx - b.right),
          dy = Math.max(b.top - cy, 0, cy - b.bottom),
          d = dx * dx + dy * dy;
        if (d < best) {
          best = d;
          owner = i;
        }
      });
      if (best > 400) continue;
    }
    owners[p.id] = owner;
  }
  const sheet = new PNG({ width: size * spec.count, height: size });
  const frames = [];
  for (let f = 0; f < spec.count; f++) {
    const box = sorted[f],
      rootX = spec.rootX[f],
      rootY = spec.rootY[f];
    const left = 192 + (box.left - rootX) * spec.scale,
      right = 192 + (box.right - rootX) * spec.scale,
      top = 350 + (box.top - rootY) * spec.scale,
      bottom = 350 + (box.bottom - rootY) * spec.scale;
    if (left < 3 || right >= size - 3 || top < 3 || bottom >= size - 3)
      throw new Error(`${name} frame ${f} clipped after alignment: ${[left, top, right, bottom]}`);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const sx = Math.round(rootX + (x - 192) / spec.scale),
          sy = Math.round(rootY + (y - 350) / spec.scale);
        if (sx < 0 || sy < 0 || sx >= source.width || sy >= source.height) continue;
        const si = sy * source.width + sx;
        let owner = owners[labels[si]];
        // Retain translucent edge pixels near this silhouette, without copying neighboring actors.
        if (!labels[si] && source.data[si * 4 + 3] > 0) {
          let best = 100;
          for (let yy = -3; yy <= 3; yy++)
            for (let xx = -3; xx <= 3; xx++) {
              const nx = sx + xx,
                ny = sy + yy;
              if (nx < 0 || ny < 0 || nx >= source.width || ny >= source.height) continue;
              const label = labels[ny * source.width + nx],
                d = xx * xx + yy * yy;
              if (label && d < best) {
                best = d;
                owner = owners[label];
              }
            }
        }
        if (owner !== f) continue;
        const di = (y * sheet.width + f * size + x) * 4;
        source.data.copy(sheet.data, di, si * 4, si * 4 + 4);
      }
    frames.push({
      hand: [
        192 + (spec.hands[f][0] - rootX) * spec.scale,
        350 + (spec.hands[f][1] - rootY) * spec.scale,
      ],
      sourceBounds: [box.left, box.top, box.right, box.bottom],
    });
  }
  fs.writeFileSync(`${out}/${name}.png`, PNG.sync.write(sheet));
  manifest.clips[name] = { file: `characters/eira-v2/${name}.png`, count: spec.count, frames };
}
fs.writeFileSync(`${out}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
console.log(
  `Packed ${Object.keys(specs).length} reviewed animation sheets, ${Object.values(specs).reduce((s, v) => s + v.count, 0)} unique keyframes; retained original source sheets.`,
);
