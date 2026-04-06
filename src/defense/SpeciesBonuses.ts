import type { Glyph, EnemyState } from '@/types';
import type { PlantFort } from './FortificationSystem';
import type { DefenderState } from './DefenderCombatSystem';

export interface SpeciesBonus {
  speciesId: string;
  name: string;
  glyph: Glyph;
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
    glyph: { char: '\u2665', fg: '#d04060' },
    description: 'Nearby defenders regen 0.5 HP / 3s',
  },
  dogrose: {
    speciesId: 'dogrose',
    name: 'Rose Vigour',
    glyph: { char: '\u2740', fg: '#e080a0' },
    description: 'Nearby defenders attack 25% faster',
  },
};

/** Apply thorn wall damage to enemies at fortified hawthorn columns. Returns IDs to damage. */
export function applyThornDamage(
  forts: readonly PlantFort[],
  enemies: readonly EnemyState[],
  delta: number,
  thornCooldowns: Map<number, number>,
): number[] {
  const hitIds: number[] = [];
  const thornCols = new Set(
    forts.filter(f => f.speciesId === 'hawthorn').map(f => f.plantCol),
  );
  if (thornCols.size === 0) return hitIds;

  for (const e of enemies) {
    if (e.phase !== 'advancing') continue;
    if (!thornCols.has(e.col)) continue;

    const remaining = thornCooldowns.get(e.id) ?? 0;
    if (remaining > 0) {
      thornCooldowns.set(e.id, remaining - delta);
      continue;
    }
    hitIds.push(e.id);
    thornCooldowns.set(e.id, 2000);
  }
  return hitIds;
}

/** Heal defenders near fortified elder plants. Returns creature IDs to heal. */
export function applyHealingBerries(
  forts: readonly PlantFort[],
  defenders: ReadonlyMap<number, DefenderState>,
  creatures: readonly { id: number; col: number }[],
  delta: number,
  healCooldowns: Map<number, number>,
): number[] {
  const healedIds: number[] = [];
  const elderCols = forts.filter(f => f.speciesId === 'elder').map(f => f.plantCol);
  if (elderCols.length === 0) return healedIds;

  for (const [cid, def] of defenders) {
    if (def.hp >= def.maxHp) continue;
    const creature = creatures.find(c => c.id === cid);
    if (!creature) continue;
    if (!elderCols.some(ec => Math.abs(creature.col - ec) <= 5)) continue;

    const remaining = healCooldowns.get(cid) ?? 0;
    if (remaining > 0) {
      healCooldowns.set(cid, remaining - delta);
      continue;
    }
    healedIds.push(cid);
    healCooldowns.set(cid, 3000);
  }
  return healedIds;
}

/** Count bonus lives from fortified hazel plants. Max +3. */
export function countHazelBonusLives(forts: readonly PlantFort[]): number {
  return Math.min(3, forts.filter(f => f.speciesId === 'hazel').length);
}

/** Attack speed multiplier for a defender near fortified dogrose. */
export function getRoseVigorMultiplier(
  creatureCol: number,
  forts: readonly PlantFort[],
): number {
  const roseCols = forts.filter(f => f.speciesId === 'dogrose').map(f => f.plantCol);
  return roseCols.some(rc => Math.abs(creatureCol - rc) <= 5) ? 0.75 : 1.0;
}
