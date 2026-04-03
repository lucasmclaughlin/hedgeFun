import { SoilBiome, GRID_CONFIG } from '@/types';

export interface AquiferData {
  colStart: number;
  colEnd: number;
  centerRow: number;
  width: number; // rows above/below center
}

export interface BoulderMass {
  col: number;   // left edge
  row: number;   // top edge
  width: number; // columns
  height: number; // rows
}

export interface ClayLens {
  colStart: number;
  colEnd: number;
  centerRow: number;
  thickness: number; // half-thickness above/below center
}

const COLS = GRID_CONFIG.cols;
const ROWS = GRID_CONFIG.rows;

/** Fast seeded PRNG (same xorshift variant as StarMap) */
function seededRand(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

/** Deterministic cell hash — used for decoration decisions */
export function terrainHash(col: number, row: number, seed: number): number {
  let h = (col * 374761393 + row * 668265263 + seed * 1013904223) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

/** Max jitter in columns applied to each zone boundary edge */
const BOUNDARY_JITTER = 8;

export class TerrainMap {
  private groundRowArr: number[];
  private biomeArr: SoilBiome[];
  private bedrockRowArr: number[];
  private aquiferArr: AquiferData[];
  private boulderArr: BoulderMass[];
  private lensArr: ClayLens[];
  private springColSet: Set<number>;
  private seed: number;

  private constructor(
    groundRows: number[],
    biomes: SoilBiome[],
    bedrockRows: number[],
    aquifers: AquiferData[],
    boulders: BoulderMass[],
    lenses: ClayLens[],
    springs: Set<number>,
    seed: number,
  ) {
    this.groundRowArr  = groundRows;
    this.biomeArr      = biomes;
    this.bedrockRowArr = bedrockRows;
    this.aquiferArr    = aquifers;
    this.boulderArr    = boulders;
    this.lensArr       = lenses;
    this.springColSet  = springs;
    this.seed          = seed;
  }

  /** Generate a procedural landscape from a seed. */
  static generate(seed: number): TerrainMap {
    const rand = seededRand(seed);

    // ── Ground height profile ──────────────────────────────────────────
    // Three overlapping sine waves with randomised phase/frequency give
    // a natural rolling profile. Range clamped to rows 17–23.
    const p1 = rand() * Math.PI * 2;
    const p2 = rand() * Math.PI * 2;
    const p3 = rand() * Math.PI * 2;
    const groundRows: number[] = [];
    for (let c = 0; c < COLS; c++) {
      const noise =
        Math.sin(c * 0.028 + p1) * 1.6 +
        Math.sin(c * 0.075 + p2) * 0.9 +
        Math.sin(c * 0.17  + p3) * 0.4;
      groundRows.push(Math.max(17, Math.min(23, Math.round(20 + noise))));
    }

    // ── Soil biomes ────────────────────────────────────────────────────
    // Contiguous horizontal zones, each 20–55 cols wide.
    // Each zone boundary is jittered per-column so edges are naturally ragged
    // rather than a clean vertical line.
    const biomes: SoilBiome[] = new Array(COLS);
    let col = 0;
    const zoneList: Array<{ start: number; biome: SoilBiome }> = [];
    while (col < COLS) {
      const width = 20 + Math.floor(rand() * 36);
      const biome = Math.floor(rand() * 5) as SoilBiome;
      zoneList.push({ start: col, biome });
      col += width;
    }
    for (let c = 0; c < COLS; c++) {
      let b = zoneList[0].biome;
      for (const z of zoneList) {
        // Shift each boundary by a per-column hash offset so the edge is irregular
        const jitter = Math.round((terrainHash(c, z.start, seed) - 0.5) * BOUNDARY_JITTER * 2);
        if (z.start + jitter <= c) b = z.biome;
      }
      biomes[c] = b;
    }

    // ── Bedrock depth ──────────────────────────────────────────────────
    // Base 24 rows below ground + slow noise ±7. Clamped inside grid.
    const bp1 = rand() * Math.PI * 2;
    const bp2 = rand() * Math.PI * 2;
    const bedrockRows: number[] = [];
    for (let c = 0; c < COLS; c++) {
      const depthNoise =
        Math.sin(c * 0.038 + bp1) * 4 +
        Math.sin(c * 0.11  + bp2) * 2;
      const depth = Math.round(24 + depthNoise);
      bedrockRows.push(Math.min(ROWS - 3, groundRows[c] + depth));
    }

    // ── Aquifers ───────────────────────────────────────────────────────
    const numAquifers = 2 + Math.floor(rand() * 3); // 2–4
    const aquifers: AquiferData[] = [];
    for (let i = 0; i < numAquifers; i++) {
      const colStart = Math.floor(rand() * (COLS * 0.5));
      const colEnd   = Math.min(COLS - 1, colStart + 30 + Math.floor(rand() * 80));
      const depth    = 10 + Math.floor(rand() * 16); // 10–25 rows below avg ground
      const centerRow = 20 + depth;
      const width    = 1 + Math.floor(rand() * 3);   // 1–3 rows wide
      aquifers.push({ colStart, colEnd, centerRow, width });
    }

    // ── Boulder masses ─────────────────────────────────────────────────
    const numBoulders = 20 + Math.floor(rand() * 16); // 20–35
    const boulders: BoulderMass[] = [];
    for (let i = 0; i < numBoulders; i++) {
      const c = 3 + Math.floor(rand() * (COLS - 6));
      const depth  = 5 + Math.floor(rand() * 22);    // 5–26 rows below ground
      const topRow = groundRows[c] + depth;
      if (topRow >= ROWS - 4) continue;
      boulders.push({
        col:    c,
        row:    topRow,
        width:  3 + Math.floor(rand() * 6),  // 3–8 cols
        height: 2 + Math.floor(rand() * 4),  // 2–5 rows
      });
    }

    // ── Clay lenses ────────────────────────────────────────────────────
    const numLenses = 1 + Math.floor(rand() * 3); // 1–3
    const lenses: ClayLens[] = [];
    for (let i = 0; i < numLenses; i++) {
      const cStart = Math.floor(rand() * (COLS * 0.4));
      const cEnd   = Math.min(COLS - 1, cStart + 20 + Math.floor(rand() * 60));
      const depth  = 8 + Math.floor(rand() * 12); // 8–19 rows below ground
      lenses.push({
        colStart:   cStart,
        colEnd:     cEnd,
        centerRow:  20 + depth,
        thickness:  1 + Math.floor(rand() * 2), // 1–2 rows half-thickness
      });
    }

    // ── Springs ────────────────────────────────────────────────────────
    // Columns where an aquifer comes within 5 rows of the surface.
    const springs = new Set<number>();
    for (const aq of aquifers) {
      for (let c = aq.colStart; c <= aq.colEnd; c++) {
        if (aq.centerRow - groundRows[c] <= 5) springs.add(c);
      }
    }

    return new TerrainMap(groundRows, biomes, bedrockRows, aquifers, boulders, lenses, springs, seed);
  }

  /** Flat terrain fallback for saves that pre-date terrain generation. */
  static createFlat(): TerrainMap {
    const groundRows  = new Array<number>(COLS).fill(20);
    const biomes      = new Array<SoilBiome>(COLS).fill(SoilBiome.Loam);
    const bedrockRows = groundRows.map(g => Math.min(ROWS - 3, g + 24));
    return new TerrainMap(groundRows, biomes, bedrockRows, [], [], [], new Set(), 0);
  }

  // ── Accessors ──────────────────────────────────────────────────────

  getGroundRow(col: number): number { return this.groundRowArr[col] ?? 20; }

  getMaxGroundRow(): number {
    return Math.max(...this.groundRowArr);
  }

  getBiome(col: number): SoilBiome {
    return this.biomeArr[col] ?? SoilBiome.Loam;
  }

  getBedrockRow(col: number): number {
    return this.bedrockRowArr[col] ?? 44;
  }

  isSpring(col: number): boolean {
    return this.springColSet.has(col);
  }

  getAquifers(): readonly AquiferData[] {
    return this.aquiferArr;
  }

  getBoulderMasses(): readonly BoulderMass[] {
    return this.boulderArr;
  }

  getClayLenses(): readonly ClayLens[] {
    return this.lensArr;
  }

  getSeed(): number {
    return this.seed;
  }

  /** True if (col, row) falls inside any boulder mass. */
  isInBoulderMass(col: number, row: number): boolean {
    for (const b of this.boulderArr) {
      if (col >= b.col && col < b.col + b.width &&
          row >= b.row && row < b.row + b.height) return true;
    }
    return false;
  }

  /** True if (col, row) falls inside any clay lens band. */
  isInClayLens(col: number, row: number): boolean {
    for (const l of this.lensArr) {
      if (col >= l.colStart && col <= l.colEnd &&
          Math.abs(row - l.centerRow) <= l.thickness) return true;
    }
    return false;
  }

  /** True if (col, row) is within moisture range of an aquifer. */
  isNearAquifer(col: number, row: number): boolean {
    for (const aq of this.aquiferArr) {
      if (col < aq.colStart || col > aq.colEnd) continue;
      if (Math.abs(row - aq.centerRow) <= aq.width + 3) return true;
    }
    return false;
  }

  /** Deterministic hash for decoration — incorporates terrain seed. */
  decorHash(col: number, row: number): number {
    return terrainHash(col, row, this.seed);
  }
}
