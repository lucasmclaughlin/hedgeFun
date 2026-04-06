import Phaser from 'phaser';
import { SaveManager } from '@/simulation/SaveManager';
import type { SaveData } from '@/types';

/** High score entry stored in localStorage */
export interface HighScoreEntry {
  name: string;
  plants: number;
  creatures: number;
  periods: number;
  score: number;
}

const STORAGE_KEY = 'hedgefun_highscores';

export function loadHighScores(): HighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HighScoreEntry[];
  } catch {
    return [];
  }
}

export function saveHighScore(entry: HighScoreEntry): void {
  const scores = loadHighScores();
  scores.push(entry);
  scores.sort((a, b) => {
    const aScore = a.score ?? 0;
    const bScore = b.score ?? 0;
    if (bScore !== aScore) return bScore - aScore;
    if (b.plants !== a.plants) return b.plants - a.plants;
    if (b.creatures !== a.creatures) return b.creatures - a.creatures;
    return b.periods - a.periods;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, 10)));
}

// Leafy glyphs used to build the title letters
const LEAF_CHARS = ['@', '{', '}', 'Y', '%', '#', '^', 'f', 'T', '&', '*'];

// Greens for the hedge letters
const LEAF_COLORS = [
  '#4aba4a', '#3a9a3a', '#5aba2a', '#7aca3a',
  '#6aaa3a', '#4a8a2a', '#8aca5a', '#5a9a4a',
];

// Bone/ecru for the subtitle (root-like)
const ROOT_COLORS = ['#d4c9a8', '#c8b890', '#e0d5b0', '#b8a878'];

// Background base colors
const SKY_COLOR = '#0e1a2a';
const GROUND_COLOR = '#2a1a0e';

// Sky texture characters and colors
const SKY_CHARS = ['.', '*', '\'', ',', '`', '~', '\u00b7'];
const SKY_CHAR_COLORS = ['#1a3050', '#223858', '#1a2840', '#2a4868', '#182838', '#253e58'];

// Ground texture characters and colors
const DIRT_CHARS = ['.', ',', '~', '\'', '`', 'o', ';', ':'];
const DIRT_COLORS = ['#4a3520', '#3a2a18', '#5a4030', '#2e1e10', '#443020', '#5a4530', '#3e2e1a'];

// ASCII art — single-line "HEDGE FUN" with chunky double-wide strokes
const TITLE_ART = [
  'HH  HH EEEEE DDDDD   GGGG  EEEEE   FFFFF UU  UU NN  NN',
  'HH  HH EE    DD  DD GG     EE      FF    UU  UU NNN NN',
  'HHHHHH EEEEE DD  DD GG GGG EEEEE   FFFFF UU  UU NNNNNN',
  'HH  HH EE    DD  DD GG  GG EE      FF    UU  UU NN NNN',
  'HH  HH EEEEE DDDDD   GGGG  EEEEE   FF     UUUU  NN  NN',
];

// Creature definitions for the animated critters
interface SplashCreature {
  chars: string[];  // animation frames
  color: string;
  x: number;
  y: number;
  dx: number;       // movement direction per tick
  speed: number;     // pixels per update
  frameRate: number; // ms per frame
}

const CREATURE_TEMPLATES = [
  { chars: ['>', ')'], color: '#da5a3a', speed: 0.7, frameRate: 400 },    // robin
  { chars: ['>', ')'], color: '#8a6a3a', speed: 1.2, frameRate: 300 },    // wren
  { chars: ['(")', '(^)'], color: '#8a6a3a', speed: 0.3, frameRate: 600 }, // hedgehog
  { chars: ['n', '>'], color: '#9a7a5a', speed: 1.0, frameRate: 350 },    // mouse
  { chars: ['&', '^'], color: '#5a6a3a', speed: 0.2, frameRate: 800 },    // toad
  { chars: ['{O}', '{o}'], color: '#eaca4a', speed: 0.15, frameRate: 700 }, // owl
  { chars: ['\\O/', '/O\\'], color: '#8a8a9a', speed: 0.5, frameRate: 500 }, // woodpigeon
  { chars: ['n', '>'], color: '#ca9a5a', speed: 0.4, frameRate: 450 },    // dormouse
];

export class SplashScene extends Phaser.Scene {
  private playerName = '';
  private nameText!: Phaser.GameObjects.Text;
  private promptText!: Phaser.GameObjects.Text;
  private continueText!: Phaser.GameObjects.Text;
  private importText!: Phaser.GameObjects.Text;
  private titleChars: { obj: Phaser.GameObjects.Text; baseX: number; baseY: number }[] = [];
  private scoreTexts: Phaser.GameObjects.Text[] = [];
  private creatures: { obj: Phaser.GameObjects.Text; x: number; dx: number; speed: number; frames: string[]; frameIdx: number; frameTimer: number; frameRate: number; minX: number; maxX: number }[] = [];
  private blinkTimer = 0;
  private cursorOn = true;
  private animTime = 0;
  private saveManager = new SaveManager();

  constructor() {
    super({ key: 'SplashScene' });
  }

  create(): void {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // Calculate title layout first so we know where the sky/ground boundary is
    const charSize = 18;
    const lineHeight = 24;
    const maxLineWidth = Math.max(...TITLE_ART.map(l => l.length));
    const charWidth = charSize * 0.6;
    const titlePixelWidth = maxLineWidth * charWidth;
    const titleStartX = cx - titlePixelWidth / 2;
    // Position title so its bottom row aligns with the sky/ground boundary
    const boundaryY = Math.round(cam.height * 0.35);
    const titleStartY = boundaryY - TITLE_ART.length * lineHeight;

    // Background: textured sky above, textured ground below
    const skyRect = this.add.rectangle(cx, boundaryY / 2, cam.width, boundaryY, Phaser.Display.Color.HexStringToColor(SKY_COLOR).color);
    skyRect.setOrigin(0.5);
    const groundRect = this.add.rectangle(cx, boundaryY + (cam.height - boundaryY) / 2, cam.width, cam.height - boundaryY, Phaser.Display.Color.HexStringToColor(GROUND_COLOR).color);
    groundRect.setOrigin(0.5);

    // Scatter sky texture chars
    const skyDensity = Math.round((cam.width * boundaryY) / 2500);
    for (let i = 0; i < skyDensity; i++) {
      const sx = Math.random() * cam.width;
      const sy = Math.random() * boundaryY;
      const ch = SKY_CHARS[Math.floor(Math.random() * SKY_CHARS.length)];
      const col = SKY_CHAR_COLORS[Math.floor(Math.random() * SKY_CHAR_COLORS.length)];
      this.add.text(sx, sy, ch, {
        fontFamily: 'Courier New, monospace',
        fontSize: `${10 + Math.floor(Math.random() * 8)}px`,
        color: col,
      }).setAlpha(0.3 + Math.random() * 0.5);
    }

    // Scatter ground texture chars
    const groundHeight = cam.height - boundaryY;
    const dirtDensity = Math.round((cam.width * groundHeight) / 1500);
    for (let i = 0; i < dirtDensity; i++) {
      const dx = Math.random() * cam.width;
      const dy = boundaryY + Math.random() * groundHeight;
      const ch = DIRT_CHARS[Math.floor(Math.random() * DIRT_CHARS.length)];
      const col = DIRT_COLORS[Math.floor(Math.random() * DIRT_COLORS.length)];
      this.add.text(dx, dy, ch, {
        fontFamily: 'Courier New, monospace',
        fontSize: `${10 + Math.floor(Math.random() * 8)}px`,
        color: col,
      }).setAlpha(0.3 + Math.random() * 0.5);
    }

    // Draw title as individual leafy characters with glow
    for (let row = 0; row < TITLE_ART.length; row++) {
      const line = TITLE_ART[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        if (ch === ' ') continue;
        const leafChar = LEAF_CHARS[Math.floor(Math.random() * LEAF_CHARS.length)];
        const colorIdx = (row * 7 + col * 3) % LEAF_COLORS.length;
        const px = titleStartX + col * charWidth;
        const py = titleStartY + row * lineHeight;
        const txt = this.add.text(px, py, leafChar, {
          fontFamily: 'Courier New, monospace',
          fontSize: `${charSize}px`,
          color: LEAF_COLORS[colorIdx],
        });
        // Green glow effect
        txt.setShadow(0, 0, '#2aff2a', 6, true, true);
        this.titleChars.push({ obj: txt, baseX: px, baseY: py });
      }
    }

    // Spawn animated creatures around the title
    const titleTop = titleStartY - 10;
    const titleBtm = boundaryY + 10;
    const titleLeft = titleStartX - 30;
    const titleRight = titleStartX + titlePixelWidth + 30;

    for (let i = 0; i < 8; i++) {
      const template = CREATURE_TEMPLATES[i % CREATURE_TEMPLATES.length];
      // Position creatures around the title area
      const side = Math.random();
      let startX: number;
      let startY: number;
      if (side < 0.3) {
        // Above title
        startY = titleTop - 5 - Math.random() * 15;
        startX = titleLeft + Math.random() * (titleRight - titleLeft);
      } else if (side < 0.6) {
        // Below title
        startY = titleBtm + Math.random() * 15;
        startX = titleLeft + Math.random() * (titleRight - titleLeft);
      } else {
        // Sides
        startY = titleTop + Math.random() * (titleBtm - titleTop);
        startX = Math.random() < 0.5 ? titleLeft - 20 : titleRight + 10;
      }

      const dx = Math.random() < 0.5 ? 1 : -1;
      const obj = this.add.text(startX, startY, template.chars[0], {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: template.color,
      });

      this.creatures.push({
        obj,
        x: startX,
        dx,
        speed: template.speed,
        frames: template.chars,
        frameIdx: 0,
        frameTimer: 0,
        frameRate: template.frameRate,
        minX: titleLeft - 40,
        maxX: titleRight + 40,
      });
    }

    // Subtitle in root/bone colors — scaled to match title width
    const subtitleY = boundaryY + 8;
    const subtitle = 'grow a hedge, attract wildlife';
    // Calculate font size so subtitle spans roughly the title width
    const subtitleCharWidth = titlePixelWidth / subtitle.length;
    const subtitleFontSize = Math.round(subtitleCharWidth / 0.6);
    const subtitleStartX = cx - titlePixelWidth / 2;
    for (let i = 0; i < subtitle.length; i++) {
      if (subtitle[i] === ' ') continue;
      const rootColor = ROOT_COLORS[Math.floor(Math.random() * ROOT_COLORS.length)];
      this.add.text(subtitleStartX + i * subtitleCharWidth, subtitleY, subtitle[i], {
        fontFamily: 'Courier New, monospace',
        fontSize: `${subtitleFontSize}px`,
        color: rootColor,
      });
    }

    // High scores
    const scores = loadHighScores();
    const scoreStartY = subtitleY + subtitleFontSize + 20;

    if (scores.length > 0) {
      this.add.text(cx, scoreStartY, '-- High Scores --', {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#aaaaaa',
      }).setOrigin(0.5);

      for (let i = 0; i < Math.min(5, scores.length); i++) {
        const s = scores[i];
        const txt = this.add.text(
          cx, scoreStartY + 22 + i * 18,
          `${(i + 1)}. ${s.name.padEnd(12)} ${String(s.score ?? 0).padStart(4)}pts  ${String(s.plants).padStart(3)} plants  ${String(s.creatures).padStart(3)} creatures`,
          {
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: i === 0 ? '#eaca4a' : '#888888',
          }
        ).setOrigin(0.5);
        this.scoreTexts.push(txt);
      }
    }

    // Name input — position below scores or subtitle
    const scoreBlockHeight = scores.length > 0 ? 22 + Math.min(5, scores.length) * 18 + 30 : 0;
    const nameY = scoreStartY + scoreBlockHeight + 20;
    this.promptText = this.add.text(cx, nameY, 'Enter your name:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      color: '#cccccc',
    }).setOrigin(0.5);

    this.nameText = this.add.text(cx, nameY + 28, '_', {
      fontFamily: 'Courier New, monospace',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#222222',
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5);

    // Continue hint
    this.add.text(cx, nameY + 70, 'Press ENTER to start', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#666666',
    }).setOrigin(0.5);

    // Load / Import buttons
    const btnY = nameY + 100;
    const btnStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#888888',
      backgroundColor: '#1a1a1a',
      padding: { x: 12, y: 6 },
    };
    const btnHoverColor = '#cccccc';
    const btnBaseColor = '#888888';

    // Continue (load auto-save)
    const hasSave = this.saveManager.hasAutoSave();
    this.continueText = this.add.text(cx - 80, btnY, '[ Continue ]', {
      ...btnStyle,
      color: hasSave ? btnBaseColor : '#444444',
    }).setOrigin(0.5).setInteractive({ useHandCursor: hasSave });

    if (hasSave) {
      this.continueText.on('pointerover', () => this.continueText.setColor(btnHoverColor));
      this.continueText.on('pointerout', () => this.continueText.setColor(btnBaseColor));
      this.continueText.on('pointerdown', () => this.loadAutoSave());
    }

    // Import
    this.importText = this.add.text(cx + 80, btnY, '[ Import ]', btnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.importText.on('pointerover', () => this.importText.setColor(btnHoverColor));
    this.importText.on('pointerout', () => this.importText.setColor(btnBaseColor));
    this.importText.on('pointerdown', () => this.importSave());

    // hedgeFriends mode button
    const villageText = this.add.text(cx - 95, btnY + 36, '[ hedgeFriends ]', {
      ...btnStyle,
      color: '#88aa88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    villageText.on('pointerover', () => villageText.setColor('#ccddcc'));
    villageText.on('pointerout', () => villageText.setColor('#88aa88'));
    villageText.on('pointerdown', () => this.scene.start('VillageScene'));

    // hedgeKingdoms mode button
    const kingdomsText = this.add.text(cx + 95, btnY + 36, '[ hedgeKingdoms ]', {
      ...btnStyle,
      color: '#c8884a',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    kingdomsText.on('pointerover', () => kingdomsText.setColor('#e8b47a'));
    kingdomsText.on('pointerout', () => kingdomsText.setColor('#c8884a'));
    kingdomsText.on('pointerdown', () => this.scene.start('KingdomsSplashScene'));

    // Keyboard shortcuts hint
    const shortcutPrefix = hasSave ? 'C = continue  ·  I = import save' : 'I = import save';
    this.add.text(cx, btnY + 68, `${shortcutPrefix}  ·  F = hedgeFriends  ·  K = hedgeKingdoms`, {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#555555',
    }).setOrigin(0.5);

    // Keyboard input for name + shortcuts
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.playerName.length > 0) {
        this.scene.start('TutorialScene', { playerName: this.playerName });
        return;
      }
      // Shortcuts only when name field is empty (so typing 'c'/'i' in a name works)
      if (this.playerName.length === 0) {
        if (event.key === 'c' || event.key === 'C') {
          this.loadAutoSave();
          return;
        }
        if (event.key === 'i' || event.key === 'I') {
          this.importSave();
          return;
        }
        if (event.key === 'f' || event.key === 'F') {
          this.scene.start('VillageScene');
          return;
        }
        if (event.key === 'k' || event.key === 'K') {
          this.scene.start('KingdomsSplashScene');
          return;
        }
      }
      if (event.key === 'Backspace') {
        this.playerName = this.playerName.slice(0, -1);
      } else if (event.key.length === 1 && this.playerName.length < 16) {
        if (/^[a-zA-Z0-9 _\-.]$/.test(event.key)) {
          this.playerName += event.key;
        }
      }
      this.updateNameDisplay();
    });
  }

  update(_time: number, delta: number): void {
    // Blink cursor
    this.blinkTimer += delta;
    if (this.blinkTimer > 400) {
      this.blinkTimer = 0;
      this.cursorOn = !this.cursorOn;
      this.updateNameDisplay();
    }

    // Animate title — gentle sway of leaf colors + pulsing glow
    this.animTime += delta;
    for (let i = 0; i < this.titleChars.length; i++) {
      const t = this.animTime * 0.001 + i * 0.4;
      const colorIdx = Math.floor((Math.sin(t) * 0.5 + 0.5) * LEAF_COLORS.length) % LEAF_COLORS.length;
      this.titleChars[i].obj.setColor(LEAF_COLORS[colorIdx]);

      // Pulse glow intensity
      const glowIntensity = 4 + Math.sin(this.animTime * 0.003 + i * 0.2) * 3;
      this.titleChars[i].obj.setShadow(0, 0, '#2aff2a', glowIntensity, true, true);

      // Occasionally swap leaf glyph for variety
      if (Math.random() < 0.001) {
        const newChar = LEAF_CHARS[Math.floor(Math.random() * LEAF_CHARS.length)];
        this.titleChars[i].obj.setText(newChar);
      }
    }

    // Animate creatures
    for (const c of this.creatures) {
      // Movement
      c.x += c.dx * c.speed * (delta / 16);
      c.obj.setX(c.x);

      // Bounce at bounds
      if (c.x > c.maxX) { c.dx = -1; }
      if (c.x < c.minX) { c.dx = 1; }

      // Frame animation
      c.frameTimer += delta;
      if (c.frameTimer >= c.frameRate) {
        c.frameTimer = 0;
        c.frameIdx = (c.frameIdx + 1) % c.frames.length;
        const frame = c.dx < 0 ? c.frames[c.frameIdx].split('').reverse().join('') : c.frames[c.frameIdx];
        c.obj.setText(frame);
      }
    }
  }

  private updateNameDisplay(): void {
    const cursor = this.cursorOn ? '_' : ' ';
    const display = this.playerName.length > 0 ? this.playerName + cursor : cursor;
    this.nameText.setText(display);
  }

  private loadAutoSave(): void {
    const save = this.saveManager.loadAutoSave();
    if (!save) return;
    this.scene.start('GameScene', { playerName: save.playerName, loadSave: save });
  }

  private async importSave(): Promise<void> {
    const save = await this.saveManager.promptImport();
    if (!save) return;
    this.scene.start('GameScene', { playerName: save.playerName || 'Player', loadSave: save });
  }

}
