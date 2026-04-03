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

  rabbit: {
    id: 'rabbit',
    name: 'Rabbit',
    latin: 'Oryctolagus cuniculus',
    description: 'Gregarious grazer that digs extensive warrens under hedgerows. Most active at dawn and dusk.',
    diet: 'Grass, clover, wildflowers, bark, young shoots',
    size: '35-45 cm body, 1.2-2 kg',
    nesting: 'Excavates communal warrens with multiple entrances and nesting chambers lined with fur',
    funFact: 'Can sprint at 35 mph and their back legs are so powerful they can leap 3 metres in one bound.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling, CreatureActivity.Burrowing],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 10,
    speed: 1.5,
    rarity: 5,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'blackthorn', 'hazel'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '(', fg: '#9a8060' }], [0, 0, { char: ')', fg: '#aa9070' }], [0, -1, { char: '"', fg: '#aa9070' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#8a7050' }], [0, 0, { char: ')', fg: '#9a8060' }], [0, -1, { char: '"', fg: '#9a8060' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '(', fg: '#9a8060' }], [0, 0, { char: '>', fg: '#aa9070' }], [0, -1, { char: '"', fg: '#aa9070' }]] },
        { cells: [[-1, 0, { char: '-', fg: '#8a7050' }], [0, 0, { char: '>', fg: '#aa9070' }], [0, -1, { char: '/', fg: '#9a8060' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#7a6040' }]] },
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

  // ── Sky ──────────────────────────────

  pipistrelle: {
    id: 'pipistrelle',
    name: 'Pipistrelle Bat',
    latin: 'Pipistrellus pipistrellus',
    description: 'Tiny bat that swoops along hedgerows at dusk, hoovering up insects in flight.',
    diet: 'Midges, mosquitoes, moths, small flies',
    size: '3-5 cm body, 20 cm wingspan — fits in a matchbox',
    nesting: 'Roosts in tree crevices, bat boxes, or building gaps',
    funFact: 'Can eat 3,000 insects in a single night. Echolocates at frequencies too high for most humans to hear.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging],
    layer: Layer.Sky,
    rowRange: [0, 6],
    movement: MovementPattern.Flit,
    homeRange: 20,
    speed: 2.5,
    rarity: 4,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 5, minMaturePlants: 3, minSpeciesDiversity: 3 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: 'v', fg: '#4a3a2a' }]] },
        { cells: [[0, 0, { char: 'w', fg: '#4a3a2a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '\\', fg: '#3a2a1a' }], [0, 0, { char: 'v', fg: '#5a4a3a' }], [1, 0, { char: '/', fg: '#3a2a1a' }]] },
        { cells: [[-1, 0, { char: '/', fg: '#3a2a1a' }], [0, 0, { char: 'v', fg: '#5a4a3a' }], [1, 0, { char: '\\', fg: '#3a2a1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'W', fg: '#3a2a1a' }]] },
      ],
    },
  },

  redkite: {
    id: 'redkite',
    name: 'Red Kite',
    latin: 'Milvus milvus',
    description: 'Majestic raptor with a forked tail. Soars over hedgerows hunting for small mammals.',
    diet: 'Voles, mice, rabbits, carrion, earthworms',
    size: '60-66 cm body, 175-195 cm wingspan',
    nesting: 'Large stick nests in tall trees, decorated with rags and rubbish',
    funFact: 'Nearly went extinct in the UK — down to a single breeding pair in Wales. Now one of the great conservation success stories.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Patrolling],
    layer: Layer.Sky,
    rowRange: [0, 5],
    movement: MovementPattern.Soar,
    homeRange: 25,
    speed: 1.0,
    rarity: 2,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 8, minMaturePlants: 5, minSpeciesDiversity: 4 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '-', fg: '#8a3a1a' }], [0, 0, { char: 'V', fg: '#aa5a2a' }], [1, 0, { char: '-', fg: '#8a3a1a' }]] },
        { cells: [[-1, 0, { char: '-', fg: '#8a3a1a' }], [0, 0, { char: 'v', fg: '#aa5a2a' }], [1, 0, { char: '-', fg: '#8a3a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '\\', fg: '#9a4a2a' }], [0, 0, { char: 'V', fg: '#ba6a3a' }], [1, 0, { char: '/', fg: '#9a4a2a' }]] },
        { cells: [[-1, 0, { char: '/', fg: '#9a4a2a' }], [0, 0, { char: 'V', fg: '#ba6a3a' }], [1, 0, { char: '\\', fg: '#9a4a2a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'v', fg: '#6a2a0a' }]] },
      ],
    },
  },

  // ── Additional Ground ──────────────────────────────

  fox: {
    id: 'fox',
    name: 'Red Fox',
    latin: 'Vulpes vulpes',
    description: 'Cunning visitor that patrols hedgerows at dusk, hunting mice and foraging for berries.',
    diet: 'Mice, rabbits, birds, berries, earthworms, beetles',
    size: '60-90 cm body plus 40 cm tail',
    nesting: 'Digs earth dens (earths) under hedgerows and banks',
    funFact: 'Uses the Earth\'s magnetic field to pounce on prey hidden under snow. Has 28 different vocal calls.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Patrolling, CreatureActivity.Foraging],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Wander,
    homeRange: 15,
    speed: 1.2,
    rarity: 3,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 5, minMaturePlants: 3, minSpeciesDiversity: 3, attractedBySpecies: ['hawthorn', 'blackthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '(', fg: '#ba5a1a' }], [0, 0, { char: '^', fg: '#da7a2a' }], [1, 0, { char: ')', fg: '#ba5a1a' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#ba5a1a' }], [0, 0, { char: '"', fg: '#da7a2a' }], [1, 0, { char: ')', fg: '#ba5a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '>', fg: '#ca6a2a' }], [0, 0, { char: '-', fg: '#aa5a1a' }], [1, 0, { char: '~', fg: '#ba5a1a' }]] },
        { cells: [[-1, 0, { char: '>', fg: '#ca6a2a' }], [0, 0, { char: '~', fg: '#aa5a1a' }], [1, 0, { char: '-', fg: '#ba5a1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'C', fg: '#8a4a1a' }]] },
      ],
    },
  },

  snail: {
    id: 'snail',
    name: 'Garden Snail',
    latin: 'Cornu aspersum',
    description: 'Slow but steady. Grazes on plant matter and leaves silvery trails along the hedge base.',
    diet: 'Leaves, stems, flowers, decaying plant matter',
    size: '2-5 cm shell diameter',
    nesting: 'Shelters under logs, stones, and dense foliage',
    funFact: 'Has around 14,000 teeth on its tongue (radula). Can sleep for up to 3 years in drought conditions.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Burrow,
    homeRange: 3,
    speed: 0.15,
    rarity: 8,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 2, minMaturePlants: 0, minSpeciesDiversity: 1 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '@', fg: '#8a7a5a' }], [1, 0, { char: '_', fg: '#7a6a4a' }]] },
        { cells: [[0, 0, { char: '@', fg: '#7a6a4a' }], [1, 0, { char: '_', fg: '#7a6a4a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '@', fg: '#8a7a5a' }], [1, 0, { char: '_', fg: '#7a6a4a' }], [2, 0, { char: '_', fg: '#6a5a3a' }]] },
        { cells: [[0, 0, { char: '@', fg: '#8a7a5a' }], [1, 0, { char: '-', fg: '#7a6a4a' }], [2, 0, { char: '_', fg: '#6a5a3a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '@', fg: '#6a5a3a' }]] },
      ],
    },
  },

  shrew: {
    id: 'shrew',
    name: 'Common Shrew',
    latin: 'Sorex araneus',
    description: 'Tiny, frenetic insectivore with a pointed snout. Must eat every few hours or die.',
    diet: 'Beetles, woodlice, spiders, earthworms, slugs',
    size: '5-8 cm body, weighs 5-14g',
    nesting: 'Burrows in leaf litter and dense undergrowth',
    funFact: 'Has a venomous bite — one of the few venomous mammals. Heart beats 1,200 times per minute.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging, CreatureActivity.Patrolling],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 5,
    speed: 1.5,
    rarity: 6,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 2, minMaturePlants: 1, minSpeciesDiversity: 1 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#6a5a4a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#6a5a4a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#7a6a5a' }], [-1, 0, { char: '-', fg: '#5a4a3a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#7a6a5a' }], [-1, 0, { char: '>', fg: '#5a4a3a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'c', fg: '#5a4a3a' }]] },
      ],
    },
  },

  commonlizard: {
    id: 'commonlizard',
    name: 'Common Lizard',
    latin: 'Zootoca vivipara',
    description: 'Sun-loving reptile that basks on warm surfaces near hedge bases.',
    diet: 'Spiders, insects, small invertebrates',
    size: '10-15 cm including tail',
    nesting: 'Hides in dense vegetation, log piles, and stone walls',
    funFact: 'Can shed its tail to escape predators — it grows back but shorter. Gives birth to live young rather than laying eggs.',
    idleActivities: [CreatureActivity.Basking, CreatureActivity.Resting],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 4,
    speed: 1.8,
    rarity: 4,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'holly'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '~', fg: '#6a7a3a' }], [1, 0, { char: '>', fg: '#5a6a2a' }]] },
        { cells: [[0, 0, { char: '~', fg: '#5a6a2a' }], [1, 0, { char: '>', fg: '#6a7a3a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '~', fg: '#5a6a2a' }], [0, 0, { char: '~', fg: '#6a7a3a' }], [1, 0, { char: '>', fg: '#7a8a4a' }]] },
        { cells: [[-1, 0, { char: '-', fg: '#5a6a2a' }], [0, 0, { char: '~', fg: '#6a7a3a' }], [1, 0, { char: '>', fg: '#7a8a4a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'c', fg: '#4a5a1a' }]] },
      ],
    },
  },

  // ── Additional Shrub / Mid Canopy ──────────────────────────────

  redadmiral: {
    id: 'redadmiral',
    name: 'Red Admiral',
    latin: 'Vanessa atalanta',
    description: 'Striking butterfly with red-banded black wings. Visits hedgerow flowers and ripe fruit.',
    diet: 'Nectar from flowers, rotting fruit, sap',
    size: '6-7 cm wingspan',
    nesting: 'Lays eggs on nettle leaves near hedgerows',
    funFact: 'Migrates from North Africa to the UK each spring. Males are fiercely territorial and return to the same perch daily.',
    idleActivities: [CreatureActivity.Basking, CreatureActivity.Resting, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Courting],
    layer: Layer.MidCanopy,
    rowRange: [12, 14],
    movement: MovementPattern.Flit,
    homeRange: 12,
    speed: 1.8,
    rarity: 5,
    winterBehavior: WinterBehavior.Migrate,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['elder', 'dogrose'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '}', fg: '#cc2222' }], [0, 0, { char: '|', fg: '#1a1a1a' }], [1, 0, { char: '{', fg: '#cc2222' }]] },
        { cells: [[-1, 0, { char: ')', fg: '#aa1111' }], [0, 0, { char: '|', fg: '#1a1a1a' }], [1, 0, { char: '(', fg: '#aa1111' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '\\', fg: '#cc2222' }], [0, 0, { char: '|', fg: '#2a2a2a' }], [1, 0, { char: '/', fg: '#cc2222' }]] },
        { cells: [[-1, 0, { char: '/', fg: '#aa1111' }], [0, 0, { char: '|', fg: '#2a2a2a' }], [1, 0, { char: '\\', fg: '#aa1111' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '|', fg: '#6a1a1a' }]] },
      ],
    },
  },

  // ── Additional Underground ──────────────────────────────

  badger: {
    id: 'badger',
    name: 'Badger',
    latin: 'Meles meles',
    description: 'Powerful digger that creates vast sett networks under hedgerows. Mostly nocturnal.',
    diet: 'Earthworms, bulbs, cereals, small mammals, elderberries',
    size: '65-80 cm body, 11-15 kg',
    nesting: 'Excavates elaborate underground setts with multiple chambers and entrances',
    funFact: 'Setts can be hundreds of years old and passed down through generations. Very clean animals — use separate latrines.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Burrowing],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling, CreatureActivity.Burrowing],
    layer: Layer.Underground,
    rowRange: [21, 26],
    movement: MovementPattern.Wander,
    homeRange: 8,
    speed: 0.5,
    rarity: 2,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 6, minMaturePlants: 3, minSpeciesDiversity: 3, attractedBySpecies: ['elder', 'hazel'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '(', fg: '#aaaaaa' }], [0, 0, { char: ':', fg: '#1a1a1a' }], [1, 0, { char: ')', fg: '#aaaaaa' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#999999' }], [0, 0, { char: '.', fg: '#1a1a1a' }], [1, 0, { char: ')', fg: '#999999' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '(', fg: '#aaaaaa' }], [0, 0, { char: ':', fg: '#1a1a1a' }], [1, 0, { char: '>', fg: '#888888' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#999999' }], [0, 0, { char: ':', fg: '#1a1a1a' }], [1, 0, { char: '-', fg: '#888888' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'O', fg: '#777777' }]] },
      ],
    },
  },

  slowworm: {
    id: 'slowworm',
    name: 'Slow Worm',
    latin: 'Anguis fragilis',
    description: 'Not a worm or a snake — a legless lizard! Hides under warm cover near hedgerows.',
    diet: 'Slugs, snails, earthworms, spiders',
    size: '30-50 cm, smooth and shiny',
    nesting: 'Shelters under flat stones, corrugated metal, log piles, and compost heaps',
    funFact: 'Can live for over 30 years — one of the longest-lived lizards. Can shed its tail like other lizards.',
    idleActivities: [CreatureActivity.Basking, CreatureActivity.Resting],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging],
    layer: Layer.Underground,
    rowRange: [21, 24],
    movement: MovementPattern.Burrow,
    homeRange: 4,
    speed: 0.3,
    rarity: 4,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'blackthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '~', fg: '#8a7a5a' }], [1, 0, { char: '~', fg: '#7a6a4a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#8a7a5a' }], [1, 0, { char: '~', fg: '#7a6a4a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '~', fg: '#6a5a3a' }], [0, 0, { char: '~', fg: '#8a7a5a' }], [1, 0, { char: '>', fg: '#7a6a4a' }]] },
        { cells: [[-1, 0, { char: '-', fg: '#6a5a3a' }], [0, 0, { char: '~', fg: '#8a7a5a' }], [1, 0, { char: '~', fg: '#7a6a4a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#5a4a2a' }]] },
      ],
    },
  },

  // ── Additional Upper Canopy ──────────────────────────────

  barnowl: {
    id: 'barnowl',
    name: 'Barn Owl',
    latin: 'Tyto alba',
    description: 'Ghostly white hunter that quarters hedgerow fields at dusk. Needs tall trees nearby.',
    diet: 'Voles, mice, shrews, small birds',
    size: '33-39 cm, heart-shaped face',
    nesting: 'Tree hollows, barn lofts, owl boxes — avoids building new nests',
    funFact: 'Can locate prey in total darkness using hearing alone. Eats up to 4 voles per night.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Nesting],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Patrolling],
    layer: Layer.UpperCanopy,
    rowRange: [8, 11],
    movement: MovementPattern.Soar,
    homeRange: 18,
    speed: 0.8,
    rarity: 2,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 8, minMaturePlants: 5, minSpeciesDiversity: 4, attractedBySpecies: ['hazel', 'hawthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '{', fg: '#ddd0c0' }], [0, 0, { char: 'O', fg: '#eeeeee' }], [1, 0, { char: '}', fg: '#ddd0c0' }]] },
        { cells: [[-1, 0, { char: '{', fg: '#ccc0b0' }], [0, 0, { char: 'o', fg: '#dddddd' }], [1, 0, { char: '}', fg: '#ccc0b0' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '\\', fg: '#ddd0c0' }], [0, 0, { char: 'O', fg: '#eeeeee' }], [1, 0, { char: '/', fg: '#ddd0c0' }]] },
        { cells: [[-1, 0, { char: '/', fg: '#ddd0c0' }], [0, 0, { char: 'O', fg: '#eeeeee' }], [1, 0, { char: '\\', fg: '#ddd0c0' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'U', fg: '#aaa090' }]] },
      ],
    },
  },

  // ── Balanced batch: insects, birds, mammals, amphibians ──────────────────

  // ── Insects ──────────────────────────────

  bumblebee: {
    id: 'bumblebee',
    name: 'Bumblebee',
    latin: 'Bombus terrestris',
    description: 'Fuzzy pollinator that buzzes between hedge flowers. Nests in old mouse holes underground.',
    diet: 'Nectar and pollen from wildflowers, hedge blossoms',
    size: '1.5-2.5 cm, plump and furry',
    nesting: 'Underground in abandoned rodent burrows, also tussock grass',
    funFact: 'Shouldn\'t be able to fly according to early aerodynamic models. Can heat itself to 37\u00B0C by vibrating its flight muscles.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling],
    layer: Layer.LowerShrub,
    rowRange: [15, 19],
    movement: MovementPattern.Flit,
    homeRange: 12,
    speed: 2.2,
    rarity: 7,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2, attractedBySpecies: ['dogrose', 'elder', 'hawthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '*', fg: '#eaaa20' }]] },
        { cells: [[0, 0, { char: 'o', fg: '#daa010' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '*', fg: '#eaaa20' }], [-1, 0, { char: '.', fg: '#8a8a8a' }]] },
        { cells: [[0, 0, { char: 'o', fg: '#daa010' }], [-1, 0, { char: '\'', fg: '#8a8a8a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '.', fg: '#9a7a10' }]] },
      ],
    },
  },

  ladybird: {
    id: 'ladybird',
    name: 'Seven-spot Ladybird',
    latin: 'Coccinella septempunctata',
    description: 'Bright red beetle that devours aphids. A gardener\'s best friend in the hedge.',
    diet: 'Aphids, scale insects, mites — up to 50 aphids a day',
    size: '5-8 mm, dome-shaped',
    nesting: 'Overwinters in leaf litter, bark crevices, and hedge bases in large groups',
    funFact: 'Bleeds foul-tasting yellow fluid from its knees when threatened. A single larva eats 400 aphids before pupating.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Basking, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging],
    layer: Layer.LowerShrub,
    rowRange: [16, 19],
    movement: MovementPattern.Wander,
    homeRange: 4,
    speed: 0.4,
    rarity: 7,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 2, minMaturePlants: 1, minSpeciesDiversity: 1 },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: 'o', fg: '#dd2a1a' }]] },
        { cells: [[0, 0, { char: '*', fg: '#cc2010' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: 'o', fg: '#dd2a1a' }], [1, 0, { char: '.', fg: '#aa1a0a' }]] },
        { cells: [[0, 0, { char: '*', fg: '#cc2010' }], [1, 0, { char: '\'', fg: '#aa1a0a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '.', fg: '#8a1a0a' }]] },
      ],
    },
  },

  spider: {
    id: 'spider',
    name: 'Garden Spider',
    latin: 'Araneus diadematus',
    description: 'Master web-builder that strings orbs between hedge branches to catch flying insects.',
    diet: 'Flies, moths, aphids, mosquitoes — anything caught in the web',
    size: '1-1.5 cm body, females larger than males',
    nesting: 'Builds orb webs in sheltered hedge gaps; egg sac hidden in rolled leaves',
    funFact: 'Eats and rebuilds its entire web every night. Silk is stronger per weight than steel.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Nesting],
    movingActivities: [CreatureActivity.Hunting],
    layer: Layer.LowerShrub,
    rowRange: [15, 19],
    movement: MovementPattern.Burrow,
    homeRange: 2,
    speed: 0.3,
    rarity: 8,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 2, minMaturePlants: 1, minSpeciesDiversity: 1, attractedBySpecies: ['hawthorn', 'blackthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '#', fg: '#7a6a4a' }]] },
        { cells: [[0, 0, { char: '*', fg: '#6a5a3a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '#', fg: '#7a6a4a' }], [1, 0, { char: '~', fg: '#5a5a5a' }]] },
        { cells: [[0, 0, { char: '*', fg: '#6a5a3a' }], [1, 0, { char: '-', fg: '#5a5a5a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: '.', fg: '#4a3a2a' }]] },
      ],
    },
  },

  // ── Additional birds ──────────────────────────────

  bluetit: {
    id: 'bluetit',
    name: 'Blue Tit',
    latin: 'Cyanistes caeruleus',
    description: 'Acrobatic little bird in blue and yellow. Hangs upside down to pick insects from leaves.',
    diet: 'Caterpillars, insects, seeds, peanuts from feeders',
    size: '11-12 cm, weighs about 11g',
    nesting: 'Tree holes, nest boxes — lines the cup with moss, hair, and feathers',
    funFact: 'A nesting pair can feed their chicks 1,000 caterpillars a day. Learnt to open milk bottle tops in the 1920s.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Hunting],
    layer: Layer.MidCanopy,
    rowRange: [12, 14],
    movement: MovementPattern.Flit,
    homeRange: 8,
    speed: 1.8,
    rarity: 8,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2, attractedBySpecies: ['hazel', 'hawthorn', 'elder'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#4a8aca' }], [-1, 0, { char: '.', fg: '#daba2a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#4a8aca' }], [-1, 0, { char: ',', fg: '#caaa1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#5a9ada' }], [-1, 0, { char: '\'', fg: '#daba2a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#5a9ada' }], [-1, 0, { char: 'v', fg: '#caaa1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#3a6a9a' }]] },
      ],
    },
  },

  goldfinch: {
    id: 'goldfinch',
    name: 'Goldfinch',
    latin: 'Carduelis carduelis',
    description: 'Dazzling red, gold, and black. Twittering flocks (called "charms") feed on thistles and seeds.',
    diet: 'Thistle seeds, teasel, dandelion, alder, birch seeds',
    size: '12-13 cm, fine pointed beak',
    nesting: 'Neat cup of moss and lichen in hedge forks, lined with thistledown',
    funFact: 'A group is called a "charm" — from the Old English for their tinkling song. Became a symbol of the Passion in Renaissance art.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling],
    layer: Layer.MidCanopy,
    rowRange: [12, 14],
    movement: MovementPattern.Flit,
    homeRange: 10,
    speed: 1.6,
    rarity: 6,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 3, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'elder'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#da3a1a' }], [-1, 0, { char: '.', fg: '#eaca2a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#ca2a0a' }], [-1, 0, { char: ',', fg: '#daba1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#da3a1a' }], [-1, 0, { char: '\'', fg: '#eaca2a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#da3a1a' }], [-1, 0, { char: 'v', fg: '#daba1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#9a2a0a' }]] },
      ],
    },
  },

  blackbird: {
    id: 'blackbird',
    name: 'Blackbird',
    latin: 'Turdus merula',
    description: 'Glossy black male with orange beak sings from the highest hedge-top at dawn and dusk.',
    diet: 'Earthworms, berries, insects, fruit — a hedge generalist',
    size: '24-27 cm, chunky thrush',
    nesting: 'Sturdy mud-lined cup in dense hedgerow, ivy, or shrubs',
    funFact: 'One of the first birds to sing in the morning and last at night. Males are jet black; females are brown.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Hunting, CreatureActivity.Patrolling],
    layer: Layer.LowerShrub,
    rowRange: [15, 19],
    movement: MovementPattern.Hop,
    homeRange: 8,
    speed: 1.0,
    rarity: 8,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 2, minMaturePlants: 1, minSpeciesDiversity: 1, attractedBySpecies: ['hawthorn', 'elder', 'holly'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#1a1a1a' }], [-1, 0, { char: '.', fg: '#da8a1a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#2a2a2a' }], [-1, 0, { char: ',', fg: '#ca7a0a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#1a1a1a' }], [-1, 0, { char: '\'', fg: '#da8a1a' }], [1, 0, { char: '-', fg: '#2a2a2a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#2a2a2a' }], [-1, 0, { char: 'v', fg: '#ca7a0a' }], [1, 0, { char: '-', fg: '#1a1a1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#1a1a1a' }]] },
      ],
    },
  },

  yellowhammer: {
    id: 'yellowhammer',
    name: 'Yellowhammer',
    latin: 'Emberiza citrinella',
    description: 'Bright yellow bunting that sings "a-little-bit-of-bread-and-no-cheese" from hedgerow perches.',
    diet: 'Seeds, grain, insects in summer — feeds chicks almost entirely on invertebrates',
    size: '16-17 cm, streaky yellow and brown',
    nesting: 'Bulky cup on or near the ground in hedge bottoms and ditches',
    funFact: 'Beethoven\'s 5th Symphony opening is said to mimic its song. Population halved since the 1980s due to hedge loss.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling],
    layer: Layer.LowerShrub,
    rowRange: [17, 19],
    movement: MovementPattern.Hop,
    homeRange: 6,
    speed: 0.8,
    rarity: 4,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'blackthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#eaca2a' }], [-1, 0, { char: '.', fg: '#caaa1a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#daba1a' }], [-1, 0, { char: ',', fg: '#ba9a0a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#eaca2a' }], [-1, 0, { char: '\'', fg: '#caaa1a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#eaca2a' }], [-1, 0, { char: 'v', fg: '#ba9a0a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#9a8a0a' }]] },
      ],
    },
  },

  songthrush: {
    id: 'songthrush',
    name: 'Song Thrush',
    latin: 'Turdus philomelos',
    description: 'Speckled songster that smashes snails on stone "anvils". Repeats each song phrase three times.',
    diet: 'Snails, worms, berries, insects — famous for smashing snails on rocks',
    size: '20-23 cm, warm brown with spotted breast',
    nesting: 'Neat cup in dense hedge, lined with smooth mud',
    funFact: 'Uses a favourite stone as an anvil to crack snail shells. Each bird has its own personal anvil it returns to.',
    idleActivities: [CreatureActivity.Singing, CreatureActivity.Resting, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Hunting],
    layer: Layer.LowerShrub,
    rowRange: [15, 19],
    movement: MovementPattern.Hop,
    homeRange: 8,
    speed: 0.9,
    rarity: 5,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'holly', 'elder'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '>', fg: '#8a6a3a' }], [-1, 0, { char: ':', fg: '#aa8a5a' }]] },
        { cells: [[0, 0, { char: ')', fg: '#7a5a2a' }], [-1, 0, { char: '.', fg: '#9a7a4a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '>', fg: '#8a6a3a' }], [-1, 0, { char: '\'', fg: '#aa8a5a' }], [1, 0, { char: '-', fg: '#7a5a2a' }]] },
        { cells: [[0, 0, { char: '-', fg: '#8a6a3a' }], [-1, 0, { char: 'v', fg: '#9a7a4a' }], [1, 0, { char: '-', fg: '#7a5a2a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#5a4a1a' }]] },
      ],
    },
  },

  // ── Additional mammals ──────────────────────────────

  stoat: {
    id: 'stoat',
    name: 'Stoat',
    latin: 'Mustela erminea',
    description: 'Fierce little predator with a black-tipped tail. Bounds along hedge banks hunting rabbits.',
    diet: 'Rabbits, voles, birds, eggs — can take prey much larger than itself',
    size: '17-32 cm body, slender and sinuous',
    nesting: 'Uses rabbit burrows, rock crevices, or tree roots lined with prey fur',
    funFact: 'Turns white in winter (called ermine) in northern regions. Hypnotises rabbits by "dancing" wildly before striking.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Patrolling],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 12,
    speed: 2.0,
    rarity: 3,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'blackthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[-1, 0, { char: '(', fg: '#ba8a4a' }], [0, 0, { char: ':', fg: '#ca9a5a' }], [1, 0, { char: '~', fg: '#1a1a1a' }]] },
        { cells: [[-1, 0, { char: '(', fg: '#aa7a3a' }], [0, 0, { char: '.', fg: '#ba8a4a' }], [1, 0, { char: '~', fg: '#1a1a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '~', fg: '#ba8a4a' }], [0, 0, { char: '>', fg: '#ca9a5a' }], [1, 0, { char: '~', fg: '#1a1a1a' }]] },
        { cells: [[-1, 0, { char: '-', fg: '#aa7a3a' }], [0, 0, { char: '>', fg: '#ca9a5a' }], [1, 0, { char: '-', fg: '#1a1a1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'c', fg: '#8a6a2a' }]] },
      ],
    },
  },

  bankvole: {
    id: 'bankvole',
    name: 'Bank Vole',
    latin: 'Myodes glareolus',
    description: 'Chestnut-furred rodent that scurries through hedge bottoms collecting berries and seeds.',
    diet: 'Berries, seeds, nuts, fungi, roots, bark, insects',
    size: '8-12 cm body, blunt nose and small ears',
    nesting: 'Shallow burrows under tree roots, or nests of grass and moss in hedge bases',
    funFact: 'Can climb surprisingly well — often found high in hedges eating hawthorn berries. Lives just 18 months.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Grooming, CreatureActivity.Foraging],
    movingActivities: [CreatureActivity.Foraging, CreatureActivity.Patrolling],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 5,
    speed: 1.0,
    rarity: 6,
    winterBehavior: WinterBehavior.Active,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2, attractedBySpecies: ['hazel', 'hawthorn', 'blackthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: 'n', fg: '#aa5a2a' }]] },
        { cells: [[0, 0, { char: 'n', fg: '#9a4a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: 'n', fg: '#aa5a2a' }], [-1, 0, { char: '~', fg: '#8a4a1a' }]] },
        { cells: [[0, 0, { char: '>', fg: '#aa5a2a' }], [-1, 0, { char: '-', fg: '#8a4a1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'c', fg: '#7a3a0a' }]] },
      ],
    },
  },

  // ── Additional amphibians ──────────────────────────────

  frog: {
    id: 'frog',
    name: 'Common Frog',
    latin: 'Rana temporaria',
    description: 'Smooth-skinned jumper that hunts in damp hedge bottoms. Migrates to ponds in spring.',
    diet: 'Slugs, snails, worms, insects, spiders',
    size: '6-9 cm, smooth skin with dark eye patch',
    nesting: 'Breeds in ponds; spends most of the year in damp hedgerows and woodland edges',
    funFact: 'Can breathe through its skin. A single female can lay 2,000 eggs in one jelly-like clump.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Basking],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging],
    layer: Layer.Ground,
    rowRange: [20, 20],
    movement: MovementPattern.Hop,
    homeRange: 6,
    speed: 1.4,
    rarity: 6,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 3, minMaturePlants: 1, minSpeciesDiversity: 2, attractedBySpecies: ['elder', 'hawthorn'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '&', fg: '#4a7a2a' }]] },
        { cells: [[0, 0, { char: '&', fg: '#3a6a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[0, 0, { char: '&', fg: '#4a7a2a' }]] },
        { cells: [[0, 0, { char: '^', fg: '#5a8a3a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#2a4a0a' }]] },
      ],
    },
  },

  newt: {
    id: 'newt',
    name: 'Smooth Newt',
    latin: 'Lissotriton vulgaris',
    description: 'Spotted amphibian that hides under logs and stones near hedgerows. Males grow a wavy crest in spring.',
    diet: 'Tadpoles, small insects, worms, slugs, water fleas',
    size: '7-11 cm, slender with a spotted belly',
    nesting: 'Breeds in ponds, wrapping eggs in leaves; lives on land rest of the year under stones and logs',
    funFact: 'Males develop a spectacular wavy crest along their back and tail during breeding season to impress females.',
    idleActivities: [CreatureActivity.Resting, CreatureActivity.Basking],
    movingActivities: [CreatureActivity.Hunting, CreatureActivity.Foraging],
    layer: Layer.Underground,
    rowRange: [21, 24],
    movement: MovementPattern.Wander,
    homeRange: 4,
    speed: 0.3,
    rarity: 4,
    winterBehavior: WinterBehavior.Hibernate,
    habitat: { minPlants: 4, minMaturePlants: 2, minSpeciesDiversity: 2, attractedBySpecies: ['hawthorn', 'elder'] },
    frames: {
      [CreatureBehavior.Idle]: [
        { cells: [[0, 0, { char: '~', fg: '#6a5a2a' }], [1, 0, { char: '.', fg: '#5a4a1a' }]] },
        { cells: [[0, 0, { char: 's', fg: '#6a5a2a' }], [1, 0, { char: '.', fg: '#5a4a1a' }]] },
      ],
      [CreatureBehavior.Moving]: [
        { cells: [[-1, 0, { char: '~', fg: '#4a3a0a' }], [0, 0, { char: '~', fg: '#6a5a2a' }], [1, 0, { char: '>', fg: '#5a4a1a' }]] },
        { cells: [[-1, 0, { char: '-', fg: '#4a3a0a' }], [0, 0, { char: '~', fg: '#6a5a2a' }], [1, 0, { char: '~', fg: '#5a4a1a' }]] },
      ],
      [CreatureBehavior.Sleeping]: [
        { cells: [[0, 0, { char: 'o', fg: '#3a2a0a' }]] },
      ],
    },
  },
};

/** Ordered list of all creature defs */
export const CREATURE_LIST: CreatureDef[] = Object.values(CREATURES);
