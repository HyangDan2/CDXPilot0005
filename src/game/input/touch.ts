import type { Command, Input } from '../entities/types';
import { emptyInput } from '../entities/types';

/** Pointer ownership is independent for movement, guard and each action. */
export class TouchControls {
  private input: Input = emptyInput();
  private pointers = new Map<number, { action: string; y: number }>();
  private abort = new AbortController();
  private root: HTMLElement;
  private stick: HTMLElement;
  private knob: HTMLElement;
  private portrait = matchMedia('(orientation: portrait)');
  private coarse = matchMedia('(any-pointer: coarse)');
  constructor(
    private active: () => boolean,
    private pause: () => void,
  ) {
    const stage = document.querySelector<HTMLElement>('#stage')!;
    stage.insertAdjacentHTML(
      'beforeend',
      `<div id="touch-controls" aria-label="Touch controls">
      <div id="touch-stick" aria-label="Move; outer ring to run"><span></span><small>MOVE / RUN</small></div>
      <div class="touch-actions"><button data-action="jump">점프</button><button data-action="guard">가드</button><button data-action="attack">공격<small>↑ 라이징</small></button><button data-action="roll">회피</button></div>
      <div class="touch-special"><button data-action="switch">검 / 활</button><button data-action="spin">회전</button></div>
    </div><div id="rotate-notice" role="status">↻<strong>가로로 돌려주세요</strong><span>가로 화면에서 터치로 플레이할 수 있습니다.</span></div>`,
    );
    this.root = stage.querySelector('#touch-controls')!;
    this.stick = stage.querySelector('#touch-stick')!;
    this.knob = this.stick.querySelector('span')!;
    const opts = { signal: this.abort.signal };
    this.root.addEventListener('pointerdown', this.down, opts);
    this.root.addEventListener('pointermove', this.move, opts);
    this.root.addEventListener('pointerup', this.up, opts);
    this.root.addEventListener('pointercancel', this.cancel, opts);
    this.root.addEventListener('lostpointercapture', this.cancel, opts);
    stage.addEventListener('contextmenu', (e) => e.preventDefault(), opts);
    stage.addEventListener('touchmove', (e) => e.preventDefault(), { ...opts, passive: false });
    stage.addEventListener('gesturestart', (e) => e.preventDefault(), opts);
    this.coarse.addEventListener('change', this.layout, opts);
    window.addEventListener('resize', this.layout, opts);
    window.addEventListener('blur', this.clear, opts);
    document.addEventListener('visibilitychange', this.visibility, opts);
    this.layout();
  }
  get blocked() {
    return this.coarse.matches && this.portrait.matches;
  }
  private visibility = () => {
    if (document.hidden) {
      this.clear();
      this.pause();
    }
  };
  private layout = () => {
    this.clear();
    document.body.classList.toggle('touch-device', this.coarse.matches);
    document.body.classList.toggle('touch-portrait', this.blocked);
    if (this.blocked) this.pause();
  };
  private down = (e: PointerEvent) => {
    if (!this.active() || this.blocked || document.querySelector('dialog[open]')) return;
    const target = e.target as HTMLElement;
    const action =
      target.closest<HTMLElement>('[data-action]')?.dataset.action ??
      (this.stick.contains(target) ? 'move' : undefined);
    if (!action || [...this.pointers.values()].some((p) => p.action === action)) return;
    e.preventDefault();
    this.root.setPointerCapture(e.pointerId);
    this.pointers.set(e.pointerId, { action, y: e.clientY });
    if (action === 'move') this.move(e);
    else if (action === 'guard') this.input.guard = true;
    else if (action !== 'attack') this.input.commands.push(action as Command);
  };
  private move = (e: PointerEvent) => {
    if (this.pointers.get(e.pointerId)?.action !== 'move') return;
    const b = this.stick.getBoundingClientRect(),
      radius = b.width / 2;
    const x = (e.clientX - b.left - radius) / radius;
    const y = (e.clientY - b.top - b.height / 2) / radius;
    const length = Math.hypot(x, y);
    this.input.x = length < 0.18 ? 0 : x / Math.max(1, length);
    this.input.y = length < 0.18 ? 0 : y / Math.max(1, length);
    this.input.dash = length > 0.82;
    this.knob.style.transform = `translate(${this.input.x * radius * 0.6}px, ${this.input.y * radius * 0.6}px)`;
  };
  private up = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    if (p?.action === 'attack' && this.active())
      this.input.commands.push(p.y - e.clientY > 32 ? 'rising' : 'sword');
    this.cancel(e);
  };
  private cancel = (e: PointerEvent) => {
    const p = this.pointers.get(e.pointerId);
    this.pointers.delete(e.pointerId);
    if (p?.action === 'move') {
      this.input.x = this.input.y = 0;
      this.input.dash = false;
      this.knob.style.transform = '';
    }
    if (p?.action === 'guard') this.input.guard = false;
    if (this.root.hasPointerCapture(e.pointerId)) this.root.releasePointerCapture(e.pointerId);
  };
  clear = () => {
    this.input = emptyInput();
    const ids = [...this.pointers.keys()];
    this.pointers.clear();
    for (const id of ids) if (this.root.hasPointerCapture(id)) this.root.releasePointerCapture(id);
    this.knob.style.transform = '';
  };
  read(): Input {
    if (!this.active() || this.blocked) {
      this.clear();
      return emptyInput();
    }
    const result = { ...this.input, commands: this.input.commands };
    this.input.commands = [];
    return result;
  }
  destroy() {
    this.clear();
    this.abort.abort();
    this.root.remove();
    document.querySelector('#rotate-notice')?.remove();
  }
}
