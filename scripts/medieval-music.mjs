/** Original D-Dorian composition; additive/plucked synthesis, no samples or third-party audio. */
import fs from 'node:fs';
const rate = 22050,
  beat = 0.6,
  length = 64 * beat,
  n = Math.round(rate * length);
const melody = [
  62, 65, 69, 67, 65, 64, 62, 0, 62, 64, 65, 69, 71, 69, 67, 0, 65, 67, 69, 72, 71, 69, 67, 65, 64,
  65, 67, 64, 62, 0, 62, 0,
];
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
for (const boss of [false, true]) {
  const out = new Float32Array(n);
  let seed = 731;
  const noise = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return (seed / 4294967296) * 2 - 1;
  };
  function note(start, midi, duration, kind, volume) {
    const f = hz(midi),
      size = Math.round(duration * rate);
    let air = 0;
    for (let j = 0; j < size; j++) {
      const t = j / rate,
        phase = 2 * Math.PI * f * t;
      let value = 0;
      if (kind === 'lute') {
        for (let h = 1; h <= 7; h++)
          value += (Math.sin(phase * h) * Math.exp(-t * (3 + h * 0.7))) / h;
        value *= Math.min(1, t / 0.006);
      } else if (kind === 'pipe') {
        air = 0.92 * air + 0.08 * noise();
        value =
          (Math.sin(phase + 0.008 * Math.sin(2 * Math.PI * 4 * t)) +
            0.18 * Math.sin(phase * 2) +
            air * 0.12) *
          Math.min(1, t / 0.09) *
          Math.min(1, (duration - t) / 0.15);
      } else if (kind === 'drone')
        value =
          (Math.sin(phase) + 0.12 * Math.sin(phase * 2)) *
          Math.min(1, t / 0.3) *
          Math.min(1, (duration - t) / 0.3);
      else {
        air = 0.75 * air + 0.25 * noise();
        value =
          (Math.sin(2 * Math.PI * (70 * t + 5 * (1 - Math.exp(-t * 25)))) * 0.85 + air * 0.7) *
          Math.exp(-t * 12);
      }
      out[(Math.round(start * rate) + j) % n] += value * volume;
    }
  }
  for (let b = 0; b < 64; b++) {
    const chord = [50, 48, 53, 55][Math.floor(b / 8) % 4],
      arp = [0, 7, 12, 7][b % 4];
    note(b * beat, chord + arp, 1.3, 'lute', 0.12);
    if (boss) note(b * beat + beat / 2, chord + 12, 0.8, 'lute', 0.075);
    if (b % 2 === 0 && melody[(b / 2) % 32])
      note(b * beat, melody[(b / 2) % 32], beat * 1.7, 'pipe', 0.12);
    if (b % 8 === 0) {
      note(b * beat, chord - 12, beat * 8, 'drone', 0.06);
      note(b * beat, chord - 5, beat * 8, 'drone', 0.025);
    }
    if (b % 4 === 0 || (boss && b % 2 === 0)) note(b * beat, 40, 0.5, 'drum', boss ? 0.22 : 0.12);
  }
  // Circular room reflections preserve the loop tail instead of cutting it off.
  const dry = out.slice();
  for (const [delay, gain] of [
    [0.071, 0.15],
    [0.137, 0.1],
    [0.251, 0.07],
  ])
    for (let i = 0; i < n; i++) out[(i + Math.round(delay * rate)) % n] += dry[i] * gain;
  let peak = 0,
    sum = 0;
  for (const v of out) {
    peak = Math.max(peak, Math.abs(v));
    sum += v * v;
  }
  const gain = 0.72 / Math.max(peak, 1e-9),
    wav = Buffer.alloc(44 + n * 2);
  wav.write('RIFF', 0);
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
  for (let i = 0; i < n; i++) wav.writeInt16LE(Math.round(out[i] * gain * 32767), 44 + i * 2);
  const name = boss ? 'ashen-king' : 'cloister-march';
  fs.mkdirSync('public/assets/audio', { recursive: true });
  fs.writeFileSync(`public/assets/audio/${name}.wav`, wav);
  console.log({
    name,
    seconds: length,
    peak: 0.72,
    rms: Math.sqrt(sum / n) * gain,
    loopBoundary: Math.abs(out[0] - out[n - 1]) * gain,
  });
}
