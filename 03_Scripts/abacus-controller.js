/**
 * @file abacus.js
 * @module Abacus
 * @description
 *   E-Wiz Kid Abacus Adventure – Interactive Abacus Engine (Phase 3).
 *
 *   Model:
 *   ─────────────────────────────────────────────────────────────
 *   Three vertical rods: Hundreds · Tens · Ones
 *   Each rod has 9 beads. Beads are "active" (pushed toward the
 *   counting beam at the bottom) or "inactive" (resting at top).
 *   Activating bead N also activates all beads below N (gravity
 *   model), so rod value = count of active beads (0 – 9).
 *
 *   Total value = (hundreds × 100) + (tens × 10) + (ones × 1)
 *   Maximum representable number: 999.
 *
 *   Interaction:
 *   ─────────────────────────────────────────────────────────────
 *   • Mouse   – click any bead
 *   • Touch   – tap any bead
 *   • Keyboard – Tab to focus, Enter / Space to toggle, arrow keys
 *                to navigate between beads
 *
 *   Events:
 *   ─────────────────────────────────────────────────────────────
 *   'abacus:change'   – fires on every value change
 *   'abacus:reset'    – fires after reset()
 *   'abacus:locked'   – fires after lock()
 *   'abacus:unlocked' – fires after unlock()
 *
 *   Public API:
 *   ─────────────────────────────────────────────────────────────
 *   initAbacus(options?)  – boot: render DOM, attach events
 *   getValue()            – read current numeric value
 *   setValue(n)           – set abacus to display number n
 *   reset()               – clear all beads to 0
 *   lock()                – prevent interaction
 *   unlock()              – re-enable interaction
 *   getRodValue(rodIndex) – read individual rod value (0–9)
 *   ABACUS_CHANGE_EVENT   – event name constant
 *
 * @version 3.0.0
 * @since   Phase 3
 */

'use strict';

import { audioManager } from './sound-controller.js';

/* ══════════════════════════════════════════════════════════════
   SECTION 1 – CONSTANTS
   ══════════════════════════════════════════════════════════════ */

/** Number of beads per rod (supports values 0–9). */
const BEADS_PER_ROD = 9;

/**
 * Rod definitions, rendered left-to-right on screen.
 * Index 0 = Hundreds (leftmost), index 2 = Ones (rightmost).
 *
 * @type {Array<{id: string, label: string, colorClass: string, placeValue: number}>}
 */
const ROD_DEFS = [
  { id: 'hundreds', label: 'Hundreds', colorClass: 'bead--hundreds', placeValue: 100 },
  { id: 'tens',     label: 'Tens',     colorClass: 'bead--tens',     placeValue: 10  },
  { id: 'ones',     label: 'Ones',     colorClass: 'bead--ones',     placeValue: 1   },
];

/** Maximum value representable (9 + 90 + 900). */
const MAX_VALUE = 999;

/** Custom event names. */
const ABACUS_CHANGE_EVENT   = 'abacus:change';
const ABACUS_RESET_EVENT    = 'abacus:reset';
const ABACUS_LOCKED_EVENT   = 'abacus:locked';
const ABACUS_UNLOCKED_EVENT = 'abacus:unlocked';

/** CSS class applied to bead when active (pushed toward beam). */
const CLASS_ACTIVE   = 'bead--active';
/** CSS class applied to bead when inactive (resting). */
const CLASS_INACTIVE = 'bead--inactive';
/** CSS class applied to root when abacus is locked. */
const CLASS_LOCKED   = 'abacus--locked';

/** Animation duration for bead position change (ms). Matches game.css transition. */
const BEAD_ANIM_MS = 150;

/* ══════════════════════════════════════════════════════════════
   SECTION 2 – MODULE STATE
   ══════════════════════════════════════════════════════════════ */

/**
 * Internal bead state per rod.
 * rodState[rodIndex][beadIndex] = true if active.
 * Bead 0 = topmost (value near 0 side), bead 8 = bottommost (counting beam).
 *
 * @type {boolean[][]}
 */
let _rodState = [];

/**
 * Root container element of the abacus (the .abacus-frame).
 * Resolved during initAbacus().
 *
 * @type {HTMLElement|null}
 */
let _containerEl = null;

/**
 * The .abacus-stage element — events are dispatched on this.
 *
 * @type {HTMLElement|null}
 */
let _stageEl = null;

/** Whether the abacus is locked (non-interactive). */
let _locked = false;

/** The list of currently active rod IDs. Inactive rods are disabled. */
let _activeRods = ['hundreds', 'tens', 'ones'];

/** Whether initAbacus() has completed successfully. */
let _initialised = false;

/** Whether the user is currently dragging beads. */
let _isDragging = false;

/** The target state (true/false) when dragging across beads. */
let _dragTargetState = null;

/** cached rod bead container elements for fast DOM access. */
let _rodEls = []; // HTMLElement[] — one per rod, the .rod-column__beads div

/* ══════════════════════════════════════════════════════════════
   SECTION 3 – PUBLIC API
   ══════════════════════════════════════════════════════════════ */

/**
 * initAbacus()
 * ────────────
 * Boot the abacus widget. Renders the DOM inside .abacus-frame
 * (which already exists in game.html from Phase 2) and attaches
 * all event listeners.
 *
 * @param {Object}  [options={}]
 * @param {boolean} [options.startAtZero=true] – Reset all beads on init.
 * @returns {Promise<void>}
 */
async function initAbacus(options = {}) {
  const { startAtZero = true } = options;

  _stageEl = document.querySelector('.abacus-stage');
  if (!_stageEl) {
    console.warn('[Abacus] .abacus-stage not found – skipping init.');
    return;
  }

  _containerEl = _stageEl.querySelector('.abacus-frame');
  if (!_containerEl) {
    console.warn('[Abacus] .abacus-frame not found – skipping init.');
    return;
  }

  // Initialise internal bead state (all inactive = 0)
  _initState();

  // Replace Phase-2 static HTML beads with JS-controlled beads
  _renderDOM();

  // Attach delegated event listeners
  _attachEvents();

  // Start from zero (overrides Phase-2 static active beads)
  if (startAtZero) _applyStateToDOM();

  _initialised = true;
}

/**
 * getValue()
 * ──────────
 * Return the total numeric value currently shown on the abacus.
 *
 * @returns {number} 0 – 999
 */
function getValue() {
  return ROD_DEFS.reduce((total, rodDef, rodIndex) => {
    return total + getRodValue(rodIndex) * rodDef.placeValue;
  }, 0);
}

/**
 * getRodValue()
 * ─────────────
 * Return the digit (0–9) for a single rod.
 *
 * @param {number} rodIndex – 0 = Hundreds, 1 = Tens, 2 = Ones
 * @returns {number}
 */
function getRodValue(rodIndex) {
  if (!_rodState[rodIndex]) return 0;
  return _rodState[rodIndex].filter(Boolean).length;
}

/**
 * setValue()
 * ──────────
 * Set the abacus to display a specific number.
 * Decomposes the number into hundreds/tens/ones digits
 * and updates bead state + DOM accordingly.
 *
 * @param {number} n – The number to display (0 – 999).
 * @returns {void}
 */
function setValue(n) {
  if (!_initialised) return;

  // Clamp to valid range
  const clamped = Math.max(0, Math.min(MAX_VALUE, Math.round(n)));

  const hundreds = Math.floor(clamped / 100);
  const tens     = Math.floor((clamped % 100) / 10);
  const ones     = clamped % 10;

  const digits = [hundreds, tens, ones];

  ROD_DEFS.forEach((_, rodIndex) => {
    _setRodValue(rodIndex, digits[rodIndex]);
  });

  _applyStateToDOM();
  _updateDisplayEl();
  _dispatchEvent(ABACUS_CHANGE_EVENT, { value: getValue() });
}

/**
 * reset()
 * ───────
 * Clear all beads to zero.
 *
 * @returns {void}
 */
function reset() {
  if (!_initialised) return;

  _initState();
  _applyStateToDOM();
  _updateDisplayEl();
  _dispatchEvent(ABACUS_RESET_EVENT, { value: 0 });
  _dispatchEvent(ABACUS_CHANGE_EVENT, { value: 0 });
}

/**
 * lock()
 * ──────
 * Prevent player interaction (called during feedback animations).
 *
 * @returns {void}
 */
function lock() {
  _locked = true;
  _containerEl?.classList.add(CLASS_LOCKED);
  _stageEl?.setAttribute('aria-disabled', 'true');

  _applyStateToDOM();
  _dispatchEvent(ABACUS_LOCKED_EVENT, {});
}

/**
 * unlock()
 * ────────
 * Re-enable player interaction.
 *
 * @returns {void}
 */
function unlock() {
  _locked = false;
  _containerEl?.classList.remove(CLASS_LOCKED);
  _stageEl?.removeAttribute('aria-disabled');

  _applyStateToDOM();
  _dispatchEvent(ABACUS_UNLOCKED_EVENT, {});
}

/**
 * setActiveRods()
 * ───────────────
 * Enable or disable specific rods (used by difficulty settings).
 *
 * @param {string[]} activeRodIds - Array of active rod IDs (e.g., ['tens', 'ones'])
 */
function setActiveRods(activeRodIds) {
  _activeRods = activeRodIds;
  ROD_DEFS.forEach((rodDef, rodIndex) => {
    const isActive = activeRodIds.includes(rodDef.id);
    const colEl = _rodEls[rodIndex]?.closest('.rod-column');
    if (colEl) {
      if (!isActive) {
        colEl.classList.add('rod-column--inactive');
        _setRodValue(rodIndex, 0); // Reset inactive rods to 0
      } else {
        colEl.classList.remove('rod-column--inactive');
      }
    }
  });
  _applyStateToDOM();
  _updateDisplayEl();
}

/* ══════════════════════════════════════════════════════════════
   SECTION 4 – DOM RENDERING
   ══════════════════════════════════════════════════════════════ */

/**
 * _initState()
 * ────────────
 * Initialise (or reset) the internal bead state to all-inactive.
 *
 * @private
 */
function _initState() {
  _rodState = ROD_DEFS.map(() =>
    Array(BEADS_PER_ROD).fill(false)
  );
}

/**
 * _renderDOM()
 * ────────────
 * Build the abacus bead DOM inside .abacus-rods.
 * Replaces whatever Phase-2 static HTML was in the rod containers.
 *
 * Structure per rod:
 *   .rod-column
 *     .rod-column__rail   (decorative)
 *     .rod-column__beads  (data-rod="0|1|2")
 *       button.bead  ×9   (data-rod data-bead)
 *     .rod-column__label
 *
 * @private
 */
function _renderDOM() {
  const rodsContainer = _containerEl.querySelector('.abacus-rods');
  if (!rodsContainer) {
    console.warn('[Abacus] .abacus-rods not found inside .abacus-frame.');
    return;
  }

  // Clear Phase-2 static content
  rodsContainer.innerHTML = '';
  _rodEls = [];

  ROD_DEFS.forEach((rodDef, rodIndex) => {
    // ── Rod column wrapper
    const colEl = document.createElement('div');
    colEl.className = 'rod-column';
    colEl.setAttribute('role', 'group');
    colEl.setAttribute('aria-label', `${rodDef.label} rod`);
    colEl.setAttribute('data-rod-id', rodDef.id);

    // ── Decorative rail
    const railEl = document.createElement('div');
    railEl.className = 'rod-column__rail';
    railEl.setAttribute('aria-hidden', 'true');
    colEl.appendChild(railEl);

    // ── Bead container
    const beadsEl = document.createElement('div');
    beadsEl.className = 'rod-column__beads';
    beadsEl.setAttribute('data-rod', String(rodIndex));
    beadsEl.id = `rod-${rodDef.id}`;

    // ── Beads: index 0 = top (inactive side), index 8 = bottom (active side)
    for (let beadIndex = 0; beadIndex < BEADS_PER_ROD; beadIndex++) {
      const beadEl = _createBeadEl(rodIndex, beadIndex, rodDef.colorClass);
      beadsEl.appendChild(beadEl);
    }

    colEl.appendChild(beadsEl);
    _rodEls.push(beadsEl);

    // ── Label
    const labelEl = document.createElement('span');
    labelEl.className = 'rod-column__label';
    labelEl.textContent = rodDef.label;
    labelEl.setAttribute('aria-hidden', 'true');
    colEl.appendChild(labelEl);

    rodsContainer.appendChild(colEl);
  });
}

/**
 * _createBeadEl()
 * ───────────────
 * Create a single bead button element.
 *
 * @private
 * @param {number} rodIndex  – 0|1|2
 * @param {number} beadIndex – 0 (top) … 8 (bottom)
 * @param {string} colorClass – CSS modifier class for bead colour
 * @returns {HTMLButtonElement}
 */
function _createBeadEl(rodIndex, beadIndex, colorClass) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `bead ${colorClass} ${CLASS_INACTIVE}`;

  // Data attributes for event delegation
  btn.setAttribute('data-rod',  String(rodIndex));
  btn.setAttribute('data-bead', String(beadIndex));

  // Accessibility
  btn.setAttribute('role',      'switch');
  btn.setAttribute('aria-checked', 'false');
  btn.setAttribute('tabindex',  '0');
  _updateBeadAriaLabel(btn, rodIndex, beadIndex, false);

  return btn;
}

/* ══════════════════════════════════════════════════════════════
   SECTION 5 – EVENT HANDLING
   ══════════════════════════════════════════════════════════════ */

/**
 * _attachEvents()
 * ───────────────
 * Attach all input events using delegation on _stageEl.
 * One listener catches every bead on the entire abacus.
 *
 * @private
 */
function _attachEvents() {
  if (!_stageEl) return;

  // Pointer events for unified mouse/touch click and drag
  _stageEl.addEventListener('pointerdown', _onPointerDown);
  
  // Attach move/up to window to handle drags that leave the stage
  window.addEventListener('pointermove',   _onPointerMove);
  window.addEventListener('pointerup',     _onPointerUp);
  window.addEventListener('pointercancel', _onPointerUp);

  // Keyboard navigation within the abacus stage
  _stageEl.addEventListener('keydown',    _onStageKeyDown);

  // Hover: subtle scale-up already handled by CSS :hover.
  // We just add a pointer cursor state indicator here.
  _stageEl.addEventListener('pointerenter', _onBeadPointerEnter, true);
  _stageEl.addEventListener('pointerleave', _onBeadPointerLeave, true);
}

/**
 * _onPointerDown()
 * ────────────────
 * Initiates a drag or single-click interaction.
 *
 * @private
 * @param {PointerEvent} e
 */
function _onPointerDown(e) {
  if (_locked) return;
  // Ignore right-clicks, etc. Primary button only.
  if (e.pointerType === 'mouse' && e.button !== 0) return;

  const beadEl = e.target.closest('[data-rod][data-bead]');
  if (!beadEl) return;

  _isDragging = true;
  _stageEl.setPointerCapture?.(e.pointerId);

  const rodIndex  = parseInt(beadEl.getAttribute('data-rod'),  10);
  const beadIndex = parseInt(beadEl.getAttribute('data-bead'), 10);
  
  // The state we are trying to achieve for this drag gesture
  const isCurrentlyActive = _rodState[rodIndex][beadIndex];
  _dragTargetState = !isCurrentlyActive;

  _onBeadActivate(beadEl, _dragTargetState);
}

/**
 * _onPointerMove()
 * ────────────────
 * Handles dragging across multiple beads.
 *
 * @private
 * @param {PointerEvent} e
 */
function _onPointerMove(e) {
  if (!_isDragging || _locked || _dragTargetState === null) return;

  let target = e.target;
  
  // touch pointers don't automatically update e.target during drag
  if (e.pointerType === 'touch') {
    target = document.elementFromPoint(e.clientX, e.clientY);
  }

  const beadEl = target?.closest?.('[data-rod][data-bead]');
  if (!beadEl) return;

  const rodIndex  = parseInt(beadEl.getAttribute('data-rod'),  10);
  const beadIndex = parseInt(beadEl.getAttribute('data-bead'), 10);
  
  if (isNaN(rodIndex) || isNaN(beadIndex)) return;

  // Don't do work if the bead is already in the target state
  if (_rodState[rodIndex][beadIndex] === _dragTargetState) return;

  _onBeadActivate(beadEl, _dragTargetState);
}

/**
 * _onPointerUp()
 * ──────────────
 * Ends a drag interaction.
 *
 * @private
 * @param {PointerEvent} e
 */
function _onPointerUp(e) {
  _isDragging = false;
  _dragTargetState = null;
  if (_stageEl && _stageEl.hasPointerCapture?.(e.pointerId)) {
    try { _stageEl.releasePointerCapture(e.pointerId); } catch (_) {}
  }
}

/**
 * _onStageKeyDown()
 * ─────────────────
 * Keyboard navigation within the abacus.
 *
 *   Enter / Space → toggle focused bead
 *   ArrowUp       → focus bead above (lower index = higher bead)
 *   ArrowDown     → focus bead below
 *   ArrowLeft     → move to rod on the left (lower rod index)
 *   ArrowRight    → move to rod on the right (higher rod index)
 *   Home          → jump to first (topmost) bead on current rod
 *   End           → jump to last (bottommost) bead on current rod
 *
 * @private
 * @param {KeyboardEvent} e
 */
function _onStageKeyDown(e) {
  const beadEl = e.target.closest('[data-rod][data-bead]');
  if (!beadEl) return;

  const rodIndex  = parseInt(beadEl.getAttribute('data-rod'),  10);
  const beadIndex = parseInt(beadEl.getAttribute('data-bead'), 10);

  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (!_locked) _onBeadActivate(beadEl);
      break;

    case 'ArrowUp': {
      e.preventDefault();
      // Move focus to bead above (lower index)
      const target = _getBeadEl(rodIndex, Math.max(0, beadIndex - 1));
      target?.focus();
      break;
    }

    case 'ArrowDown': {
      e.preventDefault();
      // Move focus to bead below (higher index)
      const target = _getBeadEl(rodIndex, Math.min(BEADS_PER_ROD - 1, beadIndex + 1));
      target?.focus();
      break;
    }

    case 'ArrowLeft': {
      e.preventDefault();
      // Move to same bead on the rod to the left
      const prevRod = Math.max(0, rodIndex - 1);
      _getBeadEl(prevRod, beadIndex)?.focus();
      break;
    }

    case 'ArrowRight': {
      e.preventDefault();
      // Move to same bead on the rod to the right
      const nextRod = Math.min(ROD_DEFS.length - 1, rodIndex + 1);
      _getBeadEl(nextRod, beadIndex)?.focus();
      break;
    }

    case 'Home': {
      e.preventDefault();
      _getBeadEl(rodIndex, 0)?.focus();
      break;
    }

    case 'End': {
      e.preventDefault();
      _getBeadEl(rodIndex, BEADS_PER_ROD - 1)?.focus();
      break;
    }

    default:
      break;
  }
}

/**
 * _onBeadPointerEnter() / _onBeadPointerLeave()
 * ────────────────────────────────────────────
 * Show/hide a visual hover indicator on bead elements.
 * CSS :hover already handles the scale — this just enforces
 * the 'pointer' cursor on disabled state too.
 *
 * @private
 */
function _onBeadPointerEnter(e) {
  const bead = e.target.closest('[data-bead]');
  if (bead && !_locked) bead.setAttribute('data-hover', '');
}

function _onBeadPointerLeave(e) {
  const bead = e.target.closest('[data-bead]');
  if (bead) bead.removeAttribute('data-hover');
}

/* ══════════════════════════════════════════════════════════════
   SECTION 6 – BEAD INTERACTION LOGIC
   ══════════════════════════════════════════════════════════════ */

/**
 * _onBeadActivate()
 * ─────────────────
 * Core bead toggle logic.
 *
 * Gravity model (mirrors a real abacus):
 * ───────────────────────────────────────
 * Beads are indexed 0 (top/inactive side) → 8 (bottom/counting beam).
 * Active beads "fall" to the bottom.
 *
 * Clicking bead at index N:
 *   • If target state is ACTIVE   → activate beads N..8 (this bead + all below it)
 *   • If target state is INACTIVE → deactivate beads 0..N (this bead + all above it)
 *
 * @private
 * @param {HTMLElement} beadEl
 * @param {boolean|null} forceState – Optional target state (true=active, false=inactive)
 */
function _onBeadActivate(beadEl, forceState = null) {
  const rodIndex  = parseInt(beadEl.getAttribute('data-rod'),  10);
  const beadIndex = parseInt(beadEl.getAttribute('data-bead'), 10);
  if (isNaN(rodIndex) || isNaN(beadIndex)) return;

  const isCurrentlyActive = _rodState[rodIndex][beadIndex];
  const targetState = forceState !== null ? forceState : !isCurrentlyActive;

  if (targetState === isCurrentlyActive) return;

  if (targetState) {
    // Activate this bead AND all beads below (gravity: they fall down)
    for (let i = beadIndex; i < BEADS_PER_ROD; i++) {
      _rodState[rodIndex][i] = true;
    }
  } else {
    // Deactivate this bead AND all beads above (they float back up)
    for (let i = 0; i <= beadIndex; i++) {
      _rodState[rodIndex][i] = false;
    }
  }

  _applyStateToDOM();
  _updateDisplayEl();
  _announceValue();
  _dispatchEvent(ABACUS_CHANGE_EVENT, {
    value:    getValue(),
    rodIndex,
    rodValue: getRodValue(rodIndex),
  });
}

/**
 * _setRodValue()
 * ──────────────
 * Set a rod's digit (0–9) in the internal state.
 * Active beads are at the BOTTOM (indices 8-downward).
 * If value = 3, beads at index 6, 7, 8 are active.
 *
 * @private
 * @param {number} rodIndex – 0|1|2
 * @param {number} value    – 0–9
 */
function _setRodValue(rodIndex, value) {
  const clamped = Math.max(0, Math.min(BEADS_PER_ROD, value));
  let stateChanged = false;
  // Bottom `clamped` beads are active, the rest are inactive
  for (let i = 0; i < BEADS_PER_ROD; i++) {
    // Bead at index i is active if it's in the bottom `clamped` positions
    // Bottom position = index 8, so active range = [9-clamped .. 8]
    const newState = i >= (BEADS_PER_ROD - clamped);
    if (_rodState[rodIndex][i] !== newState) {
      stateChanged = true;
      _rodState[rodIndex][i] = newState;
    }
  }

  if (stateChanged) {
    audioManager.play('click', { throttleMs: 50 });
  }
}

/* ══════════════════════════════════════════════════════════════
   SECTION 7 – DOM SYNC
   ══════════════════════════════════════════════════════════════ */

/**
 * _applyStateToDOM()
 * ──────────────────
 * Synchronise the internal _rodState to the actual bead DOM elements.
 * Updates CSS classes and ARIA attributes for every bead.
 *
 * Called after every state change (toggle, setValue, reset).
 *
 * @private
 */
function _applyStateToDOM() {
  ROD_DEFS.forEach((rodDef, rodIndex) => {
    const rodEl = _rodEls[rodIndex];
    if (!rodEl) return;

    const beadEls = rodEl.querySelectorAll('[data-bead]');

    beadEls.forEach(beadEl => {
      const beadIndex = parseInt(beadEl.getAttribute('data-bead'), 10);
      const active    = _rodState[rodIndex][beadIndex];

      // Toggle CSS classes
      beadEl.classList.toggle(CLASS_ACTIVE,   active);
      beadEl.classList.toggle(CLASS_INACTIVE, !active);

      // Disable if locked or rod is inactive
      const isRodActive = _activeRods.includes(rodDef.id);
      if (!isRodActive || _locked) {
        beadEl.setAttribute('disabled', '');
        beadEl.setAttribute('tabindex', '-1');
      } else {
        beadEl.removeAttribute('disabled');
        beadEl.setAttribute('tabindex', '0');
      }

      // Sync ARIA
      beadEl.setAttribute('aria-checked', active ? 'true' : 'false');
      _updateBeadAriaLabel(beadEl, rodIndex, beadIndex, active);
    });

    // Update rod group ARIA label
    const colEl   = rodEl.closest('.rod-column');
    const rodVal  = getRodValue(rodIndex);
    const isRodActive = _activeRods.includes(rodDef.id);
    
    if (colEl) {
      colEl.setAttribute(
        'aria-label',
        `${rodDef.label} rod – ${rodVal} active ${rodVal === 1 ? 'bead' : 'beads'}, value ${rodVal * rodDef.placeValue}`
      );
      colEl.classList.toggle('rod-column--disabled', !isRodActive);
    }
  });
}

/**
 * _updateDisplayEl()
 * ──────────────────
 * Update the #current-number element in the sidebar with the
 * latest value, and add a brief bounce animation.
 *
 * @private
 */
function _updateDisplayEl() {
  const displayEl = document.getElementById('current-number');
  if (!displayEl) return;

  const newValue = getValue();
  const oldValue = parseInt(displayEl.textContent, 10);

  if (oldValue !== newValue) {
    displayEl.textContent = String(newValue);

    // Trigger bounce animation by removing and re-adding class
    displayEl.classList.remove('changed');
    // requestAnimationFrame ensures class removal is painted first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        displayEl.classList.add('changed');
      });
    });
  }
}

/**
 * _updateBeadAriaLabel()
 * ──────────────────────
 * Set an accessible label describing the bead position and state.
 *
 * @private
 * @param {HTMLElement} beadEl
 * @param {number} rodIndex
 * @param {number} beadIndex
 * @param {boolean} active
 */
function _updateBeadAriaLabel(beadEl, rodIndex, beadIndex, active) {
  const rodLabel  = ROD_DEFS[rodIndex].label;
  const position  = beadIndex + 1;          // 1-based for users
  const stateWord = active ? 'active' : 'inactive';
  beadEl.setAttribute(
    'aria-label',
    `${rodLabel} bead ${position} – ${stateWord}`
  );
}

/* ══════════════════════════════════════════════════════════════
   SECTION 8 – ACCESSIBILITY HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * _announceValue()
 * ────────────────
 * Post the current abacus value to the ARIA live region (if present)
 * so screen readers announce the update.
 *
 * @private
 */
function _announceValue() {
  const announcer = document.getElementById('aria-announcer');
  if (!announcer) return;

  const val = getValue();
  announcer.textContent = '';
  requestAnimationFrame(() => {
    announcer.textContent = `Abacus shows ${val}`;
  });
}

/* ══════════════════════════════════════════════════════════════
   SECTION 9 – EVENT DISPATCHING
   ══════════════════════════════════════════════════════════════ */

/**
 * _dispatchEvent()
 * ────────────────
 * Dispatch a CustomEvent on _stageEl (bubbles to document).
 *
 * @private
 * @param {string} eventName
 * @param {Object} detail
 */
function _dispatchEvent(eventName, detail) {
  if (!_stageEl) return;
  const event = new CustomEvent(eventName, {
    bubbles:    true,
    cancelable: false,
    detail,
  });
  _stageEl.dispatchEvent(event);
}

/* ══════════════════════════════════════════════════════════════
   SECTION 10 – PRIVATE QUERY HELPERS
   ══════════════════════════════════════════════════════════════ */

/**
 * _getBeadEl()
 * ────────────
 * Look up a specific bead DOM element by rod + bead index.
 *
 * @private
 * @param {number} rodIndex
 * @param {number} beadIndex
 * @returns {HTMLElement|null}
 */
function _getBeadEl(rodIndex, beadIndex) {
  const rodEl = _rodEls[rodIndex];
  if (!rodEl) return null;
  return rodEl.querySelector(`[data-bead="${beadIndex}"]`);
}

/**
 * _getAllBeadEls()
 * ───────────────
 * Return all bead button elements across all rods.
 *
 * @private
 * @returns {HTMLElement[]}
 */
function _getAllBeadEls() {
  return _rodEls.flatMap(rodEl =>
    rodEl ? Array.from(rodEl.querySelectorAll('[data-bead]')) : []
  );
}

/* ── Public Exports ──────────────────────────────────────────── */
export {
  initAbacus,
  getValue,
  getRodValue,
  setValue,
  reset,
  lock,
  unlock,
  setActiveRods,
  ABACUS_CHANGE_EVENT,
  ABACUS_RESET_EVENT,
  ABACUS_LOCKED_EVENT,
  ABACUS_UNLOCKED_EVENT,
  MAX_VALUE,
  ROD_DEFS,
};

