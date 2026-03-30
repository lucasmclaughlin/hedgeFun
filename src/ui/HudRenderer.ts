import { TimeClock } from '../simulation/TimeClock';
import { Season } from '../types/index';

export class HudRenderer {
  private seasonText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;
  private weatherText: Phaser.GameObjects.Text;
  private creatureText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private speciesLines: Phaser.GameObjects.Text[] = [];
  private messageText: Phaser.GameObjects.Text;
  private milestoneToast: Phaser.GameObjects.Text;
  private milestoneToastTimer = 0;

  constructor(private timeClock: TimeClock, private scene: Phaser.Scene) {
    this.seasonText = this.scene.add.text(10, 10, '', { fontSize: '24px', color: '#ffffff' });
    this.energyText = this.scene.add.text(10, 40, '', { fontSize: '24px', color: '#ffffff' });
    this.weatherText = this.scene.add.text(10, 70, '', { fontSize: '24px', color: '#ffffff' });
    this.creatureText = this.scene.add.text(10, 100, '', { fontSize: '24px', color: '#ffffff' });
    this.scoreText = this.scene.add.text(10, 130, '', { fontSize: '24px', color: '#ffffff' });

    for (let i = 0; i < 5; i++) {
      const line = this.scene.add.text(10, 160 + i * 30, '', { fontSize: '24px', color: '#ffffff' });
      this.speciesLines.push(line);
    }

    this.messageText = this.scene.add.text(10, 500, '', { fontSize: '24px', color: '#ffffff' });
    this.milestoneToast = this.scene.add.text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, '', {
      fontSize: '36px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5).setVisible(false);
  }

  public update(): void {
    const year = this.timeClock.getYear();
    const season = this.getCurrentSeason(); // Implement this method to get the current season

    this.seasonText.setText(`Year ${year} — ${season}`);
    // Update other HUD elements as needed
  }

  private getCurrentSeason(): string {
    // Implement logic to determine the current season based on periodIndex
    const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
    return seasons[Math.floor(this.timeClock.periodIndex % 12 / 3)];
  }
}
