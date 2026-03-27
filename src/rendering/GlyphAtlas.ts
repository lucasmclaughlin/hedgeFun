import { Glyph, Layer, LAYER_CONFIGS } from '@/types';

/** Background glyphs for each layer — what fills empty space */
const LAYER_FILL_GLYPHS: Record<Layer, Glyph[]> = {
  [Layer.Sky]: [
    { char: ' ', fg: '#4a4a6a' },
    { char: '.', fg: '#3a3a5a' },
    { char: ' ', fg: '#4a4a6a' },
    { char: ' ', fg: '#4a4a6a' },
    { char: '·', fg: '#5a5a7a' },
  ],
  [Layer.UpperCanopy]: [
    { char: ' ', fg: '#3a5a3a' },
    { char: ' ', fg: '#2a4a2a' },
  ],
  [Layer.MidCanopy]: [
    { char: ' ', fg: '#2a4a2a' },
    { char: ' ', fg: '#1a3a1a' },
  ],
  [Layer.LowerShrub]: [
    { char: ' ', fg: '#3a4a2a' },
    { char: '.', fg: '#2a3a1a' },
    { char: ' ', fg: '#3a4a2a' },
  ],
  [Layer.Ground]: [
    { char: '.', fg: '#5a4a2a' },
    { char: ',', fg: '#4a3a1a' },
    { char: '.', fg: '#6a5a3a' },
    { char: '_', fg: '#5a4a2a' },
    { char: ' ', fg: '#3a2a1a' },
  ],
  [Layer.Underground]: [
    { char: '~', fg: '#3a2a0a' },
    { char: '.', fg: '#4a3a1a' },
    { char: '·', fg: '#3a2a0a' },
    { char: ' ', fg: '#2a1a0a' },
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
