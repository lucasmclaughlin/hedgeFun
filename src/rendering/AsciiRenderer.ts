import Phaser from 'phaser';
import { Glyph, GRID_CONFIG, OverlayLayer, Season, Weather } from '@/types';
import { getBackgroundGlyph, getBackgroundColor } from './GlyphAtlas';

/** Season color tints [R, G, B] offsets */
const SEASON_TINTS: Record<Season, [number, number, number]> = {
  [Season.Spring]: [2, 8, -2],
  [Season.Summer]: [10, 5, -6],
  [Season.Autumn]: [14, -4, -12],
  [Season.Winter]: [-10, -4, 14],
};

/** Subtle glow blur per season — stronger in spring/summer, faint in winter */
const SEASON_GLOW: Record<Season, number> = {
  [Season.Spring]: 1.5,
  [Season.Summer]: 2.0,
  [Season.Autumn]: 1.0,
  [Season.Winter]: 0.5,
};

/** Sky background colour at each of the 8 canonical hours (midnight→night) */
const CANONICAL_SKY_BG = [
  '#05050a', // 0 Matins   — midnight
  '#09070f', // 1 Lauds    — pre-dawn
  '#200c06', // 2 Prime    — sunrise
  '#0c1628', // 3 Terce    — morning
  '#111c30', // 4 Sext     — midday
  '#0f1828', // 5 None     — afternoon
  '#1e0e08', // 6 Vespers  — sunset
  '#07070e', // 7 Compline — night
] as const;

/** Global overlay tint deltas [R, G, B] at each canonical hour */
const CANONICAL_DAY_TINTS: [number, number, number][] = [
  [-16, -16, -10],  // 0 Matins   — very dim blue-black
  [-14, -14,  -8],  // 1 Lauds    — dim
  [  4,  -4, -12],  // 2 Prime    — dawn orange
  [  2,   2,   4],  // 3 Terce    — morning light
  [  4,   6,   8],  // 4 Sext     — bright midday
  [  2,   2,   4],  // 5 None     — afternoon
  [  8,  -4, -12],  // 6 Vespers  — sunset warm
  [-12, -12,  -8],  // 7 Compline — dusk
];

/** Sky layer row boundary */
const SKY_END_ROW = 7;

function lerpHex(a: string, b: string, t: number): string {
  const ar = parseInt(a.substring(1, 3), 16);
  const ag = parseInt(a.substring(3, 5), 16);
  const ab = parseInt(a.substring(5, 7), 16);
  const br = parseInt(b.substring(1, 3), 16);
  const bg = parseInt(b.substring(3, 5), 16);
  const bb = parseInt(b.substring(5, 7), 16);
  const r  = Math.round(ar + (br - ar) * t);
  const g  = Math.round(ag + (bg - ag) * t);
  const bv = Math.round(ab + (bb - ab) * t);
  return '#' + ((r << 16) | (g << 8) | bv).toString(16).padStart(6, '0');
}

/** Weather color tints [R, G, B] offsets */
const WEATHER_TINTS: Record<Weather, [number, number, number]> = {
  [Weather.Clear]: [3, 3, 4],
  [Weather.Overcast]: [-6, -6, -4],
  [Weather.Rain]: [-2, 4, 10],
  [Weather.Storm]: [-10, -10, -6],
  [Weather.Wind]: [-2, -2, 0],
  [Weather.Frost]: [-6, 4, 16],
};

/**
 * Grid-based ASCII renderer using Phaser's Canvas.
 * Each cell is one character with foreground and optional background color.
 * Renders to an offscreen canvas texture that Phaser displays as an image.
 */
export class AsciiRenderer {
  private scene: Phaser.Scene;
  private ctx: CanvasRenderingContext2D;
  private image: Phaser.GameObjects.Image;
  private texture: Phaser.Textures.CanvasTexture;

  /** Layered overlay grid: "col,row" -> map of layer -> Glyph (highest layer draws on top) */
  private overlays: Map<string, Map<number, Glyph>> = new Map();

  /** Cursor position */
  private cursorCol = 0;
  private cursorRow = 30; // start on ground layer
  private cursorVisible = true;
  private cursorTimer = 0;
  private cursorHidden = false;

  /** Environment state for color modulation */
  private tintR = 0;
  private tintG = 0;
  private tintB = 0;
  private glowBlur = 1.5;
  private animTime = 0;

  /** Day/night state */
  private dayTintR = 4;
  private dayTintG = 6;
  private dayTintB = 8;
  private skyBgColor = '#111c30'; // default: midday

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const { cols, rows, cellWidth, cellHeight } = GRID_CONFIG;
    const pixelWidth = cols * cellWidth;
    const pixelHeight = rows * cellHeight;

    // Create Phaser canvas texture — remove any stale copy first (scene restart)
    if (scene.textures.exists('ascii-grid')) {
      scene.textures.remove('ascii-grid');
    }
    this.texture = scene.textures.createCanvas('ascii-grid', pixelWidth, pixelHeight)!;
    this.ctx = this.texture.getContext();
    this.image = scene.add.image(0, 0, 'ascii-grid');
    this.image.setOrigin(0, 0);

    // Initial render
    this.renderFullGrid();
    this.texture.refresh();
  }

  /** Update day/night phase (0–1, where 0/1 = midnight, 0.5 = noon) */
  setDayPhase(phase: number): void {
    const hourF = phase * 8;
    const hourA = Math.floor(hourF) % 8;
    const hourB = (hourA + 1) % 8;
    const t = hourF - Math.floor(hourF);
    const tA = CANONICAL_DAY_TINTS[hourA];
    const tB = CANONICAL_DAY_TINTS[hourB];
    this.dayTintR = tA[0] + (tB[0] - tA[0]) * t;
    this.dayTintG = tA[1] + (tB[1] - tA[1]) * t;
    this.dayTintB = tA[2] + (tB[2] - tA[2]) * t;
    this.skyBgColor = lerpHex(CANONICAL_SKY_BG[hourA], CANONICAL_SKY_BG[hourB], t);
  }

  /** Update environment tints from current season and weather */
  setEnvironment(season: Season, weather: Weather): void {
    const st = SEASON_TINTS[season];
    const wt = WEATHER_TINTS[weather];
    this.tintR = st[0] + wt[0];
    this.tintG = st[1] + wt[1];
    this.tintB = st[2] + wt[2];
    this.glowBlur = SEASON_GLOW[season];
  }

  /** Set an overlay glyph at a position on a specific layer */
  setOverlay(col: number, row: number, glyph: Glyph, layer: OverlayLayer = OverlayLayer.Terrain): void {
    const key = `${col},${row}`;
    let layers = this.overlays.get(key);
    if (!layers) {
      layers = new Map();
      this.overlays.set(key, layers);
    }
    layers.set(layer, glyph);
  }

  /** Remove an overlay glyph from a specific layer */
  clearOverlay(col: number, row: number, layer: OverlayLayer = OverlayLayer.Terrain): void {
    const key = `${col},${row}`;
    const layers = this.overlays.get(key);
    if (!layers) return;
    layers.delete(layer);
    if (layers.size === 0) {
      this.overlays.delete(key);
    }
  }

  /** Move the selection cursor */
  setCursor(col: number, row: number): void {
    this.cursorCol = col;
    this.cursorRow = row;
  }

  getCursorCol(): number { return this.cursorCol; }
  getCursorRow(): number { return this.cursorRow; }

  /** Hide/show the cursor glyph (used by screenshot mode) */
  setHideCursor(hidden: boolean): void {
    this.cursorHidden = hidden;
  }

  /** Called each frame to update animations and re-render dirty cells */
  update(delta: number): void {
    // Blink cursor
    this.cursorTimer += delta;
    if (this.cursorTimer > 500) {
      this.cursorVisible = !this.cursorVisible;
      this.cursorTimer = 0;
    }

    // Advance animation time
    this.animTime += delta;

    this.renderFullGrid();
    this.texture.refresh();
  }

  /** Apply environment tint + animated pulse to a hex color */
  private modulateColor(hex: string): string {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    // Gentle organic breathing — two overlapping sine waves
    const pulse = Math.sin(this.animTime * 0.0025) * 4
                + Math.sin(this.animTime * 0.0014) * 3;

    const nr = Math.max(0, Math.min(255, Math.round(r + this.tintR + this.dayTintR + pulse)));
    const ng = Math.max(0, Math.min(255, Math.round(g + this.tintG + this.dayTintG + pulse * 0.6)));
    const nb = Math.max(0, Math.min(255, Math.round(b + this.tintB + this.dayTintB)));

    return '#' + ((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, '0');
  }

  /** Render the entire grid to the offscreen canvas */
  private renderFullGrid(): void {
    const { cols, rows, cellWidth, cellHeight, fontSize, fontFamily } = GRID_CONFIG;
    const ctx = this.ctx;

    ctx.textBaseline = 'top';
    ctx.font = `${fontSize}px ${fontFamily}`;

    for (let row = 0; row < rows; row++) {
      const isSkyRow = row <= SKY_END_ROW;
      const bgColor = isSkyRow ? this.skyBgColor : getBackgroundColor(row);

      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;

        // Check for overlay — pick highest layer
        const layers = this.overlays.get(`${col},${row}`);
        let overlay: Glyph | undefined;
        if (layers) {
          let maxLayer = -1;
          for (const [l, g] of layers) {
            if (l > maxLayer) { maxLayer = l; overlay = g; }
          }
        }
        const glyph = overlay ?? getBackgroundGlyph(col, row);

        // Draw background — apply subtle tint to overlay backgrounds
        const baseBg = glyph.bg ?? bgColor;
        ctx.fillStyle = overlay ? this.modulateColor(baseBg) : baseBg;
        ctx.fillRect(x, y, cellWidth, cellHeight);

        // Draw character — modulate overlay fg colors for animated seasonal effect
        if (glyph.char !== ' ') {
          const fgColor = overlay ? this.modulateColor(glyph.fg) : glyph.fg;
          ctx.fillStyle = fgColor;

          // Subtle seasonal glow on plant/root overlay characters
          if (overlay) {
            ctx.shadowColor = fgColor;
            ctx.shadowBlur = this.glowBlur;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }

          // Center the character in the cell
          const textX = x + (cellWidth - ctx.measureText(glyph.char).width) / 2;
          const textY = y + (cellHeight - fontSize) / 2;
          ctx.fillText(glyph.char, textX, textY);

          // Reset shadow after overlay glyph
          if (overlay) {
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
          }
        }

        // Draw cursor
        if (!this.cursorHidden && col === this.cursorCol && row === this.cursorRow && this.cursorVisible) {
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
