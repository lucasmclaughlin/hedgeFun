import { Season, GrowthStage, type TimePeriod, type PlantState } from '@/types';
import { SPECIES } from '@/data/species';

export class GrowthSimulator {
  private plants: PlantState[] = [];

  addPlant(speciesId: string, col: number, row: number, currentPeriod: number): void {
    this.plants.push({
      speciesId,
      col,
      row,
      stage: GrowthStage.Seed,
      ticksInStage: 0,
      plantedAt: currentPeriod,
    });
  }

  onPeriodAdvance(period: TimePeriod): void {
    for (const plant of this.plants) {
      if (plant.stage === GrowthStage.Mature) continue;

      const species = SPECIES[plant.speciesId];
      if (!species) continue;

      // Seeds don't grow in winter (except holly)
      if (plant.stage === GrowthStage.Seed && period.season === Season.Winter && species.id !== 'holly') {
        continue;
      }

      // Seasonal growth modifier
      let modifier = species.growthRate;
      if (species.plantableSeasons.includes(period.season)) {
        modifier *= 1.5; // favorable season boost
      }
      if (period.season === Season.Winter && species.id !== 'holly') {
        modifier *= 0.5; // winter slowdown (holly is evergreen)
      }

      plant.ticksInStage += modifier;

      const required = species.ticksPerStage[plant.stage];
      if (plant.ticksInStage >= required) {
        plant.ticksInStage = 0;
        plant.stage++;
      }
    }
  }

  getPlants(): ReadonlyArray<PlantState> {
    return this.plants;
  }

  isColumnOccupied(col: number): boolean {
    return this.plants.some(p => p.col === col);
  }

  /** Find the plant that occupies a given cell (if any), checking species visuals */
  getPlantAtCell(col: number, row: number): PlantState | null {
    for (const plant of this.plants) {
      const species = SPECIES[plant.speciesId];
      if (!species) continue;
      const visual = species.visuals[plant.stage];
      for (const [colOff, rowOff] of visual.cells) {
        if (plant.col + colOff === col && plant.row + rowOff === row) {
          return plant;
        }
      }
    }
    return null;
  }
}
