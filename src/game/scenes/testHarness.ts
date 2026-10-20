import { Simulation } from '../entities/simulation';
import { startAttack } from '../combat/combat';
import { StageEnvironment } from '../entities/environment';
import type { ArenaScene } from './ArenaScene';
import { waves } from '../../data/stage';
import { createActor } from '../entities/actor';
export function installHarness(scene: ArenaScene) {
  if (new URLSearchParams(location.search).get('test') !== '1') return;
  window.__VALKYRIE__ = {
    snapshot: () => ({
      mode: scene.ui.mode,
      stageId: scene.sim.stageId,
      section: scene.sim.sectionIndex,
      score: scene.sim.score,
      bestCombo: scene.sim.bestCombo,
      audio: scene.audioStatus(),
      cameraX: scene.cameras.main.scrollX,
      player: {
        x: scene.sim.player.x,
        y: scene.sim.player.y,
        z: scene.sim.player.z,
        hp: scene.sim.player.hp,
        weapon: scene.sim.player.weapon,
        rollCooldown: scene.sim.player.rollCooldown,
        state: scene.sim.player.state,
        attack: scene.sim.player.attack?.id ?? null,
        attackElapsed: scene.sim.player.attack?.elapsed ?? 0,
      },
      environment: {
        time: scene.sim.environment.time,
        barricades: scene.sim.environment.barricades.map((w) => ({ id: w.id, hp: w.hp })),
        pillars: scene.sim.environment.pillars.map((p) => ({ x: p.x, y: p.y })),
        flames: scene.sim.environment.flames.map((f) => ({ id: f.id, phase: f.phase })),
      },
      loot: scene.sim.loot.map((l) => ({ id: l.id, x: l.x, y: l.y })),
      arrows: scene.sim.arrows.length,
      wave: scene.sim.wave,
      combo: scene.sim.combo,
      enemies: scene.sim.enemies.map((e) => ({
        hp: e.hp,
        kind: e.kind,
        state: e.state,
        x: e.x,
        y: e.y,
        attack: e.attack?.id ?? null,
      })),
      time: scene.sim.time,
      status: scene.sim.status,
    }),
    fixture: (name) => {
      if (name.startsWith('forge') && scene.sim.stageId !== 'forge')
        scene.sim = new Simulation(731, 'forge');
      const s = scene.sim;
      if (name === 'gateReward') {
        s.wave = 3;
        s.active = true;
        s.score = 1234;
        s.bestCombo = 9;
        s.player.hp = 22;
        const boss = createActor(100, 'boss', 3300, 420);
        boss.hp = 0;
        s.enemies = [boss];
      }
      const forgeArea = {
        forgeEntry: 0,
        forgeStockhouse: 1,
        forgeFurnace: 2,
        forgeGarden: 3,
        forgeBoss: 4,
        forgeSlam: 4,
        forgeCharge: 4,
        forgeClear: 4,
      };
      if (name in forgeArea) {
        s.wave = forgeArea[name as keyof typeof forgeArea];
        s.active = false;
        s.player = createActor(0, 'player', s.stage.waves[s.wave].trigger, 410);
        s.environment = new StageEnvironment('forge');
        s.enemies = [];
        s.arrows = [];
        s.hitStop = 0;
        s.loot = [];
        if (name === 'forgeGarden') s.player.hp = 90;
        if (name === 'forgeSlam' || name === 'forgeCharge' || name === 'forgeClear') {
          s.active = true;
          const boss = createActor(
            100,
            'boss',
            name === 'forgeCharge' ? 6830 : 6880,
            name === 'forgeCharge' ? 420 : 440,
          );
          s.enemies = [boss];
          if (name === 'forgeClear') boss.hp = 0;
          else startAttack(boss, name === 'forgeSlam' ? 'slam' : 'charge');
          if (name === 'forgeCharge') {
            boss.facing = -1;
            s.player.x = 6650;
            s.player.y = 420;
          }
        }
      }
      if (name === 'cloister' || name === 'pillarCover' || name === 'cloisterBattle') {
        s.wave = 1;
        s.active = name !== 'cloisterBattle';
        s.player = createActor(
          0,
          'player',
          name === 'pillarCover' ? 1240 : 1180,
          name === 'cloisterBattle' ? 445 : 370,
        );
        s.environment = new StageEnvironment();
        s.enemies =
          name === 'cloisterBattle'
            ? []
            : [
                createActor(
                  100,
                  'guard',
                  name === 'pillarCover' ? 1430 : 1740,
                  name === 'pillarCover' ? 370 : 450,
                ),
              ];
        if (s.enemies[0]) s.enemies[0].aiTime = -1000;
        s.arrows = [];
        s.hitStop = 0;
      }
      if (name === 'courtyard' || name === 'flame') {
        s.wave = 0;
        s.active = true;
        s.player = createActor(
          0,
          'player',
          name === 'flame' ? 815 : 600,
          name === 'flame' ? 365 : 411,
        );
        s.environment = new StageEnvironment();
        s.enemies = [createActor(100, 'guard', 900, 470)];
        s.enemies[0].aiTime = -1000;
        s.arrows = [];
        s.hitStop = 0;
        if (name === 'flame') s.environment.time = 3;
      }
      if (name === 'combat') {
        s.active = true;
        s.player.x = 500;
        s.player.y = 400;
        s.enemies = [createActor(100, 'grunt', 560, 400)];
        s.enemies[0].aiTime = -100;
      }
      if (name === 'archer') {
        s.active = true;
        s.player.x = 500;
        s.player.y = 400;
        s.enemies = [createActor(100, 'archer', 760, 400)];
      }
      if (name === 'boss' || name === 'bossSupport') {
        s.wave = 3;
        s.active = false;
        s.enemies = [];
        s.player.x = waves[3].trigger;
      }
      if (name === 'bossSupport') {
        s.active = true;
        const boss = createActor(100, 'boss', 3300, 420);
        boss.hp = boss.maxHp * 0.7;
        boss.aiTime = -100;
        s.enemies = [boss];
      }
      if (name === 'over') s.player.hp = 0;
      if (name === 'clear') {
        s.wave = 3;
        s.active = true;
        s.enemies = [];
      }
    },
  };
}
declare global {
  interface Window {
    __VALKYRIE__?: {
      snapshot: () => {
        mode: string;
        stageId: string;
        section: number;
        score: number;
        bestCombo: number;
        loot: { id: number; x: number; y: number }[];
        audio: ReturnType<ArenaScene['audioStatus']>;
        cameraX: number;
        player: {
          x: number;
          y: number;
          z: number;
          hp: number;
          weapon: string;
          rollCooldown: number;
          state: string;
          attack: string | null;
          attackElapsed: number;
        };
        environment: {
          time: number;
          barricades: { id: number; hp: number }[];
          pillars: { x: number; y: number }[];
          flames: { id: string; phase: string }[];
        };
        arrows: number;
        wave: number;
        combo: number;
        enemies: {
          hp: number;
          kind: string;
          state: string;
          x: number;
          y: number;
          attack: string | null;
        }[];
        time: number;
        status: string;
      };
      fixture: (
        name:
          | 'gateReward'
          | 'forgeEntry'
          | 'forgeStockhouse'
          | 'forgeFurnace'
          | 'forgeGarden'
          | 'forgeBoss'
          | 'forgeSlam'
          | 'forgeCharge'
          | 'forgeClear'
          | 'combat'
          | 'archer'
          | 'boss'
          | 'bossSupport'
          | 'courtyard'
          | 'flame'
          | 'cloister'
          | 'pillarCover'
          | 'cloisterBattle'
          | 'over'
          | 'clear',
      ) => void;
    };
  }
}
