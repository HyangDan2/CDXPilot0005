import type { Kind } from '../game/entities/types';
export interface Wave {
  name: string;
  trigger: number;
  end: number;
  enemies: Kind[];
  spawns?: readonly { x: number; y: number }[];
  recovery?: { id: number; x: number; y: number; fraction: 0.1 | 0.2 | 0.5 };
}
export const waves: Wave[] = [
  { name: 'THE OUTER WATCH', trigger: 360, end: 920, enemies: ['grunt', 'archer', 'rusher'] },
  {
    name: 'BROKEN OATHS',
    trigger: 1180,
    end: 1760,
    enemies: ['guard', 'archer', 'rusher', 'grunt'],
    spawns: [
      { x: 1370, y: 448 },
      { x: 1580, y: 365 },
      { x: 1430, y: 370 },
      { x: 1720, y: 450 },
    ],
  },
  {
    name: 'ASH & IRON',
    trigger: 2020,
    end: 2630,
    enemies: ['rusher', 'guard', 'archer', 'archer', 'guard'],
  },
  { name: 'THE GATEKEEPER', trigger: 2860, end: 3550, enemies: ['boss'] },
];
