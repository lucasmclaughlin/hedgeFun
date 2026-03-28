import type { SaveData } from '@/types';

const STORAGE_KEY = 'hedgefun_autosave';
const SAVE_VERSION = 1;

export class SaveManager {
  /** Save game state to localStorage */
  autoSave(data: Omit<SaveData, 'version' | 'timestamp'>): void {
    const save: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      ...data,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(save));
    } catch {
      // localStorage full or unavailable — silently fail
    }
  }

  /** Load auto-save from localStorage */
  loadAutoSave(): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as SaveData;
      if (!data.version || data.version > SAVE_VERSION) return null;
      return data;
    } catch {
      return null;
    }
  }

  /** Check if an auto-save exists */
  hasAutoSave(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  /** Clear auto-save */
  clearAutoSave(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Export game state as a JSON string (for file download) */
  exportJSON(data: Omit<SaveData, 'version' | 'timestamp'>): string {
    const save: SaveData = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      ...data,
    };
    return JSON.stringify(save, null, 2);
  }

  /** Parse and validate an imported JSON string */
  importJSON(json: string): SaveData | null {
    try {
      const data = JSON.parse(json) as SaveData;
      if (!data.version || !data.plants || !Array.isArray(data.plants)) return null;
      return data;
    } catch {
      return null;
    }
  }

  /** Trigger a browser file download with the save data */
  downloadSave(data: Omit<SaveData, 'version' | 'timestamp'>): void {
    const json = this.exportJSON(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hedgefun-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Open a file picker and return the parsed save data */
  promptImport(): Promise<SaveData | null> {
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
