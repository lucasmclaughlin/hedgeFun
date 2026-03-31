import { Season, SubSeason, MoonPhase, type TimePeriod } from '@/types';

const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];
const SUB_NAMES = ['Early', 'Mid', 'Late'];
const MOON_NAMES = ['New', 'Waxing', 'Full', 'Waning'];
const MOON_SYMBOLS = ['\u25CB', '\u25D1', '\u25CF', '\u25D0']; // ○ ◑ ● ◐

/** Time speed multipliers — index into SPEED_STEPS */
const SPEED_STEPS = [0, 0.5, 1, 2];
const SPEED_LABELS = ['\u23F8 Paused', '\u25B6 Slow', '\u25B6 Normal', '\u25B6\u25B6 Fast'];

export class TimeClock {
  private periodIndex = 0;
  private tickAccumulator = 0;
  private speedIndex = 2; // Start at Normal (1×)

  /** Real-time milliseconds per period. Default ~8s = full year in ~96s. */
  private readonly tickDurationMs: number;

  constructor(tickDurationMs = 8000) {
    this.tickDurationMs = tickDurationMs;
  }

  /** Advance by delta ms. Returns true if a new period just started. */
  tick(deltaMs: number): boolean {
    const scale = SPEED_STEPS[this.speedIndex];
    if (scale === 0) return false; // paused
    this.tickAccumulator += deltaMs * scale;
    if (this.tickAccumulator >= this.tickDurationMs) {
      this.tickAccumulator -= this.tickDurationMs;
      this.periodIndex++;
      return true;
    }
    return false;
  }

  /** Cycle through speed steps: Paused → Slow → Normal → Fast → Paused */
  cycleSpeed(): void {
    this.speedIndex = (this.speedIndex + 1) % SPEED_STEPS.length;
  }

  getIsPaused(): boolean {
    return this.speedIndex === 0;
  }

  getSpeedLabel(): string {
    return SPEED_LABELS[this.speedIndex];
  }

  getCurrentPeriod(): TimePeriod {
    const i = this.periodIndex % 12;
    return {
      season: Math.floor(i / 3) as Season,
      sub: (i % 3) as SubSeason,
      index: i,
    };
  }

  getMoonPhase(): MoonPhase {
    return (this.periodIndex % 4) as MoonPhase;
  }

  getSeasonName(): string {
    return SEASON_NAMES[this.getCurrentPeriod().season];
  }

  getSubSeasonName(): string {
    return SUB_NAMES[this.getCurrentPeriod().sub];
  }

  getMoonPhaseName(): string {
    return MOON_NAMES[this.getMoonPhase()];
  }

  getMoonSymbol(): string {
    return MOON_SYMBOLS[this.getMoonPhase()];
  }

  /** Current in-game year, starting at 1. */
  getYear(): number {
    return Math.floor(this.periodIndex / 12) + 1;
  }

  /** Progress through current period as 0–1 */
  getPeriodProgress(): number {
    return this.tickAccumulator / this.tickDurationMs;
  }

  getTotalPeriods(): number {
    return this.periodIndex;
  }

  // ── Save/Load ──

  getState(): { periodIndex: number; tickAccumulator: number } {
    return { periodIndex: this.periodIndex, tickAccumulator: this.tickAccumulator };
  }

  loadState(periodIndex: number, tickAccumulator: number): void {
    this.periodIndex = periodIndex;
    this.tickAccumulator = tickAccumulator;
  }
}
