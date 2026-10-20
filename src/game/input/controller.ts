import { TouchControls } from './touch';
import { DoubleTap } from './doubleTap';
import { CombatInput, type CombatContext } from './combatInput';
import type { Input } from '../entities/types';
export class Controller {
  private touch: TouchControls;
  private held = new Set<string>();
  private taps = new DoubleTap();
  private combat = new CombatInput();
  private down = (e: KeyboardEvent) => {
    if (document.querySelector('dialog[open]')) return;
    if (
      e.target instanceof Element &&
      e.target.closest('a, button, input, select, textarea') &&
      !['Escape', 'F1'].includes(e.code)
    )
      return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'F1'].includes(e.code))
      e.preventDefault();
    this.held.add(e.code);
    this.taps.press(e.code, performance.now(), e.repeat);
    if (['KeyJ', 'KeyK', 'KeyL', 'KeyI', 'Space'].includes(e.code)) this.taps.cancel();
    this.combat.press(e.code, performance.now(), this.context(), e.repeat);
    if (!e.repeat && e.code === 'Escape') this.onPause();
    if (!e.repeat && e.code === 'F1') this.onDebug();
  };
  private up = (e: KeyboardEvent) => {
    this.held.delete(e.code);
    this.taps.release(e.code);
    this.combat.release(e.code);
  };
  constructor(
    private onPause: () => void,
    private onDebug: () => void,
    private context: () => CombatContext,
    active: () => boolean,
    pause: () => void,
  ) {
    this.touch = new TouchControls(active, pause);
    window.addEventListener('keydown', this.down);
    window.addEventListener('keyup', this.up);
    window.addEventListener('blur', this.clear);
  }
  clear = () => {
    this.touch?.clear();
    this.held.clear();
    this.taps.clear();
    this.combat.clear();
  };
  read(): Input {
    const has = (...keys: string[]) => keys.some((k) => this.held.has(k));
    const combat = this.combat.read(performance.now(), this.context());
    const touch = this.touch.read();
    const input = {
      x: touch.x || Number(has('KeyD', 'ArrowRight')) - Number(has('KeyA', 'ArrowLeft')),
      y: touch.y || Number(has('KeyS', 'ArrowDown')) - Number(has('KeyW', 'ArrowUp')),
      dash: touch.dash || this.taps.active,
      guard: touch.guard || combat.guard,
      commands: [...combat.commands, ...touch.commands],
    };
    return input;
  }
  get touchBlocked() {
    return this.touch.blocked;
  }
  cancelRun() {
    this.taps.cancel();
  }
  destroy() {
    this.touch.destroy();
    window.removeEventListener('keydown', this.down);
    window.removeEventListener('keyup', this.up);
    window.removeEventListener('blur', this.clear);
  }
}
