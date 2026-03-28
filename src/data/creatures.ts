import {
  Layer, CreatureBehavior, CreatureActivity, MovementPattern, WinterBehavior,
  type CreatureDef,
} from '@/types';

export const CREATURES: Record<string, CreatureDef> = {

  // ── Underground ──────────────────────────────

  earthworm: {
    id: 'earthworm',
    name: 'Earthworm',
    latin: 'Lumbricus terrestris',
    description: 'Aerates the soil and breaks down organic matter. A sign of healthy ground.',
    diet: 'Decaying leaves, organic debris, soil microbes',
    size: '10-30 cm long',
    nesting: 'Lives in vertical burrows up to 2m deep',
    funFact: 'Can eat its own body weight in soil each day. Has five pairs of hearts.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Burrowing],
    movingActivities: [CreatureActivity.Burrowing, CreatureActivity.Foraging],
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
    latin: 'Lucanus cervus',
    description: 'Impressive jaws and armored shell. Larvae feed on rotting wood underground.',
    diet: 'Tree sap, rotting fruit; larvae eat decaying wood',
    size: '3-7 cm, UK\'s largest beetle',
    nesting: 'Lays eggs in dead wood and old tree stumps',
    funFact: 'Larvae spend up to 7 years underground before emerging as adults.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Basking],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling],
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
    latin: 'Erinaceus europaeus',
    description: 'Prickly and nocturnal. Snuffles through leaf litter for slugs and beetles.',
    diet: 'Slugs, beetles, caterpillars, earthworms, fallen fruit',
    size: '20-30 cm, about the size of a grapefruit',
    nesting: 'Builds nests of leaves and grass under hedges and log piles',
    funFact: 'Has around 5,000 spines. Can roll into a ball in under a second.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Nesting],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Hunting, CreatureActivity.Patrolling],
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
    latin: 'Apodemus sylvaticus',
    description: 'Tiny and quick. Stores seeds and berries in underground caches.',
    diet: 'Seeds, berries, nuts, insects, snails',
    size: '8-10 cm body, plus a tail just as long',
    nesting: 'Burrows underground with multiple entrances and food stores',
    funFact: 'Can jump over 45 cm high. Creates complex networks of tunnels.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling, CreatureActivity.Hunting],
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
    latin: 'Bufo bufo',
    description: 'Warty and wonderful. Hunts slugs at dusk and hibernates under log piles.',
    diet: 'Slugs, snails, worms, ants, spiders',
    size: '8-13 cm, squat and broad',
    nesting: 'Shelters under logs, stones, and compost heaps',
    funFact: 'Returns to the same pond to breed each spring, sometimes walking over a mile.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Basking],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging, CreatureActivity.Patrolling],
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
        { cells: [[0, 0, { char: '^', fg: '#5a6a3a' }]] },
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
    latin: 'Troglodytes troglodytes',
    description: 'Tiny but mighty singer. Darts through dense undergrowth hunting insects.',
    diet: 'Spiders, insects, larvae — picks them from bark and crevices',
    size: '9-10 cm, weighs about the same as a one-pound coin',
    nesting: 'Male builds several dome-shaped nests of moss and leaves; female picks one',
    funFact: 'One of the loudest birds for its size — song can reach 90 decibels.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging, CreatureActivity.Patrolling],
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
        { cells: [[0, 0, { char: '>', fg: '#8a6a3a' }], [-1, 0, { char: '\'', fg: '#7a5a2a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#8a6a3a' }], [-1, 0, { char: ',', fg: '#7a5a2a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#9a7a4a' }], [-1, 0, { char: '\'', fg: '#7a5a2a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#9a7a4a' }], [-1, 0, { char: 'v', fg: '#7a5a2a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#6a4a2a' }]] },
      ],
    },
  },

  robin: {
    id: 'robin',
    name: 'Robin',
    latin: 'Erithacus rubecula',
    description: 'Bold and territorial with a flash of red. First to sing at dawn, last at dusk.',
    diet: 'Worms, insects, berries, seeds from the ground',
    size: '12-14 cm, compact and round',
    nesting: 'Open cup nest hidden in hedges, ivy, or old kettles',
    funFact: 'Fiercely territorial — will fight its own reflection. Sings year-round, even at night near streetlights.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Hunting, CreatureActivity.Patrolling],
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
        { cells: [[0, 0, { char: '>', fg: '#da5a3a' }], [-1, 0, { char: '.', fg: '#6a4a2a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#da5a3a' }], [-1, 0, { char: '.', fg: '#6a4a2a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#da5a3a' }], [-1, 0, { char: '\'', fg: '#7a5a3a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#da5a3a' }], [-1, 0, { char: 'v', fg: '#7a5a3a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#aa4a2a' }]] },
      ],
    },
  },

  dormouse: {
    id: 'dormouse',
    name: 'Dormouse',
    latin: 'Muscardinus avellanarius',
    description: 'Elusive and endangered. Builds nests in dense hedges and feasts on hazelnuts.',
    diet: 'Hazelnuts, berries, flowers, nectar, insects',
    size: '6-9 cm body, golden-orange fur, bushy tail',
    nesting: 'Woven ball of grass and bark strips, tucked in dense shrubs',
    funFact: 'Spends up to 7 months of the year hibernating. Name comes from the French "dormir" — to sleep.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Nesting],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Courting],
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
    latin: 'Columba palumbus',
    description: 'Portly and cooing. Nests high in the canopy and feeds on berries.',
    diet: 'Berries, seeds, grain, clover, young shoots',
    size: '38-43 cm, the UK\'s largest pigeon',
    nesting: 'Flimsy stick platform in tall trees or thick hedges',
    funFact: 'The familiar "coo-COO-coo, coo-coo" call. Crops can hold 150 grains at once.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Singing, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Courting, CreatureActivity.Patrolling],
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
    latin: 'Strix aluco',
    description: 'Silent hunter of the night. Needs tall trees for nesting. A sign of a mature hedge.',
    diet: 'Mice, voles, frogs, insects, small birds',
    size: '37-39 cm, stocky with a large round head',
    nesting: 'Tree hollows, old nest boxes, or large woodpecker holes',
    funFact: 'Can rotate its head 270 degrees. Asymmetric ears let it pinpoint prey by sound alone.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Nesting],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Patrolling],
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
