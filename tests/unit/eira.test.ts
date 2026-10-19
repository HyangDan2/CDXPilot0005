import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { createActor } from '../../src/game/entities/actor';
import { animationFrames, SWORD_V2, weaponPose } from '../../src/game/animation/rig';
import { eira, eiraFrame } from '../../src/game/animation/eira';
import type { State, AttackId } from '../../src/game/entities/types';
it('has real 384-pixel sheets for every selected state and all attack phases', () => {
  const a = createActor(0, 'player', 300, 420);
  for (const state of Object.keys(animationFrames) as State[])
    for (let i = 0; i < 60; i++) {
      a.state = state;
      a.stateTime = i / 60;
      const f = eiraFrame(a);
      expect(f.frame).toBeLessThan(eira.clips[f.clip].count);
    }
  for (const id of ['slash1', 'slash2', 'rising', 'kick', 'air'] as AttackId[])
    for (let i = 0; i < 60; i++) {
      a.attack = { id, elapsed: i / 60, hit: new Set() };
      const f = eiraFrame(a);
      expect(f.frame).toBeLessThan(eira.clips[f.clip].count);
    }
  expect(Object.values(eira.clips).reduce((n, c) => n + c.count, 0)).toBe(72);
  for (const c of Object.values(eira.clips)) {
    const png = readFileSync('public/assets/' + c.file);
    expect(png.readUInt32BE(16)).toBe(c.count * 384);
    expect(png.readUInt32BE(20)).toBe(384);
  }
});
it('attaches immutable generated sword to per-frame mirrored hands without changing blade length', () => {
  const p = readFileSync('public/assets/weapons/oathblade-v2.png');
  expect([p.readUInt32BE(16), p.readUInt32BE(20)]).toEqual(SWORD_V2.size);
  const a = createActor(0, 'player', 400, 430),
    length = (SWORD_V2.tip[0] - SWORD_V2.pivot[0]) * SWORD_V2.displayScale;
  for (const facing of [-1, 1] as const)
    for (let i = 0; i < 40; i++) {
      a.facing = facing;
      a.attack = { id: 'rising', elapsed: i / 60, hit: new Set() };
      const pose = weaponPose(a);
      const f = eiraFrame(a),
        hand = eira.clips[f.clip].frames[f.frame].hand;
      expect(pose.x).toBeCloseTo(a.x + (hand[0] - 192) * 0.48 * facing);
      expect(pose.y).toBeCloseTo(a.y + (hand[1] - 350) * 0.48);
      expect(
        Math.hypot(Math.cos(pose.rotation) * length, Math.sin(pose.rotation) * length),
      ).toBeCloseTo(length);
      expect(pose.scale).toBe(0.21);
    }
});
