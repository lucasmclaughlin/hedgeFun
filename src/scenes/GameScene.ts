import { TimeClock } from '../simulation/TimeClock';
import { HudRenderer } from '../ui/HudRenderer';

export class GameScene extends Phaser.Scene {
  private asciiRenderer!: AsciiRenderer;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  private timeClock: TimeClock;
  private hudRenderer: HudRenderer;

  // Simulation
  init(data: { playerName?: string; loadSave?: SaveData }): void {
    this.playerName = data?.playerName || 'Player';
    this.timeClock = new TimeClock();
  }

  create(): void {
    this.asciiRenderer = new AsciiRenderer(this);

    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = this.asciiRenderer.getWorldHeight();

    // Set initial camera position (horizontal center), then apply view mode bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.scrollX = worldWidth / 2 - this.cameras.main.width / 2;

    // Initialize other game elements...

    this.hudRenderer = new HudRenderer(this.timeClock, this);

    // Update the HUD every frame
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.hudRenderer.update();
      },
      loop: true
    });
  }

  // Other methods...
}
