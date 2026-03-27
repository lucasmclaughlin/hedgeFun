import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // No assets to load yet — ASCII rendering uses canvas text
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
