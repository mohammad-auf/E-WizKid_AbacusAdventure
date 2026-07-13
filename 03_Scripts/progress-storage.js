/**
 * @file storage.js
 * @module Storage
 * @description 
 *   Phase 5 - LocalStorage wrapper for persistence.
 *   Tracks settings, progress, stars, and last session.
 */

'use strict';

const KEYS = {
  SETTINGS: 'ewk_settings',
  LAST_SESSION: 'ewk_last_session',
  PROGRESS: 'ewk_progress'
};

const DEFAULT_SETTINGS = {
  theme: 'auto',
  soundEnabled: true
};

export async function initStorage() {
  try {
    getSettings();
  } catch (e) {
    console.error('[Storage] Init failed', e);
  }
}

/**
 * Retrieves global user settings.
 */
export function getSettings() {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves new settings by merging them with existing.
 */
export function saveSettings(newSettings) {
  try {
    const current = getSettings();
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...newSettings }));
  } catch (e) {
    console.warn('[Storage] Could not save settings');
  }
}

/**
 * Persists the result of a single session and updates lifetime progress.
 * @param {Object} results
 */
export function saveSessionResults(results) {
  try {
    // Overwrite last session for Results screen
    localStorage.setItem(KEYS.LAST_SESSION, JSON.stringify(results));

    // Update lifetime progress (high scores and stars)
    const progress = getProgress();
    const key = `${results.activityId}_${results.level}`;
    
    if (!progress[key]) {
      progress[key] = { highScore: 0, stars: 0 };
    }
    
    // Only update if current performance beats historical
    if (results.score > progress[key].highScore) {
      progress[key].highScore = results.score;
    }
    if (results.stars > progress[key].stars) {
      progress[key].stars = results.stars;
    }

    // Save generic continue data
    progress.lastActivity = results.activityId;
    progress.lastLevel = results.level;

    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.warn('[Storage] Could not save results');
  }
}

/**
 * Retrieves the data for the immediate last session.
 */
export function getLastSessionResults() {
  try {
    const data = localStorage.getItem(KEYS.LAST_SESSION);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Retrieves the full progress dictionary.
 */
export function getProgress() {
  try {
    const data = localStorage.getItem(KEYS.PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Wipes all gameplay progress.
 */
export function clearProgress() {
  try {
    localStorage.removeItem(KEYS.PROGRESS);
    localStorage.removeItem(KEYS.LAST_SESSION);
  } catch (e) {
    console.warn('[Storage] Could not clear progress');
  }
}
