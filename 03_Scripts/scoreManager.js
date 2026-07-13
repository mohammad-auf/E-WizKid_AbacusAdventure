/**
 * @file scoreManager.js
 * @module ScoreManager
 * @description
 *   Phase 5 - Handles scoring logic, speed bonuses, and star awards based
 *   on the thresholds provided in levels.json.
 */

'use strict';

export class ScoreManager {
  constructor(starThresholds) {
    this.score = 0;
    this.correctCount = 0;
    this.incorrectCount = 0;
    this.totalQuestions = 0;
    // Default fallback thresholds if none provided
    this.thresholds = starThresholds || { one: 30, two: 50, three: 70 };
  }

  /**
   * Set total questions for accuracy calculation.
   * @param {number} total 
   */
  setTotalQuestions(total) {
    this.totalQuestions = total;
  }

  /**
   * Process a correct answer and calculate speed bonus.
   * @param {number} timeMs Time taken in milliseconds
   */
  addCorrectAnswer(timeMs) {
    this.correctCount++;
    this.score += this._calculatePoints(timeMs);
  }

  /**
   * Process an incorrect answer.
   */
  addIncorrectAnswer() {
    this.incorrectCount++;
  }

  /**
   * Calculate points. Faster answers (under 5 seconds) yield bonus points.
   * @param {number} timeMs 
   * @private
   */
  _calculatePoints(timeMs) {
    // Return exactly 10 points per correct question, so each question is rated out of 10
    return 10;
  }

  /**
   * Returns current accuracy as an integer percentage (0-100).
   */
  getAccuracy() {
    const totalAttempted = this.correctCount + this.incorrectCount;
    if (totalAttempted === 0) return 0;
    return Math.round((this.correctCount / totalAttempted) * 100);
  }

  /**
   * Returns the number of stars earned based on the number of correct answers
   * compared to the level's star thresholds (e.g. one:2, two:4, three:6).
   * Thresholds are expressed as correct-answer counts, not point totals.
   */
  getStars() {
    if (this.correctCount >= this.thresholds.three) return 3;
    if (this.correctCount >= this.thresholds.two)   return 2;
    if (this.correctCount >= this.thresholds.one)   return 1;
    return 0;
  }

  /**
   * Returns the current total score.
   */
  getScore() {
    return this.score;
  }
}
