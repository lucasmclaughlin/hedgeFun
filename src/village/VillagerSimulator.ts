import { BuildPhase } from '@/types';
import type { VillagerState, HouseState, VillagerDef } from '@/types';
import { VILLAGERS } from '@/data/villagers';

/** Furniture items that can appear/disappear as possessions */
interface PossessionGlyph {
  id: string;
  char: string;
  fg: string;
}

const POSSESSION_GLYPHS: Record<string, PossessionGlyph> = {
  teapot:        { id: 'teapot',        char: '$', fg: '#ddaa66' },
  pie:           { id: 'pie',           char: 'n', fg: '#ddaa66' },
  jam_jar:       { id: 'jam_jar',       char: 'o', fg: '#cc4466' },
  biscuit_tin:   { id: 'biscuit_tin',   char: 'u', fg: '#ccaa88' },
  recipe_book:   { id: 'recipe_book',   char: '=', fg: '#aa7755' },
  flour_sack:    { id: 'flour_sack',    char: '%', fg: '#ccccaa' },
  honey_pot:     { id: 'honey_pot',     char: 'o', fg: '#ddaa44' },
  cake_stand:    { id: 'cake_stand',    char: 'T', fg: '#ccaa88' },
  bookshelf:     { id: 'bookshelf',     char: ']', fg: '#aa7755' },
  reading_lamp:  { id: 'reading_lamp',  char: '?', fg: '#eebb44' },
  quill_pen:     { id: 'quill_pen',     char: '/', fg: '#8888aa' },
  ink_pot:       { id: 'ink_pot',       char: 'o', fg: '#333366' },
  spectacles:    { id: 'spectacles',    char: '8', fg: '#aaaacc' },
  letter:        { id: 'letter',        char: '-', fg: '#ddddbb' },
  notebook:      { id: 'notebook',      char: '=', fg: '#aa8866' },
  pressed_flower:{ id: 'pressed_flower',char: '*', fg: '#ddaa88' },
  thimble:       { id: 'thimble',       char: 'u', fg: '#ccaa88' },
  needle_cushion:{ id: 'needle_cushion',char: 'o', fg: '#dd8866' },
  yarn_basket:   { id: 'yarn_basket',   char: 'U', fg: '#cc6688' },
  quilt_square:  { id: 'quilt_square',  char: '%', fg: '#88aacc' },
  scissors:      { id: 'scissors',      char: 'X', fg: '#aaaacc' },
  button_box:    { id: 'button_box',    char: '[', fg: '#aa8855' },
  ribbon_spool:  { id: 'ribbon_spool',  char: '@', fg: '#cc88aa' },
  tiny_hat:      { id: 'tiny_hat',      char: '^', fg: '#aa6688' },
};

/**
 * Manages villager state: daily routines, visiting, and activity changes.
 */
export class VillagerSimulator {
  private villagers: VillagerState[] = [];
  private lastHourIndex = -1;

  getVillagers(): ReadonlyArray<VillagerState> {
    return this.villagers;
  }

  getVillagerForHouse(houseId: number): VillagerState | undefined {
    return this.villagers.find(v => v.houseId === houseId);
  }

  /**
   * Called when a house is completed — creates the villager state.
   */
  addVillager(house: HouseState): void {
    const def = VILLAGERS[house.villagerId];
    if (!def) return;

    // Interior floor row is the second-to-last row of the house (side view)
    const floorRow = house.height - 2;
    const centerCol = Math.floor(house.width / 2);

    this.villagers.push({
      defId: house.villagerId,
      houseId: house.id,
      activity: def.dailyRoutine[0] ?? 'pottering about',
      col: house.anchorCol + centerCol,
      row: house.anchorRow + floorRow,
      isHome: true,
      visitingHouseId: null,
      facing: 1,
      frameIndex: 0,
      animTimer: 0,
      moveTimer: 0,
      interiorCol: centerCol,
      interiorRow: floorRow,
      interiorTargetCol: centerCol,
      interiorTargetRow: floorRow,
      interiorMoveTimer: 0,
    });
  }

  /**
   * Called each frame — handles movement for walking villagers and interior wandering.
   */
  updateVillagers(delta: number, houses: ReadonlyArray<HouseState>): void {
    for (const v of this.villagers) {
      if (v.isHome) {
        // Interior wandering — move along the floor row
        this.updateInteriorMovement(v, delta, houses);
        continue;
      }

      // Walking to a destination (between houses)
      v.moveTimer += delta;
      if (v.moveTimer < 200) continue;
      v.moveTimer = 0;

      const targetHouseId = v.visitingHouseId ?? v.houseId;
      const targetHouse = houses.find(h => h.id === targetHouseId);
      if (!targetHouse) continue;

      const targetCol = targetHouse.anchorCol + Math.floor(targetHouse.width / 2);
      const targetRow = targetHouse.anchorRow + targetHouse.height - 2;

      if (v.col < targetCol) { v.col++; v.facing = 1; }
      else if (v.col > targetCol) { v.col--; v.facing = -1; }
      if (v.row < targetRow) v.row++;
      else if (v.row > targetRow) v.row--;

      if (v.col === targetCol && v.row === targetRow) {
        v.isHome = true;
        // Reset interior position to center of floor
        const house = houses.find(h => h.id === v.houseId);
        if (house) {
          v.interiorCol = Math.floor(house.width / 2);
          v.interiorRow = house.height - 2;
          v.interiorTargetCol = v.interiorCol;
          v.interiorTargetRow = v.interiorRow;
        }
      }

      v.animTimer += delta;
      if (v.animTimer > 300) {
        v.animTimer = 0;
        v.frameIndex = (v.frameIndex + 1) % 2;
      }
    }
  }

  /**
   * Move villager around inside their home (side-view: wander along floor).
   */
  private updateInteriorMovement(v: VillagerState, delta: number, houses: ReadonlyArray<HouseState>): void {
    // Don't move if sleeping
    const isSleeping = v.activity.toLowerCase().includes('snoozing')
      || v.activity.toLowerCase().includes('dozing');
    if (isSleeping) return;

    const house = houses.find(h => h.id === (v.visitingHouseId ?? v.houseId));
    if (!house) return;

    v.interiorMoveTimer += delta;

    // Pick a new target periodically
    if (v.interiorCol === v.interiorTargetCol && v.interiorRow === v.interiorTargetRow) {
      // At target — wait a bit then pick a new one
      if (v.interiorMoveTimer > 1500 + Math.random() * 2000) {
        v.interiorMoveTimer = 0;
        const floorRow = house.height - 2;
        // Wander to a random column on the floor (avoid walls)
        const minC = 1;
        const maxC = house.width - 2;
        v.interiorTargetCol = minC + Math.floor(Math.random() * (maxC - minC + 1));
        v.interiorTargetRow = floorRow;
      }
      return;
    }

    // Move toward target every 400ms
    if (v.interiorMoveTimer < 400) return;
    v.interiorMoveTimer = 0;

    if (v.interiorCol < v.interiorTargetCol) {
      v.interiorCol++;
      v.facing = 1;
    } else if (v.interiorCol > v.interiorTargetCol) {
      v.interiorCol--;
      v.facing = -1;
    }

    // Animate
    v.frameIndex = (v.frameIndex + 1) % 2;
  }

  /**
   * Called when the hour changes — updates activities, triggers visiting.
   */
  onHourChange(hourIndex: number, houses: ReadonlyArray<HouseState>): void {
    if (hourIndex === this.lastHourIndex) return;
    this.lastHourIndex = hourIndex;

    for (const v of this.villagers) {
      const def = VILLAGERS[v.defId];
      if (!def) continue;

      const activity = def.dailyRoutine[hourIndex] ?? 'pottering about';
      v.activity = activity;

      // Check if this is a visiting activity
      if (activity.toLowerCase().includes('visiting')) {
        this.tryStartVisit(v, def, houses);
      } else if (v.visitingHouseId !== null) {
        // Was visiting, now going home
        this.sendHome(v, houses);
      }
    }
  }

  /**
   * Called each period — cycles possessions in/out of houses.
   */
  cyclePossessions(houses: HouseState[]): void {
    for (const house of houses) {
      if (house.phase !== BuildPhase.Complete) continue;
      const def = VILLAGERS[house.villagerId];
      if (!def) continue;

      // Find non-permanent furniture slots
      const nonPermanent = house.furniture.filter(f => !f.permanent);
      const floorCells = house.interior.map(c => ({ col: c.colOff, row: c.rowOff }));
      const usedCells = new Set(house.furniture.map(f => `${f.colOff},${f.rowOff}`));

      // 10% chance to remove a non-permanent item
      for (const item of nonPermanent) {
        if (Math.random() < 0.10) {
          house.furniture = house.furniture.filter(f => f !== item);
          usedCells.delete(`${item.colOff},${item.rowOff}`);
        }
      }

      // 8% chance to add a new possession
      if (Math.random() < 0.08 && def.possessions.length > 0) {
        const possId = def.possessions[Math.floor(Math.random() * def.possessions.length)];
        const pg = POSSESSION_GLYPHS[possId];
        if (!pg) return;

        // Already present?
        if (house.furniture.some(f => f.id === possId)) return;

        // Find a free floor cell
        for (const cell of floorCells) {
          const key = `${cell.col},${cell.row}`;
          if (!usedCells.has(key)) {
            house.furniture.push({
              id: possId,
              colOff: cell.col,
              rowOff: cell.row,
              glyph: { char: pg.char, fg: pg.fg, bg: '#2a2218' },
              permanent: false,
            });
            break;
          }
        }
      }
    }
  }

  private tryStartVisit(
    v: VillagerState,
    def: VillagerDef,
    houses: ReadonlyArray<HouseState>,
  ): void {
    // Find a preferred neighbor who is home and has a completed house
    for (const prefId of def.visitPreferences) {
      const neighbor = this.villagers.find(
        n => n.defId === prefId && n.isHome && n.visitingHouseId === null && n.houseId !== v.houseId,
      );
      if (!neighbor) continue;

      const neighborHouse = houses.find(h => h.id === neighbor.houseId);
      if (!neighborHouse || neighborHouse.phase !== BuildPhase.Complete) continue;

      // Start walking to neighbor
      const homeHouse = houses.find(h => h.id === v.houseId);
      if (!homeHouse) continue;

      v.isHome = false;
      v.visitingHouseId = neighbor.houseId;
      // Start from home doorstep
      v.col = homeHouse.anchorCol + Math.floor(homeHouse.width / 2);
      v.row = homeHouse.anchorRow + homeHouse.height; // bottom of house
      return;
    }
  }

  private sendHome(v: VillagerState, houses: ReadonlyArray<HouseState>): void {
    // If visiting, start walking from the neighbor's house
    if (v.visitingHouseId !== null) {
      const neighborHouse = houses.find(h => h.id === v.visitingHouseId);
      if (neighborHouse) {
        v.col = neighborHouse.anchorCol + Math.floor(neighborHouse.width / 2);
        v.row = neighborHouse.anchorRow + neighborHouse.height;
      }
    }
    v.visitingHouseId = null;
    v.isHome = false;
    // Will walk toward home in updateVillagers
  }

  /**
   * Get what a villager is doing right now (for tooltips).
   */
  getActivityDescription(houseId: number, hourIndex: number): string {
    const v = this.villagers.find(vs => vs.houseId === houseId);
    if (!v) return '';

    // Check if someone is visiting this villager
    const visitor = this.villagers.find(
      vs => vs.visitingHouseId === houseId && vs.isHome,
    );

    const def = VILLAGERS[v.defId];
    let activity = def?.dailyRoutine[hourIndex] ?? 'pottering about';

    if (visitor) {
      const visitorDef = VILLAGERS[visitor.defId];
      activity += ` (with ${visitorDef?.name ?? 'a friend'})`;
    }

    if (!v.isHome && v.visitingHouseId !== null) {
      const visitDef = this.villagers.find(vs => vs.houseId === v.visitingHouseId);
      const visitName = visitDef ? VILLAGERS[visitDef.defId]?.name : 'a neighbour';
      activity = `out visiting ${visitName}`;
    }

    return activity;
  }
}
