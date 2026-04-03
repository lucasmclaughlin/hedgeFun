import Phaser from 'phaser';
import { Season, GrowthStage, SoilBiome, SoilLayer, CreatureActivity, type TimePeriod, type MoonPhase, type SpeciesDef, type PlantState, type CreatureState, type MilestoneDef } from '@/types';
import { SPECIES } from '@/data/species';
import { CREATURES } from '@/data/creatures';
import { BiodiversityTracker } from '@/simulation/BiodiversityTracker';
import type { ActiveRelationship } from '@/simulation/companionPlanting';

export interface TerrainHoverInfo {
  col: number;
  row: number;
  depth: number;
  soilLayer: SoilLayer;
  biome: SoilBiome;
  fertility: number;
  rockDensity: number;
  inBoulder: boolean;
  inClayLens: boolean;
  nearAquifer: boolean;
  isSpring: boolean;
}

const BIOME_NAMES: Record<SoilBiome, string> = {
  [SoilBiome.Loam]:  'Loam',
  [SoilBiome.Clay]:  'Clay',
  [SoilBiome.Chalk]: 'Chalk',
  [SoilBiome.Peat]:  'Peat',
  [SoilBiome.Sandy]: 'Sandy',
};

const SOIL_LAYER_NAMES: Record<SoilLayer, string> = {
  [SoilLayer.Topsoil]: 'Topsoil',
  [SoilLayer.Subsoil]: 'Subsoil',
  [SoilLayer.Bedrock]: 'Bedrock',
};

const SEASON_COLORS: Record<Season, string> = {
  [Season.Spring]: '#7aba4a',
  [Season.Summer]: '#eaea4a',
  [Season.Autumn]: '#da8a2a',
  [Season.Winter]: '#aacaea',
};

const ACTIVITY_NAMES: Record<CreatureActivity, string> = {
  [CreatureActivity.Resting]: 'Resting',
  [CreatureActivity.Foraging]: 'Foraging',
  [CreatureActivity.Hunting]: 'Hunting',
  [CreatureActivity.Singing]: 'Singing',
  [CreatureActivity.Nesting]: 'Nesting',
  [CreatureActivity.Courting]: 'Courting',
  [CreatureActivity.Grooming]: 'Grooming',
  [CreatureActivity.Burrowing]: 'Burrowing',
  [CreatureActivity.Patrolling]: 'Patrolling',
  [CreatureActivity.Sleeping]: 'Sleeping',
  [CreatureActivity.Hibernating]: 'Hibernating',
  [CreatureActivity.Basking]: 'Basking',
};

const GROWTH_STAGE_NAMES: Record<GrowthStage, string> = {
  [GrowthStage.Seed]: 'Seed',
  [GrowthStage.Seedling]: 'Seedling',
  [GrowthStage.Juvenile]: 'Juvenile',
  [GrowthStage.Mature]: 'Mature',
};

const HUD_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'Courier New, monospace',
  fontSize: '14px',
  color: '#cccccc',
  backgroundColor: '#000000cc',
  padding: { x: 8, y: 4 },
};

const PLANTABLE_COLOR = '#66dd66';
const NOT_PLANTABLE_COLOR = '#aa4444';
const SELECTED_PLANTABLE_COLOR = '#88ff88';
const SELECTED_NOT_PLANTABLE_COLOR = '#dd6666';

const MENU_CONTROLS = [
  ['A / D',         'Move cursor left / right'],
  ['1–6',           'Select plant species'],
  ['Space',         'Plant selected species'],
  ['P',             'Prune plant at cursor'],
  ['H',             'Lay hedge (Winter only, Mature)'],
  ['C',             'Coppice plant (Winter, Juv/Mature, if species allows)'],
  ['O',             'Pollard plant (Winter, Mature, if species allows)'],
  ['Arrow keys',    'Pan camera'],
  ['Mouse drag',    'Pan camera'],
  ['Tab',           'Cycle speed (Pause/Slow/Normal/Fast)'],
  ['M',             'Milestone log (biodiversity score)'],
  ['V',             'Cycle view (Hedge / Underground / Full)'],
  ['S / L',         'Save / Load game'],
  ['E / I',         'Export / Import save file'],
  ['Z',             'Screenshot mode (hide UI, zoom out)'],
  ['R',             'Return to main menu'],
  ['Esc',           'Close this menu'],
];

export class HudRenderer {
  private seasonText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;
  private weatherText: Phaser.GameObjects.Text;
  private creatureText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private speedText: Phaser.GameObjects.Text;
  private speciesLines: Phaser.GameObjects.Text[] = [];
  private messageText: Phaser.GameObjects.Text;
  private milestoneToast: Phaser.GameObjects.Text;
  private milestoneToastTimer = 0;
  private milestoneQueue: MilestoneDef[] = [];
  private tooltipText: Phaser.GameObjects.Text;
  private infoPanel: Phaser.GameObjects.Text;
  private milestoneOverlayBg: Phaser.GameObjects.Graphics;
  private milestoneOverlayText: Phaser.GameObjects.Text;
  private milestoneOverlayVisible = false;
  private milestoneScrollY = 0;
  private milestoneContentHeight = 0;
  private milestoneViewHeight = 0;
  private milestoneViewTop = 0;
  private milestoneScrollBar: Phaser.GameObjects.Graphics;
  private milestoneHint: Phaser.GameObjects.Text;

  // Menu overlay
  private menuOverlayBg: Phaser.GameObjects.Graphics;
  private menuOverlayText: Phaser.GameObjects.Text;
  private menuOverlayVisible = false;
  private menuButton: Phaser.GameObjects.Text;
  private menuSaveBtn: Phaser.GameObjects.Text;
  private menuLoadBtn: Phaser.GameObjects.Text;
  private menuRestartBtn: Phaser.GameObjects.Text;
  private menuCloseBtn: Phaser.GameObjects.Text;
  private onSaveCallback: (() => void) | null = null;
  private onLoadCallback: (() => void) | null = null;
  private onRestartCallback: (() => void) | null = null;

  private messageTimer = 0;
  private companionRelationships: ActiveRelationship[] = [];
  private terrainHoverInfo: TerrainHoverInfo | null = null;

  setCompanionRelationships(relationships: ActiveRelationship[]): void {
    this.companionRelationships = relationships;
  }

  setHoveredTerrainInfo(info: TerrainHoverInfo | null): void {
    this.terrainHoverInfo = info;
  }

  constructor(scene: Phaser.Scene) {
    this.seasonText = scene.add.text(8, 8, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.energyText = scene.add.text(8, 28, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.weatherText = scene.add.text(8, 48, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.creatureText = scene.add.text(8, 68, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.scoreText = scene.add.text(8, 88, '', {
      ...HUD_STYLE,
      color: '#eedd44',
    })
      .setScrollFactor(0)
      .setDepth(100);

    // Speed indicator
    this.speedText = scene.add.text(8, 108, '', {
      ...HUD_STYLE,
      fontSize: '13px',
      color: '#888888',
    })
      .setScrollFactor(0)
      .setDepth(100);

    // Create individual text objects for each species line (for color coding)
    for (let i = 0; i < 6; i++) {
      const line = scene.add.text(8, 132 + i * 20, '', {
        ...HUD_STYLE,
        fontSize: '13px',
      })
        .setScrollFactor(0)
        .setDepth(100);
      this.speciesLines.push(line);
    }

    this.messageText = scene.add.text(8, 260, '', {
      ...HUD_STYLE,
      color: '#ffaa44',
    })
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    // Milestone toast — centered, gold, longer display
    const cam = scene.cameras.main;
    this.milestoneToast = scene.add.text(cam.width / 2, cam.height / 2, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '16px',
      color: '#ffdd44',
      backgroundColor: '#1a1a2acc',
      padding: { x: 12, y: 6 },
      align: 'center',
    })
      .setScrollFactor(0)
      .setDepth(120)
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    // Milestone log overlay — scrollable window, toggled with M
    const pad = 32;
    this.milestoneViewHeight = cam.height - pad * 2;
    this.milestoneViewTop = pad;
    const viewLeft = pad;
    const viewWidth = cam.width - pad * 2;

    this.milestoneOverlayBg = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(199)
      .setAlpha(0);
    this.milestoneOverlayBg.fillStyle(0x0a0a14, 0.94);
    this.milestoneOverlayBg.fillRoundedRect(viewLeft, this.milestoneViewTop, viewWidth, this.milestoneViewHeight, 8);

    this.milestoneOverlayText = scene.add.text(viewLeft + 24, this.milestoneViewTop + 16, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#cccccc',
      lineSpacing: 3,
      align: 'left',
      wordWrap: { width: viewWidth - 64 },
    })
      .setScrollFactor(0)
      .setDepth(201)
      .setAlpha(0);

    // Mask to clip text to the overlay area
    const maskShape = scene.add.graphics().setVisible(false);
    maskShape.fillRect(viewLeft, this.milestoneViewTop + 8, viewWidth, this.milestoneViewHeight - 16);
    this.milestoneOverlayText.setMask(new Phaser.Display.Masks.GeometryMask(scene, maskShape));

    // Scroll bar track
    this.milestoneScrollBar = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(202)
      .setAlpha(0);

    // Hint text at bottom of milestone overlay
    this.milestoneHint = scene.add.text(cam.width / 2, this.milestoneViewTop + this.milestoneViewHeight - 8, 'Scroll \u2191\u2193  |  M to close', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#666688',
    })
      .setScrollFactor(0)
      .setDepth(202)
      .setOrigin(0.5, 1)
      .setAlpha(0);

    // Mouse wheel scrolling for milestone overlay
    scene.input.on('wheel', (_pointer: Phaser.Input.Pointer, _gameObjects: Phaser.GameObjects.GameObject[], _deltaX: number, deltaY: number) => {
      if (!this.milestoneOverlayVisible) return;
      const maxScroll = Math.max(0, this.milestoneContentHeight - (this.milestoneViewHeight - 48));
      this.milestoneScrollY = Phaser.Math.Clamp(this.milestoneScrollY + deltaY * 0.5, 0, maxScroll);
      this.milestoneOverlayText.setY(this.milestoneViewTop + 16 - this.milestoneScrollY);
      this.updateMilestoneScrollBar();
    });

    // Tooltip follows mouse
    this.tooltipText = scene.add.text(0, 0, '', {
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#000000dd',
      padding: { x: 4, y: 2 },
    })
      .setScrollFactor(0)
      .setDepth(110)
      .setAlpha(0);

    // Info panel on the right side
    this.infoPanel = scene.add.text(0, 0, '', {
      ...HUD_STYLE,
      fontSize: '13px',
      lineSpacing: 2,
      wordWrap: { width: 240 },
    })
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

    this.infoPanel.setPosition(cam.width - 258, 8);

    // ── Menu button ──
    const btnStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '13px',
      color: '#888888',
      backgroundColor: '#111111cc',
      padding: { x: 8, y: 4 },
    };

    this.menuButton = scene.add.text(8, cam.height - 8, '[ \u2261 Menu ]', btnStyle)
      .setScrollFactor(0)
      .setDepth(100)
      .setOrigin(0, 1)
      .setInteractive({ useHandCursor: true });

    this.menuButton.on('pointerover', () => this.menuButton.setColor('#cccccc'));
    this.menuButton.on('pointerout', () => this.menuButton.setColor('#888888'));
    // Click handled by manual hit-test in GameScene (pointerup) to avoid double-toggle

    // ── Menu overlay ──
    const menuPad = 48;
    const menuWidth = Math.min(600, cam.width - menuPad * 2);
    const menuHeight = Math.min(520, cam.height - menuPad * 2);
    const menuLeft = (cam.width - menuWidth) / 2;
    const menuTop = (cam.height - menuHeight) / 2;

    this.menuOverlayBg = scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(210)
      .setAlpha(0);
    this.menuOverlayBg.fillStyle(0x08080f, 0.96);
    this.menuOverlayBg.lineStyle(1, 0x336633, 0.8);
    this.menuOverlayBg.fillRoundedRect(menuLeft, menuTop, menuWidth, menuHeight, 8);
    this.menuOverlayBg.strokeRoundedRect(menuLeft, menuTop, menuWidth, menuHeight, 8);

    // Build controls text
    const titleLine = '\u2500\u2500\u2500 CONTROLS \u2500\u2500\u2500\n';
    const controlsText = MENU_CONTROLS.map(([key, desc]) =>
      `${key.padEnd(18)}${desc}`
    ).join('\n');

    this.menuOverlayText = scene.add.text(
      menuLeft + 24,
      menuTop + 20,
      titleLine + controlsText,
      {
        fontFamily: 'Courier New, monospace',
        fontSize: '13px',
        color: '#cccccc',
        lineSpacing: 4,
        align: 'left',
      }
    )
      .setScrollFactor(0)
      .setDepth(212)
      .setAlpha(0);

    // Color the title differently
    // (Phaser text doesn't support inline color, so we use a separate text for the title)

    // Action buttons at bottom of menu
    const btnY = menuTop + menuHeight - 16;
    const actionBtnStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#8aaa8a',
      backgroundColor: '#1a2a1a',
      padding: { x: 10, y: 5 },
    };

    const totalBtns = 4;
    const btnSpacing = menuWidth / totalBtns;

    this.menuSaveBtn = scene.add.text(menuLeft + btnSpacing * 0 + btnSpacing / 2, btnY, '[ Save ]', actionBtnStyle)
      .setScrollFactor(0)
      .setDepth(212)
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.menuLoadBtn = scene.add.text(menuLeft + btnSpacing * 1 + btnSpacing / 2, btnY, '[ Load ]', actionBtnStyle)
      .setScrollFactor(0)
      .setDepth(212)
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.menuRestartBtn = scene.add.text(menuLeft + btnSpacing * 2 + btnSpacing / 2, btnY, '[ Main Menu ]', actionBtnStyle)
      .setScrollFactor(0)
      .setDepth(212)
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.menuCloseBtn = scene.add.text(menuLeft + btnSpacing * 3 + btnSpacing / 2, btnY, '[ Close \u00d7 ]', actionBtnStyle)
      .setScrollFactor(0)
      .setDepth(212)
      .setOrigin(0.5, 1)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    // Hover effects only — clicks handled by manual hit-test in GameScene (pointerup)
    for (const btn of [this.menuSaveBtn, this.menuLoadBtn, this.menuRestartBtn, this.menuCloseBtn]) {
      btn.on('pointerover', () => btn.setColor('#eeffee'));
      btn.on('pointerout', () => btn.setColor('#8aaa8a'));
    }
  }

  /** Register callbacks for menu button actions */
  setCallbacks(onSave: () => void, onLoad: () => void, onRestart: () => void): void {
    this.onSaveCallback = onSave;
    this.onLoadCallback = onLoad;
    this.onRestartCallback = onRestart;
  }

  update(
    seasonName: string,
    subName: string,
    moonSymbol: string,
    moonName: string,
    dayHourName: string,
    year: number,
    period: TimePeriod,
    _moon: MoonPhase,
    energy: number,
    selectedSpecies: SpeciesDef | null,
    selectedIndex: number,
    delta: number,
    allSpecies: SpeciesDef[],
    hoveredPlant: PlantState | null,
    hoveredCreature: CreatureState | null,
    mouseScreenX: number,
    mouseScreenY: number,
    weatherName: string,
    speedLabel: string,
    creatureSpeciesCount: number,
    creatureTotalCount: number,
    biodiversityScore: number,
    milestonesAchieved: number,
    milestonesTotal: number,
  ): void {
    const color = SEASON_COLORS[period.season];
    this.seasonText.setText(`Year ${year}  ${subName} ${seasonName}  ${dayHourName}  ${moonSymbol} ${moonName}`);
    this.seasonText.setColor(color);

    const bar = '\u2588'.repeat(Math.min(energy, 20)) + '\u2591'.repeat(Math.max(0, 20 - energy));
    this.energyText.setText(`Energy: ${bar} ${energy}`);

    this.weatherText.setText(`Weather: ${weatherName}`);

    // Creature census
    if (creatureTotalCount > 0) {
      this.creatureText.setText(`Creatures: ${creatureSpeciesCount} species, ${creatureTotalCount} total`);
      this.creatureText.setColor('#aaddaa');
      this.creatureText.setAlpha(1);
    } else {
      this.creatureText.setText('Creatures: none yet');
      this.creatureText.setColor('#666666');
      this.creatureText.setAlpha(1);
    }

    // Biodiversity score
    this.scoreText.setText(`Score: ${biodiversityScore}  (${milestonesAchieved}/${milestonesTotal} milestones) [M]`);

    // Speed indicator
    if (speedLabel === 'REALTIME') {
      this.speedText.setText('Realtime mode  [T to exit]');
      this.speedText.setColor('#44bb88');
    } else {
      const isPaused = speedLabel.includes('Paused');
      this.speedText.setText(`Speed: ${speedLabel}  [Tab]`);
      this.speedText.setColor(isPaused ? '#ffaa44' : '#888888');
    }

    // Species panel — individual colored lines
    for (let i = 0; i < this.speciesLines.length; i++) {
      const sp = allSpecies[i];
      if (!sp) {
        this.speciesLines[i].setText('');
        continue;
      }
      const num = i + 1;
      const isSelected = i === selectedIndex;
      const arrow = isSelected ? '\u25B6' : ' ';
      const canPlant = sp.plantableSeasons.includes(period.season) && energy >= sp.energyCost;
      const marker = canPlant ? '\u2713' : '\u2717';
      const activity = sp.seasonalActivity[period.season];
      const text = `${arrow}[${num}] ${sp.name.padEnd(11)} ${sp.energyCost}E ${marker} ${activity}`;

      this.speciesLines[i].setText(text);

      // Color based on plantability + selection
      let lineColor: string;
      if (isSelected) {
        lineColor = canPlant ? SELECTED_PLANTABLE_COLOR : SELECTED_NOT_PLANTABLE_COLOR;
      } else {
        lineColor = canPlant ? PLANTABLE_COLOR : NOT_PLANTABLE_COLOR;
      }
      this.speciesLines[i].setColor(lineColor);
    }

    // Fade message
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) {
        this.messageText.setAlpha(0);
      } else if (this.messageTimer < 500) {
        this.messageText.setAlpha(this.messageTimer / 500);
      }
    }

    // Milestone toast (queued, shown one at a time)
    if (this.milestoneToastTimer > 0) {
      this.milestoneToastTimer -= delta;
      if (this.milestoneToastTimer <= 0) {
        this.milestoneToast.setAlpha(0);
        // Show next queued milestone if any
        if (this.milestoneQueue.length > 0) {
          this.showNextMilestoneToast();
        }
      } else if (this.milestoneToastTimer < 600) {
        this.milestoneToast.setAlpha(this.milestoneToastTimer / 600);
      }
    }

    // Tooltip
    if (hoveredCreature) {
      const cDef = CREATURES[hoveredCreature.defId];
      if (cDef) {
        this.tooltipText.setText(cDef.name);
        this.tooltipText.setPosition(mouseScreenX + 16, mouseScreenY - 8);
        this.tooltipText.setAlpha(1);
      }
    } else if (hoveredPlant) {
      const species = SPECIES[hoveredPlant.speciesId];
      if (species) {
        this.tooltipText.setText(species.name);
        this.tooltipText.setPosition(mouseScreenX + 16, mouseScreenY - 8);
        this.tooltipText.setAlpha(1);
      }
    } else {
      this.tooltipText.setAlpha(0);
    }

    // Info panel
    if (hoveredCreature) {
      const cDef = CREATURES[hoveredCreature.defId];
      if (cDef) {
        const layerNames = ['Sky', 'Upper Canopy', 'Mid Canopy', 'Lower Shrub', 'Ground', 'Underground'];
        const winterNames = ['Active all year', 'Hibernates in winter', 'Migrates in autumn'];
        const activityName = ACTIVITY_NAMES[hoveredCreature.activity];
        const infoLines = [
          `-- ${cDef.name} --`,
          `   ${cDef.latin}`,
          '',
          cDef.description,
          '',
          `Activity: ${activityName}`,
          `Size: ${cDef.size}`,
          `Diet: ${cDef.diet}`,
          `Nesting: ${cDef.nesting}`,
          '',
          `Layer: ${layerNames[cDef.layer]}`,
          `Winter: ${winterNames[cDef.winterBehavior]}`,
          `Rarity: ${'*'.repeat(Math.max(1, 6 - Math.ceil(cDef.rarity / 2)))}`,
        ];
        if (cDef.habitat.attractedBySpecies?.length) {
          infoLines.push(`Likes: ${cDef.habitat.attractedBySpecies.join(', ')}`);
        }
        infoLines.push('', cDef.funFact);
        this.infoPanel.setText(infoLines.join('\n'));
        this.infoPanel.setAlpha(1);
      }
    } else if (hoveredPlant) {
      const species = SPECIES[hoveredPlant.speciesId];
      if (species) {
        const stage = GROWTH_STAGE_NAMES[hoveredPlant.stage];
        const activity = species.seasonalActivity[period.season];
        const infoLines = [
          `-- ${species.name} --`,
          '',
          species.description,
          '',
          `Stage: ${stage}`,
          `Activity: ${activity}`,
          `Cost: ${species.energyCost}E`,
          `Growth: ${'*'.repeat(Math.round(species.growthRate * 3))}`,
          '',
          `Plant in: ${species.plantableSeasons.map(s => ['Spring', 'Summer', 'Autumn', 'Winter'][s]).join(', ')}`,
        ];
        if (this.companionRelationships.length > 0) {
          infoLines.push('');
          for (const rel of this.companionRelationships) {
            const icon = rel.type === 'synergy' ? '\u2665' : '\u00D7';
            infoLines.push(`${icon} ${rel.label}`);
          }
        }
        this.infoPanel.setText(infoLines.join('\n'));
        this.infoPanel.setAlpha(1);
      }
    } else if (this.terrainHoverInfo) {
      const t = this.terrainHoverInfo;
      const biomeName = BIOME_NAMES[t.biome];
      const layerName = SOIL_LAYER_NAMES[t.soilLayer];
      const fertilityBar = Math.round(t.fertility * 10);
      const rockBar = Math.round(t.rockDensity * 10);
      const infoLines = [
        `-- ${layerName} --`,
        `Biome: ${biomeName}`,
        `Depth: ${t.depth} rows`,
        '',
        `Fertility:  ${'|'.repeat(fertilityBar)}${'.'.repeat(10 - fertilityBar)} ${Math.round(t.fertility * 100)}%`,
        `Rock:       ${'|'.repeat(rockBar)}${'.'.repeat(10 - rockBar)} ${Math.round(t.rockDensity * 100)}%`,
      ];
      const features: string[] = [];
      if (t.inBoulder)   features.push('Boulder mass');
      if (t.inClayLens)  features.push('Clay lens');
      if (t.nearAquifer) features.push('Near aquifer');
      if (t.isSpring)    features.push('Spring column');
      if (features.length > 0) {
        infoLines.push('', ...features);
      }
      this.infoPanel.setText(infoLines.join('\n'));
      this.infoPanel.setAlpha(1);
    } else if (selectedSpecies) {
      const activity = selectedSpecies.seasonalActivity[period.season];
      const canPlant = selectedSpecies.plantableSeasons.includes(period.season);
      const infoLines = [
        `-- ${selectedSpecies.name} --`,
        '',
        selectedSpecies.description,
        '',
        `Cost: ${selectedSpecies.energyCost}E`,
        `Activity: ${activity}`,
        `Growth: ${'*'.repeat(Math.round(selectedSpecies.growthRate * 3))}`,
        '',
        `Plant in: ${selectedSpecies.plantableSeasons.map(s => ['Spring', 'Summer', 'Autumn', 'Winter'][s]).join(', ')}`,
        canPlant ? '\u2713 Can plant now' : '\u2717 Wrong season',
      ];
      this.infoPanel.setText(infoLines.join('\n'));
      this.infoPanel.setAlpha(1);
    } else {
      this.infoPanel.setAlpha(0);
    }
  }

  showMessage(msg: string, durationMs = 2000): void {
    this.messageText.setText(msg);
    this.messageText.setAlpha(1);
    this.messageTimer = durationMs;
  }

  /** Queue milestone achievements for display as toasts */
  showMilestoneToasts(milestones: MilestoneDef[]): void {
    this.milestoneQueue.push(...milestones);
    // If nothing currently showing, start the first one
    if (this.milestoneToastTimer <= 0) {
      this.showNextMilestoneToast();
    }
  }

  private showNextMilestoneToast(): void {
    const def = this.milestoneQueue.shift();
    if (!def) return;
    this.milestoneToast.setText(`\u2605 ${def.title}  +${def.points}\n${def.description}`);
    this.milestoneToast.setAlpha(1);
    this.milestoneToastTimer = 3500;
  }

  /** Toggle the milestone log overlay */
  toggleMilestoneOverlay(tracker: BiodiversityTracker): void {
    // Close menu if open
    if (this.menuOverlayVisible) this.hideMenuOverlay();
    this.milestoneOverlayVisible = !this.milestoneOverlayVisible;
    if (this.milestoneOverlayVisible) {
      const lines = tracker.getMilestoneLog();
      this.milestoneOverlayText.setText(lines.join('\n'));
      this.milestoneScrollY = 0;
      this.milestoneOverlayText.setY(this.milestoneViewTop + 16);
      this.milestoneContentHeight = this.milestoneOverlayText.height;
      this.milestoneOverlayBg.setAlpha(1);
      this.milestoneOverlayText.setAlpha(1);
      this.milestoneHint.setAlpha(1);
      this.updateMilestoneScrollBar();
      this.milestoneScrollBar.setAlpha(1);
    } else {
      this.milestoneOverlayBg.setAlpha(0);
      this.milestoneOverlayText.setAlpha(0);
      this.milestoneScrollBar.setAlpha(0);
      this.milestoneHint.setAlpha(0);
    }
  }

  private updateMilestoneScrollBar(): void {
    this.milestoneScrollBar.clear();
    const maxScroll = Math.max(1, this.milestoneContentHeight - (this.milestoneViewHeight - 48));
    if (this.milestoneContentHeight <= this.milestoneViewHeight - 48) return;
    const cam = this.milestoneOverlayBg.scene.cameras.main;
    const trackX = cam.width - 40;
    const trackTop = this.milestoneViewTop + 12;
    const trackHeight = this.milestoneViewHeight - 40;
    const thumbRatio = Math.min(1, (this.milestoneViewHeight - 48) / this.milestoneContentHeight);
    const thumbHeight = Math.max(20, trackHeight * thumbRatio);
    const thumbY = trackTop + (this.milestoneScrollY / maxScroll) * (trackHeight - thumbHeight);
    this.milestoneScrollBar.fillStyle(0x333355, 0.5);
    this.milestoneScrollBar.fillRoundedRect(trackX, trackTop, 6, trackHeight, 3);
    this.milestoneScrollBar.fillStyle(0x8888bb, 0.8);
    this.milestoneScrollBar.fillRoundedRect(trackX, thumbY, 6, thumbHeight, 3);
  }

  isMilestoneOverlayVisible(): boolean {
    return this.milestoneOverlayVisible;
  }

  toggleMenuOverlay(): void {
    if (this.menuOverlayVisible) {
      this.hideMenuOverlay();
    } else {
      // Close milestone overlay if open
      if (this.milestoneOverlayVisible) {
        this.milestoneOverlayBg.setAlpha(0);
        this.milestoneOverlayText.setAlpha(0);
        this.milestoneScrollBar.setAlpha(0);
        this.milestoneHint.setAlpha(0);
        this.milestoneOverlayVisible = false;
      }
      this.menuOverlayVisible = true;
      this.menuOverlayBg.setAlpha(1);
      this.menuOverlayText.setAlpha(1);
      this.menuSaveBtn.setAlpha(1);
      this.menuLoadBtn.setAlpha(1);
      this.menuRestartBtn.setAlpha(1);
      this.menuCloseBtn.setAlpha(1);
    }
  }

  private hideMenuOverlay(): void {
    this.menuOverlayVisible = false;
    this.menuOverlayBg.setAlpha(0);
    this.menuOverlayText.setAlpha(0);
    this.menuSaveBtn.setAlpha(0);
    this.menuLoadBtn.setAlpha(0);
    this.menuRestartBtn.setAlpha(0);
    this.menuCloseBtn.setAlpha(0);
  }

  isMenuOverlayVisible(): boolean {
    return this.menuOverlayVisible;
  }

  /**
   * Manual screen-space hit test for HUD buttons.
   * Because HUD objects are ignored by the main camera (which may be zoomed),
   * Phaser's built-in interactive events don't fire reliably. Call this from
   * the scene's pointerup handler using raw screen coordinates.
   * Returns true if a button was hit and handled.
   */
  handleClick(screenX: number, screenY: number): boolean {
    // Menu toggle button (always present)
    if (this.hitTestText(this.menuButton, screenX, screenY)) {
      this.toggleMenuOverlay();
      return true;
    }
    // Action buttons inside the menu overlay
    if (this.menuOverlayVisible) {
      if (this.hitTestText(this.menuSaveBtn, screenX, screenY)) {
        this.onSaveCallback?.();
        this.hideMenuOverlay();
        return true;
      }
      if (this.hitTestText(this.menuLoadBtn, screenX, screenY)) {
        this.onLoadCallback?.();
        this.hideMenuOverlay();
        return true;
      }
      if (this.hitTestText(this.menuRestartBtn, screenX, screenY)) {
        this.onRestartCallback?.();
        return true;
      }
      if (this.hitTestText(this.menuCloseBtn, screenX, screenY)) {
        this.hideMenuOverlay();
        return true;
      }
    }
    return false;
  }

  /** Hit-test a Text object using raw screen coordinates (hudCamera has zoom=1, scroll=0). */
  private hitTestText(obj: Phaser.GameObjects.Text, x: number, y: number): boolean {
    if (!obj.visible || obj.alpha === 0) return false;
    const left = obj.x - obj.width * obj.originX;
    const top  = obj.y - obj.height * obj.originY;
    return x >= left && x <= left + obj.width && y >= top && y <= top + obj.height;
  }

  /** Show or hide the entire HUD (used by screenshot mode) */
  setVisible(visible: boolean): void {
    for (const obj of this.getAllObjects()) {
      (obj as Phaser.GameObjects.Text | Phaser.GameObjects.Graphics).setVisible(visible);
    }
    // Keep overlays hidden regardless
    if (visible) {
      if (!this.milestoneOverlayVisible) {
        this.milestoneOverlayBg.setVisible(false);
        this.milestoneOverlayText.setVisible(false);
        this.milestoneScrollBar.setVisible(false);
        this.milestoneHint.setVisible(false);
      }
      if (!this.menuOverlayVisible) {
        this.menuOverlayBg.setVisible(false);
        this.menuOverlayText.setVisible(false);
        this.menuSaveBtn.setVisible(false);
        this.menuLoadBtn.setVisible(false);
        this.menuRestartBtn.setVisible(false);
        this.menuCloseBtn.setVisible(false);
      }
    }
  }

  /** Return all HUD game objects so they can be assigned to a dedicated camera */
  getAllObjects(): Phaser.GameObjects.GameObject[] {
    return [
      this.seasonText,
      this.energyText,
      this.weatherText,
      this.creatureText,
      this.scoreText,
      this.speedText,
      ...this.speciesLines,
      this.messageText,
      this.milestoneToast,
      this.tooltipText,
      this.infoPanel,
      this.milestoneOverlayBg,
      this.milestoneOverlayText,
      this.milestoneScrollBar,
      this.milestoneHint,
      this.menuButton,
      this.menuOverlayBg,
      this.menuOverlayText,
      this.menuSaveBtn,
      this.menuLoadBtn,
      this.menuRestartBtn,
      this.menuCloseBtn,
    ];
  }
}
