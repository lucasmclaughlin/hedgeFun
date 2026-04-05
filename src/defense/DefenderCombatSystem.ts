// Stub — real implementation provided by hedgeKingdoms DefenderCombatSystem unit
import type { EnemyInstance } from '@/defense/EnemySimulator';
import type { CreatureState } from '@/types';

export interface DefenderInfo {
  creatureId: string;
  species: string;
  attacksPerSecond: number;
}

export interface CombatEvent {
  type: 'hit-enemy' | 'alarm';
  enemyId: string;
  damage: number;
  effect: BattleEffect;
  prepBonusMs: number;
}

export interface BattleEffect {
  col: number;
  row: number;
  char: string;
  fg: string;
  durationMs: number;
}

export class DefenderCombatSystem {
  update(
    _enemies: EnemyInstance[],
    _creatures: ReadonlyArray<CreatureState>,
    _delta: number,
    _dayHourIndex: number,
  ): CombatEvent[] { return []; }

  registerCreatures(_creatures: ReadonlyArray<CreatureState>): void {}

  getDefenders(): DefenderInfo[] { return []; }
}
