import fs from 'node:fs';
import assert from 'node:assert/strict';
for (const [name, duration] of Object.entries({
  'cloister-march': 38.4,
  'ashen-king': 38.4,
  victory: 11.52,
  defeat: 27.2,
})) {
  const b = fs.readFileSync(`public/assets/audio/${name}.wav`);
  assert.equal(b.toString('ascii', 0, 4), 'RIFF');
  assert.equal(b.toString('ascii', 8, 12), 'WAVE');
  assert.equal(b.readUInt16LE(22), 1);
  assert.equal(b.readUInt32LE(24), 22050);
  assert.equal(b.readUInt16LE(34), 16);
  const n = (b.length - 44) / 2;
  assert.equal(n / 22050, duration);
  let peak = 0,
    sum = 0;
  for (let i = 0; i < n; i++) {
    const x = b.readInt16LE(44 + i * 2) / 32768;
    peak = Math.max(peak, Math.abs(x));
    sum += x * x;
  }
  assert.ok(peak < 0.73 && peak > 0.5);
  assert.ok(Math.sqrt(sum / n) > 0.04);
  assert.ok(Math.abs(b.readInt16LE(44) - b.readInt16LE(b.length - 2)) / 32768 < 0.02);
  console.log(`${name}: ${duration}s PCM loop, no clipping, non-silent, bounded loop boundary.`);
}
