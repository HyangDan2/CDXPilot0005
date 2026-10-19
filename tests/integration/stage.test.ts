import { describe, it, expect } from 'vitest';
import { Simulation } from '../../src/game/entities/simulation';
import { createActor } from '../../src/game/entities/actor';
import { updateAI } from '../../src/game/ai/brain';
import { emptyInput } from '../../src/game/entities/types';
import { waves } from '../../src/data/stage';
describe('AI and stage', () => {
  it('spawns deterministic waves and unlocks the next section', () => {
    const a = new Simulation(42),
      b = new Simulation(42);
    for (const s of [a, b]) {
      s.player.x = 360;
      s.step(1 / 60, emptyInput());
    }
    expect(a.enemies).toEqual(b.enemies);
    expect(a.enemies).toHaveLength(3);
    expect(a.active).toBe(true);
    a.enemies.forEach((e) => (e.hp = 0));
    a.step(1 / 60, emptyInput());
    expect(a.wave).toBe(1);
    expect(a.active).toBe(false);
  });
  it('advances all waves to clear', () => {
    const s = new Simulation();
    for (const wave of waves) {
      s.player.x = wave.trigger;
      s.step(1 / 60, emptyInput());
      expect(s.active).toBe(true);
      s.enemies.forEach((e) => (e.hp = 0));
      s.step(1 / 60, emptyInput());
    }
    expect(s.status).toBe('clear');
  });
  it('ends when player health is exhausted', () => {
    const s = new Simulation();
    s.player.hp = 0;
    s.step(1 / 60, emptyInput());
    expect(s.status).toBe('over');
  });
  it('uses timed chase/attack/recovery and guard behavior', () => {
    const p = createActor(0, 'player', 100, 400),
      e = createActor(1, 'grunt', 150, 400);
    updateAI(e, p, 0.1);
    expect(e.ai).toBe('Idle');
    updateAI(e, p, 0.3);
    expect(e.ai).toBe('Attack');
    expect(e.attack?.id).toBe('enemy');
    e.attack = null;
    updateAI(e, p, 0.01);
    expect(e.ai).toBe('Recover');
    const g = createActor(2, 'guard', 150, 400);
    updateAI(g, p, 0.4);
    expect(g.state).toBe('Guard');
    updateAI(g, p, 0.6);
    expect(g.attack?.id).toBe('enemy');
  });
  it('boss cycles triple melee, charge and slam', () => {
    const p = createActor(0, 'player', 100, 400),
      b = createActor(1, 'boss', 150, 400);
    const ids = [];
    for (let i = 0; i < 5; i++) {
      b.ai = 'Chase';
      b.attack = null;
      b.state = 'Idle';
      ids.push(updateAI(b, p, 1));
    }
    expect(ids).toEqual(['enemy', 'enemy', 'enemy', 'charge', 'slam']);
  });
  it('enraged boss closes distance faster', () => {
    const p = createActor(0, 'player', 500, 400),
      a = createActor(1, 'boss', 100, 400),
      b = createActor(2, 'boss', 100, 400);
    a.ai = b.ai = 'Chase';
    b.hp = 200;
    updateAI(a, p, 0.1);
    updateAI(b, p, 0.1);
    expect(b.x).toBeGreaterThan(a.x);
  });
  it('normal input moves, jumps and starts attacks', () => {
    const s = new Simulation();
    const input = emptyInput();
    input.x = 1;
    for (let i = 0; i < 60; i++) s.step(1 / 60, input);
    expect(s.player.x).toBeGreaterThan(380);
    input.commands = ['jump'];
    s.step(1 / 60, input);
    expect(s.player.z).toBeGreaterThan(0);
    input.commands = ['sword'];
    s.step(1 / 60, input);
    expect(s.player.attack?.id).toBe('slash1');
  });
});

it('adds extra charge and slam patterns below half boss health', () => {
  const p = createActor(0, 'player', 100, 400);
  const boss = createActor(1, 'boss', 150, 400);
  boss.hp = 300;
  const ids = [];
  for (let i = 0; i < 7; i++) {
    boss.ai = 'Chase';
    boss.attack = null;
    boss.state = 'Idle';
    ids.push(updateAI(boss, p, 1));
  }
  expect(ids).toEqual(['enemy', 'enemy', 'enemy', 'charge', 'slam', 'charge', 'slam']);
});

it('commits attack direction and depth after the telegraph begins', () => {
  const p = createActor(0, 'player', 100, 400),
    e = createActor(1, 'rusher', 250, 400);
  updateAI(e, p, 0.3);
  expect(e.attack?.id).toBe('charge');
  const facing = e.facing,
    y = e.y;
  p.x = 400;
  p.y = 470;
  e.attack!.elapsed = 0.6;
  updateAI(e, p, 0.1);
  expect(e.facing).toBe(facing);
  expect(e.y).toBe(y);
  expect(e.x).toBeLessThan(250);
});
it('flanks and separates allies instead of stacking on a single point', () => {
  const p = createActor(0, 'player', 100, 420),
    a = createActor(3, 'grunt', 230, 420),
    b = createActor(4, 'grunt', 230, 420);
  updateAI(a, p, 0.3, false, [a, b]);
  expect(a.ai).toBe('Flank');
  expect(a.y).not.toBe(420);
  expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0);
});
it('retreats after recovery and then re-enters chase', () => {
  const p = createActor(0, 'player', 100, 400),
    e = createActor(1, 'grunt', 160, 400);
  e.ai = 'Recover';
  e.facing = -1;
  updateAI(e, p, 0.4);
  expect(e.ai).toBe('Retreat');
  expect(e.x).toBeGreaterThan(160);
  updateAI(e, p, 0.3);
  expect(e.ai).not.toBe('Retreat');
});
