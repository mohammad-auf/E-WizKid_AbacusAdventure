/**
 * @file questionManager.js
 * @module QuestionManager
 * @description
 *   Phase 5 - Question generation and tracking using fetched JSON data.
 */

'use strict';

import { getQuestionsForSession } from './data.js';

export class QuestionManager {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
  }

  /**
   * Loads and shuffles questions from the parsed JSON data.
   * @param {string} activityId 
   * @param {number|string} level 
   * @param {number} limit 
   */
  loadQuestions(activityId, level, limit) {
    this.questions = getQuestionsForSession(activityId, level, limit);
    this.currentIndex = 0;
  }

  /**
   * Returns the currently active question object.
   */
  getCurrentQuestion() {
    return this.questions[this.currentIndex];
  }

  /**
   * Moves the internal pointer to the next question.
   */
  advanceQuestion() {
    this.currentIndex++;
  }

  /**
   * Checks if all questions have been answered.
   */
  isComplete() {
    return this.currentIndex >= this.questions.length;
  }

  /**
   * Returns total number of questions for the session.
   */
  getTotalQuestions() {
    return this.questions.length;
  }

  /**
   * Returns the current question index (0-based).
   */
  getCurrentIndex() {
    return this.currentIndex;
  }
}
