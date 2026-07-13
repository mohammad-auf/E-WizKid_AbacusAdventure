/**
 * @file validator.js
 * @module Validator
 * @description
 *   Phase 4 - Answer validation logic for E-Wiz Kid Abacus Adventure.
 *   Provides dedicated validation methods for each activity type.
 */

'use strict';

/**
 * Builds the standard validation response object.
 * @param {boolean} isCorrect
 * @param {number|Object} expectedAnswer
 * @param {number|Object} playerAnswer
 * @returns {Object}
 */
function _buildResult(isCorrect, expectedAnswer, playerAnswer) {
  return {
    correct: isCorrect,
    incorrect: !isCorrect,
    expectedAnswer: expectedAnswer,
    playerAnswer: playerAnswer
  };
}

/**
 * Validates Number Garden (Counting)
 */
export function validateNumber(expectedAnswer, playerAnswer) {
  return _buildResult(expectedAnswer === playerAnswer, expectedAnswer, playerAnswer);
}

/**
 * Validates Addition Bridge
 */
export function validateAddition(expectedAnswer, playerAnswer) {
  return _buildResult(expectedAnswer === playerAnswer, expectedAnswer, playerAnswer);
}

/**
 * Validates Subtraction Cave
 */
export function validateSubtraction(expectedAnswer, playerAnswer) {
  return _buildResult(expectedAnswer === playerAnswer, expectedAnswer, playerAnswer);
}

/**
 * Validates Place Value Tower
 * Compares total abacus value. 
 */
export function validatePlaceValue(expectedAnswer, playerAnswer) {
  return _buildResult(expectedAnswer === playerAnswer, expectedAnswer, playerAnswer);
}

/**
 * Validates Pattern Train
 */
export function validatePattern(expectedAnswer, playerAnswer) {
  return _buildResult(expectedAnswer === playerAnswer, expectedAnswer, playerAnswer);
}
