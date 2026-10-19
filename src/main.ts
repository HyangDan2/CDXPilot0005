import Phaser from 'phaser';
import { ArenaScene } from './game/scenes/ArenaScene';
import './style.css';
new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#16272e',
  scene: ArenaScene,
  scale: { mode: Phaser.Scale.NONE },
  parent: 'app',
  render: { antialias: false },
  audio: { noAudio: true },
});
