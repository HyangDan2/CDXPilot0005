import type { Kind } from '../game/entities/types';
export interface Wave {
  name: string;
  trigger: number;
  end: number;
  enemies: Kind[];
}
export const waves: Wave[] = [
  { name: 'THE OUTER WATCH', trigger: 360, end: 920, enemies: ['grunt', 'archer', 'rusher'] },
  {
    name: 'BROKEN OATHS',
    trigger: 1180,
    end: 1760,
    enemies: ['guard', 'archer', 'rusher', 'grunt'],
  },
  {
    name: 'ASH & IRON',
    trigger: 2020,
    end: 2630,
    enemies: ['rusher', 'guard', 'archer', 'archer', 'guard'],
  },
  { name: 'THE GATEKEEPER', trigger: 2860, end: 3550, enemies: ['boss'] },
];
