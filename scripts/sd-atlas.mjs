import fs from 'node:fs';
import { PNG } from 'pngjs';
import { components } from './sprite-components.mjs';
// Source-space pelvis/ground anchors reviewed against original sheets. One scale per sheet.
const specs = {
  'smooth-combo': {
    count: 24,
    columns: 6,
    scale: 1.3,
    roots: [
      150, 400, 650, 900, 1150, 1400, 150, 400, 650, 900, 1150, 1400, 145, 400, 640, 900, 1150,
      1400, 150, 400, 650, 900, 1150, 1400,
    ],
    source: 'art/generated/sd-v8/combo.png',
  },
  'smooth-idle': {
    count: 12,
    columns: 4,
    scale: 0.92,
    roots: [230, 610, 990, 1370, 240, 620, 1000, 1380, 230, 610, 990, 1370],
    source: 'art/generated/sd-v8/idle.png',
  },
  'smooth-move': {
    count: 16,
    columns: 4,
    scale: 0.96,
    roots: [190, 490, 790, 1100, 195, 510, 815, 1145, 230, 525, 825, 1150, 230, 520, 820, 1150],
    source: 'art/generated/sd-v7/move.png',
  },
  'smooth-attack': {
    count: 24,
    columns: 6,
    scale: 1.32,
    roots: [
      170, 400, 650, 900, 1160, 1420, 160, 395, 650, 900, 1160, 1420, 150, 400, 650, 900, 1170,
      1420, 150, 370, 650, 890, 1140, 1400,
    ],
    source: 'art/generated/sd-v7/attack.png',
  },
  'smooth-defense': {
    count: 16,
    columns: 4,
    scale: 1.3,
    roots: [185, 555, 920, 1290, 190, 555, 930, 1290, 190, 560, 920, 1290, 170, 550, 930, 1290],
    source: 'art/generated/sd-v7/defense.png',
  },
  'smooth-reaction': {
    count: 16,
    columns: 4,
    scale: 1.22,
    roots: [230, 560, 990, 1370, 230, 550, 980, 1370, 180, 560, 950, 1330, 220, 590, 1000, 1370],
    source: 'art/generated/sd-v7/reaction.png',
  },
  'smooth-stop': {
    count: 6,
    columns: 3,
    scale: 0.6,
    roots: [355, 845, 1305, 340, 830, 1320],
    source: 'art/generated/sd-v7/stop.png',
  },
  'smooth-grunt': {
    count: 16,
    columns: 4,
    scale: 0.95,
    roots: [195, 570, 970, 1360, 220, 610, 970, 1370, 220, 610, 990, 1370, 220, 590, 995, 1380],
    source: 'art/generated/sd-v7/grunt.png',
  },
  'smooth-rusher': {
    count: 16,
    columns: 4,
    scale: 0.93,
    roots: [170, 570, 980, 1360, 180, 570, 980, 1370, 190, 565, 950, 1350, 190, 560, 950, 1350],
    source: 'art/generated/sd-v7/rusher.png',
  },
  'smooth-guard': {
    count: 16,
    columns: 4,
    scale: 0.95,
    roots: [175, 565, 970, 1350, 200, 590, 990, 1370, 180, 560, 950, 1350, 180, 570, 950, 1350],
    source: 'art/generated/sd-v7/guard.png',
  },
  'smooth-boss': {
    count: 24,
    columns: 6,
    scale: 1.65,
    roots: [
      125, 375, 625, 880, 1125, 1390, 125, 375, 600, 850, 1110, 1390, 130, 370, 620, 880, 1125,
      1390, 170, 425, 655, 900, 1135, 1390,
    ],
    source: 'art/generated/sd-v7/boss.png',
  },
  'retro-idle': { count: 6, columns: 3, scale: 0.6, roots: [350, 830, 1330, 350, 840, 1340] },
  'retro-move': {
    count: 8,
    columns: 4,
    scale: 0.62,
    roots: [270, 640, 990, 1360, 330, 665, 1040, 1390],
  },
  'retro-attack': {
    count: 12,
    columns: 3,
    scale: 1.02,
    roots: [175, 490, 810, 185, 495, 860, 190, 510, 840, 150, 490, 810],
  },
  'retro-action': {
    count: 16,
    columns: 4,
    scale: 1.0,
    roots: [175, 480, 795, 1100, 160, 475, 795, 1100, 175, 460, 790, 1105, 150, 465, 800, 1105],
  },
  twohand: {
    count: 12,
    columns: 3,
    scale: 0.9,
    roots: [185, 560, 900, 190, 560, 910, 180, 530, 850, 200, 550, 920],
  },
  defense: {
    count: 12,
    columns: 3,
    scale: 0.8,
    roots: [180, 550, 915, 230, 555, 950, 220, 550, 910, 195, 555, 900],
  },
  player: {
    count: 16,
    columns: 4,
    scale: 0.8,
    roots: [180, 480, 780, 1080, 190, 470, 750, 1090, 170, 470, 770, 1080, 170, 480, 770, 1080],
  },
  run: { count: 8, columns: 4, scale: 0.6, roots: [240, 680, 1110, 1540, 250, 680, 1120, 1550] },
  'combat-spaced': {
    count: 12,
    columns: 3,
    scale: 1.1,
    roots: [185, 560, 885, 175, 560, 920, 180, 560, 925, 195, 560, 950],
  },
  grunt: { count: 8, columns: 4, scale: 0.64, roots: [215, 650, 1090, 1520, 205, 600, 1110, 1540] },
  rusher: {
    count: 8,
    columns: 4,
    scale: 0.64,
    roots: [220, 660, 1100, 1530, 205, 600, 1110, 1540],
  },
  guard: { count: 8, columns: 4, scale: 0.66, roots: [215, 650, 1100, 1530, 215, 610, 1120, 1540] },
  boss: {
    count: 12,
    columns: 4,
    scale: 0.92,
    roots: [200, 570, 950, 1330, 180, 520, 990, 1320, 190, 540, 950, 1330],
  },
};
const size = 512,
  origin = [192 / size, 420 / size];
const manifest = { version: 3, size, origin, scale: 0.5, sheets: {} };
fs.mkdirSync('public/assets/sd-v3', { recursive: true });
for (const [name, spec] of Object.entries(specs)) {
  const source = PNG.sync.read(fs.readFileSync(spec.source ?? `art/generated/sd-v3/${name}.png`));
  const { parts, labels } = components(source);
  const large = parts.filter((p) => p.count > 2000).sort((a, b) => a.bottom - b.bottom);
  if (large.length !== spec.count)
    throw Error(`${name}: ${large.length} silhouettes, expected ${spec.count}`);
  const sorted = [];
  for (let i = 0; i < large.length; i += spec.columns)
    sorted.push(...large.slice(i, i + spec.columns).sort((a, b) => a.left - b.left));
  const owner = new Int16Array(parts.length + 1).fill(-1);
  const majorIndex = new Map(sorted.map((b, i) => [b.id, i]));
  for (const p of parts) {
    if (majorIndex.has(p.id)) {
      owner[p.id] = majorIndex.get(p.id);
      continue;
    }
    let best = Infinity,
      index = -1;
    // Compare actual neighboring silhouette pixels, not overlapping bounding boxes.
    for (let y = p.top; y <= p.bottom; y++)
      for (let x = p.left; x <= p.right; x++) {
        if (labels[y * source.width + x] !== p.id) continue;
        for (let dy = -10; dy <= 10; dy++)
          for (let dx = -10; dx <= 10; dx++) {
            const d = dx * dx + dy * dy;
            if (d >= best || d >= 100) continue;
            const xx = x + dx,
              yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= source.width || yy >= source.height) continue;
            const i = majorIndex.get(labels[yy * source.width + xx]);
            if (i !== undefined) {
              best = d;
              index = i;
            }
          }
      }
    owner[p.id] = index;
  }
  const sheet = new PNG({ width: size * 4, height: size * Math.ceil(spec.count / 4) }),
    frames = [];
  for (let f = 0; f < spec.count; f++) {
    const frameOrigin = name.startsWith('smooth-') ? 256 : 192;
    const b = sorted[f],
      rx = spec.roots[f],
      ry = b.bottom;
    const bounds = [
      frameOrigin + (b.left - rx) * spec.scale,
      420 + (b.top - ry) * spec.scale,
      frameOrigin + (b.right - rx) * spec.scale,
      420,
    ];
    if (bounds[0] < 4 || bounds[1] < 4 || bounds[2] > size - 4)
      throw Error(`${name}/${f} clipped ${bounds}`);
    for (let y = Math.max(0, Math.floor(bounds[1]) - 3); y < Math.min(size, 424); y++)
      for (
        let x = Math.max(0, Math.floor(bounds[0]) - 3);
        x < Math.min(size, Math.ceil(bounds[2]) + 4);
        x++
      ) {
        const sx = Math.round(rx + (x - frameOrigin) / spec.scale),
          sy = Math.round(ry + (y - 420) / spec.scale);
        if (sx < 0 || sy < 0 || sx >= source.width || sy >= source.height) continue;
        const si = sy * source.width + sx;
        let o = owner[labels[si]];
        if (!labels[si] && source.data[si * 4 + 3] > 0) {
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              const xx = sx + dx,
                yy = sy + dy;
              if (
                xx >= 0 &&
                yy >= 0 &&
                xx < source.width &&
                yy < source.height &&
                owner[labels[yy * source.width + xx]] === f
              )
                o = f;
            }
        }
        if (o !== f) continue;
        const di = ((Math.floor(f / 4) * size + y) * sheet.width + (f % 4) * size + x) * 4;
        source.data.copy(sheet.data, di, si * 4, si * 4 + 4);
      }
    frames.push({ bounds, sourceBounds: [b.left, b.top, b.right, b.bottom], root: [rx, ry] });
  }
  fs.writeFileSync(`public/assets/sd-v3/${name}.png`, PNG.sync.write(sheet));
  manifest.sheets[name] = {
    count: spec.count,
    frames,
    origin: [(name.startsWith('smooth-') ? 256 : 192) / size, 420 / size],
  };
}
fs.writeFileSync('public/assets/sd-v3/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('Packed SD poses including expanded combo and restored idle frames; original RGBA preserved.');

// HUD crop from the same authored SD idle pose, no synthesized repainting.
const original = PNG.sync.read(fs.readFileSync('art/generated/sd-v3/retro-idle.png'));
const portrait = new PNG({ width: 140, height: 160 });
PNG.bitblt(original, portrait, 255, 30, 140, 160, 0, 0);
fs.writeFileSync('public/assets/sd-v3/portrait.png', PNG.sync.write(portrait));
