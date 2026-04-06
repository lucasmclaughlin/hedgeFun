import type { Glyph, EnemyState, DefenderState } from '@/types';
import type { PlantFort } from './FortificationSystem';

export interface SpeciesBonus {
  speciesId: string;
  name: string;
  glyph: Glyph;          // icon rendered at the fort
  description: string;
}

export const SPECIES_BONUSES: Record<string, SpeciesBonus> = {
  hawthorn: {
    speciesId: 'hawthorn',
    name: 'Thorn Wall',
    glyph: { char: '*', fg: '#c06040' },
    description: 'Enemies take 1 damage passing through',
  },
  blackthorn: {
    speciesId: 'blackthorn',
    name: 'Spike Trap',
    glyph: { char: '^', fg: '#806040' },
    description: 'Auto-places spike traps at this position',
  },
  holly: {
    speciesId: 'holly',
    name: 'Evergreen Guard',
    glyph: { char: '#', fg: '#308030' },
    description: 'Defenders here ignore winter penalties',
  },
  hazel: {
    speciesId: 'hazel',
    name: 'Supply Cache',
    glyph: { char: 'o', fg: '#c0a050' },
    description: '+1 max lives (max +3 from all hazels)',
  },
  elder: {
    speciesId: 'elder',
    name: 'Healing Berries',
    glyph: { char: '\u2665', fg: '#d04060' },   // ♥
    description: 'Nearby defenders regen 0.5 HP / 3s',
  },
  dogrose: {
    speciesId: 'dogrose',
    name: 'Rose Vigour',
    glyph: { char: '\u2740', fg: '#e080a0' },   // ❀
    description: 'Nearby defenders attack 25% faster',
  },
};

/**
 * Apply thorn wall damage to enemies passing through a fortified hawthorn column.
 * Call each frame. Returns enemy IDs that should take 1 damage.
 */
export function applyThornDamage(
  forts: readonly PlantFort[],
  enemies: readonly EnemyState[],
  delta: number,
  thornCooldowns: Map<number, number>,  // enemyId → ms remaining
): number[] {
  const hitIds: number[] = [];
  const thornCols = new Set(
    forts.filter(f => f.speciesId === 'hawthorn').map(f => f.plantCol),
  );

  for (const e of enemies) {
    if (e.phase !== 'advancing') continue;
    if (!thornCols.has(e.col)) continue;

    const remaining = thornCooldowns.get(e.id) ?? 0;
    if (remaining > 0) {
      thornCooldowns.set(e.id, remaining - delta);
      continue;
    }

    hitIds.push(e.id);
    thornCooldowns.set(e.id, 2000);  // 2s cooldown between thorn hits
  }

  return hitIds;
}

/**
 * Apply healing berries to defenders near fortified elder plants.
 * Call each frame. Returns defender IDs that should regen HP.
 */
export function applyHealingBerries(
  forts: readonly PlantFort[],
  defenders: ReadonlyMap<number, DefenderState>,
  creatures: readonly { id: number; col: number }[],
  delta: number,
  healCooldowns: Map<number, number>,  // creatureId → ms remaining
): number[] {
  const healedIds: number[] = [];
  const elderCols = forts.filter(f => f.speciesId === 'elder').map(f => f.plantCol);
  if (elderCols.length === 0) return healedIds;

  for (const [cid, def] of defenders) {
    if (def.hp >= def.maxHp) continue;

    const creature = creatures.find(c => c.id === cid);
    if (!creature) continue;

    const nearElder = elderCols.some(ec => Math.abs(creature.col - ec) <= 5);
    if (!nearElder) continue;

    const remaining = healCooldowns.get(cid) ?? 0;
    if (remaining > 0) {
      healCooldowns.set(cid, remaining - delta);
      continue;
    }

    healedIds.push(cid);
    healCooldowns.set(cid, 3000);  // heal every 3s
  }

  return healedIds;
}

/**
 * Count bonus lives from fortified hazel plants. Max +3.
 */
export function countHazelBonusLives(forts: readonly PlantFort[]): number {
  return Math.min(3, forts.filter(f => f.speciesId === 'hazel').length);
}

/**
 * Get attack speed multiplier for a defender near a fortified dogrose.
 * Returns 0.75 if near dogrose, 1.0 otherwise.
 */
export function getRoseVigorMultiplier(
  creatureCol: number,
  forts: readonly PlantFort[],
): number {
  const roseCols = forts.filter(f => f.speciesId === 'dogrose').map(f => f.plantCol);
  return roseCols.some(rc => Math.abs(creatureCol - rc) <= 5) ? 0.75 : 1.0;
}
