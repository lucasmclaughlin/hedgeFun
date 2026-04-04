import type { Glyph } from '@/types';

/** Furniture/item definition for village interiors */
export interface FurnitureDef {
  id: string;
  name: string;
  glyph: Glyph;
  /** Description shown in tooltips */
  description: string;
}

/**
 * All possible furniture items that can appear in villager homes.
 * Used by the interior generator and possession cycling system.
 */
export const FURNITURE: Record<string, FurnitureDef> = {
  // ── Hearth & warmth ──
  fireplace:     { id: 'fireplace',     name: 'Fireplace',       glyph: { char: '#', fg: '#dd6633' }, description: 'A crackling hearth' },
  armchair:      { id: 'armchair',      name: 'Armchair',        glyph: { char: '&', fg: '#bb8855' }, description: 'A well-worn armchair' },
  rug:           { id: 'rug',           name: 'Rug',             glyph: { char: '~', fg: '#994433' }, description: 'A braided rug' },
  cushion:       { id: 'cushion',       name: 'Cushion',         glyph: { char: 'o', fg: '#cc6666' }, description: 'A plump cushion' },
  quilt:         { id: 'quilt',         name: 'Patchwork Quilt', glyph: { char: '%', fg: '#aa6644' }, description: 'A cosy patchwork quilt' },

  // ── Study ──
  bookshelf:     { id: 'bookshelf',     name: 'Bookshelf',       glyph: { char: ']', fg: '#aa7755' }, description: 'Stuffed with tiny volumes' },
  desk:          { id: 'desk',          name: 'Writing Desk',    glyph: { char: '_', fg: '#aa8855' }, description: 'Covered in ink spots' },
  reading_lamp:  { id: 'reading_lamp',  name: 'Reading Lamp',    glyph: { char: '?', fg: '#eebb44' }, description: 'A beeswax candle lamp' },
  quill_pen:     { id: 'quill_pen',     name: 'Quill Pen',       glyph: { char: '/', fg: '#8888aa' }, description: 'A feather quill' },
  ink_pot:       { id: 'ink_pot',       name: 'Ink Pot',         glyph: { char: 'o', fg: '#333366' }, description: 'Blackberry ink' },
  spectacles:    { id: 'spectacles',    name: 'Spectacles',      glyph: { char: '8', fg: '#aaaacc' }, description: 'Half-moon spectacles' },
  letter:        { id: 'letter',        name: 'Letter',          glyph: { char: '-', fg: '#ddddbb' }, description: 'A letter from a friend' },
  notebook:      { id: 'notebook',      name: 'Notebook',        glyph: { char: '=', fg: '#aa8866' }, description: 'Full of observations' },
  pressed_flower:{ id: 'pressed_flower',name: 'Pressed Flower',  glyph: { char: '*', fg: '#ddaa88' }, description: 'A dried hedge-rose' },

  // ── Kitchen ──
  stove:         { id: 'stove',         name: 'Wood Stove',      glyph: { char: '#', fg: '#888888' }, description: 'Always warm' },
  table:         { id: 'table',         name: 'Kitchen Table',   glyph: { char: '=', fg: '#aa8855' }, description: 'Scarred with knife marks' },
  kettle:        { id: 'kettle',        name: 'Kettle',          glyph: { char: '$', fg: '#cc8844' }, description: 'A blackened copper kettle' },
  teapot:        { id: 'teapot',        name: 'Teapot',          glyph: { char: '$', fg: '#ddaa66' }, description: 'Brown betty, well-used' },
  pie:           { id: 'pie',           name: 'Pie',             glyph: { char: 'n', fg: '#ddaa66' }, description: 'Fresh from the oven' },
  jam_jar:       { id: 'jam_jar',       name: 'Jam Jar',         glyph: { char: 'o', fg: '#cc4466' }, description: 'Blackberry jam' },
  biscuit_tin:   { id: 'biscuit_tin',   name: 'Biscuit Tin',     glyph: { char: 'u', fg: '#ccaa88' }, description: 'Nut biscuits inside' },
  recipe_book:   { id: 'recipe_book',   name: 'Recipe Book',     glyph: { char: '=', fg: '#aa7755' }, description: 'Splattered with batter' },
  flour_sack:    { id: 'flour_sack',    name: 'Flour Sack',      glyph: { char: '%', fg: '#ccccaa' }, description: 'Stone-ground acorn flour' },
  honey_pot:     { id: 'honey_pot',     name: 'Honey Pot',       glyph: { char: 'o', fg: '#ddaa44' }, description: 'Wild hedgerow honey' },
  cake_stand:    { id: 'cake_stand',    name: 'Cake Stand',      glyph: { char: 'T', fg: '#ccaa88' }, description: 'A tiered cake stand' },

  // ── Craft ──
  workbench:     { id: 'workbench',     name: 'Workbench',       glyph: { char: '=', fg: '#aa8855' }, description: 'Tools neatly arranged' },
  yarn_basket:   { id: 'yarn_basket',   name: 'Yarn Basket',     glyph: { char: 'U', fg: '#cc6688' }, description: 'Rainbow wool' },
  needle_cushion:{ id: 'needle_cushion',name: 'Pin Cushion',     glyph: { char: 'o', fg: '#dd8866' }, description: 'Bristling with pins' },
  thimble:       { id: 'thimble',       name: 'Thimble',         glyph: { char: 'u', fg: '#ccaa88' }, description: 'A brass thimble' },
  scissors:      { id: 'scissors',      name: 'Scissors',        glyph: { char: 'X', fg: '#aaaacc' }, description: 'Sharp as a beak' },
  button_box:    { id: 'button_box',    name: 'Button Box',      glyph: { char: '[', fg: '#aa8855' }, description: 'Every colour imaginable' },
  ribbon_spool:  { id: 'ribbon_spool',  name: 'Ribbon Spool',    glyph: { char: '@', fg: '#cc88aa' }, description: 'Silk ribbons' },
  quilt_square:  { id: 'quilt_square',  name: 'Quilt Square',    glyph: { char: '%', fg: '#88aacc' }, description: 'A work in progress' },
  tiny_hat:      { id: 'tiny_hat',      name: 'Tiny Hat',        glyph: { char: '^', fg: '#aa6688' }, description: 'Fashionable hedgewear' },

  // ── Garden ──
  plant_pot:     { id: 'plant_pot',     name: 'Plant Pot',       glyph: { char: 'Y', fg: '#5aaa4a' }, description: 'A healthy fern' },
  plant_pot2:    { id: 'plant_pot2',    name: 'Plant Pot',       glyph: { char: 'Y', fg: '#6aba5a' }, description: 'A trailing ivy' },
  watering_can:  { id: 'watering_can',  name: 'Watering Can',    glyph: { char: 'J', fg: '#88aacc' }, description: 'Galvanised tin' },
  seed_box:      { id: 'seed_box',      name: 'Seed Box',        glyph: { char: '[', fg: '#aa8855' }, description: 'Labelled in tiny script' },
  herbs:         { id: 'herbs',         name: 'Herb Bunch',      glyph: { char: '{', fg: '#4a8a3a' }, description: 'Rosemary, thyme, and sage' },
  flower:        { id: 'flower',        name: 'Dried Flowers',   glyph: { char: '*', fg: '#ddaa88' }, description: 'A posy of hedgerow blooms' },

  // ── Interior fixtures ──
  fire_glow:     { id: 'fire_glow',     name: 'Firelight',       glyph: { char: '^', fg: '#ee8833' }, description: 'Warm flickering flames' },
  bookshelf2:    { id: 'bookshelf2',    name: 'Bookshelf',       glyph: { char: '[', fg: '#997755' }, description: 'Overflowing with almanacs' },
  lamp:          { id: 'lamp',          name: 'Oil Lamp',        glyph: { char: '?', fg: '#eebb44' }, description: 'A warm steady flame' },
  quill:         { id: 'quill',         name: 'Quill Pen',       glyph: { char: '/', fg: '#8888aa' }, description: 'A goose feather quill' },
  yarn:          { id: 'yarn',          name: 'Yarn Ball',       glyph: { char: '@', fg: '#cc6688' }, description: 'Soft dyed wool' },
  fabric:        { id: 'fabric',        name: 'Fabric Roll',     glyph: { char: '%', fg: '#88aacc' }, description: 'Fine woven cloth' },
  flour:         { id: 'flour',         name: 'Flour Sack',      glyph: { char: '%', fg: '#ccccaa' }, description: 'Acorn flour, stone-ground' },

  // ── Wall shelves & pantry ──
  stove:         { id: 'stove',         name: 'Wood Stove',      glyph: { char: '#', fg: '#888888' }, description: 'Click to cook something!' },
  shelf:         { id: 'shelf',         name: 'Shelf',           glyph: { char: '-', fg: '#8a7a5a' }, description: 'A sturdy oak shelf' },
  acorn_cup:     { id: 'acorn_cup',     name: 'Acorn Cup',       glyph: { char: 'u', fg: '#aa8855' }, description: 'An acorn cap filled with dried berries' },
  dried_berries: { id: 'dried_berries', name: 'Dried Berries',   glyph: { char: ':', fg: '#cc4466' }, description: 'Strings of dried elderberries and sloes' },
  preserves:     { id: 'preserves',     name: 'Preserves',       glyph: { char: 'o', fg: '#ddaa44' }, description: 'Jars of hedgerow preserves' },
  hanging_herbs: { id: 'hanging_herbs', name: 'Hanging Herbs',   glyph: { char: '{', fg: '#5a8a3a' }, description: 'Bunches of rosemary, thyme, and sage drying' },
  copper_pan:    { id: 'copper_pan',    name: 'Copper Pan',      glyph: { char: 'Q', fg: '#cc8844' }, description: 'A well-seasoned copper saucepan' },
  spice_rack:    { id: 'spice_rack',    name: 'Spice Rack',      glyph: { char: '!', fg: '#aa7744' }, description: 'Tiny jars of wild pepper, mustard seed, and dried garlic' },
  ladle:         { id: 'ladle',         name: 'Ladle',           glyph: { char: 'J', fg: '#aaaaaa' }, description: 'A long-handled wooden ladle' },
  rolling_pin:   { id: 'rolling_pin',   name: 'Rolling Pin',     glyph: { char: '=', fg: '#bb9966' }, description: 'Smooth beechwood, well-used' },
  cheese_wheel:  { id: 'cheese_wheel',  name: 'Cheese Wheel',    glyph: { char: 'O', fg: '#ddcc55' }, description: 'A small wheel of hedgerow cheese' },
  candle:        { id: 'candle',        name: 'Candle',          glyph: { char: 'i', fg: '#eebb44' }, description: 'Beeswax candle, softly glowing' },
  clock:         { id: 'clock',         name: 'Wall Clock',      glyph: { char: 'O', fg: '#aa8855' }, description: 'A little wind-up clock, always slightly fast' },
  picture:       { id: 'picture',       name: 'Picture Frame',   glyph: { char: '#', fg: '#887766' }, description: 'A tiny painting of the hedgerow in spring' },
  mirror:        { id: 'mirror',        name: 'Mirror',          glyph: { char: 'O', fg: '#aabbcc' }, description: 'A small round looking-glass' },
  hat_peg:       { id: 'hat_peg',       name: 'Hat Peg',         glyph: { char: 'T', fg: '#8a7a5a' }, description: 'A wooden peg with a tiny hat hanging from it' },
  herb_bundle:   { id: 'herb_bundle',   name: 'Herb Bundle',     glyph: { char: '}', fg: '#5a8a3a' }, description: 'Dried lavender and chamomile tied with string' },
  basket_shelf:  { id: 'basket_shelf',  name: 'Basket',          glyph: { char: 'U', fg: '#aa8855' }, description: 'A woven basket of hazelnuts and acorns' },
  cobweb:        { id: 'cobweb',        name: 'Cobweb',          glyph: { char: '*', fg: '#555555' }, description: 'A dusty cobweb in the corner — adds character' },
  pipe_rack:     { id: 'pipe_rack',     name: 'Pipe Rack',       glyph: { char: 'J', fg: '#8a6a3a' }, description: 'A rack of carved briar pipes' },
  wood_shavings: { id: 'wood_shavings', name: 'Wood Shavings',   glyph: { char: '~', fg: '#ccaa77' }, description: 'Curly shavings from the workbench' },
  spool_rack:    { id: 'spool_rack',    name: 'Spool Rack',      glyph: { char: '|', fg: '#cc88aa' }, description: 'Rows of colourful thread spools' },
  pattern_board: { id: 'pattern_board', name: 'Pattern Board',   glyph: { char: '#', fg: '#aabb88' }, description: 'Pinned-up sewing patterns and fabric swatches' },
  dried_flowers: { id: 'dried_flowers', name: 'Dried Flowers',   glyph: { char: '*', fg: '#cc88aa' }, description: 'A garland of dried roses and cornflowers' },
  trowel:        { id: 'trowel',        name: 'Trowel',          glyph: { char: '/', fg: '#888888' }, description: 'A well-worn garden trowel' },
  terracotta:    { id: 'terracotta',    name: 'Terracotta Pot',  glyph: { char: 'U', fg: '#cc6633' }, description: 'A small terracotta pot with a seedling' },
};
