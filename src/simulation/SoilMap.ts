import { SoilLayer, SoilBiome, type SoilCell } from '@/types';
import { TerrainMap } from './TerrainMap';

/** Simple deterministic hash for per-cell variation */
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

/** Slow-frequency column variation */
function columnNoise(col: number): number {
  return (
    Math.sin(col * 0.07)         * 0.3 +
    Math.sin(col * 0.23 + 1.7)   * 0.2 +
    Math.sin(col * 0.51 + 3.1)   * 0.1 +
    0.5
  );
}

/** Biome modifiers: [fertilityDelta, rockDensityDelta] */
const BIOME_MODIFIERS: Record<SoilBiome, [number, number]> = {
  [SoilBiome.Loam]:  [ 0.12, -0.05],
  [SoilBiome.Clay]:  [-0.05,  0.12],
  [SoilBiome.Chalk]: [-0.10,  0.15],
  [SoilBiome.Peat]:  [ 0.20, -0.10],
  [SoilBiome.Sandy]: [-0.15, -0.05],
};

export class SoilMap {
  private readonly totalRows: number;
  private readonly terrain: TerrainMap;

  constructor(cols: number, totalRows: number, terrain: TerrainMap) {
    void cols; // kept for API symmetry with callers
    this.totalRows = totalRows;
    this.terrain   = terrain;
  }

  getSoilAt(col: number, row: number): SoilCell {
    const colGroundRow = this.terrain.getGroundRow(col);

    if (row <= colGroundRow || row >= this.totalRows) {
      return { layer: SoilLayer.Topsoil, rockDensity: 0, fertility: 1 };
    }

    // Depth-relative layer detection
    const depth = row - colGroundRow;
    let layer: SoilLayer;
    if (row >= this.terrain.getBedrockRow(col)) {
      layer = SoilLayer.Bedrock;
    } else if (depth <= 7) {
      layer = SoilLayer.Topsoil;
    } else if (depth <= 20) {
      layer = SoilLayer.Subsoil;
    } else {
      layer = SoilLayer.Bedrock;
    }

    const h      = hash(col, row);
    const colVar = columnNoise(col);

    let baseFertility: number;
    let baseRock: number;

    switch (layer) {
      case SoilLayer.Topsoil:
        baseFertility = 0.7 + h * 0.3;
        baseRock      = h * 0.2;
        break;
      case SoilLayer.Subsoil:
        baseFertility = 0.3 + h * 0.3;
        baseRock      = 0.2 + h * 0.3;
        break;
      default: // Bedrock
        baseFertility = h * 0.2;
        baseRock      = 0.6 + h * 0.4;
        break;
    }

    const rockMod = colVar * 0.3 - 0.15;
    const fertMod = (1 - colVar) * 0.2 - 0.1;

    const biome = this.terrain.getBiome(col);
    const [biomeFert, biomeRock] = BIOME_MODIFIERS[biome];

    let fertility    = Math.max(0, Math.min(1, baseFertility + fertMod + biomeFert));
    let rockDensity  = Math.max(0, Math.min(1, baseRock + rockMod + biomeRock));

    // Boulder mass — very rocky, nearly infertile
    if (this.terrain.isInBoulderMass(col, row)) {
      rockDensity = 0.92;
      fertility   = 0.05;
    }

    // Clay lens — impermeable, low fertility
    if (this.terrain.isInClayLens(col, row)) {
      rockDensity = Math.max(rockDensity, 0.75);
      fertility   = Math.min(fertility, 0.15);
    }

    // Aquifer proximity — moisture bonus
    if (this.terrain.isNearAquifer(col, row)) {
      fertility = Math.min(1, fertility + 0.15);
    }

    return { layer, rockDensity, fertility };
  }

  /** Average growth quality for a plant at this column, considering root depth. */
  getColumnQuality(col: number, rootDepth: number): number {
    if (rootDepth <= 0) return 1.0;

    const groundRow = this.terrain.getGroundRow(col);
    const startRow  = groundRow + 1;
    const endRow    = Math.min(startRow + rootDepth, this.totalRows);
    const count     = endRow - startRow;
    if (count <= 0) return 1.0;

    let totalFertility   = 0;
    let totalRockPenalty = 0;

    for (let row = startRow; row < endRow; row++) {
      const cell = this.getSoilAt(col, row);
      totalFertility   += cell.fertility;
      totalRockPenalty += cell.rockDensity;
    }

    const avgFertility = totalFertility   / count;
    const avgRock      = totalRockPenalty / count;

    return 0.7 + avgFertility * 0.4 - avgRock * 0.2 + 0.1;
  }
}
