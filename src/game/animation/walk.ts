/** Contact and weight-bearing linger; passing feet move briskly. Seconds per pose. */
export const walkDurations = [0.12, 0.1, 0.065, 0.075, 0.12, 0.1, 0.065, 0.075] as const;
export function walkFrame(seconds: number): number {
  const duration = walkDurations.reduce((sum, value) => sum + value, 0);
  let time = ((seconds % duration) + duration) % duration;
  for (let frame = 0; frame < walkDurations.length; frame++) {
    if (time < walkDurations[frame]) return frame;
    time -= walkDurations[frame];
  }
  return 0;
}
