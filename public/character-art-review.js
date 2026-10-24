const names = ['smooth-bow-walk', 'smooth-bow-run', 'smooth-rusher', 'smooth-flyer'];
const sheets = new Map();
const loadSheet = (name) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${name}`));
    image.src = `./assets/sd-v3/${name}.png`;
  });
const drawFrame = (ctx, sheet, frame, dx = 32, dy = 20, scale = 0.5) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    sheet,
    (frame % 4) * 512,
    Math.floor(frame / 4) * 512,
    512,
    512,
    dx,
    dy,
    512 * scale,
    512 * scale,
  );
};
const animate = (id, name, frames, fps) => {
  const canvas = document.getElementById(id),
    ctx = canvas.getContext('2d'),
    sheet = sheets.get(name),
    frameDuration = 1000 / fps;
  let started = 0;
  const tick = (time) => {
    if (!started) started = time;
    const frame = frames[Math.floor((time - started) / frameDuration) % frames.length];
    drawFrame(ctx, sheet, frame);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

try {
  await Promise.all(names.map(async (name) => sheets.set(name, await loadSheet(name))));
  animate('bow-walk', 'smooth-bow-walk', [0, 1, 2, 3, 4, 5, 6, 7], 16);
  animate('bow-run', 'smooth-bow-run', [0, 1, 2, 3, 4, 5, 6, 7], 24);
  animate('rusher', 'smooth-rusher', [2, 3, 4, 5, 6, 7, 5, 3], 24);
  animate('flyer', 'smooth-flyer', [0, 1, 2, 3, 4, 5, 6, 7], 16);
  const phaseGrid = document.getElementById('flyer-phases');
  for (let frame = 8; frame < 16; frame++) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    canvas.setAttribute('aria-label', `Ashwing frame ${frame}`);
    phaseGrid.append(canvas);
    drawFrame(canvas.getContext('2d'), sheets.get('smooth-flyer'), frame, 0, 0, 0.5);
  }
  document.getElementById('asset-status').textContent = 'All four packed sheets loaded.';
  window.__ART_REVIEW_READY__ = true;
} catch (error) {
  document.getElementById('asset-status').textContent = error.message;
}
