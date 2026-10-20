import { waves, type Wave } from './stage';

export type StageId = 'gate' | 'forge';
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
    enemies: ['grunt', 'rusher'],
    spawns: [
      { x: 4080, y: 430 },
      { x: 4140, y: 370 },
    ],
  },
  {
    name: 'THE STOCKHOUSE',
    trigger: 4340,
    end: 4800,
    enemies: ['guard', 'archer', 'rusher'],
    spawns: [
      { x: 4500, y: 448 },
      { x: 4740, y: 365 },
      { x: 4520, y: 370 },
    ],
  },
  {
    name: 'THE FURNACE HALL',
    trigger: 4940,
    end: 5500,
    enemies: ['grunt', 'archer', 'guard'],
    spawns: [
      { x: 5100, y: 440 },
      { x: 5420, y: 435 },
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
};
