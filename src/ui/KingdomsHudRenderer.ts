import Phaser from 'phaser';
import type { WaveState } from '@/defense/WaveManager';
import { DefenderRole, type DefenderState, type DefenseEvent } from '@/defense/DefenderCombatSystem';
import type { EnemyState, EnemyDef } from '@/types';

const MAX_LIVES = 5;
const MAX_LOG_LINES = 8;
const LOG_LINE_LIFETIME = 8000;

const ROLE_ABBREV: Record<DefenderRole, string> = {
  [DefenderRole.Archer]:      'arch',
  [DefenderRole.Infantry]:    'inf',
  [DefenderRole.Heavy]:       'heavy',
  [DefenderRole.Scout]:       'scout',
  [DefenderRole.NightRaider]: 'raider',
  [DefenderRole.Sapper]:      'sapper',
  [DefenderRole.Alchemist]:   'alch',
  [DefenderRole.Militia]:     'mil',
  [DefenderRole.Harrier]:     'harr',
};

const CREATURE_TITLES: Record<string, string> = {
  hedgehog: 'Sgt. Brambleshield', fieldmouse: 'Pvt. Whiskers', badger: 'Col. Ironstripe',
  wren: 'Ensign Feathersong', robin: 'Ensign Redbreast', owl: 'Maj. Strix',
  barnowl: 'Capt. Ghostwing', shrew: 'Cpl. Tunnelwick', toad: 'Apothecary Wartsworth',
  woodpigeon: 'Cpl. Dovecote', bluetit: 'Pvt. Quickwing', goldfinch: 'Pvt. Thistledown',
  yellowhammer: 'Pvt. Goldcrest', blackbird: 'Pvt. Inkfeather', songthrush: 'Pvt. Specklethroat',
  pipistrelle: 'Pvt. Duskflutter', redkite: 'Lt. Windtalon', rabbit: 'Pvt. Cloverfoot',
  fox: 'Sgt. Coppertail', dormouse: 'Pvt. Hazeldown', snail: 'Pvt. Shellworth',
  beetle: 'Pvt. Carapace', earthworm: 'Pvt. Deepdelver', commonlizard: 'Pvt. Swiftscale',
  frog: 'Pvt. Marshleap', bankvole: 'Pvt. Rootgnaw', stoat: 'Pvt. Browncoat',
  spider: 'Pvt. Silkspinner', ladybird: 'Pvt. Scarletdot', bumblebee: 'Pvt. Bumblesworth',
  slowworm: 'Pvt. Coppercoil', newt: 'Pvt. Pondflick', redadmiral: 'Pvt. Painted Wing',
};

const ENEMY_TITLES: Record<string, string> = {
  rat: 'a foul Rat from beyond the ditch',
  weasel: 'a sneaking Weasel of the Vermin horde',
  stoat: 'a Stoat raider, scourge of the hedgerows',
  crow: 'a black-hearted Crow from the dark wood',
  fox_enemy: 'a cunning Fox chieftain',
  bandit_rat: 'a Bandit Rat with thieving paws',
  raider_crow: 'a Crow knight clad in shadow',
  army_stoat: 'an armour\u2019d Stoat of the Vermin legion',
  warlord_fox: 'the Warlord Fox himself, terror of the hedgefolk',
};

const DISPATCH_TEMPLATES_LIGHT = [
  '{d} clashes bravely with {e} near the thorns!',
  '{d} stands paw-to-paw with {e}, giving not an inch.',
  '{d} presses the attack upon {e} with woodland fury.',
  '{d}, that stout-hearted creature, tangles with {e}.',
  'A sharp scrimmage between {d} and {e} at the briar wall!',
  '{d} holds the bramble-line against {e} with quiet courage.',
  '{d} harries {e} through the undergrowth most fiercely.',
  '{d} nips at {e} — "For the hedgerow!"',
];

/** Per-species battle cries for heavy hits */
const BATTLE_CRIES: Record<string, string[]> = {
  hedgehog:     ['"Spines out, lads!"', '*ROLLS INTO A FURIOUS BALL*', '"Not one step further!"'],
  fieldmouse:   ['*SQUEEEEEEK!*', '"For the hedgerow!"', '*furious chittering*'],
  badger:       ['*TERRIBLE SNARLING*', '"By tooth and claw!"', '"COME AND HAVE A GO!"'],
  wren:         ['*PIERCING ALARM TRILL*', '"Chit-chit-chit-CHIT!"', '*angry fluttering*'],
  robin:        ['*SHARP WARNING SONG*', '"Tick-tick-tick!"', '"This hedge is OURS!"'],
  owl:          ['*BLOOD-CURDLING SCREECH*', '"HOOOOO dares!"', '*silent but devastating*'],
  barnowl:      ['*GHOSTLY SHRIEK*', '*strikes from the dark*', '"None shall pass by night!"'],
  shrew:        ['*FRENZIED SQUEAKING*', '"Dig dig DIG!"', '*chatters furiously*'],
  toad:         ['*DEEP CROAK OF MENACE*', '"Taste the marsh!"', '*toxic and unbothered*'],
  woodpigeon:   ['*THUNDEROUS WINGBEATS*', '"Coo-COO, villain!"', '*dive-bombs with gusto*'],
  rabbit:       ['*THUMPS THE GROUND*', '"For the burrow!"', '*kicks with powerful hind legs*'],
  fox:          ['*LOW GROWL*', '"The hedge remembers!"', '*snaps with sharp teeth*'],
  dormouse:     ['*tiny but fierce squeak*', '"You woke me for THIS?!"', '*bites unexpectedly*'],
  redkite:      ['*KEENING CRY FROM ABOVE*', '"The sky sees all!"', '*stoops at terrific speed*'],
  pipistrelle:  ['*ultrasonic shriek*', '*swoops from the dusk*', '"Fear the night wing!"'],
  bluetit:      ['*rapid angry peeping*', '"Pee-pee-pee-POW!"', '*pecks furiously*'],
};

const DEFAULT_CRIES = ['"For the hedgerow!"', '*charges with determination*', '"Hold the line!"'];

const DISPATCH_TEMPLATES_HEAVY = [
  '{d} delivers a TREMENDOUS wallop upon {e}! {cry}',
  'By root and branch! {d} strikes {e} with terrible force! {cry}',
  '{d} falls upon {e} like thunder on a summer pond! {cry}',
  'A mighty blow from {d} sends {e} tumbling through the bracken! {cry}',
  '{d}, fighting for the hedgefolk, smites {e} with great fury! {cry}',
  'The Vermin quails! {d} deals {e} a blow fit for the ballads! {cry}',
];

const DISPATCH_DEFEAT = [
  '{e} is VANQUISHED! The hedge holds firm!',
  '{e} is put to rout! Huzzah for the hedgefolk!',
  '{e} falls before our brave creatures. The roots hold.',
  'The villain {e} is overcome! Three cheers for the hedge!',
  '{e} flees in disorder, never to darken our hedgerow again.',
  'VICTORY over {e}! The honour of the hedgefolk is preserved!',
];

const DISPATCH_BREACH = [
  'URGENT DISPATCH: {e} has BREACHED the thorns!',
  'ALARM! {e} forces through the briar wall! All paws rally!',
  'Grave tidings: {e} has broken through. Protect the hedgefolk!',
  'DESPATCH \u2014 {e} has forced passage! Reinforcements wanted most desperately!',
];

const DISPATCH_WAVE_CLEAR = [
  '\u2550\u2550\u2550 Wave {n} repelled! The hedge ENDURES! \u2550\u2550\u2550',
  '\u2550\u2550\u2550 Wave {n} thrown back! Steady, hedgefolk! \u2550\u2550\u2550',
  '\u2550\u2550\u2550 The {n}th assault is broken! Stout hearts all! \u2550\u2550\u2550',
];

const DISPATCH_SCOUT = [
  '{d} spots Vermin movement on the {dir} flank!',
  '{d} raises the alarm \u2014 Vermin sighted to the {dir}!',
  'INTELLIGENCE: {d} spies {e} creeping from the {dir}.',
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fmt(template: string, vars: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

const BASE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '14px',
  color: '#2a1a0a',
};

const BANNER_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '18px',
  color: '#3a1a08',
  backgroundColor: '#e8d8b8ee',
  padding: { x: 14, y: 8 },
  align: 'center',
};

interface LogEntry {
  text: string;
  age: number;
}

export class KingdomsHudRenderer {
  // Top-centre wave panel
  private waveBg: Phaser.GameObjects.Graphics;
  private waveText: Phaser.GameObjects.Text;
  private livesText: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;

  // Battle alert
  private battleAlert: Phaser.GameObjects.Text;
  private battleAlertTime = 0;

  // Centre banner
  private bannerText: Phaser.GameObjects.Text;
  private bannerTimer = 0;
  private bannerPersistent = false;

  // Bottom-right battle log
  private logBg: Phaser.GameObjects.Graphics;
  private logText: Phaser.GameObjects.Text;
  private logEntries: LogEntry[] = [];

  // Enemy hover tooltip
  private tooltipText: Phaser.GameObjects.Text;

  private allObjects: Phaser.GameObjects.GameObject[];

  constructor(scene: Phaser.Scene) {
    const cx = scene.scale.width / 2;
    const panelW = 280;

    // Top-centre background
    this.waveBg = scene.add.graphics().setScrollFactor(0).setDepth(99);
    this.waveBg.fillStyle(0xe8d8b8, 0.92);
    this.waveBg.fillRoundedRect(cx - panelW / 2, 4, panelW, 62, 4);
    this.waveBg.lineStyle(1, 0x8a7050, 0.6);
    this.waveBg.strokeRoundedRect(cx - panelW / 2, 4, panelW, 62, 4);

    this.waveText = scene.add.text(cx, 10, '', { ...BASE_STYLE, fontSize: '16px', color: '#5a2a0a' })
      .setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

    this.livesText = scene.add.text(cx, 30, '', { ...BASE_STYLE, fontSize: '15px' })
      .setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

    this.statusText = scene.add.text(cx, 48, '', { ...BASE_STYLE, fontSize: '13px', color: '#4a3a1a' })
      .setScrollFactor(0).setDepth(100).setOrigin(0.5, 0);

    // Battle alert below the wave panel
    this.battleAlert = scene.add.text(cx, 72, '\u2694 BATTLE \u2694', {
      ...BASE_STYLE, fontSize: '13px', color: '#8a1a0a',
      backgroundColor: '#e8d8b8ee', padding: { x: 6, y: 2 },
    }).setScrollFactor(0).setDepth(101).setOrigin(0.5, 0).setVisible(false);

    // Centre banner (wave clear / game over / victory)
    this.bannerText = scene.add.text(cx, scene.scale.height / 2 - 40, '', BANNER_STYLE)
      .setScrollFactor(0).setDepth(120).setOrigin(0.5, 0.5).setVisible(false);

    // Bottom-right battle log
    const logW = 320;
    const logH = MAX_LOG_LINES * 16 + 24;
    const logX = scene.scale.width - logW - 8;
    const logY = scene.scale.height - logH - 8;

    this.logBg = scene.add.graphics().setScrollFactor(0).setDepth(99);
    this.logBg.fillStyle(0xe8d8b8, 0.88);
    this.logBg.fillRoundedRect(logX, logY, logW, logH, 4);
    this.logBg.lineStyle(1, 0x8a7050, 0.5);
    this.logBg.strokeRoundedRect(logX, logY, logW, logH, 4);

    this.logText = scene.add.text(logX + 6, logY + 4, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#3a2a10',
      lineSpacing: 3,
      wordWrap: { width: logW - 12 },
    }).setScrollFactor(0).setDepth(100);

    // Enemy hover tooltip
    this.tooltipText = scene.add.text(0, 0, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      color: '#2a1808',
      backgroundColor: '#e8d8b8ee',
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(130).setVisible(false);

    this.allObjects = [
      this.waveBg, this.waveText, this.livesText, this.statusText,
      this.battleAlert, this.bannerText,
      this.logBg, this.logText,
      this.tooltipText,
    ];
  }

  getAllObjects(): Phaser.GameObjects.GameObject[] {
    return this.allObjects;
  }

  update(wave: WaveState, defenders: ReadonlyMap<number, DefenderState>, delta: number): void {
    if (wave.phase === 'off') return;

    const seasonNames = ['Spring', 'Summer', 'Autumn', 'WINTER SIEGE'];
    const season = seasonNames[Math.min(Math.floor((wave.waveNumber - 1) / 3), 3)];
    this.waveText.setText(`\u2694 WAVE ${wave.waveNumber} \u2014 ${season} \u2694`);

    const filled = Math.max(0, Math.min(wave.lives, MAX_LIVES));
    const hearts = '\u2665'.repeat(filled) + '\u2661'.repeat(MAX_LIVES - filled);
    this.livesText.setColor(filled > 0 ? '#8a1a1a' : '#b0a090');
    this.livesText.setText(hearts);

    if (wave.phase === 'prep') {
      this.statusText.setText(`Preparing defences... ${Math.ceil(wave.prepMsRemaining / 1000)}s`);
    } else {
      this.statusText.setText(`${wave.enemiesRemainingInWave} hostiles advancing`);
    }

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

    // Age out log entries
    for (const entry of this.logEntries) entry.age += delta;
    this.logEntries = this.logEntries.filter(e => e.age < LOG_LINE_LIFETIME);
    this.logText.setText(this.logEntries.map(e => {
      const fade = Math.max(0.3, 1 - e.age / LOG_LINE_LIFETIME);
      return e.text; // Phaser text doesn't support per-line alpha — just show all
    }).join('\n'));
    this.logText.setAlpha(this.logEntries.length > 0 ? 1 : 0);
    this.logBg.setAlpha(this.logEntries.length > 0 ? 0.72 : 0);
  }

  /** Log a combat hit in dispatch style */
  logHit(defenderDefId: string, enemyDefId: string, damage: number): void {
    const d = CREATURE_TITLES[defenderDefId] ?? 'A brave soul';
    const e = ENEMY_TITLES[enemyDefId] ?? 'a foe of unknown allegiance';
    if (damage >= 2) {
      const cries = BATTLE_CRIES[defenderDefId] ?? DEFAULT_CRIES;
      const cry = pick(cries);
      this.addLogEntry(fmt(pick(DISPATCH_TEMPLATES_HEAVY), { d, e, cry }));
    } else {
      this.addLogEntry(fmt(pick(DISPATCH_TEMPLATES_LIGHT), { d, e }));
    }
  }

  /** Log an enemy vanquished */
  logDefeat(enemyDefId: string): void {
    const e = ENEMY_TITLES[enemyDefId] ?? 'A hostile of uncertain origin';
    this.addLogEntry(fmt(pick(DISPATCH_DEFEAT), { e }));
  }

  /** Log a breach */
  logBreach(enemyDefId: string): void {
    const e = ENEMY_TITLES[enemyDefId] ?? 'An unknown assailant';
    this.addLogEntry(fmt(pick(DISPATCH_BREACH), { e }));
  }

  /** Log a scout sighting */
  logSighting(scoutDefId: string, enemyDefId: string, enemyCol: number): void {
    const d = CREATURE_TITLES[scoutDefId] ?? 'A keen-eyed sentinel';
    const e = ENEMY_TITLES[enemyDefId] ?? 'hostile forces';
    const dir = enemyCol < 100 ? 'western' : 'eastern';
    this.addLogEntry(fmt(pick(DISPATCH_SCOUT), { d, e, dir }));
  }

  private addLogEntry(text: string): void {
    this.logEntries.push({ text, age: 0 });
    if (this.logEntries.length > MAX_LOG_LINES) {
      this.logEntries.shift();
    }
  }

  /** Show enemy info tooltip at screen position */
  showEnemyTooltip(
    enemy: EnemyState,
    enemyDef: EnemyDef | undefined,
    screenX: number,
    screenY: number,
  ): void {
    const name = enemyDef?.name ?? enemy.defId;
    const hpBar = '\u2588'.repeat(Math.ceil(enemy.hp)) + '\u2591'.repeat(Math.max(0, (enemyDef?.maxHp ?? 1) - Math.ceil(enemy.hp)));
    const speed = enemy.currentSpeed < (enemyDef?.speed ?? 1) * 0.9 ? ' [SLOWED]' : '';
    const phase = enemy.phase === 'fleeing' ? ' [RETREATING]' : '';

    this.tooltipText.setText(
      `${name}${phase}\nHP: ${hpBar} ${Math.ceil(enemy.hp)}/${enemyDef?.maxHp ?? '?'}\nSpeed: ${enemy.currentSpeed.toFixed(1)}${speed}`
    );
    this.tooltipText.setPosition(screenX + 12, screenY - 40);
    this.tooltipText.setVisible(true);
  }

  hideEnemyTooltip(): void {
    this.tooltipText.setVisible(false);
  }

  showWaveClear(waveNum: number): void {
    this.bannerText.setText(`\u2014 WAVE ${waveNum} REPELLED \u2014`);
    this.bannerText.setColor('#ffd060');
    this.bannerText.setVisible(true);
    this.bannerTimer = 3000;
    this.bannerPersistent = false;
    this.addLogEntry(fmt(pick(DISPATCH_WAVE_CLEAR), { n: String(waveNum) }));
  }

  showGameOver(wavesReached: number): void {
    this.bannerText.setText(`~ THE HEDGE HAS FALLEN ~\nWaves survived: ${wavesReached}`);
    this.bannerText.setColor('#ffd060');
    this.bannerText.setVisible(true);
    this.bannerPersistent = true;
    this.addLogEntry(`The hedge has fallen after ${wavesReached} waves. A dark season for the hedgefolk.`);
    this.addLogEntry('Let it be known: every creature fought with honour to the last.');
  }

  showVictory(wavesCompleted: number): void {
    this.bannerText.setText(`\u2694 THE HEDGE STANDS \u2694\n${wavesCompleted} waves repelled \u2014 press R to return`);
    this.bannerText.setColor('#ffcc40');
    this.bannerText.setVisible(true);
    this.bannerPersistent = true;
    this.addLogEntry(`EXTRAORDINARY TIDINGS: All ${wavesCompleted} waves repelled!`);
    this.addLogEntry('The hedge endures! Three cheers for the hedgefolk! The Vermin are routed!');
  }

  showBattleAlert(active: boolean): void {
    this.battleAlert.setVisible(active);
    if (!active) this.battleAlertTime = 0;
  }

  setVisible(v: boolean): void {
    for (const obj of this.allObjects) {
      if (obj === this.bannerText || obj === this.tooltipText) continue;
      (obj as unknown as Phaser.GameObjects.Components.Visible).setVisible(v);
    }
    if (!v) {
      this.bannerText.setVisible(false);
      this.tooltipText.setVisible(false);
    }
  }
}
