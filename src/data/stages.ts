import { waves, type Wave } from './stage';

export type StageId = 'gate' | 'forge' | 'monastery';
export interface StageSection {
  name: string;
  start: number;
  end: number;
  color: number;
}
export interface StageDefinition {
  id: StageId;
  title: string;
  chapter: string;
  start: number;
  end: number;
  spawn: { x: number; y: number };
  bossName: string;
  waves: Wave[];
  sections: readonly StageSection[];
  clearBonus: number;
}
export const forgeWaves: Wave[] = [
  {
    name: 'THE CINDER APPROACH',
    trigger: 3860,
    end: 4200,
    enemies: ['flyer'],
    spawns: [{ x: 4110, y: 420 }],
  },
  {
    name: 'THE STOCKHOUSE',
    trigger: 4340,
    end: 4800,
    enemies: ['guard', 'archer', 'rusher', 'flyer'],
    spawns: [
      { x: 4500, y: 448 },
      { x: 4740, y: 365 },
      { x: 4520, y: 370 },
      { x: 4670, y: 420 },
    ],
  },
  {
    name: 'THE FURNACE HALL',
    trigger: 4940,
    end: 5500,
    enemies: ['grunt', 'flyer'],
    spawns: [
      { x: 5100, y: 440 },
      { x: 5310, y: 365 },
    ],
  },
  {
    name: 'THE COOLING GARDEN',
    trigger: 5640,
    end: 6240,
    enemies: [],
    recovery: { id: -20001, x: 5930, y: 345, fraction: 0.5 },
  },
  {
    name: 'THE FORGE WARDEN',
    trigger: 6500,
    end: 7150,
    enemies: ['boss'],
    spawns: [{ x: 6880, y: 440 }],
  },
];
export const forgeSections: readonly StageSection[] = [
  { name: 'THE CINDER APPROACH', start: 3600, end: 4260, color: 0x362b29 },
  { name: 'THE STOCKHOUSE', start: 4260, end: 4860, color: 0x303038 },
  { name: 'THE FURNACE HALL', start: 4860, end: 5580, color: 0x492c26 },
  { name: 'THE COOLING GARDEN', start: 5580, end: 6340, color: 0x203d42 },
  { name: 'THE FORGE WARDEN', start: 6340, end: 7200, color: 0x392a32 },
];
export const monasteryWaves: Wave[] = [
  {
    name: 'THE DROWNED ENTRY',
    trigger: 7460,
    end: 7780,
    enemies: ['grunt', 'flyer'],
    spawns: [
      { x: 7580, y: 440 },
      { x: 7700, y: 390 },
    ],
  },
  {
    name: 'THE SPLIT CLOISTER',
    trigger: 7900,
    end: 8320,
    enemies: ['archer', 'flyer', 'guard'],
    spawns: [
      { x: 8170, y: 365 },
      { x: 8230, y: 425 },
      { x: 8080, y: 440 },
    ],
  },
  {
    name: 'THE FLOODGATE',
    trigger: 8440,
    end: 8910,
    enemies: ['mage', 'rusher', 'flyer'],
    spawns: [
      { x: 8790, y: 430 },
      { x: 8690, y: 370 },
      { x: 8780, y: 390 },
    ],
  },
  {
    name: 'THE QUIET CHAPEL',
    trigger: 9020,
    end: 9480,
    enemies: [],
    recovery: { id: -30001, x: 9260, y: 365, fraction: 0.5 },
  },
  {
    name: 'THE TIDE WARDEN',
    trigger: 9600,
    end: 10740,
    enemies: ['boss'],
    spawns: [{ x: 10100, y: 430 }],
  },
];
export const monasterySections: readonly StageSection[] = [
  { name: 'THE DROWNED ENTRY', start: 7200, end: 7840, color: 0x27434a },
  { name: 'THE SPLIT CLOISTER', start: 7840, end: 8380, color: 0x36454b },
  { name: 'THE FLOODGATE', start: 8380, end: 8960, color: 0x244b54 },
  { name: 'THE QUIET CHAPEL', start: 8960, end: 9540, color: 0x3c4a4c },
  { name: 'THE TIDE WARDEN', start: 9540, end: 10800, color: 0x263c4a },
];
export const stages: Record<StageId, StageDefinition> = {
  gate: {
    id: 'gate',
    title: 'THE ASHEN GATE',
    chapter: 'I',
    start: 0,
    end: 3600,
    spawn: { x: 210, y: 408 },
    bossName: 'HROTH, THE HOLLOW KING',
    waves,
    sections: [],
    clearBonus: 0,
  },
  forge: {
    id: 'forge',
    title: 'THE ASHEN FORGE',
    chapter: 'II',
    start: 3600,
    end: 7200,
    spawn: { x: 3810, y: 440 },
    bossName: 'SKARN, THE FORGE WARDEN',
    waves: forgeWaves,
    sections: forgeSections,
    clearBonus: 1000,
  },
  monastery: {
    id: 'monastery',
    title: 'THE DROWNED MONASTERY',
    chapter: 'III',
    start: 7200,
    end: 10800,
    spawn: { x: 7380, y: 440 },
    bossName: 'NERETH, THE TIDE WARDEN',
    waves: monasteryWaves,
    sections: monasterySections,
    clearBonus: 1500,
  },
};
