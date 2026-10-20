import { stageDepth } from '../../data/environment';
import { clamp, WORLD, JUGGLE } from '../config/constants';
import { setState } from '../entities/stateMachine';
import type { Actor, Position } from '../entities/types';
export const project = (p: Position) => ({ x: p.x, y: p.y - p.z });
export function integrate(
  a: Actor,
  dt: number,
  bounds: [number, number] = [24, WORLD.length - 24],
) {
  a.stateTime += dt;
  a.rollCooldown = Math.max(0, a.rollCooldown - dt);
  if (a.state === 'Roll') {
    if (a.stateTime < 0.4) {
      a.x = clamp(a.x + a.rollDirection.x * 320 * dt, bounds[0], bounds[1]);
      a.y = clamp(a.y + a.rollDirection.y * 220 * dt, ...stageDepth(a.x));
    }
    if (a.stateTime >= 0.5) setState(a, 'Idle');
  }
  if (a.state === 'Switch' && a.stateTime >= 0.4) {
    a.weapon = a.weapon === 'bow' ? 'sword' : 'bow';
    setState(a, 'Idle');
  }
  if (a.stopTime !== undefined) {
    a.stopTime += dt;
    if (a.stopTime >= 0.3) a.stopTime = undefined;
  }
  a.invulnerable = Math.max(0, a.invulnerable - dt);
  a.x = clamp(a.x + a.vx * dt, bounds[0], bounds[1]);
  a.y = clamp(a.y + a.vy * dt, ...stageDepth(a.x));
  a.vx *= Math.exp(-10 * dt);
  a.vy *= Math.exp(-10 * dt);
  let landed = false;
  if (a.z > 0 || a.vz > 0) {
    a.vz -= WORLD.gravity * dt;
    a.z += a.vz * dt;
    if (a.vz < 0 && a.state === 'Jump') setState(a, 'Fall');
    if (a.z <= 0) {
      a.z = 0;
      a.vz = 0;
      landed = true;
      a.airAttackUsed = false;
      if (a.state === 'Fall' || a.state === 'Jump') setState(a, 'Land');
    }
  }
  if (a.state === 'Land' && a.stateTime > 0.1) setState(a, 'Idle');
  if (
    a.state === 'Hit' &&
    a.stateTime > (a.kind === 'boss' ? 0.13 : a.kind === 'player' ? 0.3 : 0.18)
  )
    setState(a, a.z > 0 ? 'Fall' : 'Idle');
  if (a.state === 'Knockdown' && a.z === 0 && a.vz <= 0) {
    a.juggle.groundedTime += dt;
    if (a.juggle.groundedTime >= JUGGLE.groundDownTime) setState(a, 'Recovery');
  }
  if (a.state === 'Recovery' && a.stateTime > 0.35) {
    setState(a, 'Idle');
    a.invulnerable = Math.max(a.invulnerable, JUGGLE.wakeProtection);
    a.juggle = { active: false, launches: 0, airHits: 0, forced: false, groundedTime: 0 };
  }
  return landed;
}
export class FixedClock {
  private accumulator = 0;
  advance(delta: number, step: (dt: number) => void) {
    this.accumulator += Math.min(delta, 0.1);
    while (this.accumulator + 1e-9 >= WORLD.step) {
      step(WORLD.step);
      this.accumulator -= WORLD.step;
    }
  }
  reset() {
    this.accumulator = 0;
  }
}
