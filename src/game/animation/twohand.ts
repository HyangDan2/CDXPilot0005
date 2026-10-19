import { attacks, attackPhase } from '../../data/attacks';
import { activeProgress } from '../../data/motions';
import type { Actor } from '../entities/types';
const step = (t: number, n: number) => Math.min(n - 1, Math.floor(Math.max(0, t) * n));
export function twohandFrame(a: Actor) {
  if (a.attack) {
    const d = attacks[a.attack.id],
      phase = attackPhase(a.attack.id, a.attack.elapsed);
    const active = activeProgress(a.attack.elapsed, d.startupFrames, d.activeFrames);
    const prep = (a.attack.elapsed * 60) / d.startupFrames;
    const recovery = (a.attack.elapsed * 60 - d.startupFrames - d.activeFrames) / d.recoveryFrames;
    if (a.attack.id === 'spin')
      return {
        sheet: 'smooth-defense',
        frame:
          phase === 'startup' ? 8 + step(prep, 2) : phase === 'active' ? 10 + step(active, 5) : 15,
      };
    const base =
      a.attack.id === 'rising' ? 12 : a.attack.id === 'air' ? 18 : a.attack.id === 'slash2' ? 6 : 0;
    if (a.attack.id === 'rising')
      return {
        sheet: 'smooth-attack',
        frame:
          phase === 'startup'
            ? base + step(prep, 2)
            : phase === 'active'
              ? base + 2 + step(active, 4)
              : base + 5,
      };
    return {
      sheet: 'smooth-attack',
      frame:
        base +
        (phase === 'startup'
          ? step(prep, 2)
          : phase === 'active'
            ? 2 + step(active, 2)
            : 4 + step(recovery, 2)),
    };
  }
  if (a.state === 'Guard')
    return {
      sheet: 'smooth-defense',
      frame:
        a.stateTime < 0.08 ? step(a.stateTime / 0.08, 2) : 2 + (Math.floor(a.stateTime * 4) % 2),
    };
  if (a.state === 'Jump')
    return { sheet: 'smooth-reaction', frame: 2 + Math.min(1, Math.floor(a.stateTime / 0.18)) };
  if (a.state === 'Fall')
    return { sheet: 'smooth-reaction', frame: 4 + Math.min(1, Math.floor(a.stateTime / 0.15)) };
  if (a.state === 'Land')
    return { sheet: 'smooth-reaction', frame: 6 + step(a.stateTime / 0.1, 2) };
  if (a.state === 'Hit') return { sheet: 'smooth-reaction', frame: 8 + step(a.stateTime / 0.3, 2) };
  if (a.state === 'Death' || a.state === 'Knockdown')
    return {
      sheet: 'smooth-reaction',
      frame: a.z > 0 ? 10 + step(a.stateTime / 0.3, 2) : 12 + step(a.stateTime / 0.4, 2),
    };
  if (a.state === 'Recovery')
    return { sheet: 'smooth-reaction', frame: 14 + step(a.stateTime / 0.35, 2) };
  if (a.state === 'Run')
    return { sheet: 'smooth-move', frame: 8 + (Math.floor(a.stateTime * 24) % 8) };
  if (a.state === 'Walk') return { sheet: 'smooth-move', frame: Math.floor(a.stateTime * 16) % 8 };
  if (a.stopTime !== undefined && a.stopTime < 0.3)
    return { sheet: 'smooth-stop', frame: step(a.stopTime / 0.3, 6) };
  return { sheet: 'smooth-idle', frame: Math.floor(a.stateTime * 8) % 12 };
}
