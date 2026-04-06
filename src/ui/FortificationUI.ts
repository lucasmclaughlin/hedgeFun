import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { OverlayLayer, GRID_CONFIG, type Glyph } from '@/types';
import type { PlantFort } from '@/defense/FortificationSystem';
import type { SpeciesBonus } from '@/defense/SpeciesBonuses';

const FORT_LAYER = OverlayLayer.Fortification;

function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < GRID_CONFIG.cols && row >= 0 && row < GRID_CONFIG.rows;
}

export class FortificationUI {
  private prevCells: Array<[number, number]> = [];

  constructor(private ascii: AsciiRenderer) {}

  render(forts: readonly PlantFort[], bonuses: Record<string, SpeciesBonus>): void {
    this.clear();

    for (const fort of forts) {
      const col = fort.plantCol;
      const gr = fort.groundRow;
      const bonus = bonuses[fort.speciesId];

      // Castle walls flanking the plant at ground level
      this.set(col - 1, gr, { char: '[', fg: '#a09070' });
      this.set(col + 1, gr, { char: ']', fg: '#a09070' });

      // Battlements one row above the walls
      this.set(col - 1, gr - 1, { char: '^', fg: '#908060' });
      this.set(col,     gr - 1, { char: '^', fg: '#908060' });
      this.set(col + 1, gr - 1, { char: '^', fg: '#908060' });

      // Tunnel 2 rows below ground
      this.set(col - 1, gr + 2, { char: '=', fg: '#504030' });
      this.set(col,     gr + 2, { char: '=', fg: '#504030' });
      this.set(col + 1, gr + 2, { char: '=', fg: '#504030' });

      // Species bonus icon at the gate (ground row, centre)
      if (bonus) {
        this.set(col, gr, bonus.glyph);
      }
    }
  }

  clear(): void {
    for (const [c, r] of this.prevCells) {
      this.ascii.clearOverlay(c, r, FORT_LAYER);
    }
    this.prevCells = [];
  }

  private set(col: number, row: number, glyph: Glyph): void {
    if (!inBounds(col, row)) return;
    this.ascii.setOverlay(col, row, glyph, FORT_LAYER);
    this.prevCells.push([col, row]);
  }
}
