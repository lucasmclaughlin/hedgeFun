import { Season, GrowthStage, Layer, type SpeciesDef } from '@/types';

/**
 * Native UK hedge species definitions.
 * Visual offsets: row 0 = root (ground surface), negative = above ground, positive = below.
 * Ground row is 20 in the 55-row grid. Plants can reach row 8 (offset -12) and root to row ~26 (offset +6).
 */
export const SPECIES: Record<string, SpeciesDef> = {
  hawthorn: {
    id: 'hawthorn',
    name: 'Hawthorn',
    description: 'The backbone of any hedge. Thorny, dense, and beloved by birds for its red haws in autumn.',
    energyCost: 3,
    plantableSeasons: [Season.Spring, Season.Autumn],
    growthRate: 1.0,
    seasonalActivity: {
      [Season.Spring]: 'Budding',
      [Season.Summer]: 'Leafy',
      [Season.Autumn]: 'Fruiting',
      [Season.Winter]: 'Dormant',
    },
    ticksPerStage: {
      [GrowthStage.Seed]: 2,
      [GrowthStage.Seedling]: 3,
      [GrowthStage.Juvenile]: 4,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.UpperCanopy, Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [
          [0, 0, { char: '.', fg: '#8a7a4a' }],
          [0, 1, { char: '~', fg: '#5a3a1a' }],
        ],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'i', fg: '#6aaa3a' }],
          [0, -1, { char: ',', fg: '#7aba4a' }],
          [0, 1, { char: '|', fg: '#5a3a1a' }],
          [0, 2, { char: '.', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          // trunk
          [0, 0, { char: '|', fg: '#7a6a3a' }],
          [0, -1, { char: 'Y', fg: '#5a9a2a' }],
          [0, -2, { char: '{', fg: '#6aaa3a' }],
          [1, -2, { char: '}', fg: '#6aaa3a' }],
          [-1, -1, { char: ',', fg: '#7aba4a' }],
          [1, -1, { char: ',', fg: '#7aba4a' }],
          [0, -3, { char: '@', fg: '#5a9a2a' }],
          [-1, -3, { char: '{', fg: '#6aaa3a' }],
          [1, -3, { char: '}', fg: '#6aaa3a' }],
          // roots
          [0, 1, { char: '|', fg: '#5a3a1a' }],
          [-1, 1, { char: '\\', fg: '#4a2a0a' }],
          [1, 1, { char: '/', fg: '#4a2a0a' }],
          [0, 2, { char: ':', fg: '#3a2000' }],
          [-1, 2, { char: '~', fg: '#3a2000' }],
          [1, 2, { char: '~', fg: '#3a2000' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // trunk
          [0, 0, { char: '|', fg: '#7a6a3a' }],
          [0, -1, { char: '|', fg: '#7a6a3a' }],
          [0, -2, { char: '|', fg: '#6a5a2a' }],
          [0, -3, { char: '|', fg: '#6a5a2a' }],
          [0, -4, { char: 'Y', fg: '#6a5a2a' }],
          // mid canopy
          [-1, -5, { char: '/', fg: '#5a9a2a' }],
          [0, -5, { char: '@', fg: '#5a9a2a' }],
          [1, -5, { char: '\\', fg: '#5a9a2a' }],
          [-2, -5, { char: '{', fg: '#4a8a2a' }],
          [2, -5, { char: '}', fg: '#4a8a2a' }],
          // upper canopy (base foliage — berries/flowers added seasonally)
          [-1, -6, { char: '{', fg: '#4a8a2a' }],
          [0, -6, { char: '@', fg: '#5aaa3a' }],
          [1, -6, { char: '}', fg: '#4a8a2a' }],
          [-1, -7, { char: '(', fg: '#5aaa3a' }],
          [1, -7, { char: ')', fg: '#5aaa3a' }],
          [-1, -8, { char: '{', fg: '#5aaa3a' }],
          [1, -8, { char: '}', fg: '#5aaa3a' }],
          [0, -9, { char: '^', fg: '#6aba4a' }],
          // lower branches
          [-2, -4, { char: '{', fg: '#6aaa3a' }],
          [2, -4, { char: '}', fg: '#6aaa3a' }],
          [-1, -4, { char: '/', fg: '#5a9a2a' }],
          [1, -4, { char: '\\', fg: '#5a9a2a' }],
          [-1, -3, { char: '{', fg: '#6aaa3a' }],
          [1, -3, { char: '}', fg: '#6aaa3a' }],
          [-1, -2, { char: '/', fg: '#7aba4a' }],
          [1, -2, { char: '\\', fg: '#7aba4a' }],
          [-1, -1, { char: '{', fg: '#6aaa3a' }],
          [1, -1, { char: '}', fg: '#6aaa3a' }],
          // roots — deep taproot with laterals
          [0, 1, { char: '|', fg: '#6a4a1a' }],
          [-1, 1, { char: '\\', fg: '#5a3a0a' }],
          [1, 1, { char: '/', fg: '#5a3a0a' }],
          [0, 2, { char: '|', fg: '#5a3a0a' }],
          [-2, 2, { char: '~', fg: '#4a2a00' }],
          [2, 2, { char: '~', fg: '#4a2a00' }],
          [0, 3, { char: ':', fg: '#4a2a00' }],
          [-1, 3, { char: '~', fg: '#3a2000' }],
          [1, 3, { char: '~', fg: '#3a2000' }],
          [0, 4, { char: '.', fg: '#3a2000' }],
          [-1, 4, { char: '.', fg: '#2a1800' }],
          [1, 4, { char: '.', fg: '#2a1800' }],
          [0, 5, { char: '.', fg: '#2a1800' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // White May blossom
            [0, -7, { char: '*', fg: '#ffffff' }],
            [0, -8, { char: '*', fg: '#eeeeee' }],
          ],
          [Season.Summer]: [
            // Dense green foliage
            [0, -7, { char: '@', fg: '#5aaa3a' }],
            [0, -8, { char: '@', fg: '#5a9a2a' }],
          ],
          [Season.Autumn]: [
            // Red haw berries
            [0, -7, { char: '*', fg: '#ea4a4a' }],
            [0, -8, { char: '*', fg: '#ea4a4a' }],
          ],
          // Winter: bare — no decoration cells
        },
      },
    },
  },

  blackthorn: {
    id: 'blackthorn',
    name: 'Blackthorn',
    description: 'Tough, spiny shrub. Blooms white before its leaves appear. Produces sloe berries in autumn.',
    energyCost: 4,
    plantableSeasons: [Season.Autumn, Season.Winter],
    growthRate: 0.8,
    seasonalActivity: {
      [Season.Spring]: 'Blooming',
      [Season.Summer]: 'Leafy',
      [Season.Autumn]: 'Fruiting',
      [Season.Winter]: 'Dormant',
    },
    ticksPerStage: {
      [GrowthStage.Seed]: 3,
      [GrowthStage.Seedling]: 4,
      [GrowthStage.Juvenile]: 5,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [
          [0, 0, { char: '.', fg: '#6a5a3a' }],
          [0, 1, { char: '~', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: '!', fg: '#4a7a2a' }],
          [0, -1, { char: '+', fg: '#5a8a3a' }],
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [0, 2, { char: '.', fg: '#3a1a00' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#5a4a2a' }],
          [0, -1, { char: 'T', fg: '#4a7a2a' }],
          [-1, -1, { char: '#', fg: '#3a6a1a' }],
          [1, -1, { char: '#', fg: '#3a6a1a' }],
          [0, -2, { char: '%', fg: '#4a7a2a' }],
          [-1, -2, { char: '#', fg: '#3a6a1a' }],
          [1, -2, { char: '#', fg: '#3a6a1a' }],
          [0, -3, { char: '+', fg: '#5a8a3a' }],
          // roots — wide suckers
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [-1, 1, { char: '\\', fg: '#3a1a00' }],
          [1, 1, { char: '/', fg: '#3a1a00' }],
          [-2, 2, { char: '~', fg: '#3a2000' }],
          [0, 2, { char: ':', fg: '#3a2000' }],
          [2, 2, { char: '~', fg: '#3a2000' }],
        ],
      },
      [GrowthStage.Mature]: {
        cells: [
          // dense thorny mass
          [0, 0, { char: '|', fg: '#5a4a2a' }],
          [0, -1, { char: '#', fg: '#3a5a1a' }],
          [0, -2, { char: '#', fg: '#3a6a1a' }],
          [0, -3, { char: '#', fg: '#3a6a1a' }],
          [0, -4, { char: '%', fg: '#4a7a2a' }],
          [0, -5, { char: '+', fg: '#5a8a3a' }],
          [-1, -1, { char: '#', fg: '#3a5a1a' }],
          [1, -1, { char: '#', fg: '#3a5a1a' }],
          [-1, -2, { char: '%', fg: '#4a7a2a' }],
          [1, -2, { char: '%', fg: '#4a7a2a' }],
          [-2, -2, { char: '+', fg: '#5a8a3a' }],
          [2, -2, { char: '+', fg: '#5a8a3a' }],
          [-1, -3, { char: '#', fg: '#3a6a1a' }],
          [1, -3, { char: '#', fg: '#3a6a1a' }],
          [-2, -3, { char: '+', fg: '#4a7a2a' }],
          [2, -3, { char: '+', fg: '#4a7a2a' }],
          // top (base — sloe berries/flowers added seasonally)
          [1, -5, { char: '#', fg: '#4a7a2a' }],
          [0, -6, { char: '^', fg: '#5a8a3a' }],
          // roots — wide spreading suckers
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [-1, 1, { char: '\\', fg: '#3a1a00' }],
          [1, 1, { char: '/', fg: '#3a1a00' }],
          [-2, 1, { char: '~', fg: '#3a2000' }],
          [2, 1, { char: '~', fg: '#3a2000' }],
          [0, 2, { char: '|', fg: '#3a1a00' }],
          [-3, 2, { char: '~', fg: '#2a1800' }],
          [3, 2, { char: '~', fg: '#2a1800' }],
          [-1, 2, { char: '~', fg: '#3a2000' }],
          [1, 2, { char: '~', fg: '#3a2000' }],
          [0, 3, { char: ':', fg: '#2a1800' }],
          [-2, 3, { char: '.', fg: '#2a1800' }],
          [2, 3, { char: '.', fg: '#2a1800' }],
          [0, 4, { char: '.', fg: '#1a1000' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // White blossom (blooms before leaves)
            [-1, -4, { char: '*', fg: '#ffffff' }],
            [1, -4, { char: '*', fg: '#ffffff' }],
            [-1, -5, { char: '*', fg: '#eeeeee' }],
          ],
          [Season.Summer]: [
            // Dense foliage
            [-1, -4, { char: '#', fg: '#3a6a1a' }],
            [1, -4, { char: '#', fg: '#3a6a1a' }],
            [-1, -5, { char: '#', fg: '#4a7a2a' }],
          ],
          [Season.Autumn]: [
            // Sloe berries
            [-1, -4, { char: '*', fg: '#2a2a8a' }],
            [1, -4, { char: '*', fg: '#2a2a8a' }],
            [-1, -5, { char: '*', fg: '#2a2a8a' }],
          ],
          // Winter: bare thorny branches
        },
      },
    },
  },

  elder: {
    id: 'elder',
    name: 'Elder',
    description: 'Fast-growing with fragrant cream flowers in spring and dark elderberries in autumn.',
    energyCost: 2,
    plantableSeasons: [Season.Spring, Season.Summer],
    growthRate: 1.5,
    seasonalActivity: {
      [Season.Spring]: 'Blooming',
      [Season.Summer]: 'Leafy',
      [Season.Autumn]: 'Fruiting',
      [Season.Winter]: 'Dormant',
    },
    ticksPerStage: {
      [GrowthStage.Seed]: 1,
      [GrowthStage.Seedling]: 2,
      [GrowthStage.Juvenile]: 3,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [
          [0, 0, { char: '.', fg: '#7a8a3a' }],
          [0, 1, { char: '~', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'j', fg: '#6aaa3a' }],
          [0, -1, { char: '*', fg: '#eaea9a' }],
          [0, 1, { char: '|', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#6a5a2a' }],
          [0, -1, { char: 'f', fg: '#5a9a3a' }],
          [-1, -1, { char: '@', fg: '#5aaa3a' }],
          [1, -1, { char: '@', fg: '#5aaa3a' }],
          [-1, -2, { char: '@', fg: '#5aaa3a' }],
          [1, -2, { char: '@', fg: '#5aaa3a' }],
          [0, -4, { char: '^', fg: '#6aaa3a' }],
          // roots
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [-1, 1, { char: '\\', fg: '#3a1a00' }],
          [1, 1, { char: '/', fg: '#3a1a00' }],
          [0, 2, { char: '.', fg: '#2a1800' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Cream flowers
            [0, -2, { char: '*', fg: '#eaea9a' }],
            [0, -3, { char: '*', fg: '#eaea9a' }],
          ],
          [Season.Summer]: [
            // Green foliage
            [0, -2, { char: '@', fg: '#5aaa3a' }],
            [0, -3, { char: '@', fg: '#5a9a3a' }],
          ],
          [Season.Autumn]: [
            // Dark elderberries
            [0, -2, { char: '*', fg: '#4a1a4a' }],
            [0, -3, { char: '*', fg: '#4a1a4a' }],
          ],
        },
      },
      [GrowthStage.Mature]: {
        cells: [
          // trunk
          [0, 0, { char: '|', fg: '#6a5a2a' }],
          [0, -1, { char: '|', fg: '#6a5a2a' }],
          [0, -2, { char: '|', fg: '#5a4a1a' }],
          [0, -3, { char: 'Y', fg: '#5a4a1a' }],
          // canopy (base foliage)
          [-1, -3, { char: '/', fg: '#4a9a2a' }],
          [1, -3, { char: '\\', fg: '#4a9a2a' }],
          [-1, -4, { char: '@', fg: '#4a9a2a' }],
          [0, -4, { char: '@', fg: '#5aaa3a' }],
          [1, -4, { char: '@', fg: '#4a9a2a' }],
          [-2, -4, { char: '(', fg: '#5a9a3a' }],
          [2, -4, { char: ')', fg: '#5a9a3a' }],
          // upper canopy (base — flowers/berries added seasonally)
          [0, -5, { char: '@', fg: '#5aaa3a' }],
          [-1, -6, { char: '@', fg: '#5aaa3a' }],
          [1, -6, { char: '@', fg: '#5aaa3a' }],
          [0, -7, { char: '^', fg: '#6aba4a' }],
          // lower branches
          [-1, -2, { char: '{', fg: '#5a9a3a' }],
          [1, -2, { char: '}', fg: '#5a9a3a' }],
          [-1, -1, { char: '{', fg: '#6aaa3a' }],
          [1, -1, { char: '}', fg: '#6aaa3a' }],
          // roots — medium depth
          [0, 1, { char: '|', fg: '#5a3a0a' }],
          [-1, 1, { char: '\\', fg: '#4a2a00' }],
          [1, 1, { char: '/', fg: '#4a2a00' }],
          [0, 2, { char: ':', fg: '#3a2000' }],
          [-1, 2, { char: '~', fg: '#3a2000' }],
          [1, 2, { char: '~', fg: '#3a2000' }],
          [0, 3, { char: '.', fg: '#2a1800' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Fragrant cream elderflowers
            [-1, -5, { char: '*', fg: '#eaea9a' }],
            [1, -5, { char: '*', fg: '#eaea9a' }],
            [0, -6, { char: '*', fg: '#eaea9a' }],
          ],
          [Season.Summer]: [
            // Dense green
            [-1, -5, { char: '@', fg: '#4a9a2a' }],
            [1, -5, { char: '@', fg: '#4a9a2a' }],
            [0, -6, { char: '@', fg: '#5aaa3a' }],
          ],
          [Season.Autumn]: [
            // Dark elderberries
            [-1, -5, { char: '*', fg: '#4a1a4a' }],
            [1, -5, { char: '*', fg: '#4a1a4a' }],
            [0, -6, { char: '*', fg: '#4a1a4a' }],
          ],
          // Winter: bare
        },
      },
    },
  },

  hazel: {
    id: 'hazel',
    name: 'Hazel',
    description: 'Tall coppice tree with dangling catkins in spring and hazelnuts in autumn.',
    energyCost: 3,
    plantableSeasons: [Season.Autumn],
    growthRate: 0.9,
    seasonalActivity: {
      [Season.Spring]: 'Catkins',
      [Season.Summer]: 'Leafy',
      [Season.Autumn]: 'Nutting',
      [Season.Winter]: 'Dormant',
    },
    ticksPerStage: {
      [GrowthStage.Seed]: 2,
      [GrowthStage.Seedling]: 4,
      [GrowthStage.Juvenile]: 5,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.UpperCanopy, Layer.MidCanopy],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [
          [0, 0, { char: 'o', fg: '#8a6a3a' }],
          [0, 1, { char: '~', fg: '#5a3a1a' }],
        ],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'l', fg: '#6a9a3a' }],
          [0, -1, { char: '^', fg: '#7aaa4a' }],
          [0, 1, { char: '|', fg: '#5a3a1a' }],
          [0, 2, { char: '.', fg: '#3a2000' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#7a5a2a' }],
          [0, -1, { char: '|', fg: '#7a5a2a' }],
          [0, -2, { char: 'Y', fg: '#6a9a3a' }],
          [-1, -2, { char: '{', fg: '#7aaa4a' }],
          [1, -2, { char: '}', fg: '#7aaa4a' }],
          [0, -3, { char: '@', fg: '#6a9a3a' }],
          [-1, -3, { char: '{', fg: '#7aaa4a' }],
          [1, -3, { char: '}', fg: '#7aaa4a' }],
          [0, -5, { char: '^', fg: '#7aaa4a' }],
          // roots — deep taproot
          [0, 1, { char: '|', fg: '#5a3a0a' }],
          [-1, 1, { char: '\\', fg: '#4a2a00' }],
          [1, 1, { char: '/', fg: '#4a2a00' }],
          [0, 2, { char: '|', fg: '#4a2a00' }],
          [0, 3, { char: ':', fg: '#3a2000' }],
          [-1, 3, { char: '~', fg: '#3a2000' }],
          [1, 3, { char: '~', fg: '#3a2000' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Catkins
            [-1, -4, { char: ':', fg: '#caba3a' }],
            [1, -4, { char: ':', fg: '#caba3a' }],
            [0, -4, { char: '@', fg: '#6a9a3a' }],
          ],
          [Season.Summer]: [
            // Foliage
            [-1, -4, { char: '{', fg: '#7aaa4a' }],
            [1, -4, { char: '}', fg: '#7aaa4a' }],
            [0, -4, { char: '@', fg: '#6a9a3a' }],
          ],
          [Season.Autumn]: [
            // Nuts
            [0, -4, { char: 'O', fg: '#9a7a3a' }],
            [-1, -4, { char: '{', fg: '#7aaa4a' }],
            [1, -4, { char: '}', fg: '#7aaa4a' }],
          ],
        },
      },
      [GrowthStage.Mature]: {
        cells: [
          // tall trunk
          [0, 0, { char: '|', fg: '#7a5a2a' }],
          [0, -1, { char: '|', fg: '#7a5a2a' }],
          [0, -2, { char: '|', fg: '#6a4a1a' }],
          [0, -3, { char: '|', fg: '#6a4a1a' }],
          [0, -4, { char: '|', fg: '#5a3a0a' }],
          [0, -5, { char: '|', fg: '#5a3a0a' }],
          [0, -6, { char: 'Y', fg: '#5a3a0a' }],
          // canopy (base foliage — nuts/catkins added seasonally)
          [-1, -7, { char: '{', fg: '#6a9a3a' }],
          [0, -7, { char: '@', fg: '#7aaa4a' }],
          [1, -7, { char: '}', fg: '#6a9a3a' }],
          [-2, -7, { char: '(', fg: '#5a8a2a' }],
          [2, -7, { char: ')', fg: '#5a8a2a' }],
          [-1, -8, { char: '{', fg: '#6a9a3a' }],
          [1, -8, { char: '}', fg: '#6a9a3a' }],
          [-1, -9, { char: '{', fg: '#7aaa4a' }],
          [1, -9, { char: '}', fg: '#7aaa4a' }],
          [0, -10, { char: '@', fg: '#7aaa4a' }],
          [0, -11, { char: '^', fg: '#8aba5a' }],
          // branches
          [-1, -6, { char: '/', fg: '#7aaa4a' }],
          [1, -6, { char: '\\', fg: '#7aaa4a' }],
          [-2, -6, { char: '{', fg: '#6a9a3a' }],
          [2, -6, { char: '}', fg: '#6a9a3a' }],
          [-1, -4, { char: '{', fg: '#6a9a3a' }],
          [1, -4, { char: '}', fg: '#6a9a3a' }],
          [-1, -3, { char: '/', fg: '#7aaa4a' }],
          [1, -3, { char: '\\', fg: '#7aaa4a' }],
          [-1, -2, { char: '{', fg: '#6a9a3a' }],
          [1, -2, { char: '}', fg: '#6a9a3a' }],
          [-1, -1, { char: '{', fg: '#5a8a2a' }],
          [1, -1, { char: '}', fg: '#5a8a2a' }],
          // roots — deep taproot
          [0, 1, { char: '|', fg: '#6a4a1a' }],
          [-1, 1, { char: '\\', fg: '#5a3a0a' }],
          [1, 1, { char: '/', fg: '#5a3a0a' }],
          [0, 2, { char: '|', fg: '#5a3a0a' }],
          [-1, 2, { char: '~', fg: '#4a2a00' }],
          [1, 2, { char: '~', fg: '#4a2a00' }],
          [0, 3, { char: '|', fg: '#4a2a00' }],
          [-2, 3, { char: '~', fg: '#3a2000' }],
          [2, 3, { char: '~', fg: '#3a2000' }],
          [0, 4, { char: ':', fg: '#3a2000' }],
          [-1, 4, { char: '.', fg: '#2a1800' }],
          [1, 4, { char: '.', fg: '#2a1800' }],
          [0, 5, { char: '.', fg: '#2a1800' }],
          [0, 6, { char: '.', fg: '#1a1000' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Dangling catkins
            [-1, -5, { char: ':', fg: '#caba3a' }],
            [1, -5, { char: ':', fg: '#caba3a' }],
            [0, -8, { char: '@', fg: '#7aaa4a' }],
            [0, -9, { char: '@', fg: '#6a9a3a' }],
          ],
          [Season.Summer]: [
            // Full foliage
            [-1, -5, { char: '{', fg: '#6a9a3a' }],
            [1, -5, { char: '}', fg: '#6a9a3a' }],
            [0, -8, { char: '@', fg: '#7aaa4a' }],
            [0, -9, { char: '@', fg: '#7aaa4a' }],
          ],
          [Season.Autumn]: [
            // Hazelnuts
            [-1, -5, { char: '{', fg: '#6a9a3a' }],
            [1, -5, { char: '}', fg: '#6a9a3a' }],
            [0, -8, { char: 'O', fg: '#ba8a3a' }],
            [0, -9, { char: 'O', fg: '#ba8a3a' }],
          ],
          // Winter: bare
        },
      },
    },
  },

  dogrose: {
    id: 'dogrose',
    name: 'Dog Rose',
    description: 'Scrambling wild rose with pink flowers in summer and bright red rosehips in autumn.',
    energyCost: 2,
    plantableSeasons: [Season.Spring],
    growthRate: 1.2,
    seasonalActivity: {
      [Season.Spring]: 'Budding',
      [Season.Summer]: 'Blooming',
      [Season.Autumn]: 'Rosehips',
      [Season.Winter]: 'Dormant',
    },
    ticksPerStage: {
      [GrowthStage.Seed]: 2,
      [GrowthStage.Seedling]: 2,
      [GrowthStage.Juvenile]: 3,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.LowerShrub, Layer.Ground],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [
          [0, 0, { char: '.', fg: '#aa6a6a' }],
          [0, 1, { char: '~', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: 'r', fg: '#6a9a3a' }],
          [0, -1, { char: '*', fg: '#ea8a9a' }],
          [0, 1, { char: '|', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '&', fg: '#5a8a2a' }],
          [-1, -1, { char: '~', fg: '#6aaa3a' }],
          [1, -1, { char: '~', fg: '#6aaa3a' }],
          [1, 0, { char: '~', fg: '#6aaa3a' }],
          [-1, 0, { char: '~', fg: '#6aaa3a' }],
          [-1, -2, { char: '~', fg: '#5a9a2a' }],
          [1, -2, { char: '~', fg: '#5a9a2a' }],
          // roots
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [-1, 1, { char: '~', fg: '#3a2000' }],
          [1, 1, { char: '~', fg: '#3a2000' }],
          [0, 2, { char: '.', fg: '#2a1800' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Green buds
            [0, -1, { char: ',', fg: '#7aba4a' }],
            [0, -2, { char: ',', fg: '#7aba4a' }],
          ],
          [Season.Summer]: [
            // Pink flowers
            [0, -1, { char: '*', fg: '#ea8a9a' }],
            [0, -2, { char: '*', fg: '#ea6a7a' }],
          ],
          [Season.Autumn]: [
            // Small rosehips
            [0, -1, { char: 'o', fg: '#ea4a2a' }],
            [0, -2, { char: 'o', fg: '#ea4a2a' }],
          ],
        },
      },
      [GrowthStage.Mature]: {
        cells: [
          // climbing scrambler (base structure)
          [0, 0, { char: '&', fg: '#5a8a2a' }],
          [-1, 0, { char: '~', fg: '#6aaa3a' }],
          [1, 0, { char: '~', fg: '#6aaa3a' }],
          [-2, 0, { char: '~', fg: '#5a9a2a' }],
          [2, 0, { char: '~', fg: '#5a9a2a' }],
          [0, -1, { char: '~', fg: '#5a9a2a' }],
          [-2, -1, { char: '~', fg: '#6aaa3a' }],
          [2, -1, { char: '~', fg: '#6aaa3a' }],
          [-1, -2, { char: '~', fg: '#5a9a2a' }],
          [1, -2, { char: '~', fg: '#5a9a2a' }],
          [-1, -3, { char: '~', fg: '#6aaa3a' }],
          [0, -4, { char: '~', fg: '#5a9a2a' }],
          [1, -4, { char: '~', fg: '#5a9a2a' }],
          [0, -5, { char: '^', fg: '#6aaa3a' }],
          // roots — shallow scrambler
          [0, 1, { char: '|', fg: '#5a3a0a' }],
          [-1, 1, { char: '~', fg: '#4a2a00' }],
          [1, 1, { char: '~', fg: '#4a2a00' }],
          [-2, 1, { char: '~', fg: '#3a2000' }],
          [2, 1, { char: '~', fg: '#3a2000' }],
          [0, 2, { char: ':', fg: '#3a2000' }],
          [-1, 2, { char: '.', fg: '#2a1800' }],
          [1, 2, { char: '.', fg: '#2a1800' }],
          [0, 3, { char: '.', fg: '#2a1800' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Green buds
            [-1, -1, { char: ',', fg: '#7aba4a' }],
            [1, -1, { char: ',', fg: '#7aba4a' }],
            [0, -2, { char: ',', fg: '#7aba4a' }],
            [-2, -2, { char: ',', fg: '#7aba4a' }],
            [2, -2, { char: ',', fg: '#7aba4a' }],
            [0, -3, { char: '~', fg: '#6aaa3a' }],
            [1, -3, { char: '~', fg: '#6aaa3a' }],
            [-1, -4, { char: '~', fg: '#5a9a2a' }],
          ],
          [Season.Summer]: [
            // Pink flowers in bloom
            [-1, -1, { char: '*', fg: '#ea8a9a' }],
            [1, -1, { char: '*', fg: '#ea8a9a' }],
            [0, -2, { char: '*', fg: '#ea6a7a' }],
            [-2, -2, { char: '*', fg: '#ea8a9a' }],
            [2, -2, { char: '*', fg: '#ea8a9a' }],
            [0, -3, { char: '*', fg: '#ea6a7a' }],
            [1, -3, { char: '~', fg: '#6aaa3a' }],
            [-1, -4, { char: '*', fg: '#ea8a9a' }],
          ],
          [Season.Autumn]: [
            // Red rosehips
            [-1, -1, { char: '~', fg: '#6aaa3a' }],
            [1, -1, { char: '~', fg: '#6aaa3a' }],
            [0, -2, { char: '~', fg: '#5a9a2a' }],
            [-2, -2, { char: '~', fg: '#5a9a2a' }],
            [2, -2, { char: '~', fg: '#5a9a2a' }],
            [0, -3, { char: 'o', fg: '#ea4a2a' }],
            [1, -3, { char: 'o', fg: '#ea4a2a' }],
            [-1, -4, { char: 'o', fg: '#ea4a2a' }],
          ],
          // Winter: bare scrambler
        },
      },
    },
  },

  holly: {
    id: 'holly',
    name: 'Holly',
    description: 'Evergreen with glossy spiny leaves. Slow but keeps its foliage year-round. Red berries in winter.',
    energyCost: 5,
    plantableSeasons: [Season.Spring, Season.Autumn],
    growthRate: 0.6,
    seasonalActivity: {
      [Season.Spring]: 'Growing',
      [Season.Summer]: 'Evergreen',
      [Season.Autumn]: 'Berrying',
      [Season.Winter]: 'Evergreen',
    },
    ticksPerStage: {
      [GrowthStage.Seed]: 3,
      [GrowthStage.Seedling]: 5,
      [GrowthStage.Juvenile]: 6,
      [GrowthStage.Mature]: Infinity,
    },
    matureLayers: [Layer.UpperCanopy, Layer.MidCanopy, Layer.LowerShrub],
    visuals: {
      [GrowthStage.Seed]: {
        cells: [
          [0, 0, { char: '.', fg: '#3a6a2a' }],
          [0, 1, { char: '~', fg: '#4a2a0a' }],
        ],
      },
      [GrowthStage.Seedling]: {
        cells: [
          [0, 0, { char: '+', fg: '#2a6a1a' }],
          [0, -1, { char: '^', fg: '#3a7a2a' }],
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [0, 2, { char: '.', fg: '#3a2000' }],
        ],
      },
      [GrowthStage.Juvenile]: {
        cells: [
          [0, 0, { char: '|', fg: '#4a3a1a' }],
          [0, -1, { char: 'A', fg: '#2a6a1a' }],
          [-1, -1, { char: '#', fg: '#2a5a0a' }],
          [1, -1, { char: '#', fg: '#2a5a0a' }],
          [0, -2, { char: '#', fg: '#2a6a1a' }],
          [-1, -2, { char: '#', fg: '#2a5a0a' }],
          [1, -2, { char: '#', fg: '#2a5a0a' }],
          [0, -3, { char: '#', fg: '#2a6a1a' }],
          [0, -4, { char: '#', fg: '#3a7a2a' }],
          [0, -5, { char: '^', fg: '#3a8a2a' }],
          // roots
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [-1, 1, { char: '\\', fg: '#3a1a00' }],
          [1, 1, { char: '/', fg: '#3a1a00' }],
          [0, 2, { char: '|', fg: '#3a1a00' }],
          [0, 3, { char: ':', fg: '#2a1800' }],
          [-1, 3, { char: '~', fg: '#2a1800' }],
          [1, 3, { char: '~', fg: '#2a1800' }],
        ],
        seasonalCells: {
          // Holly berries appear in autumn and persist through winter
          [Season.Autumn]: [
            [-1, -3, { char: '*', fg: '#ea2a2a' }],
            [1, -3, { char: '*', fg: '#ea2a2a' }],
          ],
          [Season.Winter]: [
            [-1, -3, { char: '*', fg: '#ea2a2a' }],
            [1, -3, { char: '*', fg: '#ea2a2a' }],
          ],
          [Season.Spring]: [
            // Evergreen — extra dense foliage
            [-1, -3, { char: '#', fg: '#2a6a1a' }],
            [1, -3, { char: '#', fg: '#2a6a1a' }],
          ],
          [Season.Summer]: [
            [-1, -3, { char: '#', fg: '#2a6a1a' }],
            [1, -3, { char: '#', fg: '#2a6a1a' }],
          ],
        },
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
          [-2, -3, { char: '#', fg: '#2a6a1a' }],
          [2, -3, { char: '#', fg: '#2a6a1a' }],
          [0, -4, { char: '#', fg: '#2a6a1a' }],
          [-1, -4, { char: '#', fg: '#2a6a1a' }],
          [1, -4, { char: '#', fg: '#2a6a1a' }],
          [-2, -4, { char: '#', fg: '#3a7a2a' }],
          [2, -4, { char: '#', fg: '#3a7a2a' }],
          [0, -5, { char: '#', fg: '#2a6a1a' }],
          [-1, -5, { char: '#', fg: '#2a5a0a' }],
          [1, -5, { char: '#', fg: '#2a5a0a' }],
          [0, -6, { char: '#', fg: '#2a6a1a' }],
          [-1, -6, { char: '#', fg: '#3a7a2a' }],
          [1, -6, { char: '#', fg: '#3a7a2a' }],
          [0, -7, { char: '#', fg: '#3a7a2a' }],
          [0, -8, { char: '#', fg: '#3a8a2a' }],
          [-1, -8, { char: '#', fg: '#2a6a1a' }],
          [1, -8, { char: '#', fg: '#2a6a1a' }],
          [0, -9, { char: '#', fg: '#3a8a2a' }],
          [0, -10, { char: '^', fg: '#4a9a2a' }],
          // roots — deep evergreen
          [0, 1, { char: '|', fg: '#4a2a0a' }],
          [-1, 1, { char: '\\', fg: '#3a1a00' }],
          [1, 1, { char: '/', fg: '#3a1a00' }],
          [0, 2, { char: '|', fg: '#3a1a00' }],
          [-1, 2, { char: '~', fg: '#2a1800' }],
          [1, 2, { char: '~', fg: '#2a1800' }],
          [0, 3, { char: '|', fg: '#2a1800' }],
          [-2, 3, { char: '~', fg: '#2a1800' }],
          [2, 3, { char: '~', fg: '#2a1800' }],
          [0, 4, { char: ':', fg: '#1a1000' }],
          [-1, 4, { char: '.', fg: '#1a1000' }],
          [1, 4, { char: '.', fg: '#1a1000' }],
          [0, 5, { char: '.', fg: '#1a1000' }],
        ],
        seasonalCells: {
          [Season.Spring]: [
            // Evergreen — dense foliage, no berries
            [-1, -3, { char: '#', fg: '#2a6a1a' }],
            [1, -3, { char: '#', fg: '#2a6a1a' }],
            [-1, -7, { char: '#', fg: '#3a7a2a' }],
            [1, -7, { char: '#', fg: '#3a7a2a' }],
          ],
          [Season.Summer]: [
            // Evergreen — dense foliage, no berries
            [-1, -3, { char: '#', fg: '#2a6a1a' }],
            [1, -3, { char: '#', fg: '#2a6a1a' }],
            [-1, -7, { char: '#', fg: '#3a7a2a' }],
            [1, -7, { char: '#', fg: '#3a7a2a' }],
          ],
          [Season.Autumn]: [
            // Red berries appearing
            [-1, -3, { char: '*', fg: '#ea2a2a' }],
            [1, -3, { char: '*', fg: '#ea2a2a' }],
            [-1, -7, { char: '*', fg: '#ea2a2a' }],
            [1, -7, { char: '*', fg: '#ea2a2a' }],
          ],
          [Season.Winter]: [
            // Classic holly with red berries
            [-1, -3, { char: '*', fg: '#ea2a2a' }],
            [1, -3, { char: '*', fg: '#ea2a2a' }],
            [-1, -7, { char: '*', fg: '#ea2a2a' }],
            [1, -7, { char: '*', fg: '#ea2a2a' }],
          ],
        },
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
