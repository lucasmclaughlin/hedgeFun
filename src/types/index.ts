/** A single cell in the ASCII grid */
export interface Glyph {
  char: string;
  fg: string;
  bg?: string;
}

/** Overlay draw-order layers — higher values draw on top */
export enum OverlayLayer {
  Terrain = 0,
  Plant = 10,
  Creature = 20,
  Weather = 30,
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

/** All layer definitions with row ranges — dark palette for contrast */
export const LAYER_CONFIGS: LayerConfig[] = [
  { layer: Layer.Sky,          name: 'Sky',           startRow: 0,  endRow: 7,  bgColor: '#14161e', fgColor: '#6a6a8a' },
  { layer: Layer.UpperCanopy,  name: 'Upper Canopy',  startRow: 8,  endRow: 11, bgColor: '#2a2c2a', fgColor: '#5a5a4a' },
  { layer: Layer.MidCanopy,    name: 'Mid Canopy',    startRow: 12, endRow: 14, bgColor: '#282a28', fgColor: '#4a4a3a' },
  { layer: Layer.LowerShrub,   name: 'Lower Shrub',   startRow: 15, endRow: 19, bgColor: '#2c2a28', fgColor: '#5a5a4a' },
  { layer: Layer.Ground,       name: 'Ground',        startRow: 20, endRow: 20, bgColor: '#2a261e', fgColor: '#7a7050' },
  { layer: Layer.Underground,  name: 'Underground',   startRow: 21, endRow: 54, bgColor: '#1a1814', fgColor: '#5a5040' },
];

export const GRID_CONFIG: GridConfig = {
  cols: 200,
  rows: 55,
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
  /** Season-specific decoration cells (flowers, fruit, berries) drawn on top of base cells */
  seasonalCells?: Partial<Record<Season, Array<[number, number, Glyph]>>>;
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
  /** Health 0.0-1.0 — drops from overcrowding, poor soil, winter stress */
  health: number;
  /** True when health reaches 0 — triggers fade-out then removal */
  isDying: boolean;
  /** Periods remaining before a dying plant is removed */
  deathTimer: number;
  /** True if this plant grew from a self-seeded drop rather than player planting */
  selfSeeded: boolean;
  /** True if this plant has been hedge-laid — persists through regrowth, improves density and longevity */
  isLaid: boolean;
}

// ── Weather system ──────────────────────────────

export enum Weather {
  Clear = 0,
  Overcast = 1,
  Rain = 2,
  Storm = 3,
  Wind = 4,
  Frost = 5,
}

// ── Soil system ──────────────────────────────

export enum SoilLayer {
  Topsoil = 0,   // rows 21-27
  Subsoil = 1,   // rows 28-40
  Bedrock = 2,   // rows 41-54
}

export interface SoilCell {
  layer: SoilLayer;
  rockDensity: number;   // 0-1
  fertility: number;     // 0-1
}

// ── View modes ──────────────────────────────

export enum ViewMode {
  Hedge = 0,        // sky to ground (rows 0-20)
  Underground = 1,  // ground to bedrock (rows 20-54)
  Full = 2,         // everything (rows 0-54)
}

// ── Creature system ──────────────────────────────

export enum CreatureBehavior {
  Idle = 0,
  Moving = 1,
  Sleeping = 2,     // hibernation or night rest
}

/** Descriptive activity — what the creature appears to be doing */
export enum CreatureActivity {
  Resting = 0,
  Foraging = 1,
  Hunting = 2,
  Singing = 3,
  Nesting = 4,
  Courting = 5,
  Grooming = 6,
  Burrowing = 7,
  Patrolling = 8,
  Sleeping = 9,
  Hibernating = 10,
  Basking = 11,
}

/** Movement style for creature wandering */
export enum MovementPattern {
  Wander = 0,       // random short hops within home range
  Burrow = 1,       // stays mostly still, occasional short move
  Hop = 2,          // short pauses then quick move
  Flit = 3,         // fast erratic movement
  Soar = 4,         // slow, wide sweeping movement
}

/** What the creature does in winter */
export enum WinterBehavior {
  Active = 0,       // stays active year-round
  Hibernate = 1,    // disappears in winter
  Migrate = 2,      // leaves in autumn, returns in spring
}

/** Animation frame: a set of glyphs relative to an anchor */
export interface CreatureFrame {
  cells: Array<[number, number, Glyph]>;  // [colOff, rowOff, glyph]
}

/** Habitat requirements for a creature to spawn */
export interface HabitatRequirement {
  /** Minimum number of plants at the creature's layer */
  minPlants: number;
  /** Minimum number of mature plants at the creature's layer */
  minMaturePlants: number;
  /** Minimum distinct species count in the hedge */
  minSpeciesDiversity: number;
  /** Specific species that must be present (any one of these) */
  attractedBySpecies?: string[];
}

/** Creature species definition — pure data */
export interface CreatureDef {
  id: string;
  name: string;
  /** Latin/scientific name */
  latin: string;
  description: string;
  /** What this creature eats */
  diet: string;
  /** Approximate body size */
  size: string;
  /** How/where it nests or shelters */
  nesting: string;
  /** A fun or surprising fact */
  funFact: string;
  /** Possible activities when idle (weighted by season in simulator) */
  idleActivities: CreatureActivity[];
  /** Possible activities when moving */
  movingActivities: CreatureActivity[];
  /** Layer this creature inhabits */
  layer: Layer;
  /** Row range within its layer where it can appear */
  rowRange: [number, number];
  /** Movement style */
  movement: MovementPattern;
  /** How many columns the creature wanders from home */
  homeRange: number;
  /** Speed: columns per second */
  speed: number;
  /** Rarity weight (lower = rarer, 1-10 scale) */
  rarity: number;
  /** Winter behavior */
  winterBehavior: WinterBehavior;
  /** Habitat requirements to spawn */
  habitat: HabitatRequirement;
  /** Animation frames keyed by behavior */
  frames: Record<CreatureBehavior, CreatureFrame[]>;
}

// ── Biodiversity scoring ──────────────────────────────

/** Categories of biodiversity milestones */
export enum MilestoneCategory {
  PlantDiversity = 0,
  LayerCoverage = 1,
  CreatureDiversity = 2,
  EcosystemHealth = 3,
}

/** A milestone definition — pure data */
export interface MilestoneDef {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  points: number;
  /** Check function receives current game snapshot and returns true if earned */
  check: (snapshot: BiodiversitySnapshot) => boolean;
}

/** Snapshot of game state passed to milestone checks */
export interface BiodiversitySnapshot {
  totalPlants: number;
  uniquePlantSpecies: number;
  maturePlants: number;
  /** Number of layers with at least one plant */
  occupiedLayers: number;
  totalCreatures: number;
  uniqueCreatureSpecies: number;
  /** Set of creature def IDs currently present */
  creatureSpeciesIds: Set<string>;
  /** How many periods creatures have been present continuously */
  creaturePeriods: number;
  totalPeriods: number;
  /** Number of plants that have died total (cumulative) */
  deadPlantCount: number;
  /** Number of self-seeded plants currently alive */
  selfSeededPlants: number;
  /** Total number of prune actions performed */
  pruneCount: number;
  /** Total number of hedge-laying actions performed */
  laidCount: number;
  /** Number of currently living plants that have been laid and since grown to Mature */
  laidMaturePlants: number;
}

/** A milestone that has been achieved */
export interface AchievedMilestone {
  defId: string;
  achievedAtPeriod: number;
}

/** Runtime state of an active creature instance */
export interface CreatureState {
  defId: string;
  col: number;
  row: number;
  behavior: CreatureBehavior;
  /** Descriptive activity label */
  activity: CreatureActivity;
  /** Current animation frame index */
  frameIndex: number;
  /** Time accumulator for animation */
  animTimer: number;
  /** Time accumulator for movement decisions */
  moveTimer: number;
  /** Column of the plant this creature calls home */
  homeCol: number;
  /** Direction creature is facing (1 = right, -1 = left) */
  facing: number;
  /** Unique instance id */
  id: number;
}

// ── Save/Load system ──────────────────────────────

export interface SaveData {
  version: number;
  timestamp: number;
  playerName: string;
  periodIndex: number;
  tickAccumulator: number;
  energy: number;
  plants: PlantState[];
  creatures: Array<{
    defId: string;
    col: number;
    row: number;
    homeCol: number;
    facing: number;
    behavior: CreatureBehavior;
    activity: CreatureActivity;
  }>;
  creatureSpawnCounts: Record<string, number>;
  creatureNextId: number;
  achievedMilestoneIds: string[];
  creaturePeriods: number;
  deadPlantCount: number;
  pruneCount: number;
  laidCount: number;
  currentWeather: Weather;
  selectedSpeciesIndex: number;
  viewMode: ViewMode;
}
