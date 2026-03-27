import Phaser from 'phaser';
import { Season, GrowthStage, type TimePeriod, type MoonPhase, type SpeciesDef, type PlantState } from '@/types';
import { SPECIES } from '@/data/species';

const SEASON_COLORS: Record<Season, string> = {
  [Season.Spring]: '#7aba4a',
  [Season.Summer]: '#eaea4a',
  [Season.Autumn]: '#da8a2a',
  [Season.Winter]: '#aacaea',
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

export class HudRenderer {
  private seasonText: Phaser.GameObjects.Text;
  private energyText: Phaser.GameObjects.Text;
  private speciesPanel: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private tooltipText: Phaser.GameObjects.Text;
  private infoPanel: Phaser.GameObjects.Text;
  private messageTimer = 0;

  constructor(scene: Phaser.Scene) {
    this.seasonText = scene.add.text(8, 8, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.energyText = scene.add.text(8, 28, '', HUD_STYLE)
      .setScrollFactor(0)
      .setDepth(100);

    this.speciesPanel = scene.add.text(8, 52, '', {
      ...HUD_STYLE,
      fontSize: '13px',
      lineSpacing: 2,
    })
      .setScrollFactor(0)
      .setDepth(100);

    this.messageText = scene.add.text(8, 210, '', {
      ...HUD_STYLE,
      color: '#ffaa44',
    })
      .setScrollFactor(0)
      .setDepth(100)
      .setAlpha(0);

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

    // Position info panel on the right
    const cam = scene.cameras.main;
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
    mouseScreenX: number,
    mouseScreenY: number,
  ): void {
    const color = SEASON_COLORS[period.season];
    this.seasonText.setText(`${subName} ${seasonName} ${moonSymbol} ${moonName}`);
    this.seasonText.setColor(color);

    const bar = '\u2588'.repeat(Math.min(energy, 20)) + '\u2591'.repeat(Math.max(0, 20 - energy));
    this.energyText.setText(`Energy: ${bar} ${energy}`);

    // Species panel — show all species with status
    const lines: string[] = [];
    for (let i = 0; i < allSpecies.length; i++) {
      const sp = allSpecies[i];
      const num = i + 1;
      const selected = i === selectedIndex ? '\u25B6' : ' ';
      const canPlant = sp.plantableSeasons.includes(period.season) && energy >= sp.energyCost;
      const plantable = canPlant ? '\u2713' : '\u2717';
      const activity = sp.seasonalActivity[period.season];
      lines.push(`${selected}[${num}] ${sp.name.padEnd(11)} ${sp.energyCost}E ${plantable} ${activity}`);
    }
    this.speciesPanel.setText(lines.join('\n'));

    // Fade message
    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) {
        this.messageText.setAlpha(0);
      } else if (this.messageTimer < 500) {
        this.messageText.setAlpha(this.messageTimer / 500);
      }
    }

    // Tooltip
    if (hoveredPlant) {
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
    if (hoveredPlant) {
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
      // Show selected species info when not hovering
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
}
