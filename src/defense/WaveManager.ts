export type WaveEvent =
  | 'wave-start'
  | 'wave-complete'
  | 'game-over'
  | 'campaign-complete';

export interface WaveState {
  waveNumber: number;
  phase: 'off' | 'prep' | 'wave' | 'complete' | 'game-over';
  prepMsRemaining: number;
  lives: number;
  enemiesRemainingInWave: number;
}

/** Fixed 10-wave seasonal campaign (Spring → Summer → Autumn → Winter boss) */
const WAVE_TABLE: ReadonlyArray<readonly string[]> = [
  // Spring — minor raids
  ['rat', 'rat', 'rat'],
  ['rat', 'rat', 'rat', 'bandit_rat'],
  ['rat', 'rat', 'bandit_rat', 'bandit_rat', 'weasel'],
  // Summer — organised raiders
  ['stoat', 'stoat', 'weasel', 'weasel', 'raider_crow'],
  ['bandit_rat', 'bandit_rat', 'bandit_rat', 'stoat', 'stoat', 'raider_crow', 'raider_crow'],
  ['stoat', 'stoat', 'stoat', 'raider_crow', 'raider_crow', 'weasel', 'weasel', 'weasel'],
  // Autumn — armies
  ['army_stoat', 'army_stoat', 'stoat', 'stoat', 'stoat', 'fox_enemy'],
  ['army_stoat', 'army_stoat', 'army_stoat', 'crow', 'crow', 'raider_crow', 'raider_crow'],
  ['army_stoat', 'army_stoat', 'army_stoat', 'fox_enemy', 'fox_enemy', 'raider_crow', 'raider_crow', 'raider_crow'],
  // Winter — boss siege
  [
    'warlord_fox',
    'army_stoat', 'army_stoat', 'army_stoat', 'army_stoat',
    'fox_enemy', 'fox_enemy',
    'raider_crow', 'raider_crow', 'raider_crow',
    'stoat', 'stoat', 'stoat', 'stoat',
  ],
];

const TOTAL_WAVES = WAVE_TABLE.length;

/** Prep time before each wave (ms). Wave 1 is quick; wave 10 gets breathing room. */
function getPrepMsForWave(waveNum: number): number {
  if (waveNum === 1) return 20000;
  if (waveNum === 10) return 45000;
  return 30000;
}

function makeInitialState(): WaveState {
  return {
    waveNumber: 0,
    phase: 'off',
    prepMsRemaining: 0,
    lives: 5,
    enemiesRemainingInWave: 0,
  };
}

export type Difficulty = 'easy' | 'normal' | 'hard';

const LIVES_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 8, normal: 5, hard: 3 };

export class WaveManager {
  private state: WaveState = makeInitialState();
  private difficulty: Difficulty = 'normal';

  start(): void {
    this.state.waveNumber = 1;
    this.state.phase = 'prep';
    this.state.prepMsRemaining = getPrepMsForWave(1);
    this.state.lives = LIVES_BY_DIFFICULTY[this.difficulty];
    this.state.enemiesRemainingInWave = 0;
  }

  update(delta: number): WaveEvent | null {
    if (this.state.phase === 'game-over') {
      // Signal once, then shut down so we don't spam the event
      this.state.phase = 'off';
      return 'game-over';
    }
    if (this.state.phase === 'prep') {
      this.state.prepMsRemaining -= delta;
      if (this.state.prepMsRemaining <= 0) {
        this.state.prepMsRemaining = 0;
        this.state.phase = 'wave';
        this.state.enemiesRemainingInWave = this.getEnemyIdsForWave(this.state.waveNumber).length;
        return 'wave-start';
      }
    } else if (this.state.phase === 'wave') {
      if (this.state.enemiesRemainingInWave <= 0) {
        // Wave cleared — advance or finish the campaign
        if (this.state.waveNumber >= TOTAL_WAVES) {
          this.state.phase = 'off';
          return 'campaign-complete';
        }
        this.state.waveNumber += 1;
        this.state.phase = 'prep';
        this.state.prepMsRemaining = getPrepMsForWave(this.state.waveNumber);
        return 'wave-complete';
      }
    }
    return null;
  }

  getEnemyIdsForWave(waveNum: number): string[] {
    if (waveNum < 1 || waveNum > TOTAL_WAVES) return [];
    return [...WAVE_TABLE[waveNum - 1]];
  }

  enemyDefeated(): void {
    if (this.state.phase === 'wave' && this.state.enemiesRemainingInWave > 0) {
      this.state.enemiesRemainingInWave -= 1;
    }
  }

  enemyBreached(damage: number): void {
    this.state.lives -= damage;
    if (this.state.phase === 'wave' && this.state.enemiesRemainingInWave > 0) {
      this.state.enemiesRemainingInWave -= 1;
    }
    if (this.state.lives <= 0) {
      this.state.lives = 0;
      this.state.phase = 'game-over';
    }
  }

  getState(): WaveState {
    return this.state;
  }

  isActive(): boolean {
    return this.state.phase !== 'off';
  }

  reset(): void {
    this.state = makeInitialState();
  }

  addPrepTime(ms: number): void {
    if (this.state.phase === 'prep') {
      this.state.prepMsRemaining += ms;
    }
  }

  setDifficulty(level: Difficulty): void {
    this.difficulty = level;
  }

  getDifficulty(): Difficulty {
    return this.difficulty;
  }

  /** Start the campaign at a specific wave number (skipping earlier waves) */
  startAtWave(wave: number): void {
    const clamped = Math.max(1, Math.min(wave, TOTAL_WAVES));
    this.state.waveNumber = clamped;
    this.state.phase = 'prep';
    this.state.prepMsRemaining = getPrepMsForWave(clamped);
    this.state.lives = LIVES_BY_DIFFICULTY[this.difficulty];
    this.state.enemiesRemainingInWave = 0;
  }
}
