import { GRID_CONFIG, type PlantState, type Season, type Glyph } from '@/types';
import { SPECIES } from '@/data/species';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';

/** Add a soft white glow background to root cells based on distance from trunk */
function withRootGlow(colOff: number, rowOff: number, glyph: Glyph): Glyph {
  if (rowOff <= 0) return glyph; // only glow underground cells
  const dist = Math.abs(colOff) + rowOff;
  const intensity = Math.max(0, 1 - dist * 0.12);
  if (intensity <= 0) return glyph;
  const base = 0x18;
  const glow = Math.round(base + intensity * 0x28);
  const glowB = Math.min(0xff, glow + 0x0c); // slight cool tint
  const bg = '#' + ((glow << 16) | (glow << 8) | glowB).toString(16).padStart(6, '0');
  return { ...glyph, bg };
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
        this.renderer.setOverlay(absCol, absRow, withRootGlow(colOff, rowOff, glyph));
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
          this.renderer.setOverlay(absCol, absRow, withRootGlow(colOff, rowOff, glyph));
          this.plantCells.add(key);
        }
      }
    }
  }
}
