import { PNG } from 'pngjs';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const root = 'public/assets';
const counts = {
  Idle: 4,
  Walk: 6,
  Run: 6,
  Jump: 4,
  Fall: 4,
  Land: 4,
  Attack: 4,
  Kick: 4,
  RisingSlash: 5,
  Hit: 3,
  Knockdown: 4,
  Recovery: 4,
  Guard: 4,
  Death: 4,
};
const color = (c) => {
  const v = parseInt(c.replace('#', ''), 16);
  return [v >> 16, (v >> 8) & 255, v & 255, 255];
};
const canvas = (w, h) => new PNG({ width: w, height: h });
function rect(p, x, y, w, h, c) {
  const rgba = Array.isArray(c) ? c : color(c);
  for (let yy = Math.max(0, Math.round(y)); yy < Math.min(p.height, Math.round(y + h)); yy++)
    for (let xx = Math.max(0, Math.round(x)); xx < Math.min(p.width, Math.round(x + w)); xx++) {
      const i = (yy * p.width + xx) * 4;
      for (let k = 0; k < 4; k++) p.data[i + k] = rgba[k];
    }
}
function line(p, x, y, x2, y2, c, width = 1) {
  const n = Math.max(Math.abs(x2 - x), Math.abs(y2 - y));
  for (let i = 0; i <= n; i++)
    rect(p, x + ((x2 - x) * i) / n, y + ((y2 - y) * i) / n, width, width, c);
}
function poly(p, points, c) {
  const ys = points.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) {
    const xs = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i],
        b = points[(i + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y))
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length; i += 2)
      rect(p, xs[i], y, (xs[i + 1] ?? xs[i]) - xs[i] + 1, 1, c);
  }
}
function paste(dst, src, x, y) {
  PNG.bitblt(src, dst, 0, 0, src.width, src.height, x, y);
}
function save(name, p) {
  const target = path.join(root, name);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, PNG.sync.write(p));
}
function rng(seed) {
  let n = seed;
  return () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
function character(kind, state, f) {
  const p = canvas(48, 64),
    hero = kind === 'player',
    boss = kind === 'boss';
  const outline = '14232c',
    light = hero ? 'd5e7df' : boss ? 'a695a8' : 'a3a49b',
    armor = hero
      ? '416e91'
      : kind === 'rusher'
        ? '9d6254'
        : kind === 'guard'
          ? '708572'
          : boss
            ? '5b536f'
            : '69555c',
    shadow = hero ? '29445e' : '34313e',
    gold = hero ? 'cfb378' : boss ? 'c7a76d' : 'b68b65',
    white = hero ? 'e9e7d6' : '9b9c92';
  const walking = state === 'Walk' || state === 'Run',
    step = walking ? Math.round(Math.sin((f / 6) * Math.PI * 2) * 4) : 0;
  const bob = walking || state === 'Idle' ? f % 2 : state === 'Land' ? 2 : 0;
  const down = state === 'Knockdown' || state === 'Death';
  if (down) {
    rect(p, 9, 54, 29, 7, outline);
    rect(p, 14, 52, 19, 6, armor);
    rect(p, 32, 51, 9, 7, light);
    rect(p, 7, 55, 11, 4, gold);
    rect(p, 18 + f, 50, 7, 3, white);
    return p;
  }
  const r = (x, y, w, h, c) => rect(p, x, y + bob, w, h, c);
  // cape, long silver braid and dark silhouette
  poly(
    p,
    [
      [16, 28 + bob],
      [29, 28 + bob],
      [35 + step, 53],
      [13 + step, 55],
    ],
    shadow,
  );
  r(13, 19, 10, 25, outline);
  r(14, 19, 7, 28, '8eafb8');
  for (let i = 0; i < 7; i++) {
    r(12 + ((i + f) % 2), 31 + i * 3, 5, 3, i % 2 ? light : 'a9c3c4');
    r(13 + ((i + f) % 2), 31 + i * 3, 2, 2, white);
  }
  r(12, 51, 5, 3, gold);
  // legs and fixed feet baseline
  r(19 - step, 43, 7, 14, outline);
  r(28 + step, 43, 7, 14, outline);
  r(20 - step, 45, 5, 10, white);
  r(29 + step, 44, 4, 11, shadow);
  r(18 - step, 54 - bob, 9, 6, gold);
  r(27 + step, 54 - bob, 9, 6, armor);
  r(18 - step, 59 - bob, 10, 2, outline);
  r(27 + step, 59 - bob, 10, 2, outline);
  if (state === 'Kick') {
    r(29, 42, 13, 7, white);
    r(38, 40, 7, 9, gold);
  }
  // armored torso and white skirt
  r(17, 28, 17, 18, outline);
  r(18, 29, 15, 13, armor);
  r(19, 29, 3, 11, light);
  r(25, 30, 6, 9, shadow);
  r(19, 39, 14, 3, gold);
  poly(
    p,
    [
      [19, 42 + bob],
      [32, 42 + bob],
      [35, 49 + bob],
      [17, 49 + bob],
    ],
    white,
  );
  r(24, 43, 3, 6, gold);
  r(30, 43, 3, 6, 'aebeb8');
  // pauldrons and arms
  r(14, 28, 9, 7, outline);
  r(15, 27, 8, 5, gold);
  r(16, 27, 6, 2, light);
  r(15, 33, 5, 9, armor);
  r(16, 41, 4, 5, 'd7bca2');
  const raised = state === 'RisingSlash' ? -(f * 2) : state === 'Attack' ? -2 : 0;
  r(31, 29 + raised, 7, 7, gold);
  r(34, 33 + raised, 5, 9, armor);
  r(35, 40 + raised, 5, 4, 'e3c7a6');
  // face, hair and winged helmet
  r(19, 13, 13, 16, outline);
  r(21, 17, 11, 11, 'd5b89e');
  r(23, 18, 9, 8, 'ecd4b2');
  r(29, 20, 3, 2, hero ? '82cbd0' : 'edb16a');
  r(30, 25, 3, 1, shadow);
  r(17, 12, 16, 7, light);
  r(18, 14, 15, 3, armor);
  r(20, 12, 11, 2, gold);
  r(18, 17, 4, 8, 'dfebe0');
  r(21, 17, 2, 4, white);
  r(27, 11, 3, 9, gold);
  if (hero) {
    poly(
      p,
      [
        [18, 16],
        [10, 9],
        [6, 5],
        [7, 15],
        [12, 21],
        [18, 20],
      ],
      outline,
    );
    poly(
      p,
      [
        [17, 16],
        [8, 7],
        [9, 14],
        [14, 19],
        [17, 19],
      ],
      white,
    );
    line(p, 10, 13, 16, 17, '8dabad');
    poly(
      p,
      [
        [29, 13],
        [35, 6],
        [39, 4],
        [37, 13],
        [32, 18],
      ],
      white,
    );
    line(p, 34, 13, 37, 8, '92adb1');
  } else {
    poly(
      p,
      [
        [18, 16],
        [11, 7],
        [13, 19],
        [19, 22],
      ],
      gold,
    );
    poly(
      p,
      [
        [30, 14],
        [36, 5],
        [35, 20],
        [30, 22],
      ],
      gold,
    );
    r(19, 19, 13, 3, shadow);
    r(23, 20, 9, 1, 'e9b777');
    if (boss) {
      r(15, 25, 22, 6, shadow);
      r(16, 26, 20, 2, gold);
    }
  }
  if (state === 'Guard') {
    r(30, 29, 12, 20, outline);
    r(31, 30, 10, 18, armor);
    r(35, 31, 2, 16, gold);
    r(31, 37, 10, 2, gold);
  }
  if (state === 'Hit') r(17, 29, 2 + f, 8, light);
  if (state === 'Jump' || state === 'Fall') {
    r(19, 49, 5, 4, armor);
    r(28, 48 + (f % 2), 5, 4, gold);
  }
  return p;
}
function generate() {
  const animations = {};
  let index = 0;
  for (const [state, count] of Object.entries(counts)) {
    animations[state] = {
      start: index,
      frames: count,
      fps: state === 'Run' ? 14 : 10,
      loop: ['Idle', 'Walk', 'Run', 'Guard'].includes(state),
    };
    index += count;
  }
  for (const kind of ['player', 'grunt', 'rusher', 'guard', 'boss']) {
    const sheet = canvas(48 * 8, 64 * Math.ceil(index / 8));
    let n = 0;
    for (const [state, count] of Object.entries(counts))
      for (let f = 0; f < count; f++) {
        const p = character(kind, state, f);
        paste(sheet, p, (n % 8) * 48, Math.floor(n / 8) * 64);
        n++;
      }
    save(`${kind === 'player' ? 'characters' : 'enemies'}/${kind}.png`, sheet);
  }
  const sword = canvas(52, 12);
  rect(sword, 3, 5, 10, 3, '283e47');
  rect(sword, 4, 5, 6, 2, 'b69560');
  rect(sword, 10, 2, 3, 9, 'e2c47d');
  rect(sword, 13, 4, 33, 5, '415f6c');
  poly(
    sword,
    [
      [13, 4],
      [45, 4],
      [51, 6],
      [45, 8],
      [13, 8],
    ],
    'c7dfdf',
  );
  rect(sword, 14, 4, 31, 2, 'f0f1d7');
  rect(sword, 16, 7, 29, 1, '7dadae');
  rect(sword, 1, 5, 3, 3, 'dbc17e');
  save('weapons/oathblade.png', sword);
  const random = rng(77),
    far = canvas(960, 270);
  for (let y = 0; y < 270; y++) {
    const k = y / 270;
    rect(far, 0, y, 960, 1, [
      Math.round(18 + 12 * k),
      Math.round(38 + 18 * k),
      Math.round(49 + 16 * k),
      255,
    ]);
  }
  for (let i = 0; i < 110; i++) rect(far, random() * 960, random() * 130, 1, 1, '7c9690');
  for (let layer = 0; layer < 3; layer++) {
    const pts = [[0, 270]];
    for (let x = 0; x <= 1000; x += 30)
      pts.push([x, 100 + layer * 27 + Math.sin(x / 53 + layer) * 15 + random() * 25]);
    pts.push([1000, 270]);
    poly(far, pts, ['2b4852', '29434b', '233c43'][layer]);
  }
  for (let i = 0; i < 20; i++) {
    const x = i * 55 + random() * 20,
      y = 95 + random() * 55;
    rect(far, x, y, 10, 80, '233d46');
    poly(
      far,
      [
        [x - 3, y],
        [x + 5, y - 15],
        [x + 13, y],
      ],
      '233d46',
    );
  }
  save('backgrounds/distant.png', far);
  const bg = canvas(1800, 270);
  // distant masonry broken by high gothic windows
  for (let x = 0; x < 1800; x += 12)
    for (let y = 16; y < 174; y += 8) {
      if (random() > 0.08)
        rect(
          bg,
          x + (y % 16 ? 6 : 0),
          y,
          11,
          7,
          ['30464a', '32494c', '2d4349', '364c4d'][Math.floor(random() * 4)],
        );
    }
  for (let x = 30; x < 1800; x += 185) {
    const arch = [
      [x, 170],
      [x, 81],
      [x + 10, 57],
      [x + 40, 29],
      [x + 70, 57],
      [x + 80, 81],
      [x + 80, 170],
    ];
    poly(bg, arch, '50605c');
    poly(
      bg,
      [
        [x + 7, 170],
        [x + 7, 83],
        [x + 16, 62],
        [x + 40, 39],
        [x + 64, 62],
        [x + 73, 83],
        [x + 73, 170],
      ],
      '142c37',
    );
    poly(
      bg,
      [
        [x + 14, 170],
        [x + 14, 85],
        [x + 23, 66],
        [x + 40, 49],
        [x + 57, 66],
        [x + 66, 85],
        [x + 66, 170],
      ],
      '2d4b56',
    );
    for (let k = 0; k < 5; k++) rect(bg, x + 16 + k * 12, 82, 2, 89, '50615d');
    rect(bg, x + 12, 111, 57, 3, '5a6960');
    rect(bg, x + 39, 46, 3, 124, '6a7566');
    for (let k = 0; k < 6; k++) {
      rect(bg, x - 4, 77 + k * 15, 10, 12, '66705f');
      rect(bg, x + 76, 77 + k * 15, 10, 12, '4a5c54');
    }
    rect(bg, x - 7, 167, 94, 7, '6d7664');
    rect(bg, x - 9, 173, 98, 5, '253d3d');
    // enormous weathered pillars
    const cx = x + 115;
    rect(bg, cx - 3, 8, 26, 161, '20393d');
    rect(bg, cx, 10, 19, 158, '4b5b52');
    rect(bg, cx + 3, 12, 3, 153, '71806a');
    rect(bg, cx + 13, 12, 3, 153, '354c47');
    for (let y = 30; y < 170; y += 29) {
      rect(bg, cx, y, 19, 2, '273f3c');
      rect(bg, cx + 1, y + 2, 17, 1, '7c8066');
    }
    rect(bg, cx - 7, 5, 32, 8, '687360');
    rect(bg, cx - 9, 0, 36, 5, '465b51');
    rect(bg, cx - 5, 167, 28, 8, '6d7863');
    rect(bg, cx - 10, 175, 38, 8, '3e5247');
    // hanging vines and ivy
    for (let v = 0; v < 6; v++) {
      let vx = cx - 4 + random() * 28;
      const length = 25 + random() * 100;
      for (let y = 0; y < length; y += 3) {
        vx += random() * 3 - 1.5;
        rect(bg, vx, y, 1, 4, '354c37');
        if (random() > 0.3)
          rect(
            bg,
            vx + (y % 2 ? 1 : -3),
            y,
            4,
            2,
            ['536347', '66734f', '3b573f'][Math.floor(random() * 3)],
          );
      }
    }
  }
  // walkable flagstone terrace with perspective courses
  rect(bg, 0, 184, 1800, 86, '414e48');
  rect(bg, 0, 184, 1800, 3, '81836a');
  rect(bg, 0, 188, 1800, 3, '2d403c');
  for (let row = 0; row < 7; row++) {
    const y = 191 + row * 12;
    for (let x = -20; x < 1800; x += 52) {
      const xx = x + (row % 2) * 26;
      rect(bg, xx, y, 50, 11, ['4b5750', '515b50', '47554e', '555f53'][Math.floor(random() * 4)]);
      rect(bg, xx, y, 50, 1, '657062');
      if (random() > 0.3) line(bg, xx + 12, y + 2, xx + 18, y + 8, '3c4c46');
    }
  }
  for (let i = 0; i < 950; i++) {
    const x = random() * 1800,
      y = 188 + random() * 82;
    rect(bg, x, y, random() * 3 + 1, 1, random() > 0.6 ? '7c8067' : '34483f');
  }
  for (let i = 0; i < 350; i++) {
    const x = random() * 1800,
      y = 175 + random() * 13;
    rect(bg, x, y, 2, random() * 9 + 2, ['3d593f', '596a46', '788058'][Math.floor(random() * 3)]);
  }
  // front terrace lip and scattered roots
  rect(bg, 0, 250, 1800, 3, '7b8068');
  rect(bg, 0, 253, 1800, 17, '233a38');
  for (let x = 0; x < 1800; x += 43) {
    rect(bg, x, 255, 40, 12, '344a42');
    rect(bg, x, 255, 40, 1, '596650');
  }
  for (let i = 0; i < 80; i++) {
    const x = random() * 1800;
    poly(
      bg,
      [
        [x, 270],
        [x + 5, 250 - random() * 11],
        [x + 7, 270],
      ],
      '1b3435',
    );
  }
  save('backgrounds/ruins.png', bg);
  const metadata = {
    version: 1,
    frameSize: [48, 64],
    columns: 8,
    totalFrames: index,
    origin: [0.5, 0.9375],
    animations,
    sword: { size: [52, 12], pivot: [8, 6], bladeLength: 39 },
    files: [
      'characters/player.png',
      'enemies/grunt.png',
      'enemies/rusher.png',
      'enemies/guard.png',
      'enemies/boss.png',
      'weapons/oathblade.png',
      'backgrounds/distant.png',
      'backgrounds/ruins.png',
    ],
  };
  writeFileSync(`${root}/manifest.json`, JSON.stringify(metadata, null, 2) + '\n');
  console.log(`Generated original PNGs and ${index} poses per actor.`);
}
function check() {
  if (!existsSync(`${root}/manifest.json`))
    throw new Error('Missing manifest: run npm run assets:generate');
  const meta = JSON.parse(readFileSync(`${root}/manifest.json`, 'utf8'));
  for (const file of meta.files) {
    const target = `${root}/${file}`;
    if (!existsSync(target))
      throw new Error(`Missing ${target}. Runtime fallback is available; regenerate for release.`);
    const p = PNG.sync.read(readFileSync(target));
    if (file.startsWith('characters') || file.startsWith('enemies')) {
      if (
        p.width !== meta.frameSize[0] * meta.columns ||
        p.height !== Math.ceil(meta.totalFrames / meta.columns) * meta.frameSize[1]
      )
        throw new Error(`Bad sheet dimensions: ${file}`);
      for (let f = 0; f < meta.totalFrames; f++) {
        let opaque = 0;
        for (let y = 0; y < 64; y++)
          for (let x = 0; x < 48; x++) {
            const alpha =
              p.data[((Math.floor(f / 8) * 64 + y) * p.width + (f % 8) * 48 + x) * 4 + 3];
            if (alpha) opaque++;
            if ((x === 0 || x === 47 || y === 0 || y === 63) && alpha)
              throw new Error(`Frame edge contamination ${file} #${f}`);
          }
        if (opaque < 30 || opaque > 48 * 64 * 0.75)
          throw new Error(`Bad transparency/content ${file} #${f}`);
      }
    } else if (file.startsWith('weapons') && (p.width !== 52 || p.height !== 12))
      throw new Error('Sword geometry changed');
  }
  for (const [name, n] of Object.entries(counts))
    if (meta.animations[name].frames < n) throw new Error(`Missing animation frames: ${name}`);
  console.log(
    `Verified ${meta.files.length} PNGs, dimensions, nonempty frames, transparent borders and animation metadata.`,
  );
}
// Import a regular grid sheet into fixed canvases, preserving pixels and extracting each frame.
function extract(source, out, w, h) {
  if (!source || !out || !w || !h)
    throw new Error(
      'Usage: node scripts/assets.mjs extract input.png output-dir frameWidth frameHeight',
    );
  const p = PNG.sync.read(readFileSync(source));
  if (p.width % w || p.height % h)
    throw new Error('Sheet dimensions are not divisible by frame dimensions');
  mkdirSync(out, { recursive: true });
  const frames = [];
  for (let y = 0; y < p.height; y += h)
    for (let x = 0; x < p.width; x += w) {
      const frame = canvas(w, h);
      PNG.bitblt(p, frame, x, y, w, h, 0, 0);
      const file = `frame-${String(frames.length).padStart(3, '0')}.png`;
      writeFileSync(path.join(out, file), PNG.sync.write(frame));
      frames.push(file);
    }
  writeFileSync(
    path.join(out, 'frames.json'),
    JSON.stringify({ frameSize: [w, h], origin: [0.5, 0.9375], fps: 10, frames }, null, 2),
  );
  console.log(
    `Extracted ${frames.length} frames. Human review required for contamination and anatomy.`,
  );
}
function pack(folder, out) {
  const m = JSON.parse(readFileSync(path.join(folder, 'frames.json'), 'utf8'));
  const [w, h] = m.frameSize;
  const sheet = canvas(w * m.frames.length, h);
  for (const [i, file] of m.frames.entries()) {
    const frame = PNG.sync.read(readFileSync(path.join(folder, file)));
    if (frame.width > w || frame.height > h) throw new Error('Frame exceeds fixed canvas');
    PNG.bitblt(
      frame,
      sheet,
      0,
      0,
      frame.width,
      frame.height,
      i * w + Math.floor((w - frame.width) / 2),
      h - frame.height,
    );
  }
  writeFileSync(out, PNG.sync.write(sheet));
  writeFileSync(`${out}.json`, JSON.stringify({ ...m, columns: m.frames.length }, null, 2));
  console.log(`Packed ${m.frames.length} aligned frames.`);
}
const [command, ...args] = process.argv.slice(2);
if (command === 'generate') generate();
else if (command === 'extract') extract(args[0], args[1], Number(args[2]), Number(args[3]));
else if (command === 'pack') pack(args[0], args[1]);
else check();
