import { Glyph, Layer, LAYER_CONFIGS } from '@/types';

/** Background glyphs for each above-ground layer — muted, dark */
const LAYER_FILL_GLYPHS: Partial<Record<Layer, Glyph[]>> = {
  [Layer.Sky]: [
    { char: ' ', fg: '#3a3a4a' },
    { char: '.', fg: '#2a2a3a' },
    { char: ' ', fg: '#3a3a4a' },
    { char: ' ', fg: '#3a3a4a' },
    { char: '\u00B7', fg: '#4a4a5a' },
  ],
  [Layer.UpperCanopy]: [
    { char: ' ', fg: '#2a2a24' },
    { char: '{', fg: '#222220' },
  ],
  [Layer.MidCanopy]: [
    { char: ' ', fg: '#222220' },
    { char: '|', fg: '#1e1e18' },
  ],
  [Layer.LowerShrub]: [
    { char: ' ', fg: '#2a2a22' },
    { char: '.', fg: '#222218' },
    { char: ' ', fg: '#2a2a22' },
  ],
  [Layer.Ground]: [
    { char: '.', fg: '#504a3a' },
    { char: ',', fg: '#484230' },
    { char: '.', fg: '#554a3a' },
    { char: '_', fg: '#504a3a' },
    { char: ' ', fg: '#3a3528' },
  ],
};

/** Soil sublayer fill glyphs — dark underground */
const TOPSOIL_GLYPHS: Glyph[] = [
  { char: '%', fg: '#3a3020' },
  { char: '~', fg: '#302818' },
  { char: '.', fg: '#4a3a28' },
  { char: ',', fg: '#3a3020' },
  { char: ' ', fg: '#201a12' },
  { char: ' ', fg: '#201a12' },
  { char: ' ', fg: '#201a12' },
];

const SUBSOIL_GLYPHS: Glyph[] = [
  { char: '~', fg: '#3a3528' },
  { char: '.', fg: '#302c22' },
  { char: 'o', fg: '#3a3830' },
  { char: ' ', fg: '#222018' },
  { char: '-', fg: '#302c24' },
  { char: ' ', fg: '#222018' },
  { char: ' ', fg: '#222018' },
];

const BEDROCK_GLYPHS: Glyph[] = [
  { char: 'O', fg: '#3a3a42' },
  { char: 'o', fg: '#303038' },
  { char: '@', fg: '#353540' },
  { char: '#', fg: '#303035' },
  { char: '.', fg: '#24242c' },
  { char: ' ', fg: '#18181e' },
  { char: ' ', fg: '#18181e' },
  { char: ' ', fg: '#18181e' },
];

/** Soil sublayer background colors — very dark */
const TOPSOIL_BG = '#1c1810';
const SUBSOIL_BG = '#18150e';
const BEDROCK_BG = '#141418';

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
  if (row >= 41) return pickGlyph(BEDROCK_GLYPHS, col, row);
  if (row >= 28) return pickGlyph(SUBSOIL_GLYPHS, col, row);
  if (row >= 21) return pickGlyph(TOPSOIL_GLYPHS, col, row);

  const layer = getLayerForRow(row);
  const glyphs = LAYER_FILL_GLYPHS[layer];
  if (!glyphs) return { char: ' ', fg: '#222222' };
  return pickGlyph(glyphs, col, row);
}

/** Get the background color for a row */
export function getBackgroundColor(row: number): string {
  // Underground soil sublayers
  if (row >= 41) return BEDROCK_BG;
  if (row >= 28) return SUBSOIL_BG;
  if (row >= 21) return TOPSOIL_BG;

  const layer = getLayerForRow(row);
  const config = LAYER_CONFIGS.find(c => c.layer === layer);
  return config?.bgColor ?? '#0a0a0a';
}
