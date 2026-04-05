// Stub — real implementation provided by hedgeKingdoms EnemyRenderer unit
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';
import type { EnemyInstance, EnemyDef } from '@/defense/EnemySimulator';

export class EnemyRenderer {
  constructor(_renderer: AsciiRenderer) {}

  render(_enemies: EnemyInstance[], _enemyMap: Record<string, EnemyDef>): void {}

  clear(): void {}
}
