import { describe, expect, it } from 'vitest';
import { updateAI } from '../../src/game/ai/brain';
import { createActor } from '../../src/game/entities/actor';
import { StageEnvironment } from '../../src/game/entities/environment';
import { advanceMagic } from '../../src/game/entities/magic';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput } from '../../src/game/entities/types';
import { startAttack, AttackBuffer } from '../../src/game/combat/combat';
import { attacks } from '../../src/data/attacks';
import { forgeWaves, monasterySections, monasteryWaves, stages } from '../../src/data/stages';

describe('Drowned Monastery', () => {
  it('keeps five contiguous areas and halves flyer appearances across stages two and three', () => {
    expect(monasterySections).toHaveLength(5);
    expect(monasterySections[0].start).toBe(stages.monastery.start);
    expect(monasterySections.at(-1)?.end).toBe(stages.monastery.end);
    expect(monasteryWaves[2].enemies).toContain('mage');
    expect(
      monasteryWaves.filter((wave) => wave.enemies.includes('mage')).map((wave) => wave.name),
    ).toEqual(['THE DROWNED ENTRY', 'THE FLOODGATE']);
    const flyerWaves = [...forgeWaves.slice(0, 3), ...monasteryWaves.slice(0, 3)].filter((wave) =>
      wave.enemies.includes('flyer'),
    );
    expect(flyerWaves).toHaveLength(3);
    expect(forgeWaves.slice(0, 3).filter((wave) => wave.enemies.includes('flyer'))).toHaveLength(2);
    expect(
      monasteryWaves.slice(0, 3).filter((wave) => wave.enemies.includes('flyer')),
    ).toHaveLength(1);
    expect(monasteryWaves[1].enemies).toContain('flyer');
    expect(monasteryWaves[3].enemies).toEqual([]);
  });

  it('spawns the added mage in the first Drowned Monastery encounter', () => {
    const simulation = new Simulation(731, 'monastery');
    simulation.player.x = monasteryWaves[0].trigger;
    simulation.step(1 / 60, emptyInput());
    expect(simulation.enemies.map((enemy) => enemy.kind)).toEqual(['grunt', 'mage']);
  });

  it('lets one flyer dive at a time and tracks a locked ground target', () => {
    const player = createActor(0, 'player', 500, 400);
    const first = createActor(1, 'flyer', 350, 330);
    const second = createActor(2, 'flyer', 650, 330);
    first.aiTime = second.aiTime = 2.5;
    expect(updateAI(first, player, 1 / 60, true, [first, second])).toBe('dive');
    expect(first.attackTarget).toEqual({ x: 500, y: 400 });
    expect(first.z).toBe(145);
    expect(updateAI(second, player, 1 / 60, true, [first, second])).toBeNull();
    expect(second.attack).toBeNull();
  });

  it('routes the flyer around high pillars and keeps its orbit inside the world', () => {
    const player = createActor(0, 'player', 1400, 370);
    const flyer = createActor(1, 'flyer', 1200, 370);
    const pillar = { id: -10, x: 1280, y: 330, width: 44, depth: 85, height: 120, hp: 1 };
    for (let i = 0; i < 60; i++) {
      const before = { x: flyer.x, y: flyer.y };
      updateAI(flyer, player, 1 / 60, false, [flyer], [pillar]);
      expect(flyer.x).toBeGreaterThanOrEqual(24);
      expect(flyer.x).toBeLessThanOrEqual(10776);
      const crossed =
        Math.min(before.x, flyer.x) < pillar.x + pillar.width &&
        Math.max(before.x, flyer.x) > pillar.x &&
        Math.min(before.y, flyer.y) < pillar.y + pillar.depth &&
        Math.max(before.y, flyer.y) > pillar.y;
      expect(crossed).toBe(false);
    }
  });

  it('casts a telegraphed guided spell from range and creates a recoverable opening', () => {
    const player = createActor(0, 'player', 500, 400);
    const mage = createActor(1, 'mage', 100, 400);
    mage.spellCooldown = 0;
    expect(updateAI(mage, player, 1 / 60)).toBe('spell');
    expect(mage.attackTarget).toEqual({ x: 500, y: 400 });
    expect(attacks.spell.startupFrames).toBeGreaterThan(0);
    expect(mage.spellCooldown).toBeGreaterThan(0);
  });

  it('loses homing when a roll crosses the spell and the bolt expires or hits', () => {
    const player = createActor(0, 'player', 100, 100);
    player.state = 'Roll';
    player.stateTime = 0.15;
    const bolt = { id: 1, owner: 9, x: 80, y: 100, z: 56, vx: 300, vy: 0, age: 0, homing: true };
    const hits: number[] = [];
    const afterRoll = advanceMagic([bolt], player, [], 1 / 60, (damage) => hits.push(damage));
    expect(afterRoll).toHaveLength(1);
    expect(afterRoll[0].homing).toBe(false);
    expect(hits).toEqual([]);

    player.state = 'Idle';
    player.x = 300;
    const landed = advanceMagic(afterRoll, player, [], 1 / 60, (damage) => hits.push(damage));
    expect(landed).toHaveLength(1);
    landed[0].age = 2.6;
    expect(advanceMagic(landed, player, [], 1 / 60, (damage) => hits.push(damage))).toHaveLength(0);
    expect(hits).toEqual([]);
  });

  it('blocks magic at stone and boss slams cycle the sluice and open its route', () => {
    const environment = new StageEnvironment('monastery');
    expect(environment.solids.some((solid) => solid.id === -40)).toBe(true);
    const boss = createActor(1, 'boss', 8550, 420);
    expect(environment.isWet(9700, 420)).toBe(false);
    boss.attack = {
      id: 'slam',
      elapsed: (attacks.slam.startupFrames + 1) / 60,
      hit: new Set(),
    };
    environment.bossImpact(boss, () => {});
    expect(environment.waterBank).toBe(1);
    expect(environment.isWet(9700, 420)).toBe(true);
    expect(environment.solids.some((solid) => solid.id === -40)).toBe(false);

    const closedEnvironment = new StageEnvironment('monastery');
    const bolt = { id: 1, owner: 2, x: 8520, y: 350, z: 50, vx: 300, vy: 0, age: 0, homing: false };
    expect(
      advanceMagic(
        [bolt],
        createActor(0, 'player', 9000, 400),
        closedEnvironment.solids,
        0.1,
        () => {},
      ),
    ).toHaveLength(0);
  });

  it('carries progression from gate to forge to monastery and restores the new stage checkpoint', () => {
    const gate = new Simulation();
    gate.status = 'clear';
    const forge = gate.nextStage()!;
    expect(forge.stageId).toBe('forge');
    forge.status = 'clear';
    const monastery = forge.nextStage()!;
    expect(monastery.stageId).toBe('monastery');
    expect(monastery.player.x).toBe(stages.monastery.spawn.x);
    expect(monastery.restartStage().stageId).toBe('monastery');
    expect(monastery.restartStage().player.bossPhase).toBe(1);
  });

  it('chains rising into the existing descending combo strike', () => {
    const buffer = new AttackBuffer();
    const player = createActor(0, 'player', 210, 410);
    startAttack(player, 'rising');
    player.attack!.elapsed = 26 / 60;
    buffer.push(['sword'], 1);
    expect(buffer.consume(player, 1)).toBe('slash4');
    expect(player.attack?.id).toBe('slash4');
    expect(player.attack?.lungeDirection).toBeUndefined();
  });
});
