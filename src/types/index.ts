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

/** All layer definitions with row ranges */
export const LAYER_CONFIGS: LayerConfig[] = [
  { layer: Layer.Sky,          name: 'Sky',           startRow: 0,  endRow: 5,  bgColor: '#2e3a5e', fgColor: '#8a8aba' },
  { layer: Layer.UpperCanopy,  name: 'Upper Canopy',  startRow: 6,  endRow: 12, bgColor: '#2a4a2a', fgColor: '#6a9a5a' },
  { layer: Layer.MidCanopy,    name: 'Mid Canopy',    startRow: 13, endRow: 19, bgColor: '#2a5a2a', fgColor: '#5a8a4a' },
  { layer: Layer.LowerShrub,   name: 'Lower Shrub',   startRow: 20, endRow: 26, bgColor: '#4a6a2a', fgColor: '#7a9a4a' },
  { layer: Layer.Ground,       name: 'Ground',        startRow: 27, endRow: 33, bgColor: '#6a5030', fgColor: '#a08050' },
  { layer: Layer.Underground,  name: 'Underground',   startRow: 34, endRow: 39, bgColor: '#4a3018', fgColor: '#7a6040' },
];

export const GRID_CONFIG: GridConfig = {
  cols: 200,
  rows: 40,
  cellWidth: 14,
  cellHeight: 20,
  fontSize: 16,
  fontFamily: 'Courier New, monospace',
};
