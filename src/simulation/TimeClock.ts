import { Season, SubSeason, MoonPhase, type TimePeriod } from '@/types';

const SEASON_NAMES = ['Spring', 'Summer', 'Autumn', 'Winter'];
const SUB_NAMES = ['Early', 'Mid', 'Late'];
const MOON_NAMES = ['New', 'Waxing', 'Full', 'Waning'];
const MOON_SYMBOLS = ['\u25CB', '\u25D1', '\u25CF', '\u25D0']; // ○ ◑ ● ◐

export class TimeClock {
  private periodIndex = 0;
  private tickAccumulator = 0;

  /** Real-time milliseconds per period. Default ~8s = full year in ~96s. */
  private readonly tickDurationMs: number;

  constructor(tickDurationMs = 8000) {
    this.tickDurationMs = tickDurationMs;
  }

  /** Advance by delta ms. Returns true if a new period just started. */
  tick(deltaMs: number): boolean {
    this.tickAccumulator += deltaMs;
    if (this.tickAccumulator >= this.tickDurationMs) {
      this.tickAccumulator -= this.tickDurationMs;
      this.periodIndex++;
      return true;
    }
    return false;
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

  /** Progress through current period as 0-1 */
  getPeriodProgress(): number {
    return this.tickAccumulator / this.tickDurationMs;
  }

  getTotalPeriods(): number {
    return this.periodIndex;
  }
}
