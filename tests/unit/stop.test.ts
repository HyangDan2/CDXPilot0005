import { describe, it, expect } from 'vitest';
import { createActor } from '../../src/game/entities/actor';
import { movePlayer } from '../../src/game/entities/movement';
import { integrate } from '../../src/game/physics/world';
import { emptyInput } from '../../src/game/entities/types';
import { twohandFrame } from '../../src/game/animation/twohand';
import { startAttack } from '../../src/game/combat/combat';
describe('interruptible run settle', () => {
  it('plays six settle poses then idle without moving released feet', () => {
    const a = createActor(0, 'player', 100, 420);
    a.state = 'Run';
    const x = a.x;
    movePlayer(a, emptyInput(), 1 / 60);
    expect(twohandFrame(a)).toEqual({ sheet: 'smooth-stop', frame: 0 });
    for (let i = 0; i < 5; i++) integrate(a, 0.05);
    expect(twohandFrame(a)).toEqual({ sheet: 'smooth-stop', frame: 5 });
    expect(a.x).toBe(x);
    integrate(a, 0.06);
    expect(twohandFrame(a).sheet).toBe('smooth-idle');
  });
  it('allows guard, jump, movement and attack immediately', () => {
    for (const choice of ['guard', 'jump', 'move', 'attack']) {
      const a = createActor(0, 'player', 100, 420);
      a.state = 'Run';
      movePlayer(a, emptyInput(), 1 / 60);
      const input = emptyInput();
      if (choice === 'guard') input.guard = true;
      if (choice === 'jump') input.commands = ['jump'];
      if (choice === 'move') input.x = 1;
      if (choice === 'attack') {
        expect(startAttack(a, 'slash1')).toBe(true);
      } else movePlayer(a, input, 1 / 60);
      expect(twohandFrame(a).sheet).not.toBe('smooth-stop');
    }
  });
});
