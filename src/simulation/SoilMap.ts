import { SoilLayer, type SoilCell } from '@/types';

/** Simple deterministic hash for procedural generation */
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff; // 0-1
}

/** Smooth column variation using overlapping sine waves */
function columnNoise(col: number): number {
  return (
    Math.sin(col * 0.07) * 0.3 +
    Math.sin(col * 0.23 + 1.7) * 0.2 +
    Math.sin(col * 0.51 + 3.1) * 0.1 +
    0.5
  );
}

export class SoilMap {
  private readonly groundRow: number;
  private readonly totalRows: number;
  private readonly cols: number;

  constructor(cols: number, groundRow: number, totalRows: number) {
    this.cols = cols;
    this.groundRow = groundRow;
    this.totalRows = totalRows;
  }

  getSoilLayer(row: number): SoilLayer {
    if (row < 23) return SoilLayer.Topsoil;
    if (row < 36) return SoilLayer.Subsoil;
    return SoilLayer.Bedrock;
  }

  getSoilAt(col: number, row: number): SoilCell {
    if (row <= this.groundRow || row >= this.totalRows) {
      return { layer: SoilLayer.Topsoil, rockDensity: 0, fertility: 1 };
    }

    const layer = this.getSoilLayer(row);
    const colVar = columnNoise(col);
    const h = hash(col, row);

    let baseFertility: number;
    let baseRock: number;

    switch (layer) {
      case SoilLayer.Topsoil:
        baseFertility = 0.7 + h * 0.3;     // 0.7-1.0
        baseRock = h * 0.2;                  // 0.0-0.2
        break;
      case SoilLayer.Subsoil:
        baseFertility = 0.3 + h * 0.3;     // 0.3-0.6
        baseRock = 0.2 + h * 0.3;           // 0.2-0.5
        break;
      case SoilLayer.Bedrock:
        baseFertility = h * 0.2;            // 0.0-0.2
        baseRock = 0.6 + h * 0.4;           // 0.6-1.0
        break;
    }

    // Column variation: some columns are rockier, some more fertile
    const rockMod = colVar * 0.3 - 0.15;   // -0.15 to +0.15
    const fertMod = (1 - colVar) * 0.2 - 0.1;

    return {
      layer,
      rockDensity: Math.max(0, Math.min(1, baseRock + rockMod)),
      fertility: Math.max(0, Math.min(1, baseFertility + fertMod)),
    };
  }

  /** Get average growth quality for a plant at this column, considering root depth */
  getColumnQuality(col: number, rootDepth: number): number {
    if (rootDepth <= 0) return 1.0;

    let totalFertility = 0;
    let totalRockPenalty = 0;
    const startRow = this.groundRow + 1;
    const endRow = Math.min(startRow + rootDepth, this.totalRows);
    const count = endRow - startRow;

    if (count <= 0) return 1.0;

    for (let row = startRow; row < endRow; row++) {
      const cell = this.getSoilAt(col, row);
      totalFertility += cell.fertility;
      totalRockPenalty += cell.rockDensity;
    }

    const avgFertility = totalFertility / count;
    const avgRock = totalRockPenalty / count;

    // Fertility boosts growth, rocks slow it. Range roughly 0.7-1.3
    return 0.7 + avgFertility * 0.4 - avgRock * 0.2 + 0.1;
  }
}
