// Stub — real implementation provided by hedgeKingdoms FortificationManager unit

export interface Fortification {
  col: number;
  row: number;
  type: 'wall' | 'watchtower' | 'gate';
  hp: number;
  maxHp: number;
}

export class FortificationManager {
  private fortifications: Fortification[] = [];

  place(_col: number, _row: number, _type: 'wall' | 'watchtower' | 'gate'): void {}

  getFortifications(): Fortification[] { return this.fortifications; }
}
