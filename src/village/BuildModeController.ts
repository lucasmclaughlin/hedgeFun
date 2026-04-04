import { BuildModeState } from '@/types';
import type { BuildModeContext, HouseState, Glyph } from '@/types';

/**
 * State machine for build mode: palette navigation, cursor movement, glyph selection.
 */
export class BuildModeController {
  private context: BuildModeContext = {
    state: BuildModeState.Browsing,
    activeHouseId: null,
    selectedGlyph: null,
    selectedCategory: 0,
    selectedIndex: 0,
    cursorCol: 0,
    cursorRow: 0,
  };

  getState(): BuildModeState {
    return this.context.state;
  }

  getContext(): Readonly<BuildModeContext> {
    return this.context;
  }

  // ── State transitions ──

  enterBuildMode(houseId: number): void {
    this.context.state = BuildModeState.Building;
    this.context.activeHouseId = houseId;
    this.context.selectedCategory = 0;
    this.context.selectedIndex = 0;
    this.context.selectedGlyph = null;
  }

  exitBuildMode(): void {
    this.context.state = BuildModeState.Browsing;
    this.context.activeHouseId = null;
    this.context.selectedGlyph = null;
  }

  enterInteriorView(houseId: number): void {
    this.context.state = BuildModeState.ViewingInterior;
    this.context.activeHouseId = houseId;
  }

  exitInteriorView(): void {
    this.context.state = BuildModeState.Browsing;
    this.context.activeHouseId = null;
  }

  // ── Cursor ──

  setCursor(col: number, row: number): void {
    this.context.cursorCol = col;
    this.context.cursorRow = row;
  }

  moveCursor(dc: number, dr: number, house: HouseState): void {
    const newCol = this.context.cursorCol + dc;
    const newRow = this.context.cursorRow + dr;
    if (newCol >= 0 && newCol < house.width && newRow >= 0 && newRow < house.height) {
      this.context.cursorCol = newCol;
      this.context.cursorRow = newRow;
    }
  }

  // ── Glyph / palette ──

  /** Set the selected glyph directly (used by the build panel UI) */
  setSelectedGlyph(glyph: Glyph | null): void {
    this.context.selectedGlyph = glyph;
  }

}
