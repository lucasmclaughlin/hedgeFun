import { SPECIES } from '@/data/species';
import { CREATURES } from '@/data/creatures';
import {
  GrowthStage, Season, CreatureBehavior,
  type Glyph,
} from '@/types';
import { getBackgroundColor } from '@/rendering/GlyphAtlas';

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_CELL_W = 14;
const BASE_CELL_H = 20;
const BASE_FONT_SIZE = 16;
const FONT_FAMILY = 'Courier New, monospace';
const GROUND_ROW = 20;
const PADDING = 4;

// ─── Mutable scale ────────────────────────────────────────────────────────────

let scale = 2;
function cellW()  { return BASE_CELL_W   * scale; }
function cellH()  { return BASE_CELL_H   * scale; }
function fontSize() { return BASE_FONT_SIZE * scale; }

// ─── App state ────────────────────────────────────────────────────────────────

type SelectionKind = 'plant' | 'creature';

let kind: SelectionKind | null = null;
let selectedId = '';
let stage      = GrowthStage.Mature;
let season     = Season.Spring;
let behavior   = CreatureBehavior.Idle;
let frameIndex = 0;
let showSeasonal = false;

// selectedKey  → existing cell clicked (yellow outline, edit mode)
// pendingKey   → empty cell clicked   (green dashed outline, add mode)
let selectedKey: string | null = null;
let pendingKey:  string | null = null;

let animating = false;
let animTimer: ReturnType<typeof setInterval> | null = null;

// Bounding-box origin cached from last renderPreview() — used for click→cell math
let minColCache = 0;
let minRowCache = 0;

// ─── DOM refs ─────────────────────────────────────────────────────────────────

const canvas        = document.getElementById('preview-canvas')  as HTMLCanvasElement;
const ctx           = canvas.getContext('2d')!;
const tabsEl        = document.getElementById('tabs')!;
const editorEl      = document.getElementById('editor-panel')!;
const exportTextarea = document.getElementById('export-output')  as HTMLTextAreaElement;
const exportBtn     = document.getElementById('export-btn')      as HTMLButtonElement;
const animBtn       = document.getElementById('anim-btn')        as HTMLButtonElement;
const scaleSlider   = document.getElementById('scale-slider')    as HTMLInputElement;
const scaleLabel    = document.getElementById('scale-label')     as HTMLSpanElement;

// ─── Scale slider ─────────────────────────────────────────────────────────────

scaleSlider.addEventListener('input', () => {
  scale = Number(scaleSlider.value);
  scaleLabel.textContent = `${scale}×`;
  renderPreview();
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function buildSidebar(): void {
  const plantList    = document.getElementById('plant-list')!;
  const creatureList = document.getElementById('creature-list')!;

  for (const [id, sp] of Object.entries(SPECIES)) {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.textContent = sp.name;
    el.dataset.id   = id;
    el.dataset.kind = 'plant';
    el.addEventListener('click', () => selectItem('plant', id));
    plantList.appendChild(el);
  }

  for (const [id, cr] of Object.entries(CREATURES)) {
    const el = document.createElement('div');
    el.className = 'list-item';
    el.textContent = cr.name;
    el.dataset.id   = id;
    el.dataset.kind = 'creature';
    el.addEventListener('click', () => selectItem('creature', id));
    creatureList.appendChild(el);
  }
}

// ─── Selection ────────────────────────────────────────────────────────────────

function selectItem(k: SelectionKind, id: string): void {
  kind = k; selectedId = id;
  selectedKey = null; pendingKey = null;
  stopAnim();
  exportTextarea.value = '';

  if (k === 'plant') {
    stage = GrowthStage.Mature; season = Season.Spring; showSeasonal = false;
  } else {
    behavior = CreatureBehavior.Idle; frameIndex = 0;
  }

  document.querySelectorAll('.list-item').forEach(el => el.classList.remove('active'));
  document.querySelector(`.list-item[data-id="${id}"][data-kind="${k}"]`)?.classList.add('active');

  buildTabs(); renderPreview(); buildEditor();
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function buildTabs(): void {
  tabsEl.innerHTML = '';
  if (!kind) return;

  if (kind === 'plant') {
    // Growth stage row
    const row1 = makeTabRow();
    const stages: [GrowthStage, string][] = [
      [GrowthStage.Seed, 'Seed'], [GrowthStage.Seedling, 'Seedling'],
      [GrowthStage.Juvenile, 'Juvenile'], [GrowthStage.Mature, 'Mature'],
    ];
    for (const [s, label] of stages) {
      row1.appendChild(makeTab(label, stage === s, () => {
        stage = s; selectedKey = null; pendingKey = null; stopAnim();
        buildTabs(); renderPreview(); buildEditor();
      }));
    }
    tabsEl.appendChild(row1);

    // Season row
    const row2 = makeTabRow();
    const chk = document.createElement('input');
    chk.type = 'checkbox'; chk.checked = showSeasonal;
    const toggle = document.createElement('label');
    toggle.className = 'toggle-label';
    toggle.appendChild(chk); toggle.append(' Seasonal');
    chk.addEventListener('change', () => { showSeasonal = chk.checked; renderPreview(); });
    row2.appendChild(toggle);

    const seasons: [Season, string][] = [
      [Season.Spring, 'Spring'], [Season.Summer, 'Summer'],
      [Season.Autumn, 'Autumn'], [Season.Winter, 'Winter'],
    ];
    for (const [s, label] of seasons) {
      row2.appendChild(makeTab(label, season === s, () => {
        season = s; showSeasonal = true; chk.checked = true; buildTabs(); renderPreview();
      }));
    }
    tabsEl.appendChild(row2);

  } else {
    // Behavior row
    const row1 = makeTabRow();
    const behaviors: [CreatureBehavior, string][] = [
      [CreatureBehavior.Idle, 'Idle'], [CreatureBehavior.Moving, 'Moving'],
      [CreatureBehavior.Sleeping, 'Sleeping'],
    ];
    for (const [b, label] of behaviors) {
      row1.appendChild(makeTab(label, behavior === b, () => {
        behavior = b; frameIndex = 0; selectedKey = null; pendingKey = null;
        stopAnim(); buildTabs(); renderPreview(); buildEditor();
      }));
    }
    tabsEl.appendChild(row1);

    // Frame row — always shown for creatures, with add/remove controls
    const cr = CREATURES[selectedId];
    if (cr) {
      const frames = cr.frames[behavior];
      const row2 = makeTabRow();
      const span = document.createElement('span');
      span.textContent = 'Frame:';
      row2.appendChild(span);

      for (let i = 0; i < frames.length; i++) {
        const fi = i;

        // Wrapper so tab + × sit flush together
        const group = document.createElement('span');
        group.className = 'frame-group';

        const tab = makeTab(String(i), frameIndex === i, () => {
          frameIndex = fi; selectedKey = null; pendingKey = null;
          stopAnim(); buildTabs(); renderPreview(); buildEditor();
        });
        group.appendChild(tab);

        // × remove button — only show when there are multiple frames
        if (frames.length > 1) {
          const xBtn = document.createElement('button');
          xBtn.textContent = '×';
          xBtn.className = 'frame-x-btn';
          xBtn.title = 'Remove this frame';
          xBtn.addEventListener('click', (e) => { e.stopPropagation(); removeFrame(fi); });
          group.appendChild(xBtn);
        }

        row2.appendChild(group);
      }

      // + Add frame button
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Frame';
      addBtn.className = 'add-frame-btn';
      addBtn.title = 'Duplicate current frame and append';
      addBtn.addEventListener('click', () => addFrame());
      row2.appendChild(addBtn);

      tabsEl.appendChild(row2);
    }
  }
}

function makeTabRow(): HTMLDivElement {
  const div = document.createElement('div');
  div.className = 'tab-row';
  return div;
}

function makeTab(label: string, active: boolean, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = 'tab' + (active ? ' active' : '');
  btn.addEventListener('click', onClick);
  return btn;
}

// ─── Frame management (creatures) ─────────────────────────────────────────────

function addFrame(): void {
  const cr = CREATURES[selectedId];
  if (!cr) return;
  const frames = cr.frames[behavior];
  // Duplicate current frame's cells as a deep copy
  const source = frames[frameIndex];
  const newFrame = { cells: source.cells.map(([c, r, g]) => [c, r, { ...g }] as [number, number, Glyph]) };
  frames.push(newFrame);
  frameIndex = frames.length - 1;
  selectedKey = null; pendingKey = null;
  buildTabs(); renderPreview(); buildEditor();
}

function removeFrame(fi: number): void {
  const cr = CREATURES[selectedId];
  if (!cr) return;
  const frames = cr.frames[behavior];
  if (frames.length <= 1) return; // must keep at least one
  frames.splice(fi, 1);
  // Clamp frameIndex
  frameIndex = Math.min(frameIndex, frames.length - 1);
  selectedKey = null; pendingKey = null;
  buildTabs(); renderPreview(); buildEditor();
}

// ─── Active cells ─────────────────────────────────────────────────────────────

function getCurrentCells(): Array<[number, number, Glyph]> {
  if (!selectedId || !kind) return [];

  if (kind === 'plant') {
    const vis = SPECIES[selectedId]?.visuals[stage];
    if (!vis) return [];
    const cells: Array<[number, number, Glyph]> = [...vis.cells];
    if (showSeasonal && vis.seasonalCells?.[season]) cells.push(...vis.seasonalCells[season]!);
    return cells;
  } else {
    const frame = CREATURES[selectedId]?.frames[behavior]?.[frameIndex];
    return frame ? [...frame.cells] : [];
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderPreview(): void {
  const cells = getCurrentCells();

  if (cells.length === 0 && !pendingKey) {
    canvas.width = 420; canvas.height = 240;
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, 420, 240);
    ctx.fillStyle = '#3a3a3a';
    ctx.font = '14px Courier New, monospace';
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText('select a species or creature', 210, 120);
    return;
  }

  // Bounding box — include pendingKey position if set
  let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
  for (const [c, r] of cells) {
    if (c < minC) minC = c; if (c > maxC) maxC = c;
    if (r < minR) minR = r; if (r > maxR) maxR = r;
  }
  if (pendingKey) {
    const [pc, pr] = pendingKey.split(',').map(Number);
    if (pc < minC) minC = pc; if (pc > maxC) maxC = pc;
    if (pr < minR) minR = pr; if (pr > maxR) maxR = pr;
  }
  // Handle case where cells is empty but pendingKey is set
  if (!isFinite(minC)) { minC = maxC = minR = maxR = 0; }

  minC -= PADDING; maxC += PADDING;
  minR -= PADDING; maxR += PADDING;
  minColCache = minC; minRowCache = minR;

  const gridW = maxC - minC + 1;
  const gridH = maxR - minR + 1;
  const cw = cellW(), ch = cellH(), fs = fontSize();

  canvas.width  = gridW * cw;
  canvas.height = gridH * ch;

  const cellMap = new Map<string, Glyph>();
  for (const [c, r, g] of cells) cellMap.set(`${c},${r}`, g);

  const anchorAbsRow = kind === 'creature'
    ? (CREATURES[selectedId]?.rowRange[0] ?? GROUND_ROW)
    : GROUND_ROW;

  ctx.font = `${fs}px ${FONT_FAMILY}`;
  ctx.textBaseline = 'top';
  ctx.textAlign    = 'left';

  for (let ri = 0; ri < gridH; ri++) {
    const rowOff = minR + ri;
    const absRow = Math.max(0, Math.min(54, anchorAbsRow + rowOff));
    const bgColor = getBackgroundColor(absRow);

    for (let ci = 0; ci < gridW; ci++) {
      const colOff = minC + ci;
      const x = ci * cw, y = ri * ch;
      const key   = `${colOff},${rowOff}`;
      const glyph = cellMap.get(key);

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, cw, ch);

      // Selected existing cell — yellow solid outline
      if (selectedKey === key) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
      }

      // Pending add cell — green dashed outline
      if (pendingKey === key) {
        ctx.strokeStyle = '#6aba4a';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2);
        ctx.setLineDash([]);
      }

      if (glyph && glyph.char !== ' ') {
        ctx.fillStyle = glyph.fg;
        const tw = ctx.measureText(glyph.char).width;
        ctx.fillText(glyph.char, x + (cw - tw) / 2, y + (ch - fs) / 2);
      }
    }
  }
  ctx.setLineDash([]);
}

// ─── Canvas click ─────────────────────────────────────────────────────────────

canvas.addEventListener('click', (e) => {
  if (!selectedId || !kind) return;
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (canvas.width  / rect.width);
  const cy = (e.clientY - rect.top)  * (canvas.height / rect.height);

  const colOff = minColCache + Math.floor(cx / cellW());
  const rowOff = minRowCache + Math.floor(cy / cellH());
  const key    = `${colOff},${rowOff}`;

  const cells = getCurrentCells();
  const hit   = cells.some(([c, r]) => c === colOff && r === rowOff);

  if (hit) {
    // Toggle select on existing cell
    selectedKey = (selectedKey === key) ? null : key;
    pendingKey  = null;
  } else {
    // Empty cell — prime for adding
    pendingKey  = (pendingKey === key) ? null : key;
    selectedKey = null;
  }

  renderPreview();
  buildEditor();
});

// ─── Editor panel ─────────────────────────────────────────────────────────────

function buildEditor(): void {
  editorEl.innerHTML = '';

  if (pendingKey) {
    buildAddCellForm();
    return;
  }

  if (!selectedKey) {
    const hint = document.createElement('div');
    hint.className = 'editor-hint';
    hint.innerHTML = 'Click a glyph to edit it.<br>Click empty space to add a cell there.';
    editorEl.appendChild(hint);
    return;
  }

  const [colOff, rowOff] = selectedKey.split(',').map(Number);
  const cells = getCurrentCells();
  const entry = cells.find(([c, r]) => c === colOff && r === rowOff);
  if (!entry) { selectedKey = null; buildEditor(); return; }

  const glyph: Glyph = { ...entry[2] };

  const title = document.createElement('div');
  title.className = 'editor-title';
  title.textContent = `[${colOff}, ${rowOff}]  '${glyph.char}'`;
  editorEl.appendChild(title);

  // Char
  const charRow = makeEditorRow('Char');
  const charInput = document.createElement('input');
  charInput.type = 'text'; charInput.maxLength = 2;
  charInput.value = glyph.char; charInput.className = 'char-input';
  charInput.addEventListener('change', () => {
    const ch = charInput.value[0];
    if (ch) { glyph.char = ch; applyEdit(colOff, rowOff, glyph); title.textContent = `[${colOff}, ${rowOff}]  '${ch}'`; }
  });
  charRow.appendChild(charInput);
  editorEl.appendChild(charRow);

  // Color
  const { hexInput, picker } = makeColorInputs(glyph.fg, (hex) => {
    glyph.fg = hex; applyEdit(colOff, rowOff, glyph);
  });
  const colorRow = makeEditorRow('Color');
  colorRow.appendChild(hexInput); colorRow.appendChild(picker);
  editorEl.appendChild(colorRow);

  // Delete
  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete cell'; delBtn.className = 'delete-btn';
  delBtn.addEventListener('click', () => applyDelete(colOff, rowOff));
  editorEl.appendChild(delBtn);
}

function buildAddCellForm(): void {
  const [colOff, rowOff] = pendingKey!.split(',').map(Number);

  const title = document.createElement('div');
  title.className = 'editor-title add-title';
  title.textContent = `+ New cell [${colOff}, ${rowOff}]`;
  editorEl.appendChild(title);

  // Default glyph for the new cell
  const newGlyph: Glyph = { char: '@', fg: '#6aba4a' };

  // Char
  const charRow = makeEditorRow('Char');
  const charInput = document.createElement('input');
  charInput.type = 'text'; charInput.maxLength = 2;
  charInput.value = newGlyph.char; charInput.className = 'char-input';
  charInput.addEventListener('change', () => {
    const ch = charInput.value[0];
    if (ch) newGlyph.char = ch;
  });
  charRow.appendChild(charInput);
  editorEl.appendChild(charRow);

  // Color
  const { hexInput, picker } = makeColorInputs(newGlyph.fg, (hex) => { newGlyph.fg = hex; });
  const colorRow = makeEditorRow('Color');
  colorRow.appendChild(hexInput); colorRow.appendChild(picker);
  editorEl.appendChild(colorRow);

  // Add button
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add cell'; addBtn.className = 'add-cell-btn';
  addBtn.addEventListener('click', () => {
    const ch = charInput.value[0];
    if (ch) newGlyph.char = ch;
    addCell(colOff, rowOff, newGlyph);
  });
  editorEl.appendChild(addBtn);

  // Cancel
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel'; cancelBtn.className = 'cancel-btn';
  cancelBtn.addEventListener('click', () => { pendingKey = null; renderPreview(); buildEditor(); });
  editorEl.appendChild(cancelBtn);
}

function makeEditorRow(label: string): HTMLDivElement {
  const row = document.createElement('div');
  row.className = 'editor-row';
  const lbl = document.createElement('label');
  lbl.textContent = label + ':';
  row.appendChild(lbl);
  return row;
}

/** Shared colour picker + hex input pair. onChange receives the validated hex string. */
function makeColorInputs(initial: string, onChange: (hex: string) => void) {
  const hexInput = document.createElement('input');
  hexInput.type = 'text'; hexInput.value = initial; hexInput.className = 'hex-input';

  const picker = document.createElement('input');
  picker.type = 'color'; picker.value = initial; picker.className = 'color-picker';

  picker.addEventListener('input', () => {
    hexInput.value = picker.value;
    onChange(picker.value);
  });
  hexInput.addEventListener('change', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hexInput.value)) {
      picker.value = hexInput.value;
      onChange(hexInput.value);
    }
  });
  return { hexInput, picker };
}

// ─── Cell mutation ────────────────────────────────────────────────────────────

function addCell(colOff: number, rowOff: number, glyph: Glyph): void {
  if (!selectedId || !kind) return;

  if (kind === 'plant') {
    const vis = SPECIES[selectedId]?.visuals[stage];
    if (!vis) return;
    if (showSeasonal) {
      // Add to seasonal cells for the current season
      if (!vis.seasonalCells) vis.seasonalCells = {};
      if (!vis.seasonalCells[season]) vis.seasonalCells[season] = [];
      vis.seasonalCells[season]!.push([colOff, rowOff, { ...glyph }]);
    } else {
      vis.cells.push([colOff, rowOff, { ...glyph }]);
    }
  } else {
    const frame = CREATURES[selectedId]?.frames[behavior]?.[frameIndex];
    if (!frame) return;
    frame.cells.push([colOff, rowOff, { ...glyph }]);
  }

  // Switch to edit mode on the new cell
  selectedKey = `${colOff},${rowOff}`;
  pendingKey  = null;
  renderPreview();
  buildEditor();
}

function applyEdit(colOff: number, rowOff: number, newGlyph: Glyph): void {
  if (!selectedId || !kind) return;

  if (kind === 'plant') {
    const vis = SPECIES[selectedId]?.visuals[stage];
    if (!vis) return;
    if (showSeasonal && vis.seasonalCells?.[season]) {
      const arr = vis.seasonalCells[season]!;
      const idx = arr.findIndex(([c, r]) => c === colOff && r === rowOff);
      if (idx !== -1) { arr[idx] = [colOff, rowOff, newGlyph]; renderPreview(); return; }
    }
    const idx = vis.cells.findIndex(([c, r]) => c === colOff && r === rowOff);
    if (idx !== -1) { vis.cells[idx] = [colOff, rowOff, newGlyph]; renderPreview(); }
  } else {
    const frame = CREATURES[selectedId]?.frames[behavior]?.[frameIndex];
    if (!frame) return;
    const idx = frame.cells.findIndex(([c, r]) => c === colOff && r === rowOff);
    if (idx !== -1) { frame.cells[idx] = [colOff, rowOff, newGlyph]; renderPreview(); }
  }
}

function applyDelete(colOff: number, rowOff: number): void {
  if (!selectedId || !kind) return;

  if (kind === 'plant') {
    const vis = SPECIES[selectedId]?.visuals[stage];
    if (!vis) return;
    if (showSeasonal && vis.seasonalCells?.[season]) {
      const arr = vis.seasonalCells[season]!;
      const idx = arr.findIndex(([c, r]) => c === colOff && r === rowOff);
      if (idx !== -1) { arr.splice(idx, 1); selectedKey = null; renderPreview(); buildEditor(); return; }
    }
    const idx = vis.cells.findIndex(([c, r]) => c === colOff && r === rowOff);
    if (idx !== -1) { vis.cells.splice(idx, 1); selectedKey = null; renderPreview(); buildEditor(); }
  } else {
    const frame = CREATURES[selectedId]?.frames[behavior]?.[frameIndex];
    if (!frame) return;
    const idx = frame.cells.findIndex(([c, r]) => c === colOff && r === rowOff);
    if (idx !== -1) { frame.cells.splice(idx, 1); selectedKey = null; renderPreview(); buildEditor(); }
  }
}

// ─── Animation ────────────────────────────────────────────────────────────────

function startAnim(): void {
  if (animating) return;
  animating = true; animBtn.textContent = '⏹ Stop';
  animTimer = setInterval(() => {
    if (kind === 'creature') {
      const frames = CREATURES[selectedId]?.frames[behavior];
      if (frames && frames.length > 1) {
        frameIndex = (frameIndex + 1) % frames.length;
        buildTabs(); renderPreview();
      }
    } else if (kind === 'plant') {
      season = ((season + 1) % 4) as Season;
      showSeasonal = true;
      buildTabs(); renderPreview();
    }
  }, 700);
}

function stopAnim(): void {
  if (!animating) return;
  animating = false; animBtn.textContent = '▶ Animate';
  if (animTimer !== null) { clearInterval(animTimer); animTimer = null; }
}

animBtn.addEventListener('click', () => animating ? stopAnim() : startAnim());

// ─── Export ───────────────────────────────────────────────────────────────────

function serializeCells(cells: Array<[number, number, Glyph]>): string {
  const lines = cells.map(([c, r, g]) => {
    const bg = g.bg ? `, bg: '${g.bg}'` : '';
    return `  [${c}, ${r}, { char: '${g.char}', fg: '${g.fg}'${bg} }],`;
  });
  return 'cells: [\n' + lines.join('\n') + '\n]';
}

exportBtn.addEventListener('click', () => {
  exportTextarea.value = serializeCells(getCurrentCells());
  exportTextarea.select();
});

// ─── Init ─────────────────────────────────────────────────────────────────────

buildSidebar();
renderPreview();
buildEditor();
