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
  watering_can:  { id: 'watering_can',  name: 'Watering Can',    glyph: { char: 'J', fg: '#88aacc' }, description: 'Galvanised tin' },
  seed_box:      { id: 'seed_box',      name: 'Seed Box',        glyph: { char: '[', fg: '#aa8855' }, description: 'Labelled in tiny script' },
};
