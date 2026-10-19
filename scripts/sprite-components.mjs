/** Segment disconnected alpha silhouettes, retaining source RGBA without repainting. */
export function components(p) {
  const n = p.width * p.height,
    labels = new Int32Array(n),
    queue = new Int32Array(n),
    parts = [];
  let label = 0;
  for (let i = 0; i < n; i++) {
    if (labels[i] || p.data[i * 4 + 3] < 128) continue;
    label++;
    let head = 0,
      tail = 1;
    queue[0] = i;
    labels[i] = label;
    const part = { id: label, count: 0, left: p.width, top: p.height, right: 0, bottom: 0 };
    while (head < tail) {
      const j = queue[head++],
        x = j % p.width,
        y = Math.floor(j / p.width);
      part.count++;
      part.left = Math.min(part.left, x);
      part.right = Math.max(part.right, x);
      part.top = Math.min(part.top, y);
      part.bottom = Math.max(part.bottom, y);
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx,
            yy = y + dy,
            k = yy * p.width + xx;
          if (
            xx < 0 ||
            yy < 0 ||
            xx >= p.width ||
            yy >= p.height ||
            labels[k] ||
            p.data[k * 4 + 3] < 128
          )
            continue;
          labels[k] = label;
          queue[tail++] = k;
        }
    }
    parts.push(part);
  }
  return { parts, labels };
}
