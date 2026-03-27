import { Glyph, Layer, LAYER_CONFIGS } from '@/types';

/** Background glyphs for each above-ground layer — muted grays */
const LAYER_FILL_GLYPHS: Partial<Record<Layer, Glyph[]>> = {
  [Layer.Sky]: [
    { char: ' ', fg: '#5a5a6a' },
    { char: '.', fg: '#4a4a5a' },
    { char: ' ', fg: '#5a5a6a' },
    { char: ' ', fg: '#5a5a6a' },
    { char: '\u00B7', fg: '#6a6a7a' },
  ],
  [Layer.UpperCanopy]: [
    { char: ' ', fg: '#4a4a42' },
    { char: '{', fg: '#3a3a32' },
  ],
  [Layer.MidCanopy]: [
    { char: ' ', fg: '#3a3a32' },
    { char: '|', fg: '#333328' },
  ],
  [Layer.LowerShrub]: [
    { char: ' ', fg: '#4a4a3a' },
    { char: '.', fg: '#3a3a30' },
    { char: ' ', fg: '#4a4a3a' },
  ],
  [Layer.Ground]: [
    { char: '.', fg: '#6a6050' },
    { char: ',', fg: '#5a5545' },
    { char: '.', fg: '#706555' },
    { char: '_', fg: '#6a6050' },
    { char: ' ', fg: '#504a3a' },
  ],
};

/** Soil sublayer fill glyphs — row-aware underground */
const TOPSOIL_GLYPHS: Glyph[] = [
  { char: '%', fg: '#5a4a30' },
  { char: '~', fg: '#4a3a22' },
  { char: '.', fg: '#6a5a40' },
  { char: ',', fg: '#5a4a30' },
  { char: ' ', fg: '#3a3020' },
  { char: ' ', fg: '#3a3020' },
  { char: ' ', fg: '#3a3020' },
];

const SUBSOIL_GLYPHS: Glyph[] = [
  { char: '~', fg: '#5a5040' },
  { char: '.', fg: '#4a4535' },
  { char: 'o', fg: '#5a5550' },
  { char: ' ', fg: '#3a3530' },
  { char: '-', fg: '#4a4540' },
  { char: ' ', fg: '#3a3530' },
  { char: ' ', fg: '#3a3530' },
];

const BEDROCK_GLYPHS: Glyph[] = [
  { char: 'O', fg: '#5a5a60' },
  { char: 'o', fg: '#4a4a55' },
  { char: '@', fg: '#555560' },
  { char: '#', fg: '#4a4a50' },
  { char: '.', fg: '#3a3a42' },
  { char: ' ', fg: '#2a2a32' },
  { char: ' ', fg: '#2a2a32' },
  { char: ' ', fg: '#2a2a32' },
];

/** Soil sublayer background colors */
const TOPSOIL_BG = '#2e2822';
const SUBSOIL_BG = '#2a2620';
const BEDROCK_BG = '#24242a';

/** Get the layer for a given row */
export function getLayerForRow(row: number): Layer {
  for (const config of LAYER_CONFIGS) {
    if (row >= config.startRow && row <= config.endRow) {
      return config.layer;
    }
  }
  return Layer.Ground;
}

/** Deterministic glyph selection from array */
function pickGlyph(glyphs: Glyph[], col: number, row: number): Glyph {
  const index = ((col * 7 + row * 13) % glyphs.length + glyphs.length) % glyphs.length;
  return glyphs[index];
}

/** Get a background fill glyph for a position — deterministic based on coords */
export function getBackgroundGlyph(col: number, row: number): Glyph {
  // Underground: row-aware soil sublayers
  if (row >= 36) return pickGlyph(BEDROCK_GLYPHS, col, row);
  if (row >= 23) return pickGlyph(SUBSOIL_GLYPHS, col, row);
  if (row >= 16) return pickGlyph(TOPSOIL_GLYPHS, col, row);

  const layer = getLayerForRow(row);
  const glyphs = LAYER_FILL_GLYPHS[layer];
  if (!glyphs) return { char: ' ', fg: '#333333' };
  return pickGlyph(glyphs, col, row);
}

/** Get the background color for a row */
export function getBackgroundColor(row: number): string {
  // Underground soil sublayers
  if (row >= 36) return BEDROCK_BG;
  if (row >= 23) return SUBSOIL_BG;
  if (row >= 16) return TOPSOIL_BG;

  const layer = getLayerForRow(row);
  const config = LAYER_CONFIGS.find(c => c.layer === layer);
  return config?.bgColor ?? '#0a0a0a';
}
