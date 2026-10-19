export type Direction = 'left' | 'right' | 'up' | 'down';
const opposites: Record<Direction, Direction> = {
  left: 'right',
  right: 'left',
  up: 'down',
  down: 'up',
};
export const directionFor: Record<string, Direction> = {
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
};
/** Uses physical key edges, not OS repeats; aliases count as the same held direction. */
export class DoubleTap {
  private keys = new Set<string>();
  private last: { direction: Direction; time: number } | null = null;
  private running: Direction | null = null;
  press(code: string, time: number, repeat = false) {
    const direction = directionFor[code];
    if (!direction || repeat || this.keys.has(code)) return;
    const already = this.held(direction);
    this.keys.add(code);
    if (already) return;
    if (this.running && direction === opposites[this.running]) this.cancel();
    if (this.held(opposites[direction])) {
      this.cancel();
      return;
    }
    if (this.last?.direction === direction && time - this.last.time <= 250) {
      this.running = direction;
      this.last = null;
    } else {
      this.last = { direction, time };
    }
  }
  release(code: string) {
    const direction = directionFor[code];
    this.keys.delete(code);
    if (direction === this.running && !this.held(direction)) this.running = null;
  }
  private held(direction: Direction) {
    return [...this.keys].some((k) => directionFor[k] === direction);
  }
  get active() {
    return this.running !== null;
  }
  cancel() {
    this.running = null;
    this.last = null;
  }
  clear() {
    this.keys.clear();
    this.cancel();
  }
}
