import { BuildPhase, BuildModeState, OverlayLayer, Season, GRID_CONFIG } from '@/types';
import type { HouseState, BuildModeContext, Glyph, VillagerState, VillagerFrame } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { VILLAGERS } from '@/data/villagers';

/** Build mode cursor */
const BUILD_CURSOR: Glyph = { char: '+', fg: '#eedd44' };

/** Dark overlay for cells outside the build area */
const BUILD_VIGNETTE: Glyph = { char: ' ', fg: '#060604', bg: '#060604' };

/** Star characters that animate around the scaffold ? */
const SPARKLE_CHARS = ['*', '+', '.', '·', '*'];
const SPARKLE_COLORS = ['#ddaa44', '#eebb66', '#ccaa33', '#ffcc55', '#aa8833'];

/**
 * Renders buildings onto the ASCII overlay grid.
 * Handles scaffolding, completed exteriors, interior views, and build mode UI.
 */
export class BuildingRenderer {
  private renderer: AsciiRenderer;
  private previousCells = new Set<string>();

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
  }

  /** Animation timer for interior villager animation */
  private animTimer = 0;
  private animFrame = 0;
  /** Accumulated time for sparkle animation (never resets) */
  private totalTime = 0;

  render(
    houses: ReadonlyArray<HouseState>,
    buildCtx: BuildModeContext,
    season?: Season,
    hourIndex?: number,
    villagers?: ReadonlyArray<VillagerState>,
    delta?: number,
  ): void {
    // Clear previous building cells
    for (const key of this.previousCells) {
      const [col, row] = key.split(',').map(Number);
      this.renderer.clearOverlay(col, row, OverlayLayer.Building);
      this.renderer.clearOverlay(col, row, OverlayLayer.BuildUI);
    }
    this.previousCells.clear();

    // Advance animation timers
    if (delta) {
      this.totalTime += delta;
      this.animTimer += delta;
      if (this.animTimer > 600) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 2;
      }
    }

    for (const house of houses) {
      if (buildCtx.state === BuildModeState.ViewingInterior && buildCtx.activeHouseId === house.id) {
        const villager = villagers?.find(v => v.houseId === house.id);
        this.renderInterior(house, villager, hourIndex);
      } else if (buildCtx.state === BuildModeState.Building && buildCtx.activeHouseId === house.id) {
        this.renderBuildMode(house, buildCtx);
      } else {
        this.renderExterior(house, season, hourIndex);
      }
    }
  }

  private renderExterior(house: HouseState, season?: Season, hourIndex?: number): void {
    if (house.phase === BuildPhase.SiteMarked) {
      this.renderScaffold(house);
    } else if (house.phase === BuildPhase.Complete) {
      this.renderCompletedExterior(house);
      if (season !== undefined) {
        this.renderSeasonalDecorations(house, season);
      }
      // Lantern glow at night (hours 0,1,6,7 = Matins, Lauds, Vespers, Compline)
      if (hourIndex !== undefined && (hourIndex <= 1 || hourIndex >= 6)) {
        this.renderLantern(house);
      }
    }
  }

  private renderScaffold(house: HouseState): void {
    const { anchorCol: ac, anchorRow: ar, width: w, height: h } = house;
    const centerCol = ac + Math.floor(w / 2);
    const centerRow = ar + Math.floor(h / 2);

    // Central '?' marker
    this.renderer.setOverlay(centerCol, centerRow, { char: '?', fg: '#ddaa44' }, OverlayLayer.Building);
    this.previousCells.add(`${centerCol},${centerRow}`);

    // Animated sparkles in a diamond around the '?'
    const sparklePositions: [number, number][] = [
      [0, -1],   // top
      [1, 0],    // right
      [0, 1],    // bottom
      [-1, 0],   // left
    ];
    const sparkleFrame = Math.floor(this.totalTime / 400);

    for (let i = 0; i < sparklePositions.length; i++) {
      const [dc, dr] = sparklePositions[i];
      const col = centerCol + dc;
      const row = centerRow + dr;
      if (col < 0 || col >= GRID_CONFIG.cols || row < 0 || row >= GRID_CONFIG.rows) continue;

      const charIdx = (sparkleFrame + i) % SPARKLE_CHARS.length;
      const colorIdx = (sparkleFrame + i + 2) % SPARKLE_COLORS.length;

      this.renderer.setOverlay(col, row, {
        char: SPARKLE_CHARS[charIdx],
        fg: SPARKLE_COLORS[colorIdx],
      }, OverlayLayer.Building);
      this.previousCells.add(`${col},${row}`);
    }
  }

  private renderCompletedExterior(house: HouseState): void {
    // Draw player-designed exterior cells
    for (const cell of house.exterior) {
      const col = house.anchorCol + cell.colOff;
      const row = house.anchorRow + cell.rowOff;
      this.renderer.setOverlay(col, row, cell.glyph, OverlayLayer.Building);
      this.previousCells.add(`${col},${row}`);
    }
  }

  private renderBuildMode(house: HouseState, ctx: BuildModeContext): void {
    const { anchorCol: ac, anchorRow: ar, width: w, height: h } = house;

    // ── Dark vignette: dim everything outside the build area ──
    const MARGIN = 20;
    const startCol = Math.max(0, ac - MARGIN);
    const endCol = Math.min(GRID_CONFIG.cols - 1, ac + w - 1 + MARGIN);
    const startRow = Math.max(0, ar - MARGIN);
    const endRow = Math.min(GRID_CONFIG.rows - 1, ar + h - 1 + MARGIN);

    for (let col = startCol; col <= endCol; col++) {
      for (let row = startRow; row <= endRow; row++) {
        // Skip cells inside the house boundary
        if (col >= ac && col < ac + w && row >= ar && row < ar + h) continue;
        this.renderer.setOverlay(col, row, BUILD_VIGNETTE, OverlayLayer.BuildUI);
        this.previousCells.add(`${col},${row}`);
      }
    }

    // ── Build area: boundary dots + warm interior bg ──
    for (let c = 0; c < w; c++) {
      for (let r = 0; r < h; r++) {
        const col = ac + c;
        const row = ar + r;
        const isEdge = c === 0 || c === w - 1 || r === 0 || r === h - 1;

        if (isEdge) {
          this.renderer.setOverlay(col, row, { char: '·', fg: '#6a6a4a', bg: '#12100c' }, OverlayLayer.Building);
        } else {
          // Warm dark interior to contrast with the vignette
          this.renderer.setOverlay(col, row, { char: ' ', fg: '#3a3020', bg: '#14120e' }, OverlayLayer.Building);
        }
        this.previousCells.add(`${col},${row}`);
      }
    }

    // Draw placed exterior cells
    for (const cell of house.exterior) {
      const col = ac + cell.colOff;
      const row = ar + cell.rowOff;
      this.renderer.setOverlay(col, row, cell.glyph, OverlayLayer.Building);
      this.previousCells.add(`${col},${row}`);
    }

    // Draw cursor — show selected glyph preview, or tool-specific cursor
    const cursorCol = ac + ctx.cursorCol;
    const cursorRow = ar + ctx.cursorRow;
    let cursorGlyph: Glyph;
    if (ctx.selectedGlyph) {
      cursorGlyph = { ...ctx.selectedGlyph, bg: '#3a3a1a' };
    } else {
      cursorGlyph = BUILD_CURSOR;
    }
    this.renderer.setOverlay(cursorCol, cursorRow, cursorGlyph, OverlayLayer.BuildUI);
    this.previousCells.add(`${cursorCol},${cursorRow}`);
  }

  private renderInterior(house: HouseState, villager?: VillagerState, hourIndex?: number): void {
    const { anchorCol: ac, anchorRow: ar, width: w, height: h } = house;

    // Build a set of exterior cell positions
    const exteriorSet = new Set<string>();
    for (const cell of house.exterior) {
      exteriorSet.add(`${cell.colOff},${cell.rowOff}`);
    }

    // Build lookup for interior cells and furniture so we know what goes where
    const interiorMap = new Map<string, Glyph>();
    for (const cell of house.interior) {
      interiorMap.set(`${cell.colOff},${cell.rowOff}`, cell.glyph);
    }
    const furnitureMap = new Map<string, Glyph>();
    for (const item of house.furniture) {
      furnitureMap.set(`${item.colOff},${item.rowOff}`, item.glyph);
    }

    // Get the villager's animated frame to draw inside the house
    const villagerCells = new Map<string, Glyph>();
    if (villager) {
      const def = VILLAGERS[villager.defId];
      if (def) {
        const isSleeping = villager.activity.toLowerCase().includes('snoozing')
          || villager.activity.toLowerCase().includes('dozing');
        const isOut = !villager.isHome && villager.visitingHouseId !== null;

        if (!isOut) {
          let frame: VillagerFrame;
          if (isSleeping) {
            frame = def.sleepFrame;
          } else {
            frame = def.idleFrames[this.animFrame % def.idleFrames.length];
          }

          // Use the villager's tracked interior position (side-view: on the floor)
          const vCol = villager.interiorCol;
          const vRow = villager.interiorRow;

          for (const [colOff, rowOff, glyph] of frame.cells) {
            // Flip multi-cell offset for facing direction
            const actualColOff = villager.facing < 0 ? -colOff : colOff;
            const ch = villager.facing < 0 ? flipCharForInterior(glyph.char) : glyph.char;
            const key = `${vCol + actualColOff},${vRow + rowOff}`;
            villagerCells.set(key, { char: ch, fg: glyph.fg, bg: '#2a2218' });
          }
        }
      }
    }

    // Layers that could draw over the interior — clear them all in the house region
    const coveringLayers = [
      OverlayLayer.Weather,
      OverlayLayer.BuildUI,
      OverlayLayer.Creature,
      OverlayLayer.Plant,
      OverlayLayer.Stars,
      OverlayLayer.Terrain,
    ];

    // Fill the entire house region — this covers up plants/terrain behind it
    for (let c = 0; c < w; c++) {
      for (let r = 0; r < h; r++) {
        const col = ac + c;
        const row = ar + r;
        const key = `${c},${r}`;

        // Clear all other layers so nothing renders over the interior
        for (const layer of coveringLayers) {
          this.renderer.clearOverlay(col, row, layer);
        }

        let glyph: Glyph;

        if (villagerCells.has(key)) {
          // Villager takes top priority
          glyph = villagerCells.get(key)!;
        } else if (furnitureMap.has(key)) {
          // Furniture next
          glyph = furnitureMap.get(key)!;
        } else if (interiorMap.has(key)) {
          // Interior floor
          glyph = interiorMap.get(key)!;
        } else if (exteriorSet.has(key)) {
          // Wall — show as a thin dimmed border glyph
          const orig = house.exterior.find(e => e.colOff === c && e.rowOff === r)!;
          glyph = { char: orig.glyph.char, fg: '#5a5040', bg: '#1a1610' };
        } else {
          // Empty interior space — warm dark floor
          glyph = { char: ' ', fg: '#3a3020', bg: '#1e1a12' };
        }

        this.renderer.setOverlay(col, row, glyph, OverlayLayer.Building);
        this.previousCells.add(`${col},${row}`);
      }
    }
  }

  private renderSeasonalDecorations(house: HouseState, season: Season): void {
    const { anchorCol: ac, anchorRow: ar, width: w } = house;

    // Find highest exterior cell in each column to place decorations above the roof
    const roofRow = ar - 1;
    if (roofRow < 0) return;

    const midCol = ac + Math.floor(w / 2);

    switch (season) {
      case Season.Winter: {
        // Chimney smoke rising above the house
        const smokeChars = [',', '.', "'", '`'];
        for (let i = 0; i < 3; i++) {
          const sr = roofRow - i;
          if (sr < 0) break;
          const sc = midCol + ((i % 2 === 0) ? 0 : 1);
          const ch = smokeChars[i % smokeChars.length];
          const alpha = Math.max(30, 80 - i * 20);
          const hex = alpha.toString(16).padStart(2, '0');
          this.renderer.setOverlay(sc, sr, { char: ch, fg: `#${hex}${hex}${hex}` }, OverlayLayer.Building);
          this.previousCells.add(`${sc},${sr}`);
        }
        // Snow on top
        for (let c = 0; c < w; c++) {
          if (house.exterior.some(e => e.rowOff === 0 && e.colOff === c)) {
            this.renderer.setOverlay(ac + c, ar - 1, { char: '_', fg: '#ccccdd' }, OverlayLayer.Building);
            this.previousCells.add(`${ac + c},${ar - 1}`);
          }
        }
        break;
      }
      case Season.Spring: {
        // Flowers around the base
        const flowerChars = ['*', '.', ',', '*'];
        const flowerColors = ['#ee88aa', '#eedd66', '#aa88ee', '#ffaacc'];
        for (let c = -1; c <= w; c++) {
          const col = ac + c;
          const row = ar + house.height;
          if (row >= 55 || col < 0 || col >= 200) continue;
          if (Math.abs((col * 7 + row * 3) % 5) < 2) {
            const idx = (col + row) % flowerChars.length;
            this.renderer.setOverlay(col, row, {
              char: flowerChars[idx], fg: flowerColors[idx],
            }, OverlayLayer.Building);
            this.previousCells.add(`${col},${row}`);
          }
        }
        break;
      }
      case Season.Summer: {
        // Butterflies near the roof
        if ((Date.now() / 1000) % 4 < 2) {
          const bCol = ac + (Math.floor(Date.now() / 800) % w);
          if (roofRow > 0) {
            this.renderer.setOverlay(bCol, roofRow, { char: '~', fg: '#ddaa44' }, OverlayLayer.Building);
            this.previousCells.add(`${bCol},${roofRow}`);
          }
        }
        break;
      }
      case Season.Autumn: {
        // Falling leaves around the house
        const leafColors = ['#cc6622', '#ddaa33', '#bb5511', '#dd8833'];
        for (let c = -1; c <= w; c++) {
          const col = ac + c;
          const row = ar + house.height;
          if (row >= 55 || col < 0 || col >= 200) continue;
          if (Math.abs((col * 3 + row * 11) % 7) < 2) {
            const idx = (col + row) % leafColors.length;
            this.renderer.setOverlay(col, row, {
              char: ',', fg: leafColors[idx],
            }, OverlayLayer.Building);
            this.previousCells.add(`${col},${row}`);
          }
        }
        break;
      }
    }
  }

  private renderLantern(house: HouseState): void {
    // Place a warm lantern glyph next to the door (bottom-center of house)
    const col = house.anchorCol + Math.floor(house.width / 2) - 1;
    const row = house.anchorRow + house.height - 1;
    if (col >= 0 && col < 200 && row >= 0 && row < 55) {
      this.renderer.setOverlay(col, row, { char: 'o', fg: '#eebb44' }, OverlayLayer.Building);
      this.previousCells.add(`${col},${row}`);
    }
    // Warm glow on adjacent cell
    const glowCol = col + 1;
    if (glowCol >= 0 && glowCol < 200) {
      this.renderer.setOverlay(glowCol, row, { char: '.', fg: '#aa8833' }, OverlayLayer.Building);
      this.previousCells.add(`${glowCol},${row}`);
    }
  }
}

/** Flip a character for left-facing villagers in interior view */
function flipCharForInterior(ch: string): string {
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
