import { Weather, GRID_CONFIG, OverlayLayer, type Glyph } from '@/types';
import type { AsciiRenderer } from '@/rendering/AsciiRenderer';

interface StarData {
  col: number;
  row: number;
  level: 0 | 1 | 2; // 0=dim, 1=medium, 2=bright
  twinkleOffset: number;
}

interface ShootingStarState {
  row: number;
  startCol: number;
  endCol: number;
  elapsed: number;
  duration: number;
}

const SKY_ROWS = 8; // rows 0–7
const STAR_COUNT = 120;

// Constellation patterns: [colOffset, rowOffset][]
// Anchored at a random sky position per seed
const CONSTELLATIONS: Array<[number, number][]> = [
  // Orion's Belt — 3 stars diagonal
  [[0, 0], [3, -1], [6, -2]],
  // The Plough — 7 stars (simplified)
  [[0, 0], [4, -1], [8, -1], [12, 0], [15, 0], [18, -2], [22, -4]],
  // Cassiopeia — W shape, 5 stars
  [[0, 0], [3, -2], [6, 0], [9, -2], [12, 0]],
  // Summer Triangle — 3 bright stars, wide spread
  [[0, 0], [12, -3], [6, -6]],
];

/** Fast, good-quality seeded PRNG (xorshift variant) */
function seededRand(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

export class StarMap {
  private renderer: AsciiRenderer;
  private stars: StarData[] = [];
  private constellationStars: StarData[] = [];
  private shooting: ShootingStarState | null = null;
  private shootTimer = 0;
  private overlayKeys: string[] = [];
  private updateTimer = 0;
  private animTime = 0;
  private weather: Weather = Weather.Clear;

  constructor(renderer: AsciiRenderer, seed: number) {
    this.renderer = renderer;
    this.generate(seed);
  }

  /** Regenerate star positions with a new seed (called on save-load) */
  reseed(seed: number): void {
    this.clearOverlays();
    this.stars = [];
    this.constellationStars = [];
    this.generate(seed);
  }

  private generate(seed: number): void {
    const rand = seededRand(seed);
    const cols = GRID_CONFIG.cols;

    // Random background stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const col = Math.floor(rand() * cols);
      const row = Math.floor(rand() * SKY_ROWS);
      const r = rand();
      const level: 0 | 1 | 2 = r < 0.55 ? 0 : r < 0.85 ? 1 : 2;
      const twinkleOffset = rand();
      this.stars.push({ col, row, level, twinkleOffset });
    }

    // 2–3 constellation patterns at random sky positions
    const numConstellations = Math.floor(rand() * 2) + 2;
    const usedPatterns = new Set<number>();
    for (let p = 0; p < numConstellations; p++) {
      let patIdx: number;
      do { patIdx = Math.floor(rand() * CONSTELLATIONS.length); } while (usedPatterns.has(patIdx));
      usedPatterns.add(patIdx);

      const pattern = CONSTELLATIONS[patIdx];
      const anchorCol = Math.floor(rand() * (cols - 30)) + 5;
      const anchorRow = Math.floor(rand() * 3) + 2; // rows 2–4

      for (const [dc, dr] of pattern) {
        const col = anchorCol + dc;
        const row = anchorRow + dr;
        if (col >= 0 && col < cols && row >= 0 && row < SKY_ROWS) {
          this.constellationStars.push({ col, row, level: 2, twinkleOffset: rand() });
        }
      }
    }
  }

  setWeather(weather: Weather): void {
    this.weather = weather;
  }

  /** Called each frame. dayPhase 0–1 (0 = midnight, 0.5 = noon). */
  update(delta: number, dayPhase: number): void {
    this.animTime += delta;
    this.updateTimer += delta;
    if (this.updateTimer < 120) return;
    this.updateTimer = 0;

    this.clearOverlays();

    // Stars hidden during overcast/rain/storm/frost
    if ([Weather.Overcast, Weather.Rain, Weather.Storm, Weather.Frost].includes(this.weather)) return;

    // Visibility alpha:
    //   Full night (phase < 0.15 or > 0.85) → 1.0
    //   Fade out at dawn  (0.15–0.25, Lauds→Prime)
    //   Daytime (0.25–0.70) → 0.0
    //   Fade in at dusk   (0.70–0.85, Vespers→Compline)
    let alpha: number;
    if (dayPhase < 0.15 || dayPhase > 0.85) {
      alpha = 1.0;
    } else if (dayPhase < 0.25) {
      alpha = 1.0 - (dayPhase - 0.15) / 0.10;
    } else if (dayPhase < 0.70) {
      alpha = 0.0;
    } else if (dayPhase < 0.85) {
      alpha = (dayPhase - 0.70) / 0.15;
    } else {
      alpha = 1.0;
    }

    if (alpha <= 0.01) return;

    const t = this.animTime * 0.001;

    // Background stars
    for (const star of this.stars) {
      if (Math.random() > alpha) continue;
      this.place(star.col, star.row, this.starGlyph(star, t));
    }

    // Constellation stars — slightly favoured so patterns stay visible
    for (const star of this.constellationStars) {
      if (Math.random() > Math.min(1, alpha * 1.4)) continue;
      this.place(star.col, star.row, this.constellationGlyph(star, t));
    }

    // Shooting star
    this.tickShootingStar(delta, alpha);
  }

  private starGlyph(star: StarData, t: number): Glyph {
    const twinkle = Math.sin(t * 2.3 + star.twinkleOffset * Math.PI * 2);
    if (star.level === 0) {
      // Dim: flickers between . and *
      return twinkle > 0.4
        ? { char: '*', fg: '#6a6a9e' }
        : { char: '.', fg: '#3a3a5e' };
    } else if (star.level === 1) {
      // Medium: * with occasional ✦ sparkle
      return twinkle > 0.6
        ? { char: '\u2726', fg: '#b0b0d8' }
        : { char: '*', fg: '#8888b8' };
    } else {
      // Bright: ✦ that brightens on peak
      return twinkle > 0.3
        ? { char: '\u2726', fg: '#d0d0f0' }
        : { char: '*', fg: '#a0a0cc' };
    }
  }

  private constellationGlyph(star: StarData, t: number): Glyph {
    const twinkle = Math.sin(t * 1.9 + star.twinkleOffset * Math.PI * 2);
    return twinkle > 0.4
      ? { char: '\u2726', fg: '#e0e0ff' }
      : { char: '*', fg: '#b0b0e0' };
  }

  private tickShootingStar(delta: number, alpha: number): void {
    if (this.shooting) {
      this.shooting.elapsed += delta;
      const progress = Math.min(1, this.shooting.elapsed / this.shooting.duration);
      const span = this.shooting.endCol - this.shooting.startCol;
      const headCol = Math.floor(this.shooting.startCol + span * progress);
      const trailLen = 5;
      for (let i = 0; i < trailLen; i++) {
        const c = headCol - i;
        if (c >= 0 && c < GRID_CONFIG.cols) {
          const brightness = 1.0 - i / trailLen;
          const fg = brightness > 0.7 ? '#ffffff' : brightness > 0.4 ? '#c0c0d8' : '#6060a0';
          const char = i === 0 ? '\u2726' : i < 3 ? '\u00B7' : '.';
          this.place(c, this.shooting.row, { char, fg });
        }
      }
      if (progress >= 1.0) this.shooting = null;
    } else if (alpha > 0.7) {
      // ~1 shooting star every ~10s of night time, with some randomness
      this.shootTimer += 120;
      if (this.shootTimer > 8000 && Math.random() < 0.008) {
        this.shootTimer = 0;
        const row = Math.floor(Math.random() * 5) + 1;
        const startCol = Math.floor(Math.random() * (GRID_CONFIG.cols - 40)) + 5;
        this.shooting = {
          row,
          startCol,
          endCol: startCol + 25 + Math.floor(Math.random() * 25),
          elapsed: 0,
          duration: 500 + Math.random() * 500,
        };
      }
    }
  }

  private place(col: number, row: number, glyph: Glyph): void {
    const key = `${col},${row}`;
    this.overlayKeys.push(key);
    this.renderer.setOverlay(col, row, glyph, OverlayLayer.Stars);
  }

  private clearOverlays(): void {
    for (const key of this.overlayKeys) {
      const [c, r] = key.split(',').map(Number);
      this.renderer.clearOverlay(c, r, OverlayLayer.Stars);
    }
    this.overlayKeys = [];
  }
}
