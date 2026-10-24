import Phaser from 'phaser';
import { attacks, attackPhase } from '../../data/attacks';
import type { Actor, AttackId } from '../entities/types';
import { sd } from './sd';

const TAIL_SECONDS = 0.12;
const PARTICLES = [
  [8, -6],
  [17, 5],
  [27, -3],
  [37, 7],
  [46, -10],
  [54, 3],
] as const;

function strokeArc(
  graphics: Phaser.GameObjects.Graphics,
  start: Phaser.Math.Vector2,
  control: Phaser.Math.Vector2,
  end: Phaser.Math.Vector2,
  color: number,
  width: number,
  alpha: number,
) {
  graphics.lineStyle(width, color, alpha).beginPath().moveTo(start.x, start.y);
  for (let step = 1; step <= 12; step++) {
    const t = step / 12;
    const inverse = 1 - t;
    graphics.lineTo(
      inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
      inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
    );
  }
  graphics.strokePath();
}

function particles(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  facing: 1 | -1,
  alpha: number,
) {
  PARTICLES.forEach(([dx, dy], index) => {
    graphics
      .fillStyle(index % 2 ? 0xfff1b8 : 0x78d7ec, alpha)
      .fillRect(x + facing * dx, y + dy, 2, 2);
  });
}

function sparkle(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
  color: number,
  alpha: number,
) {
  graphics
    .lineStyle(2, color, alpha)
    .lineBetween(x - size, y, x + size, y)
    .lineBetween(x, y - size, x, y + size)
    .fillStyle(0xfff1b8, alpha)
    .fillRect(x - 1, y - 1, 2, 2);
}

function swordEffect(
  graphics: Phaser.GameObjects.Graphics,
  actor: Actor,
  progress: number,
  alpha: number,
) {
  const origin = sd.sheets['smooth-combo'].origin ?? sd.origin;
  const scale = sd.scale;
  const t = Math.min(1, progress * 1.5 + 0.08);
  const fade = Math.max(0.35, 1 - Math.max(0, progress - 0.68) * 2.4);
  const effectAlpha = alpha * fade;
  const start = new Phaser.Math.Vector2(
    actor.x + (155 - origin[0] * 512) * scale * actor.facing,
    actor.y - actor.z + (138 - origin[1] * 512) * scale,
  );
  const end = new Phaser.Math.Vector2(
    actor.x + (155 + 245 * t - origin[0] * 512) * scale * actor.facing,
    actor.y - actor.z + (138 + 212 * t - origin[1] * 512) * scale,
  );
  const control = new Phaser.Math.Vector2(
    actor.x + actor.facing * 115 * t,
    actor.y - actor.z - 145,
  );
  strokeArc(graphics, start, control, end, 0x53c9e8, 12, effectAlpha * 0.4);
  strokeArc(graphics, start, control, end, 0x53c9e8, 7, effectAlpha * 0.9);
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(start.x + actor.facing * 3, start.y - 2),
    new Phaser.Math.Vector2(control.x, control.y + 5),
    new Phaser.Math.Vector2(end.x, end.y - 2),
    0xe7fbff,
    3,
    effectAlpha,
  );
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(start.x + actor.facing * 8, start.y + 8),
    new Phaser.Math.Vector2(control.x + actor.facing * 7, control.y + 10),
    new Phaser.Math.Vector2(end.x - actor.facing * 8, end.y + 8),
    0xffd879,
    2,
    effectAlpha * 0.85,
  );
  sparkle(graphics, end.x, end.y, 6, 0xfff1b8, effectAlpha);
  sparkle(graphics, end.x - actor.facing * 23, end.y + 12, 3, 0x78d7ec, effectAlpha * 0.75);
  particles(graphics, end.x, end.y, actor.facing, effectAlpha);
}

function airEffect(
  graphics: Phaser.GameObjects.Graphics,
  actor: Actor,
  progress: number,
  alpha: number,
) {
  const screenY = actor.y - actor.z;
  const top = screenY - 195;
  const bottom = actor.y - 15;
  const endX = actor.x + actor.facing * (132 + 12 * progress);
  const firstStart = new Phaser.Math.Vector2(actor.x + actor.facing * 50, top);
  const secondStart = new Phaser.Math.Vector2(actor.x + actor.facing * 35, top + 15);
  const firstEnd = new Phaser.Math.Vector2(endX, bottom);
  const secondEnd = new Phaser.Math.Vector2(endX - actor.facing * 14, bottom + 2);
  strokeArc(
    graphics,
    firstStart,
    new Phaser.Math.Vector2(actor.x + actor.facing * 139, (top + bottom) / 2 - 20),
    firstEnd,
    0x55cce8,
    6,
    alpha * 0.9,
  );
  strokeArc(
    graphics,
    secondStart,
    new Phaser.Math.Vector2(actor.x + actor.facing * 124, (top + bottom) / 2 - 4),
    secondEnd,
    0x55cce8,
    6,
    alpha * 0.75,
  );
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(firstStart.x, firstStart.y + 5),
    new Phaser.Math.Vector2(actor.x + actor.facing * 133, (top + bottom) / 2 - 14),
    new Phaser.Math.Vector2(firstEnd.x, firstEnd.y - 2),
    0xe7fbff,
    2,
    alpha,
  );
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(secondStart.x, secondStart.y + 3),
    new Phaser.Math.Vector2(actor.x + actor.facing * 118, (top + bottom) / 2 + 2),
    new Phaser.Math.Vector2(secondEnd.x, secondEnd.y - 2),
    0xe7fbff,
    2,
    alpha,
  );
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(firstStart.x + actor.facing * 3, firstStart.y + 9),
    new Phaser.Math.Vector2(actor.x + actor.facing * 130, (top + bottom) / 2 - 7),
    new Phaser.Math.Vector2(firstEnd.x - actor.facing * 8, firstEnd.y + 7),
    0xffd879,
    2,
    alpha * 0.8,
  );
  if (progress > 0.62) {
    const ring = (progress - 0.62) / 0.38;
    graphics
      .lineStyle(2, 0xa6e5f1, alpha * 0.75)
      .strokeEllipse(actor.x + actor.facing * 25, actor.y + 3, 16 + 50 * ring, 6 + 8 * ring);
    sparkle(
      graphics,
      actor.x + actor.facing * (42 + 18 * ring),
      actor.y - 2,
      5,
      0xffd879,
      alpha * (1 - ring * 0.35),
    );
    particles(graphics, actor.x + actor.facing * 35, actor.y - 8, actor.facing, alpha * 0.6);
  }
}

function risingEffect(
  graphics: Phaser.GameObjects.Graphics,
  actor: Actor,
  progress: number,
  alpha: number,
) {
  const screenY = actor.y - actor.z;
  const sweep = Math.min(1, 0.18 + progress * 1.1);
  const fade = Math.max(0.3, 1 - Math.max(0, progress - 0.72) * 2.4);
  const effectAlpha = alpha * fade;
  const start = new Phaser.Math.Vector2(actor.x + actor.facing * 12, screenY + 18);
  const end = new Phaser.Math.Vector2(
    actor.x + actor.facing * (42 + 118 * sweep),
    screenY - 112 - 52 * sweep,
  );
  const control = new Phaser.Math.Vector2(
    actor.x + actor.facing * (94 + 26 * sweep),
    screenY - 50 - 48 * sweep,
  );
  strokeArc(graphics, start, control, end, 0x53c9e8, 13, effectAlpha * 0.35);
  strokeArc(graphics, start, control, end, 0x53c9e8, 7, effectAlpha * 0.92);
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(start.x + actor.facing * 4, start.y - 3),
    new Phaser.Math.Vector2(control.x + actor.facing * 2, control.y - 3),
    new Phaser.Math.Vector2(end.x - actor.facing * 5, end.y + 4),
    0xe7fbff,
    3,
    effectAlpha,
  );
  strokeArc(
    graphics,
    new Phaser.Math.Vector2(start.x + actor.facing * 10, start.y + 8),
    new Phaser.Math.Vector2(control.x + actor.facing * 8, control.y + 8),
    new Phaser.Math.Vector2(end.x - actor.facing * 12, end.y + 11),
    0xffd879,
    2,
    effectAlpha * 0.85,
  );
  sparkle(graphics, end.x, end.y, 7, 0xfff1b8, effectAlpha);
  particles(graphics, end.x - actor.facing * 10, end.y + 10, actor.facing, effectAlpha);
}

function spinEffect(
  graphics: Phaser.GameObjects.Graphics,
  actor: Actor,
  progress: number,
  alpha: number,
) {
  const centerX = actor.x;
  const centerY = actor.y - actor.z - 44;
  const sweep = Math.min(1, progress * 1.25 + 0.12);
  const fade = Math.max(0.35, 1 - Math.max(0, progress - 0.78) * 2.2);
  const effectAlpha = alpha * fade;
  const width = 154 + sweep * 26;
  const height = 49 + sweep * 8;
  graphics
    .lineStyle(12, 0x53c9e8, effectAlpha * 0.32)
    .strokeEllipse(centerX, centerY, width, height)
    .lineStyle(6, 0x53c9e8, effectAlpha * 0.85)
    .strokeEllipse(centerX, centerY, width, height)
    .lineStyle(2, 0xe7fbff, effectAlpha)
    .strokeEllipse(centerX, centerY - 2, width - 14, height - 11)
    .lineStyle(2, 0xffd879, effectAlpha * 0.82)
    .strokeEllipse(centerX, centerY + 8, width - 24, height - 15);
  const angle = -Math.PI / 2 + progress * Math.PI * 2;
  const sparkX = centerX + Math.cos(angle) * width * 0.5;
  const sparkY = centerY + Math.sin(angle) * height * 0.5;
  sparkle(graphics, sparkX, sparkY, 7, 0xfff1b8, effectAlpha);
  sparkle(
    graphics,
    centerX + Math.cos(angle + Math.PI) * width * 0.46,
    centerY + Math.sin(angle + Math.PI) * height * 0.46,
    4,
    0x78d7ec,
    effectAlpha * 0.85,
  );
  particles(graphics, sparkX, sparkY, actor.facing, effectAlpha * 0.8);
}

function bowEffect(
  graphics: Phaser.GameObjects.Graphics,
  actor: Actor,
  alpha: number,
  progress: number,
) {
  const origin = sd.sheets['smooth-bow'].origin ?? sd.origin;
  const scale = sd.scale;
  const x = actor.x + (348 - origin[0] * 512) * scale * actor.facing;
  const y = actor.y - actor.z + (246 - origin[1] * 512) * scale;
  const trail = 18 + 68 * progress;
  const flareX = x + actor.facing * 16;
  graphics
    .lineStyle(11, 0x53c9e8, alpha * 0.32)
    .lineBetween(x, y, x + actor.facing * trail, y)
    .lineStyle(5, 0xa6e5f1, alpha * 0.95)
    .lineBetween(x, y, x + actor.facing * trail, y)
    .lineStyle(2, 0xfff1b8, alpha)
    .lineBetween(x - actor.facing * 5, y, x + actor.facing * Math.min(28, trail), y)
    .lineBetween(flareX, y - 10, flareX, y + 10)
    .lineBetween(flareX - 6, y - 6, flareX + 6, y + 6)
    .lineBetween(flareX - 6, y + 6, flareX + 6, y - 6)
    .fillStyle(0xfff1b8, alpha)
    .fillCircle(flareX, y, 3);
  sparkle(graphics, flareX, y, 11 * (1 - progress * 0.35), 0xfff1b8, alpha);
  particles(graphics, x + actor.facing * 20, y, actor.facing, alpha * 0.8);
}

function swordAttack(id: AttackId) {
  return id === 'slash1' || id === 'slash2' || id === 'slash3' || id === 'slash4';
}

/** Draws presentation-only trails for the authored SD v3 weapon poses. */
export function renderPlayerAttackEffect(graphics: Phaser.GameObjects.Graphics, actor: Actor) {
  graphics.clear();
  const attack = actor.attack;
  if (actor.kind !== 'player' || !attack) return;

  const definition = attacks[attack.id];
  const activeStart = definition.startupFrames / 60;
  const activeEnd = (definition.startupFrames + definition.activeFrames) / 60;
  const tail = attack.elapsed - activeEnd;
  const active = attackPhase(attack.id, attack.elapsed) === 'active';
  const isBowShot = actor.weapon === 'bow' && attack.id === 'shot';
  const bowCharge = isBowShot && !active && tail < 0 && tail >= -0.12;
  if (!active && (tail < 0 || tail >= TAIL_SECONDS) && !bowCharge) return;

  const alpha = bowCharge
    ? 0.28 + (0.5 * (tail + 0.12)) / 0.12
    : active
      ? 0.9
      : 0.9 * (1 - tail / TAIL_SECONDS);
  const progress = Math.max(
    0,
    Math.min(1, (attack.elapsed - activeStart) / (definition.activeFrames / 60)),
  );
  if (isBowShot) {
    const bowProgress = active ? 0.55 : bowCharge ? 0 : Math.min(1, tail / TAIL_SECONDS);
    bowEffect(graphics, actor, alpha, bowProgress);
  } else if (actor.weapon === 'sword' && swordAttack(attack.id)) {
    swordEffect(graphics, actor, progress, alpha);
  } else if (actor.weapon === 'sword' && attack.id === 'air') {
    airEffect(graphics, actor, progress, alpha);
  } else if (actor.weapon === 'sword' && attack.id === 'rising') {
    risingEffect(graphics, actor, progress, alpha);
  } else if (actor.weapon === 'sword' && attack.id === 'spin') {
    spinEffect(graphics, actor, progress, alpha);
  }
}
