import { PLAYER } from '../config/constants';
import type { Actor, Kind } from './types';
const health = { player: PLAYER.hp, grunt: 62, rusher: 48, guard: 90, boss: 640 };
export function createActor(id: number, kind: Kind, x: number, y: number): Actor {
  return {
    id,
    kind,
    x,
    y,
    z: 0,
    hp: health[kind],
    maxHp: health[kind],
    facing: kind === 'player' ? 1 : -1,
    state: 'Idle',
    stateTime: 0,
    vz: 0,
    vx: 0,
    vy: 0,
    invulnerable: 0,
    attack: null,
    ai: 'Idle',
    aiTime: 0,
    pattern: 0,
    spawnX: x,
    juggle: { active: false, launches: 0, airHits: 0, forced: false, groundedTime: 0 },
  };
}
