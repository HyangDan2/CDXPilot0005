import type { Command } from '../entities/types';
export interface CombatContext {
  free: boolean;
  facing: 1 | -1;
}
const direction = (code: string) =>
  ({
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyA: 'left',
    ArrowLeft: 'left',
  })[code];
/** Edge-triggered chord arbitration. No chord survives an ineligible state. */
export class CombatInput {
  private held = new Set<string>();
  private pending: { key: string; time: number; eligible: boolean; command: Command } | null = null;
  private armed = true;
  private queue: Command[] = [];
  private motion: { time: number; facing: 1 | -1; forward: boolean } | null = null;
  press(code: string, now: number, context: CombatContext, repeat = false) {
    if (repeat || this.held.has(code)) return;
    this.flush(now, context);
    const dir = direction(code);
    if (dir === 'down') this.motion = { time: now, facing: context.facing, forward: false };
    else if (dir && this.motion) {
      if (now - this.motion.time <= 400 && dir === (this.motion.facing === 1 ? 'right' : 'left'))
        this.motion.forward = true;
      else this.motion = null;
    }
    this.held.add(code);
    if (code === 'Space') {
      this.queue.push('jump');
      return;
    }
    if (code !== 'KeyJ' && code !== 'KeyK') return;
    if (
      this.pending &&
      this.pending.key !== code &&
      now - this.pending.time <= 40 &&
      this.pending.eligible &&
      context.free &&
      this.held.has(this.pending.key)
    ) {
      this.pending = null;
      this.motion = null;
      this.queue.push('spin');
      this.armed = false;
      return;
    }
    const command: Command =
      code === 'KeyJ' && this.motion?.forward && now - this.motion.time <= 400 ? 'rising' : 'sword';
    if (code === 'KeyJ') this.motion = null;
    if (this.pending) {
      if (this.pending.key === 'KeyJ') this.queue.push(this.pending.command);
      this.pending = null;
    }
    this.pending = { key: code, time: now, eligible: this.armed && context.free, command };
    this.armed = false;
  }
  release(code: string) {
    this.held.delete(code);
    if (!this.held.has('KeyJ') && !this.held.has('KeyK')) this.armed = true;
  }
  private flush(now: number, context: CombatContext) {
    if (this.pending && !context.free) this.pending.eligible = false;
    if (this.pending && now - this.pending.time > 40) {
      if (this.pending.key === 'KeyJ') this.queue.push(this.pending.command);
      this.pending = null;
    }
  }
  read(now: number, context: CombatContext) {
    this.flush(now, context);
    const commands = this.queue;
    this.queue = [];
    return {
      commands,
      guard:
        this.held.has('KeyK') &&
        !(this.pending?.key === 'KeyK' && this.pending.eligible) &&
        !commands.includes('spin'),
    };
  }
  clear() {
    this.held.clear();
    this.pending = null;
    this.queue = [];
    this.motion = null;
    this.armed = true;
  }
}
