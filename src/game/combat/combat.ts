import { activeProgress, sampleStrike, strikeTracks, strikePoseProgress } from '../../data/motions';
import { attacks, attackPhase } from '../../data/attacks';
import { PLAYER, JUGGLE } from '../config/constants';
import { isDisabled, setState } from '../entities/stateMachine';
import type { Actor, AttackId, Command } from '../entities/types';
export function hitbox(a: Actor) {
  const id = a.attack?.id ?? 'slash1',
    def = attacks[id];
  let box = def.hitbox;
  const track = strikeTracks[id];
  if (track && a.attack) {
    const now = sampleStrike(
      track,
      strikePoseProgress(id, activeProgress(a.attack.elapsed, def.startupFrames, def.activeFrames)),
    );
    const before = sampleStrike(
      track,
      strikePoseProgress(
        id,
        activeProgress(a.attack.elapsed - 1 / 60, def.startupFrames, def.activeFrames),
      ),
    );
    const left = Math.min(now.offsetX, before.offsetX);
    box = {
      offsetX: left,
      width: Math.max(now.offsetX + now.width, before.offsetX + before.width) - left,
      depth: now.depth,
      minZ: Math.min(now.minZ, before.minZ),
      maxZ: Math.max(now.maxZ, before.maxZ),
    };
    if (a.kind === 'boss') box = { ...box, width: box.width * 1.35, maxZ: box.maxZ * 1.25 };
  }
  return {
    x: a.facing === 1 ? a.x + box.offsetX : a.x - box.offsetX - box.width,
    y: a.y - box.depth,
    width: box.width,
    height: box.depth * 2,
    minZ: a.z + box.minZ,
    maxZ: a.z + box.maxZ,
  };
}
export function canHit(attacker: Actor, target: Actor) {
  if (
    attacker.hp <= 0 ||
    !attacker.attack ||
    attackPhase(attacker.attack.id, attacker.attack.elapsed) !== 'active' ||
    target.hp <= 0 ||
    target.invulnerable > 0 ||
    target.juggle.forced ||
    target.state === 'Recovery' ||
    (target.state === 'Knockdown' && target.z === 0 && target.vz <= 0) ||
    attacker.attack.hit.has(target.id)
  )
    return false;
  const b = hitbox(attacker);
  return (
    target.x + 16 >= b.x &&
    target.x - 16 <= b.x + b.width &&
    Math.abs(target.y - attacker.y) <= b.height / 2 &&
    target.z <= b.maxZ &&
    target.z + (target.kind === 'boss' ? 115 : 95) >= b.minZ
  );
}
export function damageAmount(base: number, guarded: boolean) {
  return Math.max(1, Math.round(base * (guarded ? 0.2 : 1)));
}
export function applyHit(attacker: Actor, target: Actor) {
  if (!canHit(attacker, target) || !attacker.attack) return 0;
  const def = attacks[attacker.attack.id];
  attacker.attack.hit.add(target.id);
  if (attacker.attack.id === 'spin' && !attacker.attack.costPaid) {
    attacker.hp = Math.max(0, attacker.hp - attacker.maxHp * 0.2);
    attacker.attack.costPaid = true;
    if (attacker.hp === 0) setState(attacker, 'Death');
  }
  const armored = target.attack?.id === 'spin';
  const guarded =
    target.state === 'Guard' &&
    (attacker.x - target.x) * target.facing >= 0 &&
    attacker.attack.id !== 'kick' &&
    attacker.attack.id !== 'rising';
  const damage = damageAmount(def.damage, guarded || armored);
  target.hp = Math.max(0, target.hp - damage);
  target.invulnerable = target.kind === 'player' ? PLAYER.invulnerability : 0.09;
  const knockDirection = ['spin', 'slash4'].includes(attacker.attack.id)
    ? target.x >= attacker.x
      ? 1
      : -1
    : attacker.facing;
  target.vx = armored ? 0 : def.knockbackX * knockDirection * (guarded ? 0.2 : 1);
  target.vy = armored ? 0 : def.knockbackY;
  if (armored) {
    if (target.hp === 0) {
      target.attack = null;
      setState(target, 'Death');
    }
    return damage;
  }
  if (!guarded) {
    target.attack = null;
    let launch = def.launchVelocityZ;
    const wasJuggled = target.juggle.active;
    if (target.kind === 'boss') {
      // Heavy enemies stagger but never become airborne from player attacks.
      launch = 0;
    } else {
      if (wasJuggled) target.juggle.airHits++;
      if (launch > 0) {
        target.juggle.active = true;
        target.juggle.launches++;
        if (target.juggle.launches === 2) launch *= JUGGLE.relaunchScale;
      }
      if (target.juggle.launches >= 3 || target.juggle.airHits >= JUGGLE.maxAirHits) {
        target.juggle.forced = true;
        launch = -180;
        target.vx = Math.max(def.knockbackX, 240) * attacker.facing;
      }
    }
    if (launch !== 0) target.vz = launch;
    setState(target, target.hp === 0 ? 'Death' : target.juggle.active ? 'Knockdown' : 'Hit');
  } else if (target.hp === 0) setState(target, 'Death');
  return damage;
}
export function startAttack(a: Actor, id: AttackId, cancel = false) {
  if (isDisabled(a)) return false;
  if (
    id === 'spin' &&
    (a.z !== 0 || !['Idle', 'Walk', 'Run'].includes(a.state) || a.attack || a.hp <= a.maxHp * 0.2)
  )
    return false;
  if (a.kind === 'player' && a.state === 'Guard') return false;
  if (a.attack && !cancel) return false;
  const state = id === 'kick' ? 'Kick' : id === 'rising' ? 'RisingSlash' : 'Attack';
  if (!setState(a, state, cancel)) return false;
  a.stateTime = 0;
  a.attack = { id, elapsed: 0, hit: new Set() };
  return true;
}
export function advanceAttack(a: Actor, dt: number) {
  if (!a.attack) return;
  a.attack.elapsed += dt;
  if (attackPhase(a.attack.id, a.attack.elapsed) === 'done') {
    a.attack = null;
    setState(a, a.z > 0 ? 'Fall' : 'Idle');
  }
}
export function chooseAttack(a: Actor, command: Command): AttackId | null {
  if (command === 'jump') return null;
  if (a.z > 15) return command === 'sword' ? 'air' : null;
  if (command === 'spin') return 'spin';
  if (command === 'rising') return 'rising';
  const next: Partial<Record<AttackId, AttackId>> = {
    slash1: 'slash2',
    slash2: 'slash3',
    slash3: 'slash4',
  };
  return (a.attack && next[a.attack.id]) || 'slash1';
}
export class AttackBuffer {
  private pending: { command: Command; expires: number }[] = [];
  push(commands: Command[], now: number) {
    for (const command of commands)
      if (command !== 'jump' && command !== 'spin')
        if (!this.pending.some((p) => p.expires >= now))
          this.pending = [{ command, expires: now + PLAYER.bufferSeconds }];
    this.pending = this.pending.slice(-4);
  }
  consume(a: Actor, now: number): AttackId | null {
    this.pending = this.pending.filter((p) => p.expires >= now);
    if (a.state === 'Guard' || isDisabled(a)) {
      this.clear();
      return null;
    }
    const command = this.pending[0]?.command;
    if (!command) return null;
    const id = chooseAttack(a, command);
    if (!id) return null;
    let cancel = false;
    if (a.attack) {
      const def = attacks[a.attack.id];
      cancel =
        a.attack.elapsed * 60 >= def.startupFrames + def.activeFrames + 6 &&
        def.cancelInto.includes(id);
      if (!cancel) return null;
    }
    if (!startAttack(a, id, cancel)) return null;
    this.pending.shift();
    return id;
  }
  clear() {
    this.pending = [];
  }
}
