import { Reinforcements } from './reinforcements';
import { attacks } from '../../data/attacks';
import { advanceArrows, type Arrow } from './projectiles';
import { rollLoot, collectLoot, type Loot } from './loot';
import { waves } from '../../data/stage';
import { seededRandom } from '../../utils/random';
import { updateAI } from '../ai/brain';
import { advanceAttack, applyHit, AttackBuffer, startAttack } from '../combat/combat';
import { clamp, WORLD } from '../config/constants';
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
  reinforcements = new Reinforcements();
  private nextArrow = 1;
  private lootRandom: () => number;
  private nextId = 1;
  private buffer = new AttackBuffer();
  private random: () => number;
  constructor(seed = 731) {
    this.random = seededRandom(seed);
    this.lootRandom = seededRandom(seed ^ 0x102030);
  }
  get bounds(): [number, number] {
    const w = waves[this.wave];
    return [this.active ? Math.max(24, (w?.trigger ?? 0) - 240) : 24, w?.end ?? WORLD.length - 24];
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
    if (this.time > this.comboUntil) this.combo = 0;
    const oldVz = this.player.vz;
    const spin =
      input.commands.includes('spin') && this.hitStop <= 0 && startAttack(this.player, 'spin');
    if (spin) {
      this.buffer.clear();
      this.emit('swing', this.player);
    }
    movePlayer(this.player, input, dt, this.bounds);
    if (this.player.vz > 0 && oldVz <= 0) this.emit('jump', this.player);
    const started = this.buffer.consume(this.player, this.time);
    if (started) this.emit('swing', this.player);
    if (integrate(this.player, dt, this.bounds)) this.emit('land', this.player);
    this.releaseArrow(this.player, dt);
    advanceAttack(this.player, dt);
    let attacking = this.enemies.filter(
      (e) => e.hp > 0 && (e.attack || e.state === 'Guard'),
    ).length;
    for (const e of this.enemies) {
      const id = updateAI(e, this.player, dt, attacking < 2, this.enemies);
      if (!id && e.state === 'Guard' && e.aiTime === 0) attacking++;
      if (id) {
        attacking++;
        this.emit('swing', e);
      }
      integrate(e, dt, this.bounds);
      this.releaseArrow(e, dt);
      advanceAttack(e, dt);
      const damage = applyHit(this.player, e);
      if (damage) {
        this.combo++;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.comboUntil = this.time + 2.2;
        this.score += damage * 10 * this.combo;
        this.hitStop = this.player.attack?.id === 'rising' ? 0.045 : 0.033;
        this.emit('hit', e, damage);
        if (e.hp === 0) {
          this.kills++;
          this.score += 200;
          this.emit('death', e);
          const fraction = rollLoot(this.lootRandom);
          if (fraction) this.loot.push({ id: e.id, x: e.x, y: e.y, fraction, age: 0 });
        }
      }
      const received = applyHit(e, this.player);
      if (received) {
        this.buffer.clear();
        this.emit('hit', this.player, received);
        this.hitStop = 0.07;
        this.combo = 0;
      }
      e.x = clamp(e.x, this.bounds[0], this.bounds[1]);
      e.y = clamp(e.y, WORLD.minY, WORLD.maxY);
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
          if (target.hp === 0) {
            this.kills++;
            this.score += 200;
            this.emit('death', target);
            const fraction = rollLoot(this.lootRandom);
            if (fraction)
              this.loot.push({ id: target.id, x: target.x, y: target.y, fraction, age: 0 });
          }
        }
      },
    );
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
          this.enemies.push(createActor(this.nextId++, kind, x, y));
        },
      );
    if (this.active && this.enemies.every((e) => e.hp <= 0)) {
      this.active = false;
      this.wave++;

      if (this.wave >= waves.length) {
        this.status = 'clear';
        this.emit('clear', this.player);
        return;
      }
    }
    const wave = waves[this.wave];
    if (!this.active && wave && this.player.x >= wave.trigger) {
      this.active = true;
      this.enemies = wave.enemies.map((kind, i) =>
        createActor(
          this.nextId++,
          kind,
          Math.min(wave.end - 60, wave.trigger + 250 + i * 80),
          380 + this.random() * 90,
        ),
      );
      if (this.boss) {
        this.reinforcements.clear();
        this.emit('boss', this.boss);
      }
    }
  }
  private finishBoss() {
    if (
      this.player.hp <= 0 ||
      !this.active ||
      this.wave !== waves.length - 1 ||
      !this.enemies.some((e) => e.kind === 'boss' && e.hp <= 0)
    )
      return false;
    this.status = 'clear';
    this.wave = waves.length;
    this.active = false;
    this.enemies = [];
    this.arrows = [];
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
    this.arrows.push({
      id: this.nextArrow++,
      owner: a.id,
      player: a.kind === 'player',
      x: a.x + a.facing * 24,
      y: a.y,
      z: a.z + 50,
      facing: a.facing,
      age: 0,
    });
    this.emit('swing', a);
  }
  drainEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }
}
