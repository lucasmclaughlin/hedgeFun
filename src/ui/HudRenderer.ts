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

  constructor(private timeClock: TimeClock) {
    // Initialize your text objects here
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
