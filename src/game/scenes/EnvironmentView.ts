import Phaser from 'phaser';
import {
  barricadeDefinitions,
  prototypeArena,
  depthProfile,
  pillarDefinitions,
  stageDepth,
} from '../../data/environment';
import type { Actor } from '../entities/types';
import type { StageEnvironment } from '../entities/environment';

/** Original procedural artwork; all gameplay state comes from the simulation. */
export class EnvironmentView {
  private ground: Phaser.GameObjects.Graphics;
  private pillars: Phaser.GameObjects.Graphics[];
  private walls: Phaser.GameObjects.Graphics[];
  private labels: Phaser.GameObjects.Text[];
  private warning: Phaser.GameObjects.Text;
  constructor(scene: Phaser.Scene) {
    const floor = scene.add.graphics().setDepth(-20);
    floor.fillStyle(0x344447).beginPath();
    floor.moveTo(24, stageDepth(24)[0]);
    for (const p of depthProfile.slice(1)) floor.lineTo(p.x, p.minY);
    floor.lineTo(3600, 494).lineTo(24, 494).closePath().fillPath();
    floor.lineStyle(2, 0x8c9582, 0.65).beginPath().moveTo(24, stageDepth(24)[0]);
    for (const p of depthProfile.slice(1)) floor.lineTo(p.x, p.minY);
    floor.strokePath().lineBetween(24, 489, 3600, 489);
    for (let x = 48; x < 3600; x += 64) {
      floor.lineStyle(1, 0x75827a, 0.16).lineBetween(x, stageDepth(x)[0] + 4, x - 20, 488);
      for (let y = 356; y < 490; y += 32)
        if (y > stageDepth(x)[0]) floor.lineBetween(x - 24, y, x + 40, y);
    }
    scene.add
      .text(160, 340, 'OUTER COURTYARD', { fontSize: '12px', color: '#b3c1ad', letterSpacing: 2 })
      .setDepth(298);
    scene.add
      .text(1140, 300, 'BROKEN CLOISTER', { fontSize: '12px', color: '#b3c1ad', letterSpacing: 2 })
      .setDepth(298);
    this.pillars = pillarDefinitions.map((p) => {
      const g = scene.add.graphics().setDepth(p.y + p.depth / 2);
      g.fillStyle(0x101d23, 0.45).fillEllipse(
        p.x + p.width / 2,
        p.y + p.depth - 3,
        p.width + 25,
        18,
      );
      g.fillStyle(0x657677).fillRect(p.x, p.y - p.height, p.width, p.depth + p.height);
      g.fillStyle(0x8c9c8e).fillRect(p.x - 3, p.y - p.height, p.width + 6, p.depth);
      g.fillStyle(0x3c5056).fillRect(p.x + p.width - 9, p.y + p.depth - p.height, 9, p.height);
      for (let y = p.y + p.depth - p.height + 20; y < p.y + p.depth; y += 24) {
        g.lineStyle(2, 0x34474b).lineBetween(p.x, y, p.x + p.width - 9, y);
        g.lineBetween(
          p.x + (Math.floor(y / 24) % 2 ? 12 : 27),
          y - 22,
          p.x + (Math.floor(y / 24) % 2 ? 12 : 27),
          y,
        );
      }
      g.lineStyle(3, 0xb3b69b).strokeRect(p.x, p.y - p.height, p.width, p.depth + p.height);
      g.lineStyle(2, 0xc2b67e)
        .lineBetween(p.x + 12, p.y + p.depth - 80, p.x + 28, p.y + p.depth - 64)
        .lineBetween(p.x + 28, p.y + p.depth - 64, p.x + 12, p.y + p.depth - 48);
      return g;
    });
    this.ground = scene.add.graphics().setDepth(298);
    this.walls = barricadeDefinitions.map((w) => scene.add.graphics().setDepth(w.y + w.depth / 2));
    this.labels = barricadeDefinitions.map((w) =>
      scene.add
        .text(w.x + w.width / 2, prototypeArena.minY - 160, '', {
          fontSize: '11px',
          color: '#f7ddb0',
          backgroundColor: '#152126dd',
          padding: { x: 4, y: 3 },
        })
        .setOrigin(0.5)
        .setDepth(800),
    );
    this.warning = scene.add
      .text(820, prototypeArena.minY - 160, '', {
        fontSize: '12px',
        color: '#ffe0a0',
        backgroundColor: '#192329ee',
        padding: { x: 5, y: 3 },
      })
      .setOrigin(0.5, 1)
      .setDepth(800);
  }
  render(environment: StageEnvironment, title: boolean, actors: readonly Actor[] = []) {
    this.ground.clear().setVisible(!title);
    environment.pillars.forEach((p, i) => {
      const obscuresActor = actors.some(
        (a) =>
          a.hp > 0 &&
          a.x > p.x - 25 &&
          a.x < p.x + p.width + 25 &&
          a.y < p.y + p.depth / 2 &&
          a.y > p.y - 150,
      );
      this.pillars[i].setVisible(!title).setAlpha(obscuresActor ? 0.35 : 1);
      this.ground.lineStyle(2, 0xa5b6a4, 0.8).strokeRect(p.x, p.y, p.width, p.depth);
      const passageY = p.y < 380 ? 450 : 360;
      this.ground
        .lineStyle(2, 0xc3b888, 0.6)
        .lineBetween(p.x + 12, passageY - 5, p.x + 20, passageY)
        .lineBetween(p.x + 20, passageY, p.x + 12, passageY + 5);
    });
    for (const f of environment.flames) {
      const color = f.phase === 'active' ? 0xff6b28 : f.phase === 'warning' ? 0xffcb67 : 0x101d23;
      this.ground.fillStyle(0x111d23).fillRect(f.x - 4, f.y - 4, f.width + 8, f.depth + 8);
      this.ground
        .fillStyle(
          color,
          f.phase === 'warning' ? 0.35 + 0.2 * Math.sin(environment.time * 18) : 0.85,
        )
        .fillRect(f.x, f.y, f.width, f.depth);
      this.ground.lineStyle(2, color).strokeRect(f.x, f.y, f.width, f.depth);
      for (let x = f.x + 8; x < f.x + f.width; x += 14) {
        this.ground.lineStyle(4, 0x63706b).lineBetween(x, f.y + 4, x, f.y + f.depth - 4);
        if (f.phase === 'active')
          for (let y = f.y + 12; y < f.y + f.depth; y += 18) {
            const h = 12 + 9 * (1 + Math.sin(environment.time * 20 + x + y));
            this.ground.fillStyle(0xffbc4c, 0.9).fillTriangle(x - 6, y, x + 6, y, x + 2, y - h);
            this.ground.fillStyle(0xffee9a, 0.9).fillTriangle(x - 3, y, x + 3, y, x, y - h * 0.55);
          }
      }
      this.warning
        .setText(
          f.phase === 'warning'
            ? '! HEAT INCOMING !'
            : f.phase === 'active'
              ? 'FIRE — MOVE / JUMP'
              : 'FURNACE VENT',
        )
        .setVisible(!title);
    }
    environment.barricades.forEach((w, index) => {
      const g = this.walls[index];
      g.clear().setVisible(!title);
      const label = this.labels[index];
      label
        .setVisible(!title && w.hp > 0)
        .setText(`BARRICADE ${w.hp} / ${barricadeDefinitions[index].hp}`);
      if (w.hp <= 0) {
        g.setDepth(298);
        for (let i = 0; i < 6; i++)
          g.fillStyle(i % 2 ? 0x9a7951 : 0x604d39).fillRect(
            w.x - 8 + i * 12,
            w.y + (i % 3) * 9,
            15,
            5,
          );
        return;
      }
      g.setDepth(w.y + w.depth / 2);
      g.fillStyle(0x09161c, 0.4).fillEllipse(
        w.x + w.width / 2,
        w.y + w.depth / 2,
        w.width + 25,
        w.depth + 8,
      );
      g.fillStyle(0x44382b).fillRect(w.x, w.y - w.height, w.width, w.height + w.depth);
      g.fillStyle(0xa88958).fillRect(w.x, w.y - w.height, w.width, 8);
      for (let i = 0; i < 3; i++) {
        const x = w.x + i * 16;
        g.fillStyle(i % 2 ? 0x977248 : 0x795a3d).fillRect(
          x + 2,
          w.y - w.height + 9,
          12,
          w.height + w.depth - 10,
        );
      }
      g.lineStyle(5, 0xb19b70).lineBetween(
        w.x + 3,
        w.y + w.depth - 7,
        w.x + w.width - 3,
        w.y - w.height + 12,
      );
      if (w.hp < 40)
        g.lineStyle(2, 0x261e1b)
          .lineBetween(w.x + 23, w.y - w.height, w.x + 16, w.y - 20)
          .lineBetween(w.x + 16, w.y - 20, w.x + 33, w.y + 10);
    });
  }
}
