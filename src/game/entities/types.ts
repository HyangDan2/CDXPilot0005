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
export type Kind = 'player' | 'grunt' | 'rusher' | 'guard' | 'archer' | 'boss' | 'flyer' | 'mage';
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
  | 'spin'
  | 'dive'
  | 'spell';
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
  /** Consumed on attack start; restored only by landing. */
  airAttackUsed: boolean;
  attack: {
    id: AttackId;
    elapsed: number;
    hit: Set<number>;
    speedMultiplier?: number;
    costPaid?: boolean;
    released?: boolean;
    projectile?: boolean;
    lungeDirection?: { x: number; y: number };
    lungeDistance?: number;
  } | null;
  ai: AIState;
  aiTime: number;
  pattern: number;
  bossPhase: 1 | 2;
  phaseTransition: number;
  flightAngle: number;
  flightRadius: number;
  spellCooldown: number;
  fleeTime: number;
  attackTarget: { x: number; y: number } | null;
  runMomentum: { x: number; y: number };
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
  type:
    | 'swing'
    | 'hit'
    | 'kick'
    | 'jump'
    | 'land'
    | 'boss'
    | 'death'
    | 'clear'
    | 'heal'
    | 'hazardWarning';
  x: number;
  y: number;
  value?: number;
};
