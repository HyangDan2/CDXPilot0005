export interface Loot {
  id: number;
  x: number;
  y: number;
  fraction: 0.1 | 0.2 | 0.5;
  age: number;
}
export function rollLoot(random: () => number): Loot['fraction'] | null {
  if (random() >= 0.05) return null;
  const tier = random();
  return tier < 0.7 ? 0.1 : tier < 0.95 ? 0.2 : 0.5;
}
export function collectLoot(hp: number, maxHp: number, fraction: number) {
  return Math.min(maxHp, hp + Math.round(maxHp * fraction));
}
