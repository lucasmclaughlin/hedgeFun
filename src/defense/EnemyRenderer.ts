import { GRID_CONFIG, OverlayLayer, type CreatureFrame, type Glyph } from '@/types';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';

const ENEMY_LAYER = 22 as OverlayLayer;

/** Runtime state of a single enemy instance */
export interface EnemyState {
  id: number;
  defId: string;
  col: number;
  row: number;
  hp: number;
  facing: 1 | -1;
  currentSpeed: number;
  phase: 'advancing' | 'attacking' | 'fleeing';
  frameIndex: number;
  animTimer: number;
  moveTimer: number;
  engagedDefenderId: number | null;
}

/** Static definition for an enemy type */
export interface EnemyDef {
  id: string;
  name: string;
  rowRange: [number, number];
  maxHp: number;
  frames: {
    advancing: CreatureFrame[];
    attacking: CreatureFrame[];
    fleeing: CreatureFrame[];
  };
}

/** Mirror a single glyph char for left-facing enemies */
function mirrorChar(char: string): string {
  switch (char) {
    case '>': return '<';
    case '<': return '>';
    default: return char;
  }
}

/** Returns a per-enemy fg override, or null to use the glyph's own colour */
function fgOverride(enemy: EnemyState): string | null {
  if (enemy.hp === 1 && enemy.phase === 'advancing') return '#ff6060';
  if (enemy.phase === 'fleeing') return '#707070';
  return null;
}

/**
 * Renders enemy overlays to the ASCII grid at layer 22,
 * just above normal creatures (layer 20).
 */
export class EnemyRenderer {
  private prevCells: Array<[number, number]> = [];

  constructor(private ascii: AsciiRenderer) {}

  render(enemies: readonly EnemyState[], defs: Record<string, EnemyDef>): void {
    this.clear();

    const next: Array<[number, number]> = [];

    for (const enemy of enemies) {
      const def = defs[enemy.defId];
      if (!def) continue;

      const frames = def.frames[enemy.phase];
      const frame = frames[enemy.frameIndex % frames.length];
      const mirrored = enemy.facing === -1;
      const override = fgOverride(enemy);

      for (const [colOff, rowOff, glyph] of frame.cells) {
        const fc = mirrored ? -colOff : colOff;
        const col = enemy.col + fc;
        const row = enemy.row + rowOff;

        if (col < 0 || col >= GRID_CONFIG.cols) continue;
        if (row < 0 || row >= GRID_CONFIG.rows) continue;

        const char = mirrored ? mirrorChar(glyph.char) : glyph.char;
        const fg = override ?? glyph.fg;
        const drawn: Glyph = glyph.bg !== undefined ? { char, fg, bg: glyph.bg } : { char, fg };

        this.ascii.setOverlay(col, row, drawn, ENEMY_LAYER);
        next.push([col, row]);
      }
    }

    this.prevCells = next;
  }

  clear(): void {
    for (const [c, r] of this.prevCells) {
      this.ascii.clearOverlay(c, r, ENEMY_LAYER);
    }
    this.prevCells = [];
  }
}
