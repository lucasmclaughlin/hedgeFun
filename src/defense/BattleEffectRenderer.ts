import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { Glyph, GRID_CONFIG, OverlayLayer } from '@/types';

const EFFECT_LAYER = OverlayLayer.Battle;

export interface BattleEffect {
  id: number;
  type: 'arrow' | 'clash' | 'shield' | 'poison';
  col: number;
  row: number;
  targetCol: number;
  progress: number;
  durationMs: number;
  elapsedMs: number;
}

export interface FloatingText {
  text: string;
  col: number;
  row: number;
  color: string;
  elapsedMs: number;
  durationMs: number;
  banner?: boolean;
  bannerBg?: string;
  bannerTrim?: string;
}

function inBounds(c: number, r: number): boolean {
  return c >= 0 && c < GRID_CONFIG.cols && r >= 0 && r < GRID_CONFIG.rows;
}

export class BattleEffectRenderer {
  private effects: BattleEffect[] = [];
  private floats: FloatingText[] = [];
  private prevCells: Array<[number, number]> = [];

  constructor(private ascii: AsciiRenderer) {}

  addEffect(effect: BattleEffect): void {
    this.effects.push({ ...effect });
  }

  addFloatingText(text: string, col: number, row: number, color: string, durationMs = 1200): void {
    this.floats.push({ text, col, row, color, elapsedMs: 0, durationMs });
  }

  addBannerText(text: string, col: number, row: number, color: string, bannerBg: string, bannerTrim: string, durationMs = 1800): void {
    this.floats.push({ text, col, row, color, elapsedMs: 0, durationMs, banner: true, bannerBg, bannerTrim });
  }

  /** Advance all effects; remove expired ones. Call every frame with delta ms. */
  update(delta: number): void {
    for (const fx of this.effects) {
      fx.elapsedMs += delta;
      fx.progress = Math.min(fx.elapsedMs / fx.durationMs, 1);
    }
    this.effects = this.effects.filter(fx => fx.elapsedMs < fx.durationMs);

    for (const ft of this.floats) ft.elapsedMs += delta;
    this.floats = this.floats.filter(ft => ft.elapsedMs < ft.durationMs);
  }

  /** Draw all active effects. Call after update(). */
  render(): void {
    for (const [c, r] of this.prevCells) {
      this.ascii.clearOverlay(c, r, EFFECT_LAYER);
    }
    this.prevCells = [];

    for (const fx of this.effects) {
      switch (fx.type) {
        case 'arrow':   this.renderArrow(fx);   break;
        case 'clash':   this.renderClash(fx);   break;
        case 'shield':  this.renderShield(fx);  break;
        case 'poison':  this.renderPoison(fx);  break;
      }
    }

    for (const ft of this.floats) {
      const drift = Math.floor(ft.elapsedMs / 400); // rise 1 row per 400ms
      const row = ft.row - 2 - drift;

      if (ft.banner) {
        this.renderBanner(ft, row);
      } else {
        for (let i = 0; i < ft.text.length; i++) {
          this.set(ft.col + i, row, { char: ft.text[i], fg: ft.color });
        }
      }
    }
  }

  clear(): void {
    for (const [c, r] of this.prevCells) {
      this.ascii.clearOverlay(c, r, EFFECT_LAYER);
    }
    this.prevCells = [];
    this.effects = [];
    this.floats = [];
  }

  private set(c: number, r: number, glyph: Glyph): void {
    if (!inBounds(c, r)) return;
    this.ascii.setOverlay(c, r, glyph, EFFECT_LAYER);
    this.prevCells.push([c, r]);
  }

  private renderArrow(fx: BattleEffect): void {
    const firingRight = fx.targetCol >= fx.col;
    const pos = fx.col + Math.round(fx.progress * (fx.targetCol - fx.col));

    if (firingRight) {
      this.set(pos,     fx.row, { char: '-', fg: '#d0c060' });
      this.set(pos + 1, fx.row, { char: '>', fg: '#ffd060' });
    } else {
      this.set(pos,     fx.row, { char: '-', fg: '#d0c060' });
      this.set(pos - 1, fx.row, { char: '<', fg: '#ffd060' });
    }
  }

  private renderClash(fx: BattleEffect): void {
    this.set(fx.col, fx.row, { char: '*', fg: '#ffcc00' });
  }

  private renderShield(fx: BattleEffect): void {
    this.set(fx.col,     fx.row, { char: 'o', fg: '#c0c0c0' });
    this.set(fx.col + 1, fx.row, { char: ']', fg: '#c0c0c0' });
  }

  /**
   * Render a medieval furled banner around the text:
   *   ╔═══════════╗
   *   ║  text     ║
   *   ╚╤═══════╤══╝
   * With coloured fabric background and decorative trim.
   */
  private renderBanner(ft: FloatingText, baseRow: number): void {
    const bg = ft.bannerBg ?? '#8b1a1a';
    const trim = ft.bannerTrim ?? '#d4a017';
    const textColor = ft.color;
    const text = ft.text;
    const w = text.length + 2; // 1 padding each side inside the border
    const startCol = ft.col - Math.floor(w / 2);

    // Top border row
    const topRow = baseRow - 1;
    this.set(startCol, topRow, { char: '╔', fg: trim, bg });
    for (let i = 1; i <= w; i++) {
      this.set(startCol + i, topRow, { char: '═', fg: trim, bg });
    }
    this.set(startCol + w + 1, topRow, { char: '╗', fg: trim, bg });

    // Text row with fabric background
    this.set(startCol, baseRow, { char: '║', fg: trim, bg });
    this.set(startCol + 1, baseRow, { char: ' ', fg: textColor, bg });
    for (let i = 0; i < text.length; i++) {
      this.set(startCol + 2 + i, baseRow, { char: text[i], fg: textColor, bg });
    }
    this.set(startCol + w, baseRow, { char: ' ', fg: textColor, bg });
    this.set(startCol + w + 1, baseRow, { char: '║', fg: trim, bg });

    // Bottom border row with swallowtail cut
    const botRow = baseRow + 1;
    this.set(startCol, botRow, { char: '╚', fg: trim, bg });
    const tailL = Math.floor(w / 3);
    const tailR = w - Math.floor(w / 3);
    for (let i = 1; i <= w; i++) {
      if (i === tailL || i === tailR) {
        this.set(startCol + i, botRow, { char: '╧', fg: trim, bg });
      } else {
        this.set(startCol + i, botRow, { char: '═', fg: trim, bg });
      }
    }
    this.set(startCol + w + 1, botRow, { char: '╝', fg: trim, bg });
  }

  private renderPoison(fx: BattleEffect): void {
    const green     = Math.round(0xc0 + (0x60 - 0xc0) * fx.progress);
    const greenDark = Math.round(0x40 + (0x20 - 0x40) * fx.progress);
    const fg = '#00' + green.toString(16).padStart(2, '0') + greenDark.toString(16).padStart(2, '0');
    const glyph: Glyph = { char: '~', fg };
    const { col, row } = fx;
    this.set(col - 2, row,     glyph);
    this.set(col - 1, row,     glyph);
    this.set(col,     row,     glyph);
    this.set(col + 1, row,     glyph);
    this.set(col + 2, row,     glyph);
    this.set(col,     row - 1, glyph);
    this.set(col,     row + 1, glyph);
  }
}
