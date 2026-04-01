import { Weather } from '@/types';

/** Maps a real-world date to a game period index (0–11). */
function realWorldPeriodIndex(): number {
  const now = new Date();
  const month = now.getMonth(); // 0 = Jan
  const day = now.getDate();    // 1–31

  let season: number;
  let dayInSeason: number;
  let seasonDays: number;

  if (month >= 2 && month <= 4) {
    // Spring: Mar–May
    season = 0;
    dayInSeason = (month === 2 ? 0 : month === 3 ? 31 : 61) + day;
    seasonDays = 92;
  } else if (month >= 5 && month <= 7) {
    // Summer: Jun–Aug
    season = 1;
    dayInSeason = (month === 5 ? 0 : month === 6 ? 30 : 61) + day;
    seasonDays = 92;
  } else if (month >= 8 && month <= 10) {
    // Autumn: Sep–Nov
    season = 2;
    dayInSeason = (month === 8 ? 0 : month === 9 ? 30 : 61) + day;
    seasonDays = 91;
  } else {
    // Winter: Dec–Feb
    season = 3;
    dayInSeason = (month === 11 ? 0 : month === 0 ? 31 : 62) + day;
    seasonDays = 90;
  }

  const sub = Math.min(2, Math.floor((dayInSeason / seasonDays) * 3));
  return season * 3 + sub;
}

function realWorldPeriodProgress(): number {
  const now = new Date();
  return (now.getHours() * 60 + now.getMinutes()) / (24 * 60);
}

function mapWmoToWeather(code: number, windSpeed: number): Weather {
  // Prioritise wind if notably strong (>40 km/h)
  if (windSpeed > 40) return Weather.Wind;
  if (code <= 2) return Weather.Clear;
  if (code === 3 || code === 45 || code === 48) return Weather.Overcast;
  // Snow / sleet before rain so higher codes don't fall through
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return Weather.Frost;
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return Weather.Rain;
  if (code >= 95) return Weather.Storm;
  return Weather.Clear;
}

export interface RealtimeSnapshot {
  periodIndex: number;
  periodProgress: number;
  weather: Weather;
}

export class RealtimeModeManager {
  private lat = 0;
  private lon = 0;
  private cachedWeather: Weather = Weather.Clear;
  private lastFetchMs = 0;
  private lastPeriodIndex = -1;
  private readonly FETCH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  /**
   * Request geolocation + initial weather fetch.
   * Throws on failure (permission denied, API error, etc.).
   */
  async enter(): Promise<RealtimeSnapshot> {
    const pos = await this.getLocation();
    this.lat = pos.coords.latitude;
    this.lon = pos.coords.longitude;
    this.cachedWeather = await this.fetchWeather();
    this.lastFetchMs = Date.now();
    const periodIndex = realWorldPeriodIndex();
    this.lastPeriodIndex = periodIndex;
    return {
      periodIndex,
      periodProgress: realWorldPeriodProgress(),
      weather: this.cachedWeather,
    };
  }

  /**
   * Call each game frame. Returns the current real-world snapshot and whether
   * the real-world period has advanced since the last call.
   */
  tick(): { snapshot: RealtimeSnapshot; periodAdvanced: boolean } {
    // Kick off a background weather refresh if the cache is stale
    if (Date.now() - this.lastFetchMs > this.FETCH_INTERVAL_MS) {
      this.lastFetchMs = Date.now();
      this.fetchWeather()
        .then(w => { this.cachedWeather = w; })
        .catch(() => { /* silently keep last known weather */ });
    }

    const periodIndex = realWorldPeriodIndex();
    const periodAdvanced = this.lastPeriodIndex !== -1 && periodIndex !== this.lastPeriodIndex;
    this.lastPeriodIndex = periodIndex;

    return {
      snapshot: {
        periodIndex,
        periodProgress: realWorldPeriodProgress(),
        weather: this.cachedWeather,
      },
      periodAdvanced,
    };
  }

  private getLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000 });
    });
  }

  private async fetchWeather(): Promise<Weather> {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${this.lat.toFixed(4)}&longitude=${this.lon.toFixed(4)}` +
      `&current=weather_code,wind_speed_10m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json() as {
      current?: { weather_code?: number; wind_speed_10m?: number };
    };
    const code = data.current?.weather_code ?? 0;
    const wind = data.current?.wind_speed_10m ?? 0;
    return mapWmoToWeather(code, wind);
  }
}
