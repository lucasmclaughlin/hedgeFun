import {
  GrowthStage, MilestoneCategory,
  type MilestoneDef, type BiodiversitySnapshot, type AchievedMilestone,
  type PlantState,
} from '@/types';

/** All milestone definitions */
const MILESTONES: MilestoneDef[] = [
  // ── Plant Diversity ──────────────────────────────
  {
    id: 'first_plant',
    title: 'First Roots',
    description: 'Plant your first hedgerow species',
    category: MilestoneCategory.PlantDiversity,
    points: 5,
    check: (s) => s.totalPlants >= 1,
  },
  {
    id: 'plants_5',
    title: 'Growing Hedge',
    description: 'Have 5 plants in the hedgerow',
    category: MilestoneCategory.PlantDiversity,
    points: 10,
    check: (s) => s.totalPlants >= 5,
  },
  {
    id: 'plants_10',
    title: 'Thriving Hedge',
    description: 'Have 10 plants in the hedgerow',
    category: MilestoneCategory.PlantDiversity,
    points: 15,
    check: (s) => s.totalPlants >= 10,
  },
  {
    id: 'plants_20',
    title: 'Mighty Hedge',
    description: 'Have 20 plants in the hedgerow',
    category: MilestoneCategory.PlantDiversity,
    points: 25,
    check: (s) => s.totalPlants >= 20,
  },
  {
    id: 'species_2',
    title: 'Mixed Planting',
    description: 'Plant 2 different species',
    category: MilestoneCategory.PlantDiversity,
    points: 10,
    check: (s) => s.uniquePlantSpecies >= 2,
  },
  {
    id: 'species_4',
    title: 'Diverse Hedge',
    description: 'Plant 4 different species',
    category: MilestoneCategory.PlantDiversity,
    points: 20,
    check: (s) => s.uniquePlantSpecies >= 4,
  },
  {
    id: 'species_all',
    title: 'Complete Collection',
    description: 'Plant all 6 native species',
    category: MilestoneCategory.PlantDiversity,
    points: 40,
    check: (s) => s.uniquePlantSpecies >= 6,
  },
  {
    id: 'first_mature',
    title: 'First Bloom',
    description: 'Grow a plant to full maturity',
    category: MilestoneCategory.PlantDiversity,
    points: 15,
    check: (s) => s.maturePlants >= 1,
  },
  {
    id: 'mature_5',
    title: 'Established Hedge',
    description: 'Have 5 mature plants',
    category: MilestoneCategory.PlantDiversity,
    points: 25,
    check: (s) => s.maturePlants >= 5,
  },
  {
    id: 'mature_10',
    title: 'Ancient Hedgerow',
    description: 'Have 10 mature plants',
    category: MilestoneCategory.PlantDiversity,
    points: 40,
    check: (s) => s.maturePlants >= 10,
  },
  {
    id: 'self_seed_first',
    title: 'Natural Regeneration',
    description: 'A plant has self-seeded from your hedge',
    category: MilestoneCategory.PlantDiversity,
    points: 20,
    check: (s) => s.selfSeededPlants >= 1,
  },
  {
    id: 'self_seed_5',
    title: 'Wild Hedgerow',
    description: '5 self-seeded plants growing in your hedge',
    category: MilestoneCategory.PlantDiversity,
    points: 35,
    check: (s) => s.selfSeededPlants >= 5,
  },

  // ── Layer Coverage ──────────────────────────────
  {
    id: 'layers_3',
    title: 'Vertical Structure',
    description: 'Plants occupy 3 different layers',
    category: MilestoneCategory.LayerCoverage,
    points: 20,
    check: (s) => s.occupiedLayers >= 3,
  },
  {
    id: 'layers_5',
    title: 'Full Canopy',
    description: 'Plants occupy 5 different layers',
    category: MilestoneCategory.LayerCoverage,
    points: 40,
    check: (s) => s.occupiedLayers >= 5,
  },

  // ── Creature Diversity ──────────────────────────────
  {
    id: 'first_creature',
    title: 'First Visitor',
    description: 'A creature discovers your hedge',
    category: MilestoneCategory.CreatureDiversity,
    points: 15,
    check: (s) => s.totalCreatures >= 1,
  },
  {
    id: 'creature_species_3',
    title: 'Wildlife Haven',
    description: '3 different creature species inhabit your hedge',
    category: MilestoneCategory.CreatureDiversity,
    points: 25,
    check: (s) => s.uniqueCreatureSpecies >= 3,
  },
  {
    id: 'creature_species_5',
    title: 'Biodiversity Hotspot',
    description: '5 different creature species inhabit your hedge',
    category: MilestoneCategory.CreatureDiversity,
    points: 40,
    check: (s) => s.uniqueCreatureSpecies >= 5,
  },
  {
    id: 'creature_species_8',
    title: 'Thriving Ecosystem',
    description: '8 different creature species inhabit your hedge',
    category: MilestoneCategory.CreatureDiversity,
    points: 60,
    check: (s) => s.uniqueCreatureSpecies >= 8,
  },
  {
    id: 'creature_species_12',
    title: 'Full Ecosystem',
    description: '12 different creature species inhabit your hedge',
    category: MilestoneCategory.CreatureDiversity,
    points: 80,
    check: (s) => s.uniqueCreatureSpecies >= 12,
  },
  {
    id: 'creature_species_15',
    title: 'Nature Reserve',
    description: '15 different creature species inhabit your hedge',
    category: MilestoneCategory.CreatureDiversity,
    points: 100,
    check: (s) => s.uniqueCreatureSpecies >= 15,
  },
  {
    id: 'creatures_10',
    title: 'Bustling Hedge',
    description: '10 creatures living in your hedge at once',
    category: MilestoneCategory.CreatureDiversity,
    points: 30,
    check: (s) => s.totalCreatures >= 10,
  },
  {
    id: 'creatures_20',
    title: 'Teeming with Life',
    description: '20 creatures living in your hedge at once',
    category: MilestoneCategory.CreatureDiversity,
    points: 50,
    check: (s) => s.totalCreatures >= 20,
  },
  {
    id: 'apex_predator',
    title: 'Apex Arrival',
    description: 'A raptor discovers your hedge — barn owl or red kite',
    category: MilestoneCategory.CreatureDiversity,
    points: 60,
    check: (s) => s.creatureSpeciesIds.has('barnowl') || s.creatureSpeciesIds.has('redkite'),
  },

  // ── Ecosystem Health ──────────────────────────────
  {
    id: 'sustained_5',
    title: 'Stable Population',
    description: 'Creatures living in your hedge for 5 consecutive periods',
    category: MilestoneCategory.EcosystemHealth,
    points: 20,
    check: (s) => s.creaturePeriods >= 5,
  },
  {
    id: 'sustained_20',
    title: 'Enduring Habitat',
    description: 'Creatures living in your hedge for 20 consecutive periods',
    category: MilestoneCategory.EcosystemHealth,
    points: 40,
    check: (s) => s.creaturePeriods >= 20,
  },
  {
    id: 'sustained_50',
    title: 'Living Heritage',
    description: 'Creatures living in your hedge for 50 consecutive periods',
    category: MilestoneCategory.EcosystemHealth,
    points: 60,
    check: (s) => s.creaturePeriods >= 50,
  },
  {
    id: 'circle_of_life',
    title: 'Circle of Life',
    description: 'A plant has died and been replaced by self-seeding',
    category: MilestoneCategory.EcosystemHealth,
    points: 30,
    check: (s) => s.deadPlantCount >= 1 && s.selfSeededPlants >= 1,
  },
];

const CATEGORY_NAMES: Record<MilestoneCategory, string> = {
  [MilestoneCategory.PlantDiversity]: 'Plants',
  [MilestoneCategory.LayerCoverage]: 'Layers',
  [MilestoneCategory.CreatureDiversity]: 'Creatures',
  [MilestoneCategory.EcosystemHealth]: 'Ecosystem',
};

/**
 * Tracks biodiversity milestones and score.
 * Checked once per period by the GameScene.
 */
export class BiodiversityTracker {
  private achieved: AchievedMilestone[] = [];
  private achievedIds = new Set<string>();
  /** Consecutive periods with at least one creature */
  private creaturePeriods = 0;

  /**
   * Check all milestones against current game state.
   * Returns newly achieved milestones (if any).
   */
  checkMilestones(
    plants: ReadonlyArray<PlantState>,
    uniqueCreatureSpecies: number,
    totalCreatures: number,
    currentPeriod: number,
    occupiedLayers: number,
    creatureSpeciesIds: Set<string>,
    deadPlantCount: number,
  ): MilestoneDef[] {
    // Track creature persistence
    if (totalCreatures > 0) {
      this.creaturePeriods++;
    } else {
      this.creaturePeriods = 0;
    }

    // Build snapshot
    const livingPlants = plants.filter(p => !p.isDying);
    const uniquePlantSpecies = new Set(livingPlants.map(p => p.speciesId)).size;
    const maturePlants = livingPlants.filter(p => p.stage === GrowthStage.Mature).length;
    const selfSeededPlants = livingPlants.filter(p => p.selfSeeded).length;

    const snapshot: BiodiversitySnapshot = {
      totalPlants: livingPlants.length,
      uniquePlantSpecies,
      maturePlants,
      occupiedLayers,
      totalCreatures,
      uniqueCreatureSpecies,
      creatureSpeciesIds,
      creaturePeriods: this.creaturePeriods,
      totalPeriods: currentPeriod,
      deadPlantCount,
      selfSeededPlants,
    };

    // Check unachieved milestones
    const newlyAchieved: MilestoneDef[] = [];
    for (const def of MILESTONES) {
      if (this.achievedIds.has(def.id)) continue;
      if (def.check(snapshot)) {
        this.achievedIds.add(def.id);
        this.achieved.push({ defId: def.id, achievedAtPeriod: currentPeriod });
        newlyAchieved.push(def);
      }
    }

    return newlyAchieved;
  }

  getScore(): number {
    let total = 0;
    for (const a of this.achieved) {
      const def = MILESTONES.find(m => m.id === a.defId);
      if (def) total += def.points;
    }
    return total;
  }

  getAchievedCount(): number {
    return this.achieved.length;
  }

  getTotalMilestoneCount(): number {
    return MILESTONES.length;
  }

  /** Get formatted milestone log lines for the overlay */
  getMilestoneLog(): string[] {
    const lines: string[] = [
      `== Biodiversity Milestones ==`,
      `   Score: ${this.getScore()}  (${this.achieved.length}/${MILESTONES.length})`,
      '',
    ];

    // Group by category
    for (const cat of [
      MilestoneCategory.PlantDiversity,
      MilestoneCategory.LayerCoverage,
      MilestoneCategory.CreatureDiversity,
      MilestoneCategory.EcosystemHealth,
    ]) {
      const catMilestones = MILESTONES.filter(m => m.category === cat);
      lines.push(`-- ${CATEGORY_NAMES[cat]} --`);
      for (const def of catMilestones) {
        const done = this.achievedIds.has(def.id);
        const marker = done ? '\u2713' : '\u2022';
        const pts = done ? `+${def.points}` : ` ${def.points}`;
        lines.push(`  ${marker} ${def.title} (${pts})`);
        lines.push(`    ${def.description}`);
      }
      lines.push('');
    }

    lines.push('[M] close');
    return lines;
  }

  /** Get list of achieved milestone IDs for checking done state in log */
  getAchievedIds(): Set<string> {
    return this.achievedIds;
  }

  /** Get all milestone defs — used by HUD for rendering colors */
  static getAllMilestones(): ReadonlyArray<MilestoneDef> {
    return MILESTONES;
  }

  // ── Save/Load ──

  getCreaturePeriods(): number {
    return this.creaturePeriods;
  }

  loadState(achievedIds: string[], creaturePeriods: number): void {
    this.achievedIds = new Set(achievedIds);
    this.achieved = achievedIds.map(id => ({ defId: id, achievedAtPeriod: 0 }));
    this.creaturePeriods = creaturePeriods;
  }
}
