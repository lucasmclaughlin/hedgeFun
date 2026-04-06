import type { PlantState, CreatureBehavior, CreatureActivity } from '@/types';

const AUTOSAVE_KEY = 'hedgekingdoms_autosave';
const HIGHSCORES_KEY = 'hedgekingdoms_highscores';
const SAVE_VERSION = 1;
const MAX_HIGH_SCORES = 10;

export interface KingdomsSaveData {
  version: number;
  timestamp: number;
  playerName: string;
  scenario: string;
  difficulty: string;
  waveNumber: number;
  lives: number;
  plants: PlantState[];
  creatures: Array<{
    defId: string; col: number; row: number;
    homeCol: number; facing: number;
    behavior: CreatureBehavior; activity: CreatureActivity;
  }>;
  defenderAssignments: Array<[number, number]>;  // [creatureId, plantCol]
  periodIndex: number;
  tickAccumulator: number;
  energy: number;
}

export interface KingdomsHighScore {
  name: string;
  wavesReached: number;
  score: number;
  scenario: string;
  difficulty: string;
}

type SavePayload = Omit<KingdomsSaveData, 'version' | 'timestamp'>;

export class KingdomsSaveManager {
  /** Save game state to localStorage */
  autoSave(data: SavePayload): void {
    const save: KingdomsSaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      ...data,
    };
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(save));
    } catch {
      // localStorage full or unavailable — silently fail
    }
  }

  /** Load auto-save from localStorage */
  loadAutoSave(): KingdomsSaveData | null {
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as KingdomsSaveData;
      if (!data.version || data.version > SAVE_VERSION) return null;
      return data;
    } catch {
      return null;
    }
  }

  /** Check if an auto-save exists */
  hasAutoSave(): boolean {
    return localStorage.getItem(AUTOSAVE_KEY) !== null;
  }

  /** Clear auto-save */
  clearAutoSave(): void {
    localStorage.removeItem(AUTOSAVE_KEY);
  }

  // ── High scores (static — usable without instantiation) ──────────

  static loadHighScores(): KingdomsHighScore[] {
    try {
      const raw = localStorage.getItem(HIGHSCORES_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as KingdomsHighScore[];
    } catch {
      return [];
    }
  }

  static saveHighScore(entry: KingdomsHighScore): void {
    const scores = KingdomsSaveManager.loadHighScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, MAX_HIGH_SCORES);
    try {
      localStorage.setItem(HIGHSCORES_KEY, JSON.stringify(top));
    } catch {
      // silently fail
    }
  }

  // ── Export / Import ──────────────────────────────────────────────

  /** Export game state as a JSON string (for file download) */
  exportJSON(data: SavePayload): string {
    const save: KingdomsSaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      ...data,
    };
    return JSON.stringify(save, null, 2);
  }

  /** Parse and validate an imported JSON string */
  importJSON(json: string): KingdomsSaveData | null {
    try {
      const data = JSON.parse(json) as KingdomsSaveData;
      if (!data.version || !data.plants || !Array.isArray(data.plants)) return null;
      return data;
    } catch {
      return null;
    }
  }

  /** Trigger a browser file download with the save data */
  downloadSave(data: SavePayload): void {
    const json = this.exportJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedgekingdoms-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Open a file picker and return the parsed save data */
  promptImport(): Promise<KingdomsSaveData | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = () => {
          const result = this.importJSON(reader.result as string);
          resolve(result);
        };
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };
      input.click();
    });
  }
}
