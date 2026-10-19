export type State =
  | 'Roll'
  | 'Switch'
  | 'Idle'
  | 'Walk'
  | 'Run'
  | 'Jump'
  | 'Fall'
  | 'Land'
  | 'Attack'
  | 'Kick'
  | 'RisingSlash'
  | 'Hit'
  | 'Knockdown'
  | 'Recovery'
  | 'Guard'
  | 'Death';
export type AIState =
  'Idle' | 'Chase' | 'Flank' | 'Retreat' | 'Attack' | 'Recover' | 'Hit' | 'Down' | 'Death';
export type Kind = 'player' | 'grunt' | 'rusher' | 'guard' | 'archer' | 'boss';
export type AttackId =
  | 'shot'
  | 'enemyShot'
  | 'dagger'
  | 'heavy'
  | 'slash1'
  | 'slash2'
  | 'slash3'
  | 'slash4'
  | 'kick'
  | 'rising'
  | 'air'
  | 'enemy'
  | 'charge'
  | 'slam'
  | 'spin';
export type Command = 'sword' | 'rising' | 'jump' | 'spin' | 'roll' | 'switch';
export interface Position {
  x: number;
  y: number;
  z: number;
}
export interface Actor extends Position {
  id: number;
  kind: Kind;
  weapon: 'sword' | 'bow';
  rollCooldown: number;
  rollDirection: { x: number; y: number };
  hp: number;
  maxHp: number;
  facing: 1 | -1;
  state: State;
  stateTime: number;
  /** Interruptible visual run-to-idle settle, seconds. */
  stopTime?: number;
  vz: number;
  vx: number;
  vy: number;
  invulnerable: number;
  attack: {
    id: AttackId;
    elapsed: number;
    hit: Set<number>;
    costPaid?: boolean;
    released?: boolean;
    projectile?: boolean;
  } | null;
  ai: AIState;
  aiTime: number;
  pattern: number;
  spawnX: number;
  juggle: {
    active: boolean;
    launches: number;
    airHits: number;
    forced: boolean;
    groundedTime: number;
  };
}
export interface Input {
  x: number;
  y: number;
  dash: boolean;
  guard: boolean;
  commands: Command[];
}
export const emptyInput = (): Input => ({ x: 0, y: 0, dash: false, guard: false, commands: [] });
export type GameEvent = {
  type: 'swing' | 'hit' | 'kick' | 'jump' | 'land' | 'boss' | 'death' | 'clear' | 'heal';
  x: number;
  y: number;
  value?: number;
};
