import { GRID_CONFIG, type PlantState, type Season, type Glyph } from '@/types';
import { SPECIES } from '@/data/species';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';

/** Recolor root cells to white/bone/ecru shades for contrast underground */
function withRootColor(colOff: number, rowOff: number, glyph: Glyph): Glyph {
  if (rowOff <= 0) return glyph; // only recolor underground cells
  const dist = Math.abs(colOff) + rowOff;
  // Fade from warm white near trunk to muted ecru at depth
  const t = Math.min(1, dist * 0.12);
  const r = Math.round(0xe0 - t * 0x30);
  const g = Math.round(0xd6 - t * 0x34);
  const b = Math.round(0xc4 - t * 0x34);
  const fg = '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  return { ...glyph, fg };
}

export class PlantRenderer {
  private renderer: AsciiRenderer;
  private plantCells: Set<string> = new Set();

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
  }

  renderPlants(plants: ReadonlyArray<PlantState>, season: Season): void {
    // Clear previous plant overlays
    for (const key of this.plantCells) {
      const [col, row] = key.split(',').map(Number);
      this.renderer.clearOverlay(col, row);
    }
    this.plantCells.clear();

    // Draw all plants
    for (const plant of plants) {
      const species = SPECIES[plant.speciesId];
      if (!species) continue;

      const visual = species.visuals[plant.stage];

      // Draw base cells
      for (const [colOff, rowOff, glyph] of visual.cells) {
        const absCol = plant.col + colOff;
        const absRow = plant.row + rowOff;

        if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
        if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

        const key = `${absCol},${absRow}`;
        this.renderer.setOverlay(absCol, absRow, withRootColor(colOff, rowOff, glyph));
        this.plantCells.add(key);
      }

      // Draw seasonal decoration cells on top (flowers, fruit, berries)
      const seasonCells = visual.seasonalCells?.[season];
      if (seasonCells) {
        for (const [colOff, rowOff, glyph] of seasonCells) {
          const absCol = plant.col + colOff;
          const absRow = plant.row + rowOff;

          if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
          if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

          const key = `${absCol},${absRow}`;
          this.renderer.setOverlay(absCol, absRow, withRootColor(colOff, rowOff, glyph));
          this.plantCells.add(key);
        }
      }
    }
  }
}
