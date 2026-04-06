import Phaser from 'phaser';

/** High score entry for hedgeKingdoms campaigns */
export interface KingdomsHighScoreEntry {
  name: string;
  score: number;
  waves: number;
  difficulty: string;
}

const STORAGE_KEY = 'hedgekingdoms_highscores';
const AUTOSAVE_KEY = 'hedgekingdoms_autosave';

function loadKingdomsHighScores(): KingdomsHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as KingdomsHighScoreEntry[];
  } catch {
    return [];
  }
}

// War glyphs used to build the title letters
const WAR_CHARS = ['\u2020', '\u2021', '#', '=', '[', ']', '*', '\u2694', '+'];

// Amber/gold colors for title
const WAR_COLORS = [
  '#c8884a', '#d4a843', '#e8b060', '#a07830',
  '#c09840', '#b8904a', '#d0a050', '#e0b868',
];

// Parchment tones for the subtitle
const PARCHMENT_COLORS = ['#d4c9a8', '#c8b890', '#e0d5b0', '#b8a878'];

// Background base colors
const SKY_COLOR = '#0a1220';
const GROUND_COLOR = '#2e1a0a';

// Sky siege glyph characters and colors
const SKY_CHARS = ['\u2020', '\u2021', '^', '*', 'o'];
const SKY_CHAR_COLORS = ['#1a2840', '#223050', '#2a3858'];

// Ground fort debris characters and colors
const DIRT_CHARS = ['=', '[', ']', '^', '.', ';'];
const DIRT_COLORS = ['#4a3020', '#3a2818', '#5a4030'];

// ASCII art — "HEDGE" on first row block, "KINGDOMS" on second
const TITLE_ART = [
  'HH  HH EEEEE DDDDD   GGGG  EEEEE',
  'HH  HH EE    DD  DD GG     EE',
  'HHHHHH EEEEE DD  DD GG GGG EEEEE',
  'HH  HH EE    DD  DD GG  GG EE',
  'HH  HH EEEEE DDDDD   GGGG  EEEEE',
  '',
  'KK  KK IIIII NN  NN  GGGG  DDDDD   OOOOO MM   MM  SSSSS',
  'KK KK    II  NNN NN GG     DD  DD OO   OO MMM MMM SS',
  'KKKK     II  NNNNNN GG GGG DD  DD OO   OO MMMMMMM  SSSSS',
  'KK KK    II  NN NNN GG  GG DD  DD OO   OO MM M MM      SS',
  'KK  KK IIIII NN  NN  GGGG  DDDDD   OOOOO MM   MM  SSSSS',
];

const CREATURE_TEMPLATES = [
  { chars: ['(">', '(")'], color: '#8a6a3a', speed: 0.3, frameRate: 600 },    // hedgehog w/ spear
  { chars: ['}>-', '}->'], color: '#9a7a5a', speed: 1.0, frameRate: 350 },    // mouse w/ bow
  { chars: ['(:P', '(:p'], color: '#7a6a4a', speed: 0.2, frameRate: 800 },    // badger w/ axe
  { chars: ['!>', '!)'], color: '#8a8a5a', speed: 1.2, frameRate: 300 },       // wren scout
  { chars: ['<r', 'r>'], color: '#c06040', speed: 0.8, frameRate: 400 },       // fleeing rat
  { chars: ['{O}', '{o}'], color: '#eaca4a', speed: 0.15, frameRate: 700 },    // owl
  { chars: ['[o]', '[O]'], color: '#909070', speed: 0.4, frameRate: 500 },     // snail militia
  { chars: ['~>', '~)'], color: '#5a8a5a', speed: 0.25, frameRate: 650 },      // toad alchemist
];

const SCENARIOS = ['The Young Hedge', 'The Ancient Hedgerow', 'The Last Stand', 'The Winter Siege'];
const SCENARIO_IDS = ['young_hedge', 'ancient_hedgerow', 'last_stand', 'winter_siege'];

const DIFFICULTIES = ['Peaceful', 'Normal', 'Hard', 'Legendary'];
const DIFFICULTY_IDS = ['peaceful', 'normal', 'hard', 'legendary'];

const SPEEDS = ['Slow', 'Normal', 'Fast'];
const SPEED_INDICES = [1, 2, 3];

export class KingdomsSplashScene extends Phaser.Scene {
  private playerName = '';
  private nameText!: Phaser.GameObjects.Text;
  private scenarioText!: Phaser.GameObjects.Text;
  private difficultyText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private titleChars: { obj: Phaser.GameObjects.Text; baseX: number; baseY: number }[] = [];
  private creatures: { obj: Phaser.GameObjects.Text; x: number; dx: number; speed: number; frames: string[]; frameIdx: number; frameTimer: number; frameRate: number; minX: number; maxX: number }[] = [];
  private blinkTimer = 0;
  private cursorOn = true;
  private animTime = 0;
  private scenarioIndex = 0;
  private difficultyIndex = 1; // default Normal
  private speedIndex = 1; // default Normal

  constructor() {
    super({ key: 'KingdomsSplashScene' });
  }

  create(): void {
    const cam = this.cameras.main;
    const cx = cam.width / 2;

    // Calculate title layout
    const charSize = 18;
    const lineHeight = 24;
    const maxLineWidth = Math.max(...TITLE_ART.map(l => l.length));
    const charWidth = charSize * 0.6;
    const titlePixelWidth = maxLineWidth * charWidth;
    const titleStartX = cx - titlePixelWidth / 2;
    const boundaryY = Math.round(cam.height * 0.35);
    const titleStartY = boundaryY - TITLE_ART.length * lineHeight;

    // Background: dark navy sky above, warm brown ground below
    const skyRect = this.add.rectangle(cx, boundaryY / 2, cam.width, boundaryY, Phaser.Display.Color.HexStringToColor(SKY_COLOR).color);
    skyRect.setOrigin(0.5);
    const groundRect = this.add.rectangle(cx, boundaryY + (cam.height - boundaryY) / 2, cam.width, cam.height - boundaryY, Phaser.Display.Color.HexStringToColor(GROUND_COLOR).color);
    groundRect.setOrigin(0.5);

    // Scatter sky siege glyphs
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

    // Scatter ground fort debris
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

    // Draw title as individual war glyphs with amber glow
    for (let row = 0; row < TITLE_ART.length; row++) {
      const line = TITLE_ART[row];
      for (let col = 0; col < line.length; col++) {
        const ch = line[col];
        if (ch === ' ') continue;
        const warChar = WAR_CHARS[Math.floor(Math.random() * WAR_CHARS.length)];
        const colorIdx = (row * 7 + col * 3) % WAR_COLORS.length;
        const px = titleStartX + col * charWidth;
        const py = titleStartY + row * lineHeight;
        const txt = this.add.text(px, py, warChar, {
          fontFamily: 'Courier New, monospace',
          fontSize: `${charSize}px`,
          color: WAR_COLORS[colorIdx],
        });
        // Warm amber glow effect
        txt.setShadow(0, 0, '#ffa040', 6, true, true);
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
      const side = Math.random();
      let startX: number;
      let startY: number;
      if (side < 0.3) {
        startY = titleTop - 5 - Math.random() * 15;
        startX = titleLeft + Math.random() * (titleRight - titleLeft);
      } else if (side < 0.6) {
        startY = titleBtm + Math.random() * 15;
        startX = titleLeft + Math.random() * (titleRight - titleLeft);
      } else {
        startY = titleTop + Math.random() * (titleBtm - titleTop);
        startX = Math.random() < 0.5 ? titleLeft - 20 : titleRight + 10;
      }

      const creatureDx = Math.random() < 0.5 ? 1 : -1;
      const obj = this.add.text(startX, startY, template.chars[0], {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: template.color,
      });

      this.creatures.push({
        obj,
        x: startX,
        dx: creatureDx,
        speed: template.speed,
        frames: template.chars,
        frameIdx: 0,
        frameTimer: 0,
        frameRate: template.frameRate,
        minX: titleLeft - 40,
        maxX: titleRight + 40,
      });
    }

    // Subtitle in parchment tones
    const subtitleY = boundaryY + 8;
    const subtitle = 'defend the hedgerow, protect the hedgefolk';
    const subtitleCharWidth = titlePixelWidth / subtitle.length;
    const subtitleFontSize = Math.round(subtitleCharWidth / 0.6);
    const subtitleStartX = cx - titlePixelWidth / 2;
    for (let i = 0; i < subtitle.length; i++) {
      if (subtitle[i] === ' ') continue;
      const parchColor = PARCHMENT_COLORS[Math.floor(Math.random() * PARCHMENT_COLORS.length)];
      this.add.text(subtitleStartX + i * subtitleCharWidth, subtitleY, subtitle[i], {
        fontFamily: 'Courier New, monospace',
        fontSize: `${subtitleFontSize}px`,
        color: parchColor,
      });
    }

    // High scores
    const scores = loadKingdomsHighScores();
    const scoreStartY = subtitleY + subtitleFontSize + 20;

    if (scores.length > 0) {
      this.add.text(cx, scoreStartY, '-- Campaign Records --', {
        fontFamily: 'Courier New, monospace',
        fontSize: '14px',
        color: '#aaaaaa',
      }).setOrigin(0.5);

      for (let i = 0; i < Math.min(5, scores.length); i++) {
        const s = scores[i];
        this.add.text(
          cx, scoreStartY + 22 + i * 18,
          `${(i + 1)}. ${s.name.padEnd(12)} ${String(s.score ?? 0).padStart(5)}pts  Wave ${s.waves}  ${s.difficulty}`,
          {
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: i === 0 ? '#d4a843' : '#888888',
          }
        ).setOrigin(0.5);
      }
    }

    // Name input
    const scoreBlockHeight = scores.length > 0 ? 22 + Math.min(5, scores.length) * 18 + 30 : 0;
    const nameY = scoreStartY + scoreBlockHeight + 20;
    this.add.text(cx, nameY, 'Enter your name:', {
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

    // Buttons (parchment style)
    const btnY = nameY + 72;
    const btnStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#3a1a08',
      backgroundColor: '#e8d8b8',
      padding: { x: 12, y: 6 },
    };
    const btnHoverColor = '#1a0a04';
    const btnBaseColor = '#3a1a08';

    // New Campaign (slightly larger)
    const newBtn = this.add.text(cx, btnY, '[ New Campaign ]', {
      ...btnStyle,
      fontSize: '15px',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    newBtn.on('pointerover', () => newBtn.setColor(btnHoverColor));
    newBtn.on('pointerout', () => newBtn.setColor(btnBaseColor));
    newBtn.on('pointerdown', () => this.startNewCampaign());

    // Load Campaign
    const hasSave = localStorage.getItem(AUTOSAVE_KEY) !== null;
    const loadBtn = this.add.text(cx - 90, btnY + 36, '[ Load Campaign ]', {
      ...btnStyle,
      color: hasSave ? btnBaseColor : '#999988',
    }).setOrigin(0.5).setInteractive({ useHandCursor: hasSave });

    if (hasSave) {
      loadBtn.on('pointerover', () => loadBtn.setColor(btnHoverColor));
      loadBtn.on('pointerout', () => loadBtn.setColor(btnBaseColor));
      loadBtn.on('pointerdown', () => this.loadCampaign());
    }

    // Import
    const importBtn = this.add.text(cx + 90, btnY + 36, '[ Import ]', btnStyle)
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    importBtn.on('pointerover', () => importBtn.setColor(btnHoverColor));
    importBtn.on('pointerout', () => importBtn.setColor(btnBaseColor));
    importBtn.on('pointerdown', () => this.importCampaign());

    // Scenario selector
    this.add.text(cx - 90, btnY + 72, 'Scenario:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#b8a878',
    }).setOrigin(1, 0.5);
    this.scenarioText = this.add.text(cx - 80, btnY + 72, `[ ${SCENARIOS[this.scenarioIndex]} ]`, btnStyle)
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    this.scenarioText.on('pointerover', () => this.scenarioText.setColor(btnHoverColor));
    this.scenarioText.on('pointerout', () => this.scenarioText.setColor(btnBaseColor));
    this.scenarioText.on('pointerdown', () => this.cycleScenario());

    // Difficulty selector
    this.add.text(cx - 90, btnY + 100, 'Difficulty:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#b8a878',
    }).setOrigin(1, 0.5);
    this.difficultyText = this.add.text(cx - 80, btnY + 100, `[ ${DIFFICULTIES[this.difficultyIndex]} ]`, btnStyle)
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    this.difficultyText.on('pointerover', () => this.difficultyText.setColor(btnHoverColor));
    this.difficultyText.on('pointerout', () => this.difficultyText.setColor(btnBaseColor));
    this.difficultyText.on('pointerdown', () => this.cycleDifficulty());

    // Speed selector
    this.add.text(cx - 90, btnY + 128, 'Speed:', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#b8a878',
    }).setOrigin(1, 0.5);
    this.speedText = this.add.text(cx - 80, btnY + 128, `[ ${SPEEDS[this.speedIndex]} ]`, btnStyle)
      .setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    this.speedText.on('pointerover', () => this.speedText.setColor(btnHoverColor));
    this.speedText.on('pointerout', () => this.speedText.setColor(btnBaseColor));
    this.speedText.on('pointerdown', () => this.cycleSpeed());

    // Back to hedgeFun
    const backBtn = this.add.text(cx, btnY + 172, '[ Back to hedgeFun ]', {
      ...btnStyle,
      color: '#887868',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    backBtn.on('pointerover', () => backBtn.setColor(btnHoverColor));
    backBtn.on('pointerout', () => backBtn.setColor('#887868'));
    backBtn.on('pointerdown', () => this.scene.start('SplashScene'));

    // Keyboard shortcuts hint
    this.add.text(cx, btnY + 210, 'Enter = new campaign  \u00b7  L = load  \u00b7  S = scenario  \u00b7  D = difficulty  \u00b7  Esc = back', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#555555',
    }).setOrigin(0.5);

    // Keyboard input for name + shortcuts
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' && this.playerName.length > 0) {
        this.startNewCampaign();
        return;
      }
      if (event.key === 'Escape') {
        this.scene.start('SplashScene');
        return;
      }
      // Shortcuts only when name field is empty
      if (this.playerName.length === 0) {
        if (event.key === 'l' || event.key === 'L') {
          this.loadCampaign();
          return;
        }
        if (event.key === 'i' || event.key === 'I') {
          this.importCampaign();
          return;
        }
        if (event.key === 's' || event.key === 'S') {
          this.cycleScenario();
          return;
        }
        if (event.key === 'd' || event.key === 'D') {
          this.cycleDifficulty();
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

    // Animate title — sway of war colors + pulsing amber glow
    this.animTime += delta;
    for (let i = 0; i < this.titleChars.length; i++) {
      const t = this.animTime * 0.001 + i * 0.4;
      const colorIdx = Math.floor((Math.sin(t) * 0.5 + 0.5) * WAR_COLORS.length) % WAR_COLORS.length;
      this.titleChars[i].obj.setColor(WAR_COLORS[colorIdx]);

      // Pulse glow intensity
      const glowIntensity = 4 + Math.sin(this.animTime * 0.003 + i * 0.2) * 3;
      this.titleChars[i].obj.setShadow(0, 0, '#ffa040', glowIntensity, true, true);

      // Occasionally swap war glyph for variety
      if (Math.random() < 0.001) {
        const newChar = WAR_CHARS[Math.floor(Math.random() * WAR_CHARS.length)];
        this.titleChars[i].obj.setText(newChar);
      }
    }

    // Animate creatures
    for (const c of this.creatures) {
      c.x += c.dx * c.speed * (delta / 16);
      c.obj.setX(c.x);

      if (c.x > c.maxX) { c.dx = -1; }
      if (c.x < c.minX) { c.dx = 1; }

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

  private startNewCampaign(): void {
    this.scene.start('GameScene', {
      playerName: this.playerName || 'Defender',
      kingdomsMode: true,
      kingdomsSettings: {
        scenario: SCENARIO_IDS[this.scenarioIndex],
        difficulty: DIFFICULTY_IDS[this.difficultyIndex],
        speed: SPEED_INDICES[this.speedIndex],
      },
    });
  }

  private loadCampaign(): void {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return;
    try {
      const save = JSON.parse(raw) as { playerName?: string };
      this.scene.start('GameScene', {
        playerName: save.playerName || 'Defender',
        kingdomsMode: true,
        kingdomsSave: save,
      });
    } catch {
      // Corrupt save — ignore
    }
  }

  private importCampaign(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const save = JSON.parse(reader.result as string) as { playerName?: string };
          this.scene.start('GameScene', {
            playerName: save.playerName || 'Defender',
            kingdomsMode: true,
            kingdomsSave: save,
          });
        } catch {
          // Invalid file — ignore
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  private cycleScenario(): void {
    this.scenarioIndex = (this.scenarioIndex + 1) % SCENARIOS.length;
    this.scenarioText.setText(`[ ${SCENARIOS[this.scenarioIndex]} ]`);
  }

  private cycleDifficulty(): void {
    this.difficultyIndex = (this.difficultyIndex + 1) % DIFFICULTIES.length;
    this.difficultyText.setText(`[ ${DIFFICULTIES[this.difficultyIndex]} ]`);
  }

  private cycleSpeed(): void {
    this.speedIndex = (this.speedIndex + 1) % SPEEDS.length;
    this.speedText.setText(`[ ${SPEEDS[this.speedIndex]} ]`);
  }
}
