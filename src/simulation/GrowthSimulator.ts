import { Season, GrowthStage, Weather, type TimePeriod, type PlantState } from '@/types';
import { SPECIES } from '@/data/species';
import { SoilMap } from './SoilMap';

/** Max plants before self-seeding stops */
const MAX_PLANTS = 40;

export class GrowthSimulator {
  private plants: PlantState[] = [];
  private soilMap: SoilMap;
  /** Cumulative count of plants that have died */
  private deadPlantCount = 0;

  constructor(soilMap: SoilMap) {
    this.soilMap = soilMap;
  }

  addPlant(speciesId: string, col: number, row: number, currentPeriod: number, selfSeeded = false): void {
    this.plants.push({
      speciesId,
      col,
      row,
      stage: GrowthStage.Seed,
      ticksInStage: 0,
      plantedAt: currentPeriod,
      health: 1.0,
      isDying: false,
      deathTimer: 0,
      selfSeeded,
    });
  }

  onPeriodAdvance(period: TimePeriod, weather: Weather): void {
    // Process dying plants (iterate in reverse for safe splicing)
    for (let i = this.plants.length - 1; i >= 0; i--) {
      const plant = this.plants[i];
      if (plant.isDying) {
        plant.deathTimer--;
        if (plant.deathTimer <= 0) {
          this.plants.splice(i, 1);
        }
        continue;
      }
    }

    // Growth + health for living plants
    for (const plant of this.plants) {
      if (plant.isDying) continue;

      const species = SPECIES[plant.speciesId];
      if (!species) continue;

      // ── Health checks ──
      this.updatePlantHealth(plant, period, weather);

      if (plant.health <= 0) {
        plant.isDying = true;
        plant.deathTimer = 3;
        this.deadPlantCount++;
        continue;
      }

      // ── Growth ──
      if (plant.stage === GrowthStage.Mature) {
        // Mature plants can self-seed
        this.checkSelfSeeding(plant, period);
        continue;
      }

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

      // Soil quality modifier based on root depth
      const rootDepth = this.getMaxRootDepth(species.visuals[plant.stage]);
      const soilMod = this.soilMap.getColumnQuality(plant.col, rootDepth);
      modifier *= soilMod;

      plant.ticksInStage += modifier;

      const required = species.ticksPerStage[plant.stage];
      if (plant.ticksInStage >= required) {
        plant.ticksInStage = 0;
        plant.stage++;
      }
    }
  }

  private updatePlantHealth(plant: PlantState, period: TimePeriod, weather: Weather): void {
    const species = SPECIES[plant.speciesId];
    if (!species) return;

    let damage = 0;

    // Overcrowding: count plants within 3 columns
    const neighbors = this.plants.filter(p =>
      p !== plant && !p.isDying && Math.abs(p.col - plant.col) <= 3
    ).length;
    if (neighbors >= 3) {
      damage += 0.05 * (neighbors - 2);
    }

    // Poor soil
    const rootDepth = this.getMaxRootDepth(species.visuals[plant.stage]);
    const soilQuality = this.soilMap.getColumnQuality(plant.col, rootDepth);
    if (soilQuality < 0.75) {
      const baseDrain = 0.02;
      damage += (plant.stage <= GrowthStage.Seedling) ? baseDrain * 2 : baseDrain;
    }

    // Winter stress (non-evergreen)
    const isEvergreen = species.id === 'holly';
    if (period.season === Season.Winter && !isEvergreen) {
      if (plant.stage <= GrowthStage.Seedling) {
        damage += 0.03;
      } else if (plant.stage === GrowthStage.Juvenile) {
        damage += 0.01;
      }
    }

    // Frost damage to young plants
    if (weather === Weather.Frost && plant.stage <= GrowthStage.Seedling) {
      damage += 0.02;
    }

    // Recovery in favorable seasons
    let recovery = 0;
    if (period.season === Season.Spring || period.season === Season.Summer) {
      recovery = 0.02;
    }

    plant.health = Math.max(0, Math.min(1, plant.health - damage + recovery));
  }

  private checkSelfSeeding(plant: PlantState, period: TimePeriod): void {
    // Only in autumn (berries/seeds fall) or spring (early flowers)
    if (period.season !== Season.Autumn && period.season !== Season.Spring) return;

    // Cap total plants
    if (this.plants.length >= MAX_PLANTS) return;

    // 5% chance per period
    if (Math.random() > 0.05) return;

    // Pick a random column offset (-4 to +4)
    const offset = Math.floor(Math.random() * 9) - 4;
    if (offset === 0) return;

    const newCol = plant.col + offset;
    if (newCol < 0 || newCol >= 200) return;
    if (this.isColumnOccupied(newCol)) return;

    this.addPlant(plant.speciesId, newCol, plant.row, 0, true);
  }

  getPlants(): ReadonlyArray<PlantState> {
    return this.plants;
  }

  getDeadPlantCount(): number {
    return this.deadPlantCount;
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

  /** Get the deepest root offset from a stage visual (max positive row offset) */
  private getMaxRootDepth(visual: { cells: Array<[number, number, unknown]> }): number {
    let maxDepth = 0;
    for (const [, rowOff] of visual.cells) {
      if (rowOff > maxDepth) maxDepth = rowOff;
    }
    return maxDepth;
  }

  // ── Save/Load ──

  /** Replace plants and dead count from save data */
  loadState(plants: PlantState[], deadPlantCount: number): void {
    this.plants = plants;
    this.deadPlantCount = deadPlantCount;
  }
}
