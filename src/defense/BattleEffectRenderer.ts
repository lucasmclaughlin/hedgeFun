// Stub — real implementation provided by hedgeKingdoms BattleEffectRenderer unit
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import type { BattleEffect } from '@/defense/DefenderCombatSystem';

export class BattleEffectRenderer {
  constructor(_renderer: AsciiRenderer) {}

  addEffect(_effect: BattleEffect): void {}
  update(_delta: number): void {}
  render(): void {}
  clear(): void {}
}
