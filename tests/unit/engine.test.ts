import { describe, expect, it } from 'vitest';
import { createActor } from '../../src/game/entities/actor';
import { canTransition } from '../../src/game/entities/stateMachine';
import { FixedClock, integrate, project } from '../../src/game/physics/world';
import { SWORD, weaponPose, animationFrames } from '../../src/game/animation/rig';
import { cameraTarget } from '../../src/game/camera/follow';
describe('2.5D engine', () => {
  it('projects height independently of depth', () =>
    expect(project({ x: 20, y: 380, z: 100 })).toEqual({ x: 20, y: 280 }));
  it('rejects recovery and death interruption', () => {
    expect(canTransition('Knockdown', 'Attack')).toBe(false);
    expect(canTransition('Death', 'Idle')).toBe(false);
    expect(canTransition('Attack', 'Walk')).toBe(false);
    expect(canTransition('Attack', 'Kick', true)).toBe(true);
  });
  it('jumps, falls, lands and stays within the lane', () => {
    const a = createActor(0, 'player', 100, 400);
    a.vz = 440;
    a.state = 'Jump';
    let peak = 0;
    for (let i = 0; i < 90; i++) {
      integrate(a, 1 / 60);
      peak = Math.max(peak, a.z);
    }
    expect(peak).toBeGreaterThan(90);
    expect(a.z).toBe(0);
    expect(a.state).toBe('Idle');
  });
  it('takes the same fixed steps at 30 and 144 Hz', () => {
    const run = (fps: number) => {
      const c = new FixedClock();
      let n = 0;
      for (let i = 0; i < fps * 2; i++) c.advance(1 / fps, () => n++);
      return n;
    };
    expect(run(30)).toBe(120);
    expect(run(144)).toBe(120);
  });
  it('keeps grip attached and sword geometry invariant across frames/directions', () => {
    const a = createActor(0, 'player', 200, 400);
    for (const facing of [-1, 1] as const) {
      a.facing = facing;
      for (let i = 0; i < 30; i++) {
        a.attack = { id: 'slash1', elapsed: i / 60, hit: new Set() };
        const p = weaponPose(a, false);
        expect(p.x).toBe(200 + 21 * facing);
        expect(p.gripX).toBe(8);
        expect(p.scale).toBe(1.65);
        expect(SWORD.bladeLength).toBe(39);
      }
    }
  });
  it('has the required pose counts and clamps camera', () => {
    expect(animationFrames.Walk).toBe(6);
    expect(animationFrames.RisingSlash).toBe(5);
    expect(cameraTarget(0)).toBe(0);
    expect(cameraTarget(3600)).toBe(2640);
  });
});
