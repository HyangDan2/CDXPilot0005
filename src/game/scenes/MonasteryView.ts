import Phaser from 'phaser';
import { monasteryWaterZones } from '../../data/environment';
import { monasterySections } from '../../data/stages';
import type { StageEnvironment } from '../entities/environment';
import type { Simulation } from '../entities/simulation';

/** Original procedural monastery scenery; water state is read from simulation data. */
export class MonasteryView {
  private water: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene) {
    const backdrop = scene.add.graphics().setDepth(-46);
    for (const section of monasterySections) {
      backdrop
        .fillStyle(section.color)
        .fillRect(section.start, 0, section.end - section.start, 540);
      for (let x = section.start; x < section.end; x += 106) {
        backdrop
          .fillStyle(0x17252d, 0.88)
          .fillRect(x + 10, 105, 54, 205)
          .lineStyle(5, 0x81918c, 0.85)
          .strokeRect(x + 10, 105, 54, 205)
          .lineStyle(2, 0x445c60)
          .lineBetween(x + 37, 108, x + 37, 308);
      }
      const floor = scene.add.graphics().setDepth(-19);
      floor.fillStyle(0x375055).fillRect(section.start, 330, section.end - section.start, 159);
      for (let x = section.start + 12; x < section.end; x += 48)
        floor.lineStyle(1, 0xa3c1ba, 0.2).lineBetween(x, 335, x - 20, 486);
      scene.add
        .text(section.start + 42, 146, section.name, {
          fontSize: '16px',
          color: '#c1ded5',
          letterSpacing: 2,
        })
        .setDepth(-18);
    }
    const props = scene.add.graphics().setDepth(-17);
    for (const x of [7310, 7880, 8420, 9010, 9700]) {
      props
        .fillStyle(0x15252b)
        .fillRect(x, 214, 105, 110)
        .lineStyle(6, 0x91a397)
        .strokeRect(x, 214, 105, 110)
        .lineStyle(3, 0x51696a)
        .lineBetween(x + 52, 220, x + 52, 320);
      props.fillStyle(0xa5b48d).fillCircle(x + 52, 185, 9);
    }
    props
      .fillStyle(0x223c43)
      .fillRect(8430, 302, 188, 28)
      .lineStyle(5, 0xc5b47b)
      .strokeRect(8430, 302, 188, 28)
      .fillStyle(0xd4c18d)
      .fillTriangle(8470, 300, 8500, 300, 8485, 240)
      .fillTriangle(8575, 300, 8605, 300, 8590, 240);
    scene.add
      .text(8390, 182, 'TIDE WARDEN SLAM → SHIFT THE SLUICE', {
        fontSize: '12px',
        color: '#d4e5d8',
        letterSpacing: 1,
      })
      .setDepth(-16);
    this.water = scene.add.graphics().setDepth(296);
  }
  render(sim: Simulation, title: boolean, environment: StageEnvironment) {
    this.water.clear().setVisible(!title && sim.stageId === 'monastery');
    if (title || sim.stageId !== 'monastery') return;
    monasteryWaterZones.forEach((zone, index) => {
      const flooded = index !== environment.waterBank;
      if (!flooded) return;
      this.water
        .fillStyle(0x39a9b5, 0.48)
        .fillRect(zone.x, zone.y, zone.width, zone.depth)
        .lineStyle(3, 0x9ce6df, 0.92)
        .strokeRect(zone.x, zone.y, zone.width, zone.depth);
      for (let x = zone.x + 12; x < zone.x + zone.width; x += 44)
        this.water.lineStyle(2, 0xbaf1e8, 0.5).lineBetween(x, zone.y + 14, x + 18, zone.y + 14);
    });
    if (environment.waterBank === 0) {
      this.water
        .fillStyle(0x121f25, 0.9)
        .fillRect(8524, 240, 56, 90)
        .lineStyle(4, 0xc7b988)
        .strokeRect(8524, 240, 56, 90);
    } else {
      this.water
        .fillStyle(0x17252b, 0.9)
        .fillRect(8524, 240, 56, 90)
        .lineStyle(4, 0xffd783)
        .strokeRect(8524, 240, 56, 90)
        .lineStyle(5, 0xffd783)
        .lineBetween(8524, 320, 8550, 264)
        .lineBetween(8580, 320, 8552, 264);
    }
    if (sim.wave === 2 || sim.wave === 4)
      this.water
        .fillStyle(0xffd783)
        .fillCircle(8552, 266, 10)
        .lineStyle(3, 0xffd783)
        .lineBetween(8552, 277, 8552, 315);
  }
}
