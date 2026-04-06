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

function inBounds(c: number, r: number): boolean {
  return c >= 0 && c < GRID_CONFIG.cols && r >= 0 && r < GRID_CONFIG.rows;
}

export class BattleEffectRenderer {
  private effects: BattleEffect[] = [];
  private prevCells: Array<[number, number]> = [];

  constructor(private ascii: AsciiRenderer) {}

  addEffect(effect: BattleEffect): void {
    this.effects.push({ ...effect });
  }

  /** Advance all effects; remove expired ones. Call every frame with delta ms. */
  update(delta: number): void {
    for (const fx of this.effects) {
      fx.elapsedMs += delta;
      fx.progress = Math.min(fx.elapsedMs / fx.durationMs, 1);
    }
    this.effects = this.effects.filter(fx => fx.elapsedMs < fx.durationMs);
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
  }

  clear(): void {
    for (const [c, r] of this.prevCells) {
      this.ascii.clearOverlay(c, r, EFFECT_LAYER);
    }
    this.prevCells = [];
    this.effects = [];
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
