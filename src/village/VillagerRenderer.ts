import { OverlayLayer } from '@/types';
import type { VillagerState, Glyph } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { VILLAGERS } from '@/data/villagers';

/**
 * Renders walking villagers on the creature overlay layer.
 * Villagers at home are shown via the interior furniture system instead.
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

      // Pick walking glyph frame
      const walkGlyphs = def.walkingGlyphs;
      const frame = walkGlyphs[v.frameIndex % walkGlyphs.length];
      if (!frame) continue;

      // Flip character if facing left
      const glyph: Glyph = v.facing < 0
        ? { char: flipChar(frame.char), fg: frame.fg }
        : { ...frame };

      this.renderer.setOverlay(v.col, v.row, glyph, OverlayLayer.Creature);
      this.previousCells.add(`${v.col},${v.row}`);
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
