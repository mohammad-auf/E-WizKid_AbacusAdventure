/**
 * @file sound-controller.js
 * @module AudioManager
 * @description
 *   Web Audio API-based manager for synchronized, performant audio playback.
 *   Handles preloading, overlapping protection, throttling, and muting.
 */

'use strict';

import { getSettings, saveSettings } from './progress-storage.js';

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.buffers = new Map(); // soundId -> AudioBuffer
    this.activeSources = new Set(); // Currently playing nodes
    this.throttles = new Map(); // For overlap protection
    this.isMuted = false;
    this.isInitialized = false;

    // Relative to HTML files
    this.assetPath = '../05_Assets/Audio/';
    this.soundFiles = {
      click: 'button_click.wav',
      correct: 'correct_answer.wav',
      incorrect: 'incorrect_answer.wav',
      complete: 'level_complete.wav'
    };
  }

  /**
   * Initializes the AudioContext in suspended state.
   */
  initialize() {
    if (this.isInitialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.warn('Web Audio API not supported in this browser.');
      return;
    }
    
    this.audioCtx = new AudioContext();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);

    // Sync with settings
    const settings = getSettings();
    this.isMuted = !settings.soundEnabled;
    this.masterGain.gain.value = this.isMuted ? 0 : 0.5;

    this.isInitialized = true;
    this.preload();
  }

  /**
   * Unlocks the AudioContext (must be called on user interaction).
   */
  unlockAudio() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Preloads all defined audio files into AudioBuffers.
   */
  async preload() {
    if (!this.audioCtx) return;
    const loadPromises = Object.entries(this.soundFiles).map(async ([id, filename]) => {
      try {
        const response = await fetch(`${this.assetPath}${filename}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
        this.buffers.set(id, audioBuffer);
      } catch (e) {
        console.warn(`[AudioManager] Failed to load ${filename}:`, e);
      }
    });
    await Promise.allSettled(loadPromises);
  }

  /**
   * Plays a sound by ID. Handles overlap protection and throttling.
   * @param {string} soundId - 'click', 'correct', 'incorrect', 'complete'
   * @param {Object} options - { throttleMs: number, onEnded: function }
   * @returns {Promise<void>} Resolves when the sound finishes playing (if successful)
   */
  play(soundId, options = {}) {
    if (!this.audioCtx || this.isMuted) return Promise.resolve();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

    const buffer = this.buffers.get(soundId);
    if (!buffer) return Promise.resolve();

    // Overlap Protection / Throttling
    const now = Date.now();
    const lastPlayed = this.throttles.get(soundId) || 0;
    const throttleMs = options.throttleMs || (soundId === 'click' ? 50 : 0);
    if (now - lastPlayed < throttleMs) {
      return Promise.resolve(); // Throttled
    }
    this.throttles.set(soundId, now);

    return new Promise((resolve) => {
      const source = this.audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.masterGain);

      source.onended = () => {
        this.activeSources.delete(source);
        if (options.onEnded) options.onEnded();
        resolve();
      };

      this.activeSources.add(source);
      source.start(0);
    });
  }

  /**
   * Stops all currently playing sounds.
   */
  stopAll() {
    this.activeSources.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    this.activeSources.clear();
  }

  /**
   * Pauses the AudioContext (stops time progression).
   */
  pause() {
    if (this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend();
    }
  }

  /**
   * Toggles the mute state and persists to storage.
   * @returns {boolean} The new isMuted state.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : 0.5;
    }
    
    const settings = getSettings();
    settings.soundEnabled = !this.isMuted;
    saveSettings(settings);
    
    return this.isMuted;
  }

  /**
   * Sets the global volume (0.0 to 1.0).
   */
  setVolume(val) {
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, val));
    }
  }

  /**
   * Cleans up the audio context.
   */
  destroy() {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.isInitialized = false;
  }
}

export const audioManager = new AudioManager();

