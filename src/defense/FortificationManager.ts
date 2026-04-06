export interface Fortification {
  col: number;
  row: number;
  type: 'wall' | 'watchtower' | 'gate';
  hp: number;
}

const MAX_HP: Record<Fortification['type'], number> = {
  wall: 3,
  watchtower: 2,
  gate: 4,
};

export class FortificationManager {
  private forts: Fortification[] = [];

  place(col: number, row: number, type: Fortification['type']): boolean {
    if (this.getFortAt(col, row)) return false;
    this.forts.push({ col, row, type, hp: MAX_HP[type] });
    return true;
  }

  remove(col: number, row: number): void {
    this.forts = this.forts.filter(f => !(f.col === col && f.row === row));
  }

  applyDamage(col: number, row: number, amount: number): number {
    const fort = this.getFortAt(col, row);
    if (!fort) return -1;
    fort.hp = Math.max(0, fort.hp - amount);
    if (fort.hp === 0) this.remove(col, row);
    return fort.hp;
  }

  getFortifications(): readonly Fortification[] {
    return this.forts;
  }

  getFortAt(col: number, row: number): Fortification | null {
    return this.forts.find(f => f.col === col && f.row === row) ?? null;
  }

  getSpeedMultiplier(col: number, row: number): number {
    const fort = this.getFortAt(col, row);
    if (!fort) return 1.0;
    if (fort.type === 'wall') return 0.0;
    if (fort.type === 'gate') return 0.3;
    return 1.0; // watchtower
  }
}
