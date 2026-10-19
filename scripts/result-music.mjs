/** Original major victory fanfare / minor defeat lament, additive synthesis. */
import fs from 'node:fs';
for (const won of [true, false]) {
  const rate = 22050,
    beat = won ? 0.36 : 0.85,
    seconds = 32 * beat,
    n = Math.ceil(seconds * rate),
    out = new Float64Array(n);
  const melody = won
    ? [62, 66, 69, 74, 73, 69, 66, 69, 67, 71, 74, 79, 78, 74, 69, 74]
    : [62, 60, 57, 53, 55, 57, 53, 50, 58, 57, 53, 50, 52, 53, 50, 0];
  function note(at, midi, len, gain, brass = false) {
    if (!midi) return;
    const hz = 440 * 2 ** ((midi - 69) / 12);
    for (let j = 0; j < len * rate; j++) {
      const t = j / rate,
        env = Math.min(1, t / (brass ? 0.025 : 0.18)) * Math.min(1, (len - t) / 0.2);
      let v = 0;
      for (let h = 1; h <= (brass ? 6 : 4); h++)
        v += (Math.sin(2 * Math.PI * hz * h * t) / (h * h)) * (brass ? 1 : Math.exp(-t * 0.3));
      const i = Math.round(at * rate) + j;
      if (i < n) out[i] += v * env * gain;
    }
  }
  for (let b = 0; b < 32; b++) {
    const root = (won ? [50, 55, 57, 50] : [50, 46, 43, 45])[Math.floor(b / 8)];
    if (b % 2 === 0) note(b * beat, melody[b / 2], beat * 1.8, 0.18, won);
    if (b % 4 === 0) {
      note(b * beat, root, beat * 3.9, 0.13);
      note(b * beat, root + (won ? 4 : 3), beat * 3.9, 0.07);
      note(b * beat, root + 7, beat * 3.9, 0.06);
    }
    if (won) {
      note(b * beat, root + 12 + (b % 2 ? 7 : 0), beat * 0.8, 0.08);
      if (b % 2 === 0)
        for (let j = 0; j < rate * 0.25; j++) {
          const t = j / rate;
          out[Math.round(b * beat * rate) + j] +=
            Math.sin(2 * Math.PI * 65 * t) * Math.exp(-t * 18) * 0.17;
        }
    }
  }
  let peak = 0;
  for (const v of out) peak = Math.max(peak, Math.abs(v));
  const wav = Buffer.alloc(44 + n * 2);
  wav.write('RIFF');
  wav.writeUInt32LE(36 + n * 2, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++)
    wav.writeInt16LE(
      Math.round(
        (out[i] / peak) * 0.7 * 32767 * Math.min(1, i / (rate * 0.03), (n - i) / (rate * 0.3)),
      ),
      44 + i * 2,
    );
  fs.writeFileSync(`public/assets/audio/${won ? 'victory' : 'defeat'}.wav`, wav);
  console.log(won ? 'victory' : 'defeat', seconds);
}
