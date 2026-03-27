import Phaser from 'phaser';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { GRID_CONFIG, LAYER_CONFIGS } from '@/types';
import { TimeClock } from '@/simulation/TimeClock';
import { EnergyManager } from '@/simulation/EnergyManager';
import { GrowthSimulator } from '@/simulation/GrowthSimulator';
import { SoilMap } from '@/simulation/SoilMap';
import { PlantRenderer } from '@/simulation/PlantRenderer';
import { WeatherEngine } from '@/simulation/WeatherEngine';
import { HudRenderer } from '@/ui/HudRenderer';
import { SPECIES_LIST } from '@/data/species';
import type { PlantState } from '@/types';

export class GameScene extends Phaser.Scene {
  private asciiRenderer!: AsciiRenderer;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  // Simulation
  private timeClock!: TimeClock;
  private energyManager!: EnergyManager;
  private growthSim!: GrowthSimulator;
  private plantRenderer!: PlantRenderer;
  private weatherEngine!: WeatherEngine;
  private hudRenderer!: HudRenderer;
  private selectedSpeciesIndex = 0;

  // Mouse hover state
  private hoveredPlant: PlantState | null = null;
  private mouseScreenX = 0;
  private mouseScreenY = 0;

  /** Ground surface row — cursor is locked here */
  private readonly groundRow = LAYER_CONFIGS[4].startRow;

  /** Underground layer config */
  private readonly undergroundConfig = LAYER_CONFIGS[5];

  /** Sky layer config */
  private readonly skyConfig = LAYER_CONFIGS[0];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.asciiRenderer = new AsciiRenderer(this);

    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = this.asciiRenderer.getWorldHeight();

    // Set world bounds and camera
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Start camera centered on the ground layer
    const groundStart = this.groundRow * GRID_CONFIG.cellHeight;
    this.cameras.main.scrollX = worldWidth / 2 - this.cameras.main.width / 2;
    this.cameras.main.scrollY = groundStart - this.cameras.main.height / 3;

    // Place cursor on ground row, centered
    this.asciiRenderer.setCursor(Math.floor(GRID_CONFIG.cols / 2), this.groundRow);

    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Key events
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event);
    });

    // Mouse/touch drag for camera panning
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.cameraStartX = this.cameras.main.scrollX;
      this.cameraStartY = this.cameras.main.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      // Track mouse screen position for tooltip
      this.mouseScreenX = pointer.x;
      this.mouseScreenY = pointer.y;

      // Update hovered plant based on world position
      const col = Math.floor(pointer.worldX / GRID_CONFIG.cellWidth);
      const row = Math.floor(pointer.worldY / GRID_CONFIG.cellHeight);
      if (col >= 0 && col < GRID_CONFIG.cols && row >= 0 && row < GRID_CONFIG.rows) {
        this.hoveredPlant = this.growthSim.getPlantAtCell(col, row);
      } else {
        this.hoveredPlant = null;
      }

      if (!this.isDragging) return;
      const dx = this.dragStartX - pointer.x;
      const dy = this.dragStartY - pointer.y;
      this.cameras.main.scrollX = this.cameraStartX + dx;
      this.cameras.main.scrollY = this.cameraStartY + dy;
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Click to move cursor (horizontal only, stays on ground row)
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = Math.abs(pointer.x - this.dragStartX);
      const dy = Math.abs(pointer.y - this.dragStartY);
      if (dx < 5 && dy < 5) {
        const worldX = pointer.worldX;
        const col = Math.floor(worldX / GRID_CONFIG.cellWidth);
        if (col >= 0 && col < GRID_CONFIG.cols) {
          this.asciiRenderer.setCursor(col, this.groundRow);
        }
      }
    });

    // Initialize simulation systems
    const soilMap = new SoilMap(GRID_CONFIG.cols, this.groundRow, GRID_CONFIG.rows);
    this.timeClock = new TimeClock();
    this.energyManager = new EnergyManager();
    this.growthSim = new GrowthSimulator(soilMap);
    this.plantRenderer = new PlantRenderer(this.asciiRenderer);
    this.weatherEngine = new WeatherEngine(this.asciiRenderer);
    this.hudRenderer = new HudRenderer(this);

    // Add decorative elements after systems init
    this.addGroundDecoration(soilMap);
  }

  update(_time: number, delta: number): void {
    // Camera scrolling with arrow keys
    const scrollSpeed = 5;
    if (this.cursors.left.isDown) {
      this.cameras.main.scrollX -= scrollSpeed;
    }
    if (this.cursors.right.isDown) {
      this.cameras.main.scrollX += scrollSpeed;
    }
    if (this.cursors.up.isDown) {
      this.cameras.main.scrollY -= scrollSpeed;
    }
    if (this.cursors.down.isDown) {
      this.cameras.main.scrollY += scrollSpeed;
    }

    // Advance time
    if (this.timeClock.tick(delta)) {
      const period = this.timeClock.getCurrentPeriod();
      const moon = this.timeClock.getMoonPhase();
      this.energyManager.onPeriodAdvance(period, moon);
      this.growthSim.onPeriodAdvance(period);
      this.weatherEngine.onPeriodAdvance(period);
      this.plantRenderer.renderPlants(this.growthSim.getPlants());
    }

    // Animate weather in sky
    this.weatherEngine.updateSkyOverlays(delta);

    // Update HUD
    const period = this.timeClock.getCurrentPeriod();
    const moon = this.timeClock.getMoonPhase();
    const selected = SPECIES_LIST[this.selectedSpeciesIndex] ?? null;
    this.hudRenderer.update(
      this.timeClock.getSeasonName(),
      this.timeClock.getSubSeasonName(),
      this.timeClock.getMoonSymbol(),
      this.timeClock.getMoonPhaseName(),
      period,
      moon,
      this.energyManager.getEnergy(),
      selected,
      this.selectedSpeciesIndex,
      delta,
      SPECIES_LIST,
      this.hoveredPlant,
      this.mouseScreenX,
      this.mouseScreenY,
      this.weatherEngine.getWeatherName(),
    );

    this.asciiRenderer.update(delta);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const col = this.asciiRenderer.getCursorCol();

    switch (event.key) {
      // Cursor movement — horizontal only, locked to ground row
      case 'a': case 'A':
        if (col > 0) this.asciiRenderer.setCursor(col - 1, this.groundRow);
        break;
      case 'd': case 'D':
        if (col < GRID_CONFIG.cols - 1) this.asciiRenderer.setCursor(col + 1, this.groundRow);
        break;

      // Species selection (1-6)
      case '1': case '2': case '3': case '4': case '5': case '6':
        this.selectedSpeciesIndex = parseInt(event.key) - 1;
        break;

      // Plant action
      case ' ':
      case 'Enter':
        this.tryPlant();
        break;
    }
  }

  private tryPlant(): void {
    const col = this.asciiRenderer.getCursorCol();

    // Check column not occupied
    if (this.growthSim.isColumnOccupied(col)) {
      this.hudRenderer.showMessage('Something is already planted here');
      return;
    }

    const species = SPECIES_LIST[this.selectedSpeciesIndex];
    if (!species) return;

    // Check plantable season
    const period = this.timeClock.getCurrentPeriod();
    if (!species.plantableSeasons.includes(period.season)) {
      this.hudRenderer.showMessage(
        `${species.name} can't be planted in ${this.timeClock.getSeasonName()}`
      );
      return;
    }

    // Check energy
    if (!this.energyManager.spend(species.energyCost)) {
      this.hudRenderer.showMessage(`Not enough energy (need ${species.energyCost})`);
      return;
    }

    // Plant it
    this.growthSim.addPlant(species.id, col, this.groundRow, this.timeClock.getTotalPeriods());
    this.plantRenderer.renderPlants(this.growthSim.getPlants());
    this.hudRenderer.showMessage(`Planted ${species.name}!`);
  }

  /** Add ground-level decoration: grass tufts, soil texture, rocks */
  private addGroundDecoration(soilMap: SoilMap): void {
    const groundGlyphs = [
      { char: '"', fg: '#7aba4a' },
      { char: "'", fg: '#6aaa3a' },
      { char: ',', fg: '#8aca5a' },
      { char: '`', fg: '#7aba4a' },
      { char: '"', fg: '#5a9a2a' },
    ];

    // Scatter grass on ground row
    for (let col = 0; col < GRID_CONFIG.cols; col++) {
      if (Math.random() < 0.6) {
        const g = groundGlyphs[Math.floor(Math.random() * groundGlyphs.length)];
        this.asciiRenderer.setOverlay(col, this.groundRow, g);
      }
    }

    // Underground: soil-aware decoration using SoilMap data
    const ugStart = this.undergroundConfig.startRow;
    const ugEnd = this.undergroundConfig.endRow;
    for (let col = 0; col < GRID_CONFIG.cols; col++) {
      for (let row = ugStart; row <= ugEnd; row++) {
        const cell = soilMap.getSoilAt(col, row);

        // Place rock overlays in rocky areas
        if (cell.rockDensity > 0.7 && Math.random() < 0.15) {
          const rockChars = ['O', '@', '#'];
          const ch = rockChars[Math.floor(Math.random() * rockChars.length)];
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg: '#6a6a70' });
        } else if (cell.rockDensity > 0.4 && Math.random() < 0.08) {
          this.asciiRenderer.setOverlay(col, row, { char: 'o', fg: '#5a5a60' });
        }

        // Fertile topsoil gets organic overlays
        if (cell.fertility > 0.8 && Math.random() < 0.06) {
          const fertChars = ['%', 'w', '~'];
          const ch = fertChars[Math.floor(Math.random() * fertChars.length)];
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg: '#6a5a30' });
        }
      }
    }

    // Sky — occasional stars/clouds
    for (let col = 0; col < GRID_CONFIG.cols; col++) {
      for (let row = this.skyConfig.startRow; row <= this.skyConfig.endRow; row++) {
        if (Math.random() < 0.02) {
          this.asciiRenderer.setOverlay(col, row, { char: '*', fg: '#9a9abe' });
        } else if (Math.random() < 0.01) {
          this.asciiRenderer.setOverlay(col, row, { char: '~', fg: '#5a5a7a' });
        }
      }
    }
  }
}
