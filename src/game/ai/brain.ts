import { attackPhase } from '../../data/attacks';
import { startAttack } from '../combat/combat';
import { clamp, WORLD } from '../config/constants';
import { isDisabled, setState } from '../entities/stateMachine';
import type { Actor, AttackId, AIState } from '../entities/types';
function enter(a: Actor, state: AIState) {
  a.ai = state;
  a.aiTime = 0;
}
export function updateAI(
  a: Actor,
  player: Actor,
  dt: number,
  mayAttack = true,
  crowd: readonly Actor[] = [],
): AttackId | null {
  a.aiTime += dt;
  if (a.hp <= 0) {
    a.ai = 'Death';
    return null;
  }
  if (isDisabled(a)) {
    a.ai = a.state === 'Knockdown' ? 'Down' : 'Hit';
    a.aiTime = 0;
    return null;
  }
  const enraged = a.kind === 'boss' && a.hp <= a.maxHp / 2;
  const dx = player.x - a.x,
    dy = player.y - a.y;
  // Once the tell starts, facing and depth are committed. No input-reading homing.
  if (a.attack) {
    a.ai = 'Attack';
    const phase = attackPhase(a.attack.id, a.attack.elapsed);
    if (a.attack.id === 'charge' && phase === 'active')
      a.x += a.facing * (a.kind === 'boss' ? (enraged ? 570 : 480) : 430) * dt;
    if (a.attack.id === 'slam' && phase === 'startup')
      a.z = Math.sin((a.attack.elapsed / (44 / 60)) * Math.PI) * 110;
    if (a.attack.id === 'slam' && phase !== 'startup') {
      a.z = 0;
      a.vz = 0;
    }
    return null;
  }
  if (a.ai === 'Attack') {
    if (a.state === 'Guard' && a.aiTime < 0.32) {
      a.x += a.facing * 38 * dt;
      return null;
    }
    if (a.state === 'Guard') {
      startAttack(a, 'enemy');
      return 'enemy';
    }
    enter(a, 'Recover');
    return null;
  }
  if (a.ai === 'Recover') {
    const chain = a.kind === 'boss' && a.pattern % (enraged ? 7 : 5) < 3;
    const delay = chain
      ? 0.1
      : a.kind === 'boss'
        ? enraged
          ? 0.2
          : 0.3
        : a.kind === 'rusher'
          ? 0.34
          : 0.24;
    if (a.aiTime < delay) {
      setState(a, 'Idle');
      return null;
    }
    enter(a, chain ? 'Chase' : 'Retreat');
  }
  if (a.ai === 'Retreat') {
    if (a.aiTime < 0.28) {
      a.x -= a.facing * 125 * dt;
      a.y = clamp(a.y + (a.id % 2 ? 1 : -1) * 65 * dt, WORLD.minY, WORLD.maxY);
      setState(a, 'Run');
      return null;
    }
    enter(a, 'Chase');
  }
  if (a.ai === 'Idle') {
    if (a.aiTime < 0.12) return null;
    enter(a, a.id % 3 === 0 && a.kind !== 'boss' ? 'Flank' : 'Chase');
  }
  if (a.ai === 'Hit' || a.ai === 'Down') enter(a, 'Chase');
  a.facing = dx >= 0 ? 1 : -1;
  const pattern: AttackId[] = enraged
    ? ['enemy', 'enemy', 'enemy', 'charge', 'slam', 'charge', 'slam']
    : ['enemy', 'enemy', 'enemy', 'charge', 'slam'];
  const attackId: AttackId =
    a.kind === 'boss'
      ? pattern[a.pattern % pattern.length]
      : a.kind === 'rusher'
        ? 'charge'
        : 'enemy';
  const range = attackId === 'charge' ? 245 : attackId === 'slam' ? 170 : 62;
  if (
    a.ai !== 'Flank' &&
    Math.abs(dx) <= range &&
    Math.abs(dy) < 22 &&
    mayAttack &&
    player.hp > 0
  ) {
    enter(a, 'Attack');
    a.pattern++;
    if (a.kind === 'guard') {
      setState(a, 'Guard');
      return null;
    }
    startAttack(a, attackId);
    return attackId;
  }
  if (!mayAttack && a.ai === 'Chase' && Math.abs(dx) < 180) enter(a, 'Flank');
  if (a.ai === 'Flank' && a.aiTime > 0.48) enter(a, 'Chase');
  const flanking = a.ai === 'Flank';
  const targetX = flanking ? player.x + (a.id % 2 ? 92 : -92) : player.x;
  const targetY = flanking
    ? clamp(player.y + (a.id % 2 ? 42 : -42), WORLD.minY + 6, WORLD.maxY - 6)
    : player.y;
  const tx = targetX - a.x,
    ty = targetY - a.y,
    distance = Math.hypot(tx, ty) || 1;
  const burst = a.kind === 'grunt' && Math.abs(dx) > 110 && a.aiTime < 0.45;
  const speed =
    (a.kind === 'rusher'
      ? 210
      : a.kind === 'boss'
        ? 170
        : a.kind === 'guard'
          ? 135
          : burst
            ? 245
            : 158) * (enraged ? 1.3 : 1);
  if (Math.abs(tx) > (flanking ? 10 : 42)) a.x += (tx / distance) * speed * dt;
  if (Math.abs(ty) > 5) a.y += (ty / distance) * speed * 0.85 * dt;
  // Soft separation only during locomotion, never during committed attacks.
  for (const other of crowd) {
    if (other.id === a.id || other.hp <= 0) continue;
    const sx = a.x - other.x,
      sy = a.y - other.y;
    const d = Math.hypot(sx, sy);
    if (d < 38) {
      const sign = a.id > other.id ? 1 : -1;
      a.x += (d ? sx / d : sign) * 45 * dt;
      a.y += (d ? sy / d : sign) * 30 * dt;
    }
  }
  setState(a, burst || a.kind === 'rusher' ? 'Run' : 'Walk');
  return null;
}
