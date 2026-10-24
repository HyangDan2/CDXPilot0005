import { PLAYER } from '../config/constants';
import { mageRules } from '../../data/enemies';
import type { Actor, Kind } from './types';
const health = {
  player: PLAYER.hp,
  grunt: 62,
  rusher: 48,
  guard: 120,
  archer: 42,
  boss: 640,
  flyer: 54,
  mage: 48,
};
export function createActor(id: number, kind: Kind, x: number, y: number): Actor {
  return {
    weapon: kind === 'archer' ? 'bow' : 'sword',
    rollCooldown: 0,
    rollDirection: { x: 0, y: 0 },
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
    airAttackUsed: false,
    ai: 'Idle',
    aiTime: 0,
    pattern: 0,
    bossPhase: 1,
    phaseTransition: 0,
    flightAngle: (id % 6) * (Math.PI / 3),
    flightRadius: 240,
    spellCooldown: mageRules.cooldown * 0.375,
    fleeTime: 0,
    attackTarget: null,
    runMomentum: { x: 0, y: 0 },
    spawnX: x,
    juggle: { active: false, launches: 0, airHits: 0, forced: false, groundedTime: 0 },
  };
}
