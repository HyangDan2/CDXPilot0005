const image = new Image();
image.src = '/assets/sd-v3/smooth-bow.png';
const canvases = [
  [document.getElementById('right'), 1],
  [document.getElementById('left'), -1],
];

image.onload = () => canvases.forEach(([canvas, facing]) => draw(canvas.getContext('2d'), facing));

function draw(context, facing) {
  context.clearRect(0, 0, 256, 256);
  context.fillStyle = '#101b25';
  context.fillRect(0, 0, 256, 256);
  context.save();
  if (facing < 0) {
    context.translate(256, 0);
    context.scale(-1, 1);
  }
  context.drawImage(image, 1536, 512, 512, 512, 0, 0, 256, 256);
  context.restore();

  const actorX = 128;
  const oldY = 210 - 50 * 0.5;
  const muzzleX = actorX + facing * ((348 - 256) * 0.5);
  const muzzleY = 210 - (420 - 246) * 0.5;
  const shaftBaseX = muzzleX - facing * 7 * 0.5;

  context.save();
  context.setLineDash([4, 3]);
  context.strokeStyle = '#ff8a68';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(actorX - facing * 24, oldY);
  context.lineTo(actorX + facing * 24, oldY);
  context.stroke();
  context.restore();

  context.strokeStyle = '#26303b';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(shaftBaseX - facing * 58 * 0.5, muzzleY);
  context.lineTo(shaftBaseX, muzzleY);
  context.stroke();

  context.strokeStyle = '#e7d4a5';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(shaftBaseX - facing * 58 * 0.5, muzzleY);
  context.lineTo(shaftBaseX, muzzleY);
  context.stroke();

  context.fillStyle = '#daf5ff';
  context.beginPath();
  context.moveTo(muzzleX, muzzleY);
  context.lineTo(shaftBaseX - facing * 7 * 0.5, muzzleY - 1.75);
  context.lineTo(shaftBaseX - facing * 7 * 0.5, muzzleY + 1.75);
  context.closePath();
  context.fill();
  context.strokeStyle = '#26303b';
  context.lineWidth = 0.75;
  context.stroke();

  context.strokeStyle = '#26303b';
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(shaftBaseX - facing * 58 * 0.5, muzzleY);
  context.lineTo(shaftBaseX - facing * 65 * 0.5, muzzleY - 2);
  context.moveTo(shaftBaseX - facing * 58 * 0.5, muzzleY);
  context.lineTo(shaftBaseX - facing * 65 * 0.5, muzzleY + 2);
  context.stroke();
  context.strokeStyle = '#c7d0b6';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(shaftBaseX - facing * 58 * 0.5, muzzleY);
  context.lineTo(shaftBaseX - facing * 65 * 0.5, muzzleY - 2);
  context.moveTo(shaftBaseX - facing * 58 * 0.5, muzzleY);
  context.lineTo(shaftBaseX - facing * 65 * 0.5, muzzleY + 2);
  context.stroke();

  context.fillStyle = '#ff8a68';
  context.beginPath();
  context.arc(actorX + facing * 30, oldY, 2.5, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#a8fff0';
  context.beginPath();
  context.arc(muzzleX, muzzleY, 2, 0, Math.PI * 2);
  context.fill();
}
