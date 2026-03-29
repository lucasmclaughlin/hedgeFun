import { GRID_CONFIG, OverlayLayer, type CreatureState } from '@/types';
import { CREATURE_LIST } from '@/data/creatures';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';

/**
 * Renders creature overlays to the ASCII grid.
 * Called each frame to update animated creature positions.
 */
export class CreatureRenderer {
  private renderer: AsciiRenderer;
  private creatureCells: Set<string> = new Set();

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
  }

  renderCreatures(creatures: ReadonlyArray<CreatureState>): void {
    // Clear previous creature overlays
    for (const key of this.creatureCells) {
      const [col, row] = key.split(',').map(Number);
      this.renderer.clearOverlay(col, row, OverlayLayer.Creature);
    }
    this.creatureCells.clear();

    for (const creature of creatures) {
      const def = CREATURE_LIST.find(d => d.id === creature.defId);
      if (!def) continue;

      const frames = def.frames[creature.behavior];
      const frame = frames[creature.frameIndex % frames.length];

      for (const [colOff, rowOff, glyph] of frame.cells) {
        // Flip horizontally based on facing direction
        const fc = creature.facing < 0 ? -colOff : colOff;
        const absCol = creature.col + fc;
        const absRow = creature.row + rowOff;

        if (absCol < 0 || absCol >= GRID_CONFIG.cols) continue;
        if (absRow < 0 || absRow >= GRID_CONFIG.rows) continue;

        const key = `${absCol},${absRow}`;
        this.renderer.setOverlay(absCol, absRow, glyph, OverlayLayer.Creature);
        this.creatureCells.add(key);
      }
    }
  }
}
