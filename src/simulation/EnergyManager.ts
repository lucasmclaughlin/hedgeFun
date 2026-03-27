import { Season, MoonPhase, type TimePeriod } from '@/types';

const BASE_ENERGY: Record<Season, number> = {
  [Season.Spring]: 3,
  [Season.Summer]: 2,
  [Season.Autumn]: 2,
  [Season.Winter]: 1,
};

const MOON_BONUS: Record<MoonPhase, number> = {
  [MoonPhase.New]: 0,
  [MoonPhase.Waxing]: 1,
  [MoonPhase.Full]: 2,
  [MoonPhase.Waning]: 0,
};

export class EnergyManager {
  private energy: number;

  constructor(startingEnergy = 5) {
    this.energy = startingEnergy;
  }

  onPeriodAdvance(period: TimePeriod, moon: MoonPhase): void {
    const gain = BASE_ENERGY[period.season] + MOON_BONUS[moon];
    this.energy += gain;
  }

  spend(amount: number): boolean {
    if (this.energy < amount) return false;
    this.energy -= amount;
    return true;
  }

  getEnergy(): number {
    return this.energy;
  }
}
