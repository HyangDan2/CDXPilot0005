import Phaser from 'phaser';
import { ActorView } from '../animation/ActorView';
import { sdFrame } from '../animation/sd';
import { cameraTarget } from '../camera/follow';
import { hitbox } from '../combat/combat';
import { attackPhase } from '../../data/attacks';
import type { Simulation } from '../entities/simulation';
import type { GameEvent } from '../entities/types';
import { createActor } from '../entities/actor';
interface Spark {
  x: number;
  y: number;
  life: number;
  max: number;
  value?: number;
}
export class ArenaView {
  private actors = new Map<number, ActorView>();
  private shadows: Phaser.GameObjects.Graphics;
  private effects: Phaser.GameObjects.Graphics;
  private debugText: Phaser.GameObjects.Text;
  private sparks: Spark[] = [];
  private titleActor = createActor(-1, 'player', 714, 414);
  private titleView: ActorView;
  constructor(private scene: Phaser.Scene) {
    scene.add.image(0, 0, 'distant').setOrigin(0).setScale(2).setScrollFactor(0.25).setDepth(-100);
    scene.add.image(0, 0, 'ruins').setOrigin(0).setScale(2).setDepth(-50);
    const light = scene.add.graphics().setDepth(-40);
    for (let x = 105; x < 3600; x += 370) {
      light.fillStyle(0xaac5b0, 0.045).fillTriangle(x, 95, x - 130, 460, x + 150, 460);
      light.fillStyle(0xd6e2bd, 0.035).fillTriangle(x, 95, x - 30, 440, x + 70, 440);
    }
    // The final sealed gate is visibly distinct from the cloister windows.
    const gate = scene.add.graphics().setDepth(-30);
    gate
      .fillStyle(0x192c34)
      .fillRect(3190, 125, 210, 220)
      .lineStyle(7, 0x7b7b62)
      .strokeRect(3190, 125, 210, 220);
    for (let x = 3200; x < 3400; x += 20) gate.lineStyle(3, 0x4b5b54).lineBetween(x, 130, x, 340);
    scene.add
      .text(3295, 210, 'ᛟ', { fontFamily: 'serif', fontSize: '75px', color: '#b29b67' })
      .setOrigin(0.5)
      .setDepth(-29);
    this.shadows = scene.add.graphics().setDepth(299);
    this.effects = scene.add.graphics().setDepth(800);
    this.debugText = scene.add
      .text(16, 90, '', {
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#b7f2d1',
        backgroundColor: '#09151cee',
        padding: { x: 10, y: 10 },
      })
      .setScrollFactor(0)
      .setDepth(10000);
    this.titleView = new ActorView(scene, 'player');
  }
  event(e: GameEvent) {
    if (e.type === 'hit' || e.type === 'heal') {
      this.sparks.push({ x: e.x, y: e.y, life: 0.33, max: 0.33, value: e.value });
      this.scene.cameras.main.shake(65, 0.0025);
      const t = this.scene.add
        .text(e.x, e.y - 18, e.type === 'heal' ? '+' + e.value : String(e.value), {
          fontFamily: 'Georgia',
          fontSize: '22px',
          color: '#fff0bd',
          stroke: '#273231',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(1000);
      this.scene.tweens.add({
        targets: t,
        y: t.y - 35,
        alpha: 0,
        duration: 650,
        onComplete: () => t.destroy(),
      });
    }
    if (e.type === 'land') this.sparks.push({ x: e.x, y: e.y + 38, life: 0.22, max: 0.22 });
  }
  render(s: Simulation, delta: number, debug: boolean, title: boolean, paused: boolean) {
    const dt = paused ? 0 : Math.min(delta / 1000, 0.05);
    this.effects.clear();
    this.shadows.clear();
    if (title) {
      this.titleActor.stateTime += dt;
      this.titleView.update(this.titleActor, 1.65);
      this.scene.cameras.main.scrollX = 0;
      this.shadows.fillStyle(0x081a23, 0.4).fillEllipse(714, 417, 125, 23);
    }
    this.titleView.body.setVisible(title);
    this.titleView.sword.setVisible(title && this.titleView.sword.visible);
    const current = new Set(s.enemies.concat(s.player).map((a) => a.id));
    for (const [id, view] of this.actors)
      if (!current.has(id)) {
        view.destroy();
        this.actors.delete(id);
      }
    for (const a of [...s.enemies, s.player]) {
      let view = this.actors.get(a.id);
      if (!view) {
        view = new ActorView(this.scene, a.kind);
        this.actors.set(a.id, view);
      }
      view.update(a);
      view.body.setVisible(!title);
      view.sword.setVisible(!title && view.sword.visible);
      if (title) continue;
      if (a.hp > 0)
        this.shadows
          .fillStyle(0x091b23, 0.38)
          .fillEllipse(a.x, a.y + 2, a.kind === 'boss' ? 85 : 52, 12);
      if (a.kind !== 'player' && a.hp > 0) {
        const w = a.kind === 'boss' ? 60 : 34;
        this.effects
          .fillStyle(0x15232c, 0.8)
          .fillRect(a.x - w / 2, a.y - a.z - (a.kind === 'boss' ? 155 : 121), w, 3)
          .fillStyle(0xca9b76)
          .fillRect(
            a.x - w / 2,
            a.y - a.z - (a.kind === 'boss' ? 155 : 121),
            (w * a.hp) / a.maxHp,
            3,
          );
      }
      if (a.attack) {
        const phase = attackPhase(a.attack.id, a.attack.elapsed);
        if (a.attack.id === 'slam' && phase === 'active') {
          const b = hitbox(a);
          this.shadows
            .lineStyle(3, 0xefb96a, 0.85)
            .strokeEllipse(b.x + b.width / 2, a.y, b.width, b.height);
        }
        if (a.kind !== 'player' && phase === 'startup') {
          const b = hitbox(a);
          if (a.attack.id === 'enemyShot')
            this.shadows
              .lineStyle(2, 0xe78a68, 0.5)
              .lineBetween(a.x, a.y, a.x + a.facing * 380, a.y);
          this.shadows
            .fillStyle(0xcc6e50, 0.18)
            .fillEllipse(b.x + b.width / 2, a.y, b.width, b.height);
          this.effects
            .lineStyle(1, 0xf0b68a, 0.7)
            .strokeCircle(a.x, a.y - a.z - 80, 5 + Math.sin(s.time * 12) * 2);
        }
      }

      if (debug) {
        const height = a.kind === 'boss' ? 115 : 95;
        this.effects.lineStyle(1, 0x72faaf).strokeRect(a.x - 16, a.y - a.z - height, 32, height);
        if (a.attack && attackPhase(a.attack.id, a.attack.elapsed) === 'active') {
          const b = hitbox(a);
          this.effects
            .lineStyle(1, 0xff6655)
            .strokeRect(b.x, a.y - b.maxZ, b.width, b.maxZ - b.minZ);
          this.shadows.lineStyle(1, 0xffcc55).strokeRect(b.x, b.y, b.width, b.height);
        }
      }
    }
    for (const arrow of s.arrows) {
      const y = arrow.y - arrow.z,
        tail = arrow.x - arrow.facing * 24;
      this.effects.lineStyle(2, 0xe7d4a5).lineBetween(tail, y, arrow.x, y);
      this.effects
        .fillStyle(arrow.player ? 0xdaf5ff : 0xff9870)
        .fillTriangle(
          arrow.x + arrow.facing * 6,
          y,
          arrow.x - arrow.facing * 3,
          y - 3,
          arrow.x - arrow.facing * 3,
          y + 3,
        );
      this.effects.lineStyle(2, 0xc7d0b6).lineBetween(tail, y, tail - arrow.facing * 4, y - 4);
    }
    for (const item of s.loot) {
      const color = item.fraction === 0.5 ? 0xffd16c : item.fraction === 0.2 ? 0x7cc8f0 : 0x86e6a2;
      const radius = item.fraction === 0.5 ? 10 : item.fraction === 0.2 ? 8 : 6;
      this.effects.fillStyle(0x101820).fillCircle(item.x, item.y - 8, radius + 2);
      this.effects
        .fillStyle(color)
        .fillCircle(item.x, item.y - 8, radius)
        .fillRect(item.x - 3, item.y - 21, 6, 7);
      this.effects
        .lineStyle(2, 0xffffff, 0.8)
        .lineBetween(item.x - 3, item.y - 8, item.x + 3, item.y - 8)
        .lineBetween(item.x, item.y - 11, item.x, item.y - 5);
    }
    if (!title) {
      const target = cameraTarget(s.player.x);
      this.scene.cameras.main.scrollX +=
        (target - this.scene.cameras.main.scrollX) * (1 - Math.exp(-dt * 8));
    }
    for (const spark of this.sparks) {
      spark.life -= dt;
      const t = 1 - spark.life / spark.max;
      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9;
        const r = 12 + t * 45;
        this.effects
          .fillStyle(i % 2 ? 0xf0ca7d : 0xe7f2d1, 1 - t)
          .fillRect(spark.x + Math.cos(angle) * r, spark.y + Math.sin(angle) * r, 3, 3);
      }
    }
    this.sparks = this.sparks.filter((p) => p.life > 0);
    const time = title ? this.titleActor.stateTime : s.time;
    for (let i = 0; i < 32; i++) {
      const x = (i * 127 + time * (6 + (i % 3))) % 3600,
        y = 90 + ((i * 67) % 340) + Math.sin(time + i) * 8;
      this.effects
        .fillStyle(i % 3 ? 0xc1cbac : 0xeec77d, 0.2 + (Math.sin(time * 2 + i) + 1) * 0.15)
        .fillRect(x, y, 2, 2);
    }
    this.debugText
      .setVisible(debug && !title)
      .setText(
        `FPS ${Math.round(this.scene.game.loop.actualFps)} | Player ${s.player.state}\nXYZ ${s.player.x.toFixed(1)} / ${s.player.y.toFixed(1)} / ${s.player.z.toFixed(1)}\nWave ${s.wave + 1} | Combo ${s.combo} | Active frame ${Math.floor((s.player.attack?.elapsed ?? 0) * 60)}\nSD ${sdFrame(s.player).sheet} frame ${sdFrame(s.player).frame} | integrated weapon\n${s.enemies.map((e) => `${e.kind}: ${e.ai} air=${e.juggle.airHits}/3 launch=${e.juggle.launches} ${e.juggle.forced ? 'DOWN' : ''}`).join(' | ')}\nGreen: hurtbox · Red: strike height · Yellow: depth`,
      );
  }
  reset() {
    for (const v of this.actors.values()) v.destroy();
    this.actors.clear();
    this.sparks = [];
    this.scene.cameras.main.scrollX = 0;
  }
}
