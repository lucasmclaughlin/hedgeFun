import { Glyph, Layer, SoilBiome, LAYER_CONFIGS } from '@/types';

const SKY_END_ROW = 7; // rows 0–7 are always sky

// ── Above-ground layer fill glyphs ────────────────────────────────────────

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

// ── Underground glyph sets — one per biome ────────────────────────────────

const TOPSOIL_BIOME: Record<SoilBiome, Glyph[]> = {
  [SoilBiome.Loam]: [
    { char: '%', fg: '#3a3020' }, { char: '~', fg: '#302818' },
    { char: '.', fg: '#4a3a28' }, { char: ',', fg: '#3a3020' },
    { char: ' ', fg: '#201a12' }, { char: ' ', fg: '#201a12' },
  ],
  [SoilBiome.Clay]: [
    { char: '=', fg: '#3a3530' }, { char: '-', fg: '#302c28' },
    { char: '.', fg: '#3c3834' }, { char: ' ', fg: '#28241e' },
    { char: ' ', fg: '#28241e' }, { char: 'o', fg: '#302e28' },
  ],
  [SoilBiome.Chalk]: [
    { char: '.', fg: '#6a6a72' }, { char: 'o', fg: '#5a5a60' },
    { char: ',', fg: '#707078' }, { char: ' ', fg: '#505058' },
    { char: ' ', fg: '#505058' }, { char: '·', fg: '#7a7a82' },
  ],
  [SoilBiome.Peat]: [
    { char: '%', fg: '#1e1a0e' }, { char: '~', fg: '#16120a' },
    { char: '.', fg: '#2a2214' }, { char: ',', fg: '#1e1810' },
    { char: ' ', fg: '#100e08' }, { char: ' ', fg: '#100e08' },
  ],
  [SoilBiome.Sandy]: [
    { char: '.', fg: '#5a5030' }, { char: ',', fg: '#4a4228' },
    { char: "'", fg: '#605838' }, { char: ' ', fg: '#403820' },
    { char: ' ', fg: '#403820' }, { char: ' ', fg: '#403820' },
  ],
};

const SUBSOIL_BIOME: Record<SoilBiome, Glyph[]> = {
  [SoilBiome.Loam]: [
    { char: '~', fg: '#3a3528' }, { char: '.', fg: '#302c22' },
    { char: 'o', fg: '#3a3830' }, { char: ' ', fg: '#222018' },
    { char: '-', fg: '#302c24' }, { char: ' ', fg: '#222018' },
  ],
  [SoilBiome.Clay]: [
    { char: '=', fg: '#363230' }, { char: '-', fg: '#2c2a26' },
    { char: 'o', fg: '#383432' }, { char: ' ', fg: '#222028' },
    { char: ' ', fg: '#222028' }, { char: '.', fg: '#2e2c2a' },
  ],
  [SoilBiome.Chalk]: [
    { char: 'o', fg: '#585860' }, { char: '.', fg: '#484850' },
    { char: '-', fg: '#606068' }, { char: ' ', fg: '#404048' },
    { char: ' ', fg: '#404048' }, { char: 'O', fg: '#686870' },
  ],
  [SoilBiome.Peat]: [
    { char: '~', fg: '#18140a' }, { char: '.', fg: '#120e06' },
    { char: ',', fg: '#1e180e' }, { char: ' ', fg: '#0e0a04' },
    { char: ' ', fg: '#0e0a04' }, { char: '%', fg: '#1c160c' },
  ],
  [SoilBiome.Sandy]: [
    { char: '.', fg: '#504830' }, { char: ',', fg: '#403828' },
    { char: ' ', fg: '#383022' }, { char: ' ', fg: '#383022' },
    { char: '-', fg: '#484038' }, { char: ' ', fg: '#383022' },
  ],
};

const BEDROCK_GLYPHS: Glyph[] = [
  { char: 'O', fg: '#3a3a42' }, { char: 'o', fg: '#303038' },
  { char: '@', fg: '#353540' }, { char: '#', fg: '#303035' },
  { char: '.', fg: '#24242c' }, { char: ' ', fg: '#18181e' },
  { char: ' ', fg: '#18181e' }, { char: ' ', fg: '#18181e' },
];

// ── Background colors per biome / layer ───────────────────────────────────

const TOPSOIL_BG: Record<SoilBiome, string> = {
  [SoilBiome.Loam]:  '#1c1810',
  [SoilBiome.Clay]:  '#1a1816',
  [SoilBiome.Chalk]: '#1c1c22',
  [SoilBiome.Peat]:  '#100c06',
  [SoilBiome.Sandy]: '#1e1a0c',
};

const SUBSOIL_BG: Record<SoilBiome, string> = {
  [SoilBiome.Loam]:  '#18150e',
  [SoilBiome.Clay]:  '#161414',
  [SoilBiome.Chalk]: '#18181e',
  [SoilBiome.Peat]:  '#0c0a04',
  [SoilBiome.Sandy]: '#1a160c',
};

const BEDROCK_BG = '#141418';

// ── Helpers ───────────────────────────────────────────────────────────────

/** Deterministic glyph selection from array */
function pickGlyph(glyphs: Glyph[], col: number, row: number): Glyph {
  const index = ((col * 7 + row * 13) % glyphs.length + glyphs.length) % glyphs.length;
  return glyphs[index];
}

/** Get the Layer for an above-ground row, proportional to the vegetation zone. */
function aboveGroundLayer(row: number, colGroundRow: number): Layer {
  if (row <= SKY_END_ROW) return Layer.Sky;
  // Vegetation zone: rows (SKY_END_ROW+1) to (colGroundRow-1)
  const vegTop    = SKY_END_ROW + 1;
  const vegBottom = colGroundRow - 1;
  const vegSize   = Math.max(1, vegBottom - vegTop);
  const relPos    = (row - vegTop) / vegSize;
  if (relPos < 0.35) return Layer.UpperCanopy;
  if (relPos < 0.60) return Layer.MidCanopy;
  return Layer.LowerShrub;
}

// ── Public API ────────────────────────────────────────────────────────────

/** Get the layer for a given row (uses static LAYER_CONFIGS — kept for compatibility). */
export function getLayerForRow(row: number): Layer {
  for (const config of LAYER_CONFIGS) {
    if (row >= config.startRow && row <= config.endRow) return config.layer;
  }
  return Layer.Ground;
}

/**
 * Background fill glyph for a cell.
 * colGroundRow — the terrain surface row for this column.
 * biome        — soil biome for this column (affects underground appearance).
 */
export function getBackgroundGlyph(
  col: number,
  row: number,
  colGroundRow: number,
  biome: SoilBiome = SoilBiome.Loam,
): Glyph {
  const depth = row - colGroundRow;

  // Underground — depth-relative soil layers
  if (depth > 0) {
    if (depth <= 7)  return pickGlyph(TOPSOIL_BIOME[biome], col, row);
    if (depth <= 20) return pickGlyph(SUBSOIL_BIOME[biome], col, row);
    return pickGlyph(BEDROCK_GLYPHS, col, row);
  }

  // Ground row itself
  if (depth === 0) {
    const glyphs = LAYER_FILL_GLYPHS[Layer.Ground]!;
    return pickGlyph(glyphs, col, row);
  }

  // Above ground — layer by proportional position in vegetation zone
  const layer = aboveGroundLayer(row, colGroundRow);
  const glyphs = LAYER_FILL_GLYPHS[layer];
  return glyphs ? pickGlyph(glyphs, col, row) : { char: ' ', fg: '#222222' };
}

/**
 * Background fill colour for a cell.
 * colGroundRow — terrain surface row for this column.
 * biome        — soil biome for this column.
 */
export function getBackgroundColor(
  row: number,
  colGroundRow: number,
  biome: SoilBiome = SoilBiome.Loam,
): string {
  const depth = row - colGroundRow;
  if (depth > 20) return BEDROCK_BG;
  if (depth > 7)  return SUBSOIL_BG[biome];
  if (depth > 0)  return TOPSOIL_BG[biome];
  // At or above ground — use above-ground layer config color
  const layer  = aboveGroundLayer(row, colGroundRow);
  const config = LAYER_CONFIGS.find(c => c.layer === layer);
  return config?.bgColor ?? '#0a0a0a';
}
