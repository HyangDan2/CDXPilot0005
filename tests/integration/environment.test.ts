import { describe, expect, it } from 'vitest';
import { Simulation } from '../../src/game/entities/simulation';
import { createActor } from '../../src/game/entities/actor';
import { emptyInput } from '../../src/game/entities/types';
import { flameTiming } from '../../src/data/environment';

const dt = 1 / 60;
function courtyard() {
  const s = new Simulation(42);
  s.active = true;
  s.player.x = 600;
  s.player.y = 411;
  const enemy = createActor(100, 'guard', 900, 470);
  enemy.aiTime = -1000;
  s.enemies = [enemy];
  return s;
}
describe('environment in the 60Hz simulation', () => {
  it('lets real commands reach the widened depth, blocks rolls, breaks the wall and opens passage', () => {
    const s = courtyard();
    for (let i = 0; i < 90; i++) s.step(dt, { ...emptyInput(), y: -1 });
    expect(s.player.y).toBe(330);
    for (let i = 0; i < 40; i++) s.step(dt, { ...emptyInput(), y: 1 });
    s.player.y = 411;
    s.step(dt, { ...emptyInput(), x: 1, commands: ['roll'] });
    for (let i = 0; i < 40; i++) s.step(dt, { ...emptyInput(), x: 1 });
    expect(s.player.x).toBeLessThanOrEqual(634);
    const maxHealth = s.player.hp;
    for (let i = 0; i < 360 && s.environment.barricades[0].hp > 0; i++) {
      s.step(dt, { ...emptyInput(), commands: i % 45 === 0 ? ['sword'] : [] });
    }
    expect(s.environment.barricades[0].hp).toBe(0);
    expect(s.player.hp).toBe(maxHealth);
    for (let i = 0; i < 120; i++) s.step(dt, { ...emptyInput(), x: 1 });
    expect(s.player.x).toBeGreaterThan(720);
  });
  it('burns and kills an enemy once, awards a kill, and unlocks the next encounter', () => {
    const s = courtyard();
    const enemy = createActor(100, 'grunt', 815, 365);
    enemy.hp = 12;
    enemy.aiTime = -1000;
    s.enemies = [enemy];
    s.environment.time = flameTiming.rest + flameTiming.warning + 0.1;
    s.step(dt, emptyInput());
    expect(enemy.hp).toBe(0);
    expect(enemy.state).toBe('Death');
    expect(s.kills).toBe(1);
    expect(s.score).toBe(200);
    expect(s.wave).toBe(1);
    expect(s.active).toBe(false);
    s.step(dt, emptyInput());
    expect(s.kills).toBe(1);
    s.player.x = 1180;
    s.step(dt, emptyInput());
    expect(s.active).toBe(true);
    expect(s.enemies).toHaveLength(4);
  });
  it('ends the run when floor fire exhausts player health', () => {
    const s = courtyard();
    s.player.x = 815;
    s.player.y = 365;
    s.player.hp = 12;
    s.environment.time = flameTiming.rest + flameTiming.warning + 0.1;
    s.step(dt, emptyInput());
    expect(s.player.hp).toBe(0);
    expect(s.player.state).toBe('Death');
    expect(s.status).toBe('over');
  });
  it('freezes environment after game over and resets all state on a new run', () => {
    const s = courtyard();
    s.environment.barricades[0].hp = 0;
    s.status = 'over';
    const time = s.environment.time;
    s.step(dt, emptyInput());
    expect(s.environment.time).toBe(time);
    const fresh = new Simulation();
    expect(fresh.environment.barricades[0].hp).toBe(64);
    expect(fresh.environment.time).toBe(0);
  });
  it('produces identical environmental outcomes from the same inputs and seed', () => {
    const a = courtyard(),
      b = courtyard();
    for (let i = 0; i < 600; i++)
      for (const s of [a, b]) {
        s.step(dt, { ...emptyInput(), x: i < 20 ? 1 : 0, commands: i % 45 === 0 ? ['sword'] : [] });
      }
    expect(a.environment).toEqual(b.environment);
    expect(a.player).toEqual(b.player);
    expect(a.enemies).toEqual(b.enemies);
    expect(a.drainEvents()).toEqual(b.drainEvents());
  });
});
