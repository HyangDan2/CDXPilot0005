import { expect, it } from 'vitest';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput, type Command } from '../../src/game/entities/types';
import { waves } from '../../src/data/stage';
it('clears every encounter using movement and attacks without health or damage overrides', () => {
  const s = new Simulation(731);
  let action = 0;
  for (let tick = 0; tick < 60 * 240 && s.status === 'playing'; tick++) {
    const input = emptyInput(),
      p = s.player;
    const target = s.enemies
      .filter((e) => e.hp > 0)
      .sort(
        (a, b) =>
          Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - Math.abs(b.x - p.x) - Math.abs(b.y - p.y),
      )[0];
    if (target) {
      const dx = target.x - p.x,
        dy = target.y - p.y;
      input.x = Math.abs(dx) > 48 || p.facing !== Math.sign(dx) ? Math.sign(dx) : 0;
      input.y = Math.abs(dy) > 6 ? Math.sign(dy) : 0;
      if (Math.abs(dx) < 85 && Math.abs(dy) < 22 && tick % 14 === 0) {
        input.commands = [(['sword', 'sword', 'sword', 'rising'] as Command[])[action++ % 4]];
      }
    } else input.x = p.x < (waves[s.wave]?.trigger ?? 3600) + 5 ? 1 : 0;
    s.step(1 / 60, input);
    s.drainEvents();
  }
  expect({ status: s.status, wave: s.wave, hp: s.player.hp, kills: s.kills }).toEqual(
    expect.objectContaining({ status: 'clear', wave: 4, kills: 13 }),
  );
});
