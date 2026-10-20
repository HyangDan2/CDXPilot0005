import { depthProfile, stageDepth, type GroundRect } from '../../data/environment';
import type { Actor } from '../entities/types';

export interface Point {
  x: number;
  y: number;
}
export interface Solid extends GroundRect {
  height: number;
  hp: number;
  blocksMelee?: boolean;
}

export function expanded(rect: GroundRect, x: number, y: number): GroundRect {
  return { x: rect.x - x, y: rect.y - y, width: rect.width + x * 2, depth: rect.depth + y * 2 };
}
export function inside(p: Point, r: GroundRect): boolean {
  return p.x > r.x && p.x < r.x + r.width && p.y > r.y && p.y < r.y + r.depth;
}
/** Open rectangle intersection: travelling along an edge is allowed. */
export function crosses(from: Point, to: Point, r: GroundRect): boolean {
  let enter = 0,
    exit = 1;
  for (const [start, delta, min, max] of [
    [from.x, to.x - from.x, r.x, r.x + r.width],
    [from.y, to.y - from.y, r.y, r.y + r.depth],
  ]) {
    if (Math.abs(delta) < 1e-9) {
      if (start <= min || start >= max) return false;
    } else {
      const a = (min - start) / delta,
        b = (max - start) / delta;
      enter = Math.max(enter, Math.min(a, b));
      exit = Math.min(exit, Math.max(a, b));
    }
  }
  return enter < exit - 1e-9;
}

/** Same horizontal, height-aware segment query for AI, telegraphs and projectiles. */
export function firstArrowBlocker<T extends Solid>(
  before: number,
  end: number,
  y: number,
  z: number,
  solids: readonly T[],
): T | undefined {
  const direction = end >= before ? 1 : -1;
  return solids
    .filter(
      (s) =>
        s.hp > 0 &&
        y >= s.y &&
        y <= s.y + s.depth &&
        z >= 0 &&
        z <= s.height &&
        Math.max(before, end) >= s.x &&
        Math.min(before, end) <= s.x + s.width,
    )
    .sort((a, b) => direction * (direction > 0 ? a.x - b.x : a.x + a.width - (b.x + b.width)))[0];
}
export function meleeOccluded(a: Actor, b: Actor, solids: readonly Solid[]): boolean {
  return solids.some(
    (s) => s.hp > 0 && s.blocksMelee && Math.min(a.z, b.z) < s.height && crosses(a, b, s),
  );
}
export function onGround(p: Point): boolean {
  const [minY, maxY] = stageDepth(p.x);
  return p.x >= 24 && p.x <= 3576 && p.y >= minY - 1e-7 && p.y <= maxY + 1e-7;
}
function groundSegment(a: Point, b: Point): boolean {
  if (!onGround(a) || !onGround(b)) return false;
  return depthProfile.every((p) => {
    if (p.x <= Math.min(a.x, b.x) || p.x >= Math.max(a.x, b.x)) return true;
    return onGround({ x: p.x, y: a.y + ((b.y - a.y) * (p.x - a.x)) / (b.x - a.x) });
  });
}
function escapePoints(p: Point, r: GroundRect, margin: number): Point[] {
  return [
    { x: r.x - margin, y: p.y },
    { x: r.x + r.width + margin, y: p.y },
    { x: p.x, y: r.y - margin },
    { x: p.x, y: r.y + r.depth + margin },
  ]
    .filter(onGround)
    .sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y));
}

/** Swept axis movement handles rolls, knockback and committed charges alike. */
export function collideSolids(a: Actor, before: Point, solids: readonly Solid[]) {
  const destination = { x: a.x, y: a.y };
  a.x = before.x;
  a.y = before.y;
  const steps = Math.max(1, Math.ceil(Math.hypot(destination.x - a.x, destination.y - a.y) / 6));
  const dx = (destination.x - a.x) / steps,
    dy = (destination.y - a.y) / steps;
  const boxes = solids.filter((s) => s.hp > 0 && a.z < s.height).map((s) => expanded(s, 16, 10));
  for (let i = 0; i < steps; i++) {
    if (!boxes.some((r) => inside({ x: a.x + dx, y: a.y }, r))) a.x += dx;
    if (!boxes.some((r) => inside({ x: a.x, y: a.y + dy }, r))) a.y += dy;
  }
  // Resolve spawns and landings inside a solid to the nearest ground edge.
  for (const r of boxes)
    if (inside(a, r)) {
      const exit = escapePoints(a, r, 0).find((p) => !boxes.some((other) => inside(p, other)));
      if (exit) Object.assign(a, exit);
    }
}

/** Small visibility graph: deterministic shortest detour around intact barricades. */
export function routeTarget(from: Point, target: Point, solids: readonly Solid[]): Point {
  const boxes = solids.filter((s) => s.hp > 0).map((s) => expanded(s, 22, 16));
  let goal = target;
  for (const r of boxes)
    if (inside(goal, r)) {
      const exit = escapePoints(goal, r, 0)[0];
      if (exit) goal = exit;
    }
  if (groundSegment(from, goal) && !boxes.some((r) => crosses(from, goal, r))) return goal;
  const points: Point[] = [
    from,
    goal,
    ...boxes.flatMap((r) => [
      { x: r.x - 2, y: r.y - 2 },
      { x: r.x + r.width + 2, y: r.y - 2 },
      { x: r.x - 2, y: r.y + r.depth + 2 },
      { x: r.x + r.width + 2, y: r.y + r.depth + 2 },
    ]),
  ];
  const distance = points.map(() => Infinity),
    previous = points.map(() => -1);
  const visited = new Set<number>();
  distance[0] = 0;
  for (let n = 0; n < points.length; n++) {
    let current = -1;
    for (let i = 0; i < points.length; i++)
      if (!visited.has(i) && (current < 0 || distance[i] < distance[current])) current = i;
    if (current < 0 || !Number.isFinite(distance[current])) break;
    if (current === 1) {
      let next = 1;
      while (previous[next] > 0) next = previous[next];
      return points[next];
    }
    visited.add(current);
    for (let i = 1; i < points.length; i++) {
      if (
        visited.has(i) ||
        !groundSegment(points[current], points[i]) ||
        boxes.some((r) => crosses(points[current], points[i], r))
      )
        continue;
      const d =
        distance[current] +
        Math.hypot(points[i].x - points[current].x, points[i].y - points[current].y);
      if (d < distance[i]) {
        distance[i] = d;
        previous[i] = current;
      }
    }
  }
  // An actor just pushed to the collision edge can be inside the navigation margin.
  const box = boxes.find((r) => inside(from, r));
  if (box) return escapePoints(from, box, 4).find((p) => !boxes.some((r) => inside(p, r))) ?? from;
  return from;
}
