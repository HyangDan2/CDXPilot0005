const images = {};
await Promise.all(
  ['bow', 'attack'].map(async (name) => {
    const image = new Image();
    image.src = `assets/sd-v3/smooth-${name}.png`;
    await image.decode();
    images[name] = image;
  }),
);
const $ = (id) => document.getElementById(id);
const candidates = {
  four: { frames: [0, 1, 15, 14, 15, 1], durations: [0.7, 0.4, 0.5, 0.4, 0.5, 0.5] },
  two: { frames: [0, 1], durations: [0.9, 0.9] },
};
let t = 0,
  playing = true,
  last = performance.now();
function frameAt(time, frames, durations) {
  let p = time % durations.reduce((a, b) => a + b, 0);
  for (let i = 0; i < frames.length; i++) {
    if (p < durations[i]) return frames[i];
    p -= durations[i];
  }
  return frames[0];
}
function sprite(ctx, name, f, x, y, s, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -s : s, s);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    images[name],
    (f % 4) * 512,
    Math.floor(f / 4) * 512,
    512,
    512,
    -256,
    -420,
    512,
    512,
  );
  ctx.restore();
}
function draw(id, f) {
  const c = $(id),
    ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#557081';
  ctx.beginPath();
  ctx.moveTo(15, 420);
  ctx.lineTo(535, 420);
  ctx.stroke();
  sprite(ctx, 'bow', f, 250, 420, Number($('zoom').value), $('flip').checked);
  $(id + 'Label').textContent = `smooth-bow / ${f}번 · 배율 변경 없음`;
}
function contact(id, name, frames, cols, scale) {
  const c = $(id),
    ctx = c.getContext('2d'),
    w = c.width / cols,
    h = c.height / Math.ceil(frames.length / cols);
  ctx.clearRect(0, 0, c.width, c.height);
  frames.forEach((f, i) => {
    const x = (i % cols) * w,
      y = Math.floor(i / cols) * h;
    ctx.fillStyle = '#cedee8';
    ctx.font = '14px system-ui';
    ctx.fillText(`${f}번`, x + 14, y + 24);
    ctx.strokeStyle = '#354c5c';
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
    sprite(ctx, name, f, x + w / 2, y + h - 15, scale);
  });
}
function render() {
  const option = candidates[$('mode').value];
  draw('before', frameAt(t, [0, 1], [1.5, 1.5]));
  draw('after', frameAt(t, option.frames, option.durations));
  $('clock').textContent = `${t.toFixed(2)}초`;
  $('time').value = t;
  $('description').textContent =
    $('mode').value === 'four'
      ? 'B안 · 3초 주기: 0→1→15→14→15→1. 네 개의 기존 자세를 사용해 정지감을 줄입니다. 자세 전환의 자연스러움은 아래 원본 비교와 함께 판단하세요.'
      : 'A안 · 1.8초 주기: 기존 0·1번을 각 0.9초 유지합니다. 원본 동작을 가장 적게 바꾸지만 변화 폭도 작습니다.';
}
$('play').onclick = () => {
  playing = !playing;
  $('play').textContent = playing ? '일시 정지' : '재생';
};
$('reset').onclick = () => {
  t = 0;
  render();
};
$('time').oninput = () => {
  playing = false;
  $('play').textContent = '재생';
  t = Number($('time').value);
  render();
};
for (const id of ['mode', 'zoom', 'flip']) $(id).onchange = render;
contact('poses', 'bow', [0, 1, 14, 15], 4, 0.75);
contact('air', 'attack', [6, 7, 8, 9, 10, 11], 3, 0.72);
function tick(now) {
  if (playing) t = (t + Math.min((now - last) / 1000, 0.1) * Number($('speed').value)) % 9;
  last = now;
  render();
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
