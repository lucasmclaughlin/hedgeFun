import { type PlantState, GrowthStage, type CreatureFrame, Layer } from '@/types';

// ── EnemyDef & EnemyState (local until added to @/types) ──────────────────────

interface EnemyDef {
  id: string;
  name: string;
  layer: Layer;
  rowRange: [number, number];
  speed: number;
  maxHp: number;
  damage: number;
  attackDamage: number;
  slowedBySpecies: string[];
  frames: {
    advancing: CreatureFrame[];
    attacking: CreatureFrame[];
    fleeing: CreatureFrame[];
  };
}

interface EnemyState {
  id: number;
  defId: string;
  col: number;
  row: number;
  hp: number;
  facing: 1 | -1;
  currentSpeed: number;
  phase: 'advancing' | 'attacking' | 'fleeing';
  frameIndex: number;
  animTimer: number;
  moveTimer: number;
  engagedDefenderId: number | null;
  fleeTimer?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BREACH_MIN = 92;
const BREACH_MAX = 108;
const LEFT_SPAWN_COL = 2;
const RIGHT_SPAWN_COL = 197;
const ANIM_INTERVAL_MS = 400;
const FLEE_DURATION_MS = 800;
const SPAWN_STAGGER_MS = 300;
const MIN_SPEED_FRACTION = 0.2;

// ── Public event types ────────────────────────────────────────────────────────

export type EnemySimEvent =
  | { type: 'breached'; id: number; damage: number }
  | { type: 'defeated'; id: number };

interface SpawnEntry {
  def: EnemyDef;
  fromLeft: boolean;
  spawnAt: number; // elapsed ms when this enemy should appear
}

interface LiveEnemy extends EnemyState {
  _def: EnemyDef;
}

export class EnemySimulator {
  private enemies: LiveEnemy[] = [];
  private nextId = 1;
  private waveFromLeft = true;
  private spawnQueue: SpawnEntry[] = [];
  private elapsedMs = 0;

  /**
   * Spawn a new wave. Enemies alternate sides; which side leads alternates
   * each call.
   */
  spawn(defs: EnemyDef[]): void {
    const leadLeft = this.waveFromLeft;
    this.waveFromLeft = !this.waveFromLeft;

    defs.forEach((def, i) => {
      const fromLeft = i % 2 === 0 ? leadLeft : !leadLeft;
      this.spawnQueue.push({
        def,
        fromLeft,
        spawnAt: this.elapsedMs + i * SPAWN_STAGGER_MS,
      });
    });
  }

  /** Update all enemies. Returns breach/defeat events. */
  update(delta: number, plants: readonly PlantState[]): EnemySimEvent[] {
    this.elapsedMs += delta;
    const events: EnemySimEvent[] = [];

    for (let i = this.spawnQueue.length - 1; i >= 0; i--) {
      const entry = this.spawnQueue[i];
      if (this.elapsedMs >= entry.spawnAt) {
        this.enemies.push(this.createEnemy(entry.def, entry.fromLeft));
        this.spawnQueue.splice(i, 1);
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.phase === 'fleeing') {
        this.tickFlee(e, delta);
        if ((e.fleeTimer ?? 0) <= 0) {
          this.enemies.splice(i, 1);
        }
        continue;
      }

      e.animTimer += delta;
      if (e.animTimer >= ANIM_INTERVAL_MS) {
        const frameCount = Math.max(e._def.frames.advancing.length, 1);
        e.frameIndex = (e.frameIndex + 1) % frameCount;
        e.animTimer -= ANIM_INTERVAL_MS;
      }

      e.currentSpeed = this.calcSpeed(e._def, e, plants);

      e.moveTimer += delta;
      const msPerCol = 1000 / Math.max(e.currentSpeed, 0.01);
      if (e.moveTimer >= msPerCol) {
        e.col += e.facing;
        e.moveTimer -= msPerCol;
      }

      if (e.col >= BREACH_MIN && e.col <= BREACH_MAX) {
        events.push({ type: 'breached', id: e.id, damage: e._def.damage });
        e.phase = 'fleeing';
        e.fleeTimer = FLEE_DURATION_MS;
        continue;
      }

      if (e.hp <= 0) {
        events.push({ type: 'defeated', id: e.id });
        e.phase = 'fleeing';
        e.fleeTimer = FLEE_DURATION_MS;
      }
    }

    return events;
  }

  applyDamage(enemyId: number, amount: number): void {
    const e = this.enemies.find(en => en.id === enemyId);
    if (e) e.hp -= amount;
  }

  getEnemies(): readonly EnemyState[] {
    return this.enemies;
  }

  getRemainingCount(): number {
    return this.enemies.filter(e => e.phase === 'advancing').length;
  }

  clear(): void {
    this.enemies = [];
    this.spawnQueue = [];
    this.elapsedMs = 0;
    this.nextId = 1;
  }

  private createEnemy(def: EnemyDef, fromLeft: boolean): LiveEnemy {
    const col = fromLeft ? LEFT_SPAWN_COL : RIGHT_SPAWN_COL;
    const facing: 1 | -1 = fromLeft ? 1 : -1;
    const row = Math.round((def.rowRange[0] + def.rowRange[1]) / 2);
    return {
      id: this.nextId++,
      defId: def.id,
      col,
      row,
      hp: def.maxHp,
      facing,
      currentSpeed: def.speed,
      phase: 'advancing',
      frameIndex: 0,
      animTimer: 0,
      moveTimer: 0,
      engagedDefenderId: null,
      _def: def,
    };
  }

  private tickFlee(e: LiveEnemy, delta: number): void {
    e.fleeTimer = (e.fleeTimer ?? 0) - delta;
    e.moveTimer += delta;
    const msPerCol = 1000 / Math.max(e.currentSpeed, 0.01);
    if (e.moveTimer >= msPerCol) {
      e.col -= e.facing; // retreat toward spawn edge
      e.moveTimer -= msPerCol;
    }
  }

  /**
   * Calculate movement speed for an enemy, slowed by hedgerow plants
   * found in the 3 cols directly ahead.
   */
  private calcSpeed(def: EnemyDef, e: EnemyState, plants: readonly PlantState[]): number {
    let speed = def.speed;

    for (let offset = 1; offset <= 3; offset++) {
      const scanCol = e.col + e.facing * offset;
      for (const plant of plants) {
        if (plant.col !== scanCol) continue;
        if (plant.row < def.rowRange[0] || plant.row > def.rowRange[1]) continue;
        if (!def.slowedBySpecies.includes(plant.speciesId)) continue;

        if (plant.stage === GrowthStage.Juvenile) {
          speed *= 0.7;
        } else if (plant.stage === GrowthStage.Mature) {
          speed *= plant.isLaid ? 0.4 : 0.6;
        }
      }
    }

    return Math.max(speed, def.speed * MIN_SPEED_FRACTION);
  }
}
