// Wave compositions per wave number
const WAVE_COMPOSITIONS: Record<number, Array<{ id: string; count: number }>> = {
  1: [{ id: 'rat',        count: 3 }],
  2: [{ id: 'rat',        count: 3 }, { id: 'weasel',    count: 1 }],
  3: [{ id: 'rat',        count: 2 }, { id: 'weasel',    count: 2 }, { id: 'stoat',      count: 1 }],
  4: [{ id: 'stoat',      count: 2 }, { id: 'weasel',    count: 2 }, { id: 'crow',       count: 1 }],
  5: [{ id: 'stoat',      count: 3 }, { id: 'crow',      count: 2 }, { id: 'fox_enemy',  count: 1 }],
};

const PREP_TIME_DEFAULT = 30_000;
const PREP_TIME_LATE    = 20_000;
const INITIAL_LIVES     = 5;

export type WaveEvent = 'wave-start' | 'wave-complete' | 'lives-lost' | 'game-over';

export class WaveManager {
  private waveNumber        = 0;
  private phase: 'off' | 'prep' | 'active' = 'off';
  private prepMsRemaining   = PREP_TIME_DEFAULT;
  private lives             = INITIAL_LIVES;
  private enemiesRemaining  = 0;
  private livesLostPending  = false;

  /** Begin defense mode — transitions from 'off' to 'prep' */
  start(): void {
    this.waveNumber      = 1;
    this.phase           = 'prep';
    this.prepMsRemaining = PREP_TIME_DEFAULT;
    this.enemiesRemaining = 0;
  }

  /**
   * Call every frame with delta ms.
   * Returns a WaveEvent when something notable happens, null otherwise.
   */
  update(delta: number): WaveEvent | null {
    if (this.phase === 'off') return null;

    if (this.lives <= 0) {
      this.phase = 'off';
      return 'game-over';
    }

    if (this.livesLostPending) {
      this.livesLostPending = false;
      return 'lives-lost';
    }

    if (this.phase === 'prep') {
      this.prepMsRemaining -= delta;
      if (this.prepMsRemaining <= 0) {
        this.phase            = 'active';
        this.enemiesRemaining = this.getEnemyCountForWave(this.waveNumber);
        return 'wave-start';
      }
      return null;
    }

    if (this.phase === 'active' && this.enemiesRemaining <= 0) {
      this.waveNumber     += 1;
      this.phase           = 'prep';
      this.prepMsRemaining = this.waveNumber >= 5 ? PREP_TIME_LATE : PREP_TIME_DEFAULT;
      return 'wave-complete';
    }

    return null;
  }

  /**
   * Returns the array of enemy def IDs to spawn for the given wave.
   * Waves 1-5 use fixed compositions; wave 6+ scales counts and adds extra foxes.
   */
  getEnemyIdsForWave(waveNum: number): string[] {
    const base  = waveNum <= 5 ? WAVE_COMPOSITIONS[waveNum] : WAVE_COMPOSITIONS[5];
    const scale = waveNum > 5 ? Math.ceil(waveNum / 3) : 1;

    const ids: string[] = [];
    for (const entry of base) {
      const count = entry.count * scale;
      for (let i = 0; i < count; i++) ids.push(entry.id);
    }

    if (waveNum > 5) {
      const extraFoxes = Math.floor((waveNum - 5) / 3) + 1;
      for (let i = 0; i < extraFoxes; i++) ids.push('fox_enemy');
    }

    return ids;
  }

  private getEnemyCountForWave(waveNum: number): number {
    const base  = waveNum <= 5 ? WAVE_COMPOSITIONS[waveNum] : WAVE_COMPOSITIONS[5];
    const scale = waveNum > 5 ? Math.ceil(waveNum / 3) : 1;
    const baseCount = base.reduce((sum, e) => sum + e.count * scale, 0);
    const extraFoxes = waveNum > 5 ? Math.floor((waveNum - 5) / 3) + 1 : 0;
    return baseCount + extraFoxes;
  }

  enemyDefeated(): void {
    if (this.enemiesRemaining > 0) this.enemiesRemaining -= 1;
  }

  enemyBreached(damage: number): void {
    this.lives = Math.max(0, this.lives - damage);
    if (this.lives > 0) this.livesLostPending = true;
  }

  getState(): Readonly<{
    waveNumber: number;
    phase: 'off' | 'prep' | 'active';
    prepMsRemaining: number;
    lives: number;
    enemiesRemainingInWave: number;
  }> {
    return {
      waveNumber:            this.waveNumber,
      phase:                 this.phase,
      prepMsRemaining:       this.prepMsRemaining,
      lives:                 this.lives,
      enemiesRemainingInWave: this.enemiesRemaining,
    };
  }

  isActive(): boolean {
    return this.phase !== 'off';
  }

  reset(): void {
    this.waveNumber       = 0;
    this.phase            = 'off';
    this.prepMsRemaining  = PREP_TIME_DEFAULT;
    this.lives            = INITIAL_LIVES;
    this.enemiesRemaining = 0;
    this.livesLostPending = false;
  }
}
