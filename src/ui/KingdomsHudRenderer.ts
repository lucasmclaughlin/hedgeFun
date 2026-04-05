import Phaser from 'phaser';

export interface WaveState {
  waveNumber: number;
  phase: 'off' | 'prep' | 'active';
  prepMsRemaining: number;
  lives: number;
  enemiesRemainingInWave: number;
}

export enum DefenderRole {
  Archer     = 0,
  Infantry   = 1,
  Heavy      = 2,
  Scout      = 3,
  NightRaider= 4,
  Sapper     = 5,
  Alchemist  = 6,
}

export interface DefenderState {
  creatureId: number;
  role: DefenderRole;
  hp: number;
  maxHp: number;
}

const MAX_LIVES = 5;

const ROLE_ABBREV: Record<DefenderRole, string> = {
  [DefenderRole.Archer]:      'arch',
  [DefenderRole.Infantry]:    'inf',
  [DefenderRole.Heavy]:       'heavy',
  [DefenderRole.Scout]:       'scout',
  [DefenderRole.NightRaider]: 'raider',
  [DefenderRole.Sapper]:      'sapper',
  [DefenderRole.Alchemist]:   'alch',
};

const BASE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '14px',
  color: '#c8c8a0',
};

const BANNER_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '18px',
  color: '#ffd060',
  backgroundColor: '#000000cc',
  padding: { x: 14, y: 8 },
  align: 'center',
};

const PANEL_X_OFFSET = 220;
const PANEL_Y       = 10;
const LINE_H        = 22;

export class KingdomsHudRenderer {
  private bg: Phaser.GameObjects.Graphics;
  private waveText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;
  private defendersText: Phaser.GameObjects.Text;
  private battleAlert: Phaser.GameObjects.Text;
  private bannerText: Phaser.GameObjects.Text;

  private bannerTimer = 0;
  private bannerPersistent = false;
  private battleAlertTime = 0;

  private allObjects: Phaser.GameObjects.GameObject[];

  constructor(scene: Phaser.Scene) {
    const x = scene.scale.width - PANEL_X_OFFSET;

    this.bg = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(99);
    this.bg.fillStyle(0x0a0a10, 0.78);
    this.bg.fillRoundedRect(x - 4, PANEL_Y - 2, PANEL_X_OFFSET - 6, LINE_H * 4 + 8, 4);

    this.waveText = scene.add.text(x, PANEL_Y, '', { ...BASE_STYLE, color: '#d4a843' })
      .setScrollFactor(0)
      .setDepth(100);

    this.livesText = scene.add.text(x + 64, PANEL_Y, '', BASE_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.statusText = scene.add.text(x, PANEL_Y + LINE_H, '', BASE_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.defendersText = scene.add.text(x, PANEL_Y + LINE_H * 2, '', { ...BASE_STYLE, fontSize: '12px', color: '#a0a888' })
      .setScrollFactor(0)
      .setDepth(100);

    this.battleAlert = scene.add.text(x + (PANEL_X_OFFSET - 6) / 2, PANEL_Y + LINE_H * 3 + 6, '\u2694 BATTLE', { ...BASE_STYLE, color: '#ffff40' })
      .setScrollFactor(0)
      .setDepth(101)
      .setOrigin(0.5, 0)
      .setVisible(false);

    this.bannerText = scene.add.text(scene.scale.width / 2, scene.scale.height / 2 - 40, '', BANNER_STYLE)
      .setScrollFactor(0)
      .setDepth(120)
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.allObjects = [
      this.bg,
      this.waveText,
      this.livesText,
      this.statusText,
      this.defendersText,
      this.battleAlert,
      this.bannerText,
    ];
  }

  getAllObjects(): Phaser.GameObjects.GameObject[] {
    return this.allObjects;
  }

  update(wave: WaveState, defenders: ReadonlyMap<number, DefenderState>, delta: number): void {
    if (wave.phase === 'off') return;

    this.waveText.setText(`WAVE ${wave.waveNumber}`);

    const filled = Math.max(0, Math.min(wave.lives, MAX_LIVES));
    const hearts = '\u2665'.repeat(filled) + '\u2661'.repeat(MAX_LIVES - filled);
    this.livesText.setColor(filled > 0 ? '#e06060' : '#604040');
    this.livesText.setText(hearts);

    if (wave.phase === 'prep') {
      this.statusText.setText(`PREP: ${Math.ceil(wave.prepMsRemaining / 1000)}s`);
    } else {
      this.statusText.setText(`\u25bc ${wave.enemiesRemainingInWave} enemies`);
    }

    const roles = new Set<DefenderRole>();
    for (const d of defenders.values()) roles.add(d.role);
    this.defendersText.setText(
      roles.size > 0 ? Array.from(roles).map(r => `[${ROLE_ABBREV[r]}]`).join(' ') : ''
    );

    if (this.battleAlert.visible) {
      this.battleAlertTime += delta;
      this.battleAlert.setAlpha(0.6 + 0.4 * Math.abs(Math.sin(this.battleAlertTime / 400)));
    }

    if (!this.bannerPersistent && this.bannerTimer > 0) {
      this.bannerTimer -= delta;
      if (this.bannerTimer <= 0) {
        this.bannerText.setVisible(false);
        this.bannerTimer = 0;
      }
    }
  }

  showWaveClear(waveNum: number): void {
    this.bannerText.setText(`\u2014 WAVE ${waveNum} REPELLED \u2014`);
    this.bannerText.setColor('#ffd060');
    this.bannerText.setVisible(true);
    this.bannerTimer = 3000;
    this.bannerPersistent = false;
  }

  showGameOver(wavesReached: number): void {
    this.bannerText.setText(`~ THE HEDGE HAS FALLEN ~\nWaves survived: ${wavesReached}`);
    this.bannerText.setColor('#ffd060');
    this.bannerText.setVisible(true);
    this.bannerPersistent = true;
    this.bannerTimer = 0;
  }

  showBattleAlert(active: boolean): void {
    this.battleAlert.setVisible(active);
    if (!active) this.battleAlertTime = 0;
  }

  setVisible(v: boolean): void {
    for (const obj of this.allObjects) {
      (obj as unknown as Phaser.GameObjects.Components.Visible).setVisible(v);
    }
  }
}
