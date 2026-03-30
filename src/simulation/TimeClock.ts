export class TimeClock {
  private periodIndex = 0;
  private tickAccumulator = 0;

  public getPeriodIndex(): number {
    return this.periodIndex;
  }

  /** Real-time milliseconds per period. Default ~8s = full year in ~96s. */
  private readonly tickDurationMs: number;

  constructor(tickDurationMs = 8000) {
    this.tickDurationMs = tickDurationMs;
  }

  public getYear(): number {
    return Math.floor(this.periodIndex / 12);
  }

  // Other methods...
}
