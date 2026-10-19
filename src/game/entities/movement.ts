import { PLAYER, WORLD, clamp } from '../config/constants';
import { isDisabled, setState } from './stateMachine';
import type { Actor, Input } from './types';
export function movePlayer(
  a: Actor,
  input: Input,
  dt: number,
  bounds: [number, number] = [24, WORLD.length - 24],
) {
  if (input.x || input.y || input.guard || input.commands.length || a.attack || isDisabled(a))
    a.stopTime = undefined;
  if (isDisabled(a) || a.attack) return;
  if (
    a.state === 'Run' &&
    !input.x &&
    !input.y &&
    !input.guard &&
    !input.commands.length &&
    a.z === 0
  )
    a.stopTime = 0;
  if (input.guard && a.z === 0) {
    setState(a, 'Guard');
    const length = Math.hypot(input.x, input.y) || 1;
    a.x = clamp(a.x + (input.x / length) * PLAYER.speed * 0.25 * dt, bounds[0], bounds[1]);
    a.y = clamp(a.y + (input.y / length) * PLAYER.speed * 0.2 * dt, WORLD.minY, WORLD.maxY);
    return;
  }
  if (a.state === 'Guard' && a.stateTime < 0.1) return;
  if (input.commands.includes('jump') && a.z === 0 && a.state !== 'Land') {
    a.vz = PLAYER.jump;
    setState(a, 'Jump');
  }
  const magnitude = Math.hypot(input.x, input.y) || 1;
  const speed = input.dash && a.z === 0 ? PLAYER.dashSpeed : PLAYER.speed;
  a.x = clamp(a.x + (input.x / magnitude) * speed * dt, bounds[0], bounds[1]);
  a.y = clamp(a.y + (input.y / magnitude) * speed * 0.65 * dt, WORLD.minY, WORLD.maxY);
  if (input.x) a.facing = input.x > 0 ? 1 : -1;
  if (a.z === 0 && a.vz === 0 && a.state !== 'Land')
    setState(a, input.x || input.y ? (input.dash ? 'Run' : 'Walk') : 'Idle');
}
