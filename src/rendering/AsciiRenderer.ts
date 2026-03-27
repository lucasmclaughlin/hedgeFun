import Phaser from 'phaser';
import { Glyph, GRID_CONFIG } from '@/types';
import { getBackgroundGlyph, getBackgroundColor } from './GlyphAtlas';

/**
 * Grid-based ASCII renderer using Phaser's Canvas.
 * Each cell is one character with foreground and optional background color.
 * Renders to an offscreen canvas texture that Phaser displays as an image.
 */
export class AsciiRenderer {
  private scene: Phaser.Scene;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private image: Phaser.GameObjects.Image;
  private texture: Phaser.Textures.CanvasTexture;

  /** Overlay grid: sparse map of "col,row" -> Glyph for entities on top of background */
  private overlays: Map<string, Glyph> = new Map();

  /** Cursor position */
  private cursorCol = 0;
  private cursorRow = 30; // start on ground layer
  private cursorVisible = true;
  private cursorTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const { cols, rows, cellWidth, cellHeight } = GRID_CONFIG;
    const pixelWidth = cols * cellWidth;
    const pixelHeight = rows * cellHeight;

    // Create offscreen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = pixelWidth;
    this.canvas.height = pixelHeight;
    this.ctx = this.canvas.getContext('2d')!;

    // Create Phaser texture from canvas
    this.texture = scene.textures.createCanvas('ascii-grid', pixelWidth, pixelHeight)!;
    this.image = scene.add.image(0, 0, 'ascii-grid');
    this.image.setOrigin(0, 0);

    // Initial render
    this.renderFullGrid();
  }

  /** Set an overlay glyph at a position (for entities, plants, etc.) */
  setOverlay(col: number, row: number, glyph: Glyph): void {
    this.overlays.set(`${col},${row}`, glyph);
  }

  /** Remove an overlay glyph */
  clearOverlay(col: number, row: number): void {
    this.overlays.delete(`${col},${row}`);
  }

  /** Move the selection cursor */
  setCursor(col: number, row: number): void {
    this.cursorCol = col;
    this.cursorRow = row;
  }

  getCursorCol(): number { return this.cursorCol; }
  getCursorRow(): number { return this.cursorRow; }

  /** Called each frame to update animations and re-render dirty cells */
  update(delta: number): void {
    // Blink cursor
    this.cursorTimer += delta;
    if (this.cursorTimer > 500) {
      this.cursorVisible = !this.cursorVisible;
      this.cursorTimer = 0;
    }

    this.renderFullGrid();
    this.texture.refresh();
  }

  /** Render the entire grid to the offscreen canvas */
  private renderFullGrid(): void {
    const { cols, rows, cellWidth, cellHeight, fontSize, fontFamily } = GRID_CONFIG;
    const ctx = this.ctx;

    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}px ${fontFamily}`;

    for (let row = 0; row < rows; row++) {
      const bgColor = getBackgroundColor(row);

      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;

        // Check for overlay first
        const overlay = this.overlays.get(`${col},${row}`);
        const glyph = overlay ?? getBackgroundGlyph(col, row);

        // Draw background
        ctx.fillStyle = glyph.bg ?? bgColor;
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Draw character
        if (glyph.char !== ' ') {
          ctx.fillStyle = glyph.fg;
          // Center the character in the cell
          const textX = x + (cellWidth - ctx.measureText(glyph.char).width) / 2;
          const textY = y + (cellHeight - fontSize) / 2;
          ctx.fillText(glyph.char, textX, textY);
        }

        // Draw cursor
        if (col === this.cursorCol && row === this.cursorRow && this.cursorVisible) {
          ctx.strokeStyle = '#ffff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
        }
      }
    }
  }

  /** Get the Phaser image object for camera/scrolling purposes */
  getImage(): Phaser.GameObjects.Image {
    return this.image;
  }

  getWorldWidth(): number {
    return GRID_CONFIG.cols * GRID_CONFIG.cellWidth;
  }

  getWorldHeight(): number {
    return GRID_CONFIG.rows * GRID_CONFIG.cellHeight;
  }
}
