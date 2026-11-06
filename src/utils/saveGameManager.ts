/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SavedGameState } from '../types/saveGame';

export const SAVE_STORAGE_KEY = 'naija_life_savegame_v1';

export function hasSavedGame(): boolean {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && parsed.playerName && parsed.birthStateId);
  } catch {
    return false;
  }
}

export function loadSavedGame(): SavedGameState | null {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGameState;
    if (!parsed.playerName || !parsed.birthStateId) return null;
    return parsed;
  } catch (err) {
    console.error('Failed to load saved game:', err);
    return null;
  }
}

export function saveGameState(state: SavedGameState): boolean {
  try {
    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
    return false;
  }
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(SAVE_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear saved game:', err);
  }
}

export function exportSaveFile(state: SavedGameState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const sanitizedName = state.playerName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `naija_life_${sanitizedName}_day${state.gameDay}.json`;
  
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importSaveFile(file: File): Promise<SavedGameState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as SavedGameState;
        
        // Basic validation
        if (!parsed.playerName || !parsed.birthStateId || !parsed.currentStateId || !parsed.wallet) {
          throw new Error('Invalid Naija Life save file format: missing essential player fields.');
        }

        resolve(parsed);
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Unable to parse JSON file'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };
    reader.readAsText(file);
  });
}
