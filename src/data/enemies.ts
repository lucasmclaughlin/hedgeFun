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
    slowedBySpecies: ['blackthorn', 'bramble', 'hawthorn'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'r', fg: '#c87040' }], [-1, 0, { char: '>', fg: '#c87040' }]] },
        { cells: [[0, 0, { char: 'r', fg: '#b86030' }], [-1, 0, { char: '-', fg: '#b86030' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: '*', fg: '#ff8040' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: 'r', fg: '#c87040' }], [1, 0, { char: '<', fg: '#c87040' }]] },
        { cells: [[0, 0, { char: 'r', fg: '#b86030' }], [1, 0, { char: '-', fg: '#b86030' }]] },
      ],
    },
  },

  weasel: {
    id: 'weasel',
    name: 'Weasel',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 2.2,
    maxHp: 1,
    damage: 1,
    attackDamage: 1,
    slowedBySpecies: ['blackthorn', 'hawthorn'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'w', fg: '#c8a870' }], [-1, 0, { char: '>', fg: '#c8a870' }]] },
        { cells: [[0, 0, { char: 'w', fg: '#b89860' }], [-1, 0, { char: '-', fg: '#b89860' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: '*', fg: '#ffc080' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: 'w', fg: '#c8a870' }], [1, 0, { char: '<', fg: '#c8a870' }]] },
        { cells: [[0, 0, { char: 'w', fg: '#b89860' }], [1, 0, { char: '-', fg: '#b89860' }]] },
      ],
    },
  },

  stoat: {
    id: 'stoat',
    name: 'Stoat',
    layer: Layer.Ground,
    rowRange: [20, 20],
    speed: 1.5,
    maxHp: 1,
    damage: 1,
    attackDamage: 1,
    slowedBySpecies: ['blackthorn', 'hawthorn', 'holly'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 's', fg: '#d4b88a' }], [-1, 0, { char: '>', fg: '#d4b88a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#c4a87a' }], [-1, 0, { char: '-', fg: '#c4a87a' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: '*', fg: '#ffe0a0' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: 's', fg: '#d4b88a' }], [1, 0, { char: '<', fg: '#d4b88a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#c4a87a' }], [1, 0, { char: '-', fg: '#c4a87a' }]] },
      ],
    },
  },

  crow: {
    id: 'crow',
    name: 'Crow',
    layer: Layer.Sky,
    rowRange: [2, 6],
    speed: 1.8,
    maxHp: 2,
    damage: 2,
    attackDamage: 2,
    slowedBySpecies: [],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: '^', fg: '#707080' }], [-1, 0, { char: '>', fg: '#707080' }]] },
        { cells: [[0, 0, { char: 'v', fg: '#606070' }], [-1, 0, { char: '>', fg: '#606070' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: '*', fg: '#9090a0' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: '^', fg: '#707080' }], [1, 0, { char: '<', fg: '#707080' }]] },
        { cells: [[0, 0, { char: 'v', fg: '#606070' }], [1, 0, { char: '<', fg: '#606070' }]] },
      ],
    },
  },

  fox_enemy: {
    id: 'fox_enemy',
    name: 'Fox',
    layer: Layer.Ground,
    rowRange: [19, 20],
    speed: 0.9,
    maxHp: 4,
    damage: 2,
    attackDamage: 2,
    slowedBySpecies: ['blackthorn', 'hawthorn', 'holly', 'bramble', 'gorse'],
    frames: {
      advancing: [
        { cells: [[0, 0, { char: 'F', fg: '#d06030' }], [-1, 0, { char: '>', fg: '#d06030' }]] },
        { cells: [[0, 0, { char: 'F', fg: '#c05020' }], [-1, 0, { char: '-', fg: '#c05020' }]] },
      ],
      attacking: [
        { cells: [[0, 0, { char: '*', fg: '#ff7040' }]] },
      ],
      fleeing: [
        { cells: [[0, 0, { char: 'F', fg: '#d06030' }], [1, 0, { char: '<', fg: '#d06030' }]] },
        { cells: [[0, 0, { char: 'F', fg: '#c05020' }], [1, 0, { char: '-', fg: '#c05020' }]] },
      ],
    },
  },

};
