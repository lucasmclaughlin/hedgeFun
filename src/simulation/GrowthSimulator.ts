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
  /** Cumulative count of prune actions */
  private pruneCount = 0;
  /** Cumulative count of lay actions */
  private layCount = 0;

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
      isLaid: false,
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

      // Laid plants regrow vigorously even from winter cuts — no winter dormancy check
      const isLaid = plant.isLaid ?? false;

      // Seeds don't grow in winter (except holly or laid plants)
      if (plant.stage === GrowthStage.Seed && period.season === Season.Winter && species.id !== 'holly' && !isLaid) {
        continue;
      }

      // Seasonal growth modifier
      let modifier = species.growthRate;
      if (species.plantableSeasons.includes(period.season)) {
        modifier *= 1.5; // favorable season boost
      }
      if (period.season === Season.Winter && species.id !== 'holly') {
        // Laid plants regrow from established roots — much less winter slowdown
        modifier *= isLaid ? 0.9 : 0.5;
      }

      // Laid plants regrow 2× faster — the root system is already established
      if (isLaid) {
        modifier *= 2.0;
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

    const isLaid = plant.isLaid ?? false;

    let damage = 0;

    // Overcrowding: count plants within 3 columns
    // Laid plants tolerate crowding — their dense base is a feature, not a problem
    const neighbors = this.plants.filter(p =>
      p !== plant && !p.isDying && Math.abs(p.col - plant.col) <= 3
    ).length;
    if (neighbors >= 3) {
      const crowdingDamage = 0.05 * (neighbors - 2);
      damage += isLaid ? crowdingDamage * 0.3 : crowdingDamage;
    }

    // Poor soil
    const rootDepth = this.getMaxRootDepth(species.visuals[plant.stage]);
    const soilQuality = this.soilMap.getColumnQuality(plant.col, rootDepth);
    if (soilQuality < 0.75) {
      const baseDrain = 0.02;
      // Laid plants have deep, established roots — less sensitive to poor soil
      const soilDamage = (plant.stage <= GrowthStage.Seedling) ? baseDrain * 2 : baseDrain;
      damage += isLaid ? soilDamage * 0.5 : soilDamage;
    }

    // Winter stress (non-evergreen)
    // Laid plants are cut at the ideal time — winter stress is greatly reduced
    const isEvergreen = species.id === 'holly';
    if (period.season === Season.Winter && !isEvergreen) {
      if (plant.stage <= GrowthStage.Seedling) {
        damage += isLaid ? 0.005 : 0.03;
      } else if (plant.stage === GrowthStage.Juvenile) {
        damage += isLaid ? 0.002 : 0.01;
      }
    }

    // Frost damage to young plants — laid plants are adapted to winter conditions
    if (weather === Weather.Frost && plant.stage <= GrowthStage.Seedling) {
      damage += isLaid ? 0.004 : 0.02;
    }

    // Recovery in favorable seasons — laid plants recover more vigorously
    let recovery = 0;
    if (period.season === Season.Spring || period.season === Season.Summer) {
      recovery = isLaid ? 0.05 : 0.02;
    }

    plant.health = Math.max(0, Math.min(1, plant.health - damage + recovery));
  }

  private checkSelfSeeding(plant: PlantState, period: TimePeriod): void {
    // Only in autumn (berries/seeds fall) or spring (early flowers)
    if (period.season !== Season.Autumn && period.season !== Season.Spring) return;

    // Cap total plants
    if (this.plants.length >= MAX_PLANTS) return;

    // Laid plants self-seed slightly more (denser, healthier)
    const seedChance = (plant.isLaid ?? false) ? 0.08 : 0.05;
    if (Math.random() > seedChance) return;

    // Pick a random column offset (-4 to +4)
    const offset = Math.floor(Math.random() * 9) - 4;
    if (offset === 0) return;

    const newCol = plant.col + offset;
    if (newCol < 0 || newCol >= 200) return;
    if (this.isColumnOccupied(newCol)) return;

    this.addPlant(plant.speciesId, newCol, plant.row, 0, true);
  }

  /**
   * Lay a hedge plant at the given column.
   * Requires: Winter season AND the plant must be Mature.
   * Laying resets the plant to Seedling with full health and the isLaid flag,
   * which grants permanent bonuses to growth speed, winter hardiness, longevity,
   * crowding tolerance, and ground-layer habitat density.
   */
  layHedge(col: number, season: Season): string | null {
    const idx = this.plants.findIndex(p => p.col === col && !p.isDying);
    if (idx === -1) return null;

    if (season !== Season.Winter) {
      return 'not-winter';
    }

    const plant = this.plants[idx];

    if (plant.stage !== GrowthStage.Mature) {
      return 'not-mature';
    }

    this.layCount++;
    plant.isLaid = true;
    plant.stage = GrowthStage.Seedling;
    plant.ticksInStage = 0;
    plant.health = 1.0; // laying stimulates vigorous regrowth

    return 'laid';
  }

  /**
   * Prune the plant in the given column.
   * - Mature → reverts to Juvenile, health restored to 0.8
   * - Juvenile → reverts to Seedling, health restored to 0.9
   * - Seedling / Seed → removed entirely
   * Returns a description of what happened, or null if no plant found.
   */
  prunePlant(col: number): string | null {
    const idx = this.plants.findIndex(p => p.col === col && !p.isDying);
    if (idx === -1) return null;

    const plant = this.plants[idx];

    this.pruneCount++;

    if (plant.stage === GrowthStage.Mature || plant.stage === GrowthStage.Juvenile) {
      const wasStage = plant.stage;
      plant.stage = wasStage === GrowthStage.Mature ? GrowthStage.Juvenile : GrowthStage.Seedling;
      plant.ticksInStage = 0;
      plant.health = plant.stage === GrowthStage.Seedling ? 0.9 : 0.8;
      return plant.stage === GrowthStage.Seedling ? 'cut back to seedling' : 'cut back to juvenile';
    } else {
      // Seed or Seedling — pull it up entirely
      this.plants.splice(idx, 1);
      return 'uprooted';
    }
  }

  getPlants(): ReadonlyArray<PlantState> {
    return this.plants;
  }

  getDeadPlantCount(): number {
    return this.deadPlantCount;
  }

  getPruneCount(): number {
    return this.pruneCount;
  }

  getLayCount(): number {
    return this.layCount;
  }

  isColumnOccupied(col: number): boolean {
    return this.plants.some(p => p.col === col && !p.isDying);
  }

  /** Find the plant that occupies a given cell (if any), checking species visuals */
  getPlantAtCell(col: number, row: number): PlantState | null {
    for (const plant of this.plants) {
      // Laid plants use wider custom visuals at every stage
      if (plant.isLaid ?? false) {
        // Mature laid: 7-wide base (-3..+3), 5 rows tall above ground (-4..+2)
        // Juvenile laid: 5-wide (-2..+2), 4 tall (-2..+2)
        // Seedling laid: 5-wide (-2..+2), 3 tall (-1..+2)
        const halfW = plant.stage === GrowthStage.Mature ? 3 : 2;
        const topRow = plant.stage === GrowthStage.Mature ? -4 :
                       plant.stage === GrowthStage.Juvenile ? -2 : -1;
        if (Math.abs(plant.col - col) <= halfW &&
            row >= plant.row + topRow && row <= plant.row + 2) {
          return plant;
        }
        continue;
      }
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

  loadState(plants: PlantState[], deadPlantCount: number, pruneCount = 0, layCount = 0): void {
    // Ensure isLaid field exists on loaded plants (backward compat)
    this.plants = plants.map(p => ({ ...p, isLaid: p.isLaid ?? false }));
    this.deadPlantCount = deadPlantCount;
    this.pruneCount = pruneCount;
    this.layCount = layCount;
  }
}
