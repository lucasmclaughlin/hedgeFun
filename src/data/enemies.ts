import { Layer, type EnemyDef } from '@/types';

export const ENEMIES: Record<string, EnemyDef> = {
  rat: {
    id: 'rat',
    name: 'Rat',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.2,
    maxHp: 2,
    damage: 1,
    attackDamage: 1,
    slowedBySpecies: ['bramble'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'r', fg: '#a08060' }], [1, 0, { char: '>', fg: '#806040' }]] },
        { cells: [[0, 0, { char: 'r', fg: '#907050' }], [1, 0, { char: '-', fg: '#806040' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'r', fg: '#a08060' }], [1, 0, { char: '*', fg: '#e0c040' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#806040' }], [1, 0, { char: 'r', fg: '#a08060' }]] },
      ],
    },
  },

  weasel: {
    id: 'weasel',
    name: 'Weasel',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.6,
    maxHp: 2,
    damage: 1,
    attackDamage: 1,
    slowedBySpecies: ['blackthorn', 'bramble'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'w', fg: '#c0a060' }], [1, 0, { char: '>', fg: '#a08040' }]] },
        { cells: [[0, 0, { char: 'w', fg: '#b09050' }], [1, 0, { char: '-', fg: '#a08040' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'w', fg: '#c0a060' }], [1, 0, { char: '*', fg: '#e0c040' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#a08040' }], [1, 0, { char: 'w', fg: '#c0a060' }]] },
      ],
    },
  },

  stoat: {
    id: 'stoat',
    name: 'Stoat',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.8,
    maxHp: 2,
    damage: 1,
    attackDamage: 2,
    slowedBySpecies: ['blackthorn', 'hawthorn'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 's', fg: '#ba8a4a' }], [1, 0, { char: '>', fg: '#9a6a2a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#aa7a3a' }], [1, 0, { char: '-', fg: '#9a6a2a' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 's', fg: '#ba8a4a' }], [1, 0, { char: '*', fg: '#e0c040' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#9a6a2a' }], [1, 0, { char: 's', fg: '#ba8a4a' }]] },
      ],
    },
  },

  crow: {
    id: 'crow',
    name: 'Crow',
    layer: Layer.Sky,
    rowRange: [2, 5],
    speed: 2.2,
    maxHp: 2,
    damage: 1,
    attackDamage: 1,
    slowedBySpecies: [],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'k', fg: '#202028' }], [1, 0, { char: '>', fg: '#404048' }]] },
        { cells: [[0, 0, { char: 'k', fg: '#303038' }], [1, 0, { char: '-', fg: '#404048' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'k', fg: '#202028' }], [1, 0, { char: '*', fg: '#e0c040' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#404048' }], [1, 0, { char: 'k', fg: '#202028' }]] },
      ],
    },
  },

  fox_enemy: {
    id: 'fox_enemy',
    name: 'Fox Raider',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.0,
    maxHp: 6,
    damage: 2,
    attackDamage: 3,
    slowedBySpecies: ['blackthorn', 'hawthorn', 'holly'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'F', fg: '#e06820' }], [1, 0, { char: '>', fg: '#c04810' }]] },
        { cells: [[0, 0, { char: 'F', fg: '#d05818' }], [1, 0, { char: '-', fg: '#c04810' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'F', fg: '#e06820' }], [1, 0, { char: '*', fg: '#ffd050' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#c04810' }], [1, 0, { char: 'F', fg: '#e06820' }]] },
      ],
    },
  },

  bandit_rat: {
    id: 'bandit_rat',
    name: 'Bandit Rat',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.4,
    maxHp: 2,
    damage: 1,
    attackDamage: 1,
    slowedBySpecies: ['blackthorn', 'bramble'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'R', fg: '#e04040' }], [1, 0, { char: '>', fg: '#a02020' }]] },
        { cells: [[0, 0, { char: 'R', fg: '#c03030' }], [1, 0, { char: '-', fg: '#a02020' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'R', fg: '#e04040' }], [1, 0, { char: '*', fg: '#ffd050' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#a02020' }], [1, 0, { char: 'R', fg: '#e04040' }]] },
      ],
    },
  },

  raider_crow: {
    id: 'raider_crow',
    name: 'Raider Crow',
    layer: Layer.Sky,
    rowRange: [2, 5],
    speed: 2.0,
    maxHp: 3,
    damage: 2,
    attackDamage: 2,
    slowedBySpecies: [],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'K', fg: '#4a4a58' }], [1, 0, { char: '>', fg: '#2a2a38' }]] },
        { cells: [[0, 0, { char: 'K', fg: '#3a3a48' }], [1, 0, { char: '-', fg: '#2a2a38' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'K', fg: '#4a4a58' }], [1, 0, { char: '*', fg: '#ffd050' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#2a2a38' }], [1, 0, { char: 'K', fg: '#4a4a58' }]] },
      ],
    },
  },

  army_stoat: {
    id: 'army_stoat',
    name: 'Army Stoat',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.2,
    maxHp: 3,
    damage: 2,
    attackDamage: 2,
    slowedBySpecies: ['blackthorn', 'hawthorn', 'holly'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'S', fg: '#c8c090' }], [1, 0, { char: '#', fg: '#a8a070' }]] },
        { cells: [[0, 0, { char: 'S', fg: '#b8b080' }], [1, 0, { char: '#', fg: '#988060' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'S', fg: '#c8c090' }], [1, 0, { char: '*', fg: '#ffd050' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#a8a070' }], [1, 0, { char: 'S', fg: '#c8c090' }]] },
      ],
    },
  },

  warlord_fox: {
    id: 'warlord_fox',
    name: 'Warlord Fox',
    layer: Layer.Ground,
    rowRange: [19, 20],
    speed: 0.7,
    maxHp: 12,
    damage: 3,
    attackDamage: 4,
    slowedBySpecies: ['blackthorn', 'hawthorn', 'holly', 'bramble'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'W', fg: '#a03020' }], [1, 0, { char: '=', fg: '#c84028' }]] },
        { cells: [[0, 0, { char: 'W', fg: '#902010' }], [1, 0, { char: '=', fg: '#b83018' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: 'W', fg: '#a03020' }], [1, 0, { char: '*', fg: '#ffd050' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '<', fg: '#c84028' }], [1, 0, { char: 'W', fg: '#a03020' }]] },
      ],
    },
  },
};

export const ENEMY_MAP: Record<string, EnemyDef> = ENEMIES;
