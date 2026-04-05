import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { OverlayLayer, Glyph, GRID_CONFIG } from '@/types';
import { Fortification } from '@/defense/FortificationManager';

const FORT_LAYER = OverlayLayer.Fortification;

function inBounds(col: number, row: number): boolean {
  return col >= 0 && col < GRID_CONFIG.cols && row >= 0 && row < GRID_CONFIG.rows;
}

function setCell(ascii: AsciiRenderer, col: number, row: number, glyph: Glyph, cells: Array<[number, number]>): void {
  if (!inBounds(col, row)) return;
  ascii.setOverlay(col, row, glyph, FORT_LAYER);
  cells.push([col, row]);
}

function wallGlyphs(hp: number): [Glyph, Glyph] {
  if (hp >= 3) return [{ char: '[', fg: '#a0a0a0' }, { char: ']', fg: '#a0a0a0' }];
  if (hp === 2) return [{ char: '[', fg: '#787878' }, { char: ']', fg: '#787878' }];
  return [{ char: '{', fg: '#604040' }, { char: '}', fg: '#604040' }];
}

function drawWall(ascii: AsciiRenderer, f: Fortification, cells: Array<[number, number]>): void {
  const [left, right] = wallGlyphs(f.hp);
  setCell(ascii, f.col,     f.row, left,  cells);
  setCell(ascii, f.col + 1, f.row, right, cells);
}

function drawWatchtower(ascii: AsciiRenderer, f: Fortification, cells: Array<[number, number]>): void {
  const color = '#c89060';
  setCell(ascii, f.col, f.row - 1, { char: '^', fg: color }, cells);
  setCell(ascii, f.col - 1, f.row, { char: '|', fg: color }, cells);
  setCell(ascii, f.col,     f.row, { char: '^', fg: color }, cells);
  setCell(ascii, f.col + 1, f.row, { char: '|', fg: color }, cells);
}

function gateStyle(hp: number): { chars: [string, string, string, string]; color: string } {
  return hp >= 2
    ? { chars: ['[', '|', '|', ']'], color: '#d4a840' }
    : { chars: ['[', '/', '/', ']'], color: '#a07828' };
}

function drawGate(ascii: AsciiRenderer, f: Fortification, cells: Array<[number, number]>): void {
  const { chars: [c0, c1, c2, c3], color } = gateStyle(f.hp);
  setCell(ascii, f.col,     f.row, { char: c0, fg: color }, cells);
  setCell(ascii, f.col + 1, f.row, { char: c1, fg: color }, cells);
  setCell(ascii, f.col + 2, f.row, { char: c2, fg: color }, cells);
  setCell(ascii, f.col + 3, f.row, { char: c3, fg: color }, cells);
}

const PREVIEW_COLOR = '#505050';

export class FortificationUI {
  private prevCells: Array<[number, number]> = [];

  constructor(private ascii: AsciiRenderer) {}

  render(forts: readonly Fortification[]): void {
    this.clear();
    for (const f of forts) {
      if (f.type === 'wall')       drawWall(this.ascii, f, this.prevCells);
      else if (f.type === 'watchtower') drawWatchtower(this.ascii, f, this.prevCells);
      else                         drawGate(this.ascii, f, this.prevCells);
    }
  }

  renderPlacementPreview(col: number, row: number, type: Fortification['type']): void {
    if (type === 'wall') {
      setCell(this.ascii, col,     row, { char: '[', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col + 1, row, { char: ']', fg: PREVIEW_COLOR }, this.prevCells);
    } else if (type === 'watchtower') {
      setCell(this.ascii, col,     row - 1, { char: '^', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col - 1, row,     { char: '|', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col,     row,     { char: '^', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col + 1, row,     { char: '|', fg: PREVIEW_COLOR }, this.prevCells);
    } else {
      setCell(this.ascii, col,     row, { char: '[', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col + 1, row, { char: '|', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col + 2, row, { char: '|', fg: PREVIEW_COLOR }, this.prevCells);
      setCell(this.ascii, col + 3, row, { char: ']', fg: PREVIEW_COLOR }, this.prevCells);
    }
  }

  clear(): void {
    for (const [c, r] of this.prevCells) {
      this.ascii.clearOverlay(c, r, FORT_LAYER);
    }
    this.prevCells = [];
  }
}
