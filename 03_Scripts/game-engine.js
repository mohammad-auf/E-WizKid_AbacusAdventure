/**
 * @file game.js
 * @module Game
 * @description
 *   Phase 5 - E-Wiz Kid Abacus Adventure – Game Loop & State Machine.
 *   Fully integrated with JSON loading, scoring, sound, and storage.
 */

'use strict';

import { getValue as getAbacusValue, reset as resetAbacus, lock, unlock, setActiveRods, setValue } from './abacus-controller.js';
import { QuestionManager } from './question-manager.js';
import { ActivityManager } from './activityManager.js';
import { ScoreManager } from './scoreManager.js';
import { fetchGameData, getLevelConfig } from './data.js';
import { saveSessionResults } from './progress-storage.js';
import { audioManager } from './sound-controller.js';
import { showFeedback, hideFeedback, updateHUD, showQuestion } from './ui.js';

const GameState = Object.freeze({
  IDLE:           'IDLE',
  LOADING:        'LOADING',
  PLAYING:        'PLAYING',
  EVALUATING:     'EVALUATING',
  FEEDBACK:       'FEEDBACK',
  NEXT_QUESTION:  'NEXT_QUESTION',
  GAME_OVER:      'GAME_OVER',
});

const FEEDBACK_DISPLAY_MS = 2000;

let _session = _createEmptySession();
const questionManager = new QuestionManager();
const activityManager = new ActivityManager();
let scoreManager = null;

export async function initGame() {
  const params = new URLSearchParams(window.location.search);
  const activityId = params.get('activity');
  const levelId = params.get('level');

  if (!activityId || !levelId) {
    window.location.href = './activity-selection.html';
    return;
  }

  await startSession({ activityId, level: levelId });
}

export async function startSession(config) {
  try {
    _setState(GameState.LOADING);

    // 1. Fetch JSON data
    await fetchGameData();
    const levelConfig = getLevelConfig(config.activityId, config.level);
    if (!levelConfig) throw new Error('Level config not found');

    // 2. Init Managers
    _session = _createEmptySession();
    _session.activityId = config.activityId;
    _session.level = config.level;
    
    scoreManager = new ScoreManager(levelConfig.stars);
    questionManager.loadQuestions(config.activityId, config.level, levelConfig.questions_per_session);
    
    if (questionManager.getTotalQuestions() === 0) {
      alert('More levels coming soon! Returning to activity selection.');
      window.location.href = './activity-selection.html';
      return;
    }

    scoreManager.setTotalQuestions(questionManager.getTotalQuestions());

    // 3. Configure Abacus Rods based on difficulty
    const activeRods = levelConfig.active_rods || ['ones'];
    setActiveRods(activeRods);

    // 4. Update initial HUD
    updateHUD(scoreManager.getScore(), {
      activityId: config.activityId,
      questionIndex: questionManager.getCurrentIndex(),
      totalQuestions: questionManager.getTotalQuestions(),
      progress: 0,
      stars: scoreManager.getStars()
    });

    _showNextQuestion();
  } catch (err) {
    console.error('[Game] Failed to start session:', err);
    alert('GAME START ERROR: ' + err.message + '\\n\\nPlease tell the AI about this error!');
    window.location.href = './activity-selection.html';
  }
}

export async function submitAnswer() {
  if (_session.status !== GameState.PLAYING) return;

  _setState(GameState.EVALUATING);

  const playerAnswer = getAbacusValue();
  const question     = questionManager.getCurrentQuestion();
  const timeMs       = Date.now() - (_session.questionStartMs ?? Date.now());
  
  const validationResult = activityManager.validate(_session.activityId, question.answer, playerAnswer);
  const isLastQuestion = questionManager.getCurrentIndex() === questionManager.getTotalQuestions() - 1;

  if (validationResult.correct) {
    scoreManager.addCorrectAnswer(timeMs);
    
    // Play correct sound and wait for it to finish BEFORE showing animation
    await audioManager.play('correct');
    showFeedback(true);
    
    updateHUD(scoreManager.getScore(), {
      questionIndex: questionManager.getCurrentIndex(),
      totalQuestions: questionManager.getTotalQuestions(),
      progress: ((questionManager.getCurrentIndex() + 1) / questionManager.getTotalQuestions()) * 100,
      stars: scoreManager.getStars()
    });

    _setState(GameState.FEEDBACK);

    if (isLastQuestion) {
      // For level complete, wait for celebration animation to run before advancing
      setTimeout(() => {
        hideFeedback();
        _advanceQuestion();
      }, 1500);
    } else {
      setTimeout(() => {
        hideFeedback();
        _advanceQuestion();
      }, FEEDBACK_DISPLAY_MS);
    }
  } else {
    scoreManager.addIncorrectAnswer();
    
    // Play incorrect sound immediately
    audioManager.play('incorrect');
    showFeedback(false);

    updateHUD(scoreManager.getScore(), {
      questionIndex: questionManager.getCurrentIndex(),
      totalQuestions: questionManager.getTotalQuestions(),
      progress: ((questionManager.getCurrentIndex() + 1) / questionManager.getTotalQuestions()) * 100,
      stars: scoreManager.getStars()
    });

    _setState(GameState.FEEDBACK);

    setTimeout(() => {
      hideFeedback();
      _advanceQuestion();
    }, FEEDBACK_DISPLAY_MS);
  }
}

export function pauseGame() {
  if (_session.status !== GameState.PLAYING) return;
  lock();
}

export function resumeGame() {
  unlock();
}

export function getSessionSummary() {
  return Object.freeze({ ..._session });
}

function _createEmptySession() {
  return {
    status:          GameState.IDLE,
    activityId:      '',
    level:           1,
    questionStartMs: null
  };
}

function _setState(newState) {
  _session.status = newState;
}

function _showNextQuestion() {
  if (questionManager.isComplete()) {
    _endSession();
    return;
  }

  const question = questionManager.getCurrentQuestion();
  resetAbacus();

  updateHUD(scoreManager.getScore(), {
    questionIndex: questionManager.getCurrentIndex(),
    totalQuestions: questionManager.getTotalQuestions(),
    stars: scoreManager.getStars()
  });

  if (question.activity === 'pattern_train') {
    lock();
    setValue(question.answer);
    showQuestion(question);

    const previewTime = (question.preview_seconds || 3) * 1000;
    setTimeout(() => {
      resetAbacus();
      unlock();
      _session.questionStartMs = Date.now();
      _setState(GameState.PLAYING);
    }, previewTime);
  } else {
    unlock();
    _session.questionStartMs = Date.now();
    _setState(GameState.PLAYING);
    showQuestion(question);
  }
}

function _advanceQuestion() {
  questionManager.advanceQuestion();
  _setState(GameState.NEXT_QUESTION);

  if (questionManager.isComplete()) {
    _endSession();
  } else {
    _showNextQuestion();
  }
}

async function _endSession() {
  _setState(GameState.GAME_OVER);
  
  // Award stars logic (already handled by scoreManager)
  // Play level complete sound and wait
  await audioManager.play('complete');

  const results = {
    activityId: _session.activityId,
    level: _session.level,
    score: scoreManager.getScore(),
    correctCount: scoreManager.correctCount,
    incorrectCount: scoreManager.incorrectCount,
    totalCount: scoreManager.totalQuestions,
    accuracy: scoreManager.getAccuracy(),
    stars: scoreManager.getStars(),
    completedAt: new Date().toISOString()
  };

  saveSessionResults(results);
  window.location.href = './results.html';
}

export {
  GameState
};

