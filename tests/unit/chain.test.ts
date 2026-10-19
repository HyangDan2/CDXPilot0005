import { expect, it } from 'vitest';
import { attacks } from '../../src/data/attacks';
import {
  AttackBuffer,
  applyHit,
  canHit,
  startAttack,
  advanceAttack,
} from '../../src/game/combat/combat';
import { createActor } from '../../src/game/entities/actor';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput, type AttackId } from '../../src/game/entities/types';
const chain: AttackId[] = ['slash1', 'slash2', 'slash3', 'slash4'];
it('chains exactly four strikes with full windups and increasing damage', () => {
  const a = createActor(0, 'player', 100, 400),
    q = new AttackBuffer();
  q.push(['sword'], 0);
  expect(q.consume(a, 0)).toBe('slash1');
  for (let i = 0; i < 4; i++) {
    const d = attacks[chain[i]];
    expect(d.startupFrames).toBeGreaterThanOrEqual(10);
    if (i) expect(d.damage).toBeGreaterThan(attacks[chain[i - 1]].damage);
    a.attack!.elapsed = (d.startupFrames + d.activeFrames) / 60;
    q.push(['sword', 'sword', 'sword'], i + 1);
    expect(q.consume(a, i + 1)).toBeNull();
    a.attack!.elapsed = (d.startupFrames + d.activeFrames + 6) / 60;
    expect(q.consume(a, i + 1.1)).toBe(i === 3 ? null : chain[i + 1]);
    if (i < 3) {
      expect(a.attack!.elapsed).toBe(0);
      expect(q.consume(a, i + 1.11)).toBeNull();
    }
  }
  advanceAttack(a, 1);
  q.push(['sword'], 10);
  expect(q.consume(a, 10)).toBe('slash1');
});
it.each(chain)('%s is vulnerable before contact and cannot hit twice', (id) => {
  const a = createActor(0, 'player', 100, 400),
    b = createActor(1, 'grunt', 145, 400);
  startAttack(a, id);
  expect(canHit(a, b)).toBe(false);
  a.attack!.elapsed = (attacks[id].startupFrames + attacks[id].activeFrames * 0.8) / 60;
  expect(applyHit(a, b)).toBe(attacks[id].damage);
  b.invulnerable = 0;
  expect(applyHit(a, b)).toBe(0);
  expect(b.vz).toBe(0);
});
it.each(chain)(
  'receiving damage during %s clears queued continuation and restarts at one',
  (id) => {
    const s = new Simulation();
    s.active = true;
    s.player.x = 100;
    const e = createActor(1, 'grunt', 140, s.player.y);
    e.facing = -1;
    s.enemies = [e];
    startAttack(s.player, id);
    startAttack(e, 'enemy');
    e.attack!.elapsed = attacks.enemy.startupFrames / 60;
    s.step(1 / 60, { ...emptyInput(), commands: ['sword'] });
    expect(s.player.state).toBe('Hit');
    expect(s.player.attack).toBeNull();
    e.hp = 0;
    for (let i = 0; i < 40; i++) s.step(1 / 60, emptyInput());
    expect(s.player.attack).toBeNull();
    s.step(1 / 60, { ...emptyInput(), commands: ['sword'] });
    expect(s.player.attack?.id).toBe('slash1');
  },
);
