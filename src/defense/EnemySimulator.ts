// Stub — real implementation provided by hedgeKingdoms EnemySimulator unit
import type { PlantState } from '@/types';

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  speed: number;
  damage: number;
  char: string;
  fg: string;
}

export interface EnemyInstance {
  id: string;
  defId: string;
  col: number;
  row: number;
  hp: number;
  maxHp: number;
}

export interface EnemySimEvent {
  type: 'defeated' | 'breached';
  enemyId?: string;
  damage: number;
}

export class EnemySimulator {
  private enemies: EnemyInstance[] = [];
  private nextId = 0;

  update(_delta: number, _plants: ReadonlyArray<PlantState>): EnemySimEvent[] { return []; }

  spawn(defs: EnemyDef[]): void {
    for (const def of defs) {
      this.enemies.push({
        id: `e${this.nextId++}`,
        defId: def.id,
        col: 199,
        row: 20,
        hp: def.hp,
        maxHp: def.hp,
      });
    }
  }

  getEnemies(): EnemyInstance[] { return this.enemies; }

  applyDamage(enemyId: string, damage: number): void {
    const e = this.enemies.find(x => x.id === enemyId);
    if (e) e.hp -= damage;
    this.enemies = this.enemies.filter(x => x.hp > 0);
  }

  clear(): void { this.enemies = []; }
}
