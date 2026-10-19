import { bossReinforcements, reinforcementRules as rules } from '../../data/bossReinforcements';
import type { Actor, Kind } from './types';
export interface ReinforcementWarning {
  kind: Kind;
  x: number;
  y: number;
  remaining: number;
}
/** Deterministic threshold queue. Telegraphs reserve a slot in the live-enemy cap. */
export class Reinforcements {
  private triggered = new Set<number>();
  private queue: Kind[] = [];
  warnings: ReinforcementWarning[] = [];
  update(
    boss: Actor,
    player: Actor,
    enemies: Actor[],
    bounds: [number, number],
    dt: number,
    spawn: (kind: Kind, x: number, y: number) => void,
  ) {
    for (const [index, wave] of bossReinforcements.entries()) {
      if (!this.triggered.has(index) && boss.hp <= boss.maxHp * wave.threshold) {
        this.triggered.add(index);
        this.queue.push(...wave.kinds);
      }
    }
    let alive = enemies.filter((e) => e.kind !== 'boss' && e.hp > 0).length;
    const waiting: ReinforcementWarning[] = [];
    for (const warning of this.warnings) {
      warning.remaining = Math.max(0, warning.remaining - dt);
      if (
        warning.remaining <= 0 &&
        alive < rules.maxAlive &&
        Math.abs(player.x - warning.x) >= rules.safeDistance
      ) {
        spawn(warning.kind, warning.x, warning.y);
        alive++;
      } else {
        if (warning.remaining <= 0 && Math.abs(player.x - warning.x) < rules.safeDistance) {
          const left = bounds[0] + rules.edgeInset,
            right = bounds[1] - rules.edgeInset;
          warning.x = Math.abs(player.x - left) > Math.abs(player.x - right) ? left : right;
          warning.remaining = rules.warningSeconds;
        }
        waiting.push(warning);
      }
    }
    this.warnings = waiting;
    while (this.queue.length && alive + this.warnings.length < rules.maxAlive) {
      const left = bounds[0] + rules.edgeInset,
        right = bounds[1] - rules.edgeInset;
      const x = Math.abs(player.x - left) > Math.abs(player.x - right) ? left : right;
      this.warnings.push({
        kind: this.queue.shift()!,
        x,
        y: this.warnings.length % 2 ? 455 : 390,
        remaining: rules.warningSeconds,
      });
    }
  }
  clear() {
    this.queue = [];
    this.warnings = [];
    this.triggered.clear();
  }
}
