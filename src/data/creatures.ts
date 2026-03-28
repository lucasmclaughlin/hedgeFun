import {
  Layer, CreatureBehavior, MovementPattern, WinterBehavior,
  type CreatureDef,
} from '@/types';

export const CREATURES: Record<string, CreatureDef> = {

  // ── Underground ──────────────────────────────

  earthworm: {
    id: 'earthworm',
    name: 'Earthworm',
    description: 'Aerates the soil and breaks down organic matter. A sign of healthy ground.',
    layer: Layer.Underground,
    rowRange: [21, 27],
    movement: MovementPattern.Burrow,
    homeRange: 3,
    speed: 0.3,
    rarity: 8,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 2, minMaturePlants: 0, minSpeciesDiversity: 1 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '~', fg: '#aa7a6a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#aa7a6a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '~', fg: '#ba8a7a' }], [-1, 0, { char: '-', fg: '#9a6a5a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#ba8a7a' }], [-1, 0, { char: '~', fg: '#9a6a5a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#8a6a5a' }]] },
      ],
    },
  },

  beetle: {
    id: 'beetle',
    name: 'Stag Beetle',
    description: 'Impressive jaws and armored shell. Larvae feed on rotting wood underground.',
    layer: Layer.Underground,
    rowRange: [21, 25],
    movement: MovementPattern.Hop,
    homeRange: 4,
    speed: 0.5,
    rarity: 5,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '%', fg: '#4a2a0a' }]] },
        { cells: [[0, 0, { char: '%', fg: '#5a3a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '%', fg: '#5a3a1a' }], [1, 0, { char: '>', fg: '#4a2a0a' }]] },
        { cells: [[0, 0, { char: '%', fg: '#4a2a0a' }], [1, 0, { char: '-', fg: '#4a2a0a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#3a1a00' }]] },
      ],
    },
  },

  // ── Ground ──────────────────────────────

  hedgehog: {
    id: 'hedgehog',
    name: 'Hedgehog',
    description: 'Prickly and nocturnal. Snuffles through leaf litter for slugs and beetles.',
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Wander,
    homeRange: 8,
    speed: 0.6,
    rarity: 4,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 3, minMaturePlants: 2, minSpeciesDiversity: 2 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '"', fg: '#aa8a4a' }], [1, 0, { char: ')', fg: '#8a6a3a' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '"', fg: '#9a7a3a' }], [1, 0, { char: ')', fg: '#8a6a3a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '"', fg: '#aa8a4a' }], [1, 0, { char: '>', fg: '#7a5a2a' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '^', fg: '#aa8a4a' }], [1, 0, { char: '>', fg: '#7a5a2a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '@', fg: '#7a5a2a' }]] },
      ],
    },
  },

  fieldmouse: {
    id: 'fieldmouse',
    name: 'Field Mouse',
    description: 'Tiny and quick. Stores seeds and berries in underground caches.',
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 6,
    speed: 1.2,
    rarity: 7,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 2, minMaturePlants: 1, minSpeciesDiversity: 1 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: 'n', fg: '#9a7a5a' }]] },
        { cells: [[0, 0, { char: 'n', fg: '#8a6a4a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: 'n', fg: '#aa8a6a' }], [-1, 0, { char: '~', fg: '#8a6a4a' }]] },
        { cells: [[0, 0, { char: '>', fg: '#aa8a6a' }], [-1, 0, { char: '-', fg: '#8a6a4a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'c', fg: '#7a5a3a' }]] },
      ],
    },
  },

  toad: {
    id: 'toad',
    name: 'Common Toad',
    description: 'Warty and wonderful. Hunts slugs at dusk and hibernates under log piles.',
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 5,
    speed: 0.4,
    rarity: 5,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['elder', 'hawthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '&', fg: '#5a6a3a' }]] },
        { cells: [[0, 0, { char: '&', fg: '#4a5a2a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '&', fg: '#5a6a3a' }]] },
        { cells: [[0, 0, { char: '^', fg: '#5a6a3a' }]] }, // mid-hop
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#3a4a1a' }]] },
      ],
    },
  },

  // ── Shrub layer ──────────────────────────────

  wren: {
    id: 'wren',
    name: 'Wren',
    description: 'Tiny but mighty singer. Darts through dense undergrowth hunting insects.',
    layer: Layer.LowerShrub,
    rowRange: [15, 19],
    movement: MovementPattern.Flit,
    homeRange: 10,
    speed: 2.0,
    rarity: 6,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2, attractedBySpecies: ['blackthorn', 'hawthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#8a6a3a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#8a6a3a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#9a7a4a' }], [0, -1, { char: '\'', fg: '#7a5a2a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#9a7a4a' }], [0, -1, { char: 'v', fg: '#7a5a2a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#6a4a2a' }]] },
      ],
    },
  },

  robin: {
    id: 'robin',
    name: 'Robin',
    description: 'Bold and territorial with a flash of red. First to sing at dawn, last at dusk.',
    layer: Layer.LowerShrub,
    rowRange: [15, 19],
    movement: MovementPattern.Hop,
    homeRange: 8,
    speed: 1.0,
    rarity: 7,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 2, minMaturePlants: 1, minSpeciesDiversity: 1 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#da5a3a' }], [0, -1, { char: '.', fg: '#6a4a2a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#da5a3a' }], [0, -1, { char: '.', fg: '#6a4a2a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#da5a3a' }], [0, -1, { char: '\'', fg: '#7a5a3a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#da5a3a' }], [0, -1, { char: 'v', fg: '#7a5a3a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#aa4a2a' }]] },
      ],
    },
  },

  dormouse: {
    id: 'dormouse',
    name: 'Dormouse',
    description: 'Elusive and endangered. Builds nests in dense hedges and feasts on hazelnuts.',
    layer: Layer.LowerShrub,
    rowRange: [16, 19],
    movement: MovementPattern.Wander,
    homeRange: 4,
    speed: 0.5,
    rarity: 2,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 5, minMaturePlants: 3, minSpeciesDiversity: 3, attractedBySpecies: ['hazel', 'blackthorn', 'dogrose'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: 'n', fg: '#ca9a5a' }]] },
        { cells: [[0, 0, { char: 'n', fg: '#ba8a4a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#ca9a5a' }], [-1, 0, { char: '~', fg: '#aa7a3a' }]] },
        { cells: [[0, 0, { char: 'n', fg: '#ca9a5a' }], [-1, 0, { char: '-', fg: '#aa7a3a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '@', fg: '#9a7a3a' }]] },
      ],
    },
  },

  // ── Canopy ──────────────────────────────

  woodpigeon: {
    id: 'woodpigeon',
    name: 'Woodpigeon',
    description: 'Portly and cooing. Nests high in the canopy and feeds on berries.',
    layer: Layer.UpperCanopy,
    rowRange: [8, 11],
    movement: MovementPattern.Soar,
    homeRange: 12,
    speed: 0.8,
    rarity: 6,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 3, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'elder', 'holly'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '(', fg: '#7a7a8a' }], [0, 0, { char: 'O', fg: '#8a8a9a' }], [1, 0, { char: ')', fg: '#7a7a8a' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#7a7a8a' }], [0, 0, { char: 'o', fg: '#8a8a9a' }], [1, 0, { char: ')', fg: '#7a7a8a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '\\', fg: '#8a8a9a' }], [0, 0, { char: 'O', fg: '#9a9aaa' }], [1, 0, { char: '/', fg: '#8a8a9a' }]] },
        { cells: [[-1, 0, { char: '/', fg: '#8a8a9a' }], [0, 0, { char: 'O', fg: '#9a9aaa' }], [1, 0, { char: '\\', fg: '#8a8a9a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'O', fg: '#6a6a7a' }]] },
      ],
    },
  },

  owl: {
    id: 'owl',
    name: 'Tawny Owl',
    description: 'Silent hunter of the night. Needs tall trees for nesting. A sign of a mature hedge.',
    layer: Layer.UpperCanopy,
    rowRange: [8, 11],
    movement: MovementPattern.Soar,
    homeRange: 15,
    speed: 0.6,
    rarity: 2,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 6, minMaturePlants: 4, minSpeciesDiversity: 3, attractedBySpecies: ['hazel', 'holly'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '{', fg: '#7a5a3a' }], [0, 0, { char: 'O', fg: '#eaca4a' }], [1, 0, { char: '}', fg: '#7a5a3a' }]] },
        { cells: [[-1, 0, { char: '{', fg: '#7a5a3a' }], [0, 0, { char: 'o', fg: '#daba3a' }], [1, 0, { char: '}', fg: '#7a5a3a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '\\', fg: '#8a6a4a' }], [0, 0, { char: 'O', fg: '#eaca4a' }], [1, 0, { char: '/', fg: '#8a6a4a' }]] },
        { cells: [[-1, 0, { char: '/', fg: '#8a6a4a' }], [0, 0, { char: 'O', fg: '#eaca4a' }], [1, 0, { char: '\\', fg: '#8a6a4a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'V', fg: '#5a3a1a' }]] },
      ],
    },
  },
};

/** Ordered list of all creature defs */
export const CREATURE_LIST: CreatureDef[] = Object.values(CREATURES);
