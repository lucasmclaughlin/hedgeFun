import {
  GrowthStage,
  CreatureBehavior,
  CreatureActivity,
  type PlantState,
  type CreatureState,
} from '@/types';
import { GrowthSimulator } from '@/simulation/GrowthSimulator';
import { CreatureSimulator } from '@/simulation/CreatureSimulator';
import { TerrainMap } from '@/simulation/TerrainMap';
import { TimeClock } from '@/simulation/TimeClock';
import { CREATURE_LIST } from '@/data/creatures';

/** Thorny + fruiting UK hedge species available in species.ts */
const HEDGE_SPECIES: string[] = [
  'hawthorn',
  'blackthorn',
  'holly',
  'hazel',
  'elder',
  'dogrose',
];

/** Defender placements — spread across the mature hedge */
interface DefenderPlacement {
  defId: string;
  col: number;
}

const DEFENDER_PLACEMENTS: DefenderPlacement[] = [
  { defId: 'hedgehog',   col: 60  },
  { defId: 'hedgehog',   col: 140 },
  { defId: 'fieldmouse', col: 40  },
  { defId: 'fieldmouse', col: 160 },
  { defId: 'wren',       col: 80  },
  { defId: 'wren',       col: 120 },
  { defId: 'robin',      col: 100 },
  { defId: 'shrew',      col: 100 },
  { defId: 'toad',       col: 70  },
  { defId: 'owl',        col: 100 },
  { defId: 'badger',     col: 130 },
];

/**
 * Seed a pre-built mature hedge and initial defender creatures so the
 * player can immediately fight in hedgeKingdoms mode.
 *
 * Plants cover cols 20–180, leaving 0–19 and 181–199 as enemy approach zones.
 */
export function seedKingdomsHedge(
  growthSim: GrowthSimulator,
  creatureSim: CreatureSimulator,
  terrainMap: TerrainMap,
  timeClock: TimeClock,
): void {
  const plantedAt = timeClock.getTotalPeriods();

  const plants: PlantState[] = [];
  const step = 3;
  for (let col = 20; col <= 180; col += step) {
    const speciesId = HEDGE_SPECIES[(col / step) % HEDGE_SPECIES.length];
    const row = terrainMap.getGroundRow(col);
    plants.push({
      speciesId,
      col,
      row,
      stage: GrowthStage.Seed,
      ticksInStage: 0,
      plantedAt,
      health: 1.0,
      isDying: false,
      deathTimer: 0,
      selfSeeded: false,
      isLaid: false,
      isCoppiced: false,
      isPollarded: false,
    });
  }

  growthSim.loadState(plants, 0, 0, 0);

  type LoadableCreature = Pick<
    CreatureState,
    'defId' | 'col' | 'row' | 'homeCol' | 'facing' | 'behavior' | 'activity'
  >;

  const creatures: LoadableCreature[] = [];
  const spawnCounts: Record<string, number> = {};

  for (const placement of DEFENDER_PLACEMENTS) {
    const def = CREATURE_LIST.find(d => d.id === placement.defId);
    if (!def) continue;

    const row = Math.floor((def.rowRange[0] + def.rowRange[1]) / 2);

    creatures.push({
      defId: def.id,
      col: placement.col,
      row,
      homeCol: placement.col,
      facing: 1,
      behavior: CreatureBehavior.Idle,
      activity: CreatureActivity.Resting,
    });

    spawnCounts[def.id] = (spawnCounts[def.id] ?? 0) + 1;
  }

  creatureSim.loadState(creatures, spawnCounts, 1);
}
