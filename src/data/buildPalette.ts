import type { PaletteCategory } from '@/types';

/**
 * Building palette for hedgeFriends mode.
 * 6 categories navigated with number keys 1-6.
 * A/D to browse within a category. Space to place.
 */
export const BUILD_PALETTE: PaletteCategory[] = [
  {
    name: 'Walls',
    items: [
      { char: '|', fg: '#8b6d4a' },
      { char: '-', fg: '#8b6d4a' },
      { char: '=', fg: '#7a5c3a' },
      { char: '#', fg: '#6b4d2a' },
      { char: '[', fg: '#9a7a5a' },
      { char: ']', fg: '#9a7a5a' },
      { char: '{', fg: '#7a6040' },
      { char: '}', fg: '#7a6040' },
      { char: '+', fg: '#8b6d4a' },
      { char: '%', fg: '#6b5030' },
    ],
  },
  {
    name: 'Doors',
    items: [
      { char: 'n', fg: '#c4a060' },
      { char: 'D', fg: '#b08040' },
      { char: 'd', fg: '#c4a060' },
      { char: 'A', fg: '#b08040' },
      { char: 'o', fg: '#c4a060' },
      { char: 'O', fg: '#d4b070' },
    ],
  },
  {
    name: 'Windows',
    items: [
      { char: 'o', fg: '#aaccee' },
      { char: 'O', fg: '#88aacc' },
      { char: '0', fg: '#ccddaa' },
      { char: '*', fg: '#eeddaa' },
      { char: '.', fg: '#aaccee' },
      { char: ':', fg: '#eeddaa' },
    ],
  },
  {
    name: 'Roof',
    items: [
      { char: '^', fg: '#6a6a7a' },
      { char: '/', fg: '#7a7060' },
      { char: '\\', fg: '#7a7060' },
      { char: '~', fg: '#8a7a50' },
      { char: '_', fg: '#6a6a7a' },
      { char: 'v', fg: '#6a5a4a' },
      { char: 'M', fg: '#6a6a7a' },
      { char: 'W', fg: '#8a7a50' },
    ],
  },
  {
    name: 'Nature',
    items: [
      { char: '@', fg: '#4a8a3a' },
      { char: 'Y', fg: '#5a9a4a' },
      { char: '*', fg: '#da6a8a' },
      { char: ',', fg: '#5aaa3a' },
      { char: '.', fg: '#4a7a3a' },
      { char: '{', fg: '#6aba4a' },
      { char: '}', fg: '#6aba4a' },
      { char: 'f', fg: '#5a9a4a' },
      { char: 'T', fg: '#7a5a3a' },
      { char: '&', fg: '#4a8a2a' },
    ],
  },
  {
    name: 'Items',
    items: [
      { char: '?', fg: '#eebb44' },
      { char: '$', fg: '#cc8844' },
      { char: '!', fg: '#ee6644' },
      { char: '&', fg: '#ddaa66' },
      { char: 'i', fg: '#aaaacc' },
      { char: 'j', fg: '#88aacc' },
      { char: 'u', fg: '#ccaa88' },
      { char: 'p', fg: '#aa8866' },
      { char: 's', fg: '#ccbbaa' },
      { char: 'w', fg: '#ddccbb' },
    ],
  },
];
