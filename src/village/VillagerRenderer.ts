import { OverlayLayer } from '@/types';
import type { VillagerState, Glyph } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { VILLAGERS } from '@/data/villagers';

/**
 * Renders walking villagers on the creature overlay layer.
 * Uses multi-cell frames from creature art definitions.
 * Villagers at home are rendered by the BuildingRenderer interior system.
 */
export class VillagerRenderer {
  private renderer: AsciiRenderer;
  private previousCells = new Set<string>();

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
  }

  render(villagers: ReadonlyArray<VillagerState>): void {
    // Clear previous
    for (const key of this.previousCells) {
      const [col, row] = key.split(',').map(Number);
      this.renderer.clearOverlay(col, row, OverlayLayer.Creature);
    }
    this.previousCells.clear();

    // Only render villagers that are walking (not at home)
    for (const v of villagers) {
      if (v.isHome) continue;

      const def = VILLAGERS[v.defId];
      if (!def) continue;

      // Pick walking frame
      const frame = def.walkFrames[v.frameIndex % def.walkFrames.length];
      if (!frame) continue;

      // Draw each cell of the multi-cell frame
      for (const [colOff, rowOff, glyph] of frame.cells) {
        // Flip horizontally if facing left
        const actualColOff = v.facing < 0 ? -colOff : colOff;
        const col = v.col + actualColOff;
        const row = v.row + rowOff;

        const renderedGlyph: Glyph = v.facing < 0
          ? { char: flipChar(glyph.char), fg: glyph.fg, bg: glyph.bg }
          : { ...glyph };

        this.renderer.setOverlay(col, row, renderedGlyph, OverlayLayer.Creature);
        this.previousCells.add(`${col},${row}`);
      }
    }
  }
}

/** Simple character flip for left-facing creatures */
function flipChar(ch: string): string {
  switch (ch) {
    case '>': return '<';
    case '<': return '>';
    case ')': return '(';
    case '(': return ')';
    case '/': return '\\';
    case '\\': return '/';
    case '}': return '{';
    case '{': return '}';
    case 'd': return 'b';
    case 'b': return 'd';
    default: return ch;
  }
}
