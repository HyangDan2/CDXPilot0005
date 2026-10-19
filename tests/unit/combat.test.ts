import { describe, it, expect } from 'vitest';
import { createActor } from '../../src/game/entities/actor';
import {
  applyHit,
  AttackBuffer,
  canHit,
  damageAmount,
  startAttack,
} from '../../src/game/combat/combat';
import { attackPhase } from '../../src/data/attacks';
import { integrate } from '../../src/game/physics/world';
describe('combat', () => {
  const pair = () => {
    const a = createActor(0, 'player', 100, 400),
      b = createActor(1, 'grunt', 150, 400);
    startAttack(a, 'slash1');
    a.attack!.elapsed = 0.12;
    return { a, b };
  };
  it('has startup active recovery windows', () => {
    expect(attackPhase('slash1', 0)).toBe('startup');
    expect(attackPhase('slash1', 0.12)).toBe('active');
    expect(attackPhase('slash1', 0.3)).toBe('recovery');
  });
  it('checks facing, depth and height', () => {
    const { a, b } = pair();
    expect(canHit(a, b)).toBe(true);
    b.y = 445;
    expect(canHit(a, b)).toBe(false);
    b.y = 400;
    b.x = 30;
    expect(canHit(a, b)).toBe(false);
    b.x = 150;
    b.z = 120;
    expect(canHit(a, b)).toBe(false);
  });
  it('hits each target only once per swing', () => {
    const { a, b } = pair();
    expect(applyHit(a, b)).toBe(23);
    b.invulnerable = 0;
    expect(applyHit(a, b)).toBe(0);
    expect(b.hp).toBe(39);
  });
  it('respects invulnerability across separate attacks', () => {
    const { a, b } = pair();
    b.invulnerable = 0.5;
    expect(applyHit(a, b)).toBe(0);
    integrate(b, 0.51);
    expect(applyHit(a, b)).toBe(23);
  });
  it('guard reduces damage but kick breaks it', () => {
    const { a, b } = pair();
    b.state = 'Guard';
    expect(applyHit(a, b)).toBe(5);
    expect(damageAmount(10, true)).toBe(2);
    b.invulnerable = 0;
    startAttack(a, 'kick', true);
    a.attack!.elapsed = 0.1;
    expect(applyHit(a, b)).toBe(20);
    expect(b.state).toBe('Hit');
  });
  it('rising launches into knockdown', () => {
    const { a, b } = pair();
    startAttack(a, 'rising', true);
    a.attack!.elapsed = 0.2;
    applyHit(a, b);
    expect(b.vz).toBe(420);
    integrate(b, 1 / 60);
    expect(b.z).toBeGreaterThan(0);
    expect(b.state).toBe('Knockdown');
  });
  it('buffers a legal J J command-rising sequence and disallows startup cancellation', () => {
    const a = createActor(0, 'player', 100, 400),
      q = new AttackBuffer();
    q.push(['sword'], 0);
    expect(q.consume(a, 0)).toBe('slash1');
    q.push(['sword'], 0.15);
    expect(q.consume(a, 0.15)).toBe(null);
    a.attack!.elapsed = 0.23;
    expect(q.consume(a, 0.23)).toBe('slash2');
    a.attack!.elapsed = 0.26;
    q.push(['rising'], 0.6);
    expect(q.consume(a, 0.6)).toBe('rising');
  });
  it('expires old buffered inputs', () => {
    const a = createActor(0, 'player', 100, 400),
      q = new AttackBuffer();
    q.push(['sword'], 0);
    expect(q.consume(a, 1)).toBe(null);
  });
});
