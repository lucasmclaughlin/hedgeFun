import { Layer, VillagerPersonality } from '@/types';
import type { VillagerDef } from '@/types';

/**
 * Starter villagers for hedgeFriends mode.
 * Frames match the ASCII art from the main hedgeFun creature definitions.
 */
export const VILLAGERS: Record<string, VillagerDef> = {
  mrs_bramble: {
    id: 'mrs_bramble',
    name: 'Mrs. Bramble',
    species: 'hedgehog',
    personality: VillagerPersonality.Culinary,
    nestingLayer: Layer.Ground,
    houseWidth: 7,
    houseHeight: 6,
    preferredPlants: ['hawthorn', 'blackthorn', 'elder'],
    // Hedgehog: (")(") idle, (">) moving, @ sleeping
    idleFrames: [
      { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '"', fg: '#aa8a4a' }], [1, 0, { char: ')', fg: '#8a6a3a' }]] },
      { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '"', fg: '#9a7a3a' }], [1, 0, { char: ')', fg: '#8a6a3a' }]] },
    ],
    walkFrames: [
      { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '"', fg: '#aa8a4a' }], [1, 0, { char: '>', fg: '#7a5a2a' }]] },
      { cells: [[-1, 0, { char: '(', fg: '#8a6a3a' }], [0, 0, { char: '^', fg: '#aa8a4a' }], [1, 0, { char: '>', fg: '#7a5a2a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: '@', fg: '#7a5a2a' }]] },
    possessions: [
      'teapot', 'pie', 'jam_jar', 'biscuit_tin',
      'recipe_book', 'flour_sack', 'honey_pot', 'cake_stand',
    ],
    dailyRoutine: {
      0: 'snoozing under a patchwork quilt',
      1: 'snoozing under a patchwork quilt',
      2: 'putting the kettle on',
      3: 'making nut biscuits',
      4: 'visiting a neighbour for lunch',
      5: 'bottling elderflower cordial',
      6: 'sitting outside watching the sunset',
      7: 'reading recipes by candlelight',
    },
    visitPreferences: ['mr_hazlewood', 'jenny_wren'],
    description: 'A stout hedgehog in a flour-dusted apron. Her kitchen always smells of baking.',
  },

  mr_hazlewood: {
    id: 'mr_hazlewood',
    name: 'Mr. Hazlewood',
    species: 'dormouse',
    personality: VillagerPersonality.Bookish,
    nestingLayer: Layer.LowerShrub,
    houseWidth: 6,
    houseHeight: 5,
    preferredPlants: ['hazel', 'dogrose', 'blackthorn'],
    // Dormouse: n idle, >~ moving, @ sleeping
    idleFrames: [
      { cells: [[0, 0, { char: 'n', fg: '#ca9a5a' }]] },
      { cells: [[0, 0, { char: 'n', fg: '#ba8a4a' }]] },
    ],
    walkFrames: [
      { cells: [[0, 0, { char: '>', fg: '#ca9a5a' }], [-1, 0, { char: '~', fg: '#aa7a3a' }]] },
      { cells: [[0, 0, { char: 'n', fg: '#ca9a5a' }], [-1, 0, { char: '-', fg: '#aa7a3a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: '@', fg: '#9a7a3a' }]] },
    possessions: [
      'bookshelf', 'reading_lamp', 'quill_pen', 'ink_pot',
      'spectacles', 'letter', 'notebook', 'pressed_flower',
    ],
    dailyRoutine: {
      0: 'snoozing in a nest of shredded pages',
      1: 'snoozing in a nest of shredded pages',
      2: 'brewing hazelnut coffee',
      3: 'reading a thick leather-bound volume',
      4: 'visiting a neighbour for tea',
      5: 'writing in a tiny journal',
      6: 'visiting a neighbour for hedgerow wine',
      7: 'dozing off over a book',
    },
    visitPreferences: ['mrs_bramble', 'jenny_wren'],
    description: 'A small round dormouse with half-moon spectacles. Always misplacing his bookmark.',
  },

  jenny_wren: {
    id: 'jenny_wren',
    name: 'Jenny Wren',
    species: 'wren',
    personality: VillagerPersonality.Crafty,
    nestingLayer: Layer.LowerShrub,
    houseWidth: 5,
    houseHeight: 5,
    preferredPlants: ['hawthorn', 'dogrose', 'holly'],
    // Wren: >' idle, >' moving, o sleeping
    idleFrames: [
      { cells: [[0, 0, { char: '>', fg: '#8a6a3a' }], [-1, 0, { char: '\'', fg: '#7a5a2a' }]] },
      { cells: [[0, 0, { char: ')', fg: '#8a6a3a' }], [-1, 0, { char: ',', fg: '#7a5a2a' }]] },
    ],
    walkFrames: [
      { cells: [[0, 0, { char: '>', fg: '#9a7a4a' }], [-1, 0, { char: '\'', fg: '#7a5a2a' }]] },
      { cells: [[0, 0, { char: '-', fg: '#9a7a4a' }], [-1, 0, { char: 'v', fg: '#7a5a2a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: 'o', fg: '#6a4a2a' }]] },
    possessions: [
      'thimble', 'needle_cushion', 'yarn_basket', 'quilt_square',
      'scissors', 'button_box', 'ribbon_spool', 'tiny_hat',
    ],
    dailyRoutine: {
      0: 'snoozing in a woven nest',
      1: 'snoozing in a woven nest',
      2: 'making acorn-cap tea',
      3: 'stitching a tiny scarf',
      4: 'visiting a neighbour for elevenses',
      5: 'weaving a new basket',
      6: 'singing on the doorstep',
      7: 'mending socks by rushlight',
    },
    visitPreferences: ['mrs_bramble', 'mr_hazlewood'],
    description: 'A tiny wren with a bright eye and a talent for sewing. Her house is full of colourful scraps.',
  },

  prof_strix: {
    id: 'prof_strix',
    name: 'Prof. Strix',
    species: 'tawny owl',
    personality: VillagerPersonality.Bookish,
    nestingLayer: Layer.MidCanopy,
    houseWidth: 7,
    houseHeight: 7,
    preferredPlants: ['hawthorn', 'elder', 'hazel'],
    // Tawny owl: {O} idle, \O/ moving, V sleeping
    idleFrames: [
      { cells: [[-1, 0, { char: '{', fg: '#7a5a3a' }], [0, 0, { char: 'O', fg: '#eaca4a' }], [1, 0, { char: '}', fg: '#7a5a3a' }]] },
      { cells: [[-1, 0, { char: '{', fg: '#7a5a3a' }], [0, 0, { char: 'o', fg: '#daba3a' }], [1, 0, { char: '}', fg: '#7a5a3a' }]] },
    ],
    walkFrames: [
      { cells: [[-1, 0, { char: '\\', fg: '#8a6a4a' }], [0, 0, { char: 'O', fg: '#eaca4a' }], [1, 0, { char: '/', fg: '#8a6a4a' }]] },
      { cells: [[-1, 0, { char: '/', fg: '#8a6a4a' }], [0, 0, { char: 'O', fg: '#eaca4a' }], [1, 0, { char: '\\', fg: '#8a6a4a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: 'V', fg: '#5a3a1a' }]] },
    possessions: [
      'bookshelf', 'reading_lamp', 'ink_pot', 'quill_pen',
      'spectacles', 'letter', 'notebook', 'pressed_flower',
    ],
    dailyRoutine: {
      0: 'cataloguing moths by lamplight',
      1: 'reading ancient bark-scrolls',
      2: 'snoozing on a high branch',
      3: 'snoozing on a high branch',
      4: 'snoozing on a high branch',
      5: 'brewing strong acorn coffee',
      6: 'visiting a neighbour for hedgerow wine',
      7: 'writing observations in a journal',
    },
    visitPreferences: ['mr_hazlewood', 'jenny_wren'],
    description: 'A tawny owl with enormous spectacles and a passion for natural history. Nocturnal, naturally.',
  },

  robin_postman: {
    id: 'robin_postman',
    name: 'Robin Redbreast',
    species: 'robin',
    personality: VillagerPersonality.Cozy,
    nestingLayer: Layer.LowerShrub,
    houseWidth: 5,
    houseHeight: 5,
    preferredPlants: ['holly', 'hawthorn', 'dogrose'],
    // Robin: >. idle, >' moving, o sleeping
    idleFrames: [
      { cells: [[0, 0, { char: '>', fg: '#da5a3a' }], [-1, 0, { char: '.', fg: '#6a4a2a' }]] },
      { cells: [[0, 0, { char: ')', fg: '#da5a3a' }], [-1, 0, { char: '.', fg: '#6a4a2a' }]] },
    ],
    walkFrames: [
      { cells: [[0, 0, { char: '>', fg: '#da5a3a' }], [-1, 0, { char: '\'', fg: '#7a5a3a' }]] },
      { cells: [[0, 0, { char: '-', fg: '#da5a3a' }], [-1, 0, { char: 'v', fg: '#7a5a3a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: 'o', fg: '#aa4a2a' }]] },
    possessions: [
      'letter', 'ribbon_spool', 'teapot', 'pressed_flower',
      'tiny_hat', 'notebook', 'button_box', 'quilt_square',
    ],
    dailyRoutine: {
      0: 'snoozing under a holly leaf',
      1: 'singing the dawn chorus',
      2: 'delivering the morning post',
      3: 'visiting a neighbour with letters',
      4: 'having lunch on a fence post',
      5: 'sorting seeds into tiny envelopes',
      6: 'visiting a neighbour for tea',
      7: 'preening feathers by candlelight',
    },
    visitPreferences: ['mrs_bramble', 'jenny_wren', 'prof_strix'],
    description: 'The village postman. Cheerful, punctual, and always knows the gossip.',
  },

  old_brock: {
    id: 'old_brock',
    name: 'Old Brock',
    species: 'badger',
    personality: VillagerPersonality.Crafty,
    nestingLayer: Layer.Ground,
    houseWidth: 8,
    houseHeight: 6,
    preferredPlants: ['hawthorn', 'blackthorn', 'elder'],
    // Badger: (:) idle, (:> moving, O sleeping
    idleFrames: [
      { cells: [[-1, 0, { char: '(', fg: '#aaaaaa' }], [0, 0, { char: ':', fg: '#1a1a1a' }], [1, 0, { char: ')', fg: '#aaaaaa' }]] },
      { cells: [[-1, 0, { char: '(', fg: '#999999' }], [0, 0, { char: '.', fg: '#1a1a1a' }], [1, 0, { char: ')', fg: '#999999' }]] },
    ],
    walkFrames: [
      { cells: [[-1, 0, { char: '(', fg: '#aaaaaa' }], [0, 0, { char: ':', fg: '#1a1a1a' }], [1, 0, { char: '>', fg: '#888888' }]] },
      { cells: [[-1, 0, { char: '(', fg: '#999999' }], [0, 0, { char: ':', fg: '#1a1a1a' }], [1, 0, { char: '-', fg: '#888888' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: 'O', fg: '#777777' }]] },
    possessions: [
      'scissors', 'thimble', 'yarn_basket', 'button_box',
      'honey_pot', 'flour_sack', 'recipe_book', 'quilt_square',
    ],
    dailyRoutine: {
      0: 'snoozing in a deep burrow',
      1: 'snoozing in a deep burrow',
      2: 'making strong tea with honey',
      3: 'carving a wooden spoon',
      4: 'visiting a neighbour for elevenses',
      5: 'mending a chair leg',
      6: 'smoking a pipe on the doorstep',
      7: 'telling stories by the fire',
    },
    visitPreferences: ['mrs_bramble', 'mr_hazlewood', 'prof_strix'],
    description: 'A gruff but kind old badger. The village carpenter and unofficial mayor.',
  },

  mr_tod: {
    id: 'mr_tod',
    name: 'Mr. Tod',
    species: 'fox',
    personality: VillagerPersonality.Culinary,
    nestingLayer: Layer.Ground,
    houseWidth: 7,
    houseHeight: 6,
    preferredPlants: ['elder', 'hazel', 'dogrose'],
    // Fox: (^) idle, >-~ moving, C sleeping
    idleFrames: [
      { cells: [[-1, 0, { char: '(', fg: '#ba5a1a' }], [0, 0, { char: '^', fg: '#da7a2a' }], [1, 0, { char: ')', fg: '#ba5a1a' }]] },
      { cells: [[-1, 0, { char: '(', fg: '#ba5a1a' }], [0, 0, { char: '"', fg: '#da7a2a' }], [1, 0, { char: ')', fg: '#ba5a1a' }]] },
    ],
    walkFrames: [
      { cells: [[-1, 0, { char: '>', fg: '#ca6a2a' }], [0, 0, { char: '-', fg: '#aa5a1a' }], [1, 0, { char: '~', fg: '#ba5a1a' }]] },
      { cells: [[-1, 0, { char: '>', fg: '#ca6a2a' }], [0, 0, { char: '~', fg: '#aa5a1a' }], [1, 0, { char: '-', fg: '#ba5a1a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: 'C', fg: '#8a4a1a' }]] },
    possessions: [
      'teapot', 'pie', 'jam_jar', 'cake_stand',
      'recipe_book', 'honey_pot', 'flour_sack', 'biscuit_tin',
    ],
    dailyRoutine: {
      0: 'snoozing by the embers',
      1: 'snoozing by the embers',
      2: 'grinding coffee beans',
      3: 'baking sourdough bread',
      4: 'visiting a neighbour for lunch',
      5: 'pickling blackberries',
      6: 'visiting a neighbour for supper',
      7: 'reading a recipe by firelight',
    },
    visitPreferences: ['mrs_bramble', 'old_brock', 'robin_postman'],
    description: 'A dapper fox who runs the village bakery. His sourdough is legendary.',
  },

  mrs_paddock: {
    id: 'mrs_paddock',
    name: 'Mrs. Paddock',
    species: 'toad',
    personality: VillagerPersonality.Gardener,
    nestingLayer: Layer.Ground,
    houseWidth: 6,
    houseHeight: 5,
    preferredPlants: ['dogrose', 'hawthorn', 'elder'],
    // Toad: & idle, &/^ moving, o sleeping
    idleFrames: [
      { cells: [[0, 0, { char: '&', fg: '#5a6a3a' }]] },
      { cells: [[0, 0, { char: '&', fg: '#4a5a2a' }]] },
    ],
    walkFrames: [
      { cells: [[0, 0, { char: '&', fg: '#5a6a3a' }]] },
      { cells: [[0, 0, { char: '^', fg: '#5a6a3a' }]] },
    ],
    sleepFrame: { cells: [[0, 0, { char: 'o', fg: '#3a4a1a' }]] },
    possessions: [
      'pressed_flower', 'honey_pot', 'teapot', 'notebook',
      'ribbon_spool', 'jam_jar', 'quilt_square', 'button_box',
    ],
    dailyRoutine: {
      0: 'snoozing under a dock leaf',
      1: 'snoozing under a dock leaf',
      2: 'watering the herb garden',
      3: 'potting seedlings',
      4: 'visiting a neighbour for herbal tea',
      5: 'pressing flowers into a journal',
      6: 'sitting outside watching fireflies',
      7: 'mixing a soothing balm',
    },
    visitPreferences: ['jenny_wren', 'mrs_bramble', 'old_brock'],
    description: 'A wise toad with green fingers. Her remedies cure all manner of hedgerow ailments.',
  },
};

/** Ordered list for iteration */
export const VILLAGER_LIST: VillagerDef[] = Object.values(VILLAGERS);
