import type { Glyph } from '@/types';
import { BUILD_PALETTE } from '@/data/buildPalette';

export type BuildTool = 'paint' | 'erase' | 'pick';

export interface BuildPanelEvents {
  onBrushChanged: (glyph: Glyph) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Preset color palette organized by theme */
const PALETTE_COLORS: string[][] = [
  // Wood tones
  ['#8b6d4a', '#7a5c3a', '#6b4d2a', '#9a7a5a', '#b08040', '#c4a060', '#d4b070', '#aa8855'],
  // Stone / dark
  ['#1a1610', '#3a3020', '#4a4a4a', '#5a5040', '#666666', '#6a6a7a', '#888888', '#aaaaaa'],
  // Nature
  ['#2a5a1a', '#3a7a2a', '#4a8a3a', '#5a9a4a', '#6aba4a', '#5aaa3a', '#4a7a3a', '#8aca5a'],
  // Warm
  ['#994433', '#cc4433', '#dd6633', '#ee8833', '#eebb44', '#ddaa44', '#cc8844', '#ee6644'],
  // Cool
  ['#333366', '#336699', '#4488cc', '#88aacc', '#aaccee', '#cc6688', '#aa88ee', '#cc88aa'],
  // Light / accent
  ['#ccbbaa', '#ddccbb', '#ccccaa', '#ddddbb', '#eeddaa', '#ccddaa', '#ddaa66', '#ccaa88'],
];

const CSS = `
#build-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 224px;
  background: rgba(18, 16, 12, 0.96);
  border-left: 2px solid #3a3020;
  font-family: 'Courier New', monospace;
  color: #ccccaa;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 1000;
  padding: 10px;
  gap: 8px;
  user-select: none;
}
#build-panel .bp-title {
  font-size: 11px;
  color: #6aba4a;
  letter-spacing: 0.12em;
  text-align: center;
  padding-bottom: 6px;
  border-bottom: 1px solid #2a2a1a;
}
#build-panel .bp-section {
  font-size: 10px;
  color: #8a7a5a;
  letter-spacing: 0.08em;
}

/* ── Tools ── */
#build-panel .bp-tools { display: flex; gap: 3px; }
#build-panel .bp-tool {
  flex: 1;
  background: #1a1810;
  border: 1px solid #2a2a1a;
  color: #8a7a5a;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 4px 2px;
  cursor: pointer;
  text-align: center;
  border-radius: 2px;
}
#build-panel .bp-tool:hover { background: #222018; color: #aaa888; }
#build-panel .bp-tool.active {
  background: #1e2a1e;
  border-color: #3a6a1a;
  color: #6aba4a;
}

/* ── Brush preview ── */
#build-panel .bp-brush {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  background: #1a1810;
  border: 1px solid #2a2a1a;
  border-radius: 2px;
}
#build-panel .bp-brush-char {
  font-size: 28px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0e0e0a;
  border: 1px solid #333320;
  border-radius: 2px;
}
#build-panel .bp-brush-info { font-size: 11px; color: #8a8a6a; }
#build-panel .bp-brush-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1px solid #444;
  margin-right: 4px;
  vertical-align: middle;
}

/* ── Category tabs ── */
#build-panel .bp-cat-tabs { display: flex; flex-wrap: wrap; gap: 2px; }
#build-panel .bp-cat-tab {
  background: #1a1810;
  border: 1px solid #2a2a1a;
  color: #777755;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  padding: 2px 5px;
  cursor: pointer;
  border-radius: 2px;
}
#build-panel .bp-cat-tab:hover { background: #222018; color: #999977; }
#build-panel .bp-cat-tab.active {
  background: #1e2a1e;
  border-color: #3a6a1a;
  color: #6aba4a;
}

/* ── Char grid ── */
#build-panel .bp-char-grid { display: flex; flex-wrap: wrap; gap: 2px; }
#build-panel .bp-char-btn {
  width: 24px;
  height: 24px;
  background: #0e0e0a;
  border: 1px solid #2a2a1a;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  padding: 0;
  cursor: pointer;
  text-align: center;
  line-height: 22px;
  border-radius: 1px;
}
#build-panel .bp-char-btn:hover { border-color: #6aba4a; background: #1a1a10; }
#build-panel .bp-char-btn.active {
  border-color: #6aba4a;
  background: #1e2e1e;
  box-shadow: 0 0 4px #6aba4a44;
}

/* ── Custom char ── */
#build-panel .bp-custom-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}
#build-panel .bp-custom-row label { font-size: 10px; color: #666644; }
#build-panel .bp-char-input {
  width: 28px;
  height: 24px;
  background: #0e0e0a;
  border: 1px solid #333320;
  color: #eee;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  text-align: center;
  padding: 0;
}
#build-panel .bp-char-input:focus { border-color: #6aba4a; outline: none; }

/* ── Color grid ── */
#build-panel .bp-color-grid { display: flex; flex-wrap: wrap; gap: 2px; }
#build-panel .bp-color-swatch {
  width: 22px;
  height: 16px;
  border: 1px solid #222;
  cursor: pointer;
  border-radius: 1px;
  transition: transform 0.1s;
}
#build-panel .bp-color-swatch:hover { border-color: #aaa; transform: scale(1.2); }
#build-panel .bp-color-swatch.active {
  border-color: #eedd44;
  box-shadow: 0 0 4px #eedd4466;
}

/* ── Custom color ── */
#build-panel .bp-color-row {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
#build-panel .bp-hex-input {
  width: 80px;
  background: #0e0e0a;
  border: 1px solid #333320;
  color: #ccc;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  padding: 3px 5px;
}
#build-panel .bp-hex-input:focus { border-color: #6aba4a; outline: none; }
#build-panel .bp-color-picker {
  width: 28px;
  height: 24px;
  border: 1px solid #333;
  padding: 1px;
  background: #222;
  cursor: pointer;
}

/* ── Action buttons ── */
#build-panel .bp-actions {
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 8px;
}
#build-panel .bp-save-btn {
  flex: 1;
  background: #1e2a1e;
  border: 1px solid #3a6a1a;
  color: #6aba4a;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 7px;
  cursor: pointer;
  border-radius: 2px;
}
#build-panel .bp-save-btn:hover { background: #243024; }
#build-panel .bp-cancel-btn {
  flex: 1;
  background: #2a1a1a;
  border: 1px solid #4a2a2a;
  color: #aa6644;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 7px;
  cursor: pointer;
  border-radius: 2px;
}
#build-panel .bp-cancel-btn:hover { background: #3a2020; }

#build-panel .bp-hint {
  font-size: 10px;
  color: #555540;
  text-align: center;
  line-height: 1.5;
}
`;

/**
 * HTML/CSS build panel for hedgeFriends building mode.
 * Overlays on the right side of the game with character grid,
 * color palette, and tool selection — similar to the art tool.
 */
export class BuildPanelUI {
  private container: HTMLDivElement;
  private styleEl: HTMLStyleElement;
  private events: BuildPanelEvents;

  // State
  private currentChar = '|';
  private currentFg = '#8b6d4a';
  private selectedCategoryIdx = 0;
  private selectedCharIdx = 0;
  private activeTool: BuildTool = 'paint';
  private _inputFocused = false;

  // DOM refs
  private brushCharEl!: HTMLDivElement;
  private brushSwatchEl!: HTMLSpanElement;
  private brushInfoEl!: HTMLDivElement;
  private charGridEl!: HTMLDivElement;
  private charInputEl!: HTMLInputElement;
  private hexInputEl!: HTMLInputElement;
  private colorPickerEl!: HTMLInputElement;
  private toolBtns: HTMLButtonElement[] = [];
  private catTabs: HTMLButtonElement[] = [];
  private colorSwatches: HTMLDivElement[] = [];

  constructor(events: BuildPanelEvents) {
    this.events = events;

    // Inject CSS
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = CSS;
    document.head.appendChild(this.styleEl);

    // Build DOM
    this.container = document.createElement('div');
    this.container.id = 'build-panel';
    this.buildDOM();
    this.attachGlobalEvents();
    document.body.appendChild(this.container);
    this.hide();
  }

  // ── Public API ──

  show(): void {
    this.container.style.display = 'flex';
  }

  hide(): void {
    this.container.style.display = 'none';
  }

  isVisible(): boolean {
    return this.container.style.display !== 'none';
  }

  getCurrentGlyph(): Glyph {
    return { char: this.currentChar, fg: this.currentFg };
  }

  getActiveTool(): BuildTool {
    return this.activeTool;
  }

  /** True when a text input in the panel has focus — keyboard events should be ignored by the game */
  isInputFocused(): boolean {
    return this._inputFocused;
  }

  /** Current category index (for keyboard Tab cycling) */
  getCategoryIndex(): number {
    return this.selectedCategoryIdx;
  }

  /** Set brush from an external source (e.g. eyedropper pick) */
  setBrush(glyph: Glyph): void {
    this.currentChar = glyph.char;
    this.currentFg = glyph.fg;
    this.charInputEl.value = glyph.char;
    this.hexInputEl.value = glyph.fg;
    this.colorPickerEl.value = glyph.fg;
    this.refreshAll();
    this.events.onBrushChanged(this.getCurrentGlyph());
  }

  setTool(tool: BuildTool): void {
    this.activeTool = tool;
    this.updateToolButtons();
  }

  /** Keyboard-driven: select category by index */
  selectCategory(idx: number): void {
    if (idx < 0 || idx >= BUILD_PALETTE.length) return;
    this.selectedCategoryIdx = idx;
    this.selectedCharIdx = 0;
    const cat = BUILD_PALETTE[idx];
    if (cat && cat.items.length > 0) {
      this.currentChar = cat.items[0].char;
      this.charInputEl.value = this.currentChar;
    }
    this.updateCategoryTabs();
    this.renderCharGrid();
    this.updateBrushPreview();
    this.events.onBrushChanged(this.getCurrentGlyph());
  }

  /** Keyboard-driven: next char in current category */
  nextChar(): void {
    const cat = BUILD_PALETTE[this.selectedCategoryIdx];
    if (!cat || cat.items.length === 0) return;
    this.selectedCharIdx = (this.selectedCharIdx + 1) % cat.items.length;
    this.applyCharAtIndex();
  }

  /** Keyboard-driven: previous char in current category */
  prevChar(): void {
    const cat = BUILD_PALETTE[this.selectedCategoryIdx];
    if (!cat || cat.items.length === 0) return;
    this.selectedCharIdx = (this.selectedCharIdx - 1 + cat.items.length) % cat.items.length;
    this.applyCharAtIndex();
  }

  destroy(): void {
    this.container.remove();
    this.styleEl.remove();
  }

  // ── DOM construction ──

  private buildDOM(): void {
    this.container.appendChild(this.div('bp-title', 'BUILD'));

    // Tools
    this.container.appendChild(this.div('bp-section', 'TOOLS'));
    const toolRow = this.div('bp-tools');
    const tools: [BuildTool, string][] = [['paint', 'Paint'], ['erase', 'Erase'], ['pick', 'Pick']];
    for (const [tool, label] of tools) {
      const btn = document.createElement('button');
      btn.className = `bp-tool${tool === 'paint' ? ' active' : ''}`;
      btn.textContent = label;
      btn.dataset.tool = tool;
      btn.addEventListener('click', () => this.setTool(tool));
      toolRow.appendChild(btn);
      this.toolBtns.push(btn);
    }
    this.container.appendChild(toolRow);

    // Brush preview
    this.container.appendChild(this.div('bp-section', 'BRUSH'));
    const brushRow = this.div('bp-brush');
    this.brushCharEl = this.div('bp-brush-char');
    this.brushCharEl.textContent = this.currentChar;
    this.brushCharEl.style.color = this.currentFg;
    brushRow.appendChild(this.brushCharEl);
    this.brushInfoEl = this.div('bp-brush-info');
    this.brushSwatchEl = document.createElement('span');
    this.brushSwatchEl.className = 'bp-brush-swatch';
    this.brushSwatchEl.style.backgroundColor = this.currentFg;
    this.brushInfoEl.appendChild(this.brushSwatchEl);
    this.brushInfoEl.appendChild(document.createTextNode(' ' + this.currentFg));
    brushRow.appendChild(this.brushInfoEl);
    this.container.appendChild(brushRow);

    // Characters
    this.container.appendChild(this.div('bp-section', 'CHARACTERS'));
    const catRow = this.div('bp-cat-tabs');
    for (let i = 0; i < BUILD_PALETTE.length; i++) {
      const tab = document.createElement('button');
      tab.className = `bp-cat-tab${i === 0 ? ' active' : ''}`;
      tab.textContent = BUILD_PALETTE[i].name;
      tab.dataset.catIdx = String(i);
      tab.addEventListener('click', () => {
        this.selectedCategoryIdx = i;
        this.selectedCharIdx = 0;
        this.updateCategoryTabs();
        this.renderCharGrid();
      });
      catRow.appendChild(tab);
      this.catTabs.push(tab);
    }
    this.container.appendChild(catRow);

    this.charGridEl = this.div('bp-char-grid');
    this.container.appendChild(this.charGridEl);
    this.renderCharGrid();

    // Custom char input
    const customRow = this.div('bp-custom-row');
    const label = document.createElement('label');
    label.textContent = 'Custom:';
    customRow.appendChild(label);
    this.charInputEl = document.createElement('input');
    this.charInputEl.type = 'text';
    this.charInputEl.maxLength = 1;
    this.charInputEl.className = 'bp-char-input';
    this.charInputEl.value = this.currentChar;
    this.charInputEl.addEventListener('input', () => {
      if (this.charInputEl.value.length > 0) {
        this.currentChar = this.charInputEl.value;
        this.updateBrushPreview();
        this.highlightActiveChar();
        this.events.onBrushChanged(this.getCurrentGlyph());
      }
    });
    this.setupInputFocus(this.charInputEl);
    customRow.appendChild(this.charInputEl);
    this.container.appendChild(customRow);

    // Colors
    this.container.appendChild(this.div('bp-section', 'COLORS'));
    const colorGrid = this.div('bp-color-grid');
    for (const row of PALETTE_COLORS) {
      for (const color of row) {
        const swatch = document.createElement('div');
        swatch.className = 'bp-color-swatch';
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color;
        if (color === this.currentFg) swatch.classList.add('active');
        swatch.addEventListener('click', () => {
          this.currentFg = color;
          this.hexInputEl.value = color;
          this.colorPickerEl.value = color;
          this.updateBrushPreview();
          this.updateColorSelection();
          this.events.onBrushChanged(this.getCurrentGlyph());
        });
        colorGrid.appendChild(swatch);
        this.colorSwatches.push(swatch);
      }
    }
    this.container.appendChild(colorGrid);

    // Custom color row
    const colorRow = this.div('bp-color-row');
    this.hexInputEl = document.createElement('input');
    this.hexInputEl.type = 'text';
    this.hexInputEl.className = 'bp-hex-input';
    this.hexInputEl.value = this.currentFg;
    this.hexInputEl.placeholder = '#rrggbb';
    this.hexInputEl.addEventListener('input', () => {
      const val = this.hexInputEl.value;
      if (/^#[0-9a-f]{6}$/i.test(val)) {
        this.currentFg = val;
        this.colorPickerEl.value = val;
        this.updateBrushPreview();
        this.updateColorSelection();
        this.events.onBrushChanged(this.getCurrentGlyph());
      }
    });
    this.setupInputFocus(this.hexInputEl);
    colorRow.appendChild(this.hexInputEl);

    this.colorPickerEl = document.createElement('input');
    this.colorPickerEl.type = 'color';
    this.colorPickerEl.className = 'bp-color-picker';
    this.colorPickerEl.value = this.currentFg;
    this.colorPickerEl.addEventListener('input', () => {
      this.currentFg = this.colorPickerEl.value;
      this.hexInputEl.value = this.currentFg;
      this.updateBrushPreview();
      this.updateColorSelection();
      this.events.onBrushChanged(this.getCurrentGlyph());
    });
    colorRow.appendChild(this.colorPickerEl);
    this.container.appendChild(colorRow);

    // Action buttons
    const actions = this.div('bp-actions');
    const saveBtn = document.createElement('button');
    saveBtn.className = 'bp-save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => this.events.onSave());
    actions.appendChild(saveBtn);
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'bp-cancel-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.events.onCancel());
    actions.appendChild(cancelBtn);
    this.container.appendChild(actions);

    // Hint
    this.container.appendChild(this.div('bp-hint', 'Alt+Click to pick from cell\nShift+Click house to edit'));
  }

  private attachGlobalEvents(): void {
    // Prevent pointer events on the panel from reaching Phaser
    this.container.addEventListener('pointerdown', (e) => e.stopPropagation());
    this.container.addEventListener('pointerup', (e) => e.stopPropagation());
    this.container.addEventListener('pointermove', (e) => e.stopPropagation());
  }

  private setupInputFocus(el: HTMLInputElement): void {
    el.addEventListener('focus', () => { this._inputFocused = true; });
    el.addEventListener('blur', () => { this._inputFocused = false; });
    el.addEventListener('keydown', (e) => e.stopPropagation());
    el.addEventListener('keyup', (e) => e.stopPropagation());
  }

  // ── Rendering helpers ──

  private renderCharGrid(): void {
    this.charGridEl.innerHTML = '';
    const category = BUILD_PALETTE[this.selectedCategoryIdx];
    if (!category) return;

    for (let i = 0; i < category.items.length; i++) {
      const item = category.items[i];
      const btn = document.createElement('button');
      btn.className = 'bp-char-btn';
      btn.textContent = item.char;
      btn.style.color = item.fg;
      if (item.char === this.currentChar) btn.classList.add('active');
      btn.addEventListener('click', () => {
        this.selectedCharIdx = i;
        this.currentChar = item.char;
        this.charInputEl.value = item.char;
        this.updateBrushPreview();
        this.highlightActiveChar();
        this.events.onBrushChanged(this.getCurrentGlyph());
      });
      this.charGridEl.appendChild(btn);
    }
  }

  private updateBrushPreview(): void {
    this.brushCharEl.textContent = this.currentChar;
    this.brushCharEl.style.color = this.currentFg;
    this.brushSwatchEl.style.backgroundColor = this.currentFg;
    // Rebuild info text
    const textNode = this.brushInfoEl.lastChild;
    if (textNode && textNode.nodeType === Node.TEXT_NODE) {
      textNode.textContent = ' ' + this.currentFg;
    }
  }

  private updateToolButtons(): void {
    for (const btn of this.toolBtns) {
      btn.classList.toggle('active', btn.dataset.tool === this.activeTool);
    }
  }

  private updateCategoryTabs(): void {
    for (let i = 0; i < this.catTabs.length; i++) {
      this.catTabs[i].classList.toggle('active', i === this.selectedCategoryIdx);
    }
  }

  private updateColorSelection(): void {
    for (const swatch of this.colorSwatches) {
      swatch.classList.toggle('active', swatch.dataset.color === this.currentFg);
    }
  }

  private highlightActiveChar(): void {
    const btns = this.charGridEl.querySelectorAll('.bp-char-btn');
    btns.forEach((btn) => {
      (btn as HTMLElement).classList.toggle('active', btn.textContent === this.currentChar);
    });
  }

  private applyCharAtIndex(): void {
    const cat = BUILD_PALETTE[this.selectedCategoryIdx];
    if (!cat || !cat.items[this.selectedCharIdx]) return;
    this.currentChar = cat.items[this.selectedCharIdx].char;
    this.charInputEl.value = this.currentChar;
    this.updateBrushPreview();
    this.highlightActiveChar();
    this.events.onBrushChanged(this.getCurrentGlyph());
  }

  private refreshAll(): void {
    this.updateBrushPreview();
    this.updateColorSelection();
    this.highlightActiveChar();
  }

  private div(className: string, text?: string): HTMLDivElement {
    const el = document.createElement('div');
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
}
