import { GRID_CONFIG, OverlayLayer, type PlantState, type Season, type Glyph } from '@/types';
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

/** Lerp a hex color toward dark grey for dying plants */
function withDeathFade(glyph: Glyph, fadeProgress: number): Glyph {
  // fadeProgress: 0 = just died, 1 = about to be removed
  const targetR = 0x2a, targetG = 0x2a, targetB = 0x2a;
  const hex = glyph.fg.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const nr = Math.round(r + (targetR - r) * fadeProgress);
  const ng = Math.round(g + (targetG - g) * fadeProgress);
  const nb = Math.round(b + (targetB - b) * fadeProgress);
  const fg = '#' + ((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, '0');

  // Change character to wilted variant in final stage
  let char = glyph.char;
  if (fadeProgress > 0.6) {
    const wiltMap: Record<string, string> = {
      '@': '.', '{': ',', '}': ',', '(': '.', ')': '.', '#': '%',
      'Y': 'y', 'T': 't', '|': ':', '*': '.', 'o': '.', '^': '.',
    };
    char = wiltMap[char] ?? char;
  }

  return { ...glyph, char, fg };
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
      this.renderer.clearOverlay(col, row, OverlayLayer.Plant);
    }
    this.plantCells.clear();

    // Draw all plants
    for (const plant of plants) {
      const species = SPECIES[plant.speciesId];
      if (!species) continue;

      const visual = species.visuals[plant.stage];

      // Compute death fade progress (0 = just died, 1 = about to vanish)
      const fadeProgress = plant.isDying ? 1 - (plant.deathTimer / 3) : 0;

      // Draw base cells
      for (const [colOff, rowOff, glyph] of visual.cells) {
        const absCol = plant.col + colOff;
        const absRow = plant.row + rowOff;

        if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
        if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

        const key = `${absCol},${absRow}`;
        let finalGlyph = withRootColor(colOff, rowOff, glyph);
        if (plant.isDying) {
          finalGlyph = withDeathFade(finalGlyph, fadeProgress);
        }
        this.renderer.setOverlay(absCol, absRow, finalGlyph, OverlayLayer.Plant);
        this.plantCells.add(key);
      }

      // Draw seasonal decoration cells on top (flowers, fruit, berries)
      // Skip decorations for dying plants
      if (!plant.isDying) {
        const seasonCells = visual.seasonalCells?.[season];
        if (seasonCells) {
          for (const [colOff, rowOff, glyph] of seasonCells) {
            const absCol = plant.col + colOff;
            const absRow = plant.row + rowOff;

            if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
            if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

            const key = `${absCol},${absRow}`;
            this.renderer.setOverlay(absCol, absRow, withRootColor(colOff, rowOff, glyph), OverlayLayer.Plant);
            this.plantCells.add(key);
          }
        }
      }
    }
  }
}
