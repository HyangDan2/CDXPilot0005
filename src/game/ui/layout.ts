/**
 * Dynamic HUD and touch layout.
 *
 * The play surface is a 16:9 `#stage` whose size changes with the device far
 * more than the viewport breakpoints can express, so every scale and edge gap
 * is derived from the surface that was actually measured. `StageLayout` writes
 * only CSS custom properties; the user's own settings (`--touch-scale`,
 * `--touch-opacity`, `--touch-inset`) stay in CSS and multiply the automatic
 * values, so nothing a player tuned is overwritten.
 */

/** Stage height at or below this is a phone-sized play surface. */
const PHONE_MAX_HEIGHT = 520;
/** Layout width of the full stick and of the action cluster, before scaling. */
const STICK_WIDTH = 126;
const ACTIONS_WIDTH = 194;
/** Smallest gap kept between the stick and the action cluster. */
const CLUSTER_GAP = 28;
const LAYOUT_EVENT = 'valkyrie:layout';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface StageMetrics {
  width: number;
  height: number;
  coarse: boolean;
}

/** HUD scale: phone 0.85, tablet 1.15–1.35, desktop 1. */
export function hudScaleFor({ width, height, coarse }: StageMetrics): number {
  if (!coarse) return width >= 1000 ? 1 : clamp(width / 1000, 0.7, 1);
  if (height <= PHONE_MAX_HEIGHT) return 0.85;
  return clamp(width / 960, 1.15, 1.35);
}

/** Phone 1, tablet 1.15–1.38, always small enough for the cluster to fit. */
export function touchScaleFor(
  { width, height, coarse }: StageMetrics,
  userScale = 1,
  inset = 20,
): number {
  if (!coarse) return 1;
  const base = height <= PHONE_MAX_HEIGHT ? 1 : clamp(width / 960, 1.15, 1.38);
  const usable = width - inset * 2 - CLUSTER_GAP;
  const limit = usable / ((STICK_WIDTH + ACTIONS_WIDTH) * Math.max(0.1, userScale));
  return clamp(Math.min(base, limit), 0.6, 1.38);
}

/** Edge gaps grow a little on a large surface so controls do not hug the frame. */
export const touchInsetBoost = (width: number) => clamp(width / 1200, 1, 1.15);

export const hudEdgeFor = (width: number) => clamp(width * 0.018, 10, 28);

export function requestStageLayout() {
  window.dispatchEvent(new Event(LAYOUT_EVENT));
}

const readNumber = (property: string, fallback: number) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
};

/** Writes the layout variables and keeps the top HUD row from colliding. */
export class StageLayout {
  private stage: HTMLElement | null;
  private observer: ResizeObserver | null = null;
  private mutations: MutationObserver | null = null;
  private coarse = matchMedia('(any-pointer: coarse)');
  private frame = 0;

  constructor(stage = document.querySelector<HTMLElement>('#stage')) {
    this.stage = stage;
    if (!stage) return;
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(this.schedule);
      this.observer.observe(stage);
    }
    if (typeof MutationObserver !== 'undefined') {
      this.mutations = new MutationObserver(this.schedule);
      this.mutations.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      this.mutations.observe(stage, { attributes: true, attributeFilter: ['data-mode'] });
      const hud = document.querySelector('#hud');
      if (hud) this.mutations.observe(hud, { attributes: true, attributeFilter: ['hidden'] });
    }
    window.addEventListener('resize', this.schedule);
    window.addEventListener('orientationchange', this.schedule);
    window.addEventListener('load', this.schedule);
    window.addEventListener(LAYOUT_EVENT, this.schedule);
    this.coarse.addEventListener('change', this.schedule);
    this.apply();
  }

  destroy() {
    this.observer?.disconnect();
    this.mutations?.disconnect();
    window.removeEventListener('resize', this.schedule);
    window.removeEventListener('orientationchange', this.schedule);
    window.removeEventListener('load', this.schedule);
    window.removeEventListener(LAYOUT_EVENT, this.schedule);
    this.coarse.removeEventListener('change', this.schedule);
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.stage = null;
  }

  private schedule = () => {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.apply();
    });
  };

  private apply() {
    const stage = this.stage;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const coarse = this.coarse.matches || document.body.classList.contains('touch-device');
    const metrics: StageMetrics = { width: rect.width, height: rect.height, coarse };
    const boost = touchInsetBoost(rect.width);
    const inset = readNumber('--touch-inset', 20) * boost;
    const userScale = readNumber('--touch-scale', 1);
    const auto = touchScaleFor(metrics, userScale, inset);
    const edge = hudEdgeFor(rect.width);
    stage.style.setProperty('--hud-scale', hudScaleFor(metrics).toFixed(3));
    stage.style.setProperty('--touch-scale-auto', auto.toFixed(3));
    stage.style.setProperty('--touch-scale-total', (auto * userScale).toFixed(3));
    stage.style.setProperty('--touch-inset-boost', boost.toFixed(3));
    stage.style.setProperty('--hud-edge', `${edge.toFixed(1)}px`);
    stage.style.setProperty('--pause-right', `${this.pauseRight(rect, coarse, edge).toFixed(1)}px`);
    this.placeWave();
  }

  /**
   * On a phone the page header floats over the play surface, so the pause
   * button steps left of it instead of sitting under it.
   */
  private pauseRight(rect: DOMRect, coarse: boolean, edge: number) {
    if (!coarse) return edge;
    const masthead = document.querySelector<HTMLElement>('.masthead');
    if (!masthead) return edge;
    const box = masthead.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return edge;
    const intrudes = box.left < rect.right && box.bottom > rect.top + 4 && box.top < rect.bottom;
    return intrudes ? Math.max(edge, rect.right - box.left + 12) : edge;
  }

  /** Drops the wave label below the portrait block or pause button when narrow. */
  private placeWave() {
    const stage = this.stage;
    if (!stage) return;
    const wave = stage.querySelector<HTMLElement>('.wave-hud');
    if (!wave || wave.hidden || !wave.offsetWidth) {
      stage.style.removeProperty('--wave-top-shift');
      return;
    }
    stage.style.setProperty('--wave-top-shift', '0px');
    const waveBox = wave.getBoundingClientRect();
    let shift = 0;
    for (const selector of ['.player-hud', '#pause-button']) {
      const other = stage.querySelector<HTMLElement>(selector);
      if (!other || other.hidden) continue;
      const box = other.getBoundingClientRect();
      if (box.width < 1) continue;
      const apart =
        waveBox.left >= box.right ||
        waveBox.right <= box.left ||
        waveBox.top >= box.bottom ||
        waveBox.bottom <= box.top;
      if (apart) continue;
      shift = Math.max(shift, box.bottom - waveBox.top + 8);
    }
    if (shift > 0) stage.style.setProperty('--wave-top-shift', `${shift.toFixed(1)}px`);
    else stage.style.removeProperty('--wave-top-shift');
  }
}
