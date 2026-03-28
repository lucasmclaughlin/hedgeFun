import {
  Season, CreatureBehavior, CreatureActivity, MovementPattern, WinterBehavior, GRID_CONFIG,
  type TimePeriod, type CreatureState, type CreatureDef, type PlantState,
} from '@/types';
import { CREATURE_LIST } from '@/data/creatures';
import { HabitatScorer } from './HabitatScorer';

/** Simple seeded random from two ints */
function hash(a: number, b: number): number {
  let h = a * 374761393 + b * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

/**
 * Manages creature lifecycle: spawning, movement, seasonal behavior.
 * Ticked once per period for spawning, per-frame for animation/movement.
 */
export class CreatureSimulator {
  private creatures: CreatureState[] = [];
  private scorer: HabitatScorer;
  private nextId = 1;
  /** Tracks which creature defs have been spawned (id → count) */
  private spawnCounts: Map<string, number> = new Map();
  /** Pending spawns: [defId, delay remaining in periods] */
  private pendingSpawns: Array<[string, number]> = [];

  constructor(scorer: HabitatScorer) {
    this.scorer = scorer;
  }

  /** Called once per period — evaluate habitat and potentially spawn creatures */
  onPeriodAdvance(period: TimePeriod, plants: ReadonlyArray<PlantState>): void {
    this.scorer.evaluate(plants);

    // Handle seasonal behavior for existing creatures
    this.handleSeasonalBehavior(period.season);

    // Tick pending spawns
    for (let i = this.pendingSpawns.length - 1; i >= 0; i--) {
      this.pendingSpawns[i][1]--;
      if (this.pendingSpawns[i][1] <= 0) {
        this.spawnCreature(this.pendingSpawns[i][0], plants);
        this.pendingSpawns.splice(i, 1);
      }
    }

    // Check for new spawns
    for (const def of CREATURE_LIST) {
      if (!this.scorer.canSupport(def)) continue;

      const count = this.spawnCounts.get(def.id) ?? 0;
      // Max creatures per species based on rarity (rarer = fewer)
      const maxCount = Math.ceil(def.rarity / 3);
      if (count >= maxCount) continue;

      // Already pending?
      if (this.pendingSpawns.some(([id]) => id === def.id)) continue;

      // Seasonal check: don't spawn hibernating creatures in winter
      if (def.winterBehavior === WinterBehavior.Hibernate && period.season === Season.Winter) continue;
      if (def.winterBehavior === WinterBehavior.Migrate && (period.season === Season.Winter || period.season === Season.Autumn)) continue;

      // Spawn with random delay (1-3 periods)
      const delay = 1 + Math.floor(Math.random() * 3);
      this.pendingSpawns.push([def.id, delay]);
    }
  }

  /** Called per-frame — animate and move creatures */
  updateCreatures(delta: number): void {
    for (const creature of this.creatures) {
      if (creature.behavior === CreatureBehavior.Sleeping) continue;

      // Animation timer
      creature.animTimer += delta;
      if (creature.animTimer > 400) {
        creature.animTimer = 0;
        const def = this.getCreatureDef(creature.defId);
        if (def) {
          const frames = def.frames[creature.behavior];
          creature.frameIndex = (creature.frameIndex + 1) % frames.length;
        }
      }

      // Movement timer
      creature.moveTimer += delta;
      const def = this.getCreatureDef(creature.defId);
      if (!def) continue;

      const moveInterval = this.getMoveInterval(def);

      if (creature.moveTimer > moveInterval) {
        creature.moveTimer = 0;
        this.moveCreature(creature, def);
      }
    }
  }

  getCreatures(): ReadonlyArray<CreatureState> {
    return this.creatures;
  }

  /** Get the CreatureDef for a creature state */
  getCreatureDef(defId: string): CreatureDef | undefined {
    return CREATURE_LIST.find(d => d.id === defId);
  }

  getUniqueSpeciesCount(): number {
    const ids = new Set(this.creatures.map(c => c.defId));
    return ids.size;
  }

  getTotalCount(): number {
    return this.creatures.length;
  }

  /** Find creature at a specific cell (for hover) */
  getCreatureAtCell(col: number, row: number): CreatureState | null {
    for (const creature of this.creatures) {
      const def = this.getCreatureDef(creature.defId);
      if (!def) continue;
      const frames = def.frames[creature.behavior];
      const frame = frames[creature.frameIndex % frames.length];
      for (const [cOff, rOff] of frame.cells) {
        const fc = creature.facing < 0 ? -cOff : cOff;
        if (creature.col + fc === col && creature.row + rOff === row) {
          return creature;
        }
      }
    }
    return null;
  }

  private spawnCreature(defId: string, plants: ReadonlyArray<PlantState>): void {
    const def = CREATURE_LIST.find(d => d.id === defId);
    if (!def) return;

    // Pick a home plant column
    const homeCol = this.pickHomeColumn(def, plants);
    if (homeCol < 0) return;

    // Pick a row within the creature's range
    const row = def.rowRange[0] + Math.floor(Math.random() * (def.rowRange[1] - def.rowRange[0] + 1));

    const idleActs = def.idleActivities;
    const creature: CreatureState = {
      defId,
      col: homeCol,
      row,
      behavior: CreatureBehavior.Idle,
      activity: idleActs[Math.floor(Math.random() * idleActs.length)],
      frameIndex: 0,
      animTimer: 0,
      moveTimer: Math.random() * 1000, // stagger initial movement
      homeCol,
      facing: Math.random() < 0.5 ? 1 : -1,
      id: this.nextId++,
    };

    this.creatures.push(creature);
    this.spawnCounts.set(defId, (this.spawnCounts.get(defId) ?? 0) + 1);
  }

  private pickHomeColumn(def: CreatureDef, plants: ReadonlyArray<PlantState>): number {
    // Prefer columns with attractor species, otherwise pick a random planted column
    const attractors: number[] = [];
    const anyPlanted: number[] = [];

    for (const plant of plants) {
      anyPlanted.push(plant.col);
      if (def.habitat.attractedBySpecies?.includes(plant.speciesId)) {
        attractors.push(plant.col);
      }
    }

    const pool = attractors.length > 0 ? attractors : anyPlanted;
    if (pool.length === 0) return -1;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private handleSeasonalBehavior(season: Season): void {
    for (let i = this.creatures.length - 1; i >= 0; i--) {
      const creature = this.creatures[i];
      const def = this.getCreatureDef(creature.defId);
      if (!def) continue;

      if (season === Season.Winter && def.winterBehavior === WinterBehavior.Hibernate) {
        creature.behavior = CreatureBehavior.Sleeping;
        creature.activity = CreatureActivity.Hibernating;
        creature.frameIndex = 0;
      } else if ((season === Season.Autumn || season === Season.Winter) && def.winterBehavior === WinterBehavior.Migrate) {
        // Remove migrating creatures
        this.spawnCounts.set(creature.defId, Math.max(0, (this.spawnCounts.get(creature.defId) ?? 1) - 1));
        this.creatures.splice(i, 1);
        continue;
      } else if (creature.behavior === CreatureBehavior.Sleeping) {
        // Wake up from hibernation
        creature.behavior = CreatureBehavior.Idle;
        creature.activity = def.idleActivities[Math.floor(Math.random() * def.idleActivities.length)];
        creature.frameIndex = 0;
      }
    }
  }

  private moveCreature(creature: CreatureState, def: CreatureDef): void {
    const pattern = def.movement;

    // Chance to switch between idle and moving
    if (creature.behavior === CreatureBehavior.Idle) {
      const moveChance = pattern === MovementPattern.Flit ? 0.7
        : pattern === MovementPattern.Hop ? 0.5
        : pattern === MovementPattern.Soar ? 0.4
        : pattern === MovementPattern.Burrow ? 0.2
        : 0.35;

      if (Math.random() < moveChance) {
        creature.behavior = CreatureBehavior.Moving;
        creature.frameIndex = 0;
        // Pick a moving activity
        const acts = def.movingActivities;
        creature.activity = acts[Math.floor(Math.random() * acts.length)];
        // Pick new direction
        if (Math.random() < 0.3) {
          creature.facing *= -1;
        }
      }
      return;
    }

    // Moving — advance position
    const step = pattern === MovementPattern.Flit ? 2
      : pattern === MovementPattern.Hop ? 1
      : pattern === MovementPattern.Soar ? 1
      : 1;

    const newCol = creature.col + creature.facing * step;

    // Stay within home range and grid bounds
    const distFromHome = Math.abs(newCol - creature.homeCol);
    if (distFromHome > def.homeRange || newCol < 0 || newCol >= GRID_CONFIG.cols) {
      creature.facing *= -1;
      creature.behavior = CreatureBehavior.Idle;
      creature.activity = def.idleActivities[Math.floor(Math.random() * def.idleActivities.length)];
      creature.frameIndex = 0;
      return;
    }

    creature.col = newCol;

    // Vertical wobble for flying/underground creatures
    if (pattern === MovementPattern.Soar || pattern === MovementPattern.Flit) {
      if (Math.random() < 0.3) {
        const newRow = creature.row + (Math.random() < 0.5 ? -1 : 1);
        if (newRow >= def.rowRange[0] && newRow <= def.rowRange[1]) {
          creature.row = newRow;
        }
      }
    }

    // Chance to stop
    const stopChance = pattern === MovementPattern.Flit ? 0.2
      : pattern === MovementPattern.Hop ? 0.5
      : pattern === MovementPattern.Soar ? 0.15
      : pattern === MovementPattern.Burrow ? 0.6
      : 0.4;

    if (Math.random() < stopChance) {
      creature.behavior = CreatureBehavior.Idle;
      creature.activity = def.idleActivities[Math.floor(Math.random() * def.idleActivities.length)];
      creature.frameIndex = 0;
    }
  }

  private getMoveInterval(def: CreatureDef): number {
    // Base interval inversely proportional to speed (in ms)
    const base = 1000 / def.speed;
    switch (def.movement) {
      case MovementPattern.Flit: return base * 0.5;
      case MovementPattern.Hop: return base * 0.8;
      case MovementPattern.Soar: return base * 1.2;
      case MovementPattern.Burrow: return base * 1.5;
      default: return base;
    }
  }
}
