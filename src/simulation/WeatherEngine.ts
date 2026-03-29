import { Season, Weather, GRID_CONFIG, LAYER_CONFIGS, OverlayLayer, type TimePeriod, type Glyph } from '@/types';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';

/** Season-weighted weather probabilities: [Clear, Overcast, Rain, Storm, Wind, Frost] */
const WEATHER_WEIGHTS: Record<Season, number[]> = {
  [Season.Spring]: [30, 25, 25, 5, 10, 5],
  [Season.Summer]: [40, 20, 15, 10, 10, 5],
  [Season.Autumn]: [20, 25, 25, 5, 20, 5],
  [Season.Winter]: [15, 25, 15, 5, 15, 25],
};

const WEATHER_NAMES: Record<Weather, string> = {
  [Weather.Clear]: 'Clear',
  [Weather.Overcast]: 'Overcast',
  [Weather.Rain]: 'Rain',
  [Weather.Storm]: 'Storm',
  [Weather.Wind]: 'Windy',
  [Weather.Frost]: 'Frost',
};

/** Rain drop glyphs */
const RAIN_GLYPHS: Glyph[] = [
  { char: '|', fg: '#6688aa' },
  { char: ':', fg: '#5577aa' },
  { char: "'", fg: '#5577aa' },
];

/** Storm glyphs */
const STORM_GLYPHS: Glyph[] = [
  { char: '|', fg: '#7799bb' },
  { char: '/', fg: '#7799bb' },
  { char: ':', fg: '#6688aa' },
];

/** Wind glyphs */
const WIND_GLYPHS: Glyph[] = [
  { char: '~', fg: '#7a7a8a' },
  { char: '-', fg: '#6a6a7a' },
  { char: '=', fg: '#7a7a8a' },
];

/** Frost glyphs */
const FROST_GLYPHS: Glyph[] = [
  { char: '*', fg: '#aaccee' },
  { char: '+', fg: '#99bbdd' },
  { char: '\u00B7', fg: '#88aacc' },
];

/** Overcast glyphs */
const CLOUD_GLYPHS: Glyph[] = [
  { char: '~', fg: '#5a5a6a' },
  { char: '-', fg: '#4a4a5a' },
  { char: '_', fg: '#5a5a6a' },
];

/** Clear night sky glyphs */
const STAR_GLYPHS: Glyph[] = [
  { char: '*', fg: '#9a9abe' },
  { char: '.', fg: '#7a7a9e' },
  { char: '\u00B7', fg: '#8a8aae' },
];

export class WeatherEngine {
  private current: Weather = Weather.Clear;
  private skyOverlayKeys: string[] = [];
  private renderer: AsciiRenderer;
  private frameCounter = 0;

  private readonly skyStartRow: number;
  private readonly skyEndRow: number;

  constructor(renderer: AsciiRenderer) {
    this.renderer = renderer;
    const skyConfig = LAYER_CONFIGS[0];
    this.skyStartRow = skyConfig.startRow;
    this.skyEndRow = skyConfig.endRow;
  }

  /** Called each period advance — pick new weather */
  onPeriodAdvance(period: TimePeriod): void {
    const weights = WEATHER_WEIGHTS[period.season];
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        this.current = i as Weather;
        break;
      }
    }
  }

  getCurrentWeather(): Weather {
    return this.current;
  }

  getWeatherName(): string {
    return WEATHER_NAMES[this.current];
  }

  /** Called each frame to animate weather in sky rows */
  updateSkyOverlays(delta: number): void {
    this.frameCounter += delta;

    // Update every ~200ms for animation
    if (this.frameCounter < 200) return;
    this.frameCounter = 0;

    // Clear previous overlays
    for (const key of this.skyOverlayKeys) {
      const [c, r] = key.split(',').map(Number);
      this.renderer.clearOverlay(c, r, OverlayLayer.Weather);
    }
    this.skyOverlayKeys = [];

    const cols = GRID_CONFIG.cols;

    switch (this.current) {
      case Weather.Clear:
        this.renderClearSky(cols);
        break;
      case Weather.Overcast:
        this.renderOvercast(cols);
        break;
      case Weather.Rain:
        this.renderRain(cols, RAIN_GLYPHS, 0.08);
        break;
      case Weather.Storm:
        this.renderRain(cols, STORM_GLYPHS, 0.15);
        this.renderLightning(cols);
        break;
      case Weather.Wind:
        this.renderWind(cols);
        break;
      case Weather.Frost:
        this.renderFrost(cols);
        break;
    }
  }

  private setOverlay(col: number, row: number, glyph: Glyph): void {
    const key = `${col},${row}`;
    this.skyOverlayKeys.push(key);
    this.renderer.setOverlay(col, row, glyph, OverlayLayer.Weather);
  }

  private renderClearSky(cols: number): void {
    // Sparse twinkling stars
    for (let col = 0; col < cols; col++) {
      for (let row = this.skyStartRow; row <= this.skyEndRow; row++) {
        if (Math.random() < 0.015) {
          const g = STAR_GLYPHS[Math.floor(Math.random() * STAR_GLYPHS.length)];
          this.setOverlay(col, row, g);
        }
      }
    }
  }

  private renderOvercast(cols: number): void {
    // Dense cloud layer in upper sky rows
    for (let col = 0; col < cols; col++) {
      for (let row = this.skyStartRow; row <= this.skyEndRow; row++) {
        const density = row <= this.skyStartRow + 3 ? 0.25 : 0.1;
        if (Math.random() < density) {
          const g = CLOUD_GLYPHS[Math.floor(Math.random() * CLOUD_GLYPHS.length)];
          this.setOverlay(col, row, g);
        }
      }
    }
  }

  private renderRain(cols: number, glyphs: Glyph[], density: number): void {
    for (let col = 0; col < cols; col++) {
      for (let row = this.skyStartRow; row <= this.skyEndRow; row++) {
        if (Math.random() < density) {
          const g = glyphs[Math.floor(Math.random() * glyphs.length)];
          this.setOverlay(col, row, g);
        }
      }
    }
  }

  private renderLightning(cols: number): void {
    // Rare lightning flash — one bright column
    if (Math.random() < 0.15) {
      const col = Math.floor(Math.random() * cols);
      for (let row = this.skyStartRow; row <= this.skyEndRow; row++) {
        if (Math.random() < 0.6) {
          this.setOverlay(col, row, { char: '/', fg: '#ffffaa' });
        }
      }
    }
  }

  private renderWind(cols: number): void {
    for (let col = 0; col < cols; col++) {
      for (let row = this.skyStartRow; row <= this.skyEndRow; row++) {
        if (Math.random() < 0.06) {
          const g = WIND_GLYPHS[Math.floor(Math.random() * WIND_GLYPHS.length)];
          this.setOverlay(col, row, g);
        }
      }
    }
  }

  private renderFrost(cols: number): void {
    // Frost crystals mostly in lower sky
    for (let col = 0; col < cols; col++) {
      for (let row = this.skyStartRow; row <= this.skyEndRow; row++) {
        const density = row >= this.skyEndRow - 2 ? 0.08 : 0.03;
        if (Math.random() < density) {
          const g = FROST_GLYPHS[Math.floor(Math.random() * FROST_GLYPHS.length)];
          this.setOverlay(col, row, g);
        }
      }
    }
  }

  setWeather(w: Weather): void {
    this.current = w;
  }
}
