import { sd, sdFrame } from './sd';
import Phaser from 'phaser';
import type { Actor } from '../entities/types';
import { frameFor, weaponPose, SWORD_V2 } from './rig';
import { manifest } from './assets';
import { eira, eiraFrame } from './eira';
export class ActorView {
  body: Phaser.GameObjects.Image;
  sword: Phaser.GameObjects.Image;
  constructor(
    private scene: Phaser.Scene,
    kind: string,
  ) {
    this.body = scene.add.image(0, 0, kind).setOrigin(0.5, 0.9375);
    this.sword = scene.add.image(0, 0, 'sword').setOrigin(8 / 52, 0.5);
  }
  update(a: Actor, extraScale = 1) {
    const authored = sdFrame(a),
      integrated = this.scene.textures.exists('sd-' + authored.sheet);
    const origin = sd.sheets[authored.sheet as keyof typeof sd.sheets]?.origin ?? sd.origin;
    const pose = eiraFrame(a),
      detailed = a.kind === 'player' && this.scene.textures.exists('eira-' + pose.clip);
    const base = integrated
      ? sd.scale
      : detailed
        ? eira.displayScale
        : a.kind === 'boss'
          ? 2.65
          : 1.65;
    const frame = integrated
      ? authored.frame
      : detailed
        ? pose.frame
        : manifest.animations[a.state].start + frameFor(a);
    this.body.setTexture(
      integrated ? 'sd-' + authored.sheet : detailed ? 'eira-' + pose.clip : a.kind,
    );
    this.body
      .setOrigin(
        integrated ? (a.facing < 0 ? 1 - origin[0] : origin[0]) : 0.5,
        integrated ? origin[1] : detailed ? eira.origin[1] : 0.9375,
      )
      .setFrame(this.body.texture.has(String(frame)) ? frame : '__BASE')
      .setPosition(a.x, a.y - a.z)
      .setScale(base * extraScale)
      .setFlipX(a.facing < 0)
      .setDepth(a.y);
    this.body.setAlpha(
      a.hp <= 0
        ? Math.max(0, 1 - (a.stateTime - 0.5) * 1.4)
        : a.invulnerable > 0 && Math.floor(a.stateTime * 24) % 2
          ? 0.5
          : 1,
    );
    const newSword = detailed && this.scene.textures.exists('sword-v2');
    this.sword
      .setTexture(newSword ? 'sword-v2' : 'sword')
      .setOrigin(newSword ? SWORD_V2.pivot[0] / SWORD_V2.size[0] : 8 / 52, 0.5);
    const p = weaponPose(a, detailed),
      ratio = (detailed ? 1 : base / 1.65) * extraScale;
    this.sword
      .setPosition(a.x + (p.x - a.x) * ratio, a.y - a.z + (p.y - (a.y - a.z)) * ratio)
      .setRotation(p.rotation)
      .setScale((newSword ? SWORD_V2.displayScale : 1.65) * ratio)
      .setDepth(a.y + 0.3)
      .setAlpha(this.body.alpha)
      .setVisible(
        !integrated && a.hp > 0 && !['Knockdown', 'Recovery', 'Hit', 'Kick'].includes(a.state),
      );
    if (a.kind !== 'player') this.sword.setTint(a.kind === 'boss' ? 0xdd99aa : 0xb5b7a5);
  }
  destroy() {
    this.body.destroy();
    this.sword.destroy();
  }
}
