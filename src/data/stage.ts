import type { Kind } from '../game/entities/types';
export interface Wave {
  name: string;
  trigger: number;
  end: number;
  enemies: Kind[];
}
export const waves: Wave[] = [
  { name: 'THE OUTER WATCH', trigger: 360, end: 920, enemies: ['grunt', 'grunt', 'rusher'] },
  {
    name: 'BROKEN OATHS',
    trigger: 1180,
    end: 1760,
    enemies: ['guard', 'grunt', 'rusher', 'grunt'],
  },
  {
    name: 'ASH & IRON',
    trigger: 2020,
    end: 2630,
    enemies: ['rusher', 'guard', 'grunt', 'rusher', 'guard'],
  },
  { name: 'THE GATEKEEPER', trigger: 2860, end: 3550, enemies: ['boss'] },
];
