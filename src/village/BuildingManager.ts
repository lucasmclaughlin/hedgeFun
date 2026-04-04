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
   * Generate side-view interior from exterior shell and villager personality.
   * Layout: ceiling at top, back wall in middle rows, floor at bottom.
   * Furniture sits on the floor or hangs on the back wall.
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

    const exteriorSet = new Set<string>();
    for (const cell of house.exterior) {
      exteriorSet.add(`${cell.colOff},${cell.rowOff}`);
    }

    // Side-view interior: all non-exterior cells inside bounding box
    const interior: BuildingCell[] = [];
    const floorRow = maxRow - 1; // bottom interior row = floor
    const ceilingRow = minRow + 1; // top interior row = ceiling beams

    for (let c = minCol; c <= maxCol; c++) {
      for (let r = minRow; r <= maxRow; r++) {
        if (exteriorSet.has(`${c},${r}`)) continue;

        let glyph: Glyph;
        if (r === floorRow) {
          // Floor — wooden planks
          const hash = (c * 7) % 3;
          const ch = hash === 0 ? '=' : hash === 1 ? '-' : '=';
          glyph = { char: ch, fg: '#6a5a3a', bg: '#2a2218' };
        } else if (r === ceilingRow) {
          // Ceiling beams
          const ch = (c % 4 === 0) ? '+' : '-';
          glyph = { char: ch, fg: '#5a4a30', bg: '#1e1a12' };
        } else {
          // Back wall — warm paneling
          const hash = ((c * 3 + r * 7) % 5);
          const ch = hash === 0 ? '|' : hash === 1 ? ':' : ' ';
          const fg = hash < 2 ? '#3a3020' : '#2a2218';
          glyph = { char: ch, fg, bg: '#2a2218' };
        }
        interior.push({ colOff: c, rowOff: r, glyph });
      }
    }

    // Place furniture in side-view layout
    const furniture = this.generateSideViewFurniture(
      villager, exteriorSet, minCol, maxCol, minRow, floorRow, ceilingRow,
    );

    house.interior = interior;
    house.furniture = furniture;
  }

  /**
   * Place furniture in side-view: large items on floor row, wall items above,
   * small items on shelves (floor - 1 row).
   */
  private generateSideViewFurniture(
    villager: VillagerDef | undefined,
    exteriorSet: Set<string>,
    minCol: number, maxCol: number,
    minRow: number, floorRow: number, ceilingRow: number,
  ): FurnitureItem[] {
    const furniture: FurnitureItem[] = [];
    const usedCells = new Set<string>();
    const bg = '#2a2218';

    const isFloor = (c: number, r: number) => {
      return r >= ceilingRow && r <= floorRow
        && c > minCol && c < maxCol
        && !exteriorSet.has(`${c},${r}`);
    };

    const place = (id: string, col: number, row: number, glyph: Glyph, permanent = true): boolean => {
      const key = `${col},${row}`;
      if (usedCells.has(key) || !isFloor(col, row)) return false;
      usedCells.add(key);
      furniture.push({ id, colOff: col, rowOff: row, glyph, permanent });
      return true;
    };

    // Side-view positions
    const leftCol = minCol + 1;    // leftmost interior column
    const rightCol = maxCol - 1;   // rightmost interior column
    const shelfRow = floorRow - 1; // row above floor for table-top items
    const wallRow = floorRow - 2;  // higher row for wall-mounted items
    const centerCol = Math.floor((minCol + maxCol) / 2);

    // ── Common to all: fireplace on left wall ──
    place('fireplace', leftCol, floorRow, { char: '#', fg: '#dd6633', bg: '#3a1a0a' });
    // Fire glow above
    if (wallRow >= ceilingRow) {
      place('fire_glow', leftCol, shelfRow, { char: '^', fg: '#ee8833', bg: '#3a1a0a' });
    }

    const personality = villager?.personality ?? VillagerPersonality.Cozy;

    switch (personality) {
      case VillagerPersonality.Cozy:
        // Armchair by fire, rug on floor, teapot on shelf, cushion, quilt
        place('armchair', leftCol + 1, floorRow, { char: '&', fg: '#bb8855', bg });
        place('rug', centerCol, floorRow, { char: '~', fg: '#994433', bg });
        place('cushion', centerCol + 1, floorRow, { char: 'o', fg: '#cc6666', bg });
        place('teapot', rightCol, shelfRow, { char: '$', fg: '#ddaa66', bg });
        place('quilt', rightCol, floorRow, { char: '%', fg: '#aa6644', bg }, false);
        // Wall shelf with kettle
        if (wallRow >= ceilingRow) {
          place('kettle', rightCol - 1, wallRow, { char: '$', fg: '#cc8844', bg });
        }
        break;

      case VillagerPersonality.Bookish:
        // Bookshelves against right wall, desk center, lamp above
        place('bookshelf', rightCol, floorRow, { char: ']', fg: '#aa7755', bg });
        place('bookshelf2', rightCol, shelfRow, { char: ']', fg: '#997755', bg });
        place('desk', centerCol, floorRow, { char: '_', fg: '#aa8855', bg });
        place('lamp', centerCol, shelfRow, { char: '?', fg: '#eebb44', bg });
        place('quill', centerCol + 1, floorRow, { char: '/', fg: '#8888aa', bg });
        place('spectacles', centerCol - 1, floorRow, { char: '8', fg: '#aaaacc', bg }, false);
        // Books on wall
        if (wallRow >= ceilingRow) {
          place('notebook', rightCol - 1, wallRow, { char: '=', fg: '#aa8866', bg }, false);
        }
        break;

      case VillagerPersonality.Culinary:
        // Stove left, table center, kettle/pie on shelves, jam on floor
        place('stove', leftCol + 1, floorRow, { char: '#', fg: '#888888', bg: '#2a1a1a' });
        place('table', centerCol, floorRow, { char: '=', fg: '#aa8855', bg });
        place('kettle', leftCol + 1, shelfRow, { char: '$', fg: '#cc8844', bg });
        place('pie', centerCol, shelfRow, { char: 'n', fg: '#ddaa66', bg }, false);
        place('jam_jar', rightCol, floorRow, { char: 'o', fg: '#cc4466', bg });
        place('flour', rightCol - 1, floorRow, { char: '%', fg: '#ccccaa', bg }, false);
        // Hanging pots on wall
        if (wallRow >= ceilingRow) {
          place('cake_stand', centerCol + 1, wallRow, { char: 'T', fg: '#ccaa88', bg }, false);
        }
        break;

      case VillagerPersonality.Crafty:
        // Workbench center, yarn left, fabric right
        place('workbench', centerCol, floorRow, { char: '=', fg: '#aa8855', bg });
        place('yarn', leftCol + 1, floorRow, { char: '@', fg: '#cc6688', bg });
        place('needle_cushion', centerCol + 1, floorRow, { char: 'o', fg: '#dd8866', bg });
        place('scissors', centerCol, shelfRow, { char: 'X', fg: '#aaaacc', bg });
        place('fabric', rightCol, floorRow, { char: '%', fg: '#88aacc', bg }, false);
        place('thimble', rightCol - 1, floorRow, { char: 'u', fg: '#ccaa88', bg }, false);
        // Ribbon on wall
        if (wallRow >= ceilingRow) {
          place('ribbon_spool', rightCol, wallRow, { char: '@', fg: '#cc88aa', bg }, false);
        }
        break;

      case VillagerPersonality.Gardener:
        // Plant pots on floor, watering can, seed box, herbs above
        place('plant_pot', centerCol, floorRow, { char: 'Y', fg: '#5aaa4a', bg });
        place('plant_pot2', centerCol + 1, floorRow, { char: 'Y', fg: '#6aba5a', bg });
        place('watering_can', leftCol + 1, floorRow, { char: 'J', fg: '#88aacc', bg });
        place('seed_box', rightCol, floorRow, { char: '[', fg: '#aa8855', bg });
        place('herbs', centerCol - 1, shelfRow, { char: '{', fg: '#4a8a3a', bg }, false);
        // Flowers on wall
        if (wallRow >= ceilingRow) {
          place('flower', rightCol - 1, wallRow, { char: '*', fg: '#ddaa88', bg }, false);
        }
        break;
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
