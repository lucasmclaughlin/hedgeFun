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

/** Simple deterministic hash for blending decisions */
function glyphHash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

/** Deterministic glyph selection from array */
function pickGlyph(glyphs: Glyph[], col: number, row: number): Glyph {
  const index = ((col * 7 + row * 13) % glyphs.length + glyphs.length) % glyphs.length;
  return glyphs[index];
}

/** Blend two hex colors by a ratio (0 = colorA, 1 = colorB) */
function blendColor(a: string, b: string, t: number): string {
  const ra = parseInt(a.substring(1, 3), 16), ga = parseInt(a.substring(3, 5), 16), ba = parseInt(a.substring(5, 7), 16);
  const rb = parseInt(b.substring(1, 3), 16), gb = parseInt(b.substring(3, 5), 16), bb = parseInt(b.substring(5, 7), 16);
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return '#' + ((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0');
}

/** Transition zone width in rows for soil layer boundaries */
const TRANSITION_ROWS = 3;

/** Get a background fill glyph for a position — with biome edge blending */
export function getBackgroundGlyph(col: number, row: number): Glyph {
  // Underground: row-aware soil sublayers with transition blending
  if (row >= 21) {
    // Determine primary and possible adjacent layer
    const h = glyphHash(col, row);

    // Topsoil-to-subsoil transition zone (rows 26-30): both layers can appear
    if (row >= 28 - TRANSITION_ROWS && row < 28 + TRANSITION_ROWS) {
      const distFromBoundary = row - 28; // negative = topsoil side, positive = subsoil side
      // Probability of showing the "other" layer's glyph — strongest at boundary, fades out
      const blendChance = 0.45 - Math.abs(distFromBoundary) * 0.12;
      if (blendChance > 0 && h < blendChance) {
        // Show glyph from the other side
        if (row < 28) {
          const g = pickGlyph(SUBSOIL_GLYPHS, col, row);
          return { char: g.char, fg: blendColor(g.fg, TOPSOIL_GLYPHS[0].fg, 0.3) };
        } else {
          const g = pickGlyph(TOPSOIL_GLYPHS, col, row);
          return { char: g.char, fg: blendColor(g.fg, SUBSOIL_GLYPHS[0].fg, 0.3) };
        }
      }
    }

    // Subsoil-to-bedrock transition zone (rows 38-44): both layers can appear
    if (row >= 41 - TRANSITION_ROWS && row < 41 + TRANSITION_ROWS) {
      const distFromBoundary = row - 41;
      const blendChance = 0.45 - Math.abs(distFromBoundary) * 0.12;
      if (blendChance > 0 && h < blendChance) {
        if (row < 41) {
          const g = pickGlyph(BEDROCK_GLYPHS, col, row);
          return { char: g.char, fg: blendColor(g.fg, SUBSOIL_GLYPHS[0].fg, 0.3) };
        } else {
          const g = pickGlyph(SUBSOIL_GLYPHS, col, row);
          return { char: g.char, fg: blendColor(g.fg, BEDROCK_GLYPHS[0].fg, 0.3) };
        }
      }
    }

    // Default layer glyph
    if (row >= 41) return pickGlyph(BEDROCK_GLYPHS, col, row);
    if (row >= 28) return pickGlyph(SUBSOIL_GLYPHS, col, row);
    return pickGlyph(TOPSOIL_GLYPHS, col, row);
  }

  const layer = getLayerForRow(row);
  const glyphs = LAYER_FILL_GLYPHS[layer];
  if (!glyphs) return { char: ' ', fg: '#222222' };
  return pickGlyph(glyphs, col, row);
}

/** Get the background color for a row — with smooth transitions at layer boundaries */
export function getBackgroundColor(row: number, col?: number): string {
  if (row >= 21) {
    // Smooth background color blending at soil boundaries
    // Topsoil → Subsoil transition (rows 26-30)
    if (row >= 28 - 2 && row < 28 + 2) {
      const t = (row - 26) / 4; // 0 at row 26, 1 at row 30
      // Add per-column jitter to break horizontal banding
      const jitter = col !== undefined ? (glyphHash(col, row + 999) * 0.2 - 0.1) : 0;
      return blendColor(TOPSOIL_BG, SUBSOIL_BG, Math.max(0, Math.min(1, t + jitter)));
    }
    // Subsoil → Bedrock transition (rows 39-43)
    if (row >= 41 - 2 && row < 41 + 2) {
      const t = (row - 39) / 4;
      const jitter = col !== undefined ? (glyphHash(col, row + 999) * 0.2 - 0.1) : 0;
      return blendColor(SUBSOIL_BG, BEDROCK_BG, Math.max(0, Math.min(1, t + jitter)));
    }

    if (row >= 41) return BEDROCK_BG;
    if (row >= 28) return SUBSOIL_BG;
    return TOPSOIL_BG;
  }

  const layer = getLayerForRow(row);
  const config = LAYER_CONFIGS.find(c => c.layer === layer);
  return config?.bgColor ?? '#0a0a0a';
}
