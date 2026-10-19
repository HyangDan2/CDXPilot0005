import { it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { weaponPose, SWORD } from '../../src/game/animation/rig';
import { createActor } from '../../src/game/entities/actor';
it('extracts real sheet frames and packs equal canvases with metadata', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'valkyrie-assets-'));
  try {
    execFileSync(process.execPath, [
      'scripts/assets.mjs',
      'extract',
      'public/assets/characters/player.png',
      tmp,
      '48',
      '64',
    ]);
    const frames = JSON.parse(readFileSync(path.join(tmp, 'frames.json'), 'utf8'));
    expect(frames.frameSize).toEqual([48, 64]);
    expect(frames.frames.length).toBe(64);
    const out = path.join(tmp, 'packed.png');
    execFileSync(process.execPath, ['scripts/assets.mjs', 'pack', tmp, out]);
    const png = readFileSync(out);
    expect(png.readUInt32BE(16)).toBe(48 * 64);
    expect(png.readUInt32BE(20)).toBe(64);
  } finally {
    rmSync(tmp, { recursive: true });
  }
});
it('matches immutable sword PNG dimensions and transformed tip distance', () => {
  const png = readFileSync('public/assets/weapons/oathblade.png');
  expect(png.readUInt32BE(16)).toBe(SWORD.width);
  expect(png.readUInt32BE(20)).toBe(SWORD.height);
  const a = createActor(0, 'player', 120, 400);
  for (const facing of [-1, 1] as const)
    for (let frame = 0; frame < 30; frame++) {
      a.facing = facing;
      a.attack = { id: 'slash2', elapsed: frame / 60, hit: new Set() };
      const p = weaponPose(a, false);
      const tip = {
        x: p.x + Math.cos(p.rotation) * SWORD.bladeLength * p.scale,
        y: p.y + Math.sin(p.rotation) * SWORD.bladeLength * p.scale,
      };
      expect(Math.hypot(tip.x - p.x, tip.y - p.y)).toBeCloseTo(SWORD.bladeLength * 1.65, 8);
    }
});
