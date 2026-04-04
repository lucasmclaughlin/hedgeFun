import Phaser from 'phaser';
import { Season, BuildModeState, BuildPhase, DAY_HOUR_NAMES } from '@/types';
import type { TimePeriod, Weather, BuildModeContext, HouseState, VillagerDef, FurnitureItem } from '@/types';
import { BUILD_PALETTE } from '@/data/buildPalette';
import { VILLAGERS } from '@/data/villagers';
import { FURNITURE } from '@/data/furniture';

const SEASON_NAMES: Record<Season, string> = {
  [Season.Spring]: 'Spring',
  [Season.Summer]: 'Summer',
  [Season.Autumn]: 'Autumn',
  [Season.Winter]: 'Winter',
};

const SUB_NAMES = ['Early', 'Mid', 'Late'];

const SEASON_COLORS: Record<Season, string> = {
  [Season.Spring]: '#7aba4a',
  [Season.Summer]: '#eaea4a',
  [Season.Autumn]: '#da8a2a',
  [Season.Winter]: '#aacaea',
};

/**
 * HUD for hedgeFriends village mode.
 * Shows time/weather, palette in build mode, villager tooltips, and messages.
 */
export class VillageHudRenderer {
  private scene: Phaser.Scene;

  // Text objects
  private seasonText: Phaser.GameObjects.Text;
  private modeText: Phaser.GameObjects.Text;
  private paletteText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private tooltipText: Phaser.GameObjects.Text;
  private infoText: Phaser.GameObjects.Text;

  // Message timer
  private messageTimer = 0;

  // Hover state
  private hoveredVillager: VillagerDef | null = null;
  private hoveredHouse: HouseState | null = null;
  private hoveredActivity: string | null = null;
  private hoveredItem: FurnitureItem | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const textStyle = {
      fontFamily: 'Courier New, monospace',
      fontSize: '14px',
      color: '#ccccaa',
    };

    this.seasonText = scene.add.text(10, 8, '', { ...textStyle })
      .setScrollFactor(0).setDepth(100);

    this.modeText = scene.add.text(10, 28, '', { ...textStyle, color: '#aaccaa' })
      .setScrollFactor(0).setDepth(100);

    this.paletteText = scene.add.text(10, 0, '', { ...textStyle, fontSize: '13px' })
      .setScrollFactor(0).setDepth(100);

    this.messageText = scene.add.text(0, 0, '', { ...textStyle, fontSize: '15px', color: '#eebb44' })
      .setScrollFactor(0).setDepth(100).setAlpha(0);

    this.tooltipText = scene.add.text(0, 0, '', { ...textStyle, fontSize: '12px', color: '#ddddbb', backgroundColor: '#1a1a14' })
      .setScrollFactor(0).setDepth(100).setAlpha(0).setPadding(4, 2, 4, 2);

    this.infoText = scene.add.text(0, 8, '', {
      ...textStyle,
      fontSize: '13px',
      wordWrap: { width: 260 },
    }).setScrollFactor(0).setDepth(100);
  }

  getAllObjects(): Phaser.GameObjects.GameObject[] {
    return [
      this.seasonText,
      this.modeText,
      this.paletteText,
      this.messageText,
      this.tooltipText,
      this.infoText,
    ];
  }

  handleClick(_screenX: number, _screenY: number): boolean {
    // For now, no clickable HUD buttons — will add save button in build mode later
    return false;
  }

  setHoveredVillager(villager: VillagerDef | null, house: HouseState | null, activity?: string | null): void {
    this.hoveredVillager = villager;
    this.hoveredHouse = house;
    this.hoveredActivity = activity ?? null;
  }

  setHoveredItem(item: FurnitureItem | null): void {
    this.hoveredItem = item;
  }

  showMessage(msg: string): void {
    this.messageText.setText(msg);
    this.messageText.setAlpha(1);
    this.messageTimer = 3000;
  }

  update(
    period: TimePeriod,
    dayHour: number,
    year: number,
    weather: Weather,
    buildCtx: Readonly<BuildModeContext>,
    houses: ReadonlyArray<HouseState>,
    mouseX: number,
    mouseY: number,
  ): void {
    const cam = this.scene.cameras.main;

    // ── Season/time display ──
    const seasonName = SEASON_NAMES[period.season];
    const subName = SUB_NAMES[period.sub];
    const hourName = DAY_HOUR_NAMES[dayHour] ?? '';
    this.seasonText.setText(`Year ${year}  ${subName} ${seasonName}  ${hourName}`);
    this.seasonText.setColor(SEASON_COLORS[period.season]);

    // ── Mode indicator ──
    const builtCount = houses.filter(h => h.phase === BuildPhase.Complete).length;
    const siteCount = houses.filter(h => h.phase === BuildPhase.SiteMarked).length;

    if (buildCtx.state === BuildModeState.Building) {
      this.modeText.setText('BUILD MODE — Q/E: item  Tab/1-6: category  WASD: move  Space: place  Enter: save  Esc: cancel');
      this.modeText.setColor('#eedd44');
    } else if (buildCtx.state === BuildModeState.ViewingInterior) {
      const house = houses.find(h => h.id === buildCtx.activeHouseId);
      const villager = house ? VILLAGERS[house.villagerId] : null;
      const name = villager?.name ?? 'Someone';
      const dayHourIdx = Math.floor(dayHour);
      const activity = villager?.dailyRoutine[dayHourIdx] ?? 'pottering about';
      this.modeText.setText(`${name}'s home — ${activity} — Esc to leave`);
      this.modeText.setColor('#ddccaa');
    } else {
      if (siteCount > 0) {
        this.modeText.setText(`hedgeFriends — ${builtCount} homes built, ${siteCount} building site${siteCount > 1 ? 's' : ''} available`);
      } else if (builtCount > 0) {
        this.modeText.setText(`hedgeFriends — ${builtCount} homes built`);
      } else {
        this.modeText.setText('hedgeFriends — waiting for villagers...');
      }
      this.modeText.setColor('#aaccaa');
    }

    // ── Palette (build mode only) ──
    if (buildCtx.state === BuildModeState.Building) {
      const cat = BUILD_PALETTE[buildCtx.selectedCategory];
      // Category tabs
      let paletteStr = '  ';
      for (let i = 0; i < BUILD_PALETTE.length; i++) {
        const c = BUILD_PALETTE[i];
        if (i === buildCtx.selectedCategory) {
          paletteStr += `[${i + 1} ${c.name}] `;
        } else {
          paletteStr += ` ${i + 1} ${c.name}  `;
        }
      }
      // Items row
      paletteStr += '\n  ';
      if (cat) {
        for (let i = 0; i < cat.items.length; i++) {
          const item = cat.items[i];
          if (i === buildCtx.selectedIndex) {
            paletteStr += ` [${item.char}] `;
          } else {
            paletteStr += `  ${item.char}  `;
          }
        }
      }
      // Cursor position + placed count
      const house = houses.find(h => h.id === buildCtx.activeHouseId);
      const placedCount = house ? house.exterior.length : 0;
      paletteStr += `      ${placedCount} placed`;

      this.paletteText.setText(paletteStr);
      this.paletteText.setY(cam.height - 55);
      this.paletteText.setAlpha(1);
    } else {
      this.paletteText.setAlpha(0);
    }

    // ── Tooltip ──
    if (this.hoveredItem && buildCtx.state === BuildModeState.ViewingInterior) {
      // Item tooltip in interior view
      const def = FURNITURE[this.hoveredItem.id];
      const name = def?.name ?? this.hoveredItem.id;
      const desc = def?.description ?? '';
      const tip = desc ? `${name} — ${desc}` : name;
      this.tooltipText.setText(tip);
      this.tooltipText.setPosition(mouseX + 12, mouseY - 20);
      this.tooltipText.setAlpha(1);
    } else if (this.hoveredVillager && this.hoveredHouse && buildCtx.state !== BuildModeState.Building) {
      let tip = `${this.hoveredVillager.name}`;
      if (this.hoveredHouse.phase === BuildPhase.Complete) {
        const activity = this.hoveredActivity
          ?? this.hoveredVillager.dailyRoutine[Math.floor(dayHour)] ?? 'pottering about';
        tip += ` — ${activity}`;
      } else if (this.hoveredHouse.phase === BuildPhase.SiteMarked) {
        tip += ' — looking for a home! (click to build)';
      } else if (this.hoveredHouse.phase === BuildPhase.Building) {
        tip += ' — waiting for you to finish!';
      }
      this.tooltipText.setText(tip);
      this.tooltipText.setPosition(mouseX + 12, mouseY - 20);
      this.tooltipText.setAlpha(1);
    } else {
      this.tooltipText.setAlpha(0);
    }

    // ── Info panel (right side) ──
    if (this.hoveredVillager && buildCtx.state !== BuildModeState.Building) {
      const v = this.hoveredVillager;
      this.infoText.setText(
        `${v.name}\n` +
        `${v.species}\n\n` +
        `${v.description}\n\n` +
        `Personality: ${['Cozy', 'Bookish', 'Culinary', 'Crafty', 'Gardener'][v.personality]}`,
      );
      this.infoText.setX(cam.width - 270);
      this.infoText.setAlpha(1);
    } else {
      this.infoText.setAlpha(0);
    }

    // ── Message fade ──
    if (this.messageTimer > 0) {
      this.messageTimer -= this.scene.game.loop.delta;
      if (this.messageTimer <= 0) {
        this.messageText.setAlpha(0);
      } else if (this.messageTimer < 500) {
        this.messageText.setAlpha(this.messageTimer / 500);
      }
      // Center message
      this.messageText.setX(cam.width / 2 - this.messageText.width / 2);
      this.messageText.setY(cam.height / 2 - 40);
    }
  }
}
