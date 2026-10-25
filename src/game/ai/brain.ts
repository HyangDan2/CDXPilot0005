import { depthProfile, stageDepth } from '../../data/environment';
import { bossPhaseRules } from '../../data/bossPhase';
import { flyerRules, mageRules } from '../../data/enemies';
import { routeTarget, firstArrowBlocker, meleeOccluded, type Solid } from '../physics/obstacles';
import { attackPhase } from '../../data/attacks';
import { startAttack } from '../combat/combat';
import { clamp } from '../config/constants';
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
  solids: readonly Solid[] = [],
): AttackId | null {
  a.aiTime += dt * (a.kind === 'boss' && a.bossPhase === 2 ? bossPhaseRules.speedMultiplier : 1);
  if (a.hp <= 0) {
    a.ai = 'Death';
    return null;
  }
  if (isDisabled(a)) {
    a.ai = a.state === 'Knockdown' ? 'Down' : 'Hit';
    a.aiTime = 0;
    return null;
  }
  if (
    a.kind === 'boss' &&
    a.bossPhase === 1 &&
    a.hp <= a.maxHp * bossPhaseRules.transitionHealthFraction &&
    !a.attack
  ) {
    a.bossPhase = 2;
    a.phaseTransition = bossPhaseRules.transitionDuration;
    enter(a, 'Idle');
  }
  if (a.kind === 'boss' && a.phaseTransition > 0) {
    a.phaseTransition = Math.max(0, a.phaseTransition - dt);
    setState(a, 'Idle');
    return null;
  }
  const enraged = a.kind === 'boss' && a.bossPhase === 2;
  const dx = player.x - a.x,
    dy = player.y - a.y;
  // Once the tell starts, facing and depth are committed. No input-reading homing.
  if (a.attack) {
    a.ai = 'Attack';
    const phase = attackPhase(a.attack.id, a.attack.elapsed);
    if (a.kind === 'flyer' && a.attack.id === 'dive') {
      if (phase === 'startup') a.z = flyerRules.altitude;
      if (phase === 'active' && a.attackTarget) {
        const tx = a.attackTarget.x - a.x;
        const ty = a.attackTarget.y - a.y;
        const distance = Math.hypot(tx, ty) || 1;
        const step = Math.min(distance, flyerRules.diveSpeed * dt);
        a.x += (tx / distance) * step;
        a.y += (ty / distance) * step;
        a.z = Math.max(0, a.z - flyerRules.diveDescentSpeed * dt);
      }
      if (phase === 'recovery') a.z = 0;
    }
    if (a.attack.id === 'charge' && phase === 'active')
      a.x +=
        a.facing *
        (a.kind === 'boss' ? 480 * (enraged ? bossPhaseRules.speedMultiplier : 1) : 430) *
        dt;
    if (a.attack.id === 'slam' && phase === 'startup')
      a.z = Math.sin((a.attack.elapsed / (44 / 60)) * Math.PI) * 110;
    if (a.attack.id === 'slam' && phase !== 'startup') {
      a.z = 0;
      a.vz = 0;
    }
    return null;
  }
  if (a.kind === 'flyer') {
    if (a.flightRecovery > 0 && !isDisabled(a)) {
      a.flightRecovery = Math.max(0, a.flightRecovery - dt);
      a.z = flyerRules.altitude * (1 - a.flightRecovery / flyerRules.takeoffDuration);
      a.ai = 'Recover';
      setState(a, 'Run');
      return null;
    }
    if (a.ai === 'Attack') {
      a.z = 0;
      enter(a, 'Recover');
      return null;
    }
    if (a.ai === 'Recover') {
      a.z = 0;
      if (a.aiTime < flyerRules.diveRecovery) return null;
      a.flightRadius = flyerRules.orbitRadius;
      enter(a, 'Chase');
    }
    const anotherDiving = crowd.some(
      (other) => other.id !== a.id && other.kind === 'flyer' && other.attack?.id === 'dive',
    );
    if (a.aiTime >= flyerRules.diveDelay && mayAttack && !anotherDiving && player.hp > 0) {
      a.facing = dx >= 0 ? 1 : -1;
      a.attackTarget = { x: player.x, y: player.y };
      a.z = flyerRules.altitude;
      enter(a, 'Attack');
      startAttack(a, 'dive');
      return 'dive';
    }
    const direction = a.id % 2 === 0 ? 1 : -1;
    a.flightAngle += direction * flyerRules.orbitSpeed * dt;
    a.flightRadius = Math.max(
      flyerRules.minimumRadius,
      a.flightRadius - flyerRules.radiusContraction * dt,
    );
    const destination = {
      x: clamp(
        player.x + Math.cos(a.flightAngle) * a.flightRadius,
        24,
        depthProfile[depthProfile.length - 1].x - 24,
      ),
      y: clamp(
        player.y +
          Math.sin(a.flightAngle) *
            Math.min(flyerRules.maxDepthOffset, a.flightRadius * flyerRules.orbitDepthScale),
        ...stageDepth(player.x),
      ),
    };
    const waypoint = routeTarget(
      a,
      destination,
      solids.filter((solid) => solid.height >= 100),
    );
    const tx = waypoint.x - a.x;
    const ty = waypoint.y - a.y;
    const distance = Math.hypot(tx, ty) || 1;
    const step = Math.min(distance, flyerRules.moveSpeed * dt);
    a.x += (tx / distance) * step;
    a.y += (ty / distance) * step;
    a.z = flyerRules.altitude + Math.sin(a.flightAngle * 2) * flyerRules.bob;
    a.facing = dx >= 0 ? 1 : -1;
    a.ai = 'Chase';
    setState(a, 'Run');
    return null;
  }
  if (a.kind === 'mage') {
    a.spellCooldown = Math.max(0, a.spellCooldown - dt);
    if (a.ai === 'Attack') {
      enter(a, 'Recover');
      a.fleeTime = mageRules.retreatTime;
      return null;
    }
    if (a.ai === 'Recover') {
      if (a.aiTime < mageRules.recovery) return null;
      enter(a, 'Chase');
    }
    const distance = Math.hypot(dx, dy);
    if (
      distance < mageRules.castRangeMax &&
      distance > mageRules.castRangeMin &&
      a.spellCooldown <= 0 &&
      mayAttack &&
      player.hp > 0
    ) {
      a.facing = dx >= 0 ? 1 : -1;
      a.attackTarget = { x: player.x, y: player.y };
      a.spellCooldown = mageRules.cooldown;
      enter(a, 'Attack');
      startAttack(a, 'spell');
      return 'spell';
    }
    if (distance < 300 && a.fleeTime > 0) {
      a.fleeTime = Math.max(0, a.fleeTime - dt);
      const sign = dx >= 0 ? -1 : 1;
      const bounds = stageDepth(a.x);
      const destination = routeTarget(
        a,
        { x: a.x + sign * 180, y: clamp(a.y + (dy >= 0 ? -80 : 80), bounds[0] + 8, bounds[1] - 8) },
        solids,
      );
      const length = Math.hypot(destination.x - a.x, destination.y - a.y) || 1;
      a.x += ((destination.x - a.x) / length) * Math.min(length, mageRules.retreatSpeed * dt);
      a.y += ((destination.y - a.y) / length) * Math.min(length, mageRules.retreatDepthSpeed * dt);
    } else if (distance > 520) {
      a.x += clamp(dx, -mageRules.approachSpeed * dt, mageRules.approachSpeed * dt);
      a.y += clamp(dy, -70 * dt, 70 * dt);
    }
    a.facing = dx >= 0 ? 1 : -1;
    a.ai = distance < 300 ? 'Retreat' : 'Chase';
    setState(a, distance < 300 ? 'Run' : 'Walk');
    return null;
  }
  if (a.kind === 'archer') {
    const target = routeTarget(a, player, solids);
    const detouring = target !== player;
    a.facing = dx >= 0 ? 1 : -1;
    if (a.ai === 'Attack') {
      enter(a, 'Recover');
      return null;
    }
    if (a.ai === 'Recover' && a.aiTime < 0.55) {
      setState(a, 'Idle');
      return null;
    }
    if (a.ai === 'Recover') enter(a, Math.abs(dx) < 130 ? 'Retreat' : 'Chase');
    if (a.ai === 'Retreat' && a.aiTime < 0.55) {
      a.x -= a.facing * 105 * dt;
      setState(a, 'Walk');
      return null;
    }
    const clearLane = !firstArrowBlocker(a.x + a.facing * 24, player.x, a.y, a.z + 50, solids);
    // Walking needs extra clearance; a clear arrow lane can open before the detour ends.
    if (detouring && a.ai !== 'Flank') enter(a, 'Flank');
    if (a.ai === 'Flank' && clearLane && Math.abs(dy) <= 8) enter(a, 'Chase');
    if (
      Math.abs(dx) <= 380 &&
      Math.abs(dy) < 16 &&
      clearLane &&
      a.ai !== 'Flank' &&
      mayAttack &&
      player.hp > 0
    ) {
      enter(a, 'Attack');
      startAttack(a, 'enemyShot');
      return 'enemyShot';
    }
    const alignment = { x: a.x, y: player.y };
    const alignmentBlocked = routeTarget(a, alignment, solids) !== alignment;
    if (detouring || alignmentBlocked || Math.abs(dx) > 300)
      a.x += clamp(target.x - a.x, -100 * dt, 100 * dt);
    if (detouring || Math.abs(dy) > 8) a.y += clamp(target.y - a.y, -70 * dt, 70 * dt);
    setState(a, 'Walk');
    return null;
  }
  if (a.ai === 'Attack') {
    if (a.state === 'Guard' && a.aiTime < 0.32) {
      a.x += a.facing * 38 * dt;
      return null;
    }
    if (a.state === 'Guard') {
      startAttack(a, 'heavy');
      return 'heavy';
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
      a.x -= a.facing * (a.kind === 'guard' ? 65 : 125) * dt;
      a.y = clamp(a.y + (a.id % 2 ? 1 : -1) * 65 * dt, ...stageDepth(a.x));
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
        ? 'dagger'
        : a.kind === 'guard'
          ? 'heavy'
          : 'enemy';
  const range =
    attackId === 'charge'
      ? 245
      : attackId === 'slam'
        ? 170
        : attackId === 'dagger'
          ? 44
          : attackId === 'heavy'
            ? 78
            : 62;
  if (
    a.ai !== 'Flank' &&
    !meleeOccluded(a, player, solids) &&
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
    startAttack(
      a,
      attackId,
      false,
      enraged && a.kind === 'boss' ? bossPhaseRules.speedMultiplier : 1,
    );
    return attackId;
  }
  if (!mayAttack && a.ai === 'Chase' && Math.abs(dx) < 180) enter(a, 'Flank');
  if (a.ai === 'Flank' && a.aiTime > 0.48) enter(a, 'Chase');
  const flanking = a.ai === 'Flank';
  const targetX = flanking ? player.x + (a.id % 2 ? 92 : -92) : player.x;
  const targetY = flanking
    ? clamp(player.y + (a.id % 2 ? 42 : -42), stageDepth(a.x)[0] + 6, stageDepth(a.x)[1] - 6)
    : player.y;
  const destination = { x: targetX, y: targetY };
  const target = routeTarget(a, destination, solids);
  const detouring = target !== destination;
  const tx = target.x - a.x,
    ty = target.y - a.y,
    distance = Math.hypot(tx, ty) || 1;
  const burst = a.kind === 'grunt' && Math.abs(dx) > 110 && a.aiTime < 0.45;
  const speed =
    (a.kind === 'rusher'
      ? 210
      : a.kind === 'boss'
        ? 170
        : a.kind === 'guard'
          ? 82
          : burst
            ? 245
            : 158) * (enraged ? bossPhaseRules.speedMultiplier : 1);
  if (detouring) {
    const step = Math.min(speed * dt, distance);
    a.x += (tx / distance) * step;
    a.y += (ty / distance) * step;
  } else {
    if (Math.abs(tx) > (flanking ? 10 : 42)) a.x += (tx / distance) * speed * dt;
    if (Math.abs(ty) > 5) a.y += (ty / distance) * speed * 0.85 * dt;
  }
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
