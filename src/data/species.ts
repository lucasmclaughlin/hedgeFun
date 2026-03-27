import { Season, GrowthStage, Layer, type SpeciesDef } from '@/types';

/**
 * Native UK hedge species definitions.
 * Visual offsets: row 0 = root (ground surface), negative = above ground, positive = below.
 */
export const SPECIES: Record<string, SpeciesDef> = {
  hawthorn: {
    id: 'hawthorn',
    name: 'Hawthorn',
    energyCost: 3,
    plantableSeasons: [Season.Spring, Season.Autumn],
    growthRate: 1.0,
    ticksPerStage: {
      [GrowthStage.Seed]: 2,
      [GrowthStage.Seedling]: 3,
      [GrowthStage.Juvenile]: 4,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.UpperCanopy, Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [[0, 0, { char: '.', fg: '#8a7a4a' }]],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'i', fg: '#6aaa3a' }],
          [0, -1, { char: ',', fg: '#7aba4a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#7a6a3a' }],
          [0, -1, { char: 'Y', fg: '#5a9a2a' }],
          [0, -2, { char: '{', fg: '#6aaa3a' }],
          [1, -2, { char: '}', fg: '#6aaa3a' }],
          [-1, -1, { char: ',', fg: '#7aba4a' }],
          [1, -1, { char: ',', fg: '#7aba4a' }],
          [0, 1, { char: '~', fg: '#7a5a2a' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // trunk
          [0, 0, { char: '|', fg: '#7a6a3a' }],
          [0, -1, { char: '|', fg: '#7a6a3a' }],
          [0, -2, { char: '|', fg: '#6a5a2a' }],
          [0, -3, { char: 'Y', fg: '#6a5a2a' }],
          // canopy
          [-1, -4, { char: '{', fg: '#4a8a2a' }],
          [0, -4, { char: '@', fg: '#5a9a2a' }],
          [1, -4, { char: '}', fg: '#4a8a2a' }],
          [-1, -5, { char: '(', fg: '#5aaa3a' }],
          [0, -5, { char: '*', fg: '#ea4a4a' }], // berries
          [1, -5, { char: ')', fg: '#5aaa3a' }],
          [-2, -3, { char: '{', fg: '#6aaa3a' }],
          [2, -3, { char: '}', fg: '#6aaa3a' }],
          [-1, -3, { char: '/', fg: '#5a9a2a' }],
          [1, -3, { char: '\\', fg: '#5a9a2a' }],
          // lower branches
          [-1, -2, { char: '/', fg: '#7aba4a' }],
          [1, -2, { char: '\\', fg: '#7aba4a' }],
          [-1, -1, { char: '{', fg: '#6aaa3a' }],
          [1, -1, { char: '}', fg: '#6aaa3a' }],
          // roots
          [0, 1, { char: '~', fg: '#7a5a2a' }],
          [-1, 1, { char: '\\', fg: '#6a4a1a' }],
          [1, 1, { char: '/', fg: '#6a4a1a' }],
        ],
      },
    },
  },

  blackthorn: {
    id: 'blackthorn',
    name: 'Blackthorn',
    energyCost: 4,
    plantableSeasons: [Season.Autumn, Season.Winter],
    growthRate: 0.8,
    ticksPerStage: {
      [GrowthStage.Seed]: 3,
      [GrowthStage.Seedling]: 4,
      [GrowthStage.Juvenile]: 5,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [[0, 0, { char: '.', fg: '#6a5a3a' }]],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: '!', fg: '#4a7a2a' }],
          [0, -1, { char: '+', fg: '#5a8a3a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#5a4a2a' }],
          [0, -1, { char: 'T', fg: '#4a7a2a' }],
          [-1, -1, { char: '#', fg: '#3a6a1a' }],
          [1, -1, { char: '#', fg: '#3a6a1a' }],
          [0, -2, { char: '%', fg: '#4a7a2a' }],
          [0, 1, { char: '~', fg: '#5a3a1a' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // dense thorny mass
          [0, 0, { char: '|', fg: '#5a4a2a' }],
          [0, -1, { char: '#', fg: '#3a5a1a' }],
          [0, -2, { char: '#', fg: '#3a6a1a' }],
          [0, -3, { char: '%', fg: '#4a7a2a' }],
          [-1, -1, { char: '#', fg: '#3a5a1a' }],
          [1, -1, { char: '#', fg: '#3a5a1a' }],
          [-1, -2, { char: '%', fg: '#4a7a2a' }],
          [1, -2, { char: '%', fg: '#4a7a2a' }],
          [-1, -3, { char: '*', fg: '#2a2a8a' }], // sloe berries
          [1, -3, { char: '*', fg: '#2a2a8a' }],
          [-2, -2, { char: '+', fg: '#5a8a3a' }],
          [2, -2, { char: '+', fg: '#5a8a3a' }],
          // roots
          [0, 1, { char: '~', fg: '#5a3a1a' }],
          [-1, 1, { char: '~', fg: '#5a3a1a' }],
          [1, 1, { char: '~', fg: '#5a3a1a' }],
        ],
      },
    },
  },

  elder: {
    id: 'elder',
    name: 'Elder',
    energyCost: 2,
    plantableSeasons: [Season.Spring, Season.Summer],
    growthRate: 1.5,
    ticksPerStage: {
      [GrowthStage.Seed]: 1,
      [GrowthStage.Seedling]: 2,
      [GrowthStage.Juvenile]: 3,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [[0, 0, { char: '.', fg: '#7a8a3a' }]],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'j', fg: '#6aaa3a' }],
          [0, -1, { char: '*', fg: '#eaea9a' }], // flower
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#6a5a2a' }],
          [0, -1, { char: 'f', fg: '#5a9a3a' }],
          [-1, -1, { char: '@', fg: '#5aaa3a' }],
          [1, -1, { char: '@', fg: '#5aaa3a' }],
          [0, -2, { char: '*', fg: '#eaea9a' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          [0, 0, { char: '|', fg: '#6a5a2a' }],
          [0, -1, { char: '|', fg: '#6a5a2a' }],
          [0, -2, { char: 'Y', fg: '#5a4a1a' }],
          [-1, -2, { char: '@', fg: '#4a9a2a' }],
          [1, -2, { char: '@', fg: '#4a9a2a' }],
          [-1, -3, { char: '*', fg: '#eaea9a' }],
          [0, -3, { char: '@', fg: '#5aaa3a' }],
          [1, -3, { char: '*', fg: '#eaea9a' }],
          [-2, -2, { char: '(', fg: '#5a9a3a' }],
          [2, -2, { char: ')', fg: '#5a9a3a' }],
          [0, -4, { char: '*', fg: '#4a1a4a' }], // elderberries
          // roots
          [0, 1, { char: '~', fg: '#6a4a1a' }],
        ],
      },
    },
  },

  hazel: {
    id: 'hazel',
    name: 'Hazel',
    energyCost: 3,
    plantableSeasons: [Season.Autumn],
    growthRate: 0.9,
    ticksPerStage: {
      [GrowthStage.Seed]: 2,
      [GrowthStage.Seedling]: 4,
      [GrowthStage.Juvenile]: 5,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.UpperCanopy, Layer.MidCanopy],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [[0, 0, { char: 'o', fg: '#8a6a3a' }]],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'l', fg: '#6a9a3a' }],
          [0, -1, { char: '^', fg: '#7aaa4a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#7a5a2a' }],
          [0, -1, { char: '|', fg: '#7a5a2a' }],
          [0, -2, { char: 'Y', fg: '#6a9a3a' }],
          [-1, -2, { char: '{', fg: '#7aaa4a' }],
          [1, -2, { char: '}', fg: '#7aaa4a' }],
          [0, -3, { char: 'O', fg: '#9a7a3a' }], // nuts
          [0, 1, { char: '~', fg: '#6a4a1a' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // tall trunk
          [0, 0, { char: '|', fg: '#7a5a2a' }],
          [0, -1, { char: '|', fg: '#7a5a2a' }],
          [0, -2, { char: '|', fg: '#6a4a1a' }],
          [0, -3, { char: '|', fg: '#6a4a1a' }],
          [0, -4, { char: 'Y', fg: '#5a3a0a' }],
          // canopy with nuts
          [-1, -5, { char: '{', fg: '#6a9a3a' }],
          [0, -5, { char: 'O', fg: '#ba8a3a' }],
          [1, -5, { char: '}', fg: '#6a9a3a' }],
          [-1, -4, { char: '/', fg: '#7aaa4a' }],
          [1, -4, { char: '\\', fg: '#7aaa4a' }],
          [-2, -4, { char: '{', fg: '#6a9a3a' }],
          [2, -4, { char: '}', fg: '#6a9a3a' }],
          [0, -6, { char: 'O', fg: '#ba8a3a' }],
          // catkins
          [-1, -3, { char: ':', fg: '#caba3a' }],
          [1, -3, { char: ':', fg: '#caba3a' }],
          // roots
          [0, 1, { char: '~', fg: '#6a4a1a' }],
          [-1, 1, { char: '\\', fg: '#5a3a0a' }],
          [1, 1, { char: '/', fg: '#5a3a0a' }],
        ],
      },
    },
  },

  dogrose: {
    id: 'dogrose',
    name: 'Dog Rose',
    energyCost: 2,
    plantableSeasons: [Season.Spring],
    growthRate: 1.2,
    ticksPerStage: {
      [GrowthStage.Seed]: 2,
      [GrowthStage.Seedling]: 2,
      [GrowthStage.Juvenile]: 3,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.LowerShrub, Layer.Ground],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [[0, 0, { char: '.', fg: '#aa6a6a' }]],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'r', fg: '#6a9a3a' }],
          [0, -1, { char: '*', fg: '#ea8a9a' }], // pink flower
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '&', fg: '#5a8a2a' }],
          [-1, -1, { char: '~', fg: '#6aaa3a' }],
          [0, -1, { char: '*', fg: '#ea8a9a' }],
          [1, -1, { char: '~', fg: '#6aaa3a' }],
          [1, 0, { char: '~', fg: '#6aaa3a' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // climbing scrambler
          [0, 0, { char: '&', fg: '#5a8a2a' }],
          [-1, 0, { char: '~', fg: '#6aaa3a' }],
          [1, 0, { char: '~', fg: '#6aaa3a' }],
          [-1, -1, { char: '*', fg: '#ea8a9a' }],
          [0, -1, { char: '~', fg: '#5a9a2a' }],
          [1, -1, { char: '*', fg: '#ea8a9a' }],
          [-2, -1, { char: '~', fg: '#6aaa3a' }],
          [2, -1, { char: '~', fg: '#6aaa3a' }],
          [0, -2, { char: '*', fg: '#ea6a7a' }],
          [-1, -2, { char: '~', fg: '#5a9a2a' }],
          [1, -2, { char: '~', fg: '#5a9a2a' }],
          // rosehips
          [0, -3, { char: 'o', fg: '#ea4a2a' }],
          [-1, -3, { char: '~', fg: '#6aaa3a' }],
          [1, -3, { char: 'o', fg: '#ea4a2a' }],
          // roots
          [0, 1, { char: '~', fg: '#6a4a1a' }],
        ],
      },
    },
  },

  holly: {
    id: 'holly',
    name: 'Holly',
    energyCost: 5,
    plantableSeasons: [Season.Spring, Season.Autumn],
    growthRate: 0.6,
    ticksPerStage: {
      [GrowthStage.Seed]: 3,
      [GrowthStage.Seedling]: 5,
      [GrowthStage.Juvenile]: 6,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.UpperCanopy, Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [[0, 0, { char: '.', fg: '#3a6a2a' }]],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: '+', fg: '#2a6a1a' }],
          [0, -1, { char: '^', fg: '#3a7a2a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#4a3a1a' }],
          [0, -1, { char: 'A', fg: '#2a6a1a' }],
          [-1, -1, { char: '#', fg: '#2a5a0a' }],
          [1, -1, { char: '#', fg: '#2a5a0a' }],
          [0, -2, { char: '#', fg: '#2a6a1a' }],
          [0, -3, { char: '^', fg: '#3a7a2a' }],
          [0, 1, { char: '~', fg: '#5a3a0a' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // dense evergreen pyramid
          [0, 0, { char: '|', fg: '#4a3a1a' }],
          [0, -1, { char: '#', fg: '#1a5a0a' }],
          [-1, -1, { char: '#', fg: '#2a5a0a' }],
          [1, -1, { char: '#', fg: '#2a5a0a' }],
          [0, -2, { char: '#', fg: '#1a5a0a' }],
          [-1, -2, { char: '#', fg: '#2a6a1a' }],
          [1, -2, { char: '#', fg: '#2a6a1a' }],
          [-2, -2, { char: '#', fg: '#3a7a2a' }],
          [2, -2, { char: '#', fg: '#3a7a2a' }],
          [0, -3, { char: '#', fg: '#1a5a0a' }],
          [-1, -3, { char: '*', fg: '#ea2a2a' }], // berries
          [1, -3, { char: '*', fg: '#ea2a2a' }],
          [0, -4, { char: '#', fg: '#2a6a1a' }],
          [-1, -4, { char: '#', fg: '#2a6a1a' }],
          [1, -4, { char: '#', fg: '#2a6a1a' }],
          [0, -5, { char: '#', fg: '#3a7a2a' }],
          [0, -6, { char: '^', fg: '#3a8a2a' }],
          // roots
          [0, 1, { char: '~', fg: '#5a3a0a' }],
          [-1, 1, { char: '\\', fg: '#4a2a0a' }],
          [1, 1, { char: '/', fg: '#4a2a0a' }],
        ],
      },
    },
  },
};

/** Ordered list for UI selection (keys 1-6) */
export const SPECIES_LIST: SpeciesDef[] = [
  SPECIES.hawthorn,
  SPECIES.blackthorn,
  SPECIES.elder,
  SPECIES.hazel,
  SPECIES.dogrose,
  SPECIES.holly,
];
