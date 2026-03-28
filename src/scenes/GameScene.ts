import Phaser from 'phaser';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { GRID_CONFIG, LAYER_CONFIGS, ViewMode } from '@/types';
import { TimeClock } from '@/simulation/TimeClock';
import { EnergyManager } from '@/simulation/EnergyManager';
import { GrowthSimulator } from '@/simulation/GrowthSimulator';
import { SoilMap } from '@/simulation/SoilMap';
import { PlantRenderer } from '@/simulation/PlantRenderer';
import { WeatherEngine } from '@/simulation/WeatherEngine';
import { HabitatScorer } from '@/simulation/HabitatScorer';
import { CreatureSimulator } from '@/simulation/CreatureSimulator';
import { CreatureRenderer } from '@/simulation/CreatureRenderer';
import { HudRenderer } from '@/ui/HudRenderer';
import { BiodiversityTracker } from '@/simulation/BiodiversityTracker';
import { SaveManager } from '@/simulation/SaveManager';
import { SPECIES_LIST } from '@/data/species';
import { saveHighScore } from '@/scenes/SplashScene';
import type { PlantState, CreatureState, SaveData } from '@/types';

/** Auto-save every 12 periods (1 full year) */
const AUTO_SAVE_INTERVAL = 12;

/** Deterministic hash for boulder/aquifer placement */
function hash(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h & 0x7fffffff) / 0x7fffffff;
}

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
  private habitatScorer!: HabitatScorer;
  private creatureSim!: CreatureSimulator;
  private creatureRenderer!: CreatureRenderer;
  private hudRenderer!: HudRenderer;
  private biodiversityTracker!: BiodiversityTracker;
  private saveManager!: SaveManager;
  private selectedSpeciesIndex = 0;

  // Mouse hover state
  private hoveredPlant: PlantState | null = null;
  private hoveredCreature: CreatureState | null = null;
  private mouseScreenX = 0;
  private mouseScreenY = 0;

  /** Ground surface row — cursor is locked here */
  private readonly groundRow = LAYER_CONFIGS[4].startRow;

  /** Underground layer config */
  private readonly undergroundConfig = LAYER_CONFIGS[5];

  /** Sky layer config */
  private readonly skyConfig = LAYER_CONFIGS[0];

  /** Current view mode */
  private viewMode = ViewMode.Hedge;

  /** Player name from splash screen */
  private playerName = 'Player';

  /** Dedicated HUD camera that ignores zoom */
  private hudCamera!: Phaser.Cameras.Scene2D.Camera;

  /** Track total periods for auto-save timing */
  private lastSavePeriod = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerName?: string; loadSave?: SaveData }): void {
    this.playerName = data?.playerName || 'Player';
  }

  create(): void {
    this.asciiRenderer = new AsciiRenderer(this);

    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = this.asciiRenderer.getWorldHeight();

    // Set initial camera position (horizontal center), then apply view mode bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.scrollX = worldWidth / 2 - this.cameras.main.width / 2;

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
        this.hoveredCreature = this.creatureSim.getCreatureAtCell(col, row);
        this.hoveredPlant = this.hoveredCreature ? null : this.growthSim.getPlantAtCell(col, row);
      } else {
        this.hoveredPlant = null;
        this.hoveredCreature = null;
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
    this.habitatScorer = new HabitatScorer();
    this.creatureSim = new CreatureSimulator(this.habitatScorer);
    this.creatureRenderer = new CreatureRenderer(this.asciiRenderer);
    this.biodiversityTracker = new BiodiversityTracker();
    this.saveManager = new SaveManager();
    this.hudRenderer = new HudRenderer(this);

    // Create a separate HUD camera that ignores zoom/scroll
    // Main camera ignores HUD elements, HUD camera ignores the game world
    this.hudCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.hudCamera.setScroll(0, 0);

    // Main camera should not render HUD objects
    const hudObjects = this.hudRenderer.getAllObjects();
    this.cameras.main.ignore(hudObjects);

    // HUD camera should only render HUD objects — ignore the game world image
    this.hudCamera.ignore(this.asciiRenderer.getImage());

    // Set initial environment
    const initPeriod = this.timeClock.getCurrentPeriod();
    this.asciiRenderer.setEnvironment(initPeriod.season, this.weatherEngine.getCurrentWeather());

    // Add decorative elements after systems init
    this.addGroundDecoration(soilMap);

    // Check for save data passed via init
    const initData = this.scene.settings.data as { loadSave?: SaveData } | undefined;
    if (initData?.loadSave) {
      this.applySaveData(initData.loadSave);
    }

    // Apply initial view mode (Hedge view by default)
    this.applyViewMode();
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
      this.growthSim.onPeriodAdvance(period, this.weatherEngine.getCurrentWeather());
      this.weatherEngine.onPeriodAdvance(period);
      this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
      // Tick creature spawning/habitat check
      this.creatureSim.onPeriodAdvance(period, this.growthSim.getPlants());
      // Update environment tints when season/weather changes
      this.asciiRenderer.setEnvironment(period.season, this.weatherEngine.getCurrentWeather());
      // Check biodiversity milestones
      const newMilestones = this.biodiversityTracker.checkMilestones(
        this.growthSim.getPlants(),
        this.creatureSim.getUniqueSpeciesCount(),
        this.creatureSim.getTotalCount(),
        this.timeClock.getTotalPeriods(),
        this.habitatScorer.getOccupiedLayerCount(),
        this.creatureSim.getUniqueSpeciesIds(),
        this.growthSim.getDeadPlantCount(),
      );
      if (newMilestones.length > 0) {
        this.hudRenderer.showMilestoneToasts(newMilestones);
      }

      // Auto-save every year
      const totalPeriods = this.timeClock.getTotalPeriods();
      if (totalPeriods > 0 && totalPeriods - this.lastSavePeriod >= AUTO_SAVE_INTERVAL) {
        this.lastSavePeriod = totalPeriods;
        this.saveManager.autoSave(this.buildSaveData());
      }
    }

    // Animate weather in sky
    this.weatherEngine.updateSkyOverlays(delta);

    // Animate creatures (movement + animation frames)
    this.creatureSim.updateCreatures(delta);
    this.creatureRenderer.renderCreatures(this.creatureSim.getCreatures());

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
      this.hoveredCreature,
      this.mouseScreenX,
      this.mouseScreenY,
      this.weatherEngine.getWeatherName(),
      this.creatureSim.getUniqueSpeciesCount(),
      this.creatureSim.getTotalCount(),
      this.biodiversityTracker.getScore(),
      this.biodiversityTracker.getAchievedCount(),
      this.biodiversityTracker.getTotalMilestoneCount(),
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

      // Milestone log
      case 'm': case 'M':
        this.hudRenderer.toggleMilestoneOverlay(this.biodiversityTracker);
        break;

      // Cycle view mode
      case 'v': case 'V':
        this.cycleViewMode();
        break;

      // Restart game
      case 'r': case 'R':
        this.restartGame();
        break;

      // Save
      case 's': case 'S':
        this.manualSave();
        break;

      // Load
      case 'l': case 'L':
        this.manualLoad();
        break;

      // Export JSON
      case 'e': case 'E':
        this.exportSave();
        break;

      // Import JSON
      case 'i': case 'I':
        this.importSave();
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
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), this.timeClock.getCurrentPeriod().season);
    this.hudRenderer.showMessage(`Planted ${species.name}!`);
  }

  private restartGame(): void {
    // Save current score before restarting
    const plants = this.growthSim.getPlants();
    saveHighScore({
      name: this.playerName,
      plants: plants.length,
      creatures: this.creatureSim.getTotalCount(),
      periods: this.timeClock.getTotalPeriods(),
      score: this.biodiversityTracker.getScore(),
    });
    this.scene.start('SplashScene');
  }

  private cycleViewMode(): void {
    this.viewMode = (this.viewMode + 1) % 3 as ViewMode;
    this.applyViewMode();
    const names = ['Hedge', 'Underground', 'Full'];
    this.hudRenderer.showMessage(`View: ${names[this.viewMode]}  [V to cycle]`);
  }

  private applyViewMode(): void {
    const cam = this.cameras.main;
    const worldWidth = this.asciiRenderer.getWorldWidth();
    const ch = GRID_CONFIG.cellHeight;

    // Ground row is the boundary between above/below
    const groundBottom = (this.groundRow + 1) * ch;

    switch (this.viewMode) {
      case ViewMode.Hedge: {
        // Sky through ground — zoom so this zone fills the viewport height
        const zoneHeight = groundBottom;
        cam.setZoom(cam.height / zoneHeight);
        cam.setBounds(0, 0, worldWidth, zoneHeight);
        cam.scrollY = 0;
        break;
      }
      case ViewMode.Underground: {
        // Ground through bedrock
        const top = this.groundRow * ch;
        const zoneHeight = GRID_CONFIG.rows * ch - top;
        cam.setZoom(cam.height / zoneHeight);
        cam.setBounds(0, top, worldWidth, zoneHeight);
        cam.scrollY = top;
        break;
      }
      case ViewMode.Full: {
        // Everything — zoom to fit full world height
        const totalHeight = GRID_CONFIG.rows * ch;
        cam.setZoom(cam.height / totalHeight);
        cam.setBounds(0, 0, worldWidth, totalHeight);
        cam.scrollY = 0;
        break;
      }
    }
  }

  // ── Save/Load ──

  private buildSaveData(): Omit<SaveData, 'version' | 'timestamp'> {
    const clockState = this.timeClock.getState();
    const creatureState = this.creatureSim.getSerializableState();
    return {
      playerName: this.playerName,
      periodIndex: clockState.periodIndex,
      tickAccumulator: clockState.tickAccumulator,
      energy: this.energyManager.getEnergy(),
      plants: [...this.growthSim.getPlants()],
      creatures: creatureState.creatures,
      creatureSpawnCounts: creatureState.spawnCounts,
      creatureNextId: creatureState.nextId,
      achievedMilestoneIds: [...this.biodiversityTracker.getAchievedIds()],
      creaturePeriods: this.biodiversityTracker.getCreaturePeriods(),
      deadPlantCount: this.growthSim.getDeadPlantCount(),
      currentWeather: this.weatherEngine.getCurrentWeather(),
      selectedSpeciesIndex: this.selectedSpeciesIndex,
      viewMode: this.viewMode,
    };
  }

  private applySaveData(save: SaveData): void {
    this.playerName = save.playerName;
    this.timeClock.loadState(save.periodIndex, save.tickAccumulator);
    this.energyManager.setEnergy(save.energy);
    this.growthSim.loadState(save.plants, save.deadPlantCount);
    this.creatureSim.loadState(save.creatures, save.creatureSpawnCounts, save.creatureNextId);
    this.biodiversityTracker.loadState(save.achievedMilestoneIds, save.creaturePeriods);
    this.weatherEngine.setWeather(save.currentWeather);
    this.selectedSpeciesIndex = save.selectedSpeciesIndex ?? 0;
    this.viewMode = save.viewMode ?? ViewMode.Hedge;

    // Re-render plants and environment
    const period = this.timeClock.getCurrentPeriod();
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
    this.asciiRenderer.setEnvironment(period.season, this.weatherEngine.getCurrentWeather());
    this.lastSavePeriod = this.timeClock.getTotalPeriods();
  }

  private manualSave(): void {
    this.saveManager.autoSave(this.buildSaveData());
    this.lastSavePeriod = this.timeClock.getTotalPeriods();
    this.hudRenderer.showMessage('Game saved');
  }

  private manualLoad(): void {
    const save = this.saveManager.loadAutoSave();
    if (!save) {
      this.hudRenderer.showMessage('No save found');
      return;
    }
    // Restart scene with save data
    this.scene.start('GameScene', { playerName: this.playerName, loadSave: save });
  }

  private exportSave(): void {
    this.saveManager.downloadSave(this.buildSaveData());
    this.hudRenderer.showMessage('Save exported');
  }

  private async importSave(): Promise<void> {
    const save = await this.saveManager.promptImport();
    if (!save) {
      this.hudRenderer.showMessage('Import cancelled or invalid file');
      return;
    }
    // Restart scene with imported save
    this.scene.start('GameScene', { playerName: save.playerName || this.playerName, loadSave: save });
  }

  /** Add ground-level decoration: grass tufts, soil texture, rocks, boulders, aquifers */
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

    const ugStart = this.undergroundConfig.startRow;
    const ugEnd = this.undergroundConfig.endRow;

    // Underground: soil-aware decoration using SoilMap data
    for (let col = 0; col < GRID_CONFIG.cols; col++) {
      for (let row = ugStart; row <= ugEnd; row++) {
        const cell = soilMap.getSoilAt(col, row);

        // Place rock overlays in rocky areas
        if (cell.rockDensity > 0.7 && Math.random() < 0.15) {
          const rockChars = ['O', '@', '#'];
          const ch = rockChars[Math.floor(Math.random() * rockChars.length)];
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg: '#4a4a52' });
        } else if (cell.rockDensity > 0.4 && Math.random() < 0.08) {
          this.asciiRenderer.setOverlay(col, row, { char: 'o', fg: '#3a3a42' });
        }

        // Fertile topsoil gets organic overlays
        if (cell.fertility > 0.8 && Math.random() < 0.06) {
          const fertChars = ['%', 'w', '~'];
          const ch = fertChars[Math.floor(Math.random() * fertChars.length)];
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg: '#4a3a1a' });
        }
      }
    }

    // Large boulders — multi-cell grey rock formations
    // this.addBoulders(soilMap, ugStart, ugEnd);

    // Underground water aquifers — sinusoidal blue veins
    // this.addAquifers(ugStart, ugEnd);

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

  /** Place large multi-cell boulder formations in the underground */
  private addBoulders(soilMap: SoilMap, ugStart: number, ugEnd: number): void {
    const cols = GRID_CONFIG.cols;

    // Boulder templates: arrays of [colOff, rowOff, char]
    const boulderTemplates: Array<Array<[number, number, string]>> = [
      // Large rounded boulder (5 cells)
      [[-1, 0, '('], [0, 0, 'O'], [1, 0, ')'], [0, -1, '_'], [0, 1, '-']],
      // Wide flat boulder (6 cells)
      [[-2, 0, '('], [-1, 0, '='], [0, 0, 'O'], [1, 0, '='], [2, 0, ')'], [0, -1, '_']],
      // Tall boulder (4 cells)
      [[0, 0, 'O'], [0, -1, 'O'], [-1, 0, '('], [1, 0, ')']],
      // Cluster (7 cells)
      [[0, 0, '@'], [-1, 0, 'O'], [1, 0, 'O'], [0, -1, 'O'], [-1, -1, '('], [1, -1, ')'], [0, 1, '_']],
      // Small boulder (3 cells)
      [[-1, 0, '('], [0, 0, 'O'], [1, 0, ')']],
    ];

    const boulderColors = ['#5a5a66', '#6a6a72', '#505060', '#585868', '#626270'];

    // Seed boulders using deterministic hash — ~1 every 15-25 cols
    for (let col = 5; col < cols - 5; col++) {
      // Check multiple depth zones for boulder placement
      for (let depthZone = 0; depthZone < 3; depthZone++) {
        const baseRow = ugStart + 4 + depthZone * 10;
        if (baseRow > ugEnd - 2) continue;

        const h = hash(col, baseRow + depthZone * 1000);
        if (h > 0.06) continue; // ~6% chance per col per zone

        // Pick template and position
        const row = baseRow + Math.floor(hash(col + 1, baseRow) * 6) - 3;
        if (row < ugStart + 1 || row > ugEnd - 1) continue;

        // Only place in rocky areas
        const cell = soilMap.getSoilAt(col, row);
        if (cell.rockDensity < 0.3) continue;

        const templateIdx = Math.floor(hash(col + 2, row) * boulderTemplates.length);
        const template = boulderTemplates[templateIdx];
        const colorIdx = Math.floor(hash(col + 3, row) * boulderColors.length);
        const baseColor = boulderColors[colorIdx];

        for (const [cOff, rOff, ch] of template) {
          const bc = col + cOff;
          const br = row + rOff;
          if (bc < 0 || bc >= cols || br < ugStart || br > ugEnd) continue;
          // Slightly vary brightness per cell
          const bright = hash(bc, br) * 0.15;
          const r = parseInt(baseColor.substring(1, 3), 16);
          const g = parseInt(baseColor.substring(3, 5), 16);
          const b = parseInt(baseColor.substring(5, 7), 16);
          const nr = Math.min(255, Math.round(r + bright * 40));
          const ng = Math.min(255, Math.round(g + bright * 40));
          const nb = Math.min(255, Math.round(b + bright * 40));
          const fg = '#' + ((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, '0');
          this.asciiRenderer.setOverlay(bc, br, { char: ch, fg, bg: '#1a1a22' });
        }
      }
    }
  }

  /** Place sinusoidal water aquifer veins through the underground */
  private addAquifers(ugStart: number, ugEnd: number): void {
    const cols = GRID_CONFIG.cols;

    // Aquifer definitions: centerRow, amplitude, frequency, width, color
    const aquifers = [
      { centerRow: ugStart + 10, amp: 2.5, freq: 0.04, width: 2, fg: '#2a4a6a', fgBright: '#3a6a8a' },
      { centerRow: ugStart + 22, amp: 3, freq: 0.03, width: 3, fg: '#1a3a5a', fgBright: '#2a5a7a' },
      { centerRow: ugStart + 8, amp: 1.5, freq: 0.06, width: 1, fg: '#2a4a6a', fgBright: '#3a5a7a' },
    ];

    const waterChars = ['~', '\u2248', '.', '-', '~'];

    for (const aq of aquifers) {
      for (let col = 0; col < cols; col++) {
        const waveY = aq.centerRow + Math.sin(col * aq.freq + aq.amp) * aq.amp;

        for (let w = -aq.width; w <= aq.width; w++) {
          const row = Math.round(waveY + w);
          if (row < ugStart || row > ugEnd) continue;

          // Density falls off from center of vein
          const distFromCenter = Math.abs(w) / (aq.width + 1);
          const density = 0.6 - distFromCenter * 0.4;
          if (hash(col * 3 + w, row * 7) > density) continue;

          const ch = waterChars[Math.floor(hash(col, row + w * 100) * waterChars.length)];
          const isCenter = Math.abs(w) <= 1;
          const fg = isCenter ? aq.fgBright : aq.fg;
          const bg = '#101828';
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg, bg });
        }
      }
    }
  }
}
