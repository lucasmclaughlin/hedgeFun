import { GrowthStage, OverlayLayer, type PlantState } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';

export type CompanionType = 'synergy' | 'competition';

interface CompanionRule {
  a: string;
  b: string;
  maxDist: number;
  /** Growth rate multiplier applied to BOTH plants in the pair */
  modifier: number;
  type: CompanionType;
  label: string;
}

export interface ActiveRelationship {
  label: string;
  type: CompanionType;
}

const COMPANION_RULES: CompanionRule[] = [
  {
    a: 'dogrose', b: 'hawthorn', maxDist: 5,
    modifier: 1.20, type: 'synergy',
    label: 'Dog Rose scrambles through Hawthorn',
  },
  {
    a: 'hazel', b: 'elder', maxDist: 5,
    modifier: 1.15, type: 'synergy',
    label: 'Hazel benefits from Elder\'s rich leaf litter',
  },
  {
    a: 'blackthorn', b: 'holly', maxDist: 5,
    modifier: 1.15, type: 'synergy',
    label: 'Holly sheltered by Blackthorn windbreak',
  },
  {
    a: 'elder', b: 'hawthorn', maxDist: 4,
    modifier: 0.88, type: 'competition',
    label: 'Elder\'s roots inhibit Hawthorn',
  },
  {
    a: 'elder', b: 'elder', maxDist: 3,
    modifier: 0.85, type: 'competition',
    label: 'Elder competes with nearby Elder',
  },
];

/** Growth rate multiplier from companion relationships (1.0 = no effect). */
export function getCompanionModifier(plant: PlantState, allPlants: ReadonlyArray<PlantState>): number {
  // Seeds don't trigger companion effects — only established plants
  if (plant.stage === GrowthStage.Seed) return 1.0;

  let modifier = 1.0;

  for (const rule of COMPANION_RULES) {
    const isA = plant.speciesId === rule.a;
    const isB = plant.speciesId === rule.b;
    if (!isA && !isB) continue;

    const partnerSpecies = isA ? rule.b : rule.a;
    const hasPartner = allPlants.some(p =>
      p !== plant &&
      !p.isDying &&
      p.stage !== GrowthStage.Seed &&
      p.speciesId === partnerSpecies &&
      Math.abs(p.col - plant.col) <= rule.maxDist,
    );

    if (hasPartner) modifier *= rule.modifier;
  }

  return modifier;
}

/** Active companion relationships for a plant — used by the info panel. */
export function getCompanionRelationships(
  plant: PlantState,
  allPlants: ReadonlyArray<PlantState>,
): ActiveRelationship[] {
  if (plant.stage === GrowthStage.Seed) return [];

  const results: ActiveRelationship[] = [];

  for (const rule of COMPANION_RULES) {
    const isA = plant.speciesId === rule.a;
    const isB = plant.speciesId === rule.b;
    if (!isA && !isB) continue;

    const partnerSpecies = isA ? rule.b : rule.a;
    const hasPartner = allPlants.some(p =>
      p !== plant &&
      !p.isDying &&
      p.stage !== GrowthStage.Seed &&
      p.speciesId === partnerSpecies &&
      Math.abs(p.col - plant.col) <= rule.maxDist,
    );

    if (hasPartner) results.push({ label: rule.label, type: rule.type });
  }

  return results;
}

// ── Visual indicators ──────────────────────────────────────────────────────

/** Indicator glyph rendered one row above ground between companion pairs */
const SYNERGY_GLYPH = { char: '\u2665', fg: '#44cc44' }; // ♥ green
const COMPETITION_GLYPH = { char: '\u00D7', fg: '#cc6622' }; // × orange

const INDICATOR_ROW_OFFSET = -1; // relative to plant's ground row (one above ground)

/** Overlay keys for the previous indicator render — used to clear on next render */
let prevIndicatorKeys: string[] = [];

/**
 * Scan all plants for active companion pairs and render small glyphs
 * between them. Call this after every renderPlants() invocation.
 */
export function renderCompanionIndicators(
  plants: ReadonlyArray<PlantState>,
  groundRow: number,
  renderer: AsciiRenderer,
): void {
  // Clear previous
  for (const key of prevIndicatorKeys) {
    const [c, r] = key.split(',').map(Number);
    renderer.clearOverlay(c, r, OverlayLayer.Terrain);
  }
  prevIndicatorKeys = [];

  const indicatorRow = groundRow + INDICATOR_ROW_OFFSET;
  const seen = new Set<string>();

  for (const rule of COMPANION_RULES) {
    for (const plantA of plants) {
      if (plantA.isDying || plantA.stage === GrowthStage.Seed) continue;
      if (plantA.speciesId !== rule.a && plantA.speciesId !== rule.b) continue;

      const partnerSpecies = plantA.speciesId === rule.a ? rule.b : rule.a;

      for (const plantB of plants) {
        if (plantB === plantA || plantB.isDying || plantB.stage === GrowthStage.Seed) continue;
        if (plantB.speciesId !== partnerSpecies) continue;

        const dist = Math.abs(plantA.col - plantB.col);
        if (dist > rule.maxDist) continue;

        // Deduplicate pairs (A-B and B-A are the same)
        const pairKey = [Math.min(plantA.col, plantB.col), Math.max(plantA.col, plantB.col)].join(':');
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);

        const glyph = rule.type === 'synergy' ? SYNERGY_GLYPH : COMPETITION_GLYPH;

        // Render at midpoint column (one above ground)
        const midCol = Math.round((plantA.col + plantB.col) / 2);
        const key = `${midCol},${indicatorRow}`;
        prevIndicatorKeys.push(key);
        renderer.setOverlay(midCol, indicatorRow, glyph, OverlayLayer.Terrain);
      }
    }
  }
}
