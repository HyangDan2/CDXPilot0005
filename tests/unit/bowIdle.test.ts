import { expect, it } from 'vitest';
import { createActor } from '../../src/game/entities/actor';
import { sdFrame } from '../../src/game/animation/sd';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput } from '../../src/game/entities/types';

it('plays both relaxed bow poses in a slow loop, in either facing direction', () => {
  const actor = createActor(0, 'player', 100, 400);
  actor.weapon = 'bow';
  for (const facing of [-1, 1] as const) {
    actor.facing = facing;
    for (const [time, frame] of [
      [0, 0],
      [1.49, 0],
      [1.5, 1],
      [2.99, 1],
      [3, 0],
      [4.5, 1],
    ]) {
      actor.stateTime = time;
      expect(sdFrame(actor)).toEqual({ sheet: 'smooth-bow', frame });
    }
  }
  actor.state = 'Guard';
  expect(sdFrame(actor).frame).toBe(8);
  actor.state = 'Roll';
  expect(sdFrame(actor).sheet).toBe('smooth-roll');
  actor.state = 'Walk';
  expect(sdFrame(actor).sheet).toBe('smooth-bow-walk');
  actor.state = 'Idle';
  actor.attack = { id: 'shot', elapsed: 0, hit: new Set() };
  expect(sdFrame(actor).frame).toBe(4);
});

it('advances bow idle after an actual weapon switch without more input', () => {
  const simulation = new Simulation(12);
  simulation.step(1 / 60, { ...emptyInput(), commands: ['switch'] });
  for (let tick = 0; tick < 30; tick++) simulation.step(1 / 60, emptyInput());
  expect(simulation.player.weapon).toBe('bow');
  expect(simulation.player.state).toBe('Idle');
  const frames = new Set<number>();
  for (let tick = 0; tick < 190; tick++) {
    simulation.step(1 / 60, emptyInput());
    frames.add(sdFrame(simulation.player).frame);
  }
  expect([...frames].sort()).toEqual([0, 1]);
});
