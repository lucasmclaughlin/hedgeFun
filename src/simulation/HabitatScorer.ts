import { GrowthStage, Layer, type PlantState, type CreatureDef } from '@/types';
import { SPECIES } from '@/data/species';

/** Per-layer habitat score used by creature spawning */
export interface LayerScore {
  plantCount: number;
  maturePlantCount: number;
  speciesIds: Set<string>;
}

/**
 * Evaluates the hedge to determine which layers can support which creatures.
 * Scanned once per period by the CreatureSimulator.
 */
export class HabitatScorer {
  /** Layer → which planted species occupy that layer (via matureLayers) */
  private layerScores: Map<Layer, LayerScore> = new Map();
  private totalSpecies = new Set<string>();

  /** Rebuild scores from current plant state */
  evaluate(plants: ReadonlyArray<PlantState>): void {
    this.layerScores.clear();
    this.totalSpecies.clear();

    for (const plant of plants) {
      const species = SPECIES[plant.speciesId];
      if (!species) continue;

      this.totalSpecies.add(plant.speciesId);

      // A plant contributes to layers based on its species definition
      // even before mature (seedlings contribute to ground/lower layers)
      const layers = this.getContributingLayers(plant);

      for (const layer of layers) {
        let score = this.layerScores.get(layer);
        if (!score) {
          score = { plantCount: 0, maturePlantCount: 0, speciesIds: new Set() };
          this.layerScores.set(layer, score);
        }
        score.plantCount++;
        score.speciesIds.add(plant.speciesId);
        if (plant.stage === GrowthStage.Mature) {
          score.maturePlantCount++;
        }
      }
    }
  }

  /** Check if a creature's habitat requirements are met */
  canSupport(def: CreatureDef): boolean {
    const req = def.habitat;

    // Sky creatures use overall hedge metrics — plants don't grow in the sky
    if (def.layer === Layer.Sky) {
      const totals = this.getTotals();
      if (totals.plantCount < req.minPlants) return false;
      if (totals.maturePlantCount < req.minMaturePlants) return false;
      if (this.totalSpecies.size < req.minSpeciesDiversity) return false;
      if (req.attractedBySpecies && req.attractedBySpecies.length > 0) {
        if (!req.attractedBySpecies.some(s => this.totalSpecies.has(s))) return false;
      }
      return true;
    }

    const score = this.layerScores.get(def.layer);

    if (!score) {
      // No plants at this layer — still might pass if minPlants is 0
      return req.minPlants <= 0 && req.minMaturePlants <= 0 && req.minSpeciesDiversity <= this.totalSpecies.size;
    }

    if (score.plantCount < req.minPlants) return false;
    if (score.maturePlantCount < req.minMaturePlants) return false;
    if (this.totalSpecies.size < req.minSpeciesDiversity) return false;

    // If attracted by specific species, at least one must be present
    if (req.attractedBySpecies && req.attractedBySpecies.length > 0) {
      const hasAttractor = req.attractedBySpecies.some(s => this.totalSpecies.has(s));
      if (!hasAttractor) return false;
    }

    return true;
  }

  /** Sum plant/mature counts across all layers */
  private getTotals(): { plantCount: number; maturePlantCount: number } {
    let plantCount = 0;
    let maturePlantCount = 0;
    for (const score of this.layerScores.values()) {
      plantCount += score.plantCount;
      maturePlantCount += score.maturePlantCount;
    }
    return { plantCount, maturePlantCount };
  }

  getLayerScore(layer: Layer): LayerScore | undefined {
    return this.layerScores.get(layer);
  }

  getTotalSpeciesCount(): number {
    return this.totalSpecies.size;
  }

  /** Count how many distinct layers have at least one plant */
  getOccupiedLayerCount(): number {
    return this.layerScores.size;
  }

  /** Determine which layers a plant contributes to based on stage */
  private getContributingLayers(plant: PlantState): Layer[] {
    const species = SPECIES[plant.speciesId];
    if (!species) return [];

    // All plants contribute to ground layer at minimum
    const layers = new Set<Layer>([Layer.Ground]);

    // Juvenile+ contribute to lower shrub
    if (plant.stage >= GrowthStage.Juvenile) {
      layers.add(Layer.LowerShrub);
    }

    // Mature plants contribute to their defined matureLayers
    if (plant.stage === GrowthStage.Mature) {
      for (const l of species.matureLayers) {
        layers.add(l);
      }
    }

    // Underground always gets credit (roots)
    layers.add(Layer.Underground);

    return [...layers];
  }
}
