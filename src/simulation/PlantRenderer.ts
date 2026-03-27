import { GRID_CONFIG, type PlantState } from '@/types';
import { SPECIES } from '@/data/species';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';

export class PlantRenderer {
  private renderer: AsciiRenderer;
  private plantCells: Set<string> = new Set();

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
  }

  renderPlants(plants: ReadonlyArray<PlantState>): void {
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
      for (const [colOff, rowOff, glyph] of visual.cells) {
        const absCol = plant.col + colOff;
        const absRow = plant.row + rowOff;

        if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
        if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

        const key = `${absCol},${absRow}`;
        this.renderer.setOverlay(absCol, absRow, glyph);
        this.plantCells.add(key);
      }
    }
  }
}
