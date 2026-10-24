import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput } from '../../src/game/entities/types';

const dt = 1 / 60;

function finishRightwardRoll(simulation: Simulation) {
  simulation.step(dt, { ...emptyInput(), x: 1, commands: ['roll'] });
  for (let frame = 1; frame < 31; frame++) simulation.step(dt, emptyInput());
  expect(simulation.player.state).toBe('Idle');
}

describe('dodge follow-up attack', () => {
  it('replaces a running lunge with the normal combo opener', () => {
    const simulation = new Simulation();
    const running = { ...emptyInput(), x: 1, dash: true };
    for (let frame = 0; frame < 8; frame++) simulation.step(dt, running);

    simulation.step(dt, { ...emptyInput(), commands: ['sword'] });

    expect(simulation.player.attack?.id).toBe('slash1');
    expect(simulation.player.attack?.lungeDirection).toBeUndefined();
  });

  it('turns an attack within 80ms after a roll into the lunging combo finisher', () => {
    const simulation = new Simulation();
    finishRightwardRoll(simulation);
    for (let frame = 0; frame < 3; frame++) simulation.step(dt, emptyInput());
    const before = simulation.player.x;

    simulation.step(dt, { ...emptyInput(), commands: ['sword'] });

    expect(simulation.player.attack?.id).toBe('slash4');
    expect(simulation.player.attack?.lungeDirection).toEqual({ x: 1, y: 0 });
    expect(simulation.player.x).toBeGreaterThan(before);
  });

  it('uses a normal attack once the post-roll 80ms window expires', () => {
    const simulation = new Simulation();
    finishRightwardRoll(simulation);
    for (let frame = 0; frame < 4; frame++) simulation.step(dt, emptyInput());

    simulation.step(dt, { ...emptyInput(), commands: ['sword'] });

    expect(simulation.player.attack?.id).toBe('slash1');
    expect(simulation.player.attack?.lungeDirection).toBeUndefined();
  });
});
