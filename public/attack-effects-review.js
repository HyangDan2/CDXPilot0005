const $ = (id) => document.getElementById(id);
const images = {};
await Promise.all(
  ['idle', 'combo', 'attack', 'bow'].map(async (key) => {
    const im = new Image();
    im.src = `assets/sd-v3/smooth-${key}.png`;
    await im.decode();
    images[key] = im;
  }),
);
const timings = { sword: [11, 6, 14], air: [4, 11, 12], bow: [42, 1, 36] };
const actor = document.createElement('canvas'),
  fx = document.createElement('canvas'),
  mask = document.createElement('canvas');
for (const c of [actor, fx, mask]) {
  c.width = 580;
  c.height = 440;
}
let time = 0,
  playing = true,
  last = performance.now();
function pose(mode, elapsed) {
  const [start, active, recover] = timings[mode],
    t = elapsed * 60;
  let frame =
    t < start
      ? Math.min(1, Math.floor((t / start) * 2))
      : t < start + active
        ? 2 + Math.min(1, Math.floor(((t - start) / active) * 2))
        : 4 + Math.min(1, Math.floor(((t - start - active) / recover) * 2));
  if (mode === 'bow') frame = t < 42 ? 4 + Math.min(2, Math.floor((t / 42) * 3)) : 7;
  return {
    sheet: mode === 'air' ? 'attack' : mode === 'bow' ? 'bow' : 'combo',
    frame: frame + (mode === 'air' ? 6 : 0),
    active: t >= start && t < start + active,
    progress: Math.max(0, Math.min(1, (t - start) / active)),
    tail: (t - start - active) / 60,
  };
}
function sprite(ctx, p) {
  ctx.save();
  ctx.translate(260, 405);
  ctx.scale($('flip').checked ? -0.8 : 0.8, 0.8);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    images[p.sheet],
    (p.frame % 4) * 512,
    Math.floor(p.frame / 4) * 512,
    512,
    512,
    -256,
    -420,
    512,
    512,
  );
  ctx.restore();
}
function render() {
  const mode = $('mode').value,
    frames = timings[mode].reduce((a, b) => a + b, 0),
    duration = frames / 60 + 0.55;
  const elapsed = Math.min(frames / 60 - 0.0001, time * duration),
    p = pose(mode, elapsed),
    rest = time * duration > frames / 60;
  if (rest) {
    p.sheet = mode === 'bow' ? 'bow' : 'idle';
    p.frame = 0;
    p.active = false;
    p.tail = 1;
  }
  const ac = actor.getContext('2d');
  ac.clearRect(0, 0, 580, 440);
  sprite(ac, p);
  const mc = mask.getContext('2d');
  mc.clearRect(0, 0, 580, 440);
  mc.drawImage(actor, 0, 0);
  const pixels = mc.getImageData(0, 0, 580, 440);
  for (let i = 3; i < pixels.data.length; i += 4) pixels.data[i] = pixels.data[i] > 0 ? 255 : 0;
  mc.putImageData(pixels, 0, 0);
  const fc = fx.getContext('2d');
  fc.clearRect(0, 0, 580, 440);
  const visible = !rest && (p.active || (p.tail >= 0 && p.tail < 0.1));
  if (visible) {
    const alpha = Number($('strength').value) * (p.active ? 1 : 1 - p.tail / 0.1);
    fc.save();
    fc.translate(260, 405);
    if ($('flip').checked) fc.scale(-1, 1);
    fc.globalAlpha = alpha;
    fc.lineCap = 'round';
    fc.strokeStyle = '#a6e5f1';
    fc.lineWidth = 5;
    fc.beginPath();
    if (mode === 'bow') {
      fc.moveTo(142, -121);
      fc.lineTo(173 + 35 * p.progress, -121);
    } else if (mode === 'air') {
      fc.moveTo(44, -245);
      fc.quadraticCurveTo(156, -183, 160, -34);
    } else {
      fc.arc(18, -115, 142, -0.92, 0.85);
    }
    fc.stroke();
    fc.strokeStyle = '#fff1b8';
    fc.lineWidth = 2;
    fc.beginPath();
    if (mode === 'bow') {
      fc.moveTo(150, -128);
      fc.lineTo(150, -114);
    } else {
      const x = mode === 'air' ? 160 : 112,
        y = mode === 'air' ? -34 : -18;
      fc.moveTo(x - 5, y);
      fc.lineTo(x + 5, y);
      fc.moveTo(x, y - 5);
      fc.lineTo(x, y + 5);
    }
    fc.stroke();
    fc.restore();
  }
  fc.globalCompositeOperation = 'destination-out';
  for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) fc.drawImage(mask, x, y);
  fc.globalCompositeOperation = 'source-over';
  for (const id of ['before', 'after']) {
    const ctx = $(id).getContext('2d');
    ctx.fillStyle = '#101b25';
    ctx.fillRect(0, 0, 580, 440);
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
    : p.active
      ? '공격 활성'
      : elapsed * 60 < timings[mode][0]
        ? '준비'
        : '회복';
  $('status').textContent = `${p.sheet} / ${p.frame}번 · 캐릭터 배율 동일 · 실루엣 보호 4px`;
  $('time').value = time;
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
for (const id of ['mode', 'strength', 'flip'])
  $(id).onchange = () => {
    time = 0;
    render();
  };
// The integration test checks that no protected actor pixel differs between the two canvases.
window.effectReviewAudit = () => {
  const a = $('before').getContext('2d').getImageData(0, 0, 580, 440).data,
    b = $('after').getContext('2d').getImageData(0, 0, 580, 440).data,
    m = actor.getContext('2d').getImageData(0, 0, 580, 440).data;
  let protectedDifferences = 0,
    effectPixels = 0;
  for (let i = 0; i < a.length; i += 4) {
    const changed = a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2];
    if (changed) {
      effectPixels++;
      if (m[i + 3] > 0) protectedDifferences++;
    }
  }
  return { protectedDifferences, effectPixels };
};
const old = new Image();
old.src = 'assets/hand-review/bow-before.png';
await old.decode();
const hc = $('hands').getContext('2d');
hc.imageSmoothingEnabled = false;
for (let i = 0; i < 2; i++) {
  hc.fillStyle = '#c5d5e2';
  hc.font = '16px system-ui';
  hc.fillText(i ? '교정 후' : '교정 전', i * 560 + 20, 25);
  hc.drawImage(i ? images.bow : old, 233, 250, 92, 78, i * 560 + 70, 55, 368, 234);
}
function tick(now) {
  if (playing) {
    const length = timings[$('mode').value].reduce((a, b) => a + b, 0) / 60 + 0.55;
    time = (time + (Math.min((now - last) / 1000, 0.1) / length) * Number($('speed').value)) % 1;
  }
  last = now;
  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
