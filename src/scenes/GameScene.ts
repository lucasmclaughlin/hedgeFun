import Phaser from 'phaser';
import { AsciiRenderer } from '@/rendering/AsciiRenderer';
import { GRID_CONFIG, ViewMode } from '@/types';
import { TimeClock } from '@/simulation/TimeClock';
import { EnergyManager } from '@/simulation/EnergyManager';
import { GrowthSimulator } from '@/simulation/GrowthSimulator';
import { SoilMap } from '@/simulation/SoilMap';
import { PlantRenderer } from '@/simulation/PlantRenderer';
import { WeatherEngine } from '@/simulation/WeatherEngine';
import { HabitatScorer } from '@/simulation/HabitatScorer';
import { CreatureSimulator } from '@/simulation/CreatureSimulator';
import { CreatureRenderer } from '@/simulation/CreatureRenderer';
import { HudRenderer, type TerrainHoverInfo } from '@/ui/HudRenderer';
import { BiodiversityTracker } from '@/simulation/BiodiversityTracker';
import { SaveManager } from '@/simulation/SaveManager';
import { RealtimeModeManager } from '@/simulation/RealtimeModeManager';
import { StarMap } from '@/simulation/StarMap';
import { TerrainMap } from '@/simulation/TerrainMap';
import { getCompanionRelationships } from '@/simulation/companionPlanting';
import { SPECIES_LIST } from '@/data/species';
import { saveHighScore } from '@/scenes/SplashScene';
import { OverlayLayer, type PlantState, type CreatureState, type SaveData, type Glyph, type EnemyState, type EnemyDef } from '@/types';
import { WaveManager } from '@/defense/WaveManager';
import { EnemySimulator } from '@/defense/EnemySimulator';
import { EnemyRenderer } from '@/defense/EnemyRenderer';
import { DefenderCombatSystem, DefenderRole } from '@/defense/DefenderCombatSystem';
import { BattleEffectRenderer } from '@/defense/BattleEffectRenderer';
import { FortificationSystem } from '@/defense/FortificationSystem';
import { SPECIES_BONUSES, applyThornDamage, applyHealingBerries } from '@/defense/SpeciesBonuses';
import { KingdomsHudRenderer } from '@/ui/KingdomsHudRenderer';
import { FortificationUI } from '@/ui/FortificationUI';
import { ENEMIES } from '@/data/enemies';
import { seedKingdomsHedge } from '@/defense/KingdomsStarter';


/** Auto-save every 12 periods (1 full year) */
const AUTO_SAVE_INTERVAL = 12;

/** Short battle cries for floating text above creatures */
const BATTLE_CRIES: Record<string, string[]> = {
  hedgehog: ['Spines out!', 'Hold!', 'For the hedge!'],
  fieldmouse: ['*SQUEEK!*', 'For home!', '*chitter!*'],
  badger: ['*SNARL!*', 'COME ON!', 'By claw!'],
  wren: ['*TRILL!*', 'Chit-chit!', 'Spotted!'],
  robin: ['*TICK!*', 'Ours!', 'Alert!'],
  owl: ['*SCREECH!*', 'WHO dares!', '*silent strike*'],
  barnowl: ['*SHRIEK!*', 'None pass!', '*ghost swoop*'],
  shrew: ['*SQUEAK!*', 'Dig dig!', '*fury!*'],
  toad: ['*CROAK!*', 'Taste that!', '*toxic spit*'],
  woodpigeon: ['*CLAP!*', 'Coo-COO!', '*wing bash*'],
  rabbit: ['*THUMP!*', 'For burrow!', '*kick!*'],
  fox: ['*GROWL!*', 'Remember!', '*snap!*'],
  dormouse: ['*squeak!*', 'Woke me?!', '*nip!*'],
  redkite: ['*KEEN!*', 'Sky sees!', '*stoop!*'],
  pipistrelle: ['*eeeee!*', 'Night wing!', '*swoop!*'],
  bluetit: ['*PEE-POW!*', '*peck!*', '*flutter!*'],
};
const DEFAULT_BATTLE_CRIES = ['For hedge!', '*attack!*', 'Hold!'];


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

  /** Terrain map — procedural landscape for this playthrough */
  private terrainMap!: TerrainMap;
  private terrainSeed = 0;

  /** SoilMap stored as field so terrain decoration can access it */
  private soilMap!: SoilMap;

  /** Current view mode */
  private viewMode = ViewMode.Hedge;

  /** Player name from splash screen */
  private playerName = 'Player';

  /** Dedicated HUD camera that ignores zoom */
  private hudCamera!: Phaser.Cameras.Scene2D.Camera;

  /** Track total periods for auto-save timing */
  private lastSavePeriod = 0;

  /** Screenshot mode — hides HUD and zooms to full hedge width */
  private screenshotMode = false;

  /** Realtime mode — syncs season/weather to real-world date and location */
  private realtimeMode = false;
  private realtimeModeManager: RealtimeModeManager | null = null;

  // Star map
  private starMap!: StarMap;
  private starSeed = 0;

  // hedgeKingdoms defense mode
  private kingdomsActive = false;
  private waveManager!: WaveManager;
  private enemySim!: EnemySimulator;
  private enemyRenderer!: EnemyRenderer;
  private defenderCombat!: DefenderCombatSystem;
  private battleFx!: BattleEffectRenderer;
  private kingdomsHud!: KingdomsHudRenderer;
  private fortSystem!: FortificationSystem;
  private fortUI!: FortificationUI;
  private currentFortType: 'wall' | 'watchtower' | 'gate' = 'wall';
  private ENEMY_MAP: Record<string, EnemyDef> = {};
  private autoStartKingdoms = false;
  private kingdomsSettings: { scenario: string; difficulty: string; speed: number } | null = null;
  private defenderOverlayCells: Array<[number, number]> = [];
  private selectedCreatureId: number | null = null;
  private defenderAssignments = new Map<number, number>();  // creatureId → plantCol
  private selectionHighlightCells: Array<[number, number]> = [];
  private battleCameraMode = false;
  private battleCameraIndex = -1;
  private hoveredEnemy: EnemyState | null = null;
  private thornCooldowns = new Map<number, number>();
  private healCooldowns = new Map<number, number>();

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: {
    playerName?: string;
    loadSave?: SaveData;
    kingdomsMode?: boolean;
    kingdomsSettings?: { scenario: string; difficulty: string; speed: number };
  }): void {
    this.playerName = data?.playerName || 'Player';
    this.autoStartKingdoms = data?.kingdomsMode ?? false;
    this.kingdomsSettings = data?.kingdomsSettings ?? null;
  }

  create(): void {
    this.asciiRenderer = new AsciiRenderer(this);

    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = this.asciiRenderer.getWorldHeight();

    // Set initial camera position (horizontal center), then apply view mode bounds
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.scrollX = worldWidth / 2 - this.cameras.main.width / 2;

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
        // Check enemy hover first in kingdoms mode
        if (this.kingdomsActive) {
          const enemies = this.enemySim.getEnemies();
          this.hoveredEnemy = enemies.find(e => e.col === col && Math.abs(e.row - row) <= 1) ?? null;
          if (this.hoveredEnemy) {
            this.kingdomsHud.showEnemyTooltip(this.hoveredEnemy, this.ENEMY_MAP[this.hoveredEnemy.defId], pointer.x, pointer.y);
          } else {
            this.kingdomsHud.hideEnemyTooltip();
          }
        }
        this.hoveredCreature = this.creatureSim.getCreatureAtCell(col, row);
        this.hoveredPlant = this.hoveredCreature ? null : this.growthSim.getPlantAtCell(col, row);

        // Terrain hover — show soil info when mousing over underground cells
        const groundRow = this.terrainMap.getGroundRow(col);
        if (row > groundRow && !this.hoveredPlant && !this.hoveredCreature) {
          const soil = this.soilMap.getSoilAt(col, row);
          const info: TerrainHoverInfo = {
            col,
            row,
            depth: row - groundRow,
            soilLayer: soil.layer,
            biome: this.terrainMap.getBiome(col),
            fertility: soil.fertility,
            rockDensity: soil.rockDensity,
            inBoulder: this.terrainMap.isInBoulderMass(col, row),
            inClayLens: this.terrainMap.isInClayLens(col, row),
            nearAquifer: this.terrainMap.isNearAquifer(col, row),
            isSpring: this.terrainMap.isSpring(col),
          };
          this.hudRenderer.setHoveredTerrainInfo(info);
        } else {
          this.hudRenderer.setHoveredTerrainInfo(null);
        }
      } else {
        this.hoveredPlant = null;
        this.hoveredCreature = null;
        this.hudRenderer.setHoveredTerrainInfo(null);
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

    // Click to move cursor or interact with HUD buttons
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = Math.abs(pointer.x - this.dragStartX);
      const dy = Math.abs(pointer.y - this.dragStartY);
      if (dx < 5 && dy < 5) {
        // HUD buttons are ignored by the main camera, so we do manual hit testing
        if (this.hudRenderer.handleClick(pointer.x, pointer.y)) return;

        // Exit screenshot mode on any non-HUD click
        if (this.screenshotMode) {
          this.exitScreenshotMode();
          return;
        }

        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        const col = Math.floor(worldX / GRID_CONFIG.cellWidth);
        const row = Math.floor(worldY / GRID_CONFIG.cellHeight);

        if (this.kingdomsActive && col >= 0 && col < GRID_CONFIG.cols) {
          if (pointer.rightButtonReleased()) {
            // Right-click: assign selected creature to defend this plant
            if (this.selectedCreatureId !== null) {
              const plant = this.growthSim.getPlantAtCell(col, row) ?? this.growthSim.getPlants().find(p => p.col === col);
              if (plant) {
                this.defenderAssignments.set(this.selectedCreatureId, plant.col);
                // Move creature's homeCol to the plant
                const creature = this.creatureSim.getCreatures().find(c => c.id === this.selectedCreatureId);
                if (creature) {
                  (creature as { homeCol: number }).homeCol = plant.col;
                }
                this.hudRenderer.showMessage(`Defender assigned to ${plant.speciesId}`);
                this.selectedCreatureId = null;
              }
            }
            return;
          }
          // Left-click: select a creature
          const clickedCreature = this.creatureSim.getCreatureAtCell(col, row);
          if (clickedCreature) {
            this.selectedCreatureId = clickedCreature.id;
            this.hudRenderer.showMessage(`Selected ${clickedCreature.defId} — right-click a plant to assign`);
            return;
          }
          this.selectedCreatureId = null;
        }

        if (col >= 0 && col < GRID_CONFIG.cols) {
          this.asciiRenderer.setCursor(col, this.terrainMap.getGroundRow(col));
        }
      }
    });

    // Disable context menu so right-click works for kingdoms assignment
    this.game.canvas.addEventListener('contextmenu', (e: Event) => e.preventDefault());

    // Initialize terrain (before everything else — other systems read from it)
    this.terrainSeed = (Date.now() ^ Math.floor(Math.random() * 0x100000000)) | 0;
    this.terrainMap  = TerrainMap.generate(this.terrainSeed);

    // Place cursor on ground row at center column (after terrain is ready)
    const centerCol = Math.floor(GRID_CONFIG.cols / 2);
    this.asciiRenderer.setCursor(centerCol, this.terrainMap.getGroundRow(centerCol));

    // Initialize simulation systems
    this.soilMap = new SoilMap(GRID_CONFIG.cols, GRID_CONFIG.rows, this.terrainMap);
    this.timeClock = new TimeClock();
    this.energyManager = new EnergyManager();
    this.growthSim = new GrowthSimulator(this.soilMap);
    this.plantRenderer = new PlantRenderer(this.asciiRenderer);
    this.weatherEngine = new WeatherEngine(this.asciiRenderer);
    this.starSeed = (Date.now() ^ Math.floor(Math.random() * 0x100000000)) | 0;
    this.starMap = new StarMap(this.asciiRenderer, this.starSeed);

    // Push terrain layout into the renderer so backgrounds are depth-relative
    {
      const gRows: number[] = [];
      const biomes: number[] = [];
      for (let c = 0; c < GRID_CONFIG.cols; c++) {
        gRows.push(this.terrainMap.getGroundRow(c));
        biomes.push(this.terrainMap.getBiome(c));
      }
      this.asciiRenderer.setTerrainData(gRows, biomes);
    }
    this.habitatScorer = new HabitatScorer();
    this.creatureSim = new CreatureSimulator(this.habitatScorer);
    this.creatureRenderer = new CreatureRenderer(this.asciiRenderer);
    this.biodiversityTracker = new BiodiversityTracker();
    this.saveManager = new SaveManager();
    this.hudRenderer = new HudRenderer(this);

    // Wire up menu button callbacks
    this.hudRenderer.setCallbacks(
      () => this.manualSave(),
      () => this.manualLoad(),
      () => this.restartGame(),
    );

    // Create a separate HUD camera that ignores zoom/scroll
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
    this.addTerrainDecoration();
    this.addBurrows(this.terrainMap.getGroundRow(Math.floor(GRID_CONFIG.cols / 2)), GRID_CONFIG.rows - 1);

    // Check for save data passed via init
    const initData = this.scene.settings.data as { loadSave?: SaveData } | undefined;
    if (initData?.loadSave) {
      this.applySaveData(initData.loadSave);
    }

    // Apply initial view mode (Hedge view by default)
    this.applyViewMode();

    // hedgeKingdoms systems
    this.waveManager = new WaveManager();
    this.enemySim = new EnemySimulator();
    this.enemyRenderer = new EnemyRenderer(this.asciiRenderer);
    this.defenderCombat = new DefenderCombatSystem();
    this.battleFx = new BattleEffectRenderer(this.asciiRenderer);
    this.fortSystem = new FortificationSystem();
    this.kingdomsHud = new KingdomsHudRenderer(this);
    this.fortUI = new FortificationUI(this.asciiRenderer);
    this.ENEMY_MAP = Object.fromEntries(Object.values(ENEMIES).map(e => [e.id, e]));
    this.cameras.main.ignore(this.kingdomsHud.getAllObjects());

    if (this.autoStartKingdoms) this.enterKingdomsMode();
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

    const isPaused = this.timeClock.getIsPaused();

    // Advance time
    let periodAdvanced = false;

    if (this.realtimeMode && this.realtimeModeManager) {
      // Realtime mode: sync period and weather to real-world clock
      const { snapshot, periodAdvanced: rtAdvanced } = this.realtimeModeManager.tick();
      this.timeClock.setRealtimePeriod(snapshot.periodIndex, snapshot.periodProgress);
      if (rtAdvanced) {
        periodAdvanced = true;
        this.weatherEngine.setWeather(snapshot.weather);
        this.starMap.setWeather(snapshot.weather);
      }
    } else if (this.timeClock.tick(delta)) {
      periodAdvanced = true;
    }

    if (periodAdvanced) {
      const period = this.timeClock.getCurrentPeriod();
      const moon = this.timeClock.getMoonPhase();
      this.energyManager.onPeriodAdvance(period, moon);
      this.growthSim.onPeriodAdvance(period, this.weatherEngine.getCurrentWeather());
      if (!this.realtimeMode) this.weatherEngine.onPeriodAdvance(period);
      this.starMap.setWeather(this.weatherEngine.getCurrentWeather());
      this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
      this.creatureSim.onPeriodAdvance(period, this.growthSim.getPlants());
      this.asciiRenderer.setEnvironment(period.season, this.weatherEngine.getCurrentWeather());
      const newMilestones = this.biodiversityTracker.checkMilestones(
        this.growthSim.getPlants(),
        this.creatureSim.getUniqueSpeciesCount(),
        this.creatureSim.getTotalCount(),
        this.timeClock.getTotalPeriods(),
        this.habitatScorer.getOccupiedLayerCount(),
        this.creatureSim.getUniqueSpeciesIds(),
        this.growthSim.getDeadPlantCount(),
        this.growthSim.getPruneCount(),
        this.growthSim.getLayCount(),
      );
      if (newMilestones.length > 0) {
        this.hudRenderer.showMilestoneToasts(newMilestones);
      }

      // Re-register creatures as defenders when new ones spawn
      if (this.kingdomsActive) {
        this.defenderCombat.registerCreatures(this.creatureSim.getCreatures());
      }

      // Auto-save every year (not in realtime mode — period resets would trigger constantly)
      if (!this.realtimeMode) {
        const totalPeriods = this.timeClock.getTotalPeriods();
        if (totalPeriods > 0 && totalPeriods - this.lastSavePeriod >= AUTO_SAVE_INTERVAL) {
          this.lastSavePeriod = totalPeriods;
          this.saveManager.autoSave(this.buildSaveData());
        }
      }
    }

    // Animate weather and creatures (paused = frozen in time; realtime is always live)
    if (!isPaused || this.realtimeMode) {
      this.weatherEngine.updateSkyOverlays(delta);
      this.starMap.update(delta, this.timeClock.getPeriodProgress());
      this.creatureSim.updateCreatures(delta);
    }
    this.creatureRenderer.renderCreatures(this.creatureSim.getCreatures());

    // ── hedgeKingdoms update ──────────────────────────────────────────────
    if (this.kingdomsActive) {
      const enemies = this.enemySim.getEnemies();
      const simEvents = this.enemySim.update(delta, this.growthSim.getPlants());
      const defEvents = this.defenderCombat.update(
        enemies,
        this.creatureSim.getCreatures(),
        delta,
        this.timeClock.getDayHourIndex(),
      );

      for (const e of defEvents) {
        if (e.type === 'hit-enemy') {
          this.enemySim.applyDamage(e.enemyId, e.damage);
          this.battleFx.addEffect(e.effect);

          // Floating text above the attacker
          const nearCreature = this.creatureSim.getCreatures().find(
            c => Math.abs(c.col - e.effect.col) <= 3 && this.defenderCombat.getDefenders().has(c.id),
          );
          if (nearCreature) {
            // Show damage number at the enemy
            const enemy = enemies.find(en => en.id === e.enemyId);
            if (e.damage >= 1) {
              this.battleFx.addFloatingText(
                `-${e.damage}`, e.effect.col, e.effect.row, '#ff4040', 800,
              );
            }
            // Occasional battle cry above the defender (20% chance for heavy, 8% light)
            const cryChance = e.damage >= 2 ? 0.2 : 0.08;
            if (Math.random() < cryChance) {
              const cries = BATTLE_CRIES[nearCreature.defId] ?? DEFAULT_BATTLE_CRIES;
              const cry = cries[Math.floor(Math.random() * cries.length)];
              // Trim to max 12 chars for floating text
              const short = cry.length > 14 ? cry.slice(0, 13) + '\u2026' : cry;
              this.battleFx.addFloatingText(
                short, nearCreature.col, nearCreature.row, '#e0d060', 1400,
              );
            }
            // Battle log dispatch (15% chance)
            if (enemy && Math.random() < 0.15) {
              this.kingdomsHud.logHit(nearCreature.defId, enemy.defId, e.damage);
            }
          }
        }
        if (e.type === 'alarm') {
          this.waveManager.addPrepTime(e.prepBonusMs);
          // Log scout sighting — find the scout and the nearest enemy
          const scouts = this.creatureSim.getCreatures().filter(
            c => (c.defId === 'wren' || c.defId === 'robin') && this.defenderCombat.getDefenders().has(c.id),
          );
          const nearestEnemy = enemies[0];
          if (scouts.length > 0 && nearestEnemy) {
            this.kingdomsHud.logSighting(scouts[0].defId, nearestEnemy.defId, nearestEnemy.col);
          }
        }
      }

      for (const e of simEvents) {
        if (e.type === 'defeated') {
          this.waveManager.enemyDefeated();
          const enemy = enemies.find(en => en.id === e.id);
          if (enemy) this.kingdomsHud.logDefeat(enemy.defId);
        }
        if (e.type === 'breached') {
          this.waveManager.enemyBreached(e.damage);
          const enemy = enemies.find(en => en.id === e.id);
          if (enemy) this.kingdomsHud.logBreach(enemy.defId);
        }
      }

      const waveEvent = this.waveManager.update(delta);
      const waveState = this.waveManager.getState();
      if (waveEvent === 'wave-start') {
        const ids = this.waveManager.getEnemyIdsForWave(waveState.waveNumber);
        const defs = ids.map(id => this.ENEMY_MAP[id]).filter(Boolean);
        this.enemySim.spawn(defs);
        this.defenderCombat.registerCreatures(this.creatureSim.getCreatures());
      }
      if (waveEvent === 'wave-complete') {
        this.kingdomsHud.showWaveClear(waveState.waveNumber - 1);
      }
      if (waveEvent === 'game-over') {
        this.exitKingdomsMode();
        return;
      }
      if (waveEvent === 'campaign-complete') {
        this.onCampaignVictory();
        return;
      }

      // Rally: nearby defenders converge on combat
      for (const e of defEvents) {
        if (e.type === 'rally') {
          for (const creature of this.creatureSim.getCreatures()) {
            const defender = this.defenderCombat.getDefenders().get(creature.id);
            if (!defender) continue;
            if (Math.abs(creature.col - e.col) <= 15 && Math.abs(creature.col - e.col) > 2) {
              (creature as { homeCol: number }).homeCol = e.col;
            }
          }
        }
      }

      // Auto-fortification: castle walls around mature plants with assigned defenders
      this.fortSystem.update(this.growthSim.getPlants(), this.defenderAssignments, this.terrainMap);
      const forts = this.fortSystem.getForts();

      // Species bonuses: thorn damage + healing
      const thornHits = applyThornDamage(forts, enemies, delta, this.thornCooldowns);
      for (const eid of thornHits) this.enemySim.applyDamage(eid, 1);
      const healed = applyHealingBerries(forts, this.defenderCombat.getDefenders(), this.creatureSim.getCreatures(), delta, this.healCooldowns);
      for (const cid of healed) {
        const def = this.defenderCombat.getDefenders().get(cid);
        if (def) (def as { hp: number }).hp = Math.min(def.hp + 0.5, def.maxHp);
      }

      const nearCentre = enemies.some(e => e.col >= 80 && e.col <= 120);
      this.kingdomsHud.showBattleAlert(nearCentre);

      // Render
      this.battleFx.update(delta);
      this.battleFx.render();
      this.enemyRenderer.render(enemies, this.ENEMY_MAP);
      this.fortUI.render(forts, SPECIES_BONUSES);
      this.renderDefenderOverlays();
      this.renderSelectionHighlight(delta);
      this.kingdomsHud.update(waveState, this.defenderCombat.getDefenders(), delta);

      // Battle camera — zoom + pan to follow the frontline
      if (this.battleCameraMode && enemies.length > 0) {
        this.updateBattleCamera(enemies);
      }
    }

    // Update companion relationships for hovered plant
    if (this.hoveredPlant) {
      this.hudRenderer.setCompanionRelationships(
        getCompanionRelationships(this.hoveredPlant, this.growthSim.getPlants()),
      );
    } else {
      this.hudRenderer.setCompanionRelationships([]);
    }

    // Update HUD every frame
    const period = this.timeClock.getCurrentPeriod();
    const moon = this.timeClock.getMoonPhase();
    const selected = SPECIES_LIST[this.selectedSpeciesIndex] ?? null;
    this.hudRenderer.update(
      this.timeClock.getSeasonName(),
      this.timeClock.getSubSeasonName(),
      this.timeClock.getMoonSymbol(),
      this.timeClock.getMoonPhaseName(),
      this.timeClock.getDayHourName(),
      this.timeClock.getYear(),
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
      this.realtimeMode ? 'REALTIME' : this.timeClock.getSpeedLabel(),
      this.creatureSim.getUniqueSpeciesCount(),
      this.creatureSim.getTotalCount(),
      this.biodiversityTracker.getScore(),
      this.biodiversityTracker.getAchievedCount(),
      this.biodiversityTracker.getTotalMilestoneCount(),
    );

    this.asciiRenderer.setDayPhase(this.timeClock.getPeriodProgress());
    this.asciiRenderer.update(delta);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const col = this.asciiRenderer.getCursorCol();

    switch (event.key) {
      // Cursor movement — horizontal only, follows terrain height
      case 'a': case 'A':
        if (col > 0) this.asciiRenderer.setCursor(col - 1, this.terrainMap.getGroundRow(col - 1));
        break;
      case 'd': case 'D':
        if (col < GRID_CONFIG.cols - 1) this.asciiRenderer.setCursor(col + 1, this.terrainMap.getGroundRow(col + 1));
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

      // Return to main menu
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

      // Prune
      case 'p': case 'P':
        this.tryPrune();
        break;

      // Lay hedge (H for Hedge-laying)
      case 'h': case 'H':
        this.tryLay();
        break;

      // Coppice — cut to ground stool (species must support it, Winter only)
      case 'c': case 'C':
        this.tryCoppice();
        break;

      // Pollard — remove crown, regrow from trunk head (species must support it, Winter only)
      case 'o': case 'O':
        this.tryPollard();
        break;

      // Export JSON
      case 'e': case 'E':
        this.exportSave();
        break;

      // Import JSON
      case 'i': case 'I':
        this.importSave();
        break;

      // Cycle time speed: Paused → Slow → Normal → Fast → Paused
      case 'Tab':
        event.preventDefault();
        this.timeClock.cycleSpeed();
        this.hudRenderer.showMessage(this.timeClock.getSpeedLabel());
        break;

      // Toggle menu overlay
      case 'Escape':
        if (this.screenshotMode) {
          this.exitScreenshotMode();
        } else {
          this.hudRenderer.toggleMenuOverlay();
        }
        break;

      // Screenshot mode — hide UI, zoom to full hedge width
      case 'z': case 'Z':
        if (this.screenshotMode) {
          this.exitScreenshotMode();
        } else {
          this.enterScreenshotMode();
        }
        break;

      // Realtime mode — sync season/weather to real-world date and location
      case 't': case 'T':
        if (this.realtimeMode) {
          this.exitRealtimeMode();
        } else {
          void this.enterRealtimeMode();
        }
        break;

      // hedgeKingdoms — toggle kingdoms mode
      case 'x': case 'X':
        if (this.kingdomsActive) {
          this.exitKingdomsMode();
        } else {
          this.enterKingdomsMode();
        }
        break;

      // hedgeKingdoms — battle camera: cycle through enemies, press again to advance
      case 'b': case 'B':
        if (this.kingdomsActive) {
          const enemies = this.enemySim.getEnemies();
          if (!this.battleCameraMode) {
            this.battleCameraMode = true;
            this.battleCameraIndex = 0;
            this.hudRenderer.showMessage('Battle Camera — press B to cycle enemies, Esc to exit');
          } else {
            this.battleCameraIndex = (this.battleCameraIndex + 1) % Math.max(1, enemies.length);
            if (enemies.length > 0) {
              const e = enemies[this.battleCameraIndex % enemies.length];
              const def = this.ENEMY_MAP[e.defId];
              this.hudRenderer.showMessage(`Tracking: ${def?.name ?? e.defId} (${Math.ceil(e.hp)} HP)`);
            }
          }
        }
        break;
      case 'Escape':
        if (this.battleCameraMode) {
          this.disableBattleCamera();
          this.applyViewMode();
          this.hudRenderer.showMessage('Battle Camera OFF');
          break;
        }
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
    this.growthSim.addPlant(species.id, col, this.terrainMap.getGroundRow(col), this.timeClock.getTotalPeriods());
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), this.timeClock.getCurrentPeriod().season);
    this.hudRenderer.showMessage(`Planted ${species.name}!`);
  }

  private tryPrune(): void {
    const col = this.asciiRenderer.getCursorCol();
    const result = this.growthSim.prunePlant(col);
    if (!result) {
      this.hudRenderer.showMessage('Nothing to prune here');
      return;
    }
    const period = this.timeClock.getCurrentPeriod();
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
    this.hudRenderer.showMessage(`Pruned — ${result}`);
  }

  private tryLay(): void {
    const col = this.asciiRenderer.getCursorCol();
    const period = this.timeClock.getCurrentPeriod();
    const result = this.growthSim.layHedge(col, period.season);

    if (result === null) {
      this.hudRenderer.showMessage('Nothing to lay here');
    } else if (result === 'not-winter') {
      this.hudRenderer.showMessage('Hedge laying can only be done in Winter');
    } else if (result === 'not-mature') {
      this.hudRenderer.showMessage('Only mature plants can be laid');
    } else {
      this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
      this.hudRenderer.showMessage('Hedge laid — will regrow denser and stronger');
    }
  }

  private tryCoppice(): void {
    const col = this.asciiRenderer.getCursorCol();
    const period = this.timeClock.getCurrentPeriod();
    const result = this.growthSim.coppicePlant(col, period.season);
    if (!result) {
      this.hudRenderer.showMessage('Nothing to coppice here');
      return;
    }
    const messages: Record<string, string> = {
      'cannot-coppice': 'This species does not respond to coppicing',
      'not-winter':     'Coppicing must be done in Winter (while dormant)',
      'too-young':      'Plant must be Juvenile or Mature to coppice',
    };
    if (messages[result]) {
      this.hudRenderer.showMessage(messages[result]);
      return;
    }
    const plant = this.growthSim.getPlants().find(p => p.col === col);
    const species = plant ? this.growthSim.getSpeciesFor(plant.speciesId) : null;
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
    this.hudRenderer.showMessage(species?.pruning.coppiceResult ?? 'Coppiced');
  }

  private tryPollard(): void {
    const col = this.asciiRenderer.getCursorCol();
    const period = this.timeClock.getCurrentPeriod();
    const result = this.growthSim.pollardPlant(col, period.season);
    if (!result) {
      this.hudRenderer.showMessage('Nothing to pollard here');
      return;
    }
    const messages: Record<string, string> = {
      'cannot-pollard': 'This species does not suit pollarding',
      'not-winter':     'Pollarding must be done in Winter (before bud-burst)',
      'not-mature':     'Plant must be Mature to pollard',
    };
    if (messages[result]) {
      this.hudRenderer.showMessage(messages[result]);
      return;
    }
    const plant = this.growthSim.getPlants().find(p => p.col === col);
    const species = plant ? this.growthSim.getSpeciesFor(plant.speciesId) : null;
    this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
    this.hudRenderer.showMessage(species?.pruning.pollardResult ?? 'Pollarded');
  }

  private restartGame(): void {
    // Save current score before going back to main menu
    const plants = this.growthSim.getPlants();
    saveHighScore({
      name: this.playerName,
      plants: plants.length,
      creatures: this.creatureSim.getTotalCount(),
      periods: this.timeClock.getTotalPeriods(),
      score: this.biodiversityTracker.getScore(),
    });

    if (this.kingdomsActive || this.autoStartKingdoms) {
      this.scene.start('KingdomsSplashScene');
    } else {
      this.scene.start('SplashScene');
    }
  }

  private cycleViewMode(): void {
    this.disableBattleCamera();
    this.viewMode = (this.viewMode + 1) % 3 as ViewMode;
    this.applyViewMode();
    const names = ['Hedge', 'Underground', 'Full'];
    this.hudRenderer.showMessage(`View: ${names[this.viewMode]}  [V to cycle]`);
  }

  private applyViewMode(): void {
    const cam = this.cameras.main;
    const worldWidth = this.asciiRenderer.getWorldWidth();
    const ch = GRID_CONFIG.cellHeight;

    // Use the deepest terrain ground row so the full surface is always visible
    const maxGR = this.terrainMap.getMaxGroundRow();
    const groundBottom = (maxGR + 1) * ch;

    switch (this.viewMode) {
      case ViewMode.Hedge: {
        const zoneHeight = groundBottom;
        cam.setZoom(cam.height / zoneHeight);
        cam.setBounds(0, 0, worldWidth, zoneHeight);
        cam.scrollY = 0;
        break;
      }
      case ViewMode.Underground: {
        const top = this.terrainMap.getMaxGroundRow() * ch;
        const zoneHeight = GRID_CONFIG.rows * ch - top;
        cam.setZoom(cam.height / zoneHeight);
        cam.setBounds(0, top, worldWidth, zoneHeight);
        cam.scrollY = top;
        break;
      }
      case ViewMode.Full: {
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
      pruneCount: this.growthSim.getPruneCount(),
      laidCount: this.growthSim.getLayCount(),
      currentWeather: this.weatherEngine.getCurrentWeather(),
      selectedSpeciesIndex: this.selectedSpeciesIndex,
      viewMode: this.viewMode,
      starSeed: this.starSeed,
      terrainSeed: this.terrainSeed,
    };
  }

  private applySaveData(save: SaveData): void {
    this.playerName = save.playerName;
    this.timeClock.loadState(save.periodIndex, save.tickAccumulator);
    this.energyManager.setEnergy(save.energy);
    this.growthSim.loadState(save.plants, save.deadPlantCount, save.pruneCount ?? 0, save.laidCount ?? 0);
    this.creatureSim.loadState(save.creatures, save.creatureSpawnCounts, save.creatureNextId);
    this.biodiversityTracker.loadState(save.achievedMilestoneIds, save.creaturePeriods);
    this.weatherEngine.setWeather(save.currentWeather);
    if (save.starSeed !== undefined) {
      this.starSeed = save.starSeed;
      this.starMap.reseed(this.starSeed);
    }
    this.starMap.setWeather(save.currentWeather);

    // Restore terrain (or use flat fallback for pre-terrain saves)
    if (save.terrainSeed !== undefined) {
      this.terrainSeed = save.terrainSeed;
      this.terrainMap  = TerrainMap.generate(this.terrainSeed);
    } else {
      this.terrainMap = TerrainMap.createFlat();
    }
    // Push restored terrain into renderer and rebuild soilMap
    {
      const gRows: number[] = [];
      const biomes: number[] = [];
      for (let c = 0; c < GRID_CONFIG.cols; c++) {
        gRows.push(this.terrainMap.getGroundRow(c));
        biomes.push(this.terrainMap.getBiome(c));
      }
      this.asciiRenderer.setTerrainData(gRows, biomes);
    }
    this.soilMap = new SoilMap(GRID_CONFIG.cols, GRID_CONFIG.rows, this.terrainMap);
    this.growthSim.setSoilMap(this.soilMap);
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
    this.scene.start('GameScene', { playerName: save.playerName || this.playerName, loadSave: save });
  }

  // ── hedgeKingdoms mode ──

  private enterKingdomsMode(): void {
    this.kingdomsActive = true;

    if (this.kingdomsSettings) {
      const { scenario, difficulty, speed } = this.kingdomsSettings;
      const SCENARIO_START_WAVE: Record<string, number> = {
        young_hedge: 1,
        ancient_hedgerow: 1,
        last_stand: 5,
        winter_siege: 10,
      };

      this.waveManager.setDifficulty(difficulty);
      this.timeClock.setSpeedIndex(speed);

      // Non-default scenarios get a pre-built mature hedge
      const startWave = SCENARIO_START_WAVE[scenario];
      if (startWave !== undefined) {
        seedKingdomsHedge(this.growthSim, this.creatureSim, this.terrainMap, this.timeClock);
        const period = this.timeClock.getCurrentPeriod();
        this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);
        if (startWave > 1) {
          this.waveManager.startAtWave(startWave);
        }
      }
    }

    this.defenderCombat.registerCreatures(this.creatureSim.getCreatures());
    if (!this.waveManager.isActive()) {
      this.waveManager.start();
    }
    this.kingdomsHud.setVisible(true);
    this.hudRenderer.showMessage('The hedge is under attack! Click a creature, then right-click a plant to assign defenders.');
  }

  private exitKingdomsMode(): void {
    const wavesReached = this.waveManager.getState().waveNumber;
    this.kingdomsHud.showGameOver(wavesReached);
    this.enemySim.clear();
    this.enemyRenderer.clear();
    this.battleFx.clear();
    this.kingdomsActive = false;
    // Keep kingdomsHud visible to show game-over screen; hide after delay or on keypress
  }

  private onCampaignVictory(): void {
    const plants = this.growthSim.getPlants();
    saveHighScore({
      name: this.playerName,
      plants: plants.length,
      creatures: this.creatureSim.getTotalCount(),
      periods: this.timeClock.getTotalPeriods(),
      score: 10000 + this.biodiversityTracker.getScore(),
    });
    this.kingdomsHud.showVictory(10);
    this.kingdomsActive = false;
    this.enemySim.clear();
    this.enemyRenderer.clear();
    this.battleFx.clear();
  }

  private static readonly ROLE_GLYPHS: Record<number, Glyph> = {
    [DefenderRole.Archer]:      { char: '}', fg: '#e8d050', bg: '#282818' },
    [DefenderRole.Infantry]:    { char: '\u2020', fg: '#c0c0c0', bg: '#181828' },
    [DefenderRole.Heavy]:       { char: '\u2021', fg: '#d4a843', bg: '#282018' },
    [DefenderRole.Scout]:       { char: '!', fg: '#40d0d0', bg: '#102828' },
    [DefenderRole.NightRaider]: { char: '*', fg: '#a060d0', bg: '#201028' },
    [DefenderRole.Sapper]:      { char: '^', fg: '#a08050', bg: '#282010' },
    [DefenderRole.Alchemist]:   { char: '~', fg: '#40c060', bg: '#102818' },
    [DefenderRole.Militia]:     { char: '\u2022', fg: '#a0a0a0', bg: '#181818' },
    [DefenderRole.Harrier]:     { char: 'v', fg: '#70a0d0', bg: '#101828' },
  };

  private disableBattleCamera(): void {
    if (!this.battleCameraMode) return;
    this.battleCameraMode = false;
    this.battleCameraIndex = -1;
  }

  private updateBattleCamera(enemies: readonly EnemyState[]): void {
    if (enemies.length === 0) return;

    // Clamp index to valid range
    const idx = this.battleCameraIndex % enemies.length;
    const target = enemies[idx];

    const cam = this.cameras.main;
    const cw = GRID_CONFIG.cellWidth;
    const ch = GRID_CONFIG.cellHeight;
    const worldWidth = this.asciiRenderer.getWorldWidth();
    const worldHeight = GRID_CONFIG.rows * ch;

    // Expand bounds so the camera can pan to any enemy position
    cam.setBounds(0, 0, worldWidth, worldHeight);

    // Zoom in to ~30 cols — tight on the action
    const targetZoom = cam.width / (30 * cw);
    cam.setZoom(cam.zoom + (targetZoom - cam.zoom) * 0.06);

    // Centre on the tracked enemy
    const targetX = target.col * cw - cam.width / (2 * cam.zoom);
    const targetY = Math.max(0, target.row * ch - cam.height / (2 * cam.zoom));
    cam.scrollX += (targetX - cam.scrollX) * 0.1;
    cam.scrollY += (targetY - cam.scrollY) * 0.1;
  }

  private renderSelectionHighlight(_delta: number): void {
    const SEL_LAYER = 21 as OverlayLayer;
    for (const [c, r] of this.selectionHighlightCells) {
      this.asciiRenderer.clearOverlay(c, r, SEL_LAYER);
    }
    this.selectionHighlightCells = [];

    if (this.selectedCreatureId === null) return;
    const creature = this.creatureSim.getCreatures().find(c => c.id === this.selectedCreatureId);
    if (!creature) { this.selectedCreatureId = null; return; }

    const blink = Math.floor(Date.now() / 400) % 2 === 0;
    if (blink) {
      const selGlyph: Glyph = { char: '\u25a1', fg: '#ffff60' };  // □ yellow square
      this.asciiRenderer.setOverlay(creature.col - 1, creature.row, selGlyph, SEL_LAYER);
      this.asciiRenderer.setOverlay(creature.col + 1, creature.row, selGlyph, SEL_LAYER);
      this.selectionHighlightCells.push([creature.col - 1, creature.row], [creature.col + 1, creature.row]);
    }
  }

  private renderDefenderOverlays(): void {
    const DEFENDER_ICON_LAYER = 21 as OverlayLayer;

    for (const [c, r] of this.defenderOverlayCells) {
      this.asciiRenderer.clearOverlay(c, r, DEFENDER_ICON_LAYER);
    }
    this.defenderOverlayCells = [];

    const defenders = this.defenderCombat.getDefenders();
    const creatures = this.creatureSim.getCreatures();

    for (const [creatureId, def] of defenders) {
      const creature = creatures.find(c => c.id === creatureId);
      if (!creature) continue;
      const glyph = GameScene.ROLE_GLYPHS[def.role];
      if (!glyph) continue;

      const iconRow = creature.row - 1;
      if (iconRow >= 0) {
        this.asciiRenderer.setOverlay(creature.col, iconRow, glyph, DEFENDER_ICON_LAYER);
        this.defenderOverlayCells.push([creature.col, iconRow]);
      }
    }
  }

  private cycleFortType(): void {
    const types: Array<'wall' | 'watchtower' | 'gate'> = ['wall', 'watchtower', 'gate'];
    const idx = types.indexOf(this.currentFortType);
    this.currentFortType = types[(idx + 1) % types.length];
    this.hudRenderer.showMessage(`Fortification: ${this.currentFortType}`);
  }

  // ── Screenshot mode ──

  private enterScreenshotMode(): void {
    this.disableBattleCamera();
    this.screenshotMode = true;

    // Hide HUD and cursor
    this.hudRenderer.setVisible(false);
    this.asciiRenderer.setHideCursor(true);

    // Zoom to fit full hedge width while keeping sky-to-ground visible
    const cam = this.cameras.main;
    const worldWidth = this.asciiRenderer.getWorldWidth();
    const groundBottom = (this.terrainMap.getMaxGroundRow() + 1) * GRID_CONFIG.cellHeight;
    const zoomX = cam.width / worldWidth;
    const zoomY = cam.height / groundBottom;
    const zoom = Math.min(zoomX, zoomY);

    cam.setZoom(zoom);
    cam.setBounds(0, 0, worldWidth, groundBottom);
    cam.scrollX = 0;
    cam.scrollY = 0;
  }

  private exitScreenshotMode(): void {
    this.screenshotMode = false;

    // Restore HUD and cursor
    this.hudRenderer.setVisible(true);
    this.asciiRenderer.setHideCursor(false);

    // Restore previous view mode
    this.applyViewMode();
  }

  // ── Realtime mode ──

  private async enterRealtimeMode(): Promise<void> {
    this.hudRenderer.showMessage('Locating... requesting permission');

    if (!this.realtimeModeManager) {
      this.realtimeModeManager = new RealtimeModeManager();
    }

    try {
      const snapshot = await this.realtimeModeManager.enter();
      this.realtimeMode = true;

      // Sync clock and weather immediately
      this.timeClock.setRealtimePeriod(snapshot.periodIndex, snapshot.periodProgress);
      this.weatherEngine.setWeather(snapshot.weather);

      // Sync environment visuals
      const period = this.timeClock.getCurrentPeriod();
      this.asciiRenderer.setEnvironment(period.season, snapshot.weather);
      this.plantRenderer.renderPlants(this.growthSim.getPlants(), period.season);

      this.hudRenderer.showMessage(
        `Realtime mode  ${this.timeClock.getSubSeasonName()} ${this.timeClock.getSeasonName()}`
      );
    } catch {
      this.realtimeMode = false;
      this.hudRenderer.showMessage('Realtime mode unavailable — check location permissions');
    }
  }

  private exitRealtimeMode(): void {
    this.realtimeMode = false;
    this.hudRenderer.showMessage('Realtime mode off');
  }

  /**
   * Place all terrain-driven decoration: biome-aware grass, slope indicators,
   * springs, underground soil detail, boulder masses, aquifers, clay lenses.
   * All placement is deterministic via terrainMap.decorHash().
   */
  private addTerrainDecoration(): void {
    const cols    = GRID_CONFIG.cols;
    const maxRow  = GRID_CONFIG.rows - 1;

    // ── Biome grass palettes ──────────────────────────────────────────
    type Glyph = { char: string; fg: string };
    const BIOME_GRASS: Glyph[][] = [
      [{ char: '"', fg: '#7aba4a' }, { char: "'", fg: '#6aaa3a' }, { char: ',', fg: '#8aca5a' }, { char: '`', fg: '#7aba4a' }], // Loam
      [{ char: '"', fg: '#6aaa3a' }, { char: '_', fg: '#5a8a2a' }, { char: ',', fg: '#587a30' }, { char: ' ', fg: '#587a30' }], // Clay
      [{ char: '.', fg: '#c8c8b0' }, { char: ',', fg: '#b0b098' }, { char: "'", fg: '#a0a890' }, { char: '\u00B7', fg: '#d0d0c0' }], // Chalk
      [{ char: '%', fg: '#3a4a1a' }, { char: '~', fg: '#2a3a10' }, { char: ',', fg: '#4a5a20' }, { char: '.', fg: '#3a4018' }], // Peat
      [{ char: '.', fg: '#aaa060' }, { char: "'", fg: '#b8b070' }, { char: ',', fg: '#a09050' }, { char: ' ', fg: '#908040' }], // Sandy
    ];

    // ── Surface: grass and slope indicators ──────────────────────────
    for (let col = 0; col < cols; col++) {
      const gRow  = this.terrainMap.getGroundRow(col);
      const biome = this.terrainMap.getBiome(col);

      // Grass (deterministic, ~65% density)
      if (this.terrainMap.decorHash(col, 0) < 0.65) {
        const palette = BIOME_GRASS[biome];
        const g = palette[Math.floor(this.terrainMap.decorHash(col, 1) * palette.length)];
        this.asciiRenderer.setOverlay(col, gRow, g);
      }

      // Spring indicator — where aquifer breaks surface
      if (this.terrainMap.isSpring(col)) {
        this.asciiRenderer.setOverlay(col, gRow, { char: '~', fg: '#4a8aaa' });
      }

      // Slope indicator at height transitions
      if (col > 0) {
        const prevRow = this.terrainMap.getGroundRow(col - 1);
        if (prevRow < gRow) {
          // Ground drops: place \ on transition col
          this.asciiRenderer.setOverlay(col, gRow - 1, { char: '\\', fg: '#4a6a2a' });
        } else if (prevRow > gRow) {
          // Ground rises: place / on previous col
          this.asciiRenderer.setOverlay(col - 1, gRow, { char: '/', fg: '#4a6a2a' });
        }
      }
    }

    // ── Underground: soil detail ──────────────────────────────────────
    for (let col = 0; col < cols; col++) {
      const gRow = this.terrainMap.getGroundRow(col);
      for (let row = gRow + 1; row <= maxRow; row++) {
        const cell = this.soilMap.getSoilAt(col, row);
        const h    = this.terrainMap.decorHash(col, row);

        if (cell.rockDensity > 0.7 && h < 0.14) {
          const rockChars = ['O', '@', '#'];
          const ch = rockChars[Math.floor(this.terrainMap.decorHash(col, row + 1000) * rockChars.length)];
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg: '#4a4a52' });
        } else if (cell.rockDensity > 0.4 && h < 0.07) {
          this.asciiRenderer.setOverlay(col, row, { char: 'o', fg: '#3a3a42' });
        } else if (cell.fertility > 0.8 && h < 0.055) {
          const fertChars = ['%', 'w', '~'];
          const ch = fertChars[Math.floor(this.terrainMap.decorHash(col, row + 2000) * fertChars.length)];
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg: '#4a3a1a' });
        }
      }
    }

    // ── Boulder masses ────────────────────────────────────────────────
    const boulderTemplates: Array<Array<[number, number, string]>> = [
      [[-1, 0, '('], [0, 0, 'O'], [1, 0, ')'], [0, -1, '_'], [0, 1, '-']],
      [[-2, 0, '('], [-1, 0, '='], [0, 0, 'O'], [1, 0, '='], [2, 0, ')'], [0, -1, '_']],
      [[0, 0, 'O'], [0, -1, 'O'], [-1, 0, '('], [1, 0, ')']],
      [[0, 0, '@'], [-1, 0, 'O'], [1, 0, 'O'], [0, -1, 'O'], [-1, -1, '('], [1, -1, ')']],
      [[-1, 0, '('], [0, 0, 'O'], [1, 0, ')']],
    ];
    const boulderColors = ['#5a5a66', '#6a6a72', '#505060', '#585868', '#626270'];

    for (const b of this.terrainMap.getBoulderMasses()) {
      const tIdx = Math.floor(this.terrainMap.decorHash(b.col, b.row) * boulderTemplates.length);
      const template = boulderTemplates[tIdx];
      const cIdx = Math.floor(this.terrainMap.decorHash(b.col + 1, b.row) * boulderColors.length);
      const baseColor = boulderColors[cIdx];
      const bR = parseInt(baseColor.substring(1, 3), 16);
      const bG = parseInt(baseColor.substring(3, 5), 16);
      const bB = parseInt(baseColor.substring(5, 7), 16);

      // Scatter template art across the boulder mass area
      for (let dc = 0; dc < b.width; dc += Math.max(1, Math.floor(b.width / template.length))) {
        const anchorCol = b.col + dc;
        const anchorRow = b.row + Math.floor(b.height / 2);
        for (const [cOff, rOff, ch] of template) {
          const ac = anchorCol + cOff;
          const ar = anchorRow + rOff;
          if (ac < 0 || ac >= cols || ar < 0 || ar > maxRow) continue;
          const bright = this.terrainMap.decorHash(ac, ar) * 0.15;
          const nr = Math.min(255, Math.round(bR + bright * 40));
          const ng = Math.min(255, Math.round(bG + bright * 40));
          const nb = Math.min(255, Math.round(bB + bright * 40));
          const fg = '#' + ((nr << 16) | (ng << 8) | nb).toString(16).padStart(6, '0');
          this.asciiRenderer.setOverlay(ac, ar, { char: ch, fg, bg: '#1a1a22' });
        }
      }
    }

    // ── Aquifers ──────────────────────────────────────────────────────
    const waterChars = ['~', '\u2248', '.', '-'];
    for (const aq of this.terrainMap.getAquifers()) {
      for (let col = aq.colStart; col <= aq.colEnd; col++) {
        for (let w = -aq.width; w <= aq.width; w++) {
          const row = aq.centerRow + w;
          if (row < 0 || row > maxRow) continue;
          const density = 0.65 - Math.abs(w) / (aq.width + 1) * 0.35;
          if (this.terrainMap.decorHash(col * 3 + w, row * 7) > density) continue;
          const ch = waterChars[Math.floor(this.terrainMap.decorHash(col, row + w * 100) * waterChars.length)];
          const fg = Math.abs(w) <= 1 ? '#3a6a8a' : '#2a4a6a';
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg, bg: '#101828' });
        }
      }
    }

    // ── Clay lenses ───────────────────────────────────────────────────
    for (const lens of this.terrainMap.getClayLenses()) {
      for (let col = lens.colStart; col <= lens.colEnd; col++) {
        for (let t = -lens.thickness; t <= lens.thickness; t++) {
          const row = lens.centerRow + t;
          if (row < 0 || row > maxRow) continue;
          if (this.terrainMap.decorHash(col, row + 5000) > 0.6) continue;
          const ch = Math.abs(t) === 0 ? '=' : '-';
          const fg = Math.abs(t) === 0 ? '#8a5a2a' : '#6a4020';
          this.asciiRenderer.setOverlay(col, row, { char: ch, fg, bg: '#1e1208' });
        }
      }
    }
  }

  /** Place animal burrow entrances, tunnels, and chambers underground */
  private addBurrows(ugStart: number, ugEnd: number): void {
    const cols = GRID_CONFIG.cols;

    // Burrow color palette — earthy tones slightly lighter than surrounding soil
    const tunnelFg = '#5a4a30';
    const tunnelBg = '#100e08';
    const chamberFg = '#6a5a3a';
    const chamberBg = '#0e0c06';
    const entranceFg = '#7a6a4a';
    const rootFg = '#4a3a20';

    // Tunnel characters
    const hTunnel = ['-', '=', '-', '~'];
    const vTunnel = ['|', ':', '|', '!'];
    const junctions = ['+', '*', 'o'];
    const chamberChars = ['.', ' ', ',', ' ', '.'];
    const entranceChars = ['O', 'U', 'n'];

    // Generate 6-10 burrow systems spread across the width
    const burrowCount = 6 + Math.floor(this.terrainMap.decorHash(42, 73) * 5);
    const spacing = Math.floor(cols / (burrowCount + 1));

    for (let i = 0; i < burrowCount; i++) {
      // Deterministic position for each burrow system
      const baseCol = spacing * (i + 1) + Math.floor(this.terrainMap.decorHash(i * 17, 31) * spacing * 0.4) - Math.floor(spacing * 0.2);
      if (baseCol < 3 || baseCol >= cols - 3) continue;

      // Entrance at ground surface (row ugStart = 21)
      const entranceChar = entranceChars[Math.floor(this.terrainMap.decorHash(baseCol, 0) * entranceChars.length)];
      this.asciiRenderer.setOverlay(baseCol, ugStart, { char: entranceChar, fg: entranceFg, bg: tunnelBg });
      // Soil disturbed around entrance
      if (baseCol > 0) {
        this.asciiRenderer.setOverlay(baseCol - 1, ugStart, { char: '.', fg: '#5a4a2a' });
      }
      if (baseCol < cols - 1) {
        this.asciiRenderer.setOverlay(baseCol + 1, ugStart, { char: '.', fg: '#5a4a2a' });
      }

      // Main shaft going down from entrance — slight wander
      let curCol = baseCol;
      const shaftDepth = 3 + Math.floor(this.terrainMap.decorHash(baseCol, 100) * 6); // 3-8 rows deep
      const maxRow = Math.min(ugStart + shaftDepth, ugEnd - 2);

      for (let row = ugStart + 1; row <= maxRow; row++) {
        // Slight horizontal wander
        const drift = this.terrainMap.decorHash(curCol + row * 3, row * 7);
        if (drift < 0.2 && curCol > 2) curCol--;
        else if (drift > 0.8 && curCol < cols - 3) curCol++;

        const ch = vTunnel[Math.floor(this.terrainMap.decorHash(curCol, row) * vTunnel.length)];
        this.asciiRenderer.setOverlay(curCol, row, { char: ch, fg: tunnelFg, bg: tunnelBg });
      }

      // Horizontal tunnels branching off the shaft
      const branchCount = 1 + Math.floor(this.terrainMap.decorHash(baseCol + 5, 200) * 3); // 1-3 branches
      for (let b = 0; b < branchCount; b++) {
        const branchRow = ugStart + 2 + Math.floor(this.terrainMap.decorHash(baseCol + b * 11, 300 + b) * (shaftDepth - 1));
        if (branchRow > maxRow || branchRow > ugEnd - 1) continue;

        // Junction mark
        const jChar = junctions[Math.floor(this.terrainMap.decorHash(curCol, branchRow + b * 100) * junctions.length)];
        const jCol = curCol + Math.floor(this.terrainMap.decorHash(baseCol, branchRow) * 2) - 1;
        if (jCol >= 0 && jCol < cols) {
          this.asciiRenderer.setOverlay(jCol, branchRow, { char: jChar, fg: chamberFg, bg: tunnelBg });
        }

        // Branch direction: left or right
        const goRight = this.terrainMap.decorHash(baseCol + b, branchRow) > 0.5;
        const branchLen = 4 + Math.floor(this.terrainMap.decorHash(baseCol + b * 7, 400 + b) * 10); // 4-13 cells
        const startCol = goRight ? jCol + 1 : jCol - 1;
        const dir = goRight ? 1 : -1;

        let tc = startCol;
        for (let t = 0; t < branchLen; t++) {
          if (tc < 1 || tc >= cols - 1) break;

          // Tunnels can wander vertically a little
          let tr = branchRow;
          const vDrift = this.terrainMap.decorHash(tc * 3 + t, branchRow * 5);
          if (vDrift < 0.15 && tr > ugStart + 1) tr--;
          else if (vDrift > 0.85 && tr < ugEnd) tr++;

          const ch = hTunnel[Math.floor(this.terrainMap.decorHash(tc, tr + t * 10) * hTunnel.length)];
          this.asciiRenderer.setOverlay(tc, tr, { char: ch, fg: tunnelFg, bg: tunnelBg });

          // Occasional root dangling into tunnel
          if (tr > ugStart + 1 && this.terrainMap.decorHash(tc + 99, tr) < 0.08) {
            this.asciiRenderer.setOverlay(tc, tr - 1, { char: '\\', fg: rootFg });
          }

          tc += dir;
        }

        // Chamber at the end of each branch — a small widened area
        if (tc >= 2 && tc < cols - 2 && branchRow >= ugStart + 1 && branchRow < ugEnd - 1) {
          // 3x2 or 3x3 little chamber
          const chamberH = 2 + Math.floor(this.terrainMap.decorHash(tc, branchRow + 500) * 2); // 2-3 rows
          for (let cr = 0; cr < chamberH; cr++) {
            for (let cc = -1; cc <= 1; cc++) {
              const cCol = tc + cc;
              const cRow = branchRow + cr;
              if (cCol < 0 || cCol >= cols || cRow < ugStart || cRow > ugEnd) continue;
              const ch = chamberChars[Math.floor(this.terrainMap.decorHash(cCol + cr * 3, cRow * 7) * chamberChars.length)];
              this.asciiRenderer.setOverlay(cCol, cRow, { char: ch, fg: chamberFg, bg: chamberBg });
            }
          }
          // Nest material or food cache decoration in some chambers
          const chamberType = this.terrainMap.decorHash(tc + 77, branchRow + 77);
          if (chamberType < 0.4) {
            // Nest — soft materials
            this.asciiRenderer.setOverlay(tc, branchRow, { char: '@', fg: '#6a5a40', bg: chamberBg });
            this.asciiRenderer.setOverlay(tc, branchRow + 1, { char: '~', fg: '#5a4a30', bg: chamberBg });
          } else if (chamberType < 0.7) {
            // Food cache — seeds and nuts
            this.asciiRenderer.setOverlay(tc, branchRow, { char: '"', fg: '#7a6a3a', bg: chamberBg });
            if (branchRow + 1 <= ugEnd) {
              this.asciiRenderer.setOverlay(tc, branchRow + 1, { char: 'o', fg: '#6a5a2a', bg: chamberBg });
            }
          }
          // else: empty chamber
        }
      }
    }
  }
}
