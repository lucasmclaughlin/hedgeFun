import { GRID_CONFIG, OverlayLayer, type Glyph } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import type { PlantFort } from '@/defense/FortificationSystem';
import type { SpeciesBonus } from '@/defense/SpeciesBonuses';

const COLS = GRID_CONFIG.cols;
const ROWS = GRID_CONFIG.rows;

export class FortificationUI {
  private renderer: AsciiRenderer;
  /** Track cells we've written so clear() can remove only ours */
  private activeCells: Array<[number, number]> = [];

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
  }

  render(forts: readonly PlantFort[], bonuses: Record<string, SpeciesBonus>): void {
    this.clear();

    for (const fort of forts) {
      const gr = fort.groundRow;
      const col = fort.plantCol;
      const bonus = bonuses[fort.speciesId];

      // Castle walls flanking the plant at ground level
      this.setCell(col - 1, gr, { char: '[', fg: '#a09070' });
      this.setCell(col + 1, gr, { char: ']', fg: '#a09070' });

      // Battlements one row above
      this.setCell(col - 1, gr - 1, { char: '^', fg: '#908060' });
      this.setCell(col, gr - 1, { char: '^', fg: '#908060' });
      this.setCell(col + 1, gr - 1, { char: '^', fg: '#908060' });

      // Tunnel 2 rows below ground
      this.setCell(col - 1, gr + 2, { char: '=', fg: '#504030' });
      this.setCell(col, gr + 2, { char: '=', fg: '#504030' });
      this.setCell(col + 1, gr + 2, { char: '=', fg: '#504030' });

      // Species bonus icon at the gate (ground row, center)
      if (bonus) {
        this.setCell(col, gr, bonus.glyph);
      }
    }
  }

  private setCell(col: number, row: number, glyph: Glyph): void {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
    this.renderer.setOverlay(col, row, glyph, OverlayLayer.Battle);
    this.activeCells.push([col, row]);
  }

  private clear(): void {
    for (const [col, row] of this.activeCells) {
      this.renderer.clearOverlay(col, row, OverlayLayer.Battle);
    }
    this.activeCells = [];
  }
}
