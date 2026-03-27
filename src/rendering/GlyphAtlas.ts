import { Glyph, Layer, LAYER_CONFIGS } from '@/types';

/** Background glyphs for each layer — what fills empty space */
const LAYER_FILL_GLYPHS: Record<Layer, Glyph[]> = {
  [Layer.Sky]: [
    { char: ' ', fg: '#8a8aba' },
    { char: '.', fg: '#7a7aaa' },
    { char: ' ', fg: '#8a8aba' },
    { char: ' ', fg: '#8a8aba' },
    { char: '·', fg: '#9a9aca' },
  ],
  [Layer.UpperCanopy]: [
    { char: ' ', fg: '#6a9a5a' },
    { char: '{', fg: '#5a8a4a' },
  ],
  [Layer.MidCanopy]: [
    { char: ' ', fg: '#5a8a4a' },
    { char: '|', fg: '#4a7a3a' },
  ],
  [Layer.LowerShrub]: [
    { char: ' ', fg: '#7a9a4a' },
    { char: '.', fg: '#6a8a3a' },
    { char: ' ', fg: '#7a9a4a' },
  ],
  [Layer.Ground]: [
    { char: '.', fg: '#a08050' },
    { char: ',', fg: '#907040' },
    { char: '.', fg: '#b09060' },
    { char: '_', fg: '#a08050' },
    { char: ' ', fg: '#806030' },
  ],
  [Layer.Underground]: [
    { char: '~', fg: '#7a6040' },
    { char: '.', fg: '#8a7050' },
    { char: '·', fg: '#7a6040' },
    { char: ' ', fg: '#5a4020' },
  ],
};

/** Get the layer for a given row */
export function getLayerForRow(row: number): Layer {
  for (const config of LAYER_CONFIGS) {
    if (row >= config.startRow && row <= config.endRow) {
      return config.layer;
    }
  }
  return Layer.Ground;
}

/** Get a background fill glyph for a position — deterministic based on coords */
export function getBackgroundGlyph(col: number, row: number): Glyph {
  const layer = getLayerForRow(row);
  const glyphs = LAYER_FILL_GLYPHS[layer];
  const index = ((col * 7 + row * 13) % glyphs.length + glyphs.length) % glyphs.length;
  return glyphs[index];
}

/** Get the background color for a row */
export function getBackgroundColor(row: number): string {
  const layer = getLayerForRow(row);
  const config = LAYER_CONFIGS.find(c => c.layer === layer);
  return config?.bgColor ?? '#0a0a0a';
}
