import { eiraHand } from './eira';
import swordV2 from '../../../public/assets/weapons/oathblade-v2.json';
export const SWORD_V2 = swordV2;
import type { Actor, State } from '../entities/types';
export const SWORD = { width: 52, height: 12, gripX: 8, gripY: 6, bladeLength: 39 } as const;
export const animationFrames: Record<State, number> = {
  Roll: 0,
  Switch: 0,
  Idle: 4,
  Walk: 6,
  Run: 6,
  Jump: 4,
  Fall: 4,
  Land: 4,
  Attack: 4,
  Kick: 4,
  RisingSlash: 5,
  Hit: 3,
  Knockdown: 4,
  Recovery: 4,
  Guard: 4,
  Death: 4,
};
export function frameFor(a: Actor) {
  return Math.floor(a.stateTime * (a.state === 'Run' ? 14 : 10)) % animationFrames[a.state];
}
export function weaponPose(a: Actor, detailed = a.kind === 'player') {
  const t = a.attack?.elapsed ?? 0;
  const attack = a.attack?.id;
  let rotation = -0.9;
  if (attack === 'slash1' || attack === 'air') rotation = -1.9 + Math.min(t / 0.3, 1) * 3.2;
  if (attack === 'slash2') rotation = 1.6 - Math.min(t / 0.32, 1) * 3.5;
  if (attack === 'rising') rotation = 1.2 - Math.min(t / 0.3, 1) * 3;
  if (a.state === 'Guard') rotation = -1.5;
  const bob = ['Walk', 'Run', 'Idle'].includes(a.state) ? frameFor(a) % 2 : 0;
  if (detailed) {
    const hand = eiraHand(a);
    return {
      x: a.x + hand.x,
      y: a.y - a.z + hand.y,
      rotation: a.facing === 1 ? rotation : Math.PI - rotation,
      gripX: SWORD_V2.pivot[0],
      gripY: SWORD_V2.pivot[1],
      scale: SWORD_V2.displayScale,
    };
  }
  return {
    x: a.x + 21 * a.facing,
    y:
      a.y -
      a.z -
      30 +
      bob * 1.65 +
      (a.state === 'RisingSlash' ? -frameFor(a) * 3.3 : a.state === 'Attack' ? -3.3 : 0),
    rotation: a.facing === 1 ? rotation : Math.PI - rotation,
    gripX: SWORD.gripX,
    gripY: SWORD.gripY,
    scale: 1.65,
  };
}
