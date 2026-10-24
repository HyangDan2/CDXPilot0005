import { StageEnvironment } from './environment';
import { collideSolids, meleeOccluded } from '../physics/obstacles';
import { stageDepth } from '../../data/environment';
import { Reinforcements } from './reinforcements';
import { attacks, attackPhase } from '../../data/attacks';
import { advanceArrows, type Arrow } from './projectiles';
import { advanceMagic, type MagicBolt } from './magic';
import { rollLoot, collectLoot, type Loot } from './loot';
import { stages, type StageId } from '../../data/stages';
import { seededRandom } from '../../utils/random';
import { magicBoltRules, monasteryRules } from '../../data/enemies';
import { bowReleaseAnchor, bowReleaseOffset } from '../../data/projectiles';
import { updateAI } from '../ai/brain';
import { advanceAttack, applyHit, AttackBuffer, startAttack } from '../combat/combat';
import { clamp } from '../config/constants';
import { integrate } from '../physics/world';
import { createActor } from './actor';
import { movePlayer } from './movement';
import type { Actor, GameEvent, Input } from './types';
export class Simulation {
  player = createActor(0, 'player', 210, 408);
  enemies: Actor[] = [];
  events: GameEvent[] = [];
  wave = 0;
  active = false;
  status: 'playing' | 'over' | 'clear' = 'playing';
  time = 0;
  combo = 0;
  bestCombo = 0;
  comboUntil = 0;
  score = 0;
  hitStop = 0;
  kills = 0;
  loot: Loot[] = [];
  arrows: Arrow[] = [];
  magic: MagicBolt[] = [];
  reinforcements = new Reinforcements();
  environment: StageEnvironment;
  private entry = { score: 0, bestCombo: 0, kills: 0, weapon: 'sword' as Actor['weapon'] };
  private nextArrow = 1;
  private lootRandom: () => number;
  private nextId = 1;
  private buffer = new AttackBuffer();
  private random: () => number;
  constructor(
    private readonly seed = 731,
    readonly stageId: StageId = 'gate',
  ) {
    this.environment = new StageEnvironment(stageId);
    this.player.x = this.stage.spawn.x;
    this.player.y = this.stage.spawn.y;
    this.random = seededRandom(seed);
    this.lootRandom = seededRandom(seed ^ 0x102030);
  }
  get stage() {
    return stages[this.stageId];
  }
  get sectionIndex() {
    return Math.max(
      0,
      this.stage.sections.findIndex((s) => this.player.x >= s.start && this.player.x < s.end),
    );
  }
  nextStage(): Simulation | null {
    if (this.status !== 'clear' || this.stageId === 'monastery') return null;
    const next = new Simulation(this.seed, this.stageId === 'gate' ? 'forge' : 'monastery');
    next.entry = {
      score: this.score,
      bestCombo: this.bestCombo,
      kills: this.kills,
      weapon: this.player.weapon,
    };
    return next.restoreEntry();
  }
  restartStage(): Simulation {
    const next = new Simulation(this.seed, this.stageId);
    next.entry = { ...this.entry };
    return next.restoreEntry();
  }
  private restoreEntry(): Simulation {
    this.score = this.entry.score;
    this.bestCombo = this.entry.bestCombo;
    this.kills = this.entry.kills;
    this.player.weapon = this.entry.weapon;
    return this;
  }
  get bounds(): [number, number] {
    const w = this.stage.waves[this.wave];
    return [
      this.active
        ? Math.max(this.stage.start + 24, (w?.trigger ?? 0) - 240)
        : this.stage.start + 24,
      w?.end ?? this.stage.end - 24,
    ];
  }
  get boss() {
    return this.enemies.find((e) => e.kind === 'boss' && e.hp > 0);
  }
  private emit(type: GameEvent['type'], a: Actor, value?: number) {
    this.events.push({ type, x: a.x, y: a.y - a.z - 38, value });
  }
  step(dt: number, input: Input) {
    if (this.status !== 'playing') return;
    if (this.finishBoss()) return;
    this.time += dt;
    this.buffer.push(input.commands, this.time);
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }
    this.player.rollAttackWindow = Math.max(0, this.player.rollAttackWindow - dt);
    this.environment.advance(dt, (e) => this.events.push(e));
    const beforePlayer = { x: this.player.x, y: this.player.y };
    const dodgeFollowup =
      this.player.rollAttackWindow > 0 &&
      this.player.weapon === 'sword' &&
      input.commands.includes('sword');
    if (this.time > this.comboUntil) this.combo = 0;
    const oldVz = this.player.vz;
    const spin =
      input.commands.includes('spin') && this.hitStop <= 0 && startAttack(this.player, 'spin');
    if (spin) {
      this.buffer.clear();
      this.emit('swing', this.player);
    }
    movePlayer(
      this.player,
      input,
      dt,
      this.bounds,
      this.environment.isWet(this.player.x, this.player.y) ? monasteryRules.waterMoveScale : 1,
    );
    if (this.player.vz > 0 && oldVz <= 0) this.emit('jump', this.player);
    const started = this.buffer.consume(this.player, this.time, dodgeFollowup);
    if (started) this.emit('swing', this.player);
    const lunge = this.player.attack;
    const lungeDefinition = attacks.slash4;
    if (
      lunge?.id === 'slash4' &&
      lunge.lungeDirection &&
      (attackPhase('slash4', lunge.elapsed) === 'startup' ||
        attackPhase('slash4', lunge.elapsed) === 'active')
    ) {
      const distance = Math.min(
        lungeDefinition.lungeDistance! - (lunge.lungeDistance ?? 0),
        lungeDefinition.lungeSpeed! * dt,
      );
      this.player.x += lunge.lungeDirection.x * distance;
      this.player.y += lunge.lungeDirection.y * distance;
      lunge.lungeDistance = (lunge.lungeDistance ?? 0) + distance;
    }
    const finishingRoll = this.player.state === 'Roll';
    if (integrate(this.player, dt, this.bounds)) this.emit('land', this.player);
    if (finishingRoll && this.player.state === 'Idle') this.player.rollAttackWindow = 0.08;
    collideSolids(this.player, beforePlayer, this.environment.solids);
    this.releaseArrow(this.player, dt);
    advanceAttack(this.player, dt);
    this.environment.strike(this.player, (e) => this.events.push(e));
    let attacking = this.enemies.filter(
      (e) => e.hp > 0 && (e.attack || e.state === 'Guard'),
    ).length;
    for (const e of this.enemies) {
      const before = { x: e.x, y: e.y };
      const id = updateAI(e, this.player, dt, attacking < 2, this.enemies, this.environment.solids);
      if (e.kind !== 'flyer' && this.environment.isWet(before.x, before.y)) {
        e.x = before.x + (e.x - before.x) * monasteryRules.waterMoveScale;
        e.y = before.y + (e.y - before.y) * monasteryRules.waterMoveScale;
      }
      if (!id && e.state === 'Guard' && e.aiTime === 0) attacking++;
      if (id) {
        attacking++;
        this.emit('swing', e);
      }
      integrate(e, dt, this.bounds);
      this.environment.bossMotion(e, before, (event) => this.events.push(event));
      collideSolids(e, before, this.environment.solids);
      this.releaseArrow(e, dt);
      this.releaseMagic(e, dt);
      advanceAttack(e, dt);
      this.environment.bossImpact(e, (event) => this.events.push(event));
      this.environment.strike(e, (event) => this.events.push(event));
      const damage = meleeOccluded(this.player, e, this.environment.solids)
        ? 0
        : applyHit(this.player, e);
      if (damage) {
        this.combo++;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.comboUntil = this.time + 2.2;
        this.score += damage * 10 * this.combo;
        this.hitStop = this.player.attack?.id === 'rising' ? 0.045 : 0.033;
        this.emit('hit', e, damage);
        if (e.hp === 0) this.defeat(e);
      }
      const received = meleeOccluded(e, this.player, this.environment.solids)
        ? 0
        : applyHit(e, this.player);
      if (received) {
        this.buffer.clear();
        this.emit('hit', this.player, received);
        this.hitStop = 0.07;
        this.combo = 0;
      }
      e.x = clamp(e.x, this.bounds[0], this.bounds[1]);
      e.y = clamp(e.y, ...stageDepth(e.x));
    }
    this.arrows = advanceArrows(
      this.arrows,
      [this.player, ...this.enemies],
      dt,
      (target, damage) => {
        this.emit('hit', target, damage);
        if (target.kind === 'player') {
          this.buffer.clear();
          this.combo = 0;
          this.hitStop = 0.07;
        } else {
          this.combo++;
          this.bestCombo = Math.max(this.bestCombo, this.combo);
          this.comboUntil = this.time + 2.2;
          this.score += damage * 10;
          if (target.hp === 0) this.defeat(target);
        }
      },
      (arrow, before, end) => this.environment.interceptArrow(arrow, before, end),
      this.stage.end,
    );
    this.magic = advanceMagic(
      this.magic.filter((bolt) =>
        this.enemies.some((enemy) => enemy.id === bolt.owner && enemy.hp > 0),
      ),
      this.player,
      this.environment.solids,
      dt,
      (damage) => {
        this.emit('hit', this.player, damage);
        this.buffer.clear();
        this.combo = 0;
        this.hitStop = 0.07;
      },
    );
    for (const a of [this.player, ...this.enemies]) {
      const damage = this.environment.burn(a);
      if (!damage) continue;
      this.emit('hit', a, damage);
      if (a.kind === 'player') {
        this.buffer.clear();
        this.combo = 0;
      }
      if (a.hp === 0) {
        if (a.kind === 'player') this.emit('death', a);
        else this.defeat(a);
      }
    }
    for (const item of this.loot) item.age += dt;
    this.loot = this.loot.filter((item) => {
      if (
        item.age > 0.4 &&
        this.player.hp > 0 &&
        this.player.z < 12 &&
        Math.abs(this.player.x - item.x) < 24 &&
        Math.abs(this.player.y - item.y) < 16
      ) {
        this.player.hp = collectLoot(this.player.hp, this.player.maxHp, item.fraction);
        this.emit('heal', this.player, Math.round(this.player.maxHp * item.fraction));
        return false;
      }
      return true;
    });
    if (this.player.hp <= 0) {
      this.status = 'over';
      return;
    }
    if (this.finishBoss()) return;
    if (this.boss && this.active)
      this.reinforcements.update(
        this.boss,
        this.player,
        this.enemies,
        this.bounds,
        dt,
        (kind, x, y) => {
          const enemy = createActor(this.nextId++, kind, x, y);
          collideSolids(enemy, enemy, this.environment.solids);
          this.enemies.push(enemy);
        },
      );
    if (this.active && this.enemies.every((e) => e.hp <= 0)) {
      this.active = false;
      this.wave++;

      if (this.wave >= this.stage.waves.length) {
        this.status = 'clear';
        this.emit('clear', this.player);
        return;
      }
    }
    const wave = this.stage.waves[this.wave];
    if (!this.active && wave && this.player.x >= wave.trigger) {
      this.active = true;
      if (wave.recovery) this.loot.push({ ...wave.recovery, age: 1 });
      this.enemies = wave.enemies.map((kind, i) =>
        createActor(
          this.nextId++,
          kind,
          wave.spawns?.[i]?.x ?? Math.min(wave.end - 60, wave.trigger + 250 + i * 80),
          wave.spawns?.[i]?.y ?? 380 + this.random() * 90,
        ),
      );
      for (const enemy of this.enemies) collideSolids(enemy, enemy, this.environment.solids);
      if (this.boss) {
        this.reinforcements.clear();
        this.emit('boss', this.boss);
      }
    }
  }
  private defeat(a: Actor) {
    this.kills++;
    this.score += 200;
    this.emit('death', a);
    const fraction = rollLoot(this.lootRandom);
    if (fraction) this.loot.push({ id: a.id, x: a.x, y: a.y, fraction, age: 0 });
  }
  private finishBoss() {
    if (
      this.player.hp <= 0 ||
      !this.active ||
      this.wave !== this.stage.waves.length - 1 ||
      !this.enemies.some((e) => e.kind === 'boss' && e.hp <= 0)
    )
      return false;
    this.status = 'clear';
    this.score += this.stage.clearBonus;
    this.environment.extinguish();
    this.wave = this.stage.waves.length;
    this.active = false;
    this.enemies = [];
    this.arrows = [];
    this.magic = [];
    this.reinforcements.clear();
    this.emit('clear', this.player);
    return true;
  }
  private releaseArrow(a: Actor, dt: number) {
    const attack = a.attack;
    if (!attack || attack.released || !['shot', 'enemyShot'].includes(attack.id) || a.hp <= 0)
      return;
    if (attack.elapsed + dt < attacks[attack.id].startupFrames / 60) return;
    attack.released = true;
    const isPlayerBow = a.kind === 'player' && a.weapon === 'bow';
    const headOffset = isPlayerBow ? bowReleaseAnchor.arrowTipLength : 6;
    const muzzleOffset = isPlayerBow ? bowReleaseOffset.x : 24 + headOffset;
    this.arrows.push({
      id: this.nextArrow++,
      owner: a.id,
      player: a.kind === 'player',
      // `x` is the arrowhead base; the renderer's tip lands on the authored bow muzzle.
      x: a.x + a.facing * (muzzleOffset - headOffset),
      y: a.y,
      z: a.z + (isPlayerBow ? bowReleaseOffset.z : 50),
      facing: a.facing,
      age: 0,
    });
    this.emit('swing', a);
  }
  private releaseMagic(a: Actor, dt: number) {
    const attack = a.attack;
    if (!attack || attack.id !== 'spell' || attack.released || a.hp <= 0) return;
    if (attack.elapsed + dt < attacks.spell.startupFrames / 60) return;
    attack.released = true;
    const target = a.attackTarget ?? this.player;
    const dx = target.x - a.x;
    const dy = target.y - a.y;
    const angle = Math.atan2(dy, dx);
    const speed = magicBoltRules.speed;
    this.magic.push({
      id: this.nextArrow++,
      owner: a.id,
      x: a.x + Math.cos(angle) * 22,
      y: a.y + Math.sin(angle) * 22,
      z: 56,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      homing: true,
    });
    this.emit('swing', a);
  }
  drainEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }
}
