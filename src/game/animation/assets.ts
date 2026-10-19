import { sd } from './sd';
import Phaser from 'phaser';
import manifest from '../../../public/assets/manifest.json';
export { manifest };
export function preloadAssets(scene: Phaser.Scene) {
  const base = import.meta.env.BASE_URL + 'assets/';
  for (const kind of ['player', 'grunt', 'rusher', 'guard', 'boss'])
    scene.load.spritesheet(
      kind,
      base + `${kind === 'player' ? 'characters' : 'enemies'}/${kind}.png`,
      { frameWidth: 48, frameHeight: 64 },
    );
  for (const name of [
    'smooth-idle',
    'smooth-move',
    'smooth-attack',
    'smooth-defense',
    'smooth-reaction',
    'smooth-stop',
    'smooth-grunt',
    'smooth-rusher',
    'smooth-guard',
    'smooth-boss',
  ])
    scene.load.spritesheet('sd-' + name, base + 'sd-v3/' + name + '.png', {
      frameWidth: sd.size,
      frameHeight: sd.size,
    });
  scene.load.image('sword', base + 'weapons/oathblade.png');
  scene.load.image('distant', base + 'backgrounds/distant.png');
  scene.load.image('ruins', base + 'backgrounds/ruins.png');
}
export function ensureFallbacks(scene: Phaser.Scene) {
  for (const key of ['player', 'grunt', 'rusher', 'guard', 'boss', 'sword', 'distant', 'ruins']) {
    if (scene.textures.exists(key)) continue;
    const g = scene.make.graphics({ x: 0, y: 0 });
    if (key === 'sword') {
      g.fillStyle(0xcdded9).fillRect(8, 4, 43, 4).fillStyle(0xdab67a).fillRect(8, 2, 3, 9);
      g.generateTexture(key, 52, 12);
    } else if (key === 'distant' || key === 'ruins') {
      g.fillStyle(key === 'distant' ? 0x1e3741 : 0x40534b).fillRect(0, 0, 960, 270);
      g.generateTexture(key, 960, 270);
    } else {
      g.fillStyle(key === 'player' ? 0x95bacb : 0xa87066)
        .fillRect(15, 15, 19, 43)
        .fillStyle(0xe1d8b3)
        .fillRect(18, 10, 13, 13);
      g.generateTexture(key, 48, 64);
    }
    g.destroy();
  }
}
