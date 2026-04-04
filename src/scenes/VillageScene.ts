import Phaser from 'phaser';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { GRID_CONFIG, BuildModeState, BuildPhase, GrowthStage } from '@/types';
import { TimeClock } from '@/simulation/TimeClock';
import { WeatherEngine } from '@/simulation/WeatherEngine';
import { StarMap } from '@/simulation/StarMap';
import { TerrainMap } from '@/simulation/TerrainMap';
import { SoilMap } from '@/simulation/SoilMap';
import { GrowthSimulator } from '@/simulation/GrowthSimulator';
import { PlantRenderer } from '@/simulation/PlantRenderer';
import { BuildingManager } from '@/village/BuildingManager';
import { BuildingRenderer } from '@/village/BuildingRenderer';
import { BuildModeController } from '@/village/BuildModeController';
import { VillagerSimulator } from '@/village/VillagerSimulator';
import { VillagerRenderer } from '@/village/VillagerRenderer';
import { VillageHudRenderer } from '@/ui/VillageHudRenderer';
import { BuildPanelUI } from '@/ui/BuildPanelUI';
import { VILLAGER_LIST } from '@/data/villagers';
import { SPECIES_LIST } from '@/data/species';
import type { HouseState, BuildModeContext, BuildingCell } from '@/types';

/**
 * hedgeFriends — Cozy village mode.
 *
 * Creatures build homes in the hedge. The player designs house exteriors
 * using ASCII glyphs, interiors are generated, and villagers go about
 * their daily routines visiting each other.
 */
export class VillageScene extends Phaser.Scene {
  private asciiRenderer!: AsciiRenderer;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  // Drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cameraStartX = 0;
  private cameraStartY = 0;

  // Infrastructure
  private timeClock!: TimeClock;
  private weatherEngine!: WeatherEngine;
  private starMap!: StarMap;
  private terrainMap!: TerrainMap;
  private soilMap!: SoilMap;
  private growthSim!: GrowthSimulator;
  private plantRenderer!: PlantRenderer;

  // Village systems
  private buildingManager!: BuildingManager;
  private buildingRenderer!: BuildingRenderer;
  private buildMode!: BuildModeController;
  private villagerSim!: VillagerSimulator;
  private villagerRenderer!: VillagerRenderer;
  private hudRenderer!: VillageHudRenderer;
  private buildPanel!: BuildPanelUI;

  // Track hour changes for villager routines
  private lastHourIndex = -1;

  // HUD camera
  private hudCamera!: Phaser.Cameras.Scene2D.Camera;

  // Seeds
  private terrainSeed = 0;
  private starSeed = 0;

  // Mouse state
  private mouseScreenX = 0;
  private mouseScreenY = 0;

  // Zoom state for transitions
  private savedZoom = 1;
  private savedScrollX = 0;
  private savedScrollY = 0;

  // Villager arrival queue
  private nextVillagerIndex = 0;
  private villagerArrivalTimer = 0;

  // Edit mode state
  private isEditingExisting = false;
  private exteriorBackup: BuildingCell[] | null = null;

  constructor() {
    super({ key: 'VillageScene' });
  }

  create(): void {
    // ── Renderer ──
    this.asciiRenderer = new AsciiRenderer(this);
    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = this.asciiRenderer.getWorldHeight();

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.scrollX = worldWidth / 2 - this.cameras.main.width / 2;

    // ── Input ──
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => this.handleKeyDown(event));

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.isDragging = true;
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.cameraStartX = this.cameras.main.scrollX;
      this.cameraStartY = this.cameras.main.scrollY;
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.mouseScreenX = pointer.x;
      this.mouseScreenY = pointer.y;

      // Update hover state
      const col = Math.floor(pointer.worldX / GRID_CONFIG.cellWidth);
      const row = Math.floor(pointer.worldY / GRID_CONFIG.cellHeight);
      if (col >= 0 && col < GRID_CONFIG.cols && row >= 0 && row < GRID_CONFIG.rows) {
        this.updateHoverState(col, row);
      }

      if (!this.isDragging) return;
      // Don't pan camera while in build mode
      if (this.buildMode.getState() === BuildModeState.Building) return;

      const dx = this.dragStartX - pointer.x;
      const dy = this.dragStartY - pointer.y;
      this.cameras.main.scrollX = this.cameraStartX + dx;
      this.cameras.main.scrollY = this.cameraStartY + dy;
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = Math.abs(pointer.x - this.dragStartX);
      const dy = Math.abs(pointer.y - this.dragStartY);
      this.isDragging = false;

      if (dx < 5 && dy < 5) {
        // It's a click
        if (this.hudRenderer.handleClick(pointer.x, pointer.y)) return;
        this.handleWorldClick(pointer);
      }
    });

    // ── Terrain ──
    this.terrainSeed = (Date.now() ^ Math.floor(Math.random() * 0x100000000)) | 0;
    this.terrainMap = TerrainMap.generate(this.terrainSeed);
    this.soilMap = new SoilMap(GRID_CONFIG.cols, GRID_CONFIG.rows, this.terrainMap);

    // Push terrain into renderer
    {
      const gRows: number[] = [];
      const biomes: number[] = [];
      for (let c = 0; c < GRID_CONFIG.cols; c++) {
        gRows.push(this.terrainMap.getGroundRow(c));
        biomes.push(this.terrainMap.getBiome(c));
      }
      this.asciiRenderer.setTerrainData(gRows, biomes);
    }

    // ── Simulation ──
    this.timeClock = new TimeClock();
    this.growthSim = new GrowthSimulator(this.soilMap);
    this.plantRenderer = new PlantRenderer(this.asciiRenderer);
    this.weatherEngine = new WeatherEngine(this.asciiRenderer);
    this.starSeed = (Date.now() ^ Math.floor(Math.random() * 0x100000000)) | 0;
    this.starMap = new StarMap(this.asciiRenderer, this.starSeed);

    // ── Village systems ──
    this.buildingManager = new BuildingManager(this.terrainMap);
    this.buildingRenderer = new BuildingRenderer(this.asciiRenderer);
    this.buildMode = new BuildModeController();
    this.villagerSim = new VillagerSimulator();
    this.villagerRenderer = new VillagerRenderer(this.asciiRenderer);
    this.hudRenderer = new VillageHudRenderer(this);
    this.buildPanel = new BuildPanelUI({
      onBrushChanged: (glyph) => {
        this.buildMode.setSelectedGlyph(glyph);
      },
      onSave: () => {
        const ctx = this.buildMode.getContext();
        const house = ctx.activeHouseId !== null ? this.buildingManager.getHouse(ctx.activeHouseId) : null;
        if (house) this.finishBuilding(house);
      },
      onCancel: () => {
        this.cancelBuildMode();
      },
    });

    // ── HUD camera (ignores zoom) ──
    this.hudCamera = this.cameras.add(0, 0, this.cameras.main.width, this.cameras.main.height);
    this.hudCamera.setScroll(0, 0);
    const hudObjects = this.hudRenderer.getAllObjects();
    this.cameras.main.ignore(hudObjects);
    this.hudCamera.ignore(this.asciiRenderer.getImage());

    // ── Set initial environment ──
    const initPeriod = this.timeClock.getCurrentPeriod();
    this.asciiRenderer.setEnvironment(initPeriod.season, this.weatherEngine.getCurrentWeather());

    // ── Pre-plant a mature hedge ──
    this.prePlantHedge();

    // ── Terrain decoration ──
    this.addTerrainDecoration();

    // ── Apply initial view ──
    this.applyHedgeView();

    // ── Queue first villager ──
    this.nextVillagerIndex = 0;
    this.villagerArrivalTimer = 2000; // first villager arrives after 2s
  }

  update(_time: number, delta: number): void {
    // ── Camera pan (only in browsing mode) ──
    if (this.buildMode.getState() === BuildModeState.Browsing) {
      const speed = 5;
      if (this.cursors.left.isDown)  this.cameras.main.scrollX -= speed;
      if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
      if (this.cursors.up.isDown)    this.cameras.main.scrollY -= speed;
      if (this.cursors.down.isDown)  this.cameras.main.scrollY += speed;
    }

    // ── Time ──
    const periodAdvanced = this.timeClock.tick(delta);
    if (periodAdvanced) {
      const period = this.timeClock.getCurrentPeriod();
      const weather = this.weatherEngine.getCurrentWeather();
      this.weatherEngine.onPeriodAdvance(period);
      this.growthSim.onPeriodAdvance(period, weather);
      this.starMap.setWeather(weather);
      this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
      this.asciiRenderer.setEnvironment(period.season, weather);
    }

    // ── Period-level villager updates ──
    if (periodAdvanced) {
      this.villagerSim.cyclePossessions(
        this.buildingManager.getHouses() as HouseState[],
      );
    }

    // ── Animations (every frame) ──
    this.weatherEngine.updateSkyOverlays(delta);
    this.starMap.update(delta, this.timeClock.getPeriodProgress());

    // ── Timing ──
    const currentPeriod = this.timeClock.getCurrentPeriod();
    const dayHour = this.timeClock.getDayHourIndex();

    // ── Villager hour changes ──
    if (dayHour !== this.lastHourIndex) {
      this.lastHourIndex = dayHour;
      this.villagerSim.onHourChange(dayHour, this.buildingManager.getHouses());
    }

    // ── Villager movement animation ──
    this.villagerSim.updateVillagers(delta, this.buildingManager.getHouses());
    this.villagerRenderer.render(this.villagerSim.getVillagers());

    // ── Villager arrivals ──
    if (this.nextVillagerIndex < VILLAGER_LIST.length) {
      this.villagerArrivalTimer -= delta;
      if (this.villagerArrivalTimer <= 0) {
        this.spawnNextVillager();
        this.villagerArrivalTimer = 8000; // 8s between arrivals
      }
    }

    // ── Re-render buildings ──
    this.buildingRenderer.render(
      this.buildingManager.getHouses(),
      this.buildMode.getContext(),
      currentPeriod.season,
      dayHour,
      this.villagerSim.getVillagers(),
      delta,
    );

    // ── HUD ──
    this.hudRenderer.update(
      currentPeriod,
      dayHour,
      this.timeClock.getYear(),
      this.weatherEngine.getCurrentWeather(),
      this.buildMode.getContext(),
      this.buildingManager.getHouses(),
      this.mouseScreenX,
      this.mouseScreenY,
    );

    // ── Renderer ──
    this.asciiRenderer.setDayPhase(this.timeClock.getPeriodProgress());
    this.asciiRenderer.update(delta);
  }

  // ── Input handlers ──

  private handleKeyDown(event: KeyboardEvent): void {
    const ctx = this.buildMode.getContext();

    if (ctx.state === BuildModeState.Building) {
      this.handleBuildModeKey(event);
      return;
    }

    if (ctx.state === BuildModeState.ViewingInterior) {
      if (event.key === 'Escape') {
        this.exitInteriorView();
      }
      return;
    }

    // Browsing mode keys
    switch (event.key) {
      case 'Escape':
        // Toggle menu if we add one later
        break;
      case 'r':
      case 'R':
        this.buildPanel.destroy();
        this.scene.start('SplashScene');
        break;
    }
  }

  private handleBuildModeKey(event: KeyboardEvent): void {
    // Don't handle keys when typing in the build panel inputs
    if (this.buildPanel.isInputFocused()) return;

    const ctx = this.buildMode.getContext();
    const house = ctx.activeHouseId !== null
      ? this.buildingManager.getHouse(ctx.activeHouseId)
      : null;
    if (!house) return;

    switch (event.key) {
      // Cursor movement
      case 'ArrowUp':
      case 'w':
      case 'W':
        this.buildMode.moveCursor(0, -1, house);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        this.buildMode.moveCursor(0, 1, house);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        this.buildMode.moveCursor(-1, 0, house);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        this.buildMode.moveCursor(1, 0, house);
        break;

      // Place / erase (uses panel brush)
      case ' ':
        this.placeGlyphFromPanel(house);
        break;
      case 'Backspace':
      case 'x':
      case 'X':
        this.eraseGlyph(house);
        break;

      // Palette: q/e browse items, Tab cycles category, 1-6 jump to category
      case 'q':
      case 'Q':
        this.buildPanel.prevChar();
        break;
      case 'e':
      case 'E':
        this.buildPanel.nextChar();
        break;
      case 'Tab':
        event.preventDefault();
        this.buildPanel.selectCategory(
          (this.buildPanel.getCategoryIndex() + 1) % 6,
        );
        break;
      case '1': case '2': case '3': case '4': case '5': case '6':
        this.buildPanel.selectCategory(parseInt(event.key) - 1);
        break;

      // Finish building
      case 'Enter':
        this.finishBuilding(house);
        break;

      // Cancel
      case 'Escape':
        this.cancelBuildMode();
        break;
    }
  }

  private handleWorldClick(pointer: Phaser.Input.Pointer): void {
    const col = Math.floor(pointer.worldX / GRID_CONFIG.cellWidth);
    const row = Math.floor(pointer.worldY / GRID_CONFIG.cellHeight);
    if (col < 0 || col >= GRID_CONFIG.cols || row < 0 || row >= GRID_CONFIG.rows) return;

    const ctx = this.buildMode.getContext();

    if (ctx.state === BuildModeState.Building) {
      const house = ctx.activeHouseId !== null ? this.buildingManager.getHouse(ctx.activeHouseId) : null;
      if (house) {
        const colOff = col - house.anchorCol;
        const rowOff = row - house.anchorRow;
        if (colOff >= 0 && colOff < house.width && rowOff >= 0 && rowOff < house.height) {
          this.buildMode.setCursor(colOff, rowOff);
          const tool = this.buildPanel.getActiveTool();
          const isAlt = pointer.event.altKey;

          if (isAlt || tool === 'pick') {
            // Eyedropper: pick char+color from existing cell
            const existing = house.exterior.find(c => c.colOff === colOff && c.rowOff === rowOff);
            if (existing) {
              this.buildPanel.setBrush(existing.glyph);
            }
            this.buildPanel.setTool('paint');
          } else if (tool === 'erase') {
            this.eraseGlyph(house);
          } else {
            // Paint tool
            this.placeGlyphFromPanel(house);
          }
        }
      }
      return;
    }

    if (ctx.state === BuildModeState.ViewingInterior) {
      const house = ctx.activeHouseId !== null ? this.buildingManager.getHouse(ctx.activeHouseId) : null;
      if (house) {
        const colOff = col - house.anchorCol;
        const rowOff = row - house.anchorRow;
        if (colOff < 0 || colOff >= house.width || rowOff < 0 || rowOff >= house.height) {
          this.exitInteriorView();
        } else {
          // Check if clicked the stove
          const item = house.furniture.find(f => f.colOff === colOff && f.rowOff === rowOff);
          if (item && item.id === 'stove') {
            this.cookRecipe(house);
          }
        }
      }
      return;
    }

    // Browsing mode — check if we clicked a building
    const house = this.buildingManager.getHouseAtCell(col, row);
    if (house) {
      if (house.phase === BuildPhase.SiteMarked) {
        this.enterBuildMode(house);
      } else if (house.phase === BuildPhase.Complete) {
        if (pointer.event.shiftKey) {
          this.enterEditMode(house);
        } else {
          this.enterInteriorView(house);
        }
      }
    }
  }

  private updateHoverState(col: number, row: number): void {
    const ctx = this.buildMode.getContext();

    // Interior view: check for item and villager hover within the house
    if (ctx.state === BuildModeState.ViewingInterior && ctx.activeHouseId !== null) {
      const house = this.buildingManager.getHouse(ctx.activeHouseId);
      if (house) {
        const colOff = col - house.anchorCol;
        const rowOff = row - house.anchorRow;

        // Check if hovering a furniture item
        const item = house.furniture.find(f => f.colOff === colOff && f.rowOff === rowOff);
        if (item) {
          this.hudRenderer.setHoveredItem(item);
          // Also check if hovering the villager at center
          const villagerState = this.villagerSim.getVillagerForHouse(house.id);
          if (villagerState) {
            const def = VILLAGER_LIST.find(v => v.id === house.villagerId);
            const hourIndex = this.timeClock.getDayHourIndex();
            const activity = this.villagerSim.getActivityDescription(house.id, hourIndex);
            this.hudRenderer.setHoveredVillager(def ?? null, house, activity);
          }
          return;
        }
        this.hudRenderer.setHoveredItem(null);

        // Check if hovering the villager (at their tracked interior position)
        const villagerState = this.villagerSim.getVillagerForHouse(house.id);
        if (villagerState && villagerState.isHome) {
          const def = VILLAGER_LIST.find(v => v.id === house.villagerId);
          if (def) {
            const isSleeping = villagerState.activity.toLowerCase().includes('snoozing')
              || villagerState.activity.toLowerCase().includes('dozing');
            const frame = isSleeping ? def.sleepFrame : def.idleFrames[0];
            const isOnVillager = frame.cells.some(([co, ro]) => {
              const actualCo = villagerState.facing < 0 ? -co : co;
              return colOff === villagerState.interiorCol + actualCo
                && rowOff === villagerState.interiorRow + ro;
            });
            if (isOnVillager) {
              const hourIndex = this.timeClock.getDayHourIndex();
              const activity = this.villagerSim.getActivityDescription(house.id, hourIndex);
              this.hudRenderer.setHoveredVillager(def, house, activity);
              return;
            }
          }
        }

        this.hudRenderer.setHoveredVillager(null, null, null);
        return;
      }
    }

    this.hudRenderer.setHoveredItem(null);

    const house = this.buildingManager.getHouseAtCell(col, row);
    if (house) {
      const villager = VILLAGER_LIST.find(v => v.id === house.villagerId);
      if (villager) {
        const hourIndex = this.timeClock.getDayHourIndex();
        const activity = this.villagerSim.getActivityDescription(house.id, hourIndex);
        this.hudRenderer.setHoveredVillager(villager, house, activity);
      }
    } else {
      // Check if hovering a walking villager
      const walkingVillager = this.villagerSim.getVillagers().find(
        v => !v.isHome && v.col === col && v.row === row,
      );
      if (walkingVillager) {
        const def = VILLAGER_LIST.find(v => v.id === walkingVillager.defId);
        const house2 = this.buildingManager.getHouse(walkingVillager.houseId);
        if (def && house2) {
          this.hudRenderer.setHoveredVillager(def, house2, 'on a stroll');
        }
      } else {
        this.hudRenderer.setHoveredVillager(null, null, null);
      }
    }
  }

  // ── Build mode transitions ──

  private enterBuildMode(house: HouseState): void {
    house.phase = BuildPhase.Building;
    this.isEditingExisting = false;
    this.exteriorBackup = null;
    this.buildMode.enterBuildMode(house.id);
    this.buildMode.setCursor(Math.floor(house.width / 2), Math.floor(house.height / 2));

    this.savedZoom = this.cameras.main.zoom;
    this.savedScrollX = this.cameras.main.scrollX;
    this.savedScrollY = this.cameras.main.scrollY;

    this.zoomToRegion(house.anchorCol, house.anchorRow, house.width, house.height);
    // Offset camera left to account for the build panel (224px wide)
    this.cameras.main.scrollX -= 112 / this.cameras.main.zoom;
    this.buildPanel.show();
    this.buildPanel.setTool('paint');
    this.buildMode.setSelectedGlyph(this.buildPanel.getCurrentGlyph());
    this.hudRenderer.showMessage('Design the house!');
  }

  private enterEditMode(house: HouseState): void {
    // Save backup for cancel
    this.exteriorBackup = house.exterior.map(c => ({ ...c, glyph: { ...c.glyph } }));
    this.isEditingExisting = true;

    house.phase = BuildPhase.Building;
    this.buildMode.enterBuildMode(house.id);
    this.buildMode.setCursor(Math.floor(house.width / 2), Math.floor(house.height / 2));

    this.savedZoom = this.cameras.main.zoom;
    this.savedScrollX = this.cameras.main.scrollX;
    this.savedScrollY = this.cameras.main.scrollY;

    this.zoomToRegion(house.anchorCol, house.anchorRow, house.width, house.height);
    this.cameras.main.scrollX -= 112 / this.cameras.main.zoom;
    this.buildPanel.show();
    this.buildPanel.setTool('paint');

    // Set initial brush from first exterior cell if any
    if (house.exterior.length > 0) {
      this.buildPanel.setBrush(house.exterior[0].glyph);
    }
    this.buildMode.setSelectedGlyph(this.buildPanel.getCurrentGlyph());
    this.hudRenderer.showMessage('Edit the house exterior!');
  }

  private cancelBuildMode(): void {
    const ctx = this.buildMode.getContext();
    const house = ctx.activeHouseId !== null ? this.buildingManager.getHouse(ctx.activeHouseId) : null;
    if (house) {
      if (this.isEditingExisting && this.exteriorBackup) {
        house.exterior = this.exteriorBackup;
        house.phase = BuildPhase.Complete;
      } else {
        house.phase = BuildPhase.SiteMarked;
        house.exterior = [];
      }
    }
    this.isEditingExisting = false;
    this.exteriorBackup = null;
    this.buildMode.exitBuildMode();
    this.buildPanel.hide();
    this.zoomOut();
  }

  private finishBuilding(house: HouseState): void {
    if (house.exterior.length === 0) {
      this.hudRenderer.showMessage('Place some glyphs first!');
      return;
    }
    house.phase = BuildPhase.Complete;
    this.buildingManager.generateInterior(house);

    if (!this.isEditingExisting) {
      this.villagerSim.addVillager(house);
      const villager = VILLAGER_LIST.find(v => v.id === house.villagerId);
      this.hudRenderer.showMessage(`${villager?.name ?? 'A villager'} moves in!`);
    } else {
      this.hudRenderer.showMessage('House updated!');
    }

    this.isEditingExisting = false;
    this.exteriorBackup = null;
    this.buildMode.exitBuildMode();
    this.buildPanel.hide();
    this.zoomOut();
  }

  private enterInteriorView(house: HouseState): void {
    this.buildMode.enterInteriorView(house.id);

    this.savedZoom = this.cameras.main.zoom;
    this.savedScrollX = this.cameras.main.scrollX;
    this.savedScrollY = this.cameras.main.scrollY;

    // Slightly tighter zoom for interior
    this.zoomToRegion(house.anchorCol, house.anchorRow, house.width, house.height, 600, 0.9);
  }

  private exitInteriorView(): void {
    this.buildMode.exitInteriorView();
    this.zoomOut();
  }

  private cookRecipe(house: HouseState): void {
    const villager = VILLAGER_LIST.find(v => v.id === house.villagerId);
    if (!villager || villager.recipes.length === 0) return;

    const recipe = villager.recipes[Math.floor(Math.random() * villager.recipes.length)];
    this.hudRenderer.showMessage(
      `${villager.name} is making ${recipe.name}! ${recipe.description}`,
    );
  }

  // ── Glyph placement ──

  /** Place the build panel's current brush at the cursor position */
  private placeGlyphFromPanel(house: HouseState): void {
    const ctx = this.buildMode.getContext();
    const glyph = this.buildPanel.getCurrentGlyph();
    if (!glyph.char) return;

    const colOff = ctx.cursorCol;
    const rowOff = ctx.cursorRow;
    house.exterior = house.exterior.filter(c => !(c.colOff === colOff && c.rowOff === rowOff));
    house.exterior.push({ colOff, rowOff, glyph: { ...glyph } });
  }

  private eraseGlyph(house: HouseState): void {
    const ctx = this.buildMode.getContext();
    house.exterior = house.exterior.filter(
      c => !(c.colOff === ctx.cursorCol && c.rowOff === ctx.cursorRow),
    );
  }

  // ── Camera ──

  private zoomToRegion(
    col: number, row: number, width: number, height: number,
    _duration = 600, fillFactor = 0.8,
  ): void {
    const cam = this.cameras.main;

    // Remove bounds so the camera can freely scroll to the target
    cam.removeBounds();

    const targetZoom = Math.min(
      cam.width / (width * GRID_CONFIG.cellWidth),
      cam.height / (height * GRID_CONFIG.cellHeight),
    ) * fillFactor;

    // Center of the building region in world pixels
    const centerX = (col + width / 2) * GRID_CONFIG.cellWidth;
    const centerY = (row + height / 2) * GRID_CONFIG.cellHeight;

    // Use Phaser's centerOn which correctly accounts for zoom
    cam.setZoom(targetZoom);
    cam.centerOn(centerX, centerY);
  }

  private zoomOut(_duration = 500): void {
    this.applyHedgeView();
    this.cameras.main.setScroll(this.savedScrollX, this.savedScrollY);
  }

  private applyHedgeView(): void {
    const cam = this.cameras.main;
    const worldWidth = this.asciiRenderer.getWorldWidth();
    const maxGR = this.terrainMap.getMaxGroundRow();
    const groundBottom = (maxGR + 1) * GRID_CONFIG.cellHeight;
    cam.setZoom(cam.height / groundBottom);
    cam.setBounds(0, 0, worldWidth, groundBottom);
    cam.scrollY = 0;
  }

  // ── Villager spawning ──

  private spawnNextVillager(): void {
    if (this.nextVillagerIndex >= VILLAGER_LIST.length) return;
    const villager = VILLAGER_LIST[this.nextVillagerIndex];

    const house = this.buildingManager.allocateSite(villager, this.growthSim.getPlants());
    if (house) {
      this.nextVillagerIndex++;
      this.hudRenderer.showMessage(`${villager.name} is looking for a home!`);
    }
  }

  // ── Pre-plant a mature hedge ──

  private prePlantHedge(): void {
    // Plant a variety of mature species across the hedge
    const species = SPECIES_LIST;
    const centerCol = Math.floor(GRID_CONFIG.cols / 2);
    const startCol = centerCol - 30;
    const endCol = centerCol + 30;

    for (let col = startCol; col <= endCol; col += 3) {
      const sp = species[Math.floor(Math.random() * species.length)];
      const row = this.terrainMap.getGroundRow(col);
      this.growthSim.addPlant(sp.id, col, row, 0);

      // Force to mature stage
      const plant = this.growthSim.getPlants().find(p => p.col === col);
      if (plant) {
        plant.stage = GrowthStage.Mature;
        plant.ticksInStage = 0;
      }
    }

    // Render all plants
    const period = this.timeClock.getCurrentPeriod();
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
  }

  // ── Terrain decoration (shared pattern from GameScene) ──

  private addTerrainDecoration(): void {
    const cols = GRID_CONFIG.cols;

    // Grass palettes per biome
    const BIOME_GRASS: Array<Array<{ char: string; fg: string }>> = [
      [{ char: '"', fg: '#7aba4a' }, { char: "'", fg: '#6aaa3a' }, { char: ',', fg: '#8aca5a' }, { char: '`', fg: '#7aba4a' }],
      [{ char: '"', fg: '#6aaa3a' }, { char: '_', fg: '#5a8a2a' }, { char: ',', fg: '#587a30' }, { char: ' ', fg: '#587a30' }],
      [{ char: '.', fg: '#c8c8b0' }, { char: ',', fg: '#b0b098' }, { char: "'", fg: '#a0a890' }, { char: '\u00B7', fg: '#d0d0c0' }],
      [{ char: '%', fg: '#3a4a1a' }, { char: '~', fg: '#2a3a10' }, { char: ',', fg: '#4a5a20' }, { char: '.', fg: '#3a4018' }],
      [{ char: '.', fg: '#aaa060' }, { char: "'", fg: '#b8b070' }, { char: ',', fg: '#a09050' }, { char: ' ', fg: '#908040' }],
    ];

    for (let col = 0; col < cols; col++) {
      const gRow = this.terrainMap.getGroundRow(col);
      const biome = this.terrainMap.getBiome(col);

      if (this.terrainMap.decorHash(col, 0) < 0.65) {
        const palette = BIOME_GRASS[biome];
        const g = palette[Math.floor(this.terrainMap.decorHash(col, 1) * palette.length)];
        this.asciiRenderer.setOverlay(col, gRow, g);
      }

      if (this.terrainMap.isSpring(col)) {
        this.asciiRenderer.setOverlay(col, gRow, { char: '~', fg: '#4a8aaa' });
      }

      if (col > 0) {
        const prevRow = this.terrainMap.getGroundRow(col - 1);
        if (prevRow < gRow) {
          this.asciiRenderer.setOverlay(col, gRow - 1, { char: '\\', fg: '#4a6a2a' });
        } else if (prevRow > gRow) {
          this.asciiRenderer.setOverlay(col - 1, gRow, { char: '/', fg: '#4a6a2a' });
        }
      }
    }
  }
}
