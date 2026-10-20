import { describe, expect, it } from 'vitest';
import { createActor } from '../../src/game/entities/actor';
import { sdFrame } from '../../src/game/animation/sd';

describe('approved sword idle continuity', () => {
  it('avoids the low poses over repeated cycles and returns smoothly to the start', () => {
    const actor = createActor(0, 'player', 0, 400);
    const frames = new Set<number>();
    for (let t = 0; t < 9; t += 1 / 60) {
      actor.stateTime = t;
      const pose = sdFrame(actor);
      expect(pose.sheet).toBe('smooth-idle');
      expect(pose.frame).toBeLessThan(8);
      frames.add(pose.frame);
    }
    expect(frames.size).toBe(8);
    actor.stateTime = 2.999;
    expect(sdFrame(actor).frame).toBe(1);
    actor.stateTime = 3;
    expect(sdFrame(actor).frame).toBe(0);
  });
  it('uses approved bow idle timing and authored air attack poses independent of sword idle', () => {
    const actor = createActor(0, 'player', 0, 400);
    actor.weapon = 'bow';
    actor.stateTime = 0.89;
    expect(sdFrame(actor)).toEqual({ sheet: 'smooth-bow', frame: 0 });
    actor.stateTime = 0.9;
    expect(sdFrame(actor)).toEqual({ sheet: 'smooth-bow', frame: 1 });
    actor.weapon = 'sword';
    actor.attack = { id: 'air', elapsed: 0.01, hit: new Set() };
    expect(sdFrame(actor)).toEqual({ sheet: 'smooth-attack', frame: 6 });
  });
});
