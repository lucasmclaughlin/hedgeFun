import Phaser from 'phaser';
import { Season, GrowthStage, CreatureActivity, type TimePeriod, type MoonPhase, type SpeciesDef, type PlantState, type CreatureState, type MilestoneDef } from '@/types';
import { SPECIES } from '@/data/species';
import { CREATURES } from '@/data/creatures';
import { BiodiversityTracker } from '@/simulation/BiodiversityTracker';

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

export class HudRenderer {
  private seasonText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;
  private weatherText: Phaser.GameObjects.Text;
  private creatureText: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
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
  private messageTimer = 0;

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

    // Create individual text objects for each species line (for color coding)
    for (let i = 0; i < 6; i++) {
      const line = scene.add.text(8, 112 + i * 20, '', {
        ...HUD_STYLE,
        fontSize: '13px',
      })
        .setScrollFactor(0)
        .setDepth(100);
      this.speciesLines.push(line);
    }

    this.messageText = scene.add.text(8, 240, '', {
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

    // Hint text at bottom
    this.milestoneHint = scene.add.text(cam.width / 2, this.milestoneViewTop + this.milestoneViewHeight - 8, 'Scroll ↑↓  |  M to close', {
      fontFamily: 'Courier New, monospace',
      fontSize: '11px',
      color: '#666688',
    })
      .setScrollFactor(0)
      .setDepth(202)
      .setOrigin(0.5, 1)
      .setAlpha(0);

    // Mouse wheel scrolling
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
  }

  update(
    seasonName: string,
    subName: string,
    moonSymbol: string,
    moonName: string,
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
    creatureSpeciesCount: number,
    creatureTotalCount: number,
    biodiversityScore: number,
    milestonesAchieved: number,
    milestonesTotal: number,
  ): void {
    const color = SEASON_COLORS[period.season];
    this.seasonText.setText(`${subName} ${seasonName} ${moonSymbol} ${moonName}`);
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
        this.infoPanel.setText(infoLines.join('\n'));
        this.infoPanel.setAlpha(1);
      }
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
    if (this.milestoneContentHeight <= this.milestoneViewHeight - 48) return; // no scrollbar needed
    const cam = this.milestoneOverlayBg.scene.cameras.main;
    const trackX = cam.width - 40;
    const trackTop = this.milestoneViewTop + 12;
    const trackHeight = this.milestoneViewHeight - 40;
    const thumbRatio = Math.min(1, (this.milestoneViewHeight - 48) / this.milestoneContentHeight);
    const thumbHeight = Math.max(20, trackHeight * thumbRatio);
    const thumbY = trackTop + (this.milestoneScrollY / maxScroll) * (trackHeight - thumbHeight);
    // Track
    this.milestoneScrollBar.fillStyle(0x333355, 0.5);
    this.milestoneScrollBar.fillRoundedRect(trackX, trackTop, 6, trackHeight, 3);
    // Thumb
    this.milestoneScrollBar.fillStyle(0x8888bb, 0.8);
    this.milestoneScrollBar.fillRoundedRect(trackX, thumbY, 6, thumbHeight, 3);
  }

  isMilestoneOverlayVisible(): boolean {
    return this.milestoneOverlayVisible;
  }

  /** Return all HUD game objects so they can be assigned to a dedicated camera */
  getAllObjects(): Phaser.GameObjects.GameObject[] {
    return [
      this.seasonText,
      this.energyText,
      this.weatherText,
      this.creatureText,
      this.scoreText,
      ...this.speciesLines,
      this.messageText,
      this.milestoneToast,
      this.tooltipText,
      this.infoPanel,
      this.milestoneOverlayBg,
      this.milestoneOverlayText,
      this.milestoneScrollBar,
      this.milestoneHint,
    ];
  }
}
