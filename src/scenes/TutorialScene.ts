import Phaser from 'phaser';

const CONTROLS = [
  ['A / D', 'Move cursor left / right'],
  ['1-6', 'Select plant species'],
  ['Space / Enter', 'Plant selected species'],
  ['P', 'Prune plant at cursor'],
  ['H', 'Lay hedge (Winter only, Mature plants)'],
  ['Arrow keys', 'Pan camera'],
  ['Mouse drag', 'Pan camera'],
  ['Tab', 'Cycle speed (Pause / Slow / Normal / Fast)'],
  ['M', 'Milestone log (biodiversity score)'],
  ['V', 'Cycle view (Hedge / Underground / Full)'],
  ['E / I', 'Export / Import save file'],
  ['Z', 'Screenshot mode (hide UI, full zoom out)'],
  ['R', 'Return to main menu'],
  ['Esc / Menu button', 'In-game menu & controls'],
];

const TIPS = [
  'Plant hedgerow species to build a thriving ecosystem.',
  'Different species grow in different seasons.',
  'As your hedge grows, wildlife will move in.',
  'Energy regenerates each season — full moon gives a bonus.',
];

export class TutorialScene extends Phaser.Scene {
  private playerName = '';

  constructor() {
    super({ key: 'TutorialScene' });
  }

  init(data: { playerName: string }): void {
    this.playerName = data.playerName || 'Player';
  }

  create(): void {
    const cx = this.cameras.main.width / 2;
    const cy = this.cameras.main.height / 2;

    // Title
    this.add.text(cx, cy - 200, `Welcome, ${this.playerName}!`, {
      fontFamily: 'Courier New, monospace',
      fontSize: '20px',
      color: '#7aba4a',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 170, 'How to Play', {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // Controls table
    const tableStartY = cy - 130;
    for (let i = 0; i < CONTROLS.length; i++) {
      const [key, desc] = CONTROLS[i];
      this.add.text(cx - 180, tableStartY + i * 24, key, {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#eaca4a',
      });
      this.add.text(cx - 30, tableStartY + i * 24, desc, {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#aaaaaa',
      });
    }

    // Tips
    const tipsY = tableStartY + CONTROLS.length * 24 + 30;
    for (let i = 0; i < TIPS.length; i++) {
      this.add.text(cx, tipsY + i * 22, TIPS[i], {
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        color: '#7a9a6a',
      }).setOrigin(0.5);
    }

    // Continue
    this.add.text(cx, tipsY + TIPS.length * 22 + 40, 'Press any key to begin', {
      fontFamily: 'Courier New, monospace',
      fontSize: '15px',
      color: '#888888',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', () => {
      this.scene.start('GameScene', { playerName: this.playerName });
    });

    this.input.on('pointerdown', () => {
      this.scene.start('GameScene', { playerName: this.playerName });
    });
  }
}
