import { attacks } from '../../data/attacks';
import { magicBoltRules } from '../../data/enemies';
import { crosses, type Solid } from '../physics/obstacles';
import { setState } from './stateMachine';
import type { Actor } from './types';

export interface MagicBolt {
  id: number;
  owner: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  age: number;
  homing: boolean;
}

export function advanceMagic(
  bolts: MagicBolt[],
  player: Actor,
  solids: readonly Solid[],
  dt: number,
  damagePlayer: (damage: number) => void,
): MagicBolt[] {
  return bolts.filter((bolt) => {
    const before = { x: bolt.x, y: bolt.y };
    bolt.age += dt;
    if (bolt.homing && player.state === 'Roll' && player.stateTime >= 0.1 && player.stateTime < 0.3)
      bolt.homing = false;
    if (bolt.homing) {
      const dx = player.x - bolt.x;
      const dy = player.y - bolt.y;
      const desired = Math.atan2(dy, dx);
      const current = Math.atan2(bolt.vy, bolt.vx);
      const delta = Math.atan2(Math.sin(desired - current), Math.cos(desired - current));
      const angle =
        current +
        Math.max(-magicBoltRules.turnRate * dt, Math.min(magicBoltRules.turnRate * dt, delta));
      const speed = magicBoltRules.speed;
      bolt.vx = Math.cos(angle) * speed;
      bolt.vy = Math.sin(angle) * speed;
    }
    bolt.x += bolt.vx * dt;
    bolt.y += bolt.vy * dt;
    if (bolt.age > magicBoltRules.lifetime || bolt.x < 24 || bolt.x > 10800) return false;
    if (solids.some((solid) => solid.height >= bolt.z && crosses(before, bolt, solid)))
      return false;
    if (
      player.hp > 0 &&
      Math.abs(player.x - bolt.x) < magicBoltRules.radius &&
      Math.abs(player.y - bolt.y) < magicBoltRules.radius &&
      player.z < bolt.z + 65
    ) {
      if (player.state === 'Roll' && player.stateTime >= 0.1 && player.stateTime < 0.3) {
        bolt.homing = false;
        return true;
      }
      if (player.invulnerable <= 0) {
        const damage = Math.min(player.hp, attacks.spell.damage);
        player.hp -= damage;
        setState(player, player.hp === 0 ? 'Death' : 'Hit');
        player.invulnerable = 0.35;
        damagePlayer(damage);
      }
      return false;
    }
    return true;
  });
}
