import type { Actor, State } from './types';
const free: State[] = ['Idle', 'Walk', 'Run', 'Jump', 'Fall', 'Land', 'Guard'];
const attacks: State[] = ['Attack', 'Kick', 'RisingSlash'];
export function canTransition(from: State, to: State, cancel = false): boolean {
  if (from === 'Death') return false;
  if (to === 'Death' || to === 'Hit' || to === 'Knockdown') return true;
  if (from === 'Knockdown') return to === 'Recovery';
  if (from === 'Recovery' || from === 'Hit') return to === 'Idle' || to === 'Fall';
  if (attacks.includes(from)) return cancel || to === 'Idle' || to === 'Fall';
  return free.includes(from);
}
export function setState(actor: Actor, state: State, cancel = false): boolean {
  if (state === actor.state) return true;
  if (!canTransition(actor.state, state, cancel)) return false;
  actor.state = state;
  actor.stateTime = 0;
  return true;
}
export const isDisabled = (a: Actor) => ['Hit', 'Knockdown', 'Recovery', 'Death'].includes(a.state);
