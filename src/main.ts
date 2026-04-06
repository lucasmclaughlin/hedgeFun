import Phaser from 'phaser';
import { SplashScene } from '@/scenes/SplashScene';
import { TutorialScene } from '@/scenes/TutorialScene';
import { GameScene } from '@/scenes/GameScene';
import { VillageScene } from '@/scenes/VillageScene';
import { KingdomsSplashScene } from '@/scenes/KingdomsSplashScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game-container',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0a0a0a',
  scene: [SplashScene, TutorialScene, GameScene, VillageScene, KingdomsSplashScene],
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
