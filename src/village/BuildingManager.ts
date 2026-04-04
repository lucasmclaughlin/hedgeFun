import { BuildPhase, Layer, VillagerPersonality, GRID_CONFIG } from '@/types';
import type { HouseState, BuildingCell, VillagerDef, PlantState, FurnitureItem, Glyph } from '@/types';
import { VILLAGERS } from '@/data/villagers';
import type { TerrainMap } from '@/simulation/TerrainMap';

/**
 * Manages house state: allocation of building sites, exterior/interior storage.
 */
export class BuildingManager {
  private houses: HouseState[] = [];
  private nextId = 1;
  private terrainMap: TerrainMap;

  constructor(terrainMap: TerrainMap) {
    this.terrainMap = terrainMap;
  }

  getHouses(): ReadonlyArray<HouseState> {
    return this.houses;
  }

  getHouse(id: number): HouseState | undefined {
    return this.houses.find(h => h.id === id);
  }

  getHouseAtCell(col: number, row: number): HouseState | undefined {
    return this.houses.find(h =>
      col >= h.anchorCol && col < h.anchorCol + h.width &&
      row >= h.anchorRow && row < h.anchorRow + h.height,
    );
  }

  /**
   * Find a suitable building site for a villager near mature plants.
   * Returns the new HouseState or null if no space found.
   */
  allocateSite(villager: VillagerDef, plants: ReadonlyArray<PlantState>): HouseState | null {
    const maturePlants = plants.filter(p => p.stage >= 3 && !p.isDying);
    if (maturePlants.length === 0) return null;

    const w = villager.houseWidth;
    const h = villager.houseHeight;

    // Try to find a spot near preferred plants
    const candidates = this.findCandidateColumns(villager, maturePlants, w);

    for (const col of candidates) {
      const anchorRow = this.getAnchorRow(villager.nestingLayer, col, h);
      if (anchorRow < 0) continue;

      // Check no overlap with existing houses
      if (this.overlapsExistingHouse(col, anchorRow, w, h)) continue;

      const house: HouseState = {
        id: this.nextId++,
        villagerId: villager.id,
        anchorCol: col,
        anchorRow: anchorRow,
        width: w,
        height: h,
        phase: BuildPhase.SiteMarked,
        exterior: [],
        interior: [],
        furniture: [],
      };
      this.houses.push(house);
      return house;
    }

    return null;
  }

  /**
   * Generate interior from exterior shell and villager personality.
   */
  generateInterior(house: HouseState): void {
    if (house.exterior.length === 0) return;

    const villager = VILLAGERS[house.villagerId];

    // Find the bounding box of placed exterior cells
    let minCol = house.width, maxCol = 0;
    let minRow = house.height, maxRow = 0;
    for (const cell of house.exterior) {
      minCol = Math.min(minCol, cell.colOff);
      maxCol = Math.max(maxCol, cell.colOff);
      minRow = Math.min(minRow, cell.rowOff);
      maxRow = Math.max(maxRow, cell.rowOff);
    }

    // Exterior cell lookup
    const exteriorSet = new Set<string>();
    for (const cell of house.exterior) {
      exteriorSet.add(`${cell.colOff},${cell.rowOff}`);
    }

    // Floor tiles for the interior (everything inside bounding box not a wall)
    const interior: BuildingCell[] = [];
    const floorCells: Array<{ col: number; row: number }> = [];

    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        if (!exteriorSet.has(`${c},${r}`)) {
          // Vary floor tile slightly
          const hash = ((c * 7 + r * 13) % 3);
          const floorChar = hash === 0 ? '.' : hash === 1 ? '·' : ' ';
          const floorFg = hash === 0 ? '#5a4a30' : '#4a3a28';
          interior.push({
            colOff: c, rowOff: r,
            glyph: { char: floorChar, fg: floorFg, bg: '#2a2218' },
          });
          floorCells.push({ col: c, row: r });
        }
      }
    }

    // Place furniture by personality
    const furniture = this.generatePersonalityFurniture(
      villager, floorCells, exteriorSet, minCol, maxCol, minRow, maxRow,
    );

    house.interior = interior;
    house.furniture = furniture;
  }

  private generatePersonalityFurniture(
    villager: VillagerDef | undefined,
    floorCells: Array<{ col: number; row: number }>,
    exteriorSet: Set<string>,
    minCol: number, maxCol: number,
    minRow: number, maxRow: number,
  ): FurnitureItem[] {
    const furniture: FurnitureItem[] = [];
    if (floorCells.length === 0) return furniture;

    const floorSet = new Set(floorCells.map(c => `${c.col},${c.row}`));
    const usedCells = new Set<string>();

    const place = (id: string, col: number, row: number, glyph: Glyph, permanent = true): boolean => {
      const key = `${col},${row}`;
      if (!floorSet.has(key) || usedCells.has(key)) return false;
      usedCells.add(key);
      furniture.push({ id, colOff: col, rowOff: row, glyph, permanent });
      return true;
    };

    // Helper: find cells along a wall edge (adjacent to exterior)
    const leftWallCells = floorCells.filter(c =>
      c.col === minCol + 1 || exteriorSet.has(`${c.col - 1},${c.row}`),
    );
    const rightWallCells = floorCells.filter(c =>
      c.col === maxCol - 1 || exteriorSet.has(`${c.col + 1},${c.row}`),
    );
    const topWallCells = floorCells.filter(c =>
      c.row === minRow + 1 || exteriorSet.has(`${c.col},${c.row - 1}`),
    );

    const centerCol = Math.floor((minCol + maxCol) / 2);
    const centerRow = Math.floor((minRow + maxRow) / 2);

    // ── Common to all: fireplace on left wall ──
    if (leftWallCells.length > 0) {
      const spot = leftWallCells[Math.floor(leftWallCells.length / 2)];
      place('fireplace', spot.col, spot.row, { char: '#', fg: '#dd6633', bg: '#3a1a0a' });
    }

    const personality = villager?.personality ?? VillagerPersonality.Cozy;

    switch (personality) {
      case VillagerPersonality.Cozy:
        // Armchair, rug, cushion, teapot
        place('armchair', centerCol, centerRow, { char: '&', fg: '#bb8855', bg: '#2a2218' });
        place('rug', centerCol, centerRow + 1, { char: '~', fg: '#994433', bg: '#2a2218' });
        place('cushion', centerCol + 1, centerRow, { char: 'o', fg: '#cc6666', bg: '#2a2218' });
        if (topWallCells.length > 0) {
          const s = topWallCells[topWallCells.length - 1];
          place('teapot', s.col, s.row, { char: '$', fg: '#ddaa66', bg: '#2a2218' });
        }
        place('quilt', centerCol - 1, centerRow + 1, { char: '%', fg: '#aa6644', bg: '#2a2218' }, false);
        break;

      case VillagerPersonality.Bookish:
        // Bookshelf, desk, reading lamp, quill
        if (rightWallCells.length > 1) {
          place('bookshelf', rightWallCells[0].col, rightWallCells[0].row, { char: ']', fg: '#aa7755', bg: '#2a2218' });
          place('bookshelf2', rightWallCells[1].col, rightWallCells[1].row, { char: '[', fg: '#997755', bg: '#2a2218' });
        }
        place('desk', centerCol, centerRow, { char: '_', fg: '#aa8855', bg: '#2a2218' });
        place('lamp', centerCol + 1, centerRow - 1, { char: '?', fg: '#eebb44', bg: '#2a2218' });
        place('quill', centerCol + 1, centerRow, { char: '/', fg: '#8888aa', bg: '#2a2218' });
        place('spectacles', centerCol - 1, centerRow, { char: '8', fg: '#aaaacc', bg: '#2a2218' }, false);
        break;

      case VillagerPersonality.Culinary:
        // Stove, table, kettle, jam jars, pie
        place('stove', centerCol - 1, minRow + 1, { char: '#', fg: '#888888', bg: '#2a1a1a' });
        place('table', centerCol, centerRow, { char: '=', fg: '#aa8855', bg: '#2a2218' });
        place('kettle', centerCol + 1, centerRow - 1, { char: '$', fg: '#cc8844', bg: '#2a2218' });
        place('jam_jar', centerCol + 1, centerRow, { char: 'o', fg: '#cc4466', bg: '#2a2218' });
        place('pie', centerCol, centerRow - 1, { char: 'n', fg: '#ddaa66', bg: '#2a2218' }, false);
        place('flour', centerCol - 1, centerRow, { char: '%', fg: '#ccccaa', bg: '#2a2218' }, false);
        break;

      case VillagerPersonality.Crafty:
        // Workbench, yarn basket, needle cushion, thimble
        place('workbench', centerCol, centerRow, { char: '=', fg: '#aa8855', bg: '#2a2218' });
        place('yarn', centerCol - 1, centerRow + 1, { char: '@', fg: '#cc6688', bg: '#2a2218' });
        place('needle_cushion', centerCol + 1, centerRow, { char: 'o', fg: '#dd8866', bg: '#2a2218' });
        place('scissors', centerCol, centerRow - 1, { char: 'X', fg: '#aaaacc', bg: '#2a2218' });
        if (rightWallCells.length > 0) {
          place('fabric', rightWallCells[0].col, rightWallCells[0].row, { char: '%', fg: '#88aacc', bg: '#2a2218' }, false);
        }
        place('thimble', centerCol + 1, centerRow + 1, { char: 'u', fg: '#ccaa88', bg: '#2a2218' }, false);
        break;

      case VillagerPersonality.Gardener:
        // Plant pots, watering can, seed box, herb spiral
        place('plant_pot', centerCol, centerRow - 1, { char: 'Y', fg: '#5aaa4a', bg: '#2a2218' });
        place('plant_pot2', centerCol + 1, centerRow - 1, { char: 'Y', fg: '#6aba5a', bg: '#2a2218' });
        place('watering_can', centerCol - 1, centerRow, { char: 'J', fg: '#88aacc', bg: '#2a2218' });
        place('seed_box', centerCol, centerRow, { char: '[', fg: '#aa8855', bg: '#2a2218' });
        place('herbs', centerCol + 1, centerRow + 1, { char: '{', fg: '#4a8a3a', bg: '#2a2218' }, false);
        if (topWallCells.length > 0) {
          place('flower', topWallCells[0].col, topWallCells[0].row, { char: '*', fg: '#ddaa88', bg: '#2a2218' }, false);
        }
        break;
    }

    // ── Place the villager glyph ──
    // Find a free cell near center
    for (const dc of [0, 1, -1, 0, 1]) {
      for (const dr of [1, 0, 1, -1, 0]) {
        const c = centerCol + dc;
        const r = centerRow + dr;
        const key = `${c},${r}`;
        if (floorSet.has(key) && !usedCells.has(key)) {
          usedCells.add(key);
          const glyph = villager?.homeGlyph ?? { char: '?', fg: '#ccaa88' };
          furniture.push({
            id: 'villager',
            colOff: c,
            rowOff: r,
            glyph: { ...glyph, bg: '#2a2218' },
            permanent: true,
          });
          return furniture;
        }
      }
    }

    return furniture;
  }

  private findCandidateColumns(
    villager: VillagerDef,
    maturePlants: ReadonlyArray<PlantState>,
    width: number,
  ): number[] {
    const preferred = maturePlants.filter(p =>
      villager.preferredPlants.includes(p.speciesId),
    );
    const source = preferred.length > 0 ? preferred : maturePlants;

    // Sort by proximity to center of map
    const center = Math.floor(GRID_CONFIG.cols / 2);
    const sorted = [...source].sort((a, b) =>
      Math.abs(a.col - center) - Math.abs(b.col - center),
    );

    // Generate candidate columns near plants (offset to not overlap the plant)
    const candidates: number[] = [];
    for (const plant of sorted) {
      for (const offset of [2, -width - 1, width + 2, -width - 2]) {
        const col = plant.col + offset;
        if (col >= 1 && col + width < GRID_CONFIG.cols - 1) {
          candidates.push(col);
        }
      }
    }

    return candidates;
  }

  private getAnchorRow(layer: Layer, col: number, height: number): number {
    const groundRow = this.terrainMap.getGroundRow(col);

    switch (layer) {
      case Layer.Ground:
      case Layer.Underground:
        // House sits at ground level, extending up
        return groundRow - height + 1;
      case Layer.LowerShrub:
        // In the shrub layer, above ground
        return groundRow - height - 2;
      case Layer.MidCanopy:
      case Layer.UpperCanopy:
        // High up in the canopy
        return Math.max(2, groundRow - height - 6);
      default:
        return groundRow - height + 1;
    }
  }

  private overlapsExistingHouse(col: number, row: number, w: number, h: number): boolean {
    return this.houses.some(existing => {
      const noOverlap =
        col + w <= existing.anchorCol ||
        col >= existing.anchorCol + existing.width ||
        row + h <= existing.anchorRow ||
        row >= existing.anchorRow + existing.height;
      return !noOverlap;
    });
  }
}
