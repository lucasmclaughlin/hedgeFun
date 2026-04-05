// Stub — real implementation provided by hedgeKingdoms enemies data unit
import type { EnemyDef } from '@/defense/EnemySimulator';

export const ENEMIES: Record<string, EnemyDef> = {
  rat: {
    id: 'rat',
    name: 'Rat',
    hp: 10,
    speed: 1,
    damage: 1,
    char: 'r',
    fg: '#a08060',
  },
  weasel: {
    id: 'weasel',
    name: 'Weasel',
    hp: 20,
    speed: 1.5,
    damage: 2,
    char: 'w',
    fg: '#c0a060',
  },
  fox: {
    id: 'fox',
    name: 'Fox',
    hp: 40,
    speed: 0.8,
    damage: 5,
    char: 'F',
    fg: '#e06820',
  },
};

export const ENEMY_MAP: Record<string, EnemyDef> = ENEMIES;
