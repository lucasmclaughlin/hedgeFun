import Phaser from 'phaser';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { GRID_CONFIG, LAYER_CONFIGS } from '@/types';

export class GameScene extends Phaser.Scene {
  private asciiRenderer!: AsciiRenderer;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.asciiRenderer = new AsciiRenderer(this);

    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = this.asciiRenderer.getWorldHeight();

    // Set world bounds and camera
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Start camera centered on the ground layer
    const groundStart = LAYER_CONFIGS[4].startRow * GRID_CONFIG.cellHeight;
    this.cameras.main.scrollX = worldWidth / 2 - this.cameras.main.width / 2;
    this.cameras.main.scrollY = groundStart - this.cameras.main.height / 2;

    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // WASD for cursor movement on the grid
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    // Mouse/touch drag for camera panning
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.cameraStartX = this.cameras.main.scrollX;
      this.cameraStartY = this.cameras.main.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!this.isDragging) return;
      const dx = this.dragStartX - pointer.x;
      const dy = this.dragStartY - pointer.y;
      this.cameras.main.scrollX = this.cameraStartX + dx;
      this.cameras.main.scrollY = this.cameraStartY + dy;
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Click to place cursor
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      // Only set cursor if it was a click (not a drag)
      const dx = Math.abs(pointer.x - this.dragStartX);
      const dy = Math.abs(pointer.y - this.dragStartY);
      if (dx < 5 && dy < 5) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        const col = Math.floor(worldX / GRID_CONFIG.cellWidth);
        const row = Math.floor(worldY / GRID_CONFIG.cellHeight);
        if (col >= 0 && col < GRID_CONFIG.cols && row >= 0 && row < GRID_CONFIG.rows) {
          this.asciiRenderer.setCursor(col, row);
        }
      }
    });

    // Add some decorative elements to make the world feel alive
    this.addGroundDecoration();
  }

  update(_time: number, delta: number): void {
    // Camera scrolling with arrow keys
    const scrollSpeed = 5;
    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= scrollSpeed;
    }
    if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += scrollSpeed;
    }
    if (this.cursors.up.isDown) {
      this.cameras.main.scrollY -= scrollSpeed;
    }
    if (this.cursors.down.isDown) {
      this.cameras.main.scrollY += scrollSpeed;
    }

    this.asciiRenderer.update(delta);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const col = this.asciiRenderer.getCursorCol();
    const row = this.asciiRenderer.getCursorRow();

    switch (event.key) {
      case 'w': case 'W':
        if (row > 0) this.asciiRenderer.setCursor(col, row - 1);
        break;
      case 's': case 'S':
        if (row < GRID_CONFIG.rows - 1) this.asciiRenderer.setCursor(col, row + 1);
        break;
      case 'a': case 'A':
        if (col > 0) this.asciiRenderer.setCursor(col - 1, row);
        break;
      case 'd': case 'D':
        if (col < GRID_CONFIG.cols - 1) this.asciiRenderer.setCursor(col + 1, row);
        break;
    }
  }

  /** Add ground-level decoration: grass tufts, stones, soil texture */
  private addGroundDecoration(): void {
    const groundGlyphs = [
      { char: '"', fg: '#7aba4a' },
      { char: "'", fg: '#6aaa3a' },
      { char: ',', fg: '#8aca5a' },
      { char: '`', fg: '#7aba4a' },
      { char: '"', fg: '#5a9a2a' },
    ];

    const undergroundGlyphs = [
      { char: '·', fg: '#9a7a4a' },
      { char: '°', fg: '#8a6a3a' },
      { char: '~', fg: '#7a5a2a' },
    ];

    // Scatter grass on ground layer
    for (let col = 0; col < GRID_CONFIG.cols; col++) {
      // Ground surface (row 27) — grass line
      if (Math.random() < 0.6) {
        const g = groundGlyphs[Math.floor(Math.random() * groundGlyphs.length)];
        this.asciiRenderer.setOverlay(col, 27, g);
      }

      // Underground — occasional roots and rocks
      for (let row = 34; row < 40; row++) {
        if (Math.random() < 0.08) {
          const g = undergroundGlyphs[Math.floor(Math.random() * undergroundGlyphs.length)];
          this.asciiRenderer.setOverlay(col, row, g);
        }
      }
    }

    // Sky — occasional stars/clouds
    for (let col = 0; col < GRID_CONFIG.cols; col++) {
      for (let row = 0; row < 6; row++) {
        if (Math.random() < 0.02) {
          this.asciiRenderer.setOverlay(col, row, { char: '*', fg: '#cacaee' });
        } else if (Math.random() < 0.01) {
          this.asciiRenderer.setOverlay(col, row, { char: '~', fg: '#7a7aaa' });
        }
      }
    }
  }
}
