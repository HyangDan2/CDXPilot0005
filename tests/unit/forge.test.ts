import { describe, expect, it } from 'vitest';
import { attacks } from '../../src/data/attacks';
import { forgeDeviceRules } from '../../src/data/environment';
import { forgeSections, forgeWaves, stages } from '../../src/data/stages';
import { cameraTarget } from '../../src/game/camera/follow';
import { StageEnvironment } from '../../src/game/entities/environment';
import { createActor } from '../../src/game/entities/actor';
import { advanceArrows } from '../../src/game/entities/projectiles';
import { Simulation } from '../../src/game/entities/simulation';
import { emptyInput, type Actor, type GameEvent } from '../../src/game/entities/types';
import { expanded, inside, onGround } from '../../src/game/physics/obstacles';

function slam(): Actor {
  const boss = createActor(1, 'boss', 6880, 440);
  boss.attack = { id: 'slam', elapsed: attacks.slam.startupFrames / 60 + 0.01, hit: new Set() };
  boss.state = 'Attack';
  return boss;
}
describe('forge stage definition and flow', () => {
  it('defines five contiguous sections, legal spawns, a quiet garden and a final boss', () => {
    expect(forgeSections).toHaveLength(5);
    expect(forgeWaves).toHaveLength(5);
    for (let i = 1; i < forgeSections.length; i++)
      expect(forgeSections[i].start).toBe(forgeSections[i - 1].end);
    const env = new StageEnvironment('forge');
    for (const wave of forgeWaves)
      for (const spawn of wave.spawns ?? []) {
        expect(onGround(spawn)).toBe(true);
        for (const solid of env.solids) expect(inside(spawn, expanded(solid, 16, 10))).toBe(false);
      }
    expect(forgeWaves[3].enemies).toEqual([]);
    expect(forgeWaves[3].recovery?.fraction).toBe(0.5);
    expect(forgeWaves[4].enemies).toEqual(['boss']);
  });
  it('offers the next stage only after the gate clears and carries entry progress', () => {
    const gate = new Simulation();
    expect(gate.nextStage()).toBeNull();
    gate.status = 'over';
    expect(gate.nextStage()).toBeNull();
    gate.status = 'clear';
    gate.score = 4321;
    gate.bestCombo = 9;
    gate.kills = 17;
    gate.player.hp = 7;
    gate.player.weapon = 'bow';
    const next = gate.nextStage()!;
    expect(next.stageId).toBe('forge');
    expect(next.status).toBe('playing');
    expect(next.player).toMatchObject({ x: 3810, y: 440, hp: 180, weapon: 'bow', attack: null });
    expect(next).toMatchObject({
      score: 4321,
      bestCombo: 9,
      kills: 17,
      wave: 0,
      combo: 0,
      hitStop: 0,
      time: 0,
    });
    expect(next.arrows).toEqual([]);
    expect(next.enemies).toEqual([]);
    expect(next.loot).toEqual([]);
    expect(next.environment.stageId).toBe('forge');
    expect(next.environment.time).toBe(0);
    expect(next.environment.barricades.every((b) => b.x > 3600)).toBe(true);
    next.status = 'clear';
    expect(next.nextStage()?.stageId).toBe('monastery');
  });
  it('restarts the current stage at its entry checkpoint without farming score or retaining damage', () => {
    const gate = new Simulation();
    gate.status = 'clear';
    gate.score = 1000;
    gate.bestCombo = 7;
    gate.player.weapon = 'bow';
    const s = gate.nextStage()!;
    s.score += 5000;
    s.bestCombo = 20;
    s.player.hp = 1;
    s.player.weapon = 'sword';
    s.wave = 4;
    s.environment.barricades[0].hp = 0;
    const restart = s.restartStage();
    expect(restart).toMatchObject({
      stageId: 'forge',
      wave: 0,
      score: 1000,
      bestCombo: 7,
      status: 'playing',
    });
    expect(restart.player).toMatchObject({ x: 3810, hp: 180, weapon: 'bow' });
    expect(restart.environment.barricades[0].hp).toBe(40);
    expect(
      restart.environment.flames.filter((f) => f.controlled).every((f) => f.phase === 'rest'),
    ).toBe(true);
  });
  it('supports direct fresh forge entry, its camera bounds and arrows beyond the gate map', () => {
    const s = new Simulation(731, 'forge');
    expect(s.score).toBe(0);
    expect(s.bounds).toEqual([3624, 4200]);
    expect(cameraTarget(s.player.x, s.stage.end, s.stage.start)).toBe(3600);
    expect(cameraTarget(7150, s.stage.end, s.stage.start)).toBe(6240);
    expect(cameraTarget(3600)).toBe(2640);
    const arrows = advanceArrows(
      [{ id: 1, owner: 0, player: true, x: 4010, y: 450, z: 50, facing: 1, age: 0 }],
      [],
      1 / 60,
      () => {},
      undefined,
      stages.forge.end,
    );
    expect(arrows).toHaveLength(1);
    expect(arrows[0].x).toBeGreaterThan(4010);
  });
  it('spawns the optional garden potion once, preserves the quiet traversal and collects it', () => {
    const s = new Simulation(1, 'forge');
    s.wave = 3;
    s.player.x = 5640;
    s.player.hp = 70;
    s.step(1 / 60, emptyInput());
    expect(s.loot).toHaveLength(1);
    expect(s.enemies).toHaveLength(0);
    s.step(1 / 60, emptyInput());
    expect(s.wave).toBe(4);
    expect(s.active).toBe(false);
    s.player.x = 5930;
    s.player.y = 345;
    s.step(1 / 60, emptyInput());
    expect(s.player.hp).toBe(160);
    expect(s.loot).toHaveLength(0);
    s.player.x = 5640;
    s.step(1 / 60, emptyInput());
    expect(s.loot).toHaveLength(0);
  });
  it('advances all five waves to final clear with a single completion reward', () => {
    const s = new Simulation(42, 'forge');
    for (const wave of forgeWaves) {
      s.player.x = wave.trigger;
      s.player.y = 410;
      s.step(1 / 60, emptyInput());
      expect(s.active).toBe(true);
      s.enemies.forEach((e) => {
        e.hp = 0;
      });
      s.step(1 / 60, emptyInput());
    }
    expect(s).toMatchObject({ status: 'clear', wave: 5, active: false, score: 1000 });
    const score = s.score,
      clock = s.environment.time;
    s.step(1 / 60, emptyInput());
    expect(s.score).toBe(score);
    expect(s.environment.time).toBe(clock);
  });
});

describe('forge warden and machinery', () => {
  it('activates one warned bank per landed slam, then alternates after the cycle', () => {
    const env = new StageEnvironment('forge'),
      boss = slam(),
      events: GameEvent[] = [];
    const emit = (e: GameEvent) => events.push(e);
    boss.z = 10;
    env.bossImpact(boss, emit);
    expect(env.flames.filter((f) => f.controlled && f.phase !== 'rest')).toHaveLength(0);
    boss.z = 0;
    env.bossImpact(boss, emit);
    env.bossImpact(boss, emit);
    expect(env.flames.find((f) => f.id === 'warden-north')?.phase).toBe('warning');
    expect(env.flames.find((f) => f.id === 'warden-south')?.phase).toBe('rest');
    expect(events.filter((e) => e.x === 6820)).toHaveLength(1);
    env.advance(forgeDeviceRules.warning + 0.01, emit);
    expect(env.flames.find((f) => f.id === 'warden-north')?.phase).toBe('active');
    env.bossImpact(slam(), emit); // A second attack cannot stack another bank.
    expect(env.flames.filter((f) => f.controlled && f.phase !== 'rest')).toHaveLength(1);
    env.advance(forgeDeviceRules.active + 0.01, emit);
    env.bossImpact(slam(), emit);
    expect(env.flames.find((f) => f.id === 'warden-south')?.phase).toBe('warning');
    expect(env.flames.find((f) => f.id === 'warden-north')?.phase).toBe('rest');
  });
  it('leaves an escape lane and gives both sides the same fire damage', () => {
    const env = new StageEnvironment('forge');
    env.bossImpact(slam(), () => {});
    env.advance(forgeDeviceRules.warning + 0.01, () => {});
    for (const kind of ['player', 'boss'] as const) {
      const actor = createActor(kind === 'player' ? 0 : 1, kind, 6810, 410);
      expect(env.burn(actor)).toBe(0);
      actor.y = 360;
      expect(env.burn(actor)).toBe(12);
    }
  });
  it.each([-1, 1] as const)(
    'a committed charge breaks a swept barricade in direction %s',
    (direction) => {
      const env = new StageEnvironment('forge'),
        boss = slam(),
        events: GameEvent[] = [];
      boss.attack = {
        id: 'charge',
        elapsed: attacks.charge.startupFrames / 60 + 0.01,
        hit: new Set(),
      };
      const before = { x: direction === 1 ? 6700 : 6820, y: 420 };
      boss.x = direction === 1 ? 6820 : 6700;
      boss.y = 420;
      env.bossMotion(boss, before, (e) => events.push(e));
      env.bossMotion(boss, before, (e) => events.push(e));
      expect(env.barricades.find((b) => b.id === -22)?.hp).toBe(0);
      expect(env.barricades.find((b) => b.id === -23)?.hp).toBe(64);
      expect(events).toHaveLength(1);
    },
  );
  it('does not trigger during windup, on other actors or after machinery stops', () => {
    const env = new StageEnvironment('forge'),
      boss = slam(),
      events: GameEvent[] = [];
    boss.attack!.elapsed = 0;
    env.bossImpact(boss, (e) => events.push(e));
    boss.attack!.elapsed = 0.75;
    boss.kind = 'grunt';
    env.bossImpact(boss, (e) => events.push(e));
    expect(events).toHaveLength(0);
    boss.kind = 'boss';
    env.extinguish();
    env.bossImpact(boss, (e) => events.push(e));
    expect(events).toHaveLength(0);
    env.advance(20, (e) => events.push(e));
    expect(env.flames.every((f) => f.phase === 'rest')).toBe(true);
  });
  it('clears from an environmental boss kill, removes support and extinguishes devices', () => {
    const s = new Simulation(42, 'forge');
    s.wave = 4;
    s.active = true;
    s.player.x = 6430;
    s.player.y = 410;
    const boss = slam();
    boss.hp = 12;
    boss.x = 6810;
    boss.y = 360;
    boss.attack = null;
    boss.state = 'Idle';
    boss.aiTime = -1000;
    s.enemies = [boss, createActor(2, 'grunt', 6500, 410)];
    s.environment.bossImpact(slam(), () => {});
    s.environment.advance(1.41, () => {});
    s.step(1 / 60, emptyInput());
    expect(s).toMatchObject({ status: 'clear', wave: 5, score: 1200, kills: 1 });
    expect(s.enemies).toEqual([]);
    expect(s.arrows).toEqual([]);
    expect(s.reinforcements.warnings).toEqual([]);
    expect(s.environment.flames.every((f) => f.phase === 'rest')).toBe(true);
    expect(s.drainEvents().filter((e) => e.type === 'clear')).toHaveLength(1);
  });
  it('gives defeat precedence when player and boss die in the same flame step', () => {
    const s = new Simulation(42, 'forge');
    s.wave = 4;
    s.active = true;
    s.player.x = 6810;
    s.player.y = 360;
    s.player.hp = 12;
    const boss = createActor(1, 'boss', 6830, 360);
    boss.hp = 12;
    boss.aiTime = -1000;
    s.enemies = [boss];
    s.environment.bossImpact(slam(), () => {});
    s.environment.advance(1.41, () => {});
    s.step(1 / 60, emptyInput());
    expect(s.status).toBe('over');
    expect(s.nextStage()).toBeNull();
    expect(s.drainEvents().filter((e) => e.type === 'clear')).toHaveLength(0);
  });
});
