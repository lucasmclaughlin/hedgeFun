import { GrowthStage, type PlantState } from '@/types';
import type { TerrainMap } from '@/simulation/TerrainMap';

export interface PlantFort {
  plantCol: number;
  speciesId: string;
  assignedDefenderId: number;
  groundRow: number;
}

export class FortificationSystem {
  private forts: PlantFort[] = [];

  /**
   * Rebuild the fort list from current game state.
   * A fort exists for every mature plant with an assigned defender.
   */
  update(
    plants: readonly PlantState[],
    assignments: ReadonlyMap<number, number>,  // creatureId → plantCol
    terrainMap: TerrainMap,
  ): void {
    this.forts = [];
    const assignedCols = new Map<number, number>();  // plantCol → creatureId
    for (const [cid, pcol] of assignments) {
      assignedCols.set(pcol, cid);
    }

    for (const plant of plants) {
      if (plant.stage !== GrowthStage.Mature) continue;
      const defenderId = assignedCols.get(plant.col);
      if (defenderId === undefined) continue;

      this.forts.push({
        plantCol: plant.col,
        speciesId: plant.speciesId,
        assignedDefenderId: defenderId,
        groundRow: terrainMap.getGroundRow(plant.col),
      });
    }
  }

  getForts(): readonly PlantFort[] { return this.forts; }

  getFortAt(col: number): PlantFort | null {
    return this.forts.find(f => f.plantCol === col) ?? null;
  }

  /** Speed multiplier for enemies at this col. 0.4 if within 1 col of a fort. */
  getSpeedMultiplier(col: number): number {
    return this.forts.some(f => Math.abs(f.plantCol - col) <= 1) ? 0.4 : 1.0;
  }

  clear(): void { this.forts = []; }
}
