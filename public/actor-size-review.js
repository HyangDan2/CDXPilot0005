const audit = await fetch('assets/size-review/audit.json').then((r) => r.json());
const images = {};
await Promise.all(
  ['idle', 'attack', 'reaction'].map(async (name) => {
    const img = new Image();
    img.src = `assets/sd-v3/smooth-${name}.png`;
    await img.decode();
    images[`smooth-${name}`] = img;
  }),
);
const $ = (id) => document.getElementById(id);
let playing = true,
  idleTime = 0,
  airTime = 0,
  previous = performance.now();
const record = (sheet, frame) => audit.records.find((r) => r.sheet === sheet && r.frame === frame);
function sprite(ctx, sheet, frame, x, y, scale, flip = false, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -scale : scale, scale);
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    images[sheet],
    (frame % 4) * 512,
    Math.floor(frame / 4) * 512,
    512,
    512,
    -256,
    -420,
    512,
    512,
  );
  ctx.restore();
}
function draw(id, sheet, frame, correction = 1, ghost = false) {
  const c = $(id),
    ctx = c.getContext('2d'),
    s = Number($('zoom').value),
    flip = $('flip').checked;
  ctx.clearRect(0, 0, c.width, c.height);
  const x = 245,
    y = 425;
  ctx.strokeStyle = '#354959';
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(540, y);
  ctx.stroke();
  if (ghost) sprite(ctx, 'smooth-idle', 0, x, y, s, flip, 0.15);
  sprite(ctx, sheet, frame, x, y, s * correction, flip);
  if ($('marks').checked) {
    const r = record(sheet, frame),
      [mx, my, mw, mh] = r.medal;
    ctx.strokeStyle = '#67d8d3';
    ctx.strokeRect(
      x + (flip ? 256 - mx - mw : mx - 256) * s * correction,
      y + (my - 420) * s * correction,
      mw * s * correction,
      mh * s * correction,
    );
    ctx.strokeStyle = '#c8a769';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(20, y + (112 - 420) * s);
    ctx.lineTo(540, y + (112 - 420) * s);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#9fb2c2';
    ctx.font = '12px system-ui';
    ctx.fillText('대기 0번 상단 기준', 20, y + (112 - 420) * s - 8);
  }
  $(id + 'Label').textContent =
    `${sheet} / ${frame}번 · 이미지 배율 ${Math.round(correction * 100)}%`;
}
function airPose(t) {
  if (t < 0.35) return ['smooth-idle', 0];
  if (t < 0.5) return ['smooth-reaction', 2];
  if (t < 0.7) return ['smooth-reaction', 3];
  if (t < 1.15) {
    const a = t - 0.7;
    const f =
      a < 4 / 60
        ? Math.min(1, Math.floor((a / (4 / 60)) * 2))
        : a < 15 / 60
          ? 2 + Math.min(1, Math.floor(((a - 4 / 60) / (11 / 60)) * 2))
          : 4 + Math.min(1, Math.floor(((a - 15 / 60) / 0.2) * 2));
    return ['smooth-attack', 6 + f];
  }
  if (t < 1.25) return ['smooth-reaction', 6];
  if (t < 1.35) return ['smooth-reaction', 7];
  return ['smooth-idle', 0];
}
function details() {
  const ctx = $('details').getContext('2d');
  ctx.clearRect(0, 0, 1120, 320);
  const selected = airPose(airTime);
  const attackFrame = selected[0] === 'smooth-attack' ? selected[1] : 6;
  const poses = [
    ['대기 0', 'smooth-idle', 0, 1],
    ['낮은 대기 10', 'smooth-idle', 10, 1],
    ['점프 3', 'smooth-reaction', 3, 1],
    [`공중 공격 ${attackFrame}`, 'smooth-attack', attackFrame, 1],
    [`공중 공격 ${attackFrame} · 후보`, 'smooth-attack', attackFrame, Number($('airScale').value)],
  ];
  for (let i = 0; i < poses.length; i++) {
    const [label, sheet, f, s] = poses[i],
      r = record(sheet, f),
      [mx, my, mw, mh] = r.medal,
      centerX = mx + mw / 2,
      centerY = my + mh / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(i * 224, 40, 224, 270);
    ctx.clip();
    sprite(ctx, sheet, f, i * 224 + 94 - (centerX - 256) * s, 90 - (centerY - 420) * s, s);
    ctx.restore();
    ctx.fillStyle = '#c9dae7';
    ctx.font = '13px system-ui';
    ctx.fillText(label, i * 224 + 12, 24);
    ctx.strokeStyle = '#345061';
    ctx.strokeRect(i * 224 + 1, 40, 222, 270);
  }
}
function render() {
  draw('idleBefore', 'smooth-idle', Math.floor(idleTime * 4) % 12);
  draw('idleAfter', 'smooth-idle', audit.idleCandidate[Math.floor(idleTime * 4) % 12]);
  const [sheet, f] = airPose(airTime);
  draw('airBefore', sheet, f, 1, true);
  draw('airAfter', sheet, f, sheet === 'smooth-attack' ? Number($('airScale').value) : 1, true);
  details();
  $('idleTime').value = idleTime;
  $('airTime').value = airTime;
}
$('play').onclick = () => {
  playing = !playing;
  $('play').textContent = playing ? '일시 정지' : '재생';
};
$('reset').onclick = () => {
  idleTime = airTime = 0;
  render();
};
for (const id of ['idleTime', 'airTime'])
  $(id).oninput = () => {
    playing = false;
    $('play').textContent = '재생';
    if (id === 'idleTime') idleTime = Number($(id).value);
    else airTime = Number($(id).value);
    render();
  };
$('airScale').oninput = () => {
  $('scaleLabel').textContent = `${(Number($('airScale').value) * 100).toFixed(1)}%`;
  render();
};
for (const id of ['zoom', 'flip', 'marks']) $(id).onchange = render;
$('measurements').innerHTML = audit.records
  .map(
    (r) =>
      `<tr><td>${r.sheet} / ${r.frame}</td><td>${r.height}px</td><td>${r.medal[2]} × ${r.medal[3]}px</td></tr>`,
  )
  .join('');
function tick(now) {
  const dt = Math.min((now - previous) / 1000, 0.1) * Number($('speed').value);
  previous = now;
  if (playing) {
    idleTime = (idleTime + dt) % 3;
    airTime = (airTime + dt) % 1.65;
  }
  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
