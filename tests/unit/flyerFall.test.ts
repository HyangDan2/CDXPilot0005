import { describe, expect, it } from 'vitest';
import { sdFrame } from '../../src/game/animation/sd';
import { startAttack, applyHit } from '../../src/game/combat/combat';
import { createActor } from '../../src/game/entities/actor';
import { collideSolids, expanded, inside, type Solid } from '../../src/game/physics/obstacles';
import { integrate } from '../../src/game/physics/world';

describe('dedicated flyer art and hit fall', () => {
  it('uses its own flying, dive, tumble, fallen, and recovery frames', () => {
    const flyer = createActor(1, 'flyer', 350, 400);
    flyer.stateTime = 0.14;
    expect(sdFrame(flyer)).toEqual({ sheet: 'smooth-flyer', frame: 2 });
    startAttack(flyer, 'dive');
    expect(sdFrame(flyer).frame).toBe(8);
    flyer.attack!.elapsed = 0.65;
    expect(sdFrame(flyer).frame).toBe(9);
    flyer.attack = null;
    flyer.state = 'Knockdown';
    flyer.z = 120;
    expect(sdFrame(flyer).frame).toBe(12);
    flyer.z = 0;
    expect(sdFrame(flyer).frame).toBe(14);
    flyer.state = 'Recovery';
    expect(sdFrame(flyer).frame).toBe(15);
  });

  it('turns an airborne flyer hit into a gravity-driven knockdown', () => {
    const attacker = createActor(0, 'player', 100, 400);
    const flyer = createActor(1, 'flyer', 150, 400);
    flyer.z = 75;
    startAttack(attacker, 'rising');
    attacker.attack!.elapsed = 0.2;

    expect(applyHit(attacker, flyer)).toBeGreaterThan(0);
    expect(flyer.state).toBe('Knockdown');
    expect(flyer.vz).toBe(-180);
    integrate(flyer, 0.1);
    expect(flyer.z).toBeLessThan(75);
  });

  it('pushes a falling flyer off an obstacle before it reaches the ground', () => {
    const flyer = createActor(1, 'flyer', 830, 410);
    const pillar: Solid = { x: 800, y: 390, width: 70, depth: 40, height: 120, hp: 1 };
    flyer.state = 'Knockdown';
    flyer.z = 145;
    flyer.vz = -180;

    for (let frame = 0; frame < 60 && flyer.z > 0; frame++) {
      const before = { x: flyer.x, y: flyer.y };
      integrate(flyer, 1 / 60);
      collideSolids(flyer, before, [pillar]);
      if (!inside(flyer, expanded(pillar, 16, 10))) break;
    }

    expect(inside(flyer, expanded(pillar, 16, 10))).toBe(false);
    expect(flyer.z).toBeGreaterThan(0);
  });
});
