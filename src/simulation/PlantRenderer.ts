import { GRID_CONFIG, GrowthStage, OverlayLayer, type PlantState, type Season, type Glyph } from '@/types';
import { SPECIES } from '@/data/species';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { renderCompanionIndicators } from './companionPlanting';

/**
 * Visual cells for a freshly-laid hedge (Seedling stage after laying).
 * Represents bent, woven stems at ground level with emerging base shoots.
 */
const LAID_SEEDLING_CELLS: Array<[number, number, Glyph]> = [
  [-2, 0, { char: '=', fg: '#7a5a1a' }],
  [-1, 0, { char: '=', fg: '#8a6a2a' }],
  [ 0, 0, { char: '#', fg: '#9a7a3a' }],
  [ 1, 0, { char: '=', fg: '#8a6a2a' }],
  [ 2, 0, { char: '=', fg: '#7a5a1a' }],
  [-1,-1, { char: '/', fg: '#6a4a1a' }],
  [ 1,-1, { char: '\\', fg: '#6a4a1a' }],
  [ 0, 1, { char: '|', fg: '#5a3a1a' }],
  [ 0, 2, { char: '.', fg: '#4a2a0a' }],
];

/**
 * Visual cells for a regrowing laid hedge (Juvenile stage after laying).
 * Dense multi-stem regrowth with the laid base still visible.
 */
const LAID_JUVENILE_CELLS: Array<[number, number, Glyph]> = [
  [-1,-2, { char: 'i', fg: '#5a9a2a' }],
  [ 0,-2, { char: 'I', fg: '#6aaa3a' }],
  [ 1,-2, { char: 'i', fg: '#5a9a2a' }],
  [-1,-1, { char: '|', fg: '#6aaa3a' }],
  [ 0,-1, { char: '|', fg: '#7aba4a' }],
  [ 1,-1, { char: '|', fg: '#6aaa3a' }],
  [-2, 0, { char: '=', fg: '#7a5a1a' }],
  [-1, 0, { char: '#', fg: '#8a6a2a' }],
  [ 0, 0, { char: 'H', fg: '#7a6a3a' }],
  [ 1, 0, { char: '#', fg: '#8a6a2a' }],
  [ 2, 0, { char: '=', fg: '#7a5a1a' }],
  [ 0, 1, { char: '|', fg: '#5a3a1a' }],
  [ 0, 2, { char: '.', fg: '#4a2a0a' }],
];

/**
 * Visual cells for a fully-grown laid hedge (Mature stage after laying).
 * Wide horizontal pleacher base at ground level, multiple upright stems,
 * and a broad dense canopy — clearly distinct from an upright plant.
 */
const LAID_MATURE_CELLS: Array<[number, number, Glyph]> = [
  // Dense crown — broad leafy top
  [-2, -4, { char: '{', fg: '#4aba4a' }],
  [-1, -4, { char: '@', fg: '#5aca3a' }],
  [ 0, -4, { char: '#', fg: '#6ada4a' }],
  [ 1, -4, { char: '@', fg: '#5aca3a' }],
  [ 2, -4, { char: '}', fg: '#4aba4a' }],
  // Spreading mid canopy — wider than any upright plant
  [-3, -3, { char: '{', fg: '#5aba3a' }],
  [-2, -3, { char: 'f', fg: '#6aaa4a' }],
  [-1, -3, { char: '@', fg: '#7aba4a' }],
  [ 0, -3, { char: 'Y', fg: '#8aca5a' }],
  [ 1, -3, { char: '@', fg: '#7aba4a' }],
  [ 2, -3, { char: 'f', fg: '#6aaa4a' }],
  [ 3, -3, { char: '}', fg: '#5aba3a' }],
  // Lower canopy — lateral branching off each stem
  [-2, -2, { char: '{', fg: '#6aaa3a' }],
  [-1, -2, { char: '|', fg: '#5a9a3a' }],
  [ 0, -2, { char: '#', fg: '#7aba4a' }],
  [ 1, -2, { char: '|', fg: '#5a9a3a' }],
  [ 2, -2, { char: '}', fg: '#6aaa3a' }],
  // Multiple upright stems — vigorous regrowth from the laid base
  [-2, -1, { char: '|', fg: '#6a7a2a' }],
  [-1, -1, { char: 'Y', fg: '#7a8a3a' }],
  [ 0, -1, { char: '|', fg: '#8a9a3a' }],
  [ 1, -1, { char: 'Y', fg: '#7a8a3a' }],
  [ 2, -1, { char: '|', fg: '#6a7a2a' }],
  // Horizontal pleacher base — woven stems with stakes (H = hazel stake)
  [-3,  0, { char: '=', fg: '#7a5a1a' }],
  [-2,  0, { char: '=', fg: '#8a6a2a' }],
  [-1,  0, { char: '-', fg: '#7a6a2a' }],
  [ 0,  0, { char: 'H', fg: '#6a5a2a' }],
  [ 1,  0, { char: '-', fg: '#7a6a2a' }],
  [ 2,  0, { char: '=', fg: '#8a6a2a' }],
  [ 3,  0, { char: '=', fg: '#7a5a1a' }],
  // Root spread — established, wide root system
  [-1,  1, { char: '|', fg: '#6a4a1a' }],
  [ 0,  1, { char: '|', fg: '#5a3a1a' }],
  [ 1,  1, { char: '|', fg: '#6a4a1a' }],
  [ 0,  2, { char: '.', fg: '#4a2a0a' }],
];

/**
 * Visual cells for a freshly coppiced plant (Seedling stage).
 * Shows the stool stump with first regrowth shoots.
 */
const COPPICE_SEEDLING_CELLS: Array<[number, number, Glyph]> = [
  [-1,  0, { char: '=', fg: '#7a5a1a' }],
  [ 0,  0, { char: 'W', fg: '#8a6a2a' }],  // 'W' = cut stool
  [ 1,  0, { char: '=', fg: '#7a5a1a' }],
  [-1, -1, { char: 'i', fg: '#5a9a2a' }],
  [ 0, -1, { char: 'i', fg: '#6aaa3a' }],
  [ 1, -1, { char: 'i', fg: '#5a9a2a' }],
  [ 0,  1, { char: '|', fg: '#5a3a1a' }],
  [ 0,  2, { char: '.', fg: '#4a2a0a' }],
];

/**
 * Visual cells for a regrowing coppice stool (Juvenile stage).
 * Dense multi-stem regrowth from the visible stool base.
 */
const COPPICE_JUVENILE_CELLS: Array<[number, number, Glyph]> = [
  [-2, -2, { char: 'i', fg: '#5a9a2a' }],
  [-1, -2, { char: 'i', fg: '#6aaa3a' }],
  [ 0, -2, { char: 'I', fg: '#7aba4a' }],
  [ 1, -2, { char: 'i', fg: '#6aaa3a' }],
  [ 2, -2, { char: 'i', fg: '#5a9a2a' }],
  [-1, -1, { char: '|', fg: '#5a8a2a' }],
  [ 0, -1, { char: '|', fg: '#6a9a3a' }],
  [ 1, -1, { char: '|', fg: '#5a8a2a' }],
  [-1,  0, { char: '=', fg: '#7a5a1a' }],
  [ 0,  0, { char: 'W', fg: '#7a6a3a' }],
  [ 1,  0, { char: '=', fg: '#7a5a1a' }],
  [ 0,  1, { char: '|', fg: '#5a3a1a' }],
  [ 0,  2, { char: '.', fg: '#4a2a0a' }],
];

/**
 * Visual cells for a pollarded plant (Juvenile stage after pollarding).
 * Preserved trunk with a visible cut head and new regrowth shooting from it.
 */
const POLLARD_JUVENILE_CELLS: Array<[number, number, Glyph]> = [
  // New regrowth above the pollard head
  [-1, -5, { char: '(', fg: '#5a9a2a' }],
  [ 0, -5, { char: '^', fg: '#7aba4a' }],
  [ 1, -5, { char: ')', fg: '#5a9a2a' }],
  [-1, -4, { char: '/', fg: '#5a9a2a' }],
  [ 0, -4, { char: 'Y', fg: '#6aaa3a' }],
  [ 1, -4, { char: '\\', fg: '#5a9a2a' }],
  // Pollard head — the visible cut node
  [-1, -3, { char: '-', fg: '#8a6a3a' }],
  [ 0, -3, { char: 'O', fg: '#9a7a4a' }],
  [ 1, -3, { char: '-', fg: '#8a6a3a' }],
  // Preserved trunk below the head
  [ 0, -2, { char: '|', fg: '#6a4a1a' }],
  [ 0, -1, { char: '|', fg: '#6a4a1a' }],
  [ 0,  0, { char: '|', fg: '#6a4a1a' }],
  // Roots
  [ 0,  1, { char: '|', fg: '#5a3a1a' }],
  [ 0,  2, { char: '.', fg: '#4a2a0a' }],
];

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

      const isLaid = plant.isLaid ?? false;
      const isCoppiced = plant.isCoppiced ?? false;
      const isPollarded = plant.isPollarded ?? false;

      // Select the appropriate visual cell array
      let cellsToDraw: Array<[number, number, Glyph]>;
      const visual = species.visuals[plant.stage];

      if (isLaid) {
        cellsToDraw =
          plant.stage === GrowthStage.Seedling ? LAID_SEEDLING_CELLS :
          plant.stage === GrowthStage.Juvenile  ? LAID_JUVENILE_CELLS :
                                                  LAID_MATURE_CELLS;
      } else if (isCoppiced && plant.stage !== GrowthStage.Mature) {
        // Coppice stool visuals until the plant regrows to Mature
        cellsToDraw =
          plant.stage === GrowthStage.Seedling ? COPPICE_SEEDLING_CELLS :
                                                 COPPICE_JUVENILE_CELLS;
      } else if (isPollarded && plant.stage !== GrowthStage.Mature) {
        // Pollard trunk + head visual during regrowth
        cellsToDraw = POLLARD_JUVENILE_CELLS;
      } else {
        cellsToDraw = visual.cells;
      }

      const useCustomVisual = (isLaid && plant.stage !== GrowthStage.Mature)
        || (isCoppiced && plant.stage !== GrowthStage.Mature)
        || (isPollarded && plant.stage !== GrowthStage.Mature);

      // Compute death fade progress (0 = just died, 1 = about to vanish)
      const fadeProgress = plant.isDying ? 1 - (plant.deathTimer / 3) : 0;
      for (const [colOff, rowOff, glyph] of cellsToDraw) {
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
      // Skip for dying plants and for any custom-visual stage (no flowering while regrowing)
      if (!plant.isDying && !useCustomVisual) {
        const seasonCells = visual.seasonalCells?.[season];
        if (seasonCells) {
          // Laid mature plants use LAID_MATURE_CELLS (crown top at -4) instead of the taller
          // upright visual, so shift seasonal cells down so their topmost cell aligns with
          // the laid crown top.
          const LAID_MATURE_TOP = -4;
          const laidRowAdjust = (isLaid && plant.stage === GrowthStage.Mature)
            ? LAID_MATURE_TOP - Math.min(...seasonCells.map(([, r]) => r))
            : 0;

          for (const [colOff, rowOff, glyph] of seasonCells) {
            const absCol = plant.col + colOff;
            const absRow = plant.row + rowOff + laidRowAdjust;

            if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
            if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

            const key = `${absCol},${absRow}`;
            this.renderer.setOverlay(absCol, absRow, withRootColor(colOff, rowOff, glyph), OverlayLayer.Plant);
            this.plantCells.add(key);
          }
        }
      }
    }

    // Companion planting indicators — rendered between companion pairs
    const groundRow = plants.find(p => !p.isDying)?.row ?? 20;
    renderCompanionIndicators(plants, groundRow, this.renderer);
  }
}
