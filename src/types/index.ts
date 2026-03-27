/** A single cell in the ASCII grid */
export interface Glyph {
  char: string;
  fg: string;
  bg?: string;
}

/** Vertical layer zones in the hedgerow world */
export enum Layer {
  Sky = 0,
  UpperCanopy = 1,
  MidCanopy = 2,
  LowerShrub = 3,
  Ground = 4,
  Underground = 5,
}

/** Layer configuration: name, row range, default colors */
export interface LayerConfig {
  layer: Layer;
  name: string;
  startRow: number;
  endRow: number;
  bgColor: string;
  fgColor: string;
}

/** Grid dimensions and cell sizing */
export interface GridConfig {
  cols: number;
  rows: number;
  cellWidth: number;
  cellHeight: number;
  fontSize: number;
  fontFamily: string;
}

/** All layer definitions with row ranges — muted gray palette */
export const LAYER_CONFIGS: LayerConfig[] = [
  { layer: Layer.Sky,          name: 'Sky',           startRow: 0,  endRow: 2,  bgColor: '#22252e', fgColor: '#6a6a8a' },
  { layer: Layer.UpperCanopy,  name: 'Upper Canopy',  startRow: 3,  endRow: 6,  bgColor: '#262926', fgColor: '#5a5a4a' },
  { layer: Layer.MidCanopy,    name: 'Mid Canopy',    startRow: 7,  endRow: 9,  bgColor: '#282a26', fgColor: '#4a4a3a' },
  { layer: Layer.LowerShrub,   name: 'Lower Shrub',   startRow: 10, endRow: 14, bgColor: '#302e28', fgColor: '#5a5a4a' },
  { layer: Layer.Ground,       name: 'Ground',        startRow: 15, endRow: 15, bgColor: '#3a3528', fgColor: '#7a7050' },
  { layer: Layer.Underground,  name: 'Underground',   startRow: 16, endRow: 49, bgColor: '#2a2520', fgColor: '#5a5040' },
];

export const GRID_CONFIG: GridConfig = {
  cols: 200,
  rows: 50,
  cellWidth: 14,
  cellHeight: 20,
  fontSize: 16,
  fontFamily: 'Courier New, monospace',
};

// ── Phase 2: Simulation types ──────────────────────────────

export enum Season {
  Spring = 0,
  Summer = 1,
  Autumn = 2,
  Winter = 3,
}

export enum SubSeason {
  Early = 0,
  Mid = 1,
  Late = 2,
}

export interface TimePeriod {
  season: Season;
  sub: SubSeason;
  index: number; // 0-11
}

export enum MoonPhase {
  New = 0,
  Waxing = 1,
  Full = 2,
  Waning = 3,
}

export enum GrowthStage {
  Seed = 0,
  Seedling = 1,
  Juvenile = 2,
  Mature = 3,
}

/** A growth stage's visual: cells relative to the plant's root position */
export interface StageVisual {
  /** [colOffset, rowOffset, glyph] — row 0 = root row, negative = above ground */
  cells: Array<[number, number, Glyph]>;
}

/** Species definition — pure data */
export interface SpeciesDef {
  id: string;
  name: string;
  energyCost: number;
  plantableSeasons: Season[];
  growthRate: number;
  ticksPerStage: Record<GrowthStage, number>;
  visuals: Record<GrowthStage, StageVisual>;
  matureLayers: Layer[];
  /** What this species does in each season (e.g. "Dormant", "Budding", "Blooming") */
  seasonalActivity: Record<Season, string>;
  /** Short flavour description for info panel */
  description: string;
}

/** Runtime state of a single planted instance */
export interface PlantState {
  speciesId: string;
  col: number;
  row: number;
  stage: GrowthStage;
  ticksInStage: number;
  plantedAt: number;
}

// ── Soil system ──────────────────────────────

export enum SoilLayer {
  Topsoil = 0,   // rows 16-22
  Subsoil = 1,   // rows 23-35
  Bedrock = 2,   // rows 36-49
}

export interface SoilCell {
  layer: SoilLayer;
  rockDensity: number;   // 0-1
  fertility: number;     // 0-1
}
