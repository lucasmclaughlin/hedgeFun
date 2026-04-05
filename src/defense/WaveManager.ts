// Stub — real implementation provided by hedgeKingdoms WaveManager unit

export interface WaveState {
  waveNumber: number;
  phase: 'off' | 'prep' | 'wave' | 'complete' | 'game-over';
  prepMsRemaining: number;
  lives: number;
  enemiesRemainingInWave: number;
}

export class WaveManager {
  private state: WaveState = {
    waveNumber: 0,
    phase: 'off',
    prepMsRemaining: 0,
    lives: 5,
    enemiesRemainingInWave: 0,
  };

  start(): void {
    this.state.phase = 'prep';
    this.state.waveNumber = 1;
    this.state.prepMsRemaining = 10000;
    this.state.lives = 5;
  }

  update(_delta: number): string | null { return null; }
  getEnemyIdsForWave(_waveNum: number): string[] { return []; }
  enemyDefeated(): void {}
  enemyBreached(_damage: number): void {}
  getState(): WaveState { return this.state; }
  isActive(): boolean { return this.state.phase !== 'off'; }
  addPrepTime(_ms: number): void {}
}
