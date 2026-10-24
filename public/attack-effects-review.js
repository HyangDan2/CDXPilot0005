const $ = (id) => document.getElementById(id);
const images = {};
const timings = {
  sword: { startup: 11, active: 6, recovery: 14 },
  air: { startup: 4, active: 11, recovery: 12 },
  bow: { startup: 42, active: 1, recovery: 36 },
};
const frameSize = 512;
const origin = [0.375, 0.8203125];
const displayScale = 0.5;
const actorX = 290;
const actorY = 405;
const width = 580;
const height = 440;
const actor = document.createElement('canvas');
const fx = document.createElement('canvas');
const mask = document.createElement('canvas');
for (const canvas of [actor, fx, mask]) {
  canvas.width = width;
  canvas.height = height;
}

await Promise.all(
  ['smooth-idle', 'smooth-combo', 'smooth-attack', 'smooth-bow'].map(async (key) => {
    const image = new Image();
    image.src = `assets/sd-v3/${key}.png`;
    await image.decode();
    images[key] = image;
  }),
);
const oldBow = new Image();
oldBow.src = 'assets/hand-review/bow-before.png';
await oldBow.decode();

let time = 0;
let playing = true;
let last = performance.now();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const step = (time, count) => Math.min(count - 1, Math.floor(Math.max(0, time) * count));
const attackLength = (mode) => {
  const data = timings[mode];
  return data.startup + data.active + data.recovery;
};
const duration = (mode) => attackLength(mode) / 60 + 0.55;

function pose(mode, elapsed) {
  const timing = timings[mode];
  const frameTime = elapsed * 60;
  const active = frameTime >= timing.startup && frameTime < timing.startup + timing.active;
  const progress = clamp((frameTime - timing.startup) / timing.active, 0, 1);
  if (mode === 'bow') {
    return {
      sheet: 'smooth-bow',
      frame: elapsed < 0.7 ? 4 + step(elapsed / 0.7, 3) : 7,
      active,
      progress,
    };
  }

  let attackFrame;
  if (frameTime < timing.startup) {
    attackFrame = step(frameTime / timing.startup, 2);
  } else if (active) {
    attackFrame = 2 + step((frameTime - timing.startup) / timing.active, 2);
  } else {
    attackFrame = 4 + step((frameTime - timing.startup - timing.active) / timing.recovery, 2);
  }
  return {
    sheet: mode === 'air' ? 'smooth-attack' : 'smooth-combo',
    frame: mode === 'air' ? 6 + attackFrame : attackFrame,
    active,
    progress,
  };
}

function drawSprite(ctx, sheet, frame, facing) {
  const image = images[sheet];
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(actorX, actorY);
  ctx.scale(facing * displayScale, displayScale);
  // Phaser's SD v3 sheets use the same foot origin; mirrored actors shift originX to 1-originX.
  const originX = facing < 0 ? 1 - origin[0] : origin[0];
  ctx.drawImage(
    image,
    (frame % 4) * frameSize,
    Math.floor(frame / 4) * frameSize,
    frameSize,
    frameSize,
    -originX * frameSize,
    -origin[1] * frameSize,
    frameSize,
    frameSize,
  );
  ctx.restore();
}

function drawBowContactFlash(ctx, facing, progress, alpha, trailLength, particleCount) {
  // Authored release point in smooth-bow frame 7: source origin (256,420), contact (348,246).
  const x = actorX + (348 - origin[0] * frameSize) * displayScale * facing;
  const y = actorY + (246 - 420) * displayScale;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#a6e5f1';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + facing * (10 + trailLength * 76 * progress), y);
  ctx.stroke();
  ctx.strokeStyle = '#fff1b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - facing * 4, y);
  ctx.lineTo(x + facing * 5, y);
  ctx.moveTo(x, y - 5);
  ctx.lineTo(x, y + 5);
  ctx.stroke();
  drawParticles(ctx, x + facing * 10, y, facing, particleCount, alpha);
  ctx.restore();
}

function drawParticles(ctx, x, y, facing, count, alpha) {
  const pattern = [
    [9, -7],
    [17, 5],
    [25, -3],
    [31, 9],
    [39, -9],
    [46, 3],
  ];
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (let index = 0; index < count; index++) {
    const [offsetX, offsetY] = pattern[index];
    ctx.fillStyle = index % 2 ? '#fff1b8' : '#78d7ec';
    ctx.fillRect(x + offsetX * facing, y + offsetY, 2, 2);
  }
  ctx.restore();
}

function drawSwordTrail(ctx, facing, progress, alpha, trailLength, particleCount) {
  const visibleProgress = progress < 0.5 ? progress * 2 : 1;
  // Measured blade-tip keypoints in current SD v3 combo frames 2 and 3.
  const startX = 155;
  const startY = 138;
  const endX = 400;
  const endY = 350;
  const tipX =
    actorX +
    (startX + (endX - startX) * visibleProgress - origin[0] * frameSize) * displayScale * facing;
  const tipY =
    actorY + (startY + (endY - startY) * visibleProgress - origin[1] * frameSize) * displayScale;
  const startScreenX = actorX + (startX - origin[0] * frameSize) * displayScale * facing;
  const startScreenY = actorY + (startY - origin[1] * frameSize) * displayScale;
  const controlX = actorX + facing * (115 * visibleProgress);
  const controlY = actorY - 145;
  const tailAlpha = clamp(trailLength / 0.12, 0.4, 1);
  ctx.save();
  ctx.globalAlpha = alpha * tailAlpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#53c9e8';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(startScreenX, startScreenY);
  ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
  ctx.stroke();
  ctx.strokeStyle = '#e7fbff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(startScreenX + facing * 3, startScreenY - 2);
  ctx.quadraticCurveTo(controlX, controlY + 5, tipX, tipY - 2);
  ctx.stroke();
  ctx.fillStyle = '#fff1b8';
  ctx.fillRect(tipX - 2, tipY - 2, 4, 4);
  drawParticles(ctx, tipX, tipY, facing, particleCount, alpha);
  ctx.restore();
}

function drawAirTrail(ctx, facing, progress, alpha, trailLength, particleCount, tailProgress) {
  // The active pose points the integrated blade down; effects bracket its outer edge.
  const topX = actorX + facing * 50;
  const bottomX = actorX + facing * (132 + 12 * progress);
  const topY = actorY - 195;
  const bottomY = actorY - 15;
  const tailAlpha = tailProgress > 0 ? Math.max(0, 1 - tailProgress) : 1;
  ctx.save();
  ctx.globalAlpha = alpha * tailAlpha;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#55cce8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(topX, topY);
  ctx.quadraticCurveTo(actorX + facing * 139, actorY - 112, bottomX, bottomY);
  ctx.moveTo(topX - facing * 15, topY + 15);
  ctx.quadraticCurveTo(actorX + facing * 124, actorY - 96, bottomX - facing * 14, bottomY + 2);
  ctx.stroke();
  ctx.strokeStyle = '#e7fbff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(topX, topY + 5);
  ctx.quadraticCurveTo(actorX + facing * 133, actorY - 106, bottomX, bottomY - 2);
  ctx.moveTo(topX - facing * 15, topY + 18);
  ctx.quadraticCurveTo(actorX + facing * 118, actorY - 90, bottomX - facing * 14, bottomY);
  ctx.stroke();
  const ringProgress = clamp((progress - 0.62) / 0.38, 0, 1);
  if (ringProgress > 0) {
    ctx.globalAlpha *= 0.75;
    ctx.strokeStyle = '#a6e5f1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(
      actorX + facing * 25,
      actorY - 3,
      8 + 25 * ringProgress,
      3 + 4 * ringProgress,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    drawParticles(
      ctx,
      actorX + facing * 35,
      actorY - 8,
      facing,
      Math.min(particleCount, 3),
      alpha * 0.6,
    );
  }
  // Shorten the two trails as the user adjusts the retained tail.
  if (trailLength < 0.12) {
    ctx.globalAlpha *= trailLength / 0.12;
  }
  ctx.restore();
}

function drawEffect(mode, elapsed, p, rest) {
  const ctx = fx.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  if (rest) return;
  const timing = timings[mode];
  const attackEnd = (timing.startup + timing.active) / 60;
  const tail = elapsed - attackEnd;
  const trailLength = Number($('trail').value);
  const strength = Number($('strength').value);
  const particles = Number($('particles').value);
  const contrast = Number($('contrast').value);
  const visible = p.active || (tail >= 0 && tail < trailLength);
  if (!visible) return;
  const alpha = strength * (p.active ? 1 : clamp(1 - tail / trailLength, 0, 1));
  const facing = $('flip').checked ? -1 : 1;
  ctx.filter = `contrast(${contrast})`;
  if (mode === 'sword') drawSwordTrail(ctx, facing, p.progress, alpha, trailLength, particles);
  else if (mode === 'air')
    drawAirTrail(
      ctx,
      facing,
      p.progress,
      alpha,
      trailLength,
      particles,
      Math.max(0, tail / trailLength),
    );
  else drawBowContactFlash(ctx, facing, p.progress, alpha, trailLength / 0.22, particles);

  // Preserve the authored SD v3 sprite and integrated weapon plus a four-pixel safety margin.
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'destination-out';
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) ctx.drawImage(mask, x, y);
  ctx.globalCompositeOperation = 'source-over';
}

function render() {
  const mode = $('mode').value;
  const totalFrames = attackLength(mode);
  const fullDuration = duration(mode);
  const elapsed = Math.min(totalFrames / 60 - 0.0001, time * fullDuration);
  const rest = time * fullDuration > totalFrames / 60;
  const current = rest
    ? { sheet: mode === 'bow' ? 'smooth-bow' : 'smooth-idle', frame: 0, active: false, progress: 0 }
    : pose(mode, elapsed);
  const facing = $('flip').checked ? -1 : 1;

  const actorCtx = actor.getContext('2d');
  actorCtx.clearRect(0, 0, width, height);
  drawSprite(actorCtx, current.sheet, current.frame, facing);

  const maskCtx = mask.getContext('2d');
  maskCtx.clearRect(0, 0, width, height);
  maskCtx.drawImage(actor, 0, 0);
  const maskPixels = maskCtx.getImageData(0, 0, width, height);
  for (let index = 3; index < maskPixels.data.length; index += 4)
    maskPixels.data[index] = maskPixels.data[index] > 0 ? 255 : 0;
  maskCtx.putImageData(maskPixels, 0, 0);
  drawEffect(mode, elapsed, current, rest);

  for (const id of ['before', 'after']) {
    const ctx = $(id).getContext('2d');
    ctx.fillStyle = '#101b25';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#354958';
    ctx.beginPath();
    ctx.moveTo(20, 406);
    ctx.lineTo(560, 406);
    ctx.stroke();
    if (id === 'after') ctx.drawImage(fx, 0, 0);
    ctx.drawImage(actor, 0, 0);
  }

  $('phase').textContent = rest
    ? '대기'
    : current.active
      ? '공격 활성'
      : elapsed * 60 < timings[mode].startup
        ? '준비'
        : '회복';
  $('status').textContent =
    `${current.sheet} / ${current.frame}번 · SD v3 · 무기 포함 원본 프레임 · 실루엣 보호 4px`;
  $('time').value = time;
  $('strength-value').textContent = Number($('strength').value).toFixed(2);
  $('contrast-value').textContent = Number($('contrast').value).toFixed(1);
  $('trail-value').textContent = `${Number($('trail').value).toFixed(2)}s`;
  $('particles-value').textContent = $('particles').value;
}

$('play').onclick = () => {
  playing = !playing;
  $('play').textContent = playing ? '일시 정지' : '재생';
};
$('reset').onclick = () => {
  time = 0;
  render();
};
$('time').oninput = () => {
  playing = false;
  $('play').textContent = '재생';
  time = Number($('time').value);
  render();
};
for (const id of ['mode', 'strength', 'contrast', 'flip', 'trail', 'particles'])
  $(id).oninput = $(id).onchange = () => {
    if (id === 'mode' || id === 'flip') time = 0;
    render();
  };

window.effectReviewAudit = () => {
  const before = $('before').getContext('2d').getImageData(0, 0, width, height).data;
  const after = $('after').getContext('2d').getImageData(0, 0, width, height).data;
  const protectedPixels = actor.getContext('2d').getImageData(0, 0, width, height).data;
  let protectedDifferences = 0;
  let effectPixels = 0;
  for (let index = 0; index < before.length; index += 4) {
    const changed =
      before[index] !== after[index] ||
      before[index + 1] !== after[index + 1] ||
      before[index + 2] !== after[index + 2];
    if (changed) {
      effectPixels++;
      if (protectedPixels[index + 3] > 0) protectedDifferences++;
    }
  }
  return { protectedDifferences, effectPixels };
};

const handsCtx = $('hands').getContext('2d');
handsCtx.imageSmoothingEnabled = false;
for (let index = 0; index < 2; index++) {
  handsCtx.fillStyle = '#c5d5e2';
  handsCtx.font = '16px system-ui';
  handsCtx.fillText(index ? '교정 후' : '교정 전', index * 560 + 20, 25);
  handsCtx.drawImage(
    index ? images['smooth-bow'] : oldBow,
    233,
    250,
    92,
    78,
    index * 560 + 70,
    55,
    368,
    234,
  );
}

function tick(now) {
  if (playing) {
    const elapsedSeconds = Math.min((now - last) / 1000, 0.1) * Number($('speed').value);
    time = (time + elapsedSeconds / duration($('mode').value)) % 1;
  }
  last = now;
  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
