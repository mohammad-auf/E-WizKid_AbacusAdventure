/**
 * @file activityManager.js
 * @module ActivityManager
 * @description
 *   Phase 4 - Manages activity configurations, difficulty limits, 
 *   and routes validation checks to the appropriate validator.
 */

'use strict';

import { 
  validateNumber, 
  validateAddition, 
  validateSubtraction, 
  validatePlaceValue, 
  validatePattern 
} from './validator.js';

export class ActivityManager {
  /**
   * Routes the expected answer and player answer to the correct validator
   * based on the activityId.
   * @param {string} activityId 
   * @param {number} expectedAnswer 
   * @param {number} playerAnswer 
   * @returns {Object} Validation result { correct, incorrect, expectedAnswer, playerAnswer }
   */
  validate(activityId, expectedAnswer, playerAnswer) {
    switch (activityId) {
      case 'number_garden':
        return validateNumber(expectedAnswer, playerAnswer);
      case 'addition_bridge':
        return validateAddition(expectedAnswer, playerAnswer);
      case 'subtraction_cave':
        return validateSubtraction(expectedAnswer, playerAnswer);
      case 'place_value_tower':
        return validatePlaceValue(expectedAnswer, playerAnswer);
      case 'pattern_train':
        return validatePattern(expectedAnswer, playerAnswer);
      default:
        return validateNumber(expectedAnswer, playerAnswer);
    }
  }
}
