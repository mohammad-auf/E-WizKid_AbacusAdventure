/**
 * @file data.js
 * @module Data
 * @description 
 *   Phase 5 - Dynamic JSON data loading, parsing, and filtering.
 */

'use strict';

let _levelsData = null;
let _questionsData = null;

/**
 * Pre-fetches all necessary JSON data. Must be called before accessing data.
 */
export async function fetchGameData() {
  if (_levelsData && _questionsData) return;

  try {
    // Files are relative to the HTML pages inside 01_Website/
    const cacheBuster = '?v=' + Date.now();
    const [levelsRes, questionsRes] = await Promise.all([
      fetch('../04_GameData/levels.json' + cacheBuster),
      fetch('../04_GameData/questions.json' + cacheBuster)
    ]);

    if (!levelsRes.ok || !questionsRes.ok) {
      throw new Error('HTTP Error when fetching JSON data.');
    }

    _levelsData = await levelsRes.json();
    _questionsData = await questionsRes.json();
  } catch (error) {
    console.error('[Data] Error fetching JSON:', error);
    // Graceful degradation: empty data structure to prevent crashes
    _levelsData = { activities: [] };
    _questionsData = { questions: [] };
  }
}

/**
 * Helper to map old integer levels to the new string IDs
 */
function normalizeLevel(level) {
  const map = {
    '1': 'beginner',
    '2': 'intermediate',
    '3': 'advanced',
    '4': 'advanced', // fallback 
    '5': 'advanced'  // fallback
  };
  return map[String(level)] || level;
}

/**
 * Returns level metadata (including thresholds and time limits).
 * @param {string} activityId 
 * @param {string} level 
 */
export function getLevelConfig(activityId, level) {
  level = normalizeLevel(level);
  if (!_levelsData || !_levelsData.levels) return null;
  return _levelsData.levels.find(l => l.id === level) || null;
}

/**
 * Returns a randomized subset of questions for the given activity and level.
 * @param {string} activityId 
 * @param {string} level 
 * @param {number} limit 
 */
export function getQuestionsForSession(activityId, level, limit) {
  level = normalizeLevel(level);
  let pool = _questionsData.questions.filter(q => q.activity === activityId && q.level === level);
  
  // Shuffle questions randomly
  pool.sort(() => Math.random() - 0.5);
  
  if (limit && limit > 0) {
    pool = pool.slice(0, limit);
  }
  return pool;
}
