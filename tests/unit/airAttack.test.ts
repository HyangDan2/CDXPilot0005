import { describe, expect, it } from 'vitest';
import {
  advanceAttack,
  applyHit,
  AttackBuffer,
  chooseAttack,
  startAttack,
} from '../../src/game/combat/combat';
import { createActor } from '../../src/game/entities/actor';
import { movePlayer } from '../../src/game/entities/movement';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput } from '../../src/game/entities/types';
import { integrate } from '../../src/game/physics/world';

describe('one air attack per jump', () => {
  it('rejects a second swing after recovery and restores it on landing', () => {
    const a = createActor(0, 'player', 100, 400);
    a.z = 80;
    expect(startAttack(a, 'air')).toBe(true);
    advanceAttack(a, 1);
    expect(a.attack).toBeNull();
    expect(startAttack(a, 'air')).toBe(false);
    a.z = 1;
    a.vz = -100;
    expect(integrate(a, 1 / 60)).toBe(true);
    expect(a.airAttackUsed).toBe(false);
    integrate(a, 0.11);
    movePlayer(a, { ...emptyInput(), commands: ['jump'] }, 1 / 60);
    expect(a.vz).toBeGreaterThan(0);
    expect(startAttack(a, 'air')).toBe(true);
  });

  it.each([0, 1, 15, 80])('uses the air attack at height %s, including takeoff', (height) => {
    const a = createActor(0, 'player', 100, 400);
    a.z = height;
    a.vz = height === 0 ? 440 : -10;
    expect(chooseAttack(a, 'sword')).toBe('air');
    expect(chooseAttack(a, 'rising')).toBeNull();
    expect(startAttack(a, 'slash1')).toBe(false);
    a.weapon = 'bow';
    expect(chooseAttack(a, 'sword')).toBeNull();
    expect(startAttack(a, 'shot')).toBe(false);
  });

  it('keeps the attack consumed when a hit interrupts the swing', () => {
    const a = createActor(0, 'player', 100, 400);
    const enemy = createActor(1, 'grunt', 145, 400);
    a.z = 30;
    startAttack(a, 'air');
    startAttack(enemy, 'enemy');
    enemy.attack!.elapsed = 0.42;
    expect(applyHit(enemy, a)).toBeGreaterThan(0);
    expect(a.attack).toBeNull();
    a.state = 'Fall';
    expect(startAttack(a, 'air')).toBe(false);
  });

  it('discards extra airborne inputs instead of buffering a ground attack', () => {
    const a = createActor(0, 'player', 100, 400);
    const buffer = new AttackBuffer();
    a.z = 1;
    startAttack(a, 'air');
    advanceAttack(a, 1);
    buffer.push(['sword'], 0);
    expect(buffer.consume(a, 0)).toBeNull();
    a.vz = -100;
    integrate(a, 1 / 60);
    expect(buffer.consume(a, 0.05)).toBeNull();
  });

  it('accepts only one swing per flight under repeated commands at 60 Hz', () => {
    const sim = new Simulation();
    const flight = () => {
      sim.step(1 / 60, { ...emptyInput(), commands: ['jump', 'sword'] });
      expect(sim.player.attack?.id).toBe('air');
      let swings = sim.events.filter((e) => e.type === 'swing').length;
      sim.events = [];
      for (let frame = 0; frame < 90 && sim.player.z > 0; frame++) {
        sim.step(1 / 60, { ...emptyInput(), commands: ['sword'] });
        swings += sim.events.filter((e) => e.type === 'swing').length;
        sim.events = [];
      }
      expect(sim.player.z).toBe(0);
      expect(swings).toBe(1);
      for (let frame = 0; frame < 15; frame++) sim.step(1 / 60, emptyInput());
      expect(sim.player.attack).toBeNull();
    };
    flight();
    flight();
  });
});
