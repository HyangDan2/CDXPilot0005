import Phaser from 'phaser';
import { depthProfile, stageDepth } from '../../data/environment';
import { forgeSections } from '../../data/stages';
import type { Simulation } from '../entities/simulation';

/** Original procedural set dressing. Device phases are read from the model. */
export class ForgeView {
  private devices: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene) {
    const backdrop = scene.add.graphics().setDepth(-45);
    for (const section of forgeSections) {
      backdrop
        .fillStyle(section.color)
        .fillRect(section.start, 0, section.end - section.start, 540);
      for (let x = section.start; x < section.end; x += 88)
        for (let y = 16; y < 330; y += 36) {
          backdrop.lineStyle(2, 0x111b22, 0.55).strokeRect(x + (y % 72 ? 0 : -44), y, 84, 32);
        }
      scene.add
        .text(section.start + 55, 145, section.name, {
          fontSize: '18px',
          color: section.start === 5580 ? '#a7dbd8' : '#d4b78b',
          letterSpacing: 2,
        })
        .setDepth(-26);
      const floor = scene.add.graphics().setDepth(-19);
      floor
        .fillStyle(section.start === 5580 ? 0x34545a : 0x4c4140)
        .beginPath()
        .moveTo(section.start, stageDepth(section.start)[0]);
      for (const p of depthProfile)
        if (p.x > section.start && p.x < section.end) floor.lineTo(p.x, p.minY);
      floor
        .lineTo(section.end, stageDepth(section.end)[0])
        .lineTo(section.end, 489)
        .lineTo(section.start, 489)
        .closePath()
        .fillPath();
      for (let x = section.start + 24; x < section.end; x += 56) {
        floor.lineStyle(1, 0xabb1a0, 0.15).lineBetween(x, stageDepth(x)[0] + 3, x - 16, 488);
        for (let y = 360; y < 489; y += 32)
          if (y >= stageDepth(x)[0]) floor.lineBetween(x - 16, y, x + 40, y);
      }
    }
    const props = scene.add.graphics().setDepth(-27);
    // Entry arch and stockhouse crates sit behind the walkable floor.
    props.lineStyle(14, 0x8d7658).strokeRect(3660, 170, 100, 155);
    for (const x of [4300, 4470, 4660]) {
      props
        .fillStyle(0x66462e)
        .fillRect(x, 238, 76, 82)
        .lineStyle(4, 0xb09663)
        .strokeRect(x, 238, 76, 82)
        .lineBetween(x, 238, x + 76, 320);
      props.fillStyle(0x554032).fillRect(x + 12, 204, 52, 34);
    }
    for (const x of [4910, 5210, 5430]) {
      props
        .fillStyle(0x171d24)
        .fillRect(x, 188, 110, 133)
        .fillRect(x + 23, 50, 56, 140);
      props
        .fillStyle(0xc35432)
        .fillRect(x + 14, 220, 82, 87)
        .fillStyle(0xffc477)
        .fillTriangle(x + 23, 302, x + 95, 302, x + 68, 238);
      for (let bar = x + 18; bar < x + 105; bar += 16)
        props.lineStyle(5, 0x3f4140).lineBetween(bar, 220, bar, 309);
    }
    props
      .fillStyle(0x142f3d)
      .fillEllipse(5930, 286, 330, 72)
      .lineStyle(6, 0x709b9e)
      .strokeEllipse(5930, 286, 330, 72);
    props.fillStyle(0x8bc1ba, 0.2).fillEllipse(5930, 256, 230, 25);
    for (const x of [5700, 6120, 6210]) {
      props
        .fillStyle(0x324e40)
        .fillTriangle(x, 328, x + 20, 243, x + 34, 327)
        .fillTriangle(x + 10, 325, x - 18, 266, x + 23, 325);
    }
    props
      .fillStyle(0x151c25)
      .fillRect(6820, 170, 160, 155)
      .lineStyle(8, 0xb78a55)
      .strokeRect(6820, 170, 160, 155);
    scene.add
      .text(6898, 205, 'ᛟ', { fontSize: '72px', color: '#ce905a' })
      .setOrigin(0.5, 0)
      .setDepth(-26);
    scene.add
      .text(6480, 190, 'SLAM → PRESSURE VENT\nCHARGE → BROKEN BARRICADE', {
        fontSize: '13px',
        color: '#e0c596',
        lineSpacing: 5,
      })
      .setDepth(-25);
    scene.add
      .text(5840, 315, 'OPTIONAL HEAL ↑', { fontSize: '12px', color: '#c2e7d4' })
      .setDepth(298);
    this.devices = scene.add.graphics().setDepth(297);
  }
  render(s: Simulation, title: boolean) {
    const g = this.devices;
    g.clear().setVisible(!title && s.stageId === 'forge');
    if (s.stageId !== 'forge') return;
    for (const vent of s.environment.flames.filter((f) => f.controlled)) {
      const color =
        vent.phase === 'active' ? 0xffda8d : vent.phase === 'warning' ? 0xf3a64c : 0x6f7b83;
      const y = vent.y < 400 ? 333 : 480;
      g.lineStyle(4, 0x736655).lineBetween(vent.x, y, 7120, y);
      g.lineStyle(2, color, vent.phase === 'rest' ? 0.3 : 0.95).lineBetween(vent.x, y, 7120, y);
      g.fillStyle(0x202a34)
        .fillRect(7090, y - 24, 32, 25)
        .lineStyle(2, color)
        .strokeRect(7090, y - 24, 32, 25);
      g.fillStyle(color).fillCircle(7106, y - 12, 5);
    }
  }
}
