import type { ArenaScene } from './ArenaScene';
import { waves } from '../../data/stage';
import { createActor } from '../entities/actor';
export function installHarness(scene: ArenaScene) {
  if (new URLSearchParams(location.search).get('test') !== '1') return;
  window.__VALKYRIE__ = {
    snapshot: () => ({
      mode: scene.ui.mode,
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
      arrows: scene.sim.arrows.length,
      wave: scene.sim.wave,
      combo: scene.sim.combo,
      enemies: scene.sim.enemies.map((e) => ({ hp: e.hp, kind: e.kind, state: e.state })),
      time: scene.sim.time,
      status: scene.sim.status,
    }),
    fixture: (name) => {
      const s = scene.sim;
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
      if (name === 'boss') {
        s.wave = 3;
        s.active = false;
        s.enemies = [];
        s.player.x = waves[3].trigger;
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
        arrows: number;
        wave: number;
        combo: number;
        enemies: { hp: number; kind: string; state: string }[];
        time: number;
        status: string;
      };
      fixture: (name: 'combat' | 'archer' | 'boss' | 'over' | 'clear') => void;
    };
  }
}
