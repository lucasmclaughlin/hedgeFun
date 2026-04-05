import { CreatureState, CreatureActivity, GRID_CONFIG } from '@/types';

// ── Local types ────────────────────────────────────────────────

export enum DefenderRole {
  Archer     = 0,
  Infantry   = 1,
  Heavy      = 2,
  Scout      = 3,
  NightRaider = 4,
  Sapper     = 5,
  Alchemist  = 6,
}

export interface DefenderState {
  creatureId: number;
  role: DefenderRole;
  hp: number;
  maxHp: number;
  attackCooldownMs: number;
  assignedCol: number | null;
  assignedRow: number | null;
}

export interface BattleEffect {
  id: number;
  type: 'arrow' | 'clash' | 'shield' | 'poison';
  col: number;
  row: number;
  targetCol: number;
  progress: number;
  durationMs: number;
  elapsedMs: number;
}

/** Enemy state — defined locally until a shared type exists */
export interface EnemyState {
  id: number;
  /** Creature def id (e.g. 'crow') */
  defId: string;
  col: number;
  row: number;
  hp: number;
  /** Current movement speed in cols/s */
  currentSpeed: number;
  /** Id of the defender currently engaged with this enemy, or null */
  engagedDefenderId: number | null;
  /** Whether this enemy is in the aerial (sky) layer */
  aerial: boolean;
}

// ── Role constants ─────────────────────────────────────────────

interface RoleConfig {
  range: number;
  damage: number;
  cooldownMs: number;
  maxHp: number;
}

const ROLE_CONFIG: Record<DefenderRole, RoleConfig> = {
  [DefenderRole.Archer]:      { range: 4,  damage: 1,   cooldownMs: 2500, maxHp: 1 },
  [DefenderRole.Infantry]:    { range: 1,  damage: 1,   cooldownMs: 1500, maxHp: 2 },
  [DefenderRole.Heavy]:       { range: 1,  damage: 2,   cooldownMs: 3000, maxHp: 4 },
  [DefenderRole.Scout]:       { range: 25, damage: 0,   cooldownMs: 0,    maxHp: 1 },
  [DefenderRole.NightRaider]: { range: 3,  damage: 3,   cooldownMs: 4000, maxHp: 3 },
  [DefenderRole.Sapper]:      { range: 0,  damage: 2,   cooldownMs: 8000, maxHp: 1 },
  [DefenderRole.Alchemist]:   { range: 2,  damage: 1,   cooldownMs: 5000, maxHp: 2 },
};

const ROLE_BY_DEF_ID: Record<string, DefenderRole> = {
  fieldmouse: DefenderRole.Archer,
  hedgehog:   DefenderRole.Infantry,
  badger:     DefenderRole.Heavy,
  wren:       DefenderRole.Scout,
  robin:      DefenderRole.Scout,
  owl:        DefenderRole.NightRaider,
  shrew:      DefenderRole.Sapper,
  toad:       DefenderRole.Alchemist,
};

const GRID_CENTRE_COL = Math.floor(GRID_CONFIG.cols / 2);
const SCOUT_ALARM_DIST = 25;
const NIGHT_RAIDER_HOURS = new Set([0, 6, 7]); // Matins, Vespers, Compline

// ── Event types ────────────────────────────────────────────────

export type DefenseEvent =
  | { type: 'hit-enemy';    enemyId: number;    damage: number; effect: BattleEffect }
  | { type: 'hit-defender'; creatureId: number; damage: number }
  | { type: 'alarm';        prepBonusMs: number };

// ── Main class ─────────────────────────────────────────────────

export class DefenderCombatSystem {
  private defenders = new Map<number, DefenderState>();
  private effectIdCounter = 0;
  private traps: Array<{ col: number; row: number; triggeredBy?: number }> = [];

  /** Tracks which enemies have already triggered the Scout alarm */
  private alertedEnemyIds = new Set<number>();
  /** Tracks infantry defenders whose first hit of an engagement is blocked */
  private infantryBlocked = new Set<number>();
  /** Tracks slow expiry per enemy: enemyId → timestampMs when slow ends */
  private slowedUntil = new Map<number, number>();
  /** Accumulated time in ms (used for slow expiry comparison) */
  private elapsedMs = 0;

  /**
   * Call once per period (when creatures list changes) to sync defender registry.
   */
  registerCreatures(creatures: CreatureState[]): void {
    const seen = new Set<number>();

    for (const c of creatures) {
      const role = ROLE_BY_DEF_ID[c.defId];
      if (role === undefined) continue;

      seen.add(c.id);

      if (!this.defenders.has(c.id)) {
        const cfg = ROLE_CONFIG[role];
        this.defenders.set(c.id, {
          creatureId:       c.id,
          role,
          hp:               cfg.maxHp,
          maxHp:            cfg.maxHp,
          attackCooldownMs: 0,
          assignedCol:      null,
          assignedRow:      null,
        });
      }
    }

    for (const id of this.defenders.keys()) {
      if (!seen.has(id)) this.defenders.delete(id);
    }
  }

  /**
   * Call every frame. Returns combat events that occurred this tick.
   * dayHourIndex: 0=Matins, 1=Lauds, 2=Prime, 3=Terce, 4=Sext, 5=None, 6=Vespers, 7=Compline
   */
  update(
    enemies: readonly EnemyState[],
    creatures: CreatureState[],
    delta: number,
    dayHourIndex: number,
  ): DefenseEvent[] {
    this.elapsedMs += delta;
    const events: DefenseEvent[] = [];

    // Prune expired slow entries
    for (const [id, until] of this.slowedUntil) {
      if (this.elapsedMs >= until) this.slowedUntil.delete(id);
    }

    const creatureById = new Map<number, CreatureState>();
    for (const c of creatures) creatureById.set(c.id, c);

    for (const def of this.defenders.values()) {
      def.attackCooldownMs = Math.max(0, def.attackCooldownMs - delta);
    }

    for (const def of this.defenders.values()) {
      if (def.hp <= 0) continue;
      const creature = creatureById.get(def.creatureId);
      if (!creature) continue;

      switch (def.role) {
        case DefenderRole.Archer:
          this.tickArcher(def, creature, enemies, events);
          break;
        case DefenderRole.Infantry:
          this.tickInfantry(def, creature, enemies, events);
          break;
        case DefenderRole.Heavy:
          this.tickHeavy(def, creature, enemies, events);
          break;
        case DefenderRole.Scout:
          this.tickScout(enemies, events);
          break;
        case DefenderRole.NightRaider:
          this.tickNightRaider(def, creature, enemies, events, dayHourIndex);
          break;
        case DefenderRole.Sapper:
          this.tickSapper(def, creature);
          break;
        case DefenderRole.Alchemist:
          this.tickAlchemist(def, creature, enemies, events);
          break;
      }
    }

    this.checkTraps(enemies, events);

    return events;
  }

  getDefenders(): ReadonlyMap<number, DefenderState> {
    return this.defenders;
  }

  /** Reset per-wave state; call at wave end. */
  onWaveComplete(): void {
    this.alertedEnemyIds.clear();
    this.infantryBlocked.clear();
  }

  private makeEffect(
    type: BattleEffect['type'],
    col: number,
    row: number,
    targetCol: number,
    durationMs: number,
  ): BattleEffect {
    return { id: ++this.effectIdCounter, type, col, row, targetCol, progress: 0, durationMs, elapsedMs: 0 };
  }

  private tickArcher(
    def: DefenderState,
    creature: CreatureState,
    enemies: readonly EnemyState[],
    events: DefenseEvent[],
  ): void {
    if (def.attackCooldownMs > 0) return;

    const target = this.findEnemy(enemies, creature.col, creature.row, 4, 1, false);
    if (!target) return;

    const effect = this.makeEffect('arrow', creature.col, creature.row, target.col, 400);
    events.push({ type: 'hit-enemy', enemyId: target.id, damage: 1, effect });
    creature.activity = CreatureActivity.Hunting;
    def.attackCooldownMs = ROLE_CONFIG[DefenderRole.Archer].cooldownMs;
  }

  private tickInfantry(
    def: DefenderState,
    creature: CreatureState,
    enemies: readonly EnemyState[],
    events: DefenseEvent[],
  ): void {
    if (def.attackCooldownMs > 0) return;

    const target = this.findEnemy(enemies, creature.col, creature.row, 1, 1, false);
    if (!target) return;

    if (!this.infantryBlocked.has(def.creatureId)) {
      this.infantryBlocked.add(def.creatureId);
      const shieldEffect = this.makeEffect('shield', creature.col, creature.row, creature.col, 300);
      events.push({ type: 'hit-enemy', enemyId: target.id, damage: 0, effect: shieldEffect });
      def.attackCooldownMs = ROLE_CONFIG[DefenderRole.Infantry].cooldownMs;
      return;
    }

    const effect = this.makeEffect('clash', target.col, target.row, target.col, 300);
    events.push({ type: 'hit-enemy', enemyId: target.id, damage: 1, effect });
    def.attackCooldownMs = ROLE_CONFIG[DefenderRole.Infantry].cooldownMs;
  }

  private tickHeavy(
    def: DefenderState,
    creature: CreatureState,
    enemies: readonly EnemyState[],
    events: DefenseEvent[],
  ): void {
    if (def.attackCooldownMs > 0) return;

    const target = this.findEnemy(enemies, creature.col, creature.row, 1, 1, false);
    if (!target) return;

    const effect = this.makeEffect('clash', target.col, target.row, target.col, 300);
    events.push({ type: 'hit-enemy', enemyId: target.id, damage: 2, effect });
    def.attackCooldownMs = ROLE_CONFIG[DefenderRole.Heavy].cooldownMs;
  }

  private tickScout(enemies: readonly EnemyState[], events: DefenseEvent[]): void {
    for (const enemy of enemies) {
      if (this.alertedEnemyIds.has(enemy.id)) continue;
      if (Math.abs(enemy.col - GRID_CENTRE_COL) <= SCOUT_ALARM_DIST) {
        this.alertedEnemyIds.add(enemy.id);
        events.push({ type: 'alarm', prepBonusMs: 3000 });
      }
    }
  }

  private tickNightRaider(
    def: DefenderState,
    creature: CreatureState,
    enemies: readonly EnemyState[],
    events: DefenseEvent[],
    dayHourIndex: number,
  ): void {
    if (!NIGHT_RAIDER_HOURS.has(dayHourIndex)) return;
    if (def.attackCooldownMs > 0) return;

    const target = this.findEnemy(enemies, creature.col, creature.row, 3, 1, true);
    if (!target) return;

    const effect = this.makeEffect('clash', target.col, target.row, target.col, 300);
    events.push({ type: 'hit-enemy', enemyId: target.id, damage: 3, effect });
    def.attackCooldownMs = ROLE_CONFIG[DefenderRole.NightRaider].cooldownMs;
  }

  private tickSapper(def: DefenderState, creature: CreatureState): void {
    if (def.attackCooldownMs > 0) return;

    if (this.traps.length >= 3) this.traps.shift();
    this.traps.push({ col: creature.col, row: creature.row });
    def.attackCooldownMs = ROLE_CONFIG[DefenderRole.Sapper].cooldownMs;
  }

  private tickAlchemist(
    def: DefenderState,
    creature: CreatureState,
    enemies: readonly EnemyState[],
    events: DefenseEvent[],
  ): void {
    if (def.attackCooldownMs > 0) return;

    const radius = 2;
    const targets = enemies.filter(
      e => Math.abs(e.col - creature.col) <= radius && Math.abs(e.row - creature.row) <= radius,
    );
    if (targets.length === 0) return;

    const effect = this.makeEffect('poison', creature.col, creature.row, creature.col, 2000);

    for (const target of targets) {
      events.push({ type: 'hit-enemy', enemyId: target.id, damage: 1, effect });
      target.currentSpeed *= 0.6;
      this.slowedUntil.set(target.id, this.elapsedMs + 3000);
    }

    def.attackCooldownMs = ROLE_CONFIG[DefenderRole.Alchemist].cooldownMs;
  }

  private checkTraps(enemies: readonly EnemyState[], events: DefenseEvent[]): void {
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const trap = this.traps[i];
      const hit = enemies.find(
        e => e.col === trap.col && e.row === trap.row && !e.aerial,
      );
      if (!hit) continue;

      const effect = this.makeEffect('clash', trap.col, trap.row, trap.col, 300);
      events.push({ type: 'hit-enemy', enemyId: hit.id, damage: 2, effect });
      hit.engagedDefenderId = -1; // -1 = stunned

      this.traps.splice(i, 1);
    }
  }

  private findEnemy(
    enemies: readonly EnemyState[],
    col: number,
    row: number,
    rangeCols: number,
    rowTolerance: number,
    aerialOnly: boolean,
  ): EnemyState | null {
    let best: EnemyState | null = null;
    let bestDist = Infinity;

    for (const e of enemies) {
      if (e.hp <= 0) continue;
      if (aerialOnly && !e.aerial) continue;
      if (!aerialOnly && e.aerial) continue;

      const colDist = Math.abs(e.col - col);
      const rowDist = Math.abs(e.row - row);
      if (colDist > rangeCols || rowDist > rowTolerance) continue;

      if (colDist < bestDist) {
        bestDist = colDist;
        best = e;
      }
    }

    return best;
  }
}
