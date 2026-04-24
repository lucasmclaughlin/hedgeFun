import { CREATURE_LIST } from '@/data/creatures';
import { SPECIES, SPECIES_LIST } from '@/data/species';
import {
  CreatureBehavior,
  GrowthStage,
  Season,
  GRID_CONFIG,
  type Glyph,
} from '@/types';

// ── Types ────────────────────────────────────────────────────────────────────

interface RenderCell {
  colOff: number;
  rowOff: number;
  glyph: Glyph;
}

interface SpriteJob {
  name: string;       // display name
  fileName: string;   // base filename (no extension)
  cells: RenderCell[];
  /** Optional fixed grid size — all sprites in a group use the same dimensions */
  fixedGridW?: number;
  fixedGridH?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const BEHAVIOR_NAMES: Record<number, string> = {
  [CreatureBehavior.Idle]: 'idle',
  [CreatureBehavior.Moving]: 'moving',
  [CreatureBehavior.Sleeping]: 'sleeping',
};

const SEASON_NAMES: Record<number, string> = {
  [Season.Spring]: 'spring',
  [Season.Summer]: 'summer',
  [Season.Autumn]: 'autumn',
  [Season.Winter]: 'winter',
};

function cellsFromTuples(tuples: Array<[number, number, Glyph]>): RenderCell[] {
  return tuples.map(([colOff, rowOff, glyph]) => ({ colOff, rowOff, glyph }));
}

/** Compute bounding box of cells (in grid units). */
function getBounds(cells: RenderCell[]): { minC: number; maxC: number; minR: number; maxR: number } {
  let minC = Infinity, maxC = -Infinity, minR = Infinity, maxR = -Infinity;
  for (const c of cells) {
    if (c.colOff < minC) minC = c.colOff;
    if (c.colOff > maxC) maxC = c.colOff;
    if (c.rowOff < minR) minR = c.rowOff;
    if (c.rowOff > maxR) maxR = c.rowOff;
  }
  return { minC, maxC, minR, maxR };
}

/** Invert a hex color. */
function invertColor(hex: string): string {
  const r = 255 - parseInt(hex.substring(1, 3), 16);
  const g = 255 - parseInt(hex.substring(3, 5), 16);
  const b = 255 - parseInt(hex.substring(5, 7), 16);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ── Rendering ────────────────────────────────────────────────────────────────

function renderSprite(
  job: SpriteJob,
  opts: {
    scale: number;
    bgColor: string;
    showName: boolean;
    negative: boolean;
    labelFontSize: number;
    fontColor: string;
    fontBold: boolean;
    fontItalic: boolean;
    textSpacing: number;
  },
): HTMLCanvasElement {
  const { cells, name, fixedGridW, fixedGridH } = job;
  const { scale, bgColor, showName, negative, labelFontSize: baseLabelSize, fontColor, fontBold, fontItalic, textSpacing } = opts;
  const cw = GRID_CONFIG.cellWidth * scale;
  const ch = GRID_CONFIG.cellHeight * scale;
  const fontSize = GRID_CONFIG.fontSize * scale;

  const bounds = getBounds(cells);
  const cellGridW = bounds.maxC - bounds.minC + 1;
  const cellGridH = bounds.maxR - bounds.minR + 1;

  // Use fixed dimensions if provided (uniform sizing within a group)
  const gridW = fixedGridW ?? cellGridW;
  const gridH = fixedGridH ?? cellGridH;

  // Padding around sprite (1 cell each side)
  const pad = 1;

  // Measure name label to ensure it fits — shrink font if needed
  let labelFontSize = Math.round(baseLabelSize * scale);
  let nameRowHeight = 0;
  const spacingPx = Math.round(textSpacing * scale);
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;

  const minCanvasW = (gridW + pad * 2) * cw;

  const fontStyle = `${fontItalic ? 'italic ' : ''}${fontBold ? 'bold ' : ''}`;

  if (showName) {
    // Measure the label at the requested size — expand the canvas to fit
    tempCtx.font = `${fontStyle}${labelFontSize}px ${GRID_CONFIG.fontFamily}`;
    nameRowHeight = labelFontSize + spacingPx;
  }

  // Widen canvas if the label is wider than the sprite grid
  tempCtx.font = `${fontStyle}${labelFontSize}px ${GRID_CONFIG.fontFamily}`;
  const labelW = showName ? tempCtx.measureText(name).width + Math.round(16 * scale) : 0;
  const canvasW = Math.max(minCanvasW, labelW);
  const canvasH = (gridH + pad * 2) * ch + nameRowHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext('2d')!;

  // Fill background
  const bg = negative ? invertColor(bgColor) : bgColor;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Draw cells — center within the fixed grid area
  ctx.textBaseline = 'top';
  ctx.font = `${fontSize}px ${GRID_CONFIG.fontFamily}`;

  // Offset to center the actual cells within the (potentially larger) fixed grid
  const offsetC = Math.floor((gridW - cellGridW) / 2);
  const offsetR = Math.floor((gridH - cellGridH) / 2);
  // Also center the grid area within the canvas (if canvas was widened for the label)
  const canvasOffsetX = Math.floor((canvasW - (gridW + pad * 2) * cw) / 2);

  for (const cell of cells) {
    const col = cell.colOff - bounds.minC + pad + offsetC;
    const row = cell.rowOff - bounds.minR + pad + offsetR;
    const x = col * cw + canvasOffsetX;
    const y = row * ch;

    // Cell background
    if (cell.glyph.bg) {
      ctx.fillStyle = negative ? invertColor(cell.glyph.bg) : cell.glyph.bg;
      ctx.fillRect(x, y, cw, ch);
    }

    // Character
    if (cell.glyph.char && cell.glyph.char !== ' ') {
      const fg = negative ? invertColor(cell.glyph.fg) : cell.glyph.fg;
      ctx.fillStyle = fg;
      const textX = x + (cw - ctx.measureText(cell.glyph.char).width) / 2;
      const textY = y + (ch - fontSize) / 2;
      ctx.fillText(cell.glyph.char, textX, textY);
    }
  }

  // Draw name label
  if (showName) {
    ctx.font = `${fontStyle}${labelFontSize}px ${GRID_CONFIG.fontFamily}`;
    const labelColor = negative ? invertColor(fontColor) : fontColor;
    ctx.fillStyle = labelColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(name, canvasW / 2, canvasH - labelFontSize);
    ctx.textAlign = 'start';
  }

  return canvas;
}

// ── Job collection ───────────────────────────────────────────────────────────

function getCreatureJobs(): SpriteJob[] {
  // First pass: find the max bounding box across ALL creature frames
  let maxW = 0;
  let maxH = 0;
  for (const def of CREATURE_LIST) {
    for (const frames of Object.values(def.frames)) {
      for (const frame of frames) {
        const cells = cellsFromTuples(frame.cells);
        const b = getBounds(cells);
        const w = b.maxC - b.minC + 1;
        const h = b.maxR - b.minR + 1;
        if (w > maxW) maxW = w;
        if (h > maxH) maxH = h;
      }
    }
  }

  // Second pass: create jobs with uniform fixed dimensions
  const jobs: SpriteJob[] = [];
  for (const def of CREATURE_LIST) {
    for (const [behaviorKey, frames] of Object.entries(def.frames)) {
      const behaviorName = BEHAVIOR_NAMES[Number(behaviorKey)] ?? `behavior${behaviorKey}`;
      for (let fi = 0; fi < frames.length; fi++) {
        const frame = frames[fi];
        const suffix = frames.length > 1 ? `_f${fi}` : '';
        jobs.push({
          name: `${def.name} (${behaviorName}${frames.length > 1 ? ` #${fi + 1}` : ''})`,
          fileName: `creature_${def.id}_${behaviorName}${suffix}`,
          cells: cellsFromTuples(frame.cells),
          fixedGridW: maxW,
          fixedGridH: maxH,
        });
      }
    }
  }
  return jobs;
}

function getPlantJobs(): SpriteJob[] {
  const jobs: SpriteJob[] = [];
  for (const def of SPECIES_LIST) {
    const visual = def.visuals[GrowthStage.Mature];
    if (!visual) continue;

    // Base mature visual (no seasonal decoration)
    jobs.push({
      name: def.name,
      fileName: `plant_${def.id}_mature`,
      cells: cellsFromTuples(visual.cells),
    });

    // Seasonal variants (base + seasonal cells merged)
    if (visual.seasonalCells) {
      for (const [seasonKey, seasonCells] of Object.entries(visual.seasonalCells)) {
        if (!seasonCells || seasonCells.length === 0) continue;
        const seasonName = SEASON_NAMES[Number(seasonKey)] ?? `season${seasonKey}`;
        const merged = [
          ...cellsFromTuples(visual.cells),
          ...cellsFromTuples(seasonCells),
        ];
        jobs.push({
          name: `${def.name} (${seasonName})`,
          fileName: `plant_${def.id}_mature_${seasonName}`,
          cells: merged,
        });
      }
    }
  }
  return jobs;
}

// ── Canvas → JPG blob ────────────────────────────────────────────────────────

function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality,
    );
  });
}

// ── ZIP bundling (minimal, no dependency) ────────────────────────────────────

// Simple ZIP file creator using Blob + DataView — no external libs needed.
// Supports STORE method (no compression) which is fine for JPGs.

function createZip(files: Array<{ name: string; data: Uint8Array }>): Blob {
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = new TextEncoder().encode(file.name);

    // Local file header (30 + nameLen + dataLen bytes)
    const local = new ArrayBuffer(30 + nameBytes.length);
    const lv = new DataView(local);
    lv.setUint32(0, 0x04034b50, true);   // signature
    lv.setUint16(4, 20, true);            // version needed
    lv.setUint16(6, 0, true);             // flags
    lv.setUint16(8, 0, true);             // compression: STORE
    lv.setUint16(10, 0, true);            // mod time
    lv.setUint16(12, 0, true);            // mod date
    // CRC32 — compute simple
    lv.setUint32(14, crc32(file.data), true);
    lv.setUint32(18, file.data.length, true);  // compressed size
    lv.setUint32(22, file.data.length, true);  // uncompressed size
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true);            // extra field length
    new Uint8Array(local).set(nameBytes, 30);
    localHeaders.push(new Uint8Array(local));

    // Central directory header
    const central = new ArrayBuffer(46 + nameBytes.length);
    const cv = new DataView(central);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true);
    cv.setUint16(14, 0, true);
    cv.setUint32(16, crc32(file.data), true);
    cv.setUint32(20, file.data.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);       // local header offset
    new Uint8Array(central).set(nameBytes, 46);
    centralHeaders.push(new Uint8Array(central));

    offset += 30 + nameBytes.length + file.data.length;
  }

  const centralDirOffset = offset;
  let centralDirSize = 0;
  for (const ch of centralHeaders) centralDirSize += ch.length;

  // End of central directory
  const eocd = new ArrayBuffer(22);
  const ev = new DataView(eocd);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralDirSize, true);
  ev.setUint32(16, centralDirOffset, true);
  ev.setUint16(20, 0, true);

  const parts: BlobPart[] = [];
  for (let i = 0; i < files.length; i++) {
    parts.push(localHeaders[i]);
    parts.push(files[i].data);
  }
  for (const ch of centralHeaders) parts.push(ch);
  parts.push(new Uint8Array(eocd));

  return new Blob(parts, { type: 'application/zip' });
}

// Simple CRC32 implementation
function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ── UI ───────────────────────────────────────────────────────────────────────

const typeSelect = document.getElementById('type') as HTMLSelectElement;
const scaleInput = document.getElementById('scale') as HTMLInputElement;
const bgColorInput = document.getElementById('bgColor') as HTMLInputElement;
const showNameCheckbox = document.getElementById('showName') as HTMLInputElement;
const fontSizeInput = document.getElementById('fontSize') as HTMLInputElement;
const fontColorInput = document.getElementById('fontColor') as HTMLInputElement;
const fontBoldCheckbox = document.getElementById('fontBold') as HTMLInputElement;
const fontItalicCheckbox = document.getElementById('fontItalic') as HTMLInputElement;
const textSpacingInput = document.getElementById('textSpacing') as HTMLInputElement;
const textSpacingVal = document.getElementById('textSpacingVal') as HTMLSpanElement;
const negativeCheckbox = document.getElementById('negative') as HTMLInputElement;
const generateBtn = document.getElementById('generate') as HTMLButtonElement;
const downloadAllBtn = document.getElementById('downloadAll') as HTMLButtonElement;
const output = document.getElementById('output') as HTMLDivElement;

textSpacingInput.addEventListener('input', () => {
  textSpacingVal.textContent = textSpacingInput.value;
});

interface RenderedSprite {
  job: SpriteJob;
  canvas: HTMLCanvasElement;
}

let rendered: RenderedSprite[] = [];

function generatePreviews(): void {
  output.innerHTML = '';
  rendered = [];

  const type = typeSelect.value;
  const scale = Math.max(1, Math.min(10, Number(scaleInput.value)));
  const bgColor = bgColorInput.value;
  const showName = showNameCheckbox.checked;
  const labelFontSize = Math.max(6, Math.min(48, Number(fontSizeInput.value)));
  const fontColor = fontColorInput.value;
  const fontBold = fontBoldCheckbox.checked;
  const fontItalic = fontItalicCheckbox.checked;
  const textSpacing = Math.max(-40, Math.min(60, Number(textSpacingInput.value)));
  const negative = negativeCheckbox.checked;

  let jobs: SpriteJob[] = [];
  if (type === 'creatures' || type === 'both') jobs.push(...getCreatureJobs());
  if (type === 'plants' || type === 'both') jobs.push(...getPlantJobs());

  if (jobs.length === 0) {
    output.innerHTML = '<p>No sprites to generate.</p>';
    return;
  }

  const progress = document.createElement('p');
  progress.className = 'progress';
  progress.textContent = `Generating ${jobs.length} sprites...`;
  output.appendChild(progress);

  const grid = document.createElement('div');
  grid.className = 'grid';
  output.appendChild(grid);

  // Render in batches to keep UI responsive
  let idx = 0;
  function batch() {
    const end = Math.min(idx + 20, jobs.length);
    for (; idx < end; idx++) {
      const job = jobs[idx];
      const canvas = renderSprite(job, { scale, bgColor, showName, negative, labelFontSize, fontColor, fontBold, fontItalic, textSpacing });
      rendered.push({ job, canvas });

      const card = document.createElement('div');
      card.className = 'sprite-card';

      // Shrink preview if very large
      const previewCanvas = document.createElement('canvas');
      const maxPreviewW = 200;
      const previewScale = canvas.width > maxPreviewW ? maxPreviewW / canvas.width : 1;
      previewCanvas.width = Math.round(canvas.width * previewScale);
      previewCanvas.height = Math.round(canvas.height * previewScale);
      previewCanvas.style.imageRendering = 'pixelated';
      const pCtx = previewCanvas.getContext('2d')!;
      pCtx.imageSmoothingEnabled = false;
      pCtx.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);

      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = job.fileName;

      card.appendChild(previewCanvas);
      card.appendChild(label);
      grid.appendChild(card);
    }
    progress.textContent = `Generated ${idx} / ${jobs.length} sprites`;
    if (idx < jobs.length) {
      requestAnimationFrame(batch);
    } else {
      progress.textContent = `Done! ${jobs.length} sprites generated.`;
    }
  }
  batch();
}

async function downloadAll(): Promise<void> {
  if (rendered.length === 0) {
    alert('Generate previews first!');
    return;
  }

  downloadAllBtn.textContent = 'Packing ZIP...';
  downloadAllBtn.disabled = true;

  const files: Array<{ name: string; data: Uint8Array }> = [];

  for (const { job, canvas } of rendered) {
    const blob = await canvasToBlob(canvas);
    const data = new Uint8Array(await blob.arrayBuffer());
    files.push({ name: `${job.fileName}.jpg`, data });
  }

  const zip = createZip(files);
  const url = URL.createObjectURL(zip);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hedgefun_sprites.zip';
  a.click();
  URL.revokeObjectURL(url);

  downloadAllBtn.textContent = 'Download All as ZIP';
  downloadAllBtn.disabled = false;
}

generateBtn.addEventListener('click', generatePreviews);
downloadAllBtn.addEventListener('click', downloadAll);
