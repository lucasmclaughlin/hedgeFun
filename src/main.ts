import Phaser from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { GameScene } from '@/scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0a0a0a',
  scene: [BootScene, GameScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
};

new Phaser.Game(config);
