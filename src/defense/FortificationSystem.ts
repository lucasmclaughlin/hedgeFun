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
   * Rebuild the fort list. Call each frame or each period.
   * A fort is generated for every mature plant that has an assigned defender.
   */
  update(
    plants: readonly PlantState[],
    assignments: ReadonlyMap<number, number>,  // creatureId → plantCol
    terrainMap: TerrainMap,
  ): void {
    this.forts = [];

    // Build col → creatureId lookup once to avoid nested iteration
    const colToDefender = new Map<number, number>();
    for (const [cid, pcol] of assignments) {
      colToDefender.set(pcol, cid);
    }

    for (const plant of plants) {
      if (plant.stage !== GrowthStage.Mature) continue;
      const defenderId = colToDefender.get(plant.col);
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

  /** Speed multiplier for enemies at this col. 0.4 if fortified, 1.0 otherwise */
  getSpeedMultiplier(col: number): number {
    return this.forts.some(f => Math.abs(f.plantCol - col) <= 1) ? 0.4 : 1.0;
  }

  clear(): void { this.forts = []; }
}
