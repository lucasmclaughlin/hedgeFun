import Phaser from 'phaser';
import { Season, type TimePeriod, type MoonPhase, type SpeciesDef } from '@/types';

const SEASON_COLORS: Record<Season, string> = {
  [Season.Spring]: '#7aba4a',
  [Season.Summer]: '#eaea4a',
  [Season.Autumn]: '#da8a2a',
  [Season.Winter]: '#aacaea',
};

const HUD_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '16px',
  color: '#cccccc',
  backgroundColor: '#000000aa',
  padding: { x: 8, y: 4 },
};

export class HudRenderer {
  private seasonText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;
  private speciesText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private messageTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.seasonText = scene.add.text(8, 8, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.energyText = scene.add.text(8, 32, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.speciesText = scene.add.text(8, 56, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.messageText = scene.add.text(8, 88, '', {
      ...HUD_STYLE,
      color: '#ffaa44',
    })
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);
  }

  update(
    seasonName: string,
    subName: string,
    moonSymbol: string,
    moonName: string,
    period: TimePeriod,
    _moon: MoonPhase,
    energy: number,
    selectedSpecies: SpeciesDef | null,
    selectedIndex: number,
    delta: number,
  ): void {
    const color = SEASON_COLORS[period.season];
    this.seasonText.setText(`${subName} ${seasonName} ${moonSymbol} ${moonName}`);
    this.seasonText.setColor(color);

    const bar = '\u2588'.repeat(Math.min(energy, 20)) + '\u2591'.repeat(Math.max(0, 20 - energy));
    this.energyText.setText(`Energy: ${bar} ${energy}`);

    if (selectedSpecies) {
      this.speciesText.setText(
        `[${selectedIndex + 1}] ${selectedSpecies.name} (${selectedSpecies.energyCost}E)`
      );
    } else {
      this.speciesText.setText('[1-6] Select species');
    }

    // Fade message
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) {
        this.messageText.setAlpha(0);
      } else if (this.messageTimer < 500) {
        this.messageText.setAlpha(this.messageTimer / 500);
      }
    }
  }

  showMessage(msg: string, durationMs = 2000): void {
    this.messageText.setText(msg);
    this.messageText.setAlpha(1);
    this.messageTimer = durationMs;
  }
}
