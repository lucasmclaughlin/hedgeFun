import { BuildPhase, BuildModeState, OverlayLayer, Season } from '@/types';
import type { HouseState, BuildModeContext, Glyph, VillagerState, VillagerFrame } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { VILLAGERS } from '@/data/villagers';

/** Scaffold glyphs for a building site — looks like a staked-out plot */
const SCAFFOLD_CORNER_TL: Glyph = { char: '+', fg: '#aa9060', bg: '#1a1610' };
const SCAFFOLD_CORNER_TR: Glyph = { char: '+', fg: '#aa9060', bg: '#1a1610' };
const SCAFFOLD_CORNER_BL: Glyph = { char: '+', fg: '#aa9060', bg: '#1a1610' };
const SCAFFOLD_CORNER_BR: Glyph = { char: '+', fg: '#aa9060', bg: '#1a1610' };
const SCAFFOLD_HORIZ: Glyph    = { char: '-', fg: '#8a7a5a', bg: '#1a1610' };
const SCAFFOLD_VERT: Glyph     = { char: ':', fg: '#8a7a5a', bg: '#1a1610' };
const SCAFFOLD_INTERIOR: Glyph = { char: ' ', fg: '#3a3020', bg: '#1a1610' };
const SCAFFOLD_CENTER: Glyph   = { char: '?', fg: '#ddaa44', bg: '#1a1610' };

/** Build mode cursor */
const BUILD_CURSOR: Glyph = { char: '+', fg: '#eedd44' };

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

    // Advance interior animation timer
    if (delta) {
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

    for (let c = 0; c < w; c++) {
      for (let r = 0; r < h; r++) {
        const col = ac + c;
        const row = ar + r;
        let glyph: Glyph;

        const isTop = r === 0;
        const isBottom = r === h - 1;
        const isLeft = c === 0;
        const isRight = c === w - 1;

        const isCenterCol = c === Math.floor(w / 2);
        const isCenterRow = r === Math.floor(h / 2);

        if ((isTop && isLeft)) glyph = SCAFFOLD_CORNER_TL;
        else if ((isTop && isRight)) glyph = SCAFFOLD_CORNER_TR;
        else if ((isBottom && isLeft)) glyph = SCAFFOLD_CORNER_BL;
        else if ((isBottom && isRight)) glyph = SCAFFOLD_CORNER_BR;
        else if (isTop || isBottom) glyph = SCAFFOLD_HORIZ;
        else if (isLeft || isRight) glyph = SCAFFOLD_VERT;
        else if (isCenterCol && isCenterRow) glyph = SCAFFOLD_CENTER;
        else glyph = SCAFFOLD_INTERIOR;

        this.renderer.setOverlay(col, row, glyph, OverlayLayer.Building);
        this.previousCells.add(`${col},${row}`);
      }
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

    // Draw boundary
    for (let c = 0; c < w; c++) {
      for (let r = 0; r < h; r++) {
        const col = ac + c;
        const row = ar + r;
        const isEdge = c === 0 || c === w - 1 || r === 0 || r === h - 1;

        if (isEdge) {
          // Subtle dotted border
          this.renderer.setOverlay(col, row, { char: '·', fg: '#5a5a4a' }, OverlayLayer.Building);
          this.previousCells.add(`${col},${row}`);
        }
      }
    }

    // Draw placed exterior cells
    for (const cell of house.exterior) {
      const col = ac + cell.colOff;
      const row = ar + cell.rowOff;
      this.renderer.setOverlay(col, row, cell.glyph, OverlayLayer.Building);
      this.previousCells.add(`${col},${row}`);
    }

    // Draw cursor
    const cursorCol = ac + ctx.cursorCol;
    const cursorRow = ar + ctx.cursorRow;
    const cursorGlyph = ctx.selectedGlyph
      ? { ...ctx.selectedGlyph, bg: '#3a3a1a' }
      : BUILD_CURSOR;
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

          // Place villager near center of interior
          const centerCol = Math.floor(w / 2);
          const centerRow = Math.floor(h / 2);

          for (const [colOff, rowOff, glyph] of frame.cells) {
            const key = `${centerCol + colOff},${centerRow + rowOff}`;
            villagerCells.set(key, { char: glyph.char, fg: glyph.fg, bg: '#2a2218' });
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
