const FRAME_COUNT = 8;
const COLUMNS = 4;
const image = new Image();
const playback = document.getElementById('playback');
const context = playback.getContext('2d');
const readout = document.getElementById('readout');
const status = document.getElementById('status');
const toggle = document.getElementById('toggle');
const fps = document.getElementById('fps');
const fpsValue = document.getElementById('fps-value');
const thumbnailButtons = [];
let frameIndex = 0;
let isPlaying = true;
let lastFrameTime = 0;
let animationRequest = 0;

const drawFrame = (targetContext, index) => {
  const sourceWidth = image.naturalWidth / COLUMNS;
  const sourceHeight = image.naturalHeight / 2;
  const row = Math.floor(index / COLUMNS);
  const column = index % COLUMNS;
  targetContext.clearRect(0, 0, targetContext.canvas.width, targetContext.canvas.height);
  targetContext.imageSmoothingEnabled = false;
  targetContext.drawImage(
    image,
    column * sourceWidth,
    row * sourceHeight,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetContext.canvas.width,
    targetContext.canvas.height,
  );
};

const selectFrame = (index) => {
  frameIndex = (index + FRAME_COUNT) % FRAME_COUNT;
  drawFrame(context, frameIndex);
  readout.textContent = `${frameIndex + 1} / ${FRAME_COUNT}`;
  thumbnailButtons.forEach((button, buttonIndex) => {
    button.setAttribute('aria-pressed', String(buttonIndex === frameIndex));
  });
};

const tick = (time) => {
  if (isPlaying && time - lastFrameTime >= 1000 / Number(fps.value)) {
    lastFrameTime = time;
    selectFrame(frameIndex + 1);
  }
  animationRequest = requestAnimationFrame(tick);
};

document.getElementById('previous').addEventListener('click', () => selectFrame(frameIndex - 1));
document.getElementById('next').addEventListener('click', () => selectFrame(frameIndex + 1));
toggle.addEventListener('click', () => {
  isPlaying = !isPlaying;
  toggle.textContent = isPlaying ? '일시정지' : '재생';
  toggle.setAttribute('aria-pressed', String(isPlaying));
});
fps.addEventListener('input', () => { fpsValue.value = fps.value; });

for (let index = 0; index < FRAME_COUNT; index += 1) {
  const button = document.createElement('button');
  const canvas = document.createElement('canvas');
  const label = document.createElement('span');
  const thumbContext = canvas.getContext('2d');
  button.type = 'button';
  button.className = 'thumb';
  button.setAttribute('aria-label', `프레임 ${index + 1} 보기`);
  button.setAttribute('aria-pressed', 'false');
  canvas.width = 256;
  canvas.height = 256;
  label.textContent = `프레임 ${index + 1}`;
  button.append(canvas, label);
  button.addEventListener('click', () => {
    isPlaying = false;
    toggle.textContent = '재생';
    toggle.setAttribute('aria-pressed', 'false');
    selectFrame(index);
  });
  document.getElementById('thumbs').append(button);
  thumbnailButtons.push(button);
  button.dataset.index = String(index);
  button._draw = () => drawFrame(thumbContext, index);
}

image.onload = () => {
  thumbnailButtons.forEach((button) => button._draw());
  selectFrame(0);
  status.textContent = '8개 프레임을 불러왔습니다. 썸네일을 눌러 프레임별로 확인할 수 있습니다.';
  window.__BOW_RUN_PREVIEW_READY__ = true;
};
image.onerror = () => { status.textContent = '시안 이미지를 불러오지 못했습니다.'; };
image.src = './assets/review/eira-bow-run-motion-v2.png';
animationRequest = requestAnimationFrame(tick);

window.addEventListener('beforeunload', () => cancelAnimationFrame(animationRequest));
