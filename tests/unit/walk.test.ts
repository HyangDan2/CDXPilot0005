import { describe, it, expect } from 'vitest';
import { walkFrame, walkDurations } from '../../src/game/animation/walk';
import { sdFrame } from '../../src/game/animation/sd';
import { createActor } from '../../src/game/entities/actor';
describe('grounded walking cadence', () => {
  it('holds contact longer than passing and visits eight poses once per loop', () => {
    expect(walkDurations[0]).toBeGreaterThan(walkDurations[2]);
    let time = 0;
    for (let i = 0; i < 8; i++) {
      expect(walkFrame(time + 0.001)).toBe(i);
      time += walkDurations[i];
    }
    expect(walkFrame(time + 0.001)).toBe(0);
  });
  it('bow walking has eight distinct authored frames, leaving running on its existing sheet', () => {
    const actor = createActor(0, 'player', 0, 400);
    actor.weapon = 'bow';
    actor.state = 'Walk';
    const frames = new Set<number>();
    for (let t = 0; t < 0.72; t += 0.01) {
      actor.stateTime = t;
      const p = sdFrame(actor);
      expect(p.sheet).toBe('smooth-bow-walk');
      frames.add(p.frame);
    }
    expect(frames.size).toBe(8);
    actor.stateTime = 0.23;
    expect(sdFrame(actor).frame).toBe(2); // Feet passing under hips, after the held contact.
    actor.state = 'Run';
    expect(sdFrame(actor).sheet).toBe('smooth-bow');
  });
});
