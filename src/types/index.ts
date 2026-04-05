/** A single cell in the ASCII grid */
export interface Glyph {
  char: string;
  fg: string;
  bg?: string;
}

/** Overlay draw-order layers — higher values draw on top */
export enum OverlayLayer {
  Terrain = 0,
  Stars = 5,
  Plant = 10,
  Building = 15,
  Creature = 20,
  Battle = 25,
  Weather = 30,
  BuildUI = 35,
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

/** How a species responds to managed pruning operations */
export interface PruningProfile {
  /** Can be cut to ground-level stool; regrows as vigorous multi-stem */
  coppiceable: boolean;
  /** Can have crown removed from a standing trunk; regrows from pollard head */
  pollardable: boolean;
  /** Growth speed multiplier applied when regrowing from coppice stool */
  coppiceRegrowth: number;
  /** Message shown to player after a successful coppice */
  coppiceResult: string;
  /** Message shown to player after a successful pollard */
  pollardResult: string;
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
  /** How this species responds to coppicing and pollarding */
  pruning: PruningProfile;
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
  /** True if this plant has been coppiced — regrows as multi-stemmed stool with vigour bonus */
  isCoppiced: boolean;
  /** True if this plant has been pollarded — regrows from a high trunk crown */
  isPollarded: boolean;
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
  Topsoil = 0,
  Subsoil = 1,
  Bedrock = 2,
}

/** Soil character of a horizontal terrain zone */
export enum SoilBiome {
  Loam   = 0,  // rich, dark brown — balanced
  Clay   = 1,  // heavy, orange-brown — high rock, holds water
  Chalk  = 2,  // pale grey-white — alkaline, stony
  Peat   = 3,  // very dark, acidic, wet — high fertility
  Sandy  = 4,  // light tan, dry — low fertility, low rock
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

// ── Day/Night cycle (Book of Hours) ──────────────────────────────

/** The 8 canonical hours of the day */
export const DAY_HOUR_NAMES = [
  'Matins',   // 0 — midnight
  'Lauds',    // 1 — pre-dawn
  'Prime',    // 2 — sunrise
  'Terce',    // 3 — mid-morning
  'Sext',     // 4 — noon
  'None',     // 5 — afternoon
  'Vespers',  // 6 — sunset
  'Compline', // 7 — night
] as const;

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
  starSeed?: number;
  terrainSeed?: number;
}

// ── hedgeFriends: Village mode ──────────────────────────────

/** Building construction phase */
export enum BuildPhase {
  SiteMarked = 0,
  Building = 1,
  Complete = 2,
}

/** Villager personality — affects interior generation and daily routine */
export enum VillagerPersonality {
  Cozy = 0,
  Bookish = 1,
  Culinary = 2,
  Crafty = 3,
  Gardener = 4,
}

/** Build mode sub-states */
export enum BuildModeState {
  Browsing = 0,
  Building = 1,
  ViewingInterior = 2,
}

/** A single placed glyph in a building (offset from anchor) */
export interface BuildingCell {
  colOff: number;
  rowOff: number;
  glyph: Glyph;
}

/** A piece of furniture/item inside a house */
export interface FurnitureItem {
  id: string;
  colOff: number;
  rowOff: number;
  glyph: Glyph;
  permanent: boolean;
}

/** A villager's house */
export interface HouseState {
  id: number;
  villagerId: string;
  anchorCol: number;
  anchorRow: number;
  width: number;
  height: number;
  phase: BuildPhase;
  exterior: BuildingCell[];
  interior: BuildingCell[];
  furniture: FurnitureItem[];
}

/** Multi-cell animation frame for villager art (same format as CreatureFrame) */
export interface VillagerFrame {
  cells: Array<[number, number, Glyph]>;  // [colOff, rowOff, glyph]
}

/** A recipe a villager can cook on their stove */
export interface VillagerRecipe {
  name: string;
  description: string;
}

/** Villager species definition */
export interface VillagerDef {
  id: string;
  name: string;
  species: string;
  personality: VillagerPersonality;
  nestingLayer: Layer;
  houseWidth: number;
  houseHeight: number;
  preferredPlants: string[];
  /** Multi-cell idle animation frames (shown inside home) */
  idleFrames: VillagerFrame[];
  /** Multi-cell walking animation frames */
  walkFrames: VillagerFrame[];
  /** Single-cell sleeping frame */
  sleepFrame: VillagerFrame;
  possessions: string[];
  /** Recipes this villager can cook on their stove */
  recipes: VillagerRecipe[];
  dailyRoutine: Record<number, string>;
  visitPreferences: string[];
  description: string;
}

/** Runtime state of a villager */
export interface VillagerState {
  defId: string;
  houseId: number;
  activity: string;
  col: number;
  row: number;
  isHome: boolean;
  visitingHouseId: number | null;
  facing: number;
  frameIndex: number;
  animTimer: number;
  moveTimer: number;
  /** Interior position: offset within house (for moving around inside) */
  interiorCol: number;
  interiorRow: number;
  /** Target interior position to wander toward */
  interiorTargetCol: number;
  interiorTargetRow: number;
  /** Timer for interior movement */
  interiorMoveTimer: number;
}

/** Build mode context */
export interface BuildModeContext {
  state: BuildModeState;
  activeHouseId: number | null;
  selectedGlyph: Glyph | null;
  selectedCategory: number;
  selectedIndex: number;
  cursorCol: number;
  cursorRow: number;
}

/** A category of building glyphs in the palette */
export interface PaletteCategory {
  name: string;
  items: Glyph[];
}

// ── hedgeKingdoms: Combat system ────────────────────────────────────────

export type EnemyPhase = 'advancing' | 'attacking' | 'fleeing';

export interface EnemyDef {
  id: string;
  name: string;
  layer: Layer;
  rowRange: [number, number];
  speed: number;       // cols per second
  maxHp: number;
  damage: number;      // lives lost when it breaches centre
  attackDamage: number; // HP dealt to defenders in melee
  /** Plant species IDs (from species.ts) whose presence slows this enemy */
  slowedBySpecies: string[];
  frames: Record<EnemyPhase, CreatureFrame[]>;
}

export interface EnemyState {
  id: number;
  defId: string;
  col: number;
  row: number;
  hp: number;
  facing: 1 | -1;
  currentSpeed: number;
  phase: EnemyPhase;
  frameIndex: number;
  animTimer: number;
  moveTimer: number;
  /** ID of defender currently engaged in melee */
  engagedDefenderId: number | null;
}

export interface WaveState {
  waveNumber: number;
  phase: 'off' | 'prep' | 'active';
  prepMsRemaining: number;
  lives: number;
  enemiesRemainingInWave: number;
}

export enum DefenderRole {
  Archer      = 0,
  Infantry    = 1,
  Heavy       = 2,
  Scout       = 3,
  NightRaider = 4,
  Sapper      = 5,
  Alchemist   = 6,
}

export interface DefenderState {
  creatureId: number;         // links to existing CreatureState.id
  role: DefenderRole;
  hp: number;
  maxHp: number;
  attackCooldownMs: number;
  assignedCol: number | null;
  assignedRow: number | null;
}

export interface Fortification {
  col: number;
  row: number;
  type: 'wall' | 'watchtower' | 'gate';
  hp: number;
}

export interface BattleEffect {
  id: number;
  type: 'arrow' | 'clash' | 'shield' | 'poison';
  col: number;
  row: number;
  targetCol: number;
  progress: number;   // 0–1
  durationMs: number;
  elapsedMs: number;
}
